import axios from 'axios';

// Dev/Docker cùng origin: để trống → '/api'. Deploy tách BE: VITE_API_BASE_URL=https://api.example.com
const rawBase = import.meta.env.VITE_API_BASE_URL;
const baseURL =
  rawBase != null && String(rawBase).trim() !== ''
    ? String(rawBase).replace(/\/$/, '')
    : '/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor cho Request
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ localStorage
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor cho Response
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Xử lý lỗi chung
    const message = error.response?.data?.error || error.response?.data?.message || error.message || 'Có lỗi xảy ra, vui lòng thử lại!';
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
