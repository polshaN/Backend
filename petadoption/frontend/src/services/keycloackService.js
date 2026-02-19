// import axios from 'axios';
//
// // Determine Keycloak URL based on environment
// const getKeycloakURL = () => {
//     // Always use localhost:8091 when accessing from browser
//     // (frontend is running in browser, not in Docker)
//     return 'http://localhost:8091';
// };
//
// const keycloakClient = axios.create({
//     baseURL: getKeycloakURL(),
//     withCredentials: false,
// });
// // Change to your actual client ID
// const CLIENT_SECRET = 'B57uSJZ2Un1nAM0SSQB4RESorMRl2138'; // Change to your actual client secret
//
// const KEYCLOAK_URL = 'http://localhost:8091';
// const KEYCLOAK_REALM = 'PETADOPTION-APP';
// const CLIENT_ID = 'petadoption-client'; // Your actual Keycloak client ID
//
//
// export default {
//     login: async (email, password) => {
//         try {
//             const tokenEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
//
//             const response = await axios.post(
//                 tokenEndpoint,
//                 new URLSearchParams({
//                     username: email,
//                     password: password,
//                     client_id: CLIENT_ID,
//                     client_secret: CLIENT_SECRET,
//                     grant_type: 'password',
//                 }),
//                 {
//                     headers: {
//                         'Content-Type': 'application/x-www-form-urlencoded',
//                     },
//                 }
//             );
//
//             return {
//                 user: {
//                     email: email,
//                 },
//                 accessToken: response.data.access_token,
//                 refreshToken: response.data.refresh_token,
//                 expiresIn: response.data.expires_in,
//             };
//         } catch (error) {
//             console.error('Keycloak login error:', error.response?.data || error.message);
//             throw error;
//         }
//     },
//
//     refresh: async (refreshToken) => {
//         try {
//             const tokenEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
//
//             const response = await axios.post(
//                 tokenEndpoint,
//                 new URLSearchParams({
//                     client_id: CLIENT_ID,
//                     client_secret: CLIENT_SECRET,
//                     grant_type: 'refresh_token',
//                     refresh_token: refreshToken,
//                 }),
//                 {
//                     headers: {
//                         'Content-Type': 'application/x-www-form-urlencoded',
//                     },
//                 }
//             );
//
//             return {
//                 accessToken: response.data.access_token,
//                 refreshToken: response.data.refresh_token,
//                 expiresIn: response.data.expires_in,
//             };
//         } catch (error) {
//             console.error('Token refresh error:', error.response?.data || error.message);
//             throw error;
//         }
//     },
//
//     logout: async (refreshToken) => {
//         try {
//             const logoutEndpoint = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;
//
//             await axios.post(
//                 logoutEndpoint,
//                 new URLSearchParams({
//                     client_id: CLIENT_ID,
//                     client_secret: CLIENT_SECRET,
//                     refresh_token: refreshToken,
//                 }),
//                 {
//                     headers: {
//                         'Content-Type': 'application/x-www-form-urlencoded',
//                     },
//                 }
//             );
//         } catch (error) {
//             console.error('Logout error:', error.response?.data || error.message);
//         }
//     },
// };