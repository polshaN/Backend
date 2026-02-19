import { defineStore } from 'pinia';
import authService from '../services/authService.js';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: null,
        refreshToken: null,
        expiresIn: null,
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
    },

    actions: {
        async login(credentials) {
            try {
                const data = await authService.login(
                    credentials.email,
                    credentials.password
                );
                this.token = data.accessToken;
                this.refreshToken = data.refreshToken;
                this.expiresIn = data.expiresIn;

                // Decode JWT to get user info and roles
                try {
                    const payload = JSON.parse(atob(data.accessToken.split('.')[1]));

                    // Extract roles from BOTH realm_access and resource_access
                    const realmRoles = payload.realm_access?.roles || [];
                    const clientRoles = payload.resource_access?.['petadoption-client']?.roles || [];
                    const allRoles = [...realmRoles, ...clientRoles];

                    this.user = {
                        email: payload.email || payload.preferred_username,
                        username: payload.preferred_username,
                        name: payload.name,
                        roles: allRoles
                    };

                    console.log('User logged in:', {
                        email: this.user.email,
                        roles: this.user.roles
                    });
                } catch (e) {
                    console.error('Failed to decode token:', e);
                    this.user = { email: credentials.email };
                }

                // Save to localStorage (persistent across tabs/windows)
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('refreshToken', this.refreshToken);
                localStorage.setItem('user', JSON.stringify(this.user));
            } catch (error) {
                console.error('Login failed:', error);
                throw error;
            }
        },

        async register(payload) {
            // TODO: Implement registration with Keycloak or your backend
            console.warn('Register not yet implemented');
            throw new Error('Registration not implemented');
        },

        async refreshAccessToken() {
            if (!this.refreshToken) {
                this.logout();
                return;
            }

            try {
                const data = await authService.refresh(this.refreshToken);
                this.token = data.accessToken;
                this.refreshToken = data.refreshToken;
                this.expiresIn = data.expiresIn;

                // Update localStorage
                localStorage.setItem('authToken', this.token);
                localStorage.setItem('refreshToken', this.refreshToken);
            } catch (error) {
                console.error('Token refresh failed:', error);
                this.logout();
            }
        },

        async logout() {
            try {
                if (this.refreshToken) {
                    await authService.logout(this.refreshToken);
                }
            } catch (error) {
                console.error('Logout error:', error);
            } finally {
                this.user = null;
                this.token = null;
                this.refreshToken = null;
                this.expiresIn = null;

                // Clear localStorage
                localStorage.removeItem('authToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            }
        },

        // Restore auth from localStorage on app load
        restoreAuth() {
            const token = localStorage.getItem('authToken');
            const refreshToken = localStorage.getItem('refreshToken');
            const userJson = localStorage.getItem('user');

            if (token && refreshToken) {
                this.token = token;
                this.refreshToken = refreshToken;

                // Decode JWT to get user info and roles
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));

                    // Extract roles from BOTH realm_access and resource_access
                    const realmRoles = payload.realm_access?.roles || [];
                    const clientRoles = payload.resource_access?.['petadoption-client']?.roles || [];
                    const allRoles = [...realmRoles, ...clientRoles];

                    this.user = {
                        email: payload.email || payload.preferred_username,
                        username: payload.preferred_username,
                        name: payload.name,
                        roles: allRoles
                    };

                    console.log('Auth restored:', {
                        email: this.user.email,
                        roles: this.user.roles
                    });
                } catch (e) {
                    console.error('Failed to decode token:', e);
                    // Fallback to stored user
                    if (userJson) {
                        try {
                            this.user = JSON.parse(userJson);
                        } catch (e) {
                            console.error('Failed to parse user:', e);
                            this.user = null;
                        }
                    }
                }
            }
        },
    },
});