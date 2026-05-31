import axiosClient from './axiosClient';

export const flashcardApi = {
  // Admin Methods (Global Library)
  getAll: async () => {
    const response = await axiosClient.get('/flashcards');
    return response.data?.data || response.data || [];
  },

  create: async (payload) => {
    const response = await axiosClient.post('/flashcards', payload);
    return response.data?.data || response.data;
  },

  update: async (id, payload) => {
    const response = await axiosClient.patch(`/flashcards/${id}`, payload);
    return response.data?.data || response.data;
  },

  delete: async (id) => {
    await axiosClient.delete(`/flashcards/${id}`);
    return true;
  },

  // User Methods (My Cards)
  getLibrary: async () => {
    const response = await axiosClient.get('/flashcards/library');
    return response.data?.data || response.data || [];
  },

  getMyCards: async () => {
    const response = await axiosClient.get('/flashcards/me');
    return response.data?.data || response.data || [];
  },

  createMyCard: async (payload) => {
    const response = await axiosClient.post('/flashcards/me', payload);
    return response.data?.data || response.data;
  },

  updateMyCard: async (id, payload) => {
    const response = await axiosClient.patch(`/flashcards/me/${id}`, payload);
    return response.data?.data || response.data;
  },

  deleteMyCard: async (id) => {
    await axiosClient.delete(`/flashcards/me/${id}`);
    return true;
  },

  exportMyCardsQuizlet: async () => {
    const response = await axiosClient.get('/flashcards/me/export/quizlet');
    return response.data?.data || response.data || '';
  },

  cloneLibraryCard: async (id) => {
    const response = await axiosClient.post(`/flashcards/me/clone/${id}`);
    return response.data?.data || response.data;
  }
};

export default flashcardApi;
