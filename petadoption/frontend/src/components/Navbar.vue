<template>
  <nav class="navbar">
    <h1 class="logo">PetAdopt</h1>
    <ul class="nav-links">
      <li><router-link to="/">Home</router-link></li>
      <li><router-link to="/adoption">Adoption</router-link></li>
      <li><router-link to="/chat">Chat</router-link></li>
      <li v-if="authStore.user">
        <router-link to="/profile">Profile</router-link>
        <span v-if="notificationStore.hasNotification" class="status-dot"></span>
      </li>
      <!-- Staff Dashboard (only for staff/admin) -->
      <li v-if="isStaff">
        <router-link to="/staff">Staff Dashboard</router-link>
      </li>
      <router-link v-if="isStaff" to="/admin/animals">
        🐾 Admin Panel
      </router-link>
      <li v-if="!authStore.user"><router-link to="/login">Login</router-link></li>
      <li v-if="!authStore.user"><router-link to="/register">Register</router-link></li>
      <li v-if="authStore.user"><a @click="logout">Logout</a></li>
    </ul>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/authStore.js';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '../stores/notificationStore.js';
const notificationStore = useNotificationStore();
const authStore = useAuthStore();
const router = useRouter();

// Check if user is staff or admin
const isStaff = computed(() => {
  const roles = authStore.user?.roles || [];
  return roles.includes('staff') || roles.includes('admin');
});

const logout = () => {
  authStore.logout();
  router.push('/');
};

</script>

<style>
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #f5f0e1; /* beige */
  color: #000; /* black text */
}

.logo {
  font-weight: bold;
  color: #ff7f50; /* orange accent */
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  text-decoration: none;
  color: #000;
}

.nav-links a:hover {
  color: #ff7f50;
}
.status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  background: #ff7f50;
  border-radius: 50%;
  margin-left: 0.5rem;
  vertical-align: middle;
}
</style>