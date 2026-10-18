import axios from 'axios';

// Vite proxy routes /api to http://localhost:5000 in dev
// In production, VITE_API_URL can specify the remote base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling & 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired or unauthorized, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if not already on login or register pages
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getMe: () => api.get('/api/auth/me'),
};

// Orders Endpoints
export const ordersAPI = {
  createOrder: (orderData) => api.post('/api/orders', orderData),
  getOrders: (params) => api.get('/api/orders', { params }),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  updateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
  assignAgent: (id, agentId) => api.put(`/api/orders/${id}/assign`, { agentId }),
  getTrackingInfo: (id) => api.get(`/api/orders/${id}/track`),
};

// Users & Agents Endpoints (Admin)
export const usersAPI = {
  getAllUsers: () => api.get('/api/users'),
  getAgents: () => api.get('/api/users/agents'),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
};

// Admin Dashboard Endpoints
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getPerformance: () => api.get('/api/admin/performance'),
};

export default api;
