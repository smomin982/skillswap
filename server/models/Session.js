const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    exchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exchange',
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: String,
      required: true,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    type: {
      type: String,
      enum: ['virtual', 'in-person'],
      default: 'virtual',
    },
    location: {
      type: String, // URL for virtual, address for in-person
    },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'scheduled',
    },
    agenda: {
      type: String,
      maxlength: 500,
    },
    notes: {
      teacher: String,
      learner: String,
    },
    feedback: {
      teacher: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
      },
      learner: {
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        comment: String,
      },
    },
    reminder: {
      sent: {
        type: Boolean,
        default: false,
      },
      sentAt: Date,
    },
    video: {
      recordings: [{ type: String }],
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
sessionSchema.index({ exchange: 1 });
sessionSchema.index({ teacher: 1, learner: 1 });
sessionSchema.index({ scheduledDate: 1 });
sessionSchema.index({ status: 1 });

module.exports = mongoose.model('Session', sessionSchema);
