export function toAdminFlashcardDeckDto(deck) {
  return {
    id: deck.id,
    name: deck.name,
    description: deck.description,
    totalCards: deck._count?.admin_flashcards || 0,
    createdAt: deck.created_at ?? null,
    updatedAt: deck.updated_at ?? null
  };
}
