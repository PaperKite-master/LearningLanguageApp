import axiosClient from './axiosClient';

const quizApi = {
  getQuizById: async (id) => {
    const url = `/quizzes/${id}`;
    const response = await axiosClient.get(url);
    return response.data;
  },

  submitQuiz: async (id, answers) => {
    const url = `/quizzes/${id}/submit`;
    const response = await axiosClient.post(url, { answers });
    return response.data; // Includes message and data
  },

  getQuizByTimeline: async (timelineId) => {
    const url = `/quizzes/by-timeline/${timelineId}`;
    const response = await axiosClient.get(url);
    return response.data;
  },

  getQuizByLesson: async (lessonId) => {
    const url = `/quizzes/by-lesson/${lessonId}`;
    const response = await axiosClient.get(url);
    return response.data;
  }
};

export default quizApi;
