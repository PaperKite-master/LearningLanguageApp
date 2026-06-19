import axiosClient from './axiosClient';

const adminDashboardApi = {
  getDashboardStats: () => {
    return axiosClient.get('/admin/dashboard');
  }
};

export default adminDashboardApi;
