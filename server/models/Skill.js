const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a skill name'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: [
        'programming',
        'design',
        'languages',
        'music',
        'arts',
        'sports',
        'cooking',
        'business',
        'marketing',
        'photography',
        'writing',
        'other',
      ],
    },
    description: {
      type: String,
      maxlength: 500,
    },
    usersOffering: {
      type: Number,
      default: 0,
    },
    usersLearning: {
      type: Number,
      default: 0,
    },
    popularity: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
skillSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Skill', skillSchema);
