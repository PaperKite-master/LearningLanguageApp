import axiosClient from './axiosClient';

const authApi = {
  login: async (payload) => {
    const url = '/auth/login';
    const response = await axiosClient.post(url, payload);
    
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
    localStorage.removeItem('user');
  },

  forgotPassword: async (email) => {
    const url = '/auth/forgot-password';
    const response = await axiosClient.post(url, { email });
    return response.data;
  },

  resetPassword: async (newPassword, token) => {
    const url = '/auth/reset-password';
    const response = await axiosClient.post(
      url, 
      { newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};

export default authApi;
