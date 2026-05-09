import axiosClient from './axiosClient';

const userLessonApi = {
  getLessonById: async (id) => {
    // Workaround: Backend chưa có API GET /lessons/:id, nên ta lấy danh sách và filter
    const url = `/lessons`;
    const response = await axiosClient.get(url);
    const lessons = response.data.data || [];
    const lesson = lessons.find(l => l.id === id);
    if (!lesson) throw new Error('Lesson not found');
    return lesson;
  },

  getGrammarsByLessonId: async (lessonId) => {
    // Assuming backend endpoint for grammars filtered by lessonId
    const url = `/grammars?lessonId=${lessonId}`;
    const response = await axiosClient.get(url);
    return response.data.data;
  }
};

export default userLessonApi;
