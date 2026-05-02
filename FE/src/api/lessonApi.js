import axiosClient from './axiosClient';

const lessonApi = {
  create: async (payload) => {
    const url = '/admin/lessons';
    const response = await axiosClient.post(url, payload);
    return response.data.data;
  },

  update: async (id, payload) => {
    const url = `/admin/lessons/${id}`;
    const response = await axiosClient.patch(url, payload);
    return response.data.data;
  }
};

export default lessonApi;
