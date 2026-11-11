import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('techblog_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for 401 token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute = error.config.url.includes('/auth/login');
      if (!isAuthRoute) {
        localStorage.removeItem('techblog_token');
        localStorage.removeItem('techblog_user');
      }
    }
    return Promise.reject(error);
  }
);

// Article Endpoints
export const articlesAPI = {
  getAll: (params) => api.get('/articles', { params }),
  getFeatured: () => api.get('/articles/featured'),
  getTrending: () => api.get('/articles/trending'),
  getBySlug: (slug) => api.get(`/articles/slug/${slug}`),
  getById: (id) => api.get(`/articles/${id}`),
  create: (data) => api.post('/articles', data),
  update: (id, data) => api.put(`/articles/${id}`, data),
  delete: (id) => api.delete(`/articles/${id}`)
};

// Category Endpoints
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`)
};

// Author Endpoints
export const authorsAPI = {
  getAll: () => api.get('/authors'),
  getBySlug: (slug) => api.get(`/authors/slug/${slug}`),
  create: (data) => api.post('/authors', data),
  update: (id, data) => api.put(`/authors/${id}`, data),
  delete: (id) => api.delete(`/authors/${id}`)
};

// Tag Endpoints
export const tagsAPI = {
  getAll: () => api.get('/tags'),
  create: (data) => api.post('/tags', data),
  delete: (id) => api.delete(`/tags/${id}`)
};

// Media Endpoints
export const mediaAPI = {
  getAll: () => api.get('/media'),
  upload: (formData) =>
    api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

// Admin Stats
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard')
};

// Auth Endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
};

// Public Endpoints
export const publicAPI = {
  subscribeNewsletter: (data) => api.post('/newsletter/subscribe', data),
  submitContact: (data) => api.post('/contact', data)
};

export default api;

