const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    exchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exchange',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating'],
      min: 1,
      max: 5,
    },
    skillTaught: {
      type: String,
      required: true,
    },
    categories: {
      communication: {
        type: Number,
        min: 1,
        max: 5,
      },
      knowledge: {
        type: Number,
        min: 1,
        max: 5,
      },
      patience: {
        type: Number,
        min: 1,
        max: 5,
      },
      reliability: {
        type: Number,
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: String,
      maxlength: 500,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews
reviewSchema.index({ reviewer: 1, reviewee: 1, exchange: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
