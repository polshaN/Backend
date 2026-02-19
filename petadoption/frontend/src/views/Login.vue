<template>
  <div class="form-container">
    <h2>Login</h2>
    <form @submit.prevent="submit">
      <input v-model="email" placeholder="Email" type="email" />
      <input v-model="password" placeholder="Password" type="password" />
      <button type="submit">Login</button>
      <p v-if="error" style="color: red;">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore.js';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref('');

const submit = async () => {
  try {
    error.value = '';
    await authStore.login({ email: email.value, password: password.value });
    router.push('/');
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed';
  }
};
</script>

<style>
.form-container {
  max-width: 400px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: #f5f0e1;
  color: #000;
  border-radius: 8px;
}

input {
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.5rem;
}

button {
  background-color: #ff7f50;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  width: 100%;
}
</style>