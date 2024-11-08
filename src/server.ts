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
  console.log('user online', userId);

  socket.broadcast.emit('userOnline', { userId });

  const joinChatRoom = (chatId: string) => {
    socket.join(chatId);
    console.log(`User ${userId} joined chat room ${chatId}`);
  };

  socket.on('joinChat', ({ chatId }) => {
    joinChatRoom(chatId);
  });

  socket.on('sendMessage', async ({ chatId, senderId, content }) => {
    console.log('message received', content, senderId, chatId);

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
    }
  });

  // Group Chat event handler
  socket.on('sendGroupMessage', async ({ chatId, content }) => {
    const newMessage = await prisma.$transaction(async (prisma) => {
      const message = await prisma.message.create({
        data: {
          content,
          senderId: userId,
          groupChatId: chatId
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
        await prisma.groupChat.update({
          where: { id: chatId },
          data: { lastMessageAt: message.createdAt }
        });
      }

      return message;
    });
    io.to(chatId).emit(`chat:${chatId}:messages`, newMessage);
  });

  // Typing indicators
  // User starts typing
  socket.on('userTyping', ({ chatId, name }) => {
    console.log('user is typing', chatId, name);
    io.to(chatId).emit('userTyping', { name });
    // socket.broadcast.to(chatId).emit('userTyping', { name });
  });

  // User stops typing
  socket.on('userStoppedTyping', ({ chatId, userId }) => {
    io.to(chatId).emit('userStoppedTyping', { userId });
  });

  // Online status updates
  socket.on('getOnlineStatus', () => {
    const onlineStatus = Array.from(onlineUsers.keys());
    socket.emit('onlineStatus', onlineStatus);
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
