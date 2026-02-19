import { createApp } from 'vue';
import { createPinia } from 'pinia';
import './main.css';
import App from './App.vue';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

import { useAuthStore } from './stores/authStore.js';
const authStore = useAuthStore();
authStore.restoreAuth();

import router from "./router/index.js";
app.use(router);

app.mount('#app');