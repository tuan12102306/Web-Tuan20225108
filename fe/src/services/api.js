import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Thêm /api vào baseURL
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('Request:', config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.data);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response || error);
    return Promise.reject(error);
  }
);

export default api;

