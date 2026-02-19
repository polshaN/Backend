import api from './api.js';

export default {
    getUserProfile: () => api.get('/profile').then(res => res.data),
};