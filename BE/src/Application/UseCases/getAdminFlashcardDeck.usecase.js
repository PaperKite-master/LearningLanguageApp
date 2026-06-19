import { toAdminFlashcardDeckDto } from '../DTOs/AdminFlashcardDeckDto.js';

export async function getAdminFlashcardDeckUseCase({ adminFlashcardDeckRepo, id }) {
  const deck = await adminFlashcardDeckRepo.findById(id);
  if (!deck) {
    const error = new Error('Deck not found');
    error.statusCode = 404;
    throw error;
  }
  return toAdminFlashcardDeckDto(deck);
}
