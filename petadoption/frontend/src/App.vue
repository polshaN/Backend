<!-- frontend/src/main.js -->
<template>
  <div id="app">
    <Navbar />
    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import {useAuthStore} from "./stores/authStore.js";
import Navbar from "./components/Navbar.vue";

const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>