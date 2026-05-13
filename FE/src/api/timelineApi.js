import axiosClient from './axiosClient';

const timelineApi = {
  getAll: async () => {
    const url = '/timelines';
    const response = await axiosClient.get(url);
    return response.data.data;
  },

  getById: async (id) => {
    const url = `/timelines/${id}`;
    const response = await axiosClient.get(url);
    return response.data.data;
  },

  create: async (payload) => {
    const url = '/admin/timelines';
    const response = await axiosClient.post(url, payload);
    return response.data.data;
  },

  update: async (id, payload) => {
    const url = `/admin/timelines/${id}`;
    const response = await axiosClient.patch(url, payload);
    return response.data.data;
  },

  delete: async (id) => {
    const url = `/admin/timelines/${id}`;
    const response = await axiosClient.delete(url);
    return response.data;
  }
};

export default timelineApi;
