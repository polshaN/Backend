// api-gateway/src/config/config.ts
import * as dotenv from 'dotenv';

dotenv.config();

export const Config = {
    port: process.env.PORT || 8080,

    services: {
        auth: {
            url: process.env.AUTH_SERVICE_URL || 'http://keycloak:8080',
            path: '/api/auth',
        },

        animals: {
            url: process.env.PETADOPTION_BACKEND_URL || 'http://petadoption-backend:4001',
            path: '/api/animals',
        },

        profile: {
            url: process.env.PROFILE_SERVICE_URL || 'http://profile-service:4002',
            path: '/api/profiles',
        },

        chat: {
            url: process.env.CHAT_SERVICE_URL || 'http://chat-service:4003',
            path: '/api/chat',
        },
        adoption: {
            url: process.env.PETADOPTION_BACKEND_URL || 'http://petadoption-backend:4001', // often same as pet service
            path: '/api/adoptions',
        },
    },

    auth: {
        jwtIssuer: process.env.JWT_ISSUER || 'http://keycloak:8080',
        realm: process.env.KEYCLOAK_REALM || 'PETADOPTION-APP',
        clientId: process.env.KEYCLOAK_CLIENT_ID || 'petadoption-client',
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'petadoption-secret-key-12345', // optional for confidential clients
    },
};
