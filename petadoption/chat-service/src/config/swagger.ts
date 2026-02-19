import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerOptions: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chat Service API',
            version: '1.0.0',
            description: 'Real-time chat microservice for PetAdoption platform',
            contact: { name: 'API Support', email: 'support@petadoption.local' }
        },
        servers: [
            { url: 'http://localhost:4003', description: 'Direct dev server' },
            { url: 'http://chat-service:4003', description: 'Docker server' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
            },
            schemas: {
                Message: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                        roomId: { type: 'string', example: '507f1f77bcf86cd799439012' },
                        senderId: { type: 'string', example: '507f1f77bcf86cd799439013' },
                        content: { type: 'string', example: 'Hello! Want to adopt a cat?' },
                        timestamp: { type: 'string', format: 'date-time', example: '2024-01-05T12:00:00Z' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        message: { type: 'string', example: 'Error description' }
                    }
                }
            }
        },
        tags: [
            { name: 'Chat', description: 'Real-time chat endpoints' },
            { name: 'Health', description: 'Service health check' }
        ]
    },
    apis: ['./src/**/*.ts', './dist/**/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export function setupSwagger(app: Express) {
    // Serve JSON spec
    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    // Serve Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: 'Chat Service API Documentation',
        customCss: '.swagger-ui .topbar { display: none }'
    }));

    console.log('📚 Swagger documentation available at http://localhost:4003/api-docs');
}

export { swaggerSpec };
