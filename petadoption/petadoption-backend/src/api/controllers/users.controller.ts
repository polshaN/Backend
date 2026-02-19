// import 'reflect-metadata';
import { Request, Response } from 'express';
import { validateBody, validateParams, validateQuery } from '../../middleware/validation.middleware';
import { UserDto } from '../../types/dto/user.dto';
import {IdParam, SearchQuery} from '../../types/base.dto';
import { userService } from '../../services/user.service';

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfileResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         telegramUsername:
 *           type: string
 *         adoptionPoints:
 *           type: number
 *       example:
 *         _id: 650fcb82e757397eb8d7f9ca
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         phone: "+123456789"
 *         telegramUsername: "@johndoe"
 *         adoptionPoints: 0
 *
 *     UserProfileRequest:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *       properties:
 *         firstName:
 *           type: string
 *         lastName:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         telegramUsername:
 *           type: string
 *         adoptionPoints:
 *           type: number
 *       example:
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@example.com
 *         phone: "+123456789"
 *         telegramUsername: "@johndoe"
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: UserModel profile management
 */

export class UsersController {
    /**
     * @swagger
     * /users:
     *   get:
     *     summary: Get all users
     *     tags: [Users]
     *     responses:
     *       200:
     *         description: List of all users
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/UserProfileResponse'
     */
    async getAll(req: Request, res: Response) {
        const users = await userService.getAll();
        res.status(200).send(users.map(u => ({ ...u, _id: u._id?.toString ? u._id.toString() : u._id })));
    }

    /**
     * @swagger
     * /users:
     *   post:
     *     summary: Create a new user
     *     tags: [Users]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserProfileRequest'
     *     responses:
     *       201:
     *         description: UserModel created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserProfileResponse'
     *       400:
     *         description: Validation error
     */
    async create(req: Request, res: Response) {
        const dto = await validateBody(req, UserDto);
        const created = await userService.create(dto as any);
        created._id = created._id?.toString ? created._id.toString() : created._id;
        res.status(201).send(created);
    }

    /**
     * @swagger
     * /users/{id}:
     *   get:
     *     summary: Get user by id
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: UserModel id (Mongo ObjectId)
     *     responses:
     *       200:
     *         description: UserModel found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserProfileResponse'
     *       404:
     *         description: UserModel not found
     */
    async getById(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);

        const user = await userService.getById(id);
        if (!user) return res.status(404).send({ message: 'UserModel not found' });

         res.status(200).send({
            ...user,
            _id: user._id.toString(),
        });
    }

    /**
     * @swagger
     * /users/{id}:
     *   put:
     *     summary: Update user by id
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: UserModel id (Mongo ObjectId)
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UserProfileRequest'
     *     responses:
     *       202:
     *         description: UserModel updated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/UserProfileResponse'
     *       404:
     *         description: UserModel not found
     */
    async update(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const dto = await validateBody(req, UserDto);
        const updated = await userService.update(id, dto as any);
        if (!updated) return res.status(404).send({ message: 'UserModel not found' });
        updated._id = updated._id?.toString ? updated._id.toString() : updated._id;
        res.status(202).send(updated);
    }

    /**
     * @swagger
     * /users/{id}:
     *   delete:
     *     summary: Delete user by id
     *     tags: [Users]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: UserModel id (Mongo ObjectId)
     *     responses:
     *       204:
     *         description: UserModel deleted
     *       404:
     *         description: UserModel not found
     */
    async delete(req: Request, res: Response) {
        const { id } = await validateParams(req, IdParam);
        const result = await userService.delete(id);
        if (result.deletedCount === 0) return res.status(404).send({ message: 'UserModel not found' });
        res.status(204).send();
    }

    /**
     * @swagger
     * /users/search:
     *   get:
     *     summary: Search users by name
     *     tags: [Users]
     *     parameters:
     *       - in: query
     *         name: query
     *         schema:
     *           type: string
     *         required: true
     *         description: Search query
     *     responses:
     *       200:
     *         description: Search results
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/UserProfileResponse'
     */
    async searchByName(req: Request, res: Response) {
        const { query } = await validateQuery(req, SearchQuery);
        const users = await userService.searchByName(query as string);
        res.status(200).send(users.map(u => ({ ...u, _id: u._id?.toString ? u._id.toString() : u._id })));
    }
    async getOrCreateByKeycloak(req: Request, res: Response) {
        try {
            const keycloakUser = (req as any).kauth?.grant?.access_token?.content;

            if (!keycloakUser) return res.status(400).json({ message: 'Keycloak user missing' });

            const user = await userService.getOrCreateByKeycloak(keycloakUser);
            res.status(200).json(user);
        } catch (err: any) {
            console.error('getOrCreateByKeycloak error', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
 }