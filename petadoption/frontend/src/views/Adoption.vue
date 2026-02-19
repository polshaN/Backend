<template>
  <div class="adoption">
    <div class="header">
      <h1>🐾 Available Pets for Adoption</h1>
      <p>Find your perfect companion</p>
    </div>

    <div class="pets-container">
      <div v-if="loading" class="loading">Loading animals...</div>

      <div v-else-if="pets.length === 0" class="no-pets">
        <p>No pets available for adoption at the moment.</p>
      </div>

      <div v-else class="pets-grid">
        <div v-for="pet in pets" :key="pet._id" class="pet-card">
          <!-- Photo -->
          <div class="pet-image-container">
            <img 
              v-if="pet.photoUrl" 
              :src="pet.photoUrl" 
              :alt="pet.name"
              class="pet-image"
            />
            <div v-else class="no-image">No Photo</div>
          </div>

          <!-- Info -->
          <div class="pet-info">
            <h3>{{ pet.name }}</h3>
            <p><strong>Type:</strong> {{ pet.type }}</p>
            <p><strong>Breed:</strong> {{ pet.breed }}</p>
            <p><strong>Age:</strong> {{ pet.age }} years</p>
            <p><strong>Status:</strong> {{ pet.adoption_status }}</p>
            <p v-if="pet.description" class="description">{{ pet.description }}</p>
          </div>

          <!-- Actions -->
          <div class="pet-actions">
            <button 
              @click="adoptPet(pet._id)" 
              :disabled="pet.adoption_status !== 'Available'"
              class="btn-adopt"
            >
              {{ pet.adoption_status !== 'Available' ? 'Not Available' : 'Adopt Now' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api.js';

const pets = ref([]);
const loading = ref(false);

const loadPets = async () => {
  loading.value = true;
  try {
    const response = await api.get('/animals');
    pets.value = response.data;
    console.log('✓ Pets loaded:', pets.value.length, 'pets');
    pets.value.forEach(pet => {
      console.log(`  - ${pet.name}: photoUrl =`, pet.photoUrl);
    });
  } catch (error) {
    console.error('Error loading animals:', error);
  } finally {
    loading.value = false;
  }
};

const adoptPet = async (id) => {
  try {
    await api.post(`/adoptions`, { animalId: id });
    alert('Your adoption request is pending staff review.');
    const pet = pets.value.find(p => p._id === id);
    if (pet) {
      pet.adoption_status = 'Pending';
    }
  } catch (error) {
    console.error('Adoption failed:', error);
    alert('Failed to request adoption. Please try again.');
  }
};

onMounted(loadPets);
</script>

<style scoped>
.adoption {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef3e2 0%, #fff8f0 100%);
  padding: 2rem 1rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  color: #333;
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
}

.header p {
  color: #666;
  font-size: 1.1rem;
}

.pets-container {
  max-width: 1200px;
  margin: 0 auto;
}

.loading,
.no-pets {
  text-align: center;
  padding: 3rem 2rem;
  background: white;
  border-radius: 12px;
  color: #666;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}

.pet-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.pet-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.pet-image-container {
  width: 100%;
  height: 200px;
  background: #f5f0e1;
  overflow: hidden;
}

.pet-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  color: #999;
  font-size: 1rem;
}

.pet-info {
  padding: 1.5rem;
  flex: 1;
}

.pet-info h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.3rem;
}

.pet-info p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.95rem;
}

.pet-info p strong {
  color: #333;
}

.description {
  margin-top: 1rem;
  font-style: italic;
  color: #777;
  font-size: 0.9rem;
}

.pet-actions {
  padding: 0 1.5rem 1.5rem 1.5rem;
}

.btn-adopt {
  width: 100%;
  padding: 0.75rem 1rem;
  background: #ff7f50;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: background 0.3s ease;
}

.btn-adopt:hover:not(:disabled) {
  background: #ff6b35;
}

.btn-adopt:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
