const UserAvailability = require('../models/UserAvailability');
const { computeBookableSlots } = require('../utils/availability');

/**
 * @desc Get current user's availability
 * @route GET /api/availability/me
 * @access Private
 */
const getMyAvailability = async (req, res) => {
  try {
    let av = await UserAvailability.findOne({ user: req.user._id });
    if (!av) {
      // Return a default structure
      av = {
        user: req.user._id,
        timezone: req.user.timezone || 'UTC',
        rules: [],
        exceptions: [],
      };
    }
    res.json(av);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Upsert current user's availability
 * @route PUT /api/availability
 * @access Private
 */
const upsertMyAvailability = async (req, res) => {
  try {
    const { timezone, rules, exceptions } = req.body;

    const update = {
      timezone: timezone || req.user.timezone || 'UTC',
      rules: Array.isArray(rules) ? rules : [],
      exceptions: Array.isArray(exceptions) ? exceptions : [],
      updatedBy: req.user._id,
    };

    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    const av = await UserAvailability.findOneAndUpdate(
      { user: req.user._id },
      { $set: update, $setOnInsert: { user: req.user._id } },
      options
    );

    res.json(av);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Get bookable slots for a user
 * @route GET /api/availability/:userId/slots?start=ISO&end=ISO&duration=60&step=30
 * @access Private
 */
const getUserSlots = async (req, res) => {
  try {
    const { userId } = req.params;
    const { start, end, duration, step } = req.query;

    if (!start || !end || !duration) {
      return res.status(400).json({ message: 'start, end and duration are required' });
    }

    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMin = parseInt(duration, 10);
    const stepMin = step ? parseInt(step, 10) : undefined;

    if (isNaN(durationMin) || durationMin <= 0) {
      return res.status(400).json({ message: 'Invalid duration' });
    }

    if (!(startDate instanceof Date) || isNaN(startDate)) {
      return res.status(400).json({ message: 'Invalid start date' });
    }
    if (!(endDate instanceof Date) || isNaN(endDate) || endDate <= startDate) {
      return res.status(400).json({ message: 'Invalid end date' });
    }

    const slots = await computeBookableSlots(userId, startDate, endDate, durationMin, stepMin);

    res.json(
      slots.map((s) => ({ start: s.start.toISOString(), end: s.end.toISOString() }))
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMyAvailability,
  upsertMyAvailability,
  getUserSlots,
};
