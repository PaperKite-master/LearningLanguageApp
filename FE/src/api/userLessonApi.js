import axiosClient from './axiosClient';
import lessonApi from './lessonApi';

const getRealIdFromDisplayId = async (displayId) => {
  if (typeof displayId === 'string' && displayId.startsWith('L')) {
    const allLessons = await lessonApi.getAll();
    const found = (allLessons || []).find(l => l.lessonCode === displayId);
    if (found) return found.id;
  }
  return displayId;
};

const userLessonApi = {
  getLessonById: async (id) => {
    // Nếu truyền L001 thì tự dịch ra UUID
    const realId = await getRealIdFromDisplayId(id);
    
    const url = `/lessons/${realId}`;
    const response = await axiosClient.get(url);
    return response.data.data;
  },

  getGrammarsByLessonId: async (lessonId) => {
    const realId = await getRealIdFromDisplayId(lessonId);
    
    // Assuming backend endpoint for grammars filtered by lessonId
    const url = `/grammars?lessonId=${realId}`;
    const response = await axiosClient.get(url);
    return response.data.data;
  }
};

export default userLessonApi;
