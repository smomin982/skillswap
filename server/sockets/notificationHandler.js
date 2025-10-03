const notificationHandler = (socket, io) => {
  // Send notification
  socket.on('notification:send', (data) => {
    const { recipientId, notification } = data;
    io.to(recipientId).emit('notification:new', notification);
  });

  // Mark notification as read
  socket.on('notification:read', (notificationId) => {
    // In a real app, you would update the database here
    socket.emit('notification:read:success', { notificationId });
  });
};

module.exports = notificationHandler;
