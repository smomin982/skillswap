const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getUserProfile,
  updateProfile,
  addSkill,
  removeSkill,
  searchUsers,
  getMatches,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { upload } = require('../utils/imageUpload');

/**
 * @swagger
 * /users/search:
 *   get:
 *     summary: Search users by skills
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: skill
 *         schema:
 *           type: string
 *       - in: query
 *         name: location
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
 *         description: List of users
 */
router.get('/search', protect, searchUsers);

/**
 * @swagger
 * /users/matches:
 *   get:
 *     summary: Get matched users based on compatibility
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of matched users
 */
router.get('/matches', protect, getMatches);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               location:
 *                 type: object
 *               timezone:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', protect, upload.single('profilePicture'), updateProfile);

/**
 * @swagger
 * /users/skills:
 *   post:
 *     summary: Add skill to user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - name
 *               - level
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [offered, desired]
 *               name:
 *                 type: string
 *               level:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Skill added
 */
router.post(
  '/skills',
  protect,
  [
    body('type')
      .isIn(['offered', 'desired'])
      .withMessage('Type must be offered or desired'),
    body('name').trim().notEmpty().withMessage('Skill name is required'),
    body('level')
      .isIn(['beginner', 'intermediate', 'advanced', 'expert'])
      .withMessage('Invalid skill level'),
  ],
  validate,
  addSkill
);

/**
 * @swagger
 * /users/skills/{type}/{skillId}:
 *   delete:
 *     summary: Remove skill from user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Skill removed
 */
router.delete('/skills/:type/:skillId', protect, removeSkill);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User profile
 */
router.get('/:id', getUserProfile);

module.exports = router;
