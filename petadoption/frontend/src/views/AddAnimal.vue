<template>
  <div class="add-animal-container">
    <h2>Add New Animal</h2>

    <form @submit.prevent="submitForm" enctype="multipart/form-data">
      <!-- Photo Upload -->
      <div class="form-group">
        <label>Photo *</label>
        <div class="file-input-wrapper">
          <input
              type="file"
              ref="fileInput"
              @change="onFileSelected"
              accept="image/*"
              required
          />
          <p v-if="selectedFileName" class="file-name">✓ {{ selectedFileName }}</p>
          <p v-if="fileError" class="error">{{ fileError }}</p>
        </div>
      </div>

      <!-- Name -->
      <div class="form-group">
        <label>Animal Name *</label>
        <input
            v-model="form.name"
            type="text"
            placeholder="e.g., Orange Cat"
            required
        />
      </div>

      <!-- Type/Species -->
      <div class="form-group">
        <label>Type *</label>
        <select v-model="form.type" required>
          <option disabled value="">Select Type</option>
          <option value="Dog">Dog</option>
          <option value="Cat">Cat</option>
          <option value="Rabbit">Rabbit</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <!-- Breed -->
      <div class="form-group">
        <label>Breed *</label>
        <input
            v-model="form.breed"
            type="text"
            placeholder="e.g., Tabby"
            required
        />
      </div>

      <!-- Age -->
      <div class="form-group">
        <label>Age (years) *</label>
        <input
            v-model.number="form.age"
            type="number"
            step="0.5"
            placeholder="e.g., 3"
            required
        />
      </div>

      <!-- Health Status -->
      <!-- Health Status -->
      <div class="form-group">
        <label>Health Status</label>
        <select v-model="form.health_status" required>
          <option disabled value="">Select Health Status</option>
          <option value="healthy">Healthy</option>
          <option value="sick">Sick</option>
          <option value="vaccinated">Vaccinated</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>


      <!-- Adoption Status -->
      <!-- Adoption Status -->
      <div class="form-group">
        <label>Adoption Status</label>
        <select v-model="form.adoption_status" required>
          <option disabled value="">Select Status</option>
          <option value="Available">Available</option>
          <option value="Pending">Pending</option>
          <option value="Adopted">Adopted</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>


      <!-- Description -->
      <div class="form-group">
        <label>Description</label>
        <textarea
            v-model="form.description"
            placeholder="Tell us about this animal..."
            rows="4"
        ></textarea>
      </div>

      <!-- Buttons -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-reset">
          Clear
        </button>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Adding...' : 'Add Animal' }}
        </button>
      </div>

      <p v-if="successMessage" class="success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const form = ref({
  name: '',
  type: '',
  breed: '',
  age: null,
  health_status: 'healthy',
  adoption_status: 'Available',
  description: ''
});

const fileInput = ref(null);
const selectedFileName = ref('');
const selectedFile = ref(null);
const fileError = ref('');
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const onFileSelected = (event) => {
  const file = event.target.files?.[0];
  fileError.value = '';
  successMessage.value = '';

  if (file) {
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      fileError.value = '❌ File must be less than 5MB';
      selectedFile.value = null;
      selectedFileName.value = '';
      return;
    }

    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      fileError.value = '❌ Only JPG, PNG, WebP, and GIF allowed';
      selectedFile.value = null;
      selectedFileName.value = '';
      return;
    }

    selectedFile.value = file;
    selectedFileName.value = file.name;
    console.log('✓ File selected:', file.name);
  }
};

const resetForm = () => {
  form.value = {
    name: '',
    type: '',
    breed: '',
    age: null,
    health_status: 'healthy',
    adoption_status: 'Available',
    description: ''
  };
  fileInput.value.value = '';
  selectedFile.value = null;
  selectedFileName.value = '';
  fileError.value = '';
  successMessage.value = '';
  errorMessage.value = '';
};
const submitForm = async () => {
  if (!selectedFile.value) {
    fileError.value = '❌ Please select a photo';
    return;
  }

  if (!form.value.name || !form.value.type || !form.value.breed || form.value.age === null) {
    errorMessage.value = '❌ Please fill in all required fields';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  try {
    // Map frontend form to backend enums
    const HealthStatusMap = {
      healthy: 'healthy',
      sick: 'sick',
      vaccinated: 'vaccinated',
      unknown: 'unknown'
    };

    const AdoptionStatusMap = {
      Available: "Available",
      Pending: "Pending",
      Adopted: "Adopted",
      Approved: "Approved",
      Rejected: "Rejected",
      Cancelled: "Cancelled"
    };

    const formData = new FormData();
    formData.append('name', form.value.name.trim());
    formData.append('type', form.value.type.trim());
    formData.append('breed', form.value.breed.trim());
    formData.append('age', form.value.age); // still string in FormData
    formData.append('adoption_status', AdoptionStatusMap[form.value.adoption_status]);
    formData.append('health_status', HealthStatusMap[form.value.health_status]);
    formData.append('description', form.value.description?.trim() || '');
    formData.append('photo', selectedFile.value); // the file itself

    console.log('Submitting animal:', {
      name: form.value.name,
      type: form.value.type,
      breed: form.value.breed,
      age: Number(form.value.age),
      health_status: HealthStatusMap[form.value.health_status],
      adoption_status: AdoptionStatusMap[form.value.adoption_status],
      photo: selectedFile.value.name
    });

    const response = await api.post('/animals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    console.log('✓ Animal created:', response.data);
    successMessage.value = `✓ ${form.value.name} added successfully!`;

    // Clear form after success
    setTimeout(() => resetForm(), 2000);

  } catch (error) {
    console.error('Error:', error);
    errorMessage.value = `❌ ${error.response?.data?.message || error.message}`;
  } finally {
    loading.value = false;
  }
};

</script>

<style scoped>
.add-animal-container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.add-animal-container h2 {
  margin-top: 0;
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.8rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

input,
select,
textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-family: inherit;
  font-size: 1rem;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #ff7f50;
  box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
}

.file-input-wrapper {
  position: relative;
}

input[type="file"] {
  padding: 0.75rem;
  border: 2px dashed #ff7f50;
  background: #fef3e2;
  cursor: pointer;
}

input[type="file"]::-webkit-file-upload-button {
  background: #ff7f50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  margin-right: 0.5rem;
}

input[type="file"]::-webkit-file-upload-button:hover {
  background: #ff6b35;
}

.file-name {
  margin-top: 0.5rem;
  color: #28a745;
  font-size: 0.9rem;
  font-weight: 600;
}

.error {
  color: #721c24;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  background: #f8d7da;
  padding: 0.5rem;
  border-radius: 4px;
}

.success {
  color: #155724;
  font-size: 0.95rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: #d4edda;
  border-radius: 4px;
  font-weight: 600;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  justify-content: flex-end;
}

.btn-reset,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-reset {
  background: #e0e0e0;
  color: #333;
}

.btn-reset:hover {
  background: #d0d0d0;
}

.btn-submit {
  background: #ff7f50;
  color: white;
  flex: 1;
}

.btn-submit:hover:not(:disabled) {
  background: #ff6b35;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 127, 80, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

textarea {
  resize: vertical;
}

@media (max-width: 600px) {
  .add-animal-container {
    margin: 1rem;
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-reset,
  .btn-submit {
    width: 100%;
  }
}
</style>