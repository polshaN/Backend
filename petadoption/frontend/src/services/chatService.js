import io from 'socket.io-client';
import api from './api.js';

const SOCKET_URL = 'http://localhost:4003'; // Direct to chat-service

let socket = null;
let listeners = [];

export default {
    initSocket: (roomId, userId) => {
        if (socket && socket.connected) {
            console.log('Socket already connected');
            return socket;
        }

        console.log('Initializing socket connection...');
        socket = io(SOCKET_URL, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
            console.log('WebSocket connected:', socket.id);
            socket.emit('join_room', { roomId, userId });
        });

        socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
        });

        socket.on('user_joined', (data) => {
            console.log('User joined:', data);
            listeners.forEach(cb => cb({ type: 'user_joined', data }));
        });

        socket.on('user_left', (data) => {
            console.log('User left:', data);
            listeners.forEach(cb => cb({ type: 'user_left', data }));
        });

        socket.on('new_message', (message) => {
            console.log('New message received:', message);
            listeners.forEach(cb => cb({ type: 'new_message', data: message }));
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return socket;
    },

    disconnectSocket: () => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    },

    onSocketEvent: (callback) => {
        listeners.push(callback);
        return () => {
            listeners = listeners.filter(cb => cb !== callback);
        };
    },

    getHistory: (roomId, limit = 50) =>
        api.get(`/chat/history/${roomId}`, { params: { limit } }).then(res => res.data),

    sendMessage: (payload) =>
        api.post('/chat/message', payload).then(res => res.data),

    sendMessageSocket: (roomId, senderId, content) => {
        if (!socket || !socket.connected) {
            console.warn('Socket not connected');
            return;
        }
        socket.emit('send_message', { roomId, senderId, content });
    },

    // Get socket instance
    getSocket: () => socket,
};