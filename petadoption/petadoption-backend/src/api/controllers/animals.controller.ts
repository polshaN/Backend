// src/api/controllers/animals.controller.ts
import { Request, Response } from "express";
import {animalsService} from "../../services/animal.service";
import {validateBody, validateParams} from "../../middleware/validation.middleware";
import {AnimalDto} from "../../types/dto/animal.dto";
import {IdParam} from "../../types/base.dto";


/**
 * @swagger
 * components:
 *   schemas:
 *     AnimalModel:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - age
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         type:
 *           type: string
 *           enum: [Dog, Cat, Rabbit, Other]
 *         breed:
 *           type: string
 *         age:
 *           type: number
 *           format: float
 *         health_status:
 *           type: string
 *       example:
 *         name: Panda
 *         type: cat
 *         breed: stray
 *         age: 3
 *         health_status: healthy
 *         adoption_status: Available
 */

/**
 * @swagger
 * tags:
 *   name: Animals
 *   description: AnimalModel management
 */

export class AnimalsController {
    /**
     * @swagger
     * /animals:
     *   get:
     *     summary: Get all animals
     *     tags: [Animals]
     *     responses:
     *       200:
     *         description: List of animals
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/AnimalModel'
     */
    async getAll(req: Request, res: Response) {
        try {
            const animals = await animalsService.getAll();
            // Add photoUrl to response - use full URL for frontend
            const animalsWithUrls = animals.map(animal => ({
                ...animal,
                photoUrl: animal.photo ? `http://localhost:4001/uploads/animals/${animal.photo}` : null
            }));
            res.status(200).send(animalsWithUrls);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
    /**
     * @swagger
     * /animals/{id}:
     *   get:
     *     summary: Get animal by id
     *     tags: [Animals]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: AnimalModel id
     *     responses:
     *       200:
     *         description: AnimalModel found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AnimalModel'
     *       404:
     *         description: AnimalModel not found
     */

    async getById(req: Request, res: Response) {
        try {
            const { id } = await validateParams(req, IdParam);
            const animal = await animalsService.getById(id);

            if (!animal) {
                return res.status(404).send("Animal with id not found");
            }

            // Add photoUrl to response
            const animalWithUrl = {
                ...animal,
                photoUrl: animal.photo ? `http://localhost:4001/uploads/animals/${animal.photo}` : null
            };

            res.status(200).send(animalWithUrl);
        } catch (error) {
            res.status(500).json({ error: error });
        }
    }
    /**
     * @swagger
     * /animals:
     *   post:
     *     summary: Create a new animal
     *     tags: [Animals]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/AnimalModel'
     *     responses:
     *       201:
     *         description: AnimalModel created
     *       400:
     *         description: Validation error
     */
    async create(req: Request, res: Response) {
        try {
            // 1. Ensure req.body exists
            if (!req.body) {
                return res.status(400).json({ message: "No data sent" });
            }

            // 2. Parse and sanitize fields
            const rawBody = {
                name: (req.body.name ?? '').trim(),
                type: (req.body.type ?? '').trim(),
                breed: (req.body.breed ?? '').trim(),
                age: req.body.age ? Number(req.body.age) : undefined,
                health_status: (req.body.health_status ?? '').trim(),
                adoption_status: (req.body.adoption_status ?? '').trim(),
                description: (req.body.description ?? '').trim(),
            };

            // 3. Validate using DTO - now validateBody supports plain objects
            const dto = await validateBody(rawBody, AnimalDto);

            // 4. Attach uploaded photo if exists
            if ((req as any).file) {
                console.log('📸 File received:', (req as any).file);
                dto.photo = (req as any).file.filename;  // Use generated filename, not originalname
                console.log('📸 Photo filename stored:', dto.photo);
            } else {
                console.log('⚠️  No file in request');
            }

            // 5. Save to DB
            const created = await animalsService.create(dto);

            // 6. Return response with photo URL
            const photoUrl = created.photo ? `http://localhost:4001/uploads/animals/${created.photo}` : null;
            console.log('✅ Animal created:', created.name, 'Photo:', created.photo, 'URL:', photoUrl);
            res.status(201).json({
                ...created,
                photoUrl: photoUrl,
            });

        } catch (error: any) {
            console.error('Animal create error:', error);
            res.status(400).json({ message: error?.message || 'Failed to create animal' });
        }
    }



    /**
     * @swagger
     * /animals/{id}:
     *   put:
     *     summary: Update animal by id
     *     tags: [Animals]
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
     *             $ref: '#/components/schemas/AnimalModel'
     *     responses:
     *       202:
     *         description: AnimalModel updated
     *       404:
     *         description: AnimalModel not found
     */

    async update(req: Request, res: Response) {
        try {
            const { id } = await validateParams(req, IdParam);
            
            // Parse and sanitize fields similar to create
            const rawBody = {
                name: (req.body.name ?? '').trim(),
                type: (req.body.type ?? '').trim(),
                breed: (req.body.breed ?? '').trim(),
                age: req.body.age ? Number(req.body.age) : undefined,
                health_status: (req.body.health_status ?? '').trim(),
                adoption_status: (req.body.adoption_status ?? '').trim(),
                description: (req.body.description ?? '').trim(),
            };

            const dto = await validateBody(rawBody, AnimalDto);

            // If file was uploaded, get filename
            if ((req as any).file) {
                dto.photo = (req as any).file.filename;  // Use generated filename, not originalname
            }

            const updated = await animalsService.update(id, dto);

            if (!updated) {
                return res.status(404).send("Animal not found");
            }

            // Add photoUrl to response
            const updatedWithUrl = {
                ...updated,
                photoUrl: updated.photo ? `http://localhost:4001/uploads/animals/${updated.photo}` : null
            };

            res.status(202).send(updatedWithUrl);
        } catch (error) {
            res.status(400).json({ error: error });
        }
    }

    /**
     * @swagger
     * /animals/{id}:
     *   delete:
     *     summary: Delete animal by id
     *     tags: [Animals]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       204:
     *         description: AnimalModel deleted
     *       404:
     *         description: AnimalModel not found
     */
    async delete(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        await animalsService.delete(id);
        res.status(204).send();
    }
}
