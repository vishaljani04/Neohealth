import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE_URL = `${BASE_URL.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
  checkMobile: (mobile) => api.post('/auth/check-mobile', { mobile }),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const healthService = {
  addRecord: (data) => api.post('/health/record', data),
  updateRecord: (id, data) => api.put(`/health/record/${id}`, data),
  getRecords: () => api.get('/health/records'),
};

export const predictionService = {
  predict: (data) => api.post('/predictions/predict', data),
  getHistory: () => api.get('/predictions/history'),
};

export const datasetService = {
  list: () => api.get('/datasets/list'),
  getStats: (filename) => api.get(`/datasets/stats/${filename}`),
};

export default api;
