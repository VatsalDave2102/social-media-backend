import dotenv from 'dotenv';
dotenv.config();

import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';

import { ACCESS_TOKEN_SECRET_KEY, FRONTEND_URL, PORT } from './utils/env-variables';
import app from './app';
import prisma from './config/db';

const port = PORT || 3000;

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));

  jwt.verify(token as string, ACCESS_TOKEN_SECRET_KEY!, (err, user) => {
    if (err) return next(new Error('Authentication error'));
    socket.data.user = user;
    next();
  });
});

const onlineUsers = new Map<string, string>();

io.on('connection', (socket) => {
  const userId = socket.data.user.id;
  onlineUsers.set(userId, socket.id);

  socket.broadcast.emit('userOnline', { userId });

  const joinChatRoom = (chatId: string) => {
    socket.join(chatId);
  };

  socket.on('joinChat', ({ chatId }) => {
    joinChatRoom(chatId);
  });

  socket.on('sendMessage', async ({ chatId, senderId, content, vanishMode }) => {
    if (!vanishMode) {
      if (chatId) {
        // Create a new message
        const newMessage = await prisma.$transaction(async (prisma) => {
          const message = await prisma.message.create({
            data: {
              content,
              senderId: senderId,
              oneOnOneChatId: chatId
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  profilePicture: true
                }
              }
            }
          });

          if (chatId) {
            await prisma.oneOnOneChat.update({
              where: { id: chatId },
              data: { lastMessageAt: message.createdAt }
            });
          }

          return message;
        });
        io.to(chatId).emit(`chat:${chatId}:messages`, newMessage);
        io.emit('chatlist:newMessage', { chatId, message: newMessage });
      }
    } else if (vanishMode) {
      if (senderId) {
        const sender = await prisma.user.findUnique({
          where: { id: senderId }
        });

        function generateObjectId() {
          return [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
        }

        if (sender) {
          const newMessage = {
            id: generateObjectId(),
            content,
            senderId,
            oneOnOneChatId: chatId,
            isDeleted: false,
            createdAt: new Date(),
            sender: {
              id: senderId,
              name: sender.name,
              profilePicture: sender.profilePicture
            }
          };
          io.to(chatId).emit(`vanishmessages:add`, { chatId, message: newMessage });
          io.emit('chatlist:newMessage', { chatId, message: newMessage });
        }
      }
    }
  });

  socket.on('deleteMessage', async ({ chatId, messageId, senderId }) => {
    const deletedMessage = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (deletedMessage) {
      const deletedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          content: '',
          isDeleted: true
        }
      });
      io.to(chatId).emit(`chat:${chatId}:messages:update`, deletedMessage);
      return;
    }

    if (senderId) {
      const sender = await prisma.user.findUnique({
        where: { id: senderId }
      });

      if (sender) {
        const deletedMessage = {
          id: messageId,
          content: '',
          senderId,
          oneOnOneChatId: chatId,
          isDeleted: true,
          createdAt: new Date(),
          sender: {
            id: senderId,
            name: sender.name,
            profilePicture: sender.profilePicture
          }
        };
        io.to(chatId).emit('vanishmessages:update', { chatId, message: deletedMessage });
      }
    }
  });

  // Group Chat event handler
  socket.on('sendGroupMessage', async ({ chatId, senderId, content }) => {
    const newMessage = await prisma.$transaction(async (prisma) => {
      const message = await prisma.message.create({
        data: {
          content,
          senderId: senderId,
          groupChatId: chatId
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
              isDeleted: true
            }
          }
        }
      });

      if (chatId) {
        await prisma.groupChat.update({
          where: { id: chatId },
          data: { lastMessageAt: message.createdAt }
        });
      }

      return message;
    });
    io.to(chatId).emit(`chat:${chatId}:messages`, newMessage);
    io.emit('chatlist:newMessage', { chatId, message: newMessage });
  });

  socket.on('deleteGroupMessage', async ({ chatId, messageId }) => {
    const deletedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: '',
        isDeleted: true
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
            isDeleted: true
          }
        }
      }
    });
    io.to(chatId).emit(`chat:${chatId}:messages:update`, deletedMessage);
  });

  socket.on('updateChatSettings', ({ chatId, chatType }) => {
    console.log('chat update', chatId, chatType);
    io.to(chatId).emit(`chat:${chatId}:settings:update`, chatType);
    if (chatType === 'group') {
      io.to(chatId).emit(`chatlist:update`);
    }
  });

  // Typing indicators
  // User starts typing
  socket.on('userTyping', ({ chatId, name }) => {
    // io.to(chatId).emit('userTyping', { name });
    socket.broadcast.to(chatId).emit('userTyping', { chatId, name });
  });

  // User stops typing
  socket.on('userStoppedTyping', ({ chatId, name }) => {
    // io.to(chatId).emit('userStoppedTyping', { name });
    socket.broadcast.to(chatId).emit('userStoppedTyping', { chatId, name });
  });

  // Online status updates
  socket.on('getOnlineStatus', () => {
    const onlineStatus = Array.from(onlineUsers.keys());
    socket.emit('onlineStatus', onlineStatus);
  });

  //send friend request
  socket.on('sendFriendRequest', ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('updateFriendRequestStatus', { senderId, receiverId });
      io.to(receiverSocketId).emit('updateFriendRequestList', { receiverId });
    }
  });

  //send friend request
  socket.on('acceptFriendRequest', ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('updateFriendRequestStatus', { senderId, receiverId });
      io.to(receiverSocketId).emit('updateFriendList', { senderId, receiverId });
    }
  });

  //remove Friend Request
  socket.on('removeFriend', ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('updateFriendList', { senderId, receiverId });
      io.to(receiverSocketId).emit('updateFriendRequestStatus', { senderId, receiverId });
    }
  });

  //cancel Friend Request
  socket.on('cancelFriendRequest', ({ senderId, receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('updateFriendRequestStatus', { senderId, receiverId });
      io.to(receiverSocketId).emit('updateFriendRequestList', { receiverId });
    }
  });

  //remove Friend Request
  socket.on('rejectFriendRequest', ({ receiverId, senderId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('updateFriendRequestStatus', { senderId, receiverId });
    }
  });

  //createGroupChat
  socket.on('createGroupChat', ({ members }) => {
    members.forEach((memberId: string) => {
      const memberSocketId = onlineUsers.get(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit('chatlist:update');
      }
    });
  });

  //addGroupMembers
  socket.on('addGroupMembers', ({ members }) => {
    members.forEach((memberId: string) => {
      const memberSocketId = onlineUsers.get(memberId);
      if (memberSocketId) {
        io.to(memberSocketId).emit('chatlist:update');
      }
    });
  });

  //removeGroupMembers
  socket.on('removeGroupMember', ({ memberId }) => {
    console.log(memberId);
    const memberSocketId = onlineUsers.get(memberId);
    if (memberSocketId) {
      io.to(memberSocketId).emit('chatlist:update');
    }
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId);
    socket.broadcast.emit('userOffline', { userId });
  });

  socket.on('error', (err) => {
    console.error('Socket encountered error:', err);
    socket.disconnect();
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}...`);
});
