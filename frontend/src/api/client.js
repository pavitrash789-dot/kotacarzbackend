import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Add auth token to requests (check both admin and customer tokens)
api.interceptors.request.use((config) => {
  // Customer token takes priority for customer routes
  const customerToken = localStorage.getItem('pp_customer_token');
  const adminToken = localStorage.getItem('pp_token');
  const token = customerToken || adminToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      console.error('Backend server is not running. Start it with: cd backend && node server.js');
    }
    if (error.response?.status === 401) {
      const isCustomerRoute = error.config?.url?.startsWith('/customers/');
      if (isCustomerRoute) {
        localStorage.removeItem('pp_customer_token');
        localStorage.removeItem('pp_customer');
      } else {
        localStorage.removeItem('pp_token');
        localStorage.removeItem('pp_user');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
