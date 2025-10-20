const Session = require('../models/Session');
const Exchange = require('../models/Exchange');
const { sendSessionReminderEmail } = require('../utils/emailService');
const { isSlotAvailable } = require('../utils/availability');

/**
 * @desc    Create session
 * @route   POST /api/sessions
 * @access  Private
 */
const createSession = async (req, res) => {
  try {
    const {
      exchangeId,
      teacherId,
      learnerId,
      skill,
      scheduledDate,
      duration,
      type,
      location,
      agenda,
    } = req.body;

    // Verify exchange exists and user is part of it
    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    if (
      exchange.requester.toString() !== req.user._id.toString() &&
      exchange.recipient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Conflict detection: prevent double-booking and ensure teacher availability
    const startDate = new Date(scheduledDate);

    // Check teacher availability
    const teacherAvailable = await isSlotAvailable(teacherId, startDate, duration || 60);
    if (!teacherAvailable) {
      return res.status(400).json({ message: 'Selected time is not available for the teacher' });
    }

    // Check learner double booking
    const learnerConflicts = await Session.findOne({
      status: 'scheduled',
      learner: learnerId,
      $expr: {
        $and: [
          { $lt: ['$scheduledDate', new Date(startDate.getTime() + (duration || 60) * 60000)] },
          { $gt: [{ $add: ['$scheduledDate', { $multiply: ['$duration', 60000] }] }, startDate] },
        ],
      },
    });
    if (learnerConflicts) {
      return res.status(400).json({ message: 'Selected time conflicts with learner\'s schedule' });
    }

    const session = await Session.create({
      exchange: exchangeId,
      teacher: teacherId,
      learner: learnerId,
      skill,
      scheduledDate,
      duration,
      type,
      location,
      agenda,
    });

    // Update exchange progress
    exchange.progress.totalSessions += 1;
    await exchange.save();

    const populatedSession = await Session.findById(session._id)
      .populate('teacher', 'name email profilePicture')
      .populate('learner', 'name email profilePicture')
      .populate('exchange');

    res.status(201).json(populatedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user's sessions
 * @route   GET /api/sessions
 * @access  Private
 */
const getSessions = async (req, res) => {
  try {
    const { status, upcoming, page = 1, limit = 20 } = req.query;

    let query = {
      $or: [{ teacher: req.user._id }, { learner: req.user._id }],
    };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
    }

    const sessions = await Session.find(query)
      .populate('teacher', 'name email profilePicture')
      .populate('learner', 'name email profilePicture')
      .populate('exchange')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ scheduledDate: 1 });

    const count = await Session.countDocuments(query);

    res.json({
      sessions,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single session
 * @route   GET /api/sessions/:id
 * @access  Private
 */
const getSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('teacher', 'name email profilePicture')
      .populate('learner', 'name email profilePicture')
      .populate('exchange');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check authorization
    if (
      session.teacher._id.toString() !== req.user._id.toString() &&
      session.learner._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update session
 * @route   PUT /api/sessions/:id
 * @access  Private
 */
const updateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check authorization
    if (
      session.teacher.toString() !== req.user._id.toString() &&
      session.learner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update allowed fields
    const allowedUpdates = ['scheduledDate', 'duration', 'type', 'location', 'agenda', 'status'];
    let willCheckConflicts = false;
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === 'scheduledDate' || field === 'duration') willCheckConflicts = true;
        session[field] = req.body[field];
      }
    });

    // If time changed, ensure availability and no conflicts
    if (willCheckConflicts) {
      const startDate = new Date(session.scheduledDate);
      const dur = session.duration || 60;

      const teacherAvailable = await isSlotAvailable(session.teacher, startDate, dur);
      if (!teacherAvailable) {
        return res.status(400).json({ message: 'Selected time is not available for the teacher' });
      }

      // Learner conflicts
      const learnerConflict = await Session.findOne({
        _id: { $ne: session._id },
        status: 'scheduled',
        learner: session.learner,
        $expr: {
          $and: [
            { $lt: ['$scheduledDate', new Date(startDate.getTime() + dur * 60000)] },
            { $gt: [{ $add: ['$scheduledDate', { $multiply: ['$duration', 60000] }] }, startDate] },
          ],
        },
      });
      if (learnerConflict) {
        return res.status(400).json({ message: 'Selected time conflicts with learner\'s schedule' });
      }
    }

    await session.save();

    const updatedSession = await Session.findById(session._id)
      .populate('teacher', 'name email profilePicture')
      .populate('learner', 'name email profilePicture')
      .populate('exchange');

    res.json(updatedSession);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Complete session with feedback
 * @route   PUT /api/sessions/:id/complete
 * @access  Private
 */
const completeSession = async (req, res) => {
  try {
    const { notes, rating, comment } = req.body;

    const session = await Session.findById(req.params.id).populate('exchange');

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check authorization
    if (
      session.teacher.toString() !== req.user._id.toString() &&
      session.learner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.status = 'completed';

    // Add notes and feedback based on role
    if (session.teacher.toString() === req.user._id.toString()) {
      session.notes.teacher = notes;
      session.feedback.teacher = { rating, comment };
    } else {
      session.notes.learner = notes;
      session.feedback.learner = { rating, comment };
    }

    await session.save();

    // Update exchange progress
    const exchange = await Exchange.findById(session.exchange._id);
    exchange.progress.completedSessions += 1;
    await exchange.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Cancel session
 * @route   PUT /api/sessions/:id/cancel
 * @access  Private
 */
const cancelSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check authorization
    if (
      session.teacher.toString() !== req.user._id.toString() &&
      session.learner.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    session.status = 'cancelled';
    await session.save();

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Send session reminders (cron job)
 * @route   POST /api/sessions/reminders
 * @access  Private (Admin/System)
 */
const sendReminders = async (req, res) => {
  try {
    // Find sessions scheduled in the configured reminder window that haven't been reminded
    const reminderHours = parseInt(process.env.SESSION_REMINDER_HOURS || '24', 10);
    const windowEnd = new Date(Date.now() + reminderHours * 60 * 60 * 1000);
    const now = new Date();

    const sessions = await Session.find({
      scheduledDate: { $gte: now, $lte: windowEnd },
      status: 'scheduled',
      'reminder.sent': false,
    })
      .populate('teacher', 'name email')
      .populate('learner', 'name email');

    let sentCount = 0;

    for (const session of sessions) {
      try {
        await sendSessionReminderEmail(session.teacher, session);
        await sendSessionReminderEmail(session.learner, session);

        session.reminder.sent = true;
        session.reminder.sentAt = Date.now();
        await session.save();

        sentCount++;
      } catch (error) {
        console.error(`Failed to send reminder for session ${session._id}:`, error);
      }
    }

    res.json({ message: `Sent ${sentCount} reminders` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSession,
  updateSession,
  completeSession,
  cancelSession,
  sendReminders,
};
