const mongoose = require('mongoose');

const IntervalSchema = new mongoose.Schema(
  {
    start: { type: String, required: true }, // HH:mm
    end: { type: String, required: true },   // HH:mm
  },
  { _id: false }
);

const RuleSchema = new mongoose.Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true }, // 0=Sun ... 6=Sat
    intervals: { type: [IntervalSchema], default: [] },
  },
  { _id: false }
);

const ExceptionSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // YYYY-MM-DD in user's timezone
    type: { type: String, enum: ['available', 'unavailable'], default: 'unavailable' },
    intervals: { type: [IntervalSchema], default: [] },
    reason: { type: String },
  },
  { _id: false }
);

const userAvailabilitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    timezone: { type: String, default: 'UTC' },
    rules: { type: [RuleSchema], default: [] },
    exceptions: { type: [ExceptionSchema], default: [] },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserAvailability', userAvailabilitySchema);
