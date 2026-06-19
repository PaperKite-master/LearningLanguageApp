import { toAdminFlashcardDeckDto } from '../DTOs/AdminFlashcardDeckDto.js';

export async function listAdminFlashcardDecksUseCase({ adminFlashcardDeckRepo, search, page, limit }) {
  const { data, total } = await adminFlashcardDeckRepo.list({ search, page, limit });
  return {
    data: data.map(toAdminFlashcardDeckDto),
    meta: {
      total,
      page: page || 1
    }
  };
}
