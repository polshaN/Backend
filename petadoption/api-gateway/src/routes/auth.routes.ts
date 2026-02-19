import { Router } from 'express';
import axios from 'axios';
import { URLSearchParams } from 'url';

const router = Router();
console.log('✅ Auth routes loaded');

const KEYCLOAK_URL = process.env.AUTH_SERVICE_URL || 'http://keycloak:8080';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'PETADOPTION-APP';
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'petadoption-client';
const CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || 'petadoption-secret-key-12345';
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes working!' });
});
// Login user - authenticate with Keycloak
router.post('/login', async (req, res) => {
    console.log('🔐 Login endpoint hit!', { email: req.body.email });
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Email and password are required'
            });
        }

        // Call Keycloak token endpoint
        const tokenEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

        const response = await axios.post(
            tokenEndpoint,
            new URLSearchParams({
                username: email,
                password: password,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'password',
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        // Extract user info from token
        const decoded = JSON.parse(
            Buffer.from(response.data.access_token.split('.')[1], 'base64').toString()
        );

        res.json({
            status: 'success',
            user: {
                email: decoded.email,
                name: decoded.name,
                username: decoded.preferred_username,
            },
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in,
        });
    } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({
            status: 'error',
            message: error.response?.data?.error_description || 'Login failed'
        });
    }
});

// Refresh token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                status: 'error',
                message: 'Refresh token is required'
            });
        }

        const tokenEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

        const response = await axios.post(
            tokenEndpoint,
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        res.json({
            status: 'success',
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
            expiresIn: response.data.expires_in,
        });
    } catch (error: any) {
        console.error('Refresh error:', error.response?.data || error.message);
        res.status(401).json({
            status: 'error',
            message: 'Token refresh failed'
        });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken) {
            const logoutEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;

            await axios.post(
                logoutEndpoint,
                new URLSearchParams({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    refresh_token: refreshToken,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );
        }

        res.json({
            status: 'success',
            message: 'Logout successful'
        });
    } catch (error: any) {
        console.error('Logout error:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Logout failed'
        });
    }
});

// Get user profile from token
router.get('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                status: 'error',
                message: 'Authorization header is required'
            });
        }

        const token = authHeader.replace('Bearer ', '');
        const decoded = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
        );

        res.json({
            status: 'success',
            user: {
                email: decoded.email,
                name: decoded.name,
                username: decoded.preferred_username,
                roles: decoded.realm_access?.roles || [],
            }
        });
    } catch (error: any) {
        res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }
});

export default router;