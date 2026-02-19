import { defineStore } from 'pinia';
import authService from '../services/authService.js';
import api from "./api.js";

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
        refreshToken: null,
        expiresIn: null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        async login(credentials) {
            try {
                const data = await authService.login(credentials.email, credentials.password);
                this.user = data.user;
                this.token = data.accessToken;
                this.refreshToken = data.refreshToken;
                this.expiresIn = data.expiresIn;

                // Save to localStorage
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('refreshToken', this.refreshToken);
            } catch (error) {
                console.error('Login failed:', error);
                throw error;
            }
        },

        logout() {
            this.user = null;
            this.token = null;
            this.refreshToken = null;
            this.expiresIn = null;

            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
        },

        restoreAuth() {
            const token = localStorage.getItem('authToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (token && refreshToken) {
                this.token = token;
                this.refreshToken = refreshToken;
            }
        },
    },
});
export default {
    login: (email, password) => api.post('/auth/login', { email, password }).then(res => res.data),
    logout: () => api.post('/auth/logout'),
    refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }).then(res => res.data),
};