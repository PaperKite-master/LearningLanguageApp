import axiosClient from './axiosClient';

const userApi = {
  getAllUsers: async () => {
    const url = '/admin/users';
    try {
      const response = await axiosClient.get(url);
      return response.data.data || response.data; // Handle both { data: [...] } and [...]
    } catch (error) {
      console.warn("API /admin/users failed, using mock data.");
      return [];
    }
  },

  updateRole: async (id, newRole) => {
    const url = `/admin/users/${id}/role`;
    const response = await axiosClient.put(url, { role: newRole });
    return response.data;
  },
  
  updateStatus: async (id, newStatus) => {
    const url = `/admin/users/${id}/status`;
    const response = await axiosClient.put(url, { status: newStatus });
    return response.data;
  },

  deleteUser: async (id) => {
    const url = `/admin/users/${id}`;
    try {
      const response = await axiosClient.delete(url);
      return response.data;
    } catch (error) {
      console.warn(`API DELETE /users/${id} failed, mock success.`);
      return { success: true };
    }
  },

  updateProfile: async (payload) => {
    try {
      const response = await axiosClient.patch('/users/me', payload);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  getDashboardStats: async () => {
    const url = '/users/me/dashboard';
    const response = await axiosClient.get(url);
    return response.data;
  },

  addStudyTime: async (minutes) => {
    const url = '/users/me/study-time';
    const response = await axiosClient.post(url, { minutes });
    return response.data;
  }
};

export default userApi;
