const User = require('../models/User');
const { findMatches } = require('../utils/matchingAlgorithm');

/**
 * @desc    Get user profile
 * @route   GET /api/users/:id
 * @access  Public
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.location = req.body.location || user.location;
    user.timezone = req.body.timezone || user.timezone;
    user.availability = req.body.availability || user.availability;

    if (req.file) {
      user.profilePicture = req.file.path;
    }

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Add skill to user
 * @route   POST /api/users/skills
 * @access  Private
 */
const addSkill = async (req, res) => {
  try {
    const { type, name, level, description } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const skill = { name, level, description };

    if (type === 'offered') {
      user.skillsOffered.push(skill);
    } else if (type === 'desired') {
      user.skillsDesired.push(skill);
    } else {
      return res.status(400).json({ message: 'Invalid skill type' });
    }

    await user.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Remove skill from user
 * @route   DELETE /api/users/skills/:type/:skillId
 * @access  Private
 */
const removeSkill = async (req, res) => {
  try {
    const { type, skillId } = req.params;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (type === 'offered') {
      user.skillsOffered = user.skillsOffered.filter(
        (skill) => skill._id.toString() !== skillId
      );
    } else if (type === 'desired') {
      user.skillsDesired = user.skillsDesired.filter(
        (skill) => skill._id.toString() !== skillId
      );
    } else {
      return res.status(400).json({ message: 'Invalid skill type' });
    }

    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Search users by skills
 * @route   GET /api/users/search
 * @access  Private
 */
const searchUsers = async (req, res) => {
  try {
    const { skill, location, page = 1, limit = 10 } = req.query;

    let query = { _id: { $ne: req.user._id }, isActive: true };

    if (skill) {
      query['skillsOffered.name'] = new RegExp(skill, 'i');
    }

    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ 'rating.average': -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get matched users based on compatibility
 * @route   GET /api/users/matches
 * @access  Private
 */
const getMatches = async (req, res) => {
  try {
    const { skill, location, minScore = 30 } = req.query;

    const matches = await findMatches(User, req.user._id, {
      skillName: skill,
      location,
    });

    const filteredMatches = matches.filter(
      (match) => match.matchScore.percentage >= minScore
    );

    res.json(filteredMatches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  addSkill,
  removeSkill,
  searchUsers,
  getMatches,
};
