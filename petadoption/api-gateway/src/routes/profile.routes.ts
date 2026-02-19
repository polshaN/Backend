import { Router } from 'express';
import axios from 'axios';

const router = Router();
const PETADOPTION_BACKEND_URL = process.env.PETADOPTION_BACKEND_URL || 'http://petadoption-backend:4001';

/**
 * @openapi
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     description: Get logged-in user's profile and adoptions
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 adoptions:
 *                   type: array
 */
router.get('/', async (req, res) => {
    console.log('[Profile Gateway] Forwarding to backend');
    try {
        const response = await axios.get(`${PETADOPTION_BACKEND_URL}/api/profile`, {
            headers: { Authorization: req.headers.authorization }
        });
        console.log('[Profile Gateway] Response received:', typeof response.data);
        res.json(response.data);
    } catch (error: any) {
        console.error('[Profile Gateway] Error:', error.message);
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message
        });
    }
});

export default router;