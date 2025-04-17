// src/services/api.js
import axios from 'axios';
// import { getUserDetails } from '../../../backend/controllers/authController';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with base URL
const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Request interceptor to add auth token to all requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Contact services (to be used with your contacts component)
export const contactService = {
    getAllUsers: () => apiClient.get('/auth_cas/users'),
    getUserDetails: (id) => apiClient.get(`/auth_cas/user?id=${userId}`),
    changeContactRole: (email, role) => apiClient.put(`/auth_cas/user/${encodeURIComponent(email)}/role`, { role })
};