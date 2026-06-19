import { toAdminFlashcardDeckDto } from '../DTOs/AdminFlashcardDeckDto.js';

export async function createAdminFlashcardDeckUseCase({ adminFlashcardDeckRepo, payload }) {
  const deck = await adminFlashcardDeckRepo.create({
    name: payload.name,
    description: payload.description
  });
  return toAdminFlashcardDeckDto(deck);
}
