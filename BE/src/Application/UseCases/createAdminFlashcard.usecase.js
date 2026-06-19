import { toAdminFlashcardDto } from '../DTOs/AdminFlashcardDto.js';

/**
 * Create a new admin flashcard.
 */
export async function createAdminFlashcardUseCase({ adminFlashcardRepo, payload }) {
  const flashcard = await adminFlashcardRepo.create({
    deckId: payload.deckId,
    level: payload.level,
    japaneseWord: payload.japaneseWord,
    pronunciation: payload.pronunciation,
    meaningVi: payload.meaningVi,
    status: payload.status
  });
  return toAdminFlashcardDto(flashcard);
}
