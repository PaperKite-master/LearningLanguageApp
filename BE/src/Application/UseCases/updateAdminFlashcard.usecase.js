import { toAdminFlashcardDto } from '../DTOs/AdminFlashcardDto.js';

/**
 * Update an existing admin flashcard.
 */
export async function updateAdminFlashcardUseCase({ adminFlashcardRepo, id, payload }) {
  const flashcard = await adminFlashcardRepo.update(id, {
    level: payload.level,
    japaneseWord: payload.japaneseWord,
    pronunciation: payload.pronunciation,
    meaningVi: payload.meaningVi,
    status: payload.status
  });
  return toAdminFlashcardDto(flashcard);
}
