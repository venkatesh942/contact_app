import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const API = axios.create({
    baseURL: `${API_URL}/api/contacts`,
})

API.interceptors.request.use((config) => {
    const session = JSON.parse(localStorage.getItem('contactBookSession') || 'null');
    if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;
    return config;
});

API.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        localStorage.removeItem('contactBookSession');
        window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(error);
});

export const AuthAPI = axios.create({
    baseURL: `${API_URL}/api/auth`,
});

export default API;