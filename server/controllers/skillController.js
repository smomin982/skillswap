const Skill = require('../models/Skill');

/**
 * @desc    Get all skills
 * @route   GET /api/skills
 * @access  Public
 */
const getSkills = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 50 } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skills = await Skill.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ popularity: -1 });

    const count = await Skill.countDocuments(query);

    res.json({
      skills,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get single skill
 * @route   GET /api/skills/:id
 * @access  Public
 */
const getSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Create new skill
 * @route   POST /api/skills
 * @access  Private (Admin only - simplified for portfolio)
 */
const createSkill = async (req, res) => {
  try {
    const { name, category, description } = req.body;

    const skillExists = await Skill.findOne({ name: new RegExp(`^${name}$`, 'i') });

    if (skillExists) {
      return res.status(400).json({ message: 'Skill already exists' });
    }

    const skill = await Skill.create({
      name,
      category,
      description,
    });

    res.status(201).json(skill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get popular skills
 * @route   GET /api/skills/popular
 * @access  Public
 */
const getPopularSkills = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const skills = await Skill.find()
      .sort({ popularity: -1 })
      .limit(limit * 1);

    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get skills by category
 * @route   GET /api/skills/category/:category
 * @access  Public
 */
const getSkillsByCategory = async (req, res) => {
  try {
    const skills = await Skill.find({ category: req.params.category }).sort({
      popularity: -1,
    });

    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSkills,
  getSkill,
  createSkill,
  getPopularSkills,
  getSkillsByCategory,
};
