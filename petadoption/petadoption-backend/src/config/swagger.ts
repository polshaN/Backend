// adoption-service/src/config/swagger.ts
import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Pet Adoption Service API',
            version: '1.0.0',
            description: 'Microservice handling pet adoptions, requests, approvals, and cancellations'
        },
        servers: [
            { url: 'http://localhost:4002/api', description: 'Development server' },
            { url: 'http://adoption-service:3002', description: 'Docker server' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'Token' }
            },
            schemas: {
                Adoption: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64c8f8f8a1b2c3d4e5f6g7h8' },
                        userId: { type: 'string', example: '507f1f77bcf86cd799439001' },
                        animalId: { type: 'string', example: '507f1f77bcf86cd799439002' },
                        status: {
                            type: 'string',
                            enum: ['Pending','Approved','Rejected','Cancelled','Available','Adopted'],
                            example: 'Pending'
                        },
                        requestTime: { type: 'string', format: 'date-time' },
                        approvalTime: { type: 'string', format: 'date-time' },
                        rejectionTime: { type: 'string', format: 'date-time' },
                        cancelledTime: { type: 'string', format: 'date-time' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        message: { type: 'string', example: 'Adoption not found' },
                        statusCode: { type: 'integer', example: 404 }
                    }
                },
                AdoptionRequestDto: {
                    type: 'object',
                    required: ['animalId'],
                    properties: {
                        animalId: { type: 'string', example: '507f1f77bcf86cd799439002' }
                    }
                }
            }
        },
        tags: [
            { name: 'Adoptions', description: 'Adoption requests and admin approvals' },
            { name: 'Health', description: 'Service health check' }
        ]
    },
    apis: ['./src/api/controllers/*.ts', './src/app.ts']
};

export const swaggerSpec = swaggerJSDoc(options);
