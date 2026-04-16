import axios from 'axios';

const api = axios.create({ baseURL: 'https://kharcha-mongodb.onrender.com/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kharcha_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kharcha_token');
      localStorage.removeItem('kharcha_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
