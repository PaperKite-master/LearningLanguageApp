import { toAdminFlashcardDto } from '../DTOs/AdminFlashcardDto.js';

/**
 * Get a single admin flashcard by ID.
 */
export async function getAdminFlashcardUseCase({ adminFlashcardRepo, id }) {
  const flashcard = await adminFlashcardRepo.findById(id);
  if (!flashcard) {
    const err = new Error('Flashcard not found');
    err.statusCode = 404;
    throw err;
  }
  return toAdminFlashcardDto(flashcard);
}
