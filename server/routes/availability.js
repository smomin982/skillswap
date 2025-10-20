const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getMyAvailability,
  upsertMyAvailability,
  getUserSlots,
} = require('../controllers/availabilityController');

/**
 * @swagger
 * /availability/me:
 *   get:
 *     summary: Get current user's availability
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability document
 */
router.get('/me', protect, getMyAvailability);

/**
 * @swagger
 * /availability:
 *   put:
 *     summary: Create or update current user's availability
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timezone:
 *                 type: string
 *               rules:
 *                 type: array
 *                 items:
 *                   type: object
 *               exceptions:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Availability upserted
 */
router.put('/', protect, upsertMyAvailability);

/**
 * @swagger
 * /availability/{userId}/slots:
 *   get:
 *     summary: Get bookable slots for a user
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: start
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: end
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: duration
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: step
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of slots
 */
router.get('/:userId/slots', protect, getUserSlots);

module.exports = router;
