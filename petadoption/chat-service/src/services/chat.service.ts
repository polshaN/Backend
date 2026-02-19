// chat-service/src/services/chat.service.ts
import { Server as SocketIOServer } from 'socket.io';
import { ObjectId, Collection } from 'mongodb';
import {
    getMessagesCollection,
    getRoomsCollection,
    ChatMessage,
    ChatRoom
} from '../models/chat.model';

export const chatService = {
    io: null as SocketIOServer | null,

    setSocketIO(io: SocketIOServer) {
        this.io = io;
    },

    get messages_collection(): Collection<ChatMessage> {
        return getMessagesCollection();
    },

    get rooms_collection(): Collection<ChatRoom> {
        return getRoomsCollection();
    },

    async getMessageHistory(roomId: string, limit: number = 50) {
        const messages = await this.messages_collection
            .find({ roomId: new ObjectId(roomId) })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();

        return messages.reverse();
    },

    async saveMessage(message: Omit<ChatMessage, '_id'>) {
        const messageToSave = {
            ...message,
            timestamp: message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp),
            roomId: message.roomId instanceof ObjectId ? message.roomId : new ObjectId(message.roomId),
        };

        const result = await this.messages_collection.insertOne(messageToSave);

        const savedMessage: ChatMessage = {
            _id: result.insertedId,
            ...messageToSave
        };

        console.log('Message saved:', savedMessage);

        if (this.io) {
            this.io.to(`room_${messageToSave.roomId}`).emit('new_message', savedMessage);
        }

        return savedMessage;
    },

    async deleteMessage(id: string) {
        return this.messages_collection.deleteOne({ _id: new ObjectId(id) });
    },

    async createRoom(participants: string[]): Promise<ChatRoom> {
        const now = new Date();
        const room: Omit<ChatRoom, '_id'> = {
            participants,
            messages: [],
            createdAt: now,
            updatedAt: now,
        };
        const result = await this.rooms_collection.insertOne(room);
        return { _id: result.insertedId, ...room };
    },

    async getRoom(roomId: string) {
        return this.rooms_collection.findOne({ _id: new ObjectId(roomId) });
    },

    async addUserToRoom(roomId: string, userId: string) {
        return this.rooms_collection.updateOne(
            { _id: new ObjectId(roomId) },
            { $addToSet: { participants: userId }, $set: { updatedAt: new Date() } }
        );
    },

    async getRoomsForUser(userId: string) {
        return this.rooms_collection.find({ participants: userId }).toArray();
    },
};