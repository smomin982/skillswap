const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getSkills,
  getSkill,
  createSkill,
  getPopularSkills,
  getSkillsByCategory,
} = require('../controllers/skillController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');

/**
 * @swagger
 * /skills:
 *   get:
 *     summary: Get all skills
 *     tags: [Skills]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of skills
 */
router.get('/', getSkills);

/**
 * @swagger
 * /skills/popular:
 *   get:
 *     summary: Get popular skills
 *     tags: [Skills]
 *     responses:
 *       200:
 *         description: List of popular skills
 */
router.get('/popular', getPopularSkills);

/**
 * @swagger
 * /skills/category/{category}:
 *   get:
 *     summary: Get skills by category
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of skills in category
 */
router.get('/category/:category', getSkillsByCategory);

/**
 * @swagger
 * /skills:
 *   post:
 *     summary: Create new skill
 *     tags: [Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Skill created
 */
router.post(
  '/',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Skill name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
  ],
  validate,
  createSkill
);

/**
 * @swagger
 * /skills/{id}:
 *   get:
 *     summary: Get single skill
 *     tags: [Skills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skill details
 */
router.get('/:id', getSkill);

module.exports = router;
