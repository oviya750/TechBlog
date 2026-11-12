import axios from 'axios';

// Normalize API base URL: handles both root URLs and '/api' suffixed endpoints
const rawApiUrl = (import.meta.env.VITE_API_URL || '/api').trim();
const API_BASE_URL =
  rawApiUrl === '/api'
    ? '/api'
    : rawApiUrl.endsWith('/api') || rawApiUrl.endsWith('/api/')
    ? rawApiUrl.replace(/\/+$/, '')
    : `${rawApiUrl.replace(/\/+$/, '')}/api`;

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
    if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor for 401 token expiry and invalidation
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthLoginRoute = error.config && error.config.url && error.config.url.includes('/auth/login');
      if (!isAuthLoginRoute) {
        // Clear stale credentials from storage
        localStorage.removeItem('techblog_token');
        localStorage.removeItem('techblog_user');

        // Broadcast session expiration event to React AuthContext
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('techblog_auth_expired', {
              detail: { message: error.response?.data?.message || 'Authentication session expired.' }
            })
          );

          // Redirect to login if currently accessing an admin console route
          if (
            window.location.pathname.startsWith('/admin') &&
            window.location.pathname !== '/admin/login'
          ) {
            window.location.href = '/admin/login?expired=true';
          }
        }
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
  delete: (id) => api.delete(`/articles/${id}`),
  publishScheduled: () => api.post('/articles/publish-scheduled')
};

// Category Endpoints
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id, data) => api.delete(`/categories/${id}`, { data })
};

// Author Endpoints
export const authorsAPI = {
  getAll: () => api.get('/authors'),
  getBySlug: (slug) => api.get(`/authors/slug/${slug}`),
  create: (data) => api.post('/authors', data),
  update: (id, data) => api.put(`/authors/${id}`, data),
  delete: (id, data) => api.delete(`/authors/${id}`, { data })
};

// Tag Endpoints
export const tagsAPI = {
  getAll: () => api.get('/tags'),
  create: (data) => api.post('/tags', data),
  update: (id, data) => api.put(`/tags/${id}`, data),
  delete: (id) => api.delete(`/tags/${id}`)
};

// Media Endpoints
export const mediaAPI = {
  getAll: () => api.get('/media'),
  upload: (formData) =>
    api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  delete: (id) => api.delete(`/media/${id}`)
};

// Settings Endpoints
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
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

