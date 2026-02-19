<template>
  <div class="profile-container">

    <div class="profile-content">
      <div class="user-section">
        <h2>User Information</h2>
        <div class="user-info">
          <p><strong>Email:</strong> {{ userEmail || 'N/A' }}</p>
          <p><strong>Username:</strong> {{ authStore.user?.username || 'N/A' }}</p>
          </div>
      </div>

      <!-- My Adoptions -->
      <div class="adoptions-section">
        <h2>My Adoption Requests</h2>

        <div v-if="loadingAdoptions" class="loading">
          Loading adoptions...
        </div>

        <div v-else-if="adoptions.length === 0" class="no-data">
          <p>You haven't adopted any animals yet.</p>
          <router-link to="/animals" class="btn-link">Browse Animals</router-link>
        </div>

        <div v-else class="adoptions-grid">
          <div v-for="adoption in adoptions" :key="adoption._id" class="adoption-card">
            <div class="adoption-header">
              <h3>{{ adoption.animalName }}</h3>
              <span :class="['status', adoption.status]">
                {{ formatStatus(adoption.status) }}
              </span>
            </div>

            <div class="adoption-details">
              <p><strong>Type:</strong> {{ adoption.animalType }}</p>
              <p><strong>Breed:</strong> {{ adoption.animalBreed }}</p>
              <p><strong>Age:</strong> {{ adoption.animalAge }} years</p>
              <p><strong>Status:</strong> {{ formatStatus(adoption.status) }}</p>
              <p v-if="adoption.status === 'scheduled' && adoption.scheduledTime">
                <strong>Interview Date:</strong> {{ formatDate(adoption.scheduledTime) }}
              </p>
              <p v-if="adoption.status === 'scheduled' && adoption.scheduledTime">
                <strong>Notes:</strong> {{ adoption.notes }}
              </p>
              <p><strong>Requested:</strong> {{ formatDate(adoption.requestTime) }}</p>
              <p v-if="adoption.approvalTime">
                <strong>Approved:</strong> {{ formatDate(adoption.approvalTime) }}
              </p>
              <p v-if="adoption.rejectionTime">
                <strong>Rejected:</strong> {{ formatDate(adoption.rejectionTime) }}
              </p>
              <p v-if="adoption.cancelledTime">
                <strong>Cancelled:</strong> {{ formatDate(adoption.cancelledTime) }}
              </p>
            </div>

            <div class="adoption-actions">
              <button
                  v-if="adoption.status === 'pending_request'"
                  @click="cancelAdoption(adoption._id)"
                  class="btn btn-danger"
              >
                Cancel Request
              </button>
              <button
                  v-else-if="adoption.status === 'approved'"
                  class="btn btn-success disabled"
              >
                Approved ✓
              </button>
              <button
                  v-else-if="adoption.status === 'rejected'"
                  class="btn btn-danger disabled"
              >
                Rejected
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';
import { useNotificationStore } from '../stores/notificationStore.js';
const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const router = useRouter();

const adoptions = ref([]);
const loadingAdoptions = ref(true);

const userEmail = computed(() => {
  // Try to get from auth store first
  if (authStore.user?.email) return authStore.user.email;
  // If not available, decode from localStorage or get from profile
  try {
    const token = localStorage.getItem('authToken');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.email || payload.preferred_username || 'N/A';
    }
  } catch (e) {
    console.log('Could not decode token');
  }
  return 'N/A';
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (e) {
    return dateString;
  }
};

const formatStatus = (status) => {
  const statusMap = {
    pending_request: 'Pending Review',
    scheduled: 'Interview Scheduled',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    adopted: 'Adopted',
  };

  return statusMap[status] || status;
};
const loadProfile = async () => {
  try {
    loadingAdoptions.value = true;
    console.log('Loading profile...');
    const response = await api.get('/profile');

    let userAdoptions = response.data.adoptions || [];

    if (!Array.isArray(userAdoptions) && Array.isArray(response.data)) {
      userAdoptions = response.data;
    }

    // ✅ Only show relevant statuses
    adoptions.value = userAdoptions
        .filter(a =>
            ["pending_request", "scheduled", "approved", "rejected", "cancelled", "adopted"].includes(a.status)
            && a.animalName // remove adoptions with missing animal info
        );
    notificationStore.setAdoptions(adoptions.value);

    console.log('Adoptions loaded:', adoptions.value);
  } catch (error) {
    console.error('Failed to load profile:', error);
    adoptions.value = [];
  } finally {
    loadingAdoptions.value = false;
  }
};

const cancelAdoption = async (adoptionId) => {
  if (!confirm('Are you sure you want to cancel this adoption request?')) return;

  try {
    await api.delete(`/adoptions/${adoptionId}`);
    adoptions.value = adoptions.value.filter(a => a._id !== adoptionId);
    alert('Adoption request cancelled');
  } catch (error) {
    console.error('Failed to cancel adoption:', error);
    alert('Failed to cancel adoption');
  }
};


onMounted(loadProfile);
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef3e2 0%, #fff8f0 100%);
}

.profile-header {
  background: linear-gradient(135deg, #ff7f50 0%, #ff6b35 100%);
  color: white;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.profile-header h1 {
  margin: 0;
  font-size: 2rem;
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.profile-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.user-section,
.adoptions-section {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-section h2,
.adoptions-section h2 {
  color: #ff7f50;
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #ff7f50;
  padding-bottom: 0.5rem;
}

.user-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.user-info p {
  margin: 0.5rem 0;
  color: #333;
}

.loading,
.no-data {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.btn-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #ff7f50;
  color: white;
  text-decoration: none;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.btn-link:hover {
  background: #ff6b35;
  transform: translateY(-2px);
}

.adoptions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.adoption-card {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.adoption-card:hover {
  box-shadow: 0 4px 12px rgba(255, 127, 80, 0.2);
  transform: translateY(-4px);
}

.adoption-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.adoption-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.25rem;
}

.status {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status.pending {
  background: #fff3cd;
  color: #856404;
}

.status.scheduled {
  background: #d4edda;
  color: #155724;
}

.status.approved {
  background: #d4edda;
  color: #155724;
}

.status.rejected {
  background: #f8d7da;
  color: #721c24;
}

.adoption-details {
  margin-bottom: 1.5rem;
  color: #666;
  font-size: 0.95rem;
}

.adoption-details p {
  margin: 0.5rem 0;
}

.adoption-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-danger {
  background: #f8d7da;
  color: #721c24;
}

.btn-danger:hover {
  background: #f5c6cb;
  transform: translateY(-2px);
}

.btn-success {
  background: #d4edda;
  color: #155724;
}

.btn-success.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .adoptions-grid {
    grid-template-columns: 1fr;
  }
}
</style>