import { toFlashcardDto } from '../../DTOs/FlashcardDto.js';

export async function updateFlashcardUseCase({ flashcardRepo, id, userId, payload }) {
  const updated = await flashcardRepo.update(id, userId, {
    frontText: payload.frontText,
    backText: payload.backText,
    notes: payload.notes
  });

  if (!updated) {
    const err = new Error('Flashcard not found');
    err.statusCode = 404;
    throw err;
  }

  return toFlashcardDto(updated);
}
