import axiosClient from './axiosClient';

const authApi = {
  login: async (payload) => {
    const url = '/auth/login';
    const response = await axiosClient.post(url, payload);
    
    // Lưu token sau khi đăng nhập thành công
    const { accessToken, refreshToken } = response.data;
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
    
    return response.data;
  },

  register: async (payload) => {
    const url = '/auth/register';
    const response = await axiosClient.post(url, payload);
    return response.data;
  },

  getMe: async () => {
    const url = '/auth/me';
    const response = await axiosClient.get(url);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

export default authApi;
