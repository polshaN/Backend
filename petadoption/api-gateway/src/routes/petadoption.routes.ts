import { Router } from 'express';
import axios from 'axios';

const router = Router();
const PETADOPTION_BACKEND_URL = process.env.PETADOPTION_BACKEND_URL || 'http://petadoption-backend:4001';

// ===== ADOPTION ROUTES (MUST BE FIRST to avoid conflicts with animals/:id) =====

/**
 * @swagger
 * /api/adoptions:
 *   get:
 *     summary: Get user adoptions
 *     description: Get logged-in user's adoption requests
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user adoptions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Adoption'
 *             example:
 *               - _id: "607f1f77bcf86cd799439015"
 *                 userId: "507f1f77bcf86cd799439011"
 *                 animalId: "507f1f77bcf86cd799439021"
 *                 status: "pending"
 *                 requestTime: "2024-01-15T10:30:00Z"
 *                 approvalTime: null
 *               - _id: "607f1f77bcf86cd799439016"
 *                 userId: "507f1f77bcf86cd799439011"
 *                 animalId: "507f1f77bcf86cd799439022"
 *                 status: "approved"
 *                 requestTime: "2024-01-10T14:20:00Z"
 *                 approvalTime: "2024-01-11T09:15:00Z"
 *       401:
 *         description: Unauthorized
 */

router.get('/adoptions', async (req, res) => {
    try {
        console.log('[Gateway] GET /adoptions');
        const response = await axios.get(`${PETADOPTION_BACKEND_URL}/api/adoptions`, {
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
 * @swagger
 * /api/adoptions/admin:
 *   get:
 *     summary: Get all adoptions (admin)
 *     description: Get all adoption requests for staff review
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all adoption requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Adoption'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
router.get('/adoptions/admin', async (req, res) => {
    try {
        console.log('[Gateway] GET /adoptions/admin');
        const response = await axios.get(`${PETADOPTION_BACKEND_URL}/api/adoptions/admin`, {
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
 * @swagger
 * /api/adoptions:
 *   post:
 *     summary: Create adoption request
 *     description: Submit a new adoption request for an animal
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAdoptionDto'
 *           example:
 *             animalId: "507f1f77bcf86cd799439021"
 *     responses:
 *       201:
 *         description: Adoption request created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Adoption'
 *             example:
 *               _id: "607f1f77bcf86cd799439015"
 *               userId: "507f1f77bcf86cd799439011"
 *               animalId: "507f1f77bcf86cd799439021"
 *               status: "pending"
 *               requestTime: "2024-01-15T10:30:00Z"
 *       400:
 *         description: Validation error or animal already adopted
 *       401:
 *         description: Unauthorized
 */

// ===== ADOPTION STATUS ROUTES =====

/**
 * @swagger
 * /api/adoptions/{id}/approve:
 *   put:
 *     summary: Approve adoption
 *     description: Approve a pending adoption request
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Adoption request ID
 *         example: "607f1f77bcf86cd799439015"
 *     responses:
 *       200:
 *         description: Adoption approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Adoption'
 *             example:
 *               _id: "607f1f77bcf86cd799439015"
 *               userId: "507f1f77bcf86cd799439011"
 *               animalId: "507f1f77bcf86cd799439021"
 *               status: "approved"
 *               requestTime: "2024-01-15T10:30:00Z"
 *               approvalTime: "2024-01-16T14:20:00Z"
 *       404:
 *         description: Adoption not found
 *       401:
 *         description: Unauthorized
 */
router.put('/adoptions/:id/approve', async (req, res) => {
    const { id } = req.params;
    const response = await axios.put(
        `${PETADOPTION_BACKEND_URL}/api/adoptions/${id}/approve`,
        {},
        { headers: { Authorization: req.headers.authorization } }
    );
    res.json(response.data);
});

/**
 * @swagger
 * /api/adoptions/{id}/reject:
 *   put:
 *     summary: Reject adoption
 *     description: Reject a pending adoption request
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "607f1f77bcf86cd799439015"
 *     responses:
 *       200:
 *         description: Adoption rejected
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Adoption'
 *       404:
 *         description: Adoption not found
 */

router.put('/adoptions/:id/reject', async (req, res) => {
    const { id } = req.params;
    const response = await axios.put(
        `${PETADOPTION_BACKEND_URL}/api/adoptions/${id}/reject`,
        {},
        { headers: { Authorization: req.headers.authorization } }
    );
    res.json(response.data);
});
/**
 * @swagger
 * /api/adoptions/{id}/schedule:
 *   put:
 *     summary: Schedule adoption visit
 *     description: Schedule a visit for an approved adoption
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: "607f1f77bcf86cd799439015"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ScheduleAdoptionDto'
 *           example:
 *             scheduledDate: "2024-02-01T15:00:00Z"
 *             notes: "Meeting at shelter office, bring ID"
 *     responses:
 *       200:
 *         description: Visit scheduled
 *       400:
 *         description: Invalid request or not approved
 */

router.put('/adoptions/:id/schedule', async (req, res) => {
    const { id } = req.params;
    const response = await axios.put(
        `${PETADOPTION_BACKEND_URL}/api/adoptions/${id}/schedule`,
        req.body,
        { headers: { Authorization: req.headers.authorization } }
    );
    res.json(response.data);
});
/**
 * @swagger
 * /api/adoptions/{id}/cancel:
 *   put:
 *     summary: Cancel adoption
 *     description: Cancel an adoption request
 *     tags: [Adoptions]
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
 *         description: Adoption cancelled
 *       404:
 *         description: Adoption not found
 */
router.put('/adoptions/:id/cancel', async (req, res) => {
    const { id } = req.params;
    const response = await axios.put(
        `${PETADOPTION_BACKEND_URL}/api/adoptions/${id}/cancel`,
        {},
        { headers: { Authorization: req.headers.authorization } }
    );
    res.json(response.data);
});


/**
 * @openapi
 * /api/adoptions/{id}:
 *   delete:
 *     summary: Cancel adoption request
 *     description: Cancel a pending adoption request
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Adoption ID
 */
router.delete('/adoptions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[Gateway] DELETE /adoptions/${id}`);
        await axios.delete(`${PETADOPTION_BACKEND_URL}/api/adoptions/${id}`, {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(204).send();
    } catch (error: any) {
        console.error('[Gateway] DELETE /adoptions error:', error.message);
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message
        });
    }
});

/**
 * @openapi
 * /api/adoptions:
 *   post:
 *     summary: Create adoption request
 *     description: Submit a new adoption request for an animal
 *     tags: [Adoptions]
 *     security:
 *       - bearerAuth: []
 */
router.post('/adoptions', async (req, res) => {
    try {
        const { animalId } = req.body;
        console.log(`[Gateway] POST /adoptions for animal ${animalId}`);
        const response = await axios.post(`${PETADOPTION_BACKEND_URL}/api/adoptions`, req.body, {
            headers: { Authorization: req.headers.authorization }
        });
        res.status(201).json(response.data);
    } catch (error: any) {
        console.error('[Gateway] POST /adoptions error:', error.message);
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message
        });
    }
});

// ===== ANIMAL ROUTES (AFTER adoptions to avoid conflicts) =====
/**
 * @swagger
 * /api/animals:
 *   get:
 *     summary: Get all animals
 *     description: Retrieve all available animals for adoption
 *     tags: [Animals]
 *     responses:
 *       200:
 *         description: List of animals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Animal'
 *             examples:
 *               success:
 *                 value:
 *                   - _id: "507f1f77bcf86cd799439021"
 *                     name: "Bella"
 *                     type: "Dog"
 *                     breed: "Labrador Retriever"
 *                     age: 3.5
 *                     health_status: "vaccinated"
 *                     adoption_status: "available"
 *                     description: "Friendly and energetic dog"
 *                     photoUrl: "http://localhost:4001/uploads/animals/bella-photo.jpg"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

router.get('/animals', async (req, res) => {
    try {
        const response = await axios.get(`${PETADOPTION_BACKEND_URL}/api/animals`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error: any) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message,
        });
    }
});
/**
 * @swagger
 * /api/animals/{id}:
 *   get:
 *     summary: Get animal by ID
 *     description: Retrieve a single animal by its ID
 *     tags: [Animals]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Animal ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439021"
 *     responses:
 *       200:
 *         description: Animal found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Animal'
 *             example:
 *               _id: "507f1f77bcf86cd799439021"
 *               name: "Bella"
 *               type: "Dog"
 *               breed: "Labrador Retriever"
 *               age: 3.5
 *               health_status: "vaccinated"
 *               adoption_status: "available"
 *               description: "Friendly and energetic dog, loves playing fetch"
 *               photoUrl: "http://localhost:4001/uploads/animals/bella-photo.jpg"
 *       404:
 *         description: Animal not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 */

router.get('/animals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`${PETADOPTION_BACKEND_URL}/api/animals/${id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.json(response.data);
    } catch (error: any) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message,
        });
    }
});
/**
 * @swagger
 * /api/animals:
 *   post:
 *     summary: Add a new animal
 *     description: Add a new animal for adoption (requires authentication)
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - age
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Panda"
 *               type:
 *                 type: string
 *                 enum: [Dog, Cat, Rabbit, Other]
 *                 example: "Cat"
 *               breed:
 *                 type: string
 *                 example: "Stray"
 *               age:
 *                 type: number
 *                 format: float
 *                 example: 2.5
 *               health_status:
 *                 type: string
 *                 enum: [healthy, sick, vaccinated, unknown]
 *                 example: "healthy"
 *               adoption_status:
 *                 type: string
 *                 enum: [available, pending, adopted, reserved]
 *                 example: "available"
 *               description:
 *                 type: string
 *                 example: "Cute black and white cat, very playful"
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: "Photo file of the animal"
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAnimalDto'
 *           example:
 *             name: "Panda"
 *             type: "Cat"
 *             breed: "Stray"
 *             age: 2.5
 *             health_status: "healthy"
 *             adoption_status: "available"
 *             description: "Cute black and white cat, very playful"
 *     responses:
 *       201:
 *         description: Animal created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Animal'
 *             example:
 *               _id: "507f1f77bcf86cd799439023"
 *               name: "Panda"
 *               type: "Cat"
 *               breed: "Stray"
 *               age: 2.5
 *               health_status: "healthy"
 *               adoption_status: "available"
 *               description: "Cute black and white cat, very playful"
 *               photoUrl: "http://localhost:4001/uploads/animals/panda-photo.jpg"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 */

router.post('/animals', async (req, res) => {
    try {
        // For multipart requests (file uploads), forward the raw request stream
        if (req.headers['content-type']?.includes('multipart/form-data')) {
            console.log('[Gateway] Forwarding multipart request to backend');
            const response = await axios.post(
                `${PETADOPTION_BACKEND_URL}/api/animals`,
                req,
                {
                    headers: {
                        Authorization: req.headers.authorization,
                        'Content-Type': req.headers['content-type'],
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                }
            );
            res.status(201).json(response.data);
        } else {
            // For JSON requests, use normal body
            const response = await axios.post(
                `${PETADOPTION_BACKEND_URL}/api/animals`,
                req.body,
                {
                    headers: { Authorization: req.headers.authorization },
                }
            );
            res.status(201).json(response.data);
        }
    } catch (error: any) {
        console.error('[Gateway] Error forwarding animals POST:', error.message);
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message,
        });
    }
});
/**
* @swagger
* /api/animals/{id}:
*   put:
    *     summary: Update an animal
*     description: Update information for a specific animal (requires authentication)
*     tags: [Animals]
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: id
*         required: true
*         schema:
*           type: string
*         description: Animal ID
*         example: "507f1f77bcf86cd799439021"
*     requestBody:
*       required: true
*       content:
*         multipart/form-data:
*           schema:
    *             type: object
*             properties:
*               name:
    *                 type: string
*                 example: "Bella"
*               type:
*                 type: string
*                 enum: [Dog, Cat, Rabbit, Other]
*                 example: "Dog"
*               breed:
*                 type: string
*                 example: "Golden Retriever"
*               age:
*                 type: number
*                 format: float
*                 example: 4
*               health_status:
*                 type: string
*                 enum: [healthy, sick, vaccinated, unknown]
*                 example: "vaccinated"
*               adoption_status:
*                 type: string
*                 enum: [available, pending, adopted, reserved]
*                 example: "adopted"
*               description:
*                 type: string
*                 example: "Updated description"
*               photo:
*                 type: string
*                 format: binary
*         application/json:
*           schema:
    *             $ref: '#/components/schemas/UpdateAnimalDto'
*     responses:
*       202:
*         description: Animal updated successfully
*         content:
*           application/json:
*             schema:
    *               $ref: '#/components/schemas/Animal'
*       404:
*         description: Animal not found
*       400:
*         description: Validation error
*       401:
*         description: Unauthorized
*/
router.put('/animals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // For multipart requests (file uploads), forward the raw request stream
        if (req.headers['content-type']?.includes('multipart/form-data')) {
            console.log('[Gateway] Forwarding multipart PUT request to backend');
            const response = await axios.put(
                `${PETADOPTION_BACKEND_URL}/api/animals/${id}`,
                req,
                {
                    headers: {
                        Authorization: req.headers.authorization,
                        'Content-Type': req.headers['content-type'],
                    },
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                }
            );
            res.json(response.data);
        } else {
            // For JSON requests, use normal body
            const response = await axios.put(
                `${PETADOPTION_BACKEND_URL}/api/animals/${id}`,
                req.body,
                {
                    headers: { Authorization: req.headers.authorization },
                }
            );
            res.json(response.data);
        }
    } catch (error: any) {
        console.error('[Gateway] Error forwarding animals PUT:', error.message);
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message,
        });
    }
});


/**
 * @swagger
 * /api/animals/{id}:
 *   delete:
 *     summary: Delete an animal
 *     description: Remove an animal from adoption (requires authentication)
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Animal ID
 *         example: "507f1f77bcf86cd799439021"
 *     responses:
 *       204:
 *         description: Animal deleted successfully
 *       404:
 *         description: Animal not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/animals/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await axios.delete(`${PETADOPTION_BACKEND_URL}/api/animals/${id}`, {
            headers: { Authorization: req.headers.authorization },
        });
        res.status(204).send();
    } catch (error: any) {
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message,
        });
    }
});

/**
 * @openapi
 * /api/animals/adopt/{id}:
 *   post:
 *     summary: Adopt an animal
 *     description: Submit adoption request for an animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Animal ID
 */
router.post('/animals/adopt/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Forward to backend /api/adoptions
        const response = await axios.post(
            `${PETADOPTION_BACKEND_URL}/api/adoptions`,
            { animalId: id },
            {
                headers: { Authorization: req.headers.authorization }
            }
        );

        res.status(201).json(response.data);
    } catch (error: any) {
        console.error('Adoption error:', error.message);
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.message || error.message
        });
    }
});

/**
* @swagger
* /api/profile:
    *   get:
    *     summary: Get user profile
*     description: Get logged-in user's profile and their adoption history
*     tags: [Profile]
*     security:
*       - bearerAuth: []
*     responses:
*       200:
*         description: User profile retrieved
*         content:
*           application/json:
*             schema:
    *               allOf:
    *                 - $ref: '#/components/schemas/User'
*                 - type: object
*                   properties:
*                     adoptions:
 *                        type: array
*                       items:
*                         $ref: '#/components/schemas/Adoption'
*             example:
*               _id: "507f1f77bcf86cd799439011"
*               firstName: "John"
*               lastName: "Doe"
*               email: "john.doe@example.com"
*               phone: "+1234567890"
*               role: "user"
*               adoptionPoints: 150
*               adoptions:
*                 - _id: "607f1f77bcf86cd799439015"
*                   animalId: "507f1f77bcf86cd799439021"
*                   status: "approved"
*       401:
*         description: Unauthorized
*/

router.get('/profile', async (req, res) => {
    console.log('AUTH HEADER:', req.headers.authorization);
    try {
        const response = await axios.get(`${PETADOPTION_BACKEND_URL}/api/profile`, {
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

export default router;