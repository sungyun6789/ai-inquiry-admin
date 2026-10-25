import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(undefined, (error) => {
  const message = error.response?.data?.message;

  if (error.response?.status === 401 && error.config?.url !== '/auth/login') {
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
      alert(message);
      window.location.href = '/login';
    }
    return new Promise(() => {});
  }

  if (message) {
    alert(message);
  }
  return Promise.reject(error);
});
