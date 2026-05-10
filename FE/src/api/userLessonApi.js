import axiosClient from './axiosClient';

const userLessonApi = {
  getLessonById: async (id) => {
    const url = `/lessons/${id}`;
    const response = await axiosClient.get(url);
    return response.data.data;
  },

  getGrammarsByLessonId: async (lessonId) => {
    // Assuming backend endpoint for grammars filtered by lessonId
    const url = `/grammars?lessonId=${lessonId}`;
    const response = await axiosClient.get(url);
    return response.data.data;
  }
};

export default userLessonApi;
