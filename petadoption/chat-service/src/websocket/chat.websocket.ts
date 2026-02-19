// chat-service/src/websocket/chat.websocket.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { chatService } from '../services/chat.service';
import { ChatMessage } from '../models/chat.model';
import {ObjectId} from "mongodb";

interface MessageData {
  roomId: ObjectId;
  senderId: string;
  content?: string;
  imageUrl?: string;
}

interface JoinRoomData {
  roomId: string;
  userId: string;
}

export function initializeWebSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  chatService.setSocketIO(io);

  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on('join_room', async (data: JoinRoomData) => {
      const { roomId, userId } = data;
      socket.join(`room_${roomId}`);
      console.log(`User ${userId} joined room ${roomId}`);
      socket.to(`room_${roomId}`).emit('user_joined', { userId, roomId, timestamp: new Date() });
    });

    socket.on('leave_room', (data: JoinRoomData) => {
      const { roomId, userId } = data;
      socket.leave(`room_${roomId}`);
      console.log(`User ${userId} left room ${roomId}`);
      socket.to(`room_${roomId}`).emit('user_left', { userId, roomId, timestamp: new Date() });
    });


    socket.on('send_message', async (data: MessageData) => {
      try {
        const { roomId, senderId, content, imageUrl } = data;
        if (!roomId || !senderId || (!content && !imageUrl)) {
          socket.emit('error', { message: 'content or imageUrl required' });
          return;
        }

        const message: Omit<ChatMessage, '_id'> = {
          roomId: new ObjectId(roomId),
          senderId: senderId,
          content: content || '',
          imageUrl: imageUrl || '',
          timestamp: new Date(),
          read: false,
        };

        const savedMessage = await chatService.saveMessage(message);
        
        io.to(`room_${roomId}`).emit('new_message', savedMessage);
      } catch (err) {
        console.error(err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  console.log('WebSocket server initialized');
  return io;
}

export default initializeWebSocket;
