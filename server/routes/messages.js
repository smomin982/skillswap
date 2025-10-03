const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  getUnreadCount,
  deleteMessage,
} = require('../controllers/messageController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validation');

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     summary: Get all conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */
router.get('/conversations', protect, getConversations);

/**
 * @swagger
 * /messages/unread/count:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
router.get('/unread/count', protect, getUnreadCount);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send message
 *     tags: [Messages]
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
 *               - content
 *             properties:
 *               recipientId:
 *                 type: string
 *               content:
 *                 type: string
 *               exchangeId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post(
  '/',
  protect,
  [
    body('recipientId').notEmpty().withMessage('Recipient ID is required'),
    body('content').trim().notEmpty().withMessage('Message content is required'),
  ],
  validate,
  sendMessage
);

/**
 * @swagger
 * /messages/{userId}:
 *   get:
 *     summary: Get messages with a user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
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
 *         description: List of messages
 */
router.get('/:userId', protect, getMessages);

/**
 * @swagger
 * /messages/{id}/read:
 *   put:
 *     summary: Mark message as read
 *     tags: [Messages]
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
 *         description: Message marked as read
 */
router.put('/:id/read', protect, markAsRead);

/**
 * @swagger
 * /messages/{id}:
 *   delete:
 *     summary: Delete message
 *     tags: [Messages]
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
 *         description: Message deleted
 */
router.delete('/:id', protect, deleteMessage);

module.exports = router;
