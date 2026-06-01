import axiosClient from './axiosClient';

const lessonApi = {
  getAll: async () => {
    const url = '/lessons';
    const response = await axiosClient.get(url);
    return response.data.data;
  },

  getAllAdmin: async () => {
    const url = '/admin/lessons';
    const response = await axiosClient.get(url);
    return response.data.data;
  },

  create: async (payload) => {
    const url = '/admin/lessons';
    const response = await axiosClient.post(url, payload);
    return response.data.data;
  },

  update: async (id, payload) => {
    const url = `/admin/lessons/${id}`;
    const response = await axiosClient.patch(url, payload);
    return response.data.data;
  },

  delete: async (id) => {
    const url = `/admin/lessons/${id}`;
    const response = await axiosClient.delete(url);
    return response.data;
  },

  saveProgress: async (id, event) => {
    const url = `/lessons/${id}/progress`;
    // payload: { event: 'OPEN' | 'COMPLETE' }
    const response = await axiosClient.post(url, { event });
    return response.data.data || response.data;
  }
};

export default lessonApi;
