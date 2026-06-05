import axiosClient from './axiosClient';

const adminQuizApi = {
  getQuizzes: async () => {
    const url = '/admin/quizzes';
    const response = await axiosClient.get(url);
    return response.data.data;
  },

  createQuiz: async (payload) => {
    const url = '/admin/quizzes';
    const response = await axiosClient.post(url, payload);
    return response.data.data;
  },

  updateQuiz: async (id, payload) => {
    const url = `/admin/quizzes/${id}`;
    const response = await axiosClient.put(url, payload);
    return response.data.data;
  },

  deleteQuiz: async (id) => {
    const url = `/admin/quizzes/${id}`;
    const response = await axiosClient.delete(url);
    return response.data;
  },

  getQuestions: async (quizId) => {
    const url = `/admin/quizzes/${quizId}/questions`;
    const response = await axiosClient.get(url);
    return response.data.data;
  },

  createQuestion: async (quizId, payload) => {
    const url = `/admin/quizzes/${quizId}/questions`;
    const response = await axiosClient.post(url, payload);
    return response.data.data;
  },

  updateQuestion: async (quizId, questionId, payload) => {
    const url = `/admin/quizzes/${quizId}/questions/${questionId}`;
    const response = await axiosClient.put(url, payload);
    return response.data.data;
  },

  deleteQuestion: async (quizId, questionId) => {
    const url = `/admin/quizzes/${quizId}/questions/${questionId}`;
    const response = await axiosClient.delete(url);
    return response.data;
  }
};

export default adminQuizApi;
