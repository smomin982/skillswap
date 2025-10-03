const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createExchange,
  getExchanges,
  getExchange,
  updateExchangeStatus,
  completeExchange,
  deleteExchange,
} = require('../controllers/exchangeController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');

/**
 * @swagger
 * /exchanges:
 *   get:
 *     summary: Get user's exchanges
 *     tags: [Exchanges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
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
 *         description: List of exchanges
 */
router.get('/', protect, getExchanges);

/**
 * @swagger
 * /exchanges:
 *   post:
 *     summary: Create exchange request
 *     tags: [Exchanges]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipientId
 *               - requesterSkill
 *               - recipientSkill
 *             properties:
 *               recipientId:
 *                 type: string
 *               requesterSkill:
 *                 type: object
 *               recipientSkill:
 *                 type: object
 *               duration:
 *                 type: number
 *               frequency:
 *                 type: string
 *               preferredMeetingType:
 *                 type: string
 *               notes:
 *                 type: string
 *               goals:
 *                 type: object
 *     responses:
 *       201:
 *         description: Exchange created
 */
router.post(
  '/',
  protect,
  [
    body('recipientId').notEmpty().withMessage('Recipient ID is required'),
    body('requesterSkill.name').notEmpty().withMessage('Requester skill is required'),
    body('recipientSkill.name').notEmpty().withMessage('Recipient skill is required'),
  ],
  validate,
  createExchange
);

/**
 * @swagger
 * /exchanges/{id}:
 *   get:
 *     summary: Get single exchange
 *     tags: [Exchanges]
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
 *         description: Exchange details
 */
router.get('/:id', protect, getExchange);

/**
 * @swagger
 * /exchanges/{id}/status:
 *   put:
 *     summary: Update exchange status
 *     tags: [Exchanges]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [accepted, rejected, cancelled]
 *     responses:
 *       200:
 *         description: Exchange status updated
 */
router.put(
  '/:id/status',
  protect,
  [
    body('status')
      .isIn(['accepted', 'rejected', 'cancelled'])
      .withMessage('Invalid status'),
  ],
  validate,
  updateExchangeStatus
);

/**
 * @swagger
 * /exchanges/{id}/complete:
 *   put:
 *     summary: Complete exchange
 *     tags: [Exchanges]
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
 *         description: Exchange completed
 */
router.put('/:id/complete', protect, completeExchange);

/**
 * @swagger
 * /exchanges/{id}:
 *   delete:
 *     summary: Delete exchange
 *     tags: [Exchanges]
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
 *         description: Exchange deleted
 */
router.delete('/:id', protect, deleteExchange);

module.exports = router;
