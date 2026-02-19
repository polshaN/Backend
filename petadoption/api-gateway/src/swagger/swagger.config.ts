import swaggerJSDoc from 'swagger-jsdoc';
import { Config } from "../config/config";

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
                url: `http://localhost:${Config.port}`,
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
                // ==================== ERROR SCHEMA ====================
                Error: {
                    type: 'object',
                    properties: {
                        status: { type: 'string', example: 'error' },
                        message: { type: 'string', example: 'Invalid input data' },
                        statusCode: { type: 'integer', example: 400 },
                    },
                },

                // ==================== ANIMAL (PET) SERVICE ====================
                Animal: {
                    type: 'object',
                    required: ['name', 'type', 'age'],
                    properties: {
                        _id: { type: 'string', format: 'mongo-id', example: '507f1f77bcf86cd799439021' },
                        name: { type: 'string', example: 'Bella' },
                        type: {
                            type: 'string',
                            enum: ['Dog', 'Cat', 'Rabbit', 'Other'],
                            example: 'Dog'
                        },
                        breed: { type: 'string', example: 'Labrador Retriever' },
                        age: {
                            type: 'number',
                            format: 'float',
                            example: 3.5,
                            description: 'Age in years'
                        },
                        health_status: {
                            type: 'string',
                            enum: ['healthy', 'sick', 'vaccinated', 'unknown'],
                            example: 'vaccinated'
                        },
                        adoption_status: {
                            type: 'string',
                            enum: ['available', 'pending', 'adopted', 'reserved'],
                            example: 'available'
                        },
                        description: {
                            type: 'string',
                            example: 'Friendly and energetic Golden Retriever, loves playing fetch and swimming'
                        },
                        photo: {
                            type: 'string',
                            example: 'bella-photo-1234567890.jpg',
                            description: 'Filename of the animal photo'
                        },
                        photoUrl: {
                            type: 'string',
                            format: 'uri',
                            example: 'http://localhost:4001/uploads/animals/bella-photo-1234567890.jpg',
                            description: 'Full URL to the animal photo'
                        },
                    },
                    example: {
                        _id: '507f1f77bcf86cd799439021',
                        name: 'Bella',
                        type: 'Dog',
                        breed: 'Labrador Retriever',
                        age: 3.5,
                        health_status: 'vaccinated',
                        adoption_status: 'available',
                        description: 'Friendly and energetic Golden Retriever, loves playing fetch and swimming',
                        photo: 'bella-photo-1234567890.jpg',
                        photoUrl: 'http://localhost:4001/uploads/animals/bella-photo-1234567890.jpg',
                    },
                },

                CreateAnimalDto: {
                    type: 'object',
                    required: ['name', 'type', 'age'],
                    properties: {
                        name: { type: 'string', example: 'Panda' },
                        type: {
                            type: 'string',
                            enum: ['Dog', 'Cat', 'Rabbit', 'Other'],
                            example: 'Cat'
                        },
                        breed: { type: 'string', example: 'Stray' },
                        age: {
                            type: 'number',
                            format: 'float',
                            example: 2.5
                        },
                        health_status: {
                            type: 'string',
                            enum: ['healthy', 'sick', 'vaccinated', 'unknown'],
                            example: 'healthy'
                        },
                        adoption_status: {
                            type: 'string',
                            enum: ['available', 'pending', 'adopted', 'reserved'],
                            example: 'available'
                        },
                        description: {
                            type: 'string',
                            example: 'Cute black and white cat, very playful'
                        },
                    },
                    example: {
                        name: 'Panda',
                        type: 'Cat',
                        breed: 'Stray',
                        age: 2.5,
                        health_status: 'healthy',
                        adoption_status: 'available',
                        description: 'Cute black and white cat, very playful',
                    },
                },

                UpdateAnimalDto: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Panda' },
                        type: {
                            type: 'string',
                            enum: ['Dog', 'Cat', 'Rabbit', 'Other'],
                            example: 'Cat'
                        },
                        breed: { type: 'string', example: 'Stray' },
                        age: {
                            type: 'number',
                            format: 'float',
                            example: 3
                        },
                        health_status: {
                            type: 'string',
                            enum: ['healthy', 'sick', 'vaccinated', 'unknown'],
                            example: 'vaccinated'
                        },
                        adoption_status: {
                            type: 'string',
                            enum: ['available', 'pending', 'adopted', 'reserved'],
                            example: 'adopted'
                        },
                        description: {
                            type: 'string',
                            example: 'Cute black and white cat, very playful and friendly'
                        },
                    },
                    example: {
                        name: 'Panda',
                        type: 'Cat',
                        breed: 'Stray',
                        age: 3,
                        health_status: 'vaccinated',
                        adoption_status: 'adopted',
                        description: 'Cute black and white cat, very playful and friendly',
                    },
                },

                // ==================== ADOPTION SERVICE ====================
                Adoption: {
                    type: 'object',
                    required: ['userId', 'animalId', 'status'],
                    properties: {
                        _id: { type: 'string', format: 'mongo-id', example: '607f1f77bcf86cd799439015' },
                        userId: {
                            type: 'string',
                            format: 'mongo-id',
                            example: '507f1f77bcf86cd799439011'
                        },
                        animalId: {
                            type: 'string',
                            format: 'mongo-id',
                            example: '507f1f77bcf86cd799439021'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
                            example: 'pending'
                        },
                        requestTime: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00Z'
                        },
                        approvalTime: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-16T14:20:00Z',
                            nullable: true
                        },
                        rejectionTime: {
                            type: 'string',
                            format: 'date-time',
                            example: null,
                            nullable: true
                        },
                        cancelledTime: {
                            type: 'string',
                            format: 'date-time',
                            example: null,
                            nullable: true
                        },
                    },
                    example: {
                        _id: '607f1f77bcf86cd799439015',
                        userId: '507f1f77bcf86cd799439011',
                        animalId: '507f1f77bcf86cd799439021',
                        status: 'pending',
                        requestTime: '2024-01-15T10:30:00Z',
                        approvalTime: null,
                        rejectionTime: null,
                        cancelledTime: null,
                    },
                },

                CreateAdoptionDto: {
                    type: 'object',
                    required: ['animalId'],
                    properties: {
                        animalId: {
                            type: 'string',
                            format: 'mongo-id',
                            example: '507f1f77bcf86cd799439021'
                        },
                    },
                    example: {
                        animalId: '507f1f77bcf86cd799439021',
                    },
                },

                UpdateAdoptionStatusDto: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            enum: ['approved', 'rejected', 'cancelled'],
                            example: 'approved'
                        },
                    },
                    example: {
                        status: 'approved',
                    },
                },

                ScheduleAdoptionDto: {
                    type: 'object',
                    required: ['scheduledDate'],
                    properties: {
                        scheduledDate: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-02-01T15:00:00Z'
                        },
                        notes: {
                            type: 'string',
                            example: 'Meeting at shelter office'
                        },
                    },
                    example: {
                        scheduledDate: '2024-02-01T15:00:00Z',
                        notes: 'Meeting at shelter office',
                    },
                },

                // ==================== CHAT SERVICE ====================
                Message: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', format: 'mongo-id', example: '507f1f77bcf86cd799439031' },
                        roomId: {
                            type: 'string',
                            format: 'mongo-id',
                            example: '507f1f77bcf86cd799439032'
                        },
                        senderId: {
                            type: 'string',
                            example: 'keycloak-user-id-12345'
                        },
                        content: {
                            type: 'string',
                            example: 'Hello! Is Bella still available for adoption?'
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            example: '2024-01-15T10:30:00Z'
                        },
                    },
                    example: {
                        _id: '507f1f77bcf86cd799439031',
                        roomId: '507f1f77bcf86cd799439032',
                        senderId: 'keycloak-user-id-12345',
                        content: 'Hello! Is Bella still available for adoption?',
                        timestamp: '2024-01-15T10:30:00Z',
                    },
                },

                SendMessageDto: {
                    type: 'object',
                    required: ['roomId', 'senderId', 'content'],
                    properties: {
                        roomId: {
                            type: 'string',
                            format: 'mongo-id',
                            example: '507f1f77bcf86cd799439032'
                        },
                        senderId: {
                            type: 'string',
                            example: 'keycloak-user-id-12345'
                        },
                        content: {
                            type: 'string',
                            minLength: 1,
                            maxLength: 5000,
                            example: 'Hi! I am interested in adopting Bella. Can we schedule a visit?'
                        },
                    },
                    example: {
                        roomId: '507f1f77bcf86cd799439032',
                        senderId: 'keycloak-user-id-12345',
                        content: 'Hi! I am interested in adopting Bella. Can we schedule a visit?',
                    },
                },

                // ==================== USER SERVICE ====================
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', format: 'mongo-id', example: '507f1f77bcf86cd799439011' },
                        firstName: { type: 'string', example: 'John' },
                        lastName: { type: 'string', example: 'Doe' },
                        email: { type: 'string', format: 'email', example: 'john.doe@example.com' },
                        phone: {
                            type: 'string',
                            example: '+1234567890',
                            nullable: true
                        },
                        telegramUsername: {
                            type: 'string',
                            example: '@johndoe',
                            nullable: true
                        },
                        avatar: {
                            type: 'string',
                            example: 'user-avatar-1234567890.jpg',
                            nullable: true
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'staff', 'admin'],
                            example: 'user'
                        },
                        adoptionPoints: {
                            type: 'integer',
                            example: 150,
                            description: 'Points earned from adoptions and activities'
                        },
                    },
                    example: {
                        _id: '507f1f77bcf86cd799439011',
                        firstName: 'John',
                        lastName: 'Doe',
                        email: 'john.doe@example.com',
                        phone: '+1234567890',
                        telegramUsername: '@johndoe',
                        avatar: 'user-avatar-1234567890.jpg',
                        role: 'user',
                        adoptionPoints: 150,
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
        tags: [
            { name: 'Health', description: 'Health check endpoints' },
            { name: 'Auth', description: 'Authentication endpoints' },
            { name: 'Animals', description: 'Animal management and adoption listing' },
            { name: 'Adoptions', description: 'Adoption request management' },
            { name: 'Chat', description: 'Real-time chat and messaging' },
            { name: 'Profile', description: 'User profile management' },
        ],
    },
    apis: [
        './src/routes/**/*.ts',
        './dist/routes/**/*.js',
        './src/api/controllers/**/*.ts',
        './dist/api/controllers/**/*.js',
    ],
};

export const swaggerSpec = swaggerJSDoc(options);