import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verify2fa: (token, code) =>
    api.post('/auth/2fa/verify', { code }, { headers: { 'X-2FA-Token': token } }),
  me: () => api.get('/auth/me'),
  setup2fa: () => api.post('/auth/2fa/setup'),
  confirm2fa: (code) => api.post('/auth/2fa/confirm', { code }),
  disable2fa: () => api.delete('/auth/2fa'),
};

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  search: (params) => api.get('/products/search', { params }),
  getFavorites: () => api.get('/products/favorites'),
  addFavorite: (productId) => api.post(`/products/${productId}/favorite`),
  removeFavorite: (productId) => api.delete(`/products/${productId}/favorite`),
};

export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  removeItem: (cartItemId) => api.delete(`/cart/items/${cartItemId}`),
  updateQuantity: (cartItemId, quantity) =>
    api.patch(`/cart/items/${cartItemId}`, null, { params: { quantity } }),
  clear: () => api.delete('/cart'),
};

export default api;
