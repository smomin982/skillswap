const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createSession,
  getSessions,
  getSession,
  updateSession,
  completeSession,
  cancelSession,
  sendReminders,
} = require('../controllers/sessionController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');

/**
 * @swagger
 * /sessions:
 *   get:
 *     summary: Get user's sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: upcoming
 *         schema:
 *           type: boolean
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
 *         description: List of sessions
 */
router.get('/', protect, getSessions);

/**
 * @swagger
 * /sessions:
 *   post:
 *     summary: Create session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - exchangeId
 *               - teacherId
 *               - learnerId
 *               - skill
 *               - scheduledDate
 *             properties:
 *               exchangeId:
 *                 type: string
 *               teacherId:
 *                 type: string
 *               learnerId:
 *                 type: string
 *               skill:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: number
 *               type:
 *                 type: string
 *               location:
 *                 type: string
 *               agenda:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session created
 */
router.post(
  '/',
  protect,
  [
    body('exchangeId').notEmpty().withMessage('Exchange ID is required'),
    body('teacherId').notEmpty().withMessage('Teacher ID is required'),
    body('learnerId').notEmpty().withMessage('Learner ID is required'),
    body('skill').notEmpty().withMessage('Skill is required'),
    body('scheduledDate').isISO8601().withMessage('Valid date is required'),
  ],
  validate,
  createSession
);

/**
 * @swagger
 * /sessions/reminders:
 *   post:
 *     summary: Send session reminders (cron job)
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reminders sent
 */
router.post('/reminders', protect, sendReminders);

/**
 * @swagger
 * /sessions/{id}:
 *   get:
 *     summary: Get single session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session details
 */
router.get('/:id', protect, getSession);

/**
 * @swagger
 * /sessions/{id}:
 *   put:
 *     summary: Update session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scheduledDate:
 *                 type: string
 *               duration:
 *                 type: number
 *               type:
 *                 type: string
 *               location:
 *                 type: string
 *               agenda:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session updated
 */
router.put('/:id', protect, updateSession);

/**
 * @swagger
 * /sessions/{id}/complete:
 *   put:
 *     summary: Complete session with feedback
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session completed
 */
router.put('/:id/complete', protect, completeSession);

/**
 * @swagger
 * /sessions/{id}/cancel:
 *   put:
 *     summary: Cancel session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session cancelled
 */
router.put('/:id/cancel', protect, cancelSession);

module.exports = router;
