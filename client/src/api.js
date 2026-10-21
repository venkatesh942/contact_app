import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api/contacts',
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
    baseURL: 'http://localhost:5000/api/auth',
});

export default API;