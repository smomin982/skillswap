const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Store connected users
  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User joins
    socket.on('user:join', (userId) => {
      connectedUsers.set(userId, socket.id);
      socket.userId = userId;
      
      // Broadcast online status
      io.emit('user:online', userId);
      console.log(`User ${userId} connected`);
    });

    // Typing indicators
    socket.on('typing:start', (data) => {
      const recipientSocketId = connectedUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing:start', {
          senderId: data.senderId,
          conversationId: data.conversationId,
        });
      }
    });

    socket.on('typing:stop', (data) => {
      const recipientSocketId = connectedUsers.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('typing:stop', {
          senderId: data.senderId,
          conversationId: data.conversationId,
        });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        io.emit('user:offline', socket.userId);
        console.log(`User ${socket.userId} disconnected`);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };
