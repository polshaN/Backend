<template>
  <div class="staff-container">
    <!-- Header -->
    <div class="staff-header">
      <h1>Staff Dashboard - Adoption Management</h1>
      <div class="header-info">
        <span>Logged in as: <strong>{{ userEmail }}</strong></span>
        <span class="role-badge">{{ userRole }}</span>
      </div>
    </div>

    <div class="staff-content">
      <!-- Tabs -->
      <div class="tabs">
        <button
            v-for="tab in tabs"
            :key="tab"
            @click="activeTab = tab"
            :class="['tab-button', { active: activeTab === tab }]"
        >
          {{ tab }} <span class="badge">{{ getTabCount(tab) }}</span>
        </button>
      </div>

      <!-- Tab content -->
      <div v-if="loadingAdoptions" class="loading">Loading adoptions...</div>

      <div v-else>
        <!-- Pending -->
        <div v-show="activeTab === 'Pending'" class="tab-content">
          <h2>Pending Adoption Requests</h2>
          <div v-if="pendingAdoptions.length === 0" class="no-data">
            No pending adoption requests
          </div>
          <div v-else class="adoptions-list">
            <div
                v-for="adoption in pendingAdoptions"
                :key="adoption._id"
                class="adoption-item"
            >
              <div class="adoption-info">
                <h3>{{ adoption.animalName }}</h3>
                <p><strong>Adopter:</strong> {{ adoption.userName }}</p>
                <p><strong>Email:</strong> {{ adoption.userEmail }}</p>
                <p><strong>Type:</strong> {{ adoption.animalType }} - {{ adoption.animalBreed }}</p>
                <p><strong>Requested:</strong> {{ formatDate(adoption.requestTime) }}</p>
              </div>
              <div class="adoption-actions">
                <button @click="openScheduleModal(adoption)" class="btn btn-schedule">
                  Schedule Interview
                </button>
                <button @click="rejectAdoption(adoption._id)" class="btn btn-reject">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Scheduled -->
        <div v-show="activeTab === 'Scheduled'" class="tab-content">
          <h2>Scheduled Interviews</h2>
          <div v-if="scheduledAdoptions.length === 0" class="no-data">
            No scheduled interviews
          </div>
          <div v-else class="adoptions-list">
            <div
                v-for="adoption in scheduledAdoptions"
                :key="adoption._id"
                class="adoption-item scheduled"
            >
              <div class="adoption-info">
                <h3>{{ adoption.animalName }}</h3>
                <p><strong>Adopter:</strong> {{ adoption.userName }}</p>
                <p><strong>Email:</strong> {{ adoption.userEmail }}</p>
                <p><strong>Type:</strong> {{ adoption.animalType }} - {{ adoption.animalBreed }}</p>
                <p v-if="adoption.scheduledTime">
                  <strong>Interview:</strong> {{ formatDate(adoption.scheduledTime) }}
                </p>
                <p v-if="adoption.notes">
                  <strong>Notes:</strong> {{ adoption.notes }}
                </p>

              </div>
              <div class="adoption-actions">
                <button @click="approveAdoption(adoption._id)" class="btn btn-approve">
                  Approve Adoption
                </button>
                <button @click="reschedule(adoption)" class="btn btn-reschedule">Reschedule</button>
                <button @click="cancelAdoption(adoption._id)" class="btn btn-reject">Cancel</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Approved -->
        <div v-show="activeTab === 'Approved'" class="tab-content">
          <h2>Approved Adoptions</h2>
          <div v-if="approvedAdoptions.length === 0" class="no-data">
            No approved adoptions
          </div>
          <div v-else class="adoptions-list">
            <div
                v-for="adoption in approvedAdoptions"
                :key="adoption._id"
                class="adoption-item approved"
            >
              <div class="adoption-info">
                <h3>{{ adoption.animalName }}</h3>
                <p><strong>Adopter:</strong> {{ adoption.userName }}</p>
                <p><strong>Email:</strong> {{ adoption.userEmail }}</p>
                <p><strong>Type:</strong> {{ adoption.animalType }} - {{ adoption.animalBreed }}</p>
                <p><strong>Approved:</strong> {{ formatDate(adoption.approvalTime) }}</p>
              </div>
              <div class="adoption-actions">
                <button @click="cancelAdoption(adoption._id)" class="btn btn-reject">
                  Cancel Approval
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div v-if="showScheduleModal" class="modal-overlay" @click.self="closeScheduleModal">
      <div class="modal">
        <div class="modal-header">
          <h2>Schedule Interview</h2>
          <button @click="closeScheduleModal" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>User: {{ selectedAdoption?.userName }}</label>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date:</label>
              <input type="date" v-model="interviewDate" required />
            </div>
            <div class="form-group">
              <label>Time:</label>
              <select v-model="interviewTime" required>
                <option v-for="t in availableTimes" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="notes">Notes:</label>
            <textarea id="notes" v-model="interviewNotes" rows="4" placeholder="Add notes..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeScheduleModal" class="btn btn-secondary">Cancel</button>
          <button @click="scheduleInterview" class="btn btn-success">Schedule</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';

const authStore = useAuthStore();
const router = useRouter();

const adoptions = ref([]);
const loadingAdoptions = ref(true);
const activeTab = ref('Pending');
const tabs = ['Pending', 'Scheduled', 'Approved'];

const showScheduleModal = ref(false);
const selectedAdoption = ref(null);
const interviewDate = ref('');
const interviewTime = ref('');
const interviewNotes = ref('');

const availableTimes = ref([
  '09:00','09:15','09:30','09:45','10:00','10:15','10:30','10:45','11:00','11:15','11:30','11:45'
  ,'12:00','12:15','12:30','12:45','13:00','13:15','13:30','13:45','14:00','14:15','14:30','14:45','15:00','16:00'
]);

const userEmail = computed(() => authStore.user?.email || 'Unknown');
const userRole = computed(() => {
  const roles = authStore.user?.roles || [];
  return roles.includes('staff') ? 'Staff' : roles.includes('admin') ? 'Admin' : 'User';
});

const pendingAdoptions = computed(() =>
    adoptions.value.filter(a => a.status === 'pending_request')
);
const scheduledAdoptions = computed(() =>
    adoptions.value.filter(a => a.status === 'scheduled')
);
const approvedAdoptions = computed(() =>
    adoptions.value.filter(a => a.status === 'approved')
);

const formatDate = date => date ? new Date(date).toLocaleString() : 'N/A';
const getTabCount = tab =>
    tab === 'Pending'
        ? pendingAdoptions.value.length
        : tab === 'Scheduled'
            ? scheduledAdoptions.value.length
            : approvedAdoptions.value.length;

const loadAdoptions = async () => {
  try {
    loadingAdoptions.value = true;
    const response = await api.get('/adoptions/admin');
    adoptions.value = response.data || [];
  } catch (e) {
    console.error(e);
    adoptions.value = [];
  } finally {
    loadingAdoptions.value = false;
  }
};

const openScheduleModal = adoption => {
  selectedAdoption.value = adoption;

  if (adoption.interviewTime) {
    const dt = new Date(adoption.interviewTime);
    interviewDate.value = dt.toISOString().slice(0, 10);
    interviewTime.value = dt.toTimeString().slice(0, 5);
  } else {
    interviewDate.value = '';
    interviewTime.value = '';
  }

  interviewNotes.value = adoption.notes || '';
  showScheduleModal.value = true;
};

const closeScheduleModal = () => {
  showScheduleModal.value = false;
  selectedAdoption.value = null;
};

// FIXED: Changed status from 'pending' to 'scheduled'
const scheduleInterview = async () => {
  if (!interviewDate.value || !interviewTime.value) {
    return alert('Select date & time');
  }

  try {
    const interviewDateTime = new Date(
        `${interviewDate.value}T${interviewTime.value}:00`
    );

    await api.put(
        `/adoptions/${selectedAdoption.value._id}/schedule`,
        {
          interviewTime: interviewDateTime,
          notes: interviewNotes.value
        }
    );

    closeScheduleModal();
    await loadAdoptions();
  } catch (e) {
    console.error(e);
    alert('Failed to schedule interview');
  }
};


const approveAdoption = async id => {
  if (!confirm('Approve this adoption?')) return;

  try {
    await api.put(`/adoptions/${id}/approve`);
    await loadAdoptions();
  } catch (e) {
    console.error(e);
  }
};


const rejectAdoption = async id => {
  if (!confirm('Reject this adoption?')) return;

  try {
    await api.put(`/adoptions/${id}/reject`);
    await loadAdoptions();
  } catch (e) {
    console.error(e);
    alert('Failed to reject adoption');
  }
};


// FIXED: Changed status from 'available' to 'pending_request' to move back to Pending tab
const cancelAdoption = async id => {
  if (!confirm('Cancel this adoption?')) return;
  try {
    await api.put(`/adoptions/${id}/cancel`);
    await loadAdoptions();
  } catch (e) {
    console.error(e);
    alert('Failed to cancel adoption');
  }
};

const reschedule = adoption => openScheduleModal(adoption);
onMounted(loadAdoptions);
</script>


<style scoped>
.staff-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fef3e2 0%, #fff8f0 100%);
}

.staff-header {
  background: #fef3e2;
  color: black;
  padding: 2rem;
}

.staff-header h1 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  color: black;
}

.header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.role-badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 600;
  font-size: 0.9rem;
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
}

.staff-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #ddd;
}

.tab-button {
  background: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  color: #666;
  transition: all 0.3s ease;
  position: relative;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: #ff7f50;
}

.tab-button.active {
  color: #ff7f50;
  border-bottom-color: #ff7f50;
}

.badge {
  background: #ff7f50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.85rem;
  margin-left: 0.5rem;
}

.tab-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-content h2 {
  color: #ff7f50;
  margin-top: 0;
  margin-bottom: 1.5rem;
}

.loading,
.no-data {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.adoptions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.adoption-item {
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.adoption-item:hover {
  box-shadow: 0 4px 12px rgba(255, 127, 80, 0.2);
  transform: translateY(-2px);
}

.adoption-item.scheduled {
  border-left: 4px solid #fff3cd;
}

.adoption-item.approved {
  border-left: 4px solid #d4edda;
}

.adoption-info h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.adoption-info p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.95rem;
}

.adoption-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.7rem 1.2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-schedule {
  background: #fff3cd;
  color: #856404;
}

.btn-schedule:hover {
  background: #ffe69c;
}

.btn-approve,
.btn-success {
  background: #ff7f50;
  color: white;
}

.btn-approve:hover,
.btn-success:hover {
  background: #ff6b35;
}

.btn-reschedule {
  background: #e2e3e5;
  color: #383d41;
}

.btn-reschedule:hover {
  background: #d3d4d6;
}

.btn-reject {
  background: #f8d7da;
  color: #721c24;
}

.btn-reject:hover {
  background: #f5c6cb;
}

.btn-secondary {
  background: #e0e0e0;
  color: #333;
}

.btn-secondary:hover {
  background: #d0d0d0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 1.2rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  max-width: 520px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  padding-bottom: 1rem;
  font-family: 'Segoe UI', sans-serif;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.6rem;
  color: #ff7f50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.8rem;
  font-weight: bold;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: auto;
}

.close-btn:hover {
  color: #ff7f50;
}

.modal-body {
  padding: 1rem 1.5rem 1.5rem 1.5rem;
}

.modal-info h3 {
  margin: 0 0 0.5rem 0;
  color: #ff7f50;
}

.modal-info p {
  margin: 0.3rem 0;
  color: #666;
  font-size: 0.9rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
}

/* Inputs */
.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  box-sizing: border-box;
  outline: none;
  height: 49px;
}

.form-group input[type="date"] {
  cursor: pointer;
}

.form-group input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(25%) sepia(100%) saturate(500%) hue-rotate(10deg);
  cursor: pointer;
  border-radius: 6px;
}

.form-group select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23ff7f50' d='M4 6l4 4 4-4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1rem;
  cursor: pointer;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #ff7f50;
  box-shadow: 0 0 0 3px rgba(255, 127, 80, 0.1);
}

/* Footer */
.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

/* Responsive */
@media (max-width: 768px) {
  .header-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .adoption-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .adoption-actions {
    width: 100%;
    margin-top: 1rem;
  }
}

@media (max-width: 480px) {
  .form-row {
    flex-direction: column;
  }
}

</style>