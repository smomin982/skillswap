const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    exchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exchange',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    attachments: [
      {
        url: String,
        type: String, // 'image', 'file', 'link'
        name: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for conversation ID (sorted user IDs)
messageSchema.virtual('conversationId').get(function () {
  const ids = [this.sender.toString(), this.recipient.toString()].sort();
  return ids.join('-');
});

module.exports = mongoose.model('Message', messageSchema);
