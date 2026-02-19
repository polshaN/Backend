// chat-service/src/server.ts
import 'reflect-metadata';
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import { ChatController } from './api/controllers/chat.controller';
import initializeWebSocket from './websocket/chat.websocket';
import { apiErrorHandler } from './middleware/error.middleware';
import { loggingMiddleware } from './middleware/logging.middleware';
import { setupSwagger } from './config/swagger';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json());
app.use(loggingMiddleware);

app.use(cors({
    origin: [ 'http://localhost:4003'],
    credentials: true
}));

// Swagger docs
setupSwagger(app);


const chatController = new ChatController();


app.get('/api/chat/history/:id', (req, res, next) => chatController.getHistory(req, res).catch(next));
app.post('/api/chat/message', (req, res, next) => chatController.sendMessage(req, res).catch(next));
app.delete('/api/chat/message/:id', (req, res, next) => chatController.deleteMessage(req, res).catch(next));


app.get('/health', (req, res) => res.json({
    status: 'ok',
    service: 'chat-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
}));


app.use(apiErrorHandler);


const io = initializeWebSocket(httpServer);

export { app, httpServer, io };
