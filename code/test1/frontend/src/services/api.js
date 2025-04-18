// services/api.js or services/contactService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const contactService = {
    // Get all users
    getAllUsers: () => {
        return axios.get(`${API_URL}/auth_cas/users`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    },

    // Get user by ID
    getUserById: (id) => {
        return axios.get(`${API_URL}/auth_cas/user?id=${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    },

    // Change user role
    changeContactRole: (email, role) => {
        return axios.put(`${API_URL}/auth_cas/user/${email}/role`,
            { role },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
    },

    // Add new contact
    addContact: (contactData) => {
        return axios.post(`${API_URL}/auth_cas/addUser`, contactData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    },

    // Update contact
    updateContact: (email, contactData) => {
        return axios.put(`${API_URL}/auth_cas/user/${email}`, contactData, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    },

    // Delete contact
    deleteContact: (email) => {
        return axios.delete(`${API_URL}/auth_cas/user/${encodeURIComponent(email)}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
    }
};