import axios from 'axios';
import { useAuthStore } from '../stores/authStore.js';

const getBaseURL = () => {
    // Use VITE_API_BASE_URL if set (for Docker), otherwise localhost for development
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL;
    }
    return 'http://localhost:4000/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
    const authStore = useAuthStore();

    // Check authStore first, then localStorage, then sessionStorage
    const token = authStore.token ||
        localStorage.getItem('authToken') ||
        sessionStorage.getItem('authToken');

    console.log('API Request:', config.url, 'Token:', token ? 'exists' : 'missing');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const authStore = useAuthStore();
            authStore.logout();
        }
        return Promise.reject(error);
    }
);

export default api;