const Message = require('../models/Message');

const messageHandler = (socket, io) => {
  // Send message
  socket.on('message:send', async (data) => {
    try {
      const { recipientId, content, senderId } = data;

      const message = await Message.create({
        sender: senderId,
        recipient: recipientId,
        content,
      });

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'name profilePicture')
        .populate('recipient', 'name profilePicture');

      // Emit to recipient
      io.to(recipientId).emit('message:new', populatedMessage);

      // Confirm to sender
      socket.emit('message:sent', populatedMessage);
    } catch (error) {
      socket.emit('message:error', { error: error.message });
    }
  });

  // Mark as read
  socket.on('message:read', async (messageId) => {
    try {
      const message = await Message.findById(messageId);
      if (message) {
        message.isRead = true;
        message.readAt = Date.now();
        await message.save();

        // Notify sender
        io.to(message.sender.toString()).emit('message:read', {
          messageId: message._id,
          readAt: message.readAt,
        });
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  });
};

module.exports = messageHandler;
