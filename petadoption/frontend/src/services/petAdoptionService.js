import api from './api.js';

export default {
    getAnimals: () => api.get('/animals').then(res => res.data),
    adoptPet: (petId) => api.post(`/animals/adopt/${petId}`).then(res => res.data)
};