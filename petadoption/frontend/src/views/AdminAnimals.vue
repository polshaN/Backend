<template>
  <div class="admin-animals">
    <div class="header">
      <h1>🐾 Admin Panel - Manage Animals</h1>
      <p>Add new animals and manage photos</p>
    </div>

    <!-- Add Animal Form -->
    <AddAnimalForm />

    <!-- Animals List -->
    <div class="animals-section">
      <h2>All Animals</h2>

      <div v-if="loading" class="loading">Loading animals...</div>

      <div v-else-if="animals.length === 0" class="no-animals">
        <p>No animals added yet. Add one using the form above!</p>
      </div>

      <div v-else class="animals-list">
        <div v-for="animal in animals" :key="animal._id" class="animal-item">
          <!-- Photo -->
          <img
              v-if="animal.photoUrl"
              :src="animal.photoUrl"
              :alt="animal.name"
              class="animal-image"
          />
          <div v-else class="no-image">No Photo</div>

          <!-- Info -->
          <div class="animal-info">
            <h3>{{ animal.name }}</h3>
            <p><strong>Type:</strong> {{ animal.type }}</p>
            <p><strong>Breed:</strong> {{ animal.breed }}</p>
            <p><strong>Age:</strong> {{ animal.age }} years</p>
            <p><strong>Status:</strong> {{ animal.adoption_status }}</p>
          </div>

          <!-- Actions -->
          <div class="animal-actions">
            <button @click="editAnimal(animal._id, { name: animal.name, type: animal.type })" class = "btn-edit">
              ✏️ Edit
            </button>
            <button @click="deleteAnimal(animal._id)" class="btn-delete">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import AddAnimalForm from '../views/AddAnimal.vue';

const animals = ref([]);
const loading = ref(false);

const loadAnimals = async () => {
  loading.value = true;
  try {
    const response = await api.get('/animals');
    animals.value = response.data;
    console.log('✓ Animals loaded:', animals.value.length);
  } catch (error) {
    console.error('Error loading animals:', error);
    alert('Failed to load animals');
  } finally {
    loading.value = false;
  }
};
const editAnimal = async (animal) => {
  const updatedData = {
    name: animal.name,
    type: animal.type,
    breed: animal.breed,
    age: animal.age,
    adoption_status: animal.adoption_status,
    description: animal.description,
     photo: optional
  };

  try {
    let payload;
    if (updatedData.photo) {
      payload = new FormData();
      Object.keys(updatedData).forEach(key => payload.append(key, updatedData[key]));
    } else {
      payload = updatedData;
    }

    const response = await api.put(`/animals/${animal._id}`, payload, {
      headers: updatedData.photo ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });

    const index = animals.value.findIndex(a => a._id === animal._id);
    if (index !== -1) animals.value[index] = response.data;

    alert('Animal info updated successfully!');
  } catch (error) {
    console.error('Failed to update animal:', error);
    alert('Failed to update animal info.');
  }
};

const deleteAnimal = async (id) => {
  if (!confirm('Delete this animal?')) return;

  try {
    await api.delete(`/animals/${id}`);
    console.log('✓ Animal deleted');
    await loadAnimals();
  } catch (error) {
    console.error('Error deleting animal:', error);
    alert('Failed to delete animal');
  }
};

onMounted(loadAnimals);
</script>

<style scoped>
.admin-animals {
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

.animals-section {
  max-width: 1200px;
  margin: 3rem auto 0;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.animals-section h2 {
  color: #333;
  margin-top: 0;
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.loading,
.no-animals {
  text-align: center;
  padding: 2rem;
  color: #999;
  font-size: 1.1rem;
}

.no-animals {
  background: #f5f5f5;
  border-radius: 8px;
}

.animals-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.animal-item {
  background: #f9f9f9;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.animal-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.animal-image,
.no-image {
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #fef3e2 0%, #fff8f0 100%);
  object-fit: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ccc;
  font-size: 0.9rem;
}

.animal-image {
  object-fit: cover;
}

.animal-info {
  padding: 1.5rem;
  flex: 1;
}

.animal-info h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.3rem;
}

.animal-info p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.animal-actions {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 0.5rem;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-edit {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-edit:hover {
  background: #bbdefb;
}

.btn-delete {
  background: #ffebee;
  color: #c62828;
}

.btn-delete:hover {
  background: #ffcdd2;
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 1.8rem;
  }

  .animals-list {
    grid-template-columns: 1fr;
  }

  .animals-section {
    padding: 1rem;
  }
}
</style>