/**
 * Maps a raw Prisma flashcard record to a clean DTO for the frontend.
 * snake_case DB fields → camelCase API response.
 */
export function toFlashcardDto(flashcard) {
  return {
    id: flashcard.id,
    userId: flashcard.user_id,
    frontText: flashcard.front_text,
    backText: flashcard.back_text,
    notes: flashcard.notes ?? null,
    createdAt: flashcard.created_at ?? null
  };
}
