/**
 * Maps an admin_flashcards DB row to a camelCase DTO for API responses.
 */
export function toAdminFlashcardDto(flashcard) {
  return {
    id: flashcard.id,
    level: flashcard.level,
    japaneseWord: flashcard.japanese_word,
    pronunciation: flashcard.pronunciation,
    meaningVi: flashcard.meaning_vi,
    status: flashcard.status,
    createdAt: flashcard.created_at ?? null,
    updatedAt: flashcard.updated_at ?? null
  };
}
