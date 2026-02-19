import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Adoption from '../views/Adoption.vue';
import Chat from '../views/Chat.vue';
import Profile from '../views/Profile.vue';
import StaffDashboard from "../views/StaffDashboard.vue";
import { useAuthStore } from '../stores/authStore.js';
import AdminAnimals from "../views/AdminAnimals.vue";

const routes = [
    { path: '/', component: Home },
    { path: '/login', component: Login },
    { path: '/register', component: Register },
    { path: '/adoption', component: Adoption },
    { path: '/chat', component: Chat },
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },
    {
        path: '/staff',
        component: StaffDashboard,
        meta: { requiresAuth: true, requiresStaff: true }
    },
    {
        path: '/admin/animals',
        name: 'AdminAnimals',
        component: AdminAnimals,
        meta: { requiresAuth: true, requiresAdmin: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    // Restore auth on page load
    if (!authStore.user) {
        authStore.restoreAuth();
    }

    // Check if route requires authentication
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        console.warn('Route requires auth, redirecting to login');
        next('/login');
        return;
    }

    // Check if route requires staff role
    if (to.meta.requiresStaff) {
        const roles = authStore.user?.roles || [];
        const isStaff = roles.includes('staff') || roles.includes('admin');

        if (!isStaff) {
            console.warn('Route requires staff role, redirecting to home');
            alert('You do not have permission to access this page');
            next('/');
            return;
        }
    }

    next();
});

export default router;