import { Router } from 'express';
import axios from 'axios';

const router = Router();

// Chat service URL from env or fallback
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://chat-service:4003';

/**
 * @openapi
 * /api/chat/history/{roomId}:
 *   get:
 *     summary: Get chat history
 *     description: Retrieve messages for a specific room
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: roomId
 *         required: true
 *         schema:
 *           type: string
 *         description: Room ID (MongoDB ObjectId)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of messages
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.get('/history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { limit } = req.query;

        const response = await axios.get(`${CHAT_SERVICE_URL}/api/chat/history/${id}`, {
            params: { limit },
            headers: { Authorization: req.headers.authorization }
        });

        res.json(response.data);
    } catch (error: any) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message
        });
    }
});

/**
 * @openapi
 * /api/chat/message:
 *   post:
 *     summary: Send a chat message
 *     description: Send a message to a room
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageDto'
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.post('/message', async (req, res) => {
    try {
        const response = await axios.post(`${CHAT_SERVICE_URL}/api/chat/message`, req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(201).json(response.data);
    } catch (error: any) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message
        });
    }
});

/**
 * @openapi
 * /api/chat/message/{id}:
 *   delete:
 *     summary: Delete a chat message
 *     description: Delete a message by ID
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Message ID
 *     responses:
 *       204:
 *         description: Message deleted successfully
 */
router.delete('/message/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await axios.delete(`${CHAT_SERVICE_URL}/api/chat/message/${id}`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(204).send();
    } catch (error: any) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message
        });
    }
});

export default router;
