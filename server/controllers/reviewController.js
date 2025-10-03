const Review = require('../models/Review');
const User = require('../models/User');
const Exchange = require('../models/Exchange');

/**
 * @desc    Create review
 * @route   POST /api/reviews
 * @access  Private
 */
const createReview = async (req, res) => {
  try {
    const {
      revieweeId,
      exchangeId,
      rating,
      skillTaught,
      categories,
      comment,
      isPublic,
    } = req.body;

    // Verify exchange exists and is completed
    const exchange = await Exchange.findById(exchangeId);
    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    if (exchange.status !== 'completed') {
      return res
        .status(400)
        .json({ message: 'Can only review completed exchanges' });
    }

    // Verify user was part of the exchange
    if (
      exchange.requester.toString() !== req.user._id.toString() &&
      exchange.recipient.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      reviewer: req.user._id,
      reviewee: revieweeId,
      exchange: exchangeId,
    });

    if (existingReview) {
      return res.status(400).json({ message: 'Review already exists' });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewee: revieweeId,
      exchange: exchangeId,
      rating,
      skillTaught,
      categories,
      comment,
      isPublic,
    });

    // Update user's average rating
    await updateUserRating(revieweeId);

    const populatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name profilePicture')
      .populate('reviewee', 'name profilePicture')
      .populate('exchange');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get reviews for a user
 * @route   GET /api/reviews/user/:userId
 * @access  Public
 */
const getUserReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({
      reviewee: req.params.userId,
      isPublic: true,
    })
      .populate('reviewer', 'name profilePicture')
      .populate('reviewee', 'name profilePicture')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Review.countDocuments({
      reviewee: req.params.userId,
      isPublic: true,
    });

    // Calculate rating breakdown
    const ratingStats = await Review.aggregate([
      {
        $match: {
          reviewee: req.params.userId,
          isPublic: true,
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
      ratingStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single review
 * @route   GET /api/reviews/:id
 * @access  Public
 */
const getReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('reviewer', 'name profilePicture')
      .populate('reviewee', 'name profilePicture')
      .populate('exchange');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update review
 * @route   PUT /api/reviews/:id
 * @access  Private
 */
const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only reviewer can update
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { rating, categories, comment, isPublic } = req.body;

    if (rating) review.rating = rating;
    if (categories) review.categories = categories;
    if (comment !== undefined) review.comment = comment;
    if (isPublic !== undefined) review.isPublic = isPublic;

    await review.save();

    // Update user's average rating
    await updateUserRating(review.reviewee);

    const updatedReview = await Review.findById(review._id)
      .populate('reviewer', 'name profilePicture')
      .populate('reviewee', 'name profilePicture');

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete review
 * @route   DELETE /api/reviews/:id
 * @access  Private
 */
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only reviewer can delete
    if (review.reviewer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const revieweeId = review.reviewee;
    await review.deleteOne();

    // Update user's average rating
    await updateUserRating(revieweeId);

    res.json({ message: 'Review deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update user's average rating
const updateUserRating = async (userId) => {
  const stats = await Review.aggregate([
    {
      $match: { reviewee: userId },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(userId, {
      'rating.average': Math.round(stats[0].averageRating * 10) / 10,
      'rating.count': stats[0].count,
    });
  } else {
    await User.findByIdAndUpdate(userId, {
      'rating.average': 0,
      'rating.count': 0,
    });
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getReview,
  updateReview,
  deleteReview,
};
