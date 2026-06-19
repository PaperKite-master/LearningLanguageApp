import { toAdminFlashcardDeckDto } from '../DTOs/AdminFlashcardDeckDto.js';

export async function updateAdminFlashcardDeckUseCase({ adminFlashcardDeckRepo, id, payload }) {
  const deck = await adminFlashcardDeckRepo.update(id, {
    name: payload.name,
    description: payload.description
  });
  return toAdminFlashcardDeckDto(deck);
}
