import dotenv from 'dotenv';
dotenv.config();

import { Server } from 'socket.io';
import http from 'http';
import jwt from 'jsonwebtoken';

import { ACCESS_TOKEN_SECRET_KEY, FRONTEND_URL, PORT } from './utils/env-variables';
import app from './app';

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

  socket.on('sendMessage', async ({ receiverId, content }) => {
    console.log('message received', content);
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receiveMessage', {
        senderId: userId,
        content,
        createdAt: new Date()
      });
    } else {
      // Save to DB if user is offline (to be implemented)
      // await saveOfflineMessage(userId, receiverId, content);
    }
  });

  // Group Chat event handler
  socket.on('sendGroupMessage', async ({ groupId, content }) => {
    io.to(groupId).emit('receiveGroupMessage', {
      senderId: userId,
      groupId,
      content,
      createdAt: new Date()
    });
  });

  // Typing indicators
  // User starts typing
  socket.on('userTyping', ({ chatId, userId }) => {
    socket.to(chatId).emit('userTyping', { userId });
  });

  // User stops typing
  socket.on('userStoppedTyping', ({ chatId, userId }) => {
    socket.to(chatId).emit('userStoppedTyping', { userId });
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
