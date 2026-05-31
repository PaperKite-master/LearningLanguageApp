import axiosClient from './axiosClient';

const grammarApi = {
  getByLessonId: async (lessonId) => {
    const url = `/grammars?lessonId=${lessonId}`;
    const response = await axiosClient.get(url);
    return response.data.data;
  },

  getAll: async () => {
    const url = '/admin/grammars';
    const response = await axiosClient.get(url);
    return response.data.data;
  },

  create: async (payload) => {
    const url = '/admin/grammars';
    const response = await axiosClient.post(url, payload);
    return response.data.data;
  },

  update: async (id, payload) => {
    const url = `/admin/grammars/${id}`;
    const response = await axiosClient.patch(url, payload);
    return response.data.data;
  },

  delete: async (id) => {
    const url = `/admin/grammars/${id}`;
    const response = await axiosClient.delete(url);
    return response.data;
  }
};

export default grammarApi;
