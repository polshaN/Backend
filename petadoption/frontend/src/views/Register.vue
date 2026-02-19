<template>
  <div class="form-container">
    <h2>Register</h2>
    <form @submit.prevent="submit">
      <input v-model="firstName" placeholder="First Name" />
      <input v-model="lastName" placeholder="Last Name" />
      <input v-model="email" placeholder="Email" />
      <input v-model="password" placeholder="Password" type="password" />
      <button>Register</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore.js';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');

const submit = async () => {
  await authStore.register({
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
    password: password.value
  });
  router.push('/');
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
}
</style>
