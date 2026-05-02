import axiosClient from './axiosClient';

const grammarApi = {
  create: async (payload) => {
    const url = '/admin/grammars';
    const response = await axiosClient.post(url, payload);
    return response.data.data;
  },

  update: async (id, payload) => {
    const url = `/admin/grammars/${id}`;
    const response = await axiosClient.patch(url, payload);
    return response.data.data;
  }
};

export default grammarApi;
