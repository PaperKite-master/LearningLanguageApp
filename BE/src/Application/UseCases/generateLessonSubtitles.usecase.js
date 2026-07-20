import { generateBilingualSubtitles } from '../../Infrastructure/Services/YouTubeSubtitleService.js';
import { toLessonDto } from '../DTOs/LessonDto.js';

export async function generateLessonSubtitlesUseCase({ lessonRepo, id }) {
  const lesson = await lessonRepo.findByIdAny(id);
  if (!lesson) {
    const err = new Error('Lesson not found');
    err.statusCode = 404;
    throw err;
  }

  if (!lesson.video_url) {
    const err = new Error('Lesson does not have a YouTube video URL');
    err.statusCode = 400;
    throw err;
  }

  const subtitles = await generateBilingualSubtitles(lesson.video_url);
  const updated = await lessonRepo.updateSubtitles(id, subtitles);
  return toLessonDto(updated);
}
