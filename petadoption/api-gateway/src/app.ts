// api-gateway/src/app.ts
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import axios from 'axios';

import { Config } from './config/config';
import { swaggerSpec } from './config/swagger';
import { loggingMiddleware } from './middleware/logging.middleware';
import { errorMiddleware } from './middleware/error.middleware';

import { keycloakMiddleware } from './middleware/keycloak.middleware';
import authRoutes from './routes/auth.routes';
import petadoptionRoutes from './routes/petadoption.routes';
import profileRoutes from './routes/profile.routes';
import chatRoutes from "./routes/chat.routes";

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Skip JSON/URL parsing for multipart requests - they will be forwarded as streams
app.use((req, res, next) => {
    if (req.is('multipart/form-data')) {
        return next();
    }
    express.json()(req, res, next);
});

app.use((req, res, next) => {
    if (req.is('multipart/form-data')) {
        return next();
    }
    express.urlencoded({ extended: true })(req, res, next);
});

app.use(loggingMiddleware);

// ==================== SWAGGER ====================
app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
        explorer: true,
        customSiteTitle: 'PetAdoption API Gateway',
        customCss: '.swagger-ui .topbar { display: none }',
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
            filter: true,
        },
    })
);

// ==================== HEALTH CHECK ====================
app.get('/health', (_req, res) => {
    res.status(200).json({
        service: 'api-gateway',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            auth: Config.services.auth.url,
            animals: Config.services.animals.url,
            adoption: Config.services.adoption.url,
            profile: Config.services.profile.url,
            chat: Config.services.chat.url,
        },
    });
});

// ==================== ROOT ====================
app.get('/', (_req, res) => {
    res.json({
        message: 'Welcome to PetAdoption API Gateway',
        version: '1.0.0',
        documentation: '/api-docs',
        services: {
            auth: Config.services.auth.path,
            animals: Config.services.animals.path,
            adoption: Config.services.adoption.path,
            profile: Config.services.profile.path,
            chat: Config.services.chat.path,
        },
    });
});

// ==================== STATIC FILES PROXY ====================
// Proxy /uploads requests to backend
app.use('/uploads', async (req, res) => {
    try {
        const response = await axios.get(
            `${Config.services.animals.url}${req.path}`,
            { responseType: 'stream' }
        );
        res.set(response.headers);
        response.data.pipe(res);
    } catch (error: any) {
        res.status(error.response?.status || 404).json({
            error: 'File not found',
            message: error.message
        });
    }
});

// ==================== ROUTES ====================

// PUBLIC ROUTES (no authentication required)
app.use('/api/auth', authRoutes);

// PROTECTED ROUTES (require Keycloak token)
// Profile must come BEFORE animals to avoid route conflicts
app.use('/api/profile', keycloakMiddleware, profileRoutes);
app.use('/api', keycloakMiddleware, petadoptionRoutes);  // ← Mount at /api so all adoption and animal routes work
app.use('/api/chat', keycloakMiddleware, chatRoutes);
// ==================== 404 HANDLER ====================
app.use((_req, res) => {
    res.status(404).json({
        code: 'not_found',
        message: 'Route not found',
        statusCode: 404,
        availableRoutes: [
            '/api/auth/*',
            '/api/animals/*',
            '/api/adoptions/*',
            '/api/profile/*',
            '/api/chat/*',
        ],
    });
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use(errorMiddleware);

export default app;