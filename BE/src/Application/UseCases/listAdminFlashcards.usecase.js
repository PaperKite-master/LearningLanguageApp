import { toAdminFlashcardDto } from '../DTOs/AdminFlashcardDto.js';

/**
 * List admin flashcards with optional search and pagination.
 */
export async function listAdminFlashcardsUseCase({ adminFlashcardRepo, search, deckId, page, limit }) {
  const { data, total } = await adminFlashcardRepo.list({ search, deckId, page, limit });
  return {
    data: data.map(toAdminFlashcardDto),
    meta: {
      total,
      page: page || 1
    }
  };
}
