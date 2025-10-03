const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: '🏆',
    },
    category: {
      type: String,
      enum: ['teaching', 'learning', 'social', 'milestone', 'special'],
      default: 'milestone',
    },
    criteria: {
      type: {
        type: String,
        enum: ['sessions_completed', 'exchanges_completed', 'rating_received', 'skills_taught', 'skills_learned', 'days_active'],
      },
      value: Number,
    },
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
    points: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Achievement', achievementSchema);
