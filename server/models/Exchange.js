const mongoose = require('mongoose');

const exchangeSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    requesterSkill: {
      name: {
        type: String,
        required: true,
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      },
    },
    recipientSkill: {
      name: {
        type: String,
        required: true,
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      },
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    duration: {
      type: Number, // in weeks
      default: 4,
    },
    frequency: {
      type: String,
      enum: ['once', 'weekly', 'bi-weekly', 'monthly'],
      default: 'weekly',
    },
    preferredMeetingType: {
      type: String,
      enum: ['virtual', 'in-person', 'both'],
      default: 'virtual',
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    goals: {
      requester: [String],
      recipient: [String],
    },
    progress: {
      completedSessions: {
        type: Number,
        default: 0,
      },
      totalSessions: {
        type: Number,
        default: 0,
      },
    },
    startDate: Date,
    endDate: Date,
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
exchangeSchema.index({ requester: 1, recipient: 1 });
exchangeSchema.index({ status: 1 });

module.exports = mongoose.model('Exchange', exchangeSchema);
