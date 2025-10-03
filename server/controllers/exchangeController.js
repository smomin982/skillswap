const Exchange = require('../models/Exchange');
const User = require('../models/User');
const { sendExchangeRequestEmail } = require('../utils/emailService');

/**
 * @desc    Create exchange request
 * @route   POST /api/exchanges
 * @access  Private
 */
const createExchange = async (req, res) => {
  try {
    const {
      recipientId,
      requesterSkill,
      recipientSkill,
      duration,
      frequency,
      preferredMeetingType,
      notes,
      goals,
    } = req.body;

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check for existing active exchange
    const existingExchange = await Exchange.findOne({
      $or: [
        { requester: req.user._id, recipient: recipientId },
        { requester: recipientId, recipient: req.user._id },
      ],
      status: { $in: ['pending', 'accepted', 'active'] },
    });

    if (existingExchange) {
      return res.status(400).json({
        message: 'An active exchange already exists with this user',
      });
    }

    const exchange = await Exchange.create({
      requester: req.user._id,
      recipient: recipientId,
      requesterSkill,
      recipientSkill,
      duration,
      frequency,
      preferredMeetingType,
      notes,
      goals,
    });

    const populatedExchange = await Exchange.findById(exchange._id)
      .populate('requester', 'name email profilePicture')
      .populate('recipient', 'name email profilePicture');

    // Send email notification
    try {
      await sendExchangeRequestEmail(recipient, req.user, populatedExchange);
    } catch (emailError) {
      console.error('Exchange request email failed:', emailError);
    }

    res.status(201).json(populatedExchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get user's exchanges
 * @route   GET /api/exchanges
 * @access  Private
 */
const getExchanges = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {
      $or: [{ requester: req.user._id }, { recipient: req.user._id }],
    };

    if (status) {
      query.status = status;
    }

    const exchanges = await Exchange.find(query)
      .populate('requester', 'name email profilePicture rating')
      .populate('recipient', 'name email profilePicture rating')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Exchange.countDocuments(query);

    res.json({
      exchanges,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single exchange
 * @route   GET /api/exchanges/:id
 * @access  Private
 */
const getExchange = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id)
      .populate('requester', 'name email profilePicture rating')
      .populate('recipient', 'name email profilePicture rating');

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Check if user is part of the exchange
    if (
      exchange.requester._id.toString() !== req.user._id.toString() &&
      exchange.recipient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update exchange status
 * @route   PUT /api/exchanges/:id/status
 * @access  Private
 */
const updateExchangeStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Only recipient can accept/reject
    if (
      (status === 'accepted' || status === 'rejected') &&
      exchange.recipient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Both can cancel
    if (
      status === 'cancelled' &&
      exchange.requester.toString() !== req.user._id.toString() &&
      exchange.recipient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    exchange.status = status;

    if (status === 'accepted') {
      exchange.status = 'active';
      exchange.startDate = Date.now();
      exchange.endDate = new Date(
        Date.now() + exchange.duration * 7 * 24 * 60 * 60 * 1000
      );
    }

    await exchange.save();

    const updatedExchange = await Exchange.findById(exchange._id)
      .populate('requester', 'name email profilePicture')
      .populate('recipient', 'name email profilePicture');

    res.json(updatedExchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Complete exchange
 * @route   PUT /api/exchanges/:id/complete
 * @access  Private
 */
const completeExchange = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Check authorization
    if (
      exchange.requester.toString() !== req.user._id.toString() &&
      exchange.recipient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    exchange.status = 'completed';
    await exchange.save();

    res.json(exchange);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete exchange
 * @route   DELETE /api/exchanges/:id
 * @access  Private
 */
const deleteExchange = async (req, res) => {
  try {
    const exchange = await Exchange.findById(req.params.id);

    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    // Only requester can delete pending requests
    if (
      exchange.status === 'pending' &&
      exchange.requester.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await exchange.deleteOne();

    res.json({ message: 'Exchange deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExchange,
  getExchanges,
  getExchange,
  updateExchangeStatus,
  completeExchange,
  deleteExchange,
};
