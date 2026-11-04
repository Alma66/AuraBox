import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
const AUTH_PAGES = /^\/(login|register|logout)(\/|$)/;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';
    const isCredentialCheck = url.includes('/auth/') || url.includes('verify-password');
    if (error.response?.status === 401 && !isCredentialCheck) {
      const hadToken = !!localStorage.getItem('access_token');
      localStorage.removeItem('access_token');
      if (hadToken && !AUTH_PAGES.test(window.location.pathname)) {
        const disabled = error.response?.data?.message === 'Cuenta deshabilitada';
        const here = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = disabled ? '/login?reason=disabled' : `/login?reason=expired&redirect=${here}`;
      }
    }
    return Promise.reject(error);
  }
);

export const getResponseData = (response) => response.data?.data ?? response.data;

export default api;