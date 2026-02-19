import swaggerJSDoc from 'swagger-jsdoc';
import { Config } from './config'; // Ensure this path matches your project structure

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PetAdoption API Gateway',
            version: '1.0.0',
            description: 'Central API Gateway for all PetAdoption microservices',
            contact: { name: 'API Support' },
        },
        servers: [
            {
                url: `http://localhost:${Config.port}`, // points to API Gateway (4000)
                description: 'Development API Gateway',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token in format: Bearer <token>',
                },
            },
            schemas: {
                // ==================== COMMON ====================
                Error: {
                    type: 'object',
                    properties: {
                        code: { type: 'string', example: 'validation_error' },
                        message: { type: 'string', example: 'Invalid input data' },
                        statusCode: { type: 'integer', example: 400 },
                    },
                },

                // ==================== CHAT SERVICE ====================
                Message: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439031' },
                        roomId: { type: 'string', example: '507f1f77bcf86cd799439032' },
                        senderId: { type: 'string', example: 'keycloak-user-id' },
                        content: { type: 'string', example: 'Hello! Want to adopt a cat?' },
                        timestamp: { type: 'string', format: 'date-time' },
                    },
                },
                SendMessageDto: {
                    type: 'object',
                    required: ['roomId', 'senderId', 'content'],
                    properties: {
                        roomId: { type: 'string', example: '507f1f77bcf86cd799439032' },
                        senderId: { type: 'string', example: 'keycloak-user-id' },
                        content: { type: 'string', example: 'Hi, is Bella still available?' },
                    },
                },

                // ==================== PET SERVICE ====================
                Animal: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439021' },
                        name: { type: 'string', example: 'Bella' },
                        species: { type: 'string', example: 'Dog' },
                        breed: { type: 'string', example: 'Labrador' },
                        age: { type: 'number', example: 3 },
                        health_status: { type: 'string', example: 'healthy' },
                        adoption_status: { type: 'string', example: 'Available' },
                    },
                },

                CreateAnimalDto: {
                    type: 'object',
                    required: ['name', 'species', 'age'],
                    properties: {
                        name: { type: 'string', example: 'Panda' },
                        species: { type: 'string', example: 'Cat' },
                        breed: { type: 'string', example: 'Stray' },
                        age: { type: 'number', example: 3 },
                        health_status: { type: 'string', example: 'healthy' },
                        adoption_status: { type: 'string', example: 'Available' },
                    },
                }, // <--- FIXED: Added closing brace and comma here

                UpdateAnimalDto: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Panda' },
                        species: { type: 'string', example: 'Cat' },
                        breed: { type: 'string', example: 'Stray' },
                        age: { type: 'number', example: 4 },
                        health_status: { type: 'string', example: 'Vaccinated' },
                        adoption_status: { type: 'string', example: 'Adopted' },
                    },
                },
            }, // Close schemas
        }, // Close components

        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Health', description: 'Health check endpoints' },
            { name: 'Auth', description: 'Authentication endpoints (Keycloak)' },
            { name: 'Profiles', description: 'Profile management endpoints' },
            { name: 'Pets', description: 'Pet adoption and listing endpoints' },
            { name: 'Chat', description: 'Chat endpoints (proxied to chat-service on 4003)' },
        ],
    },
    // Include the API Gateway routes
    apis: ['./src/routes/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);