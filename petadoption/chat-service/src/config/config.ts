// chat-service/src/config/index.ts
import dotenv from 'dotenv';
dotenv.config();

export const Config = {
    port: process.env.PORT ? parseInt(process.env.PORT) : 4003,
    mongoUrl: process.env.MONGO_URL || 'mongodb://admin:admin@localhost:27017/chatdb?authSource=admin',
};
