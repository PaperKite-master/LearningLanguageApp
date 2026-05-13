import { toFlashcardDto } from '../../DTOs/FlashcardDto.js';

export async function createFlashcardUseCase({ flashcardRepo, userId, payload }) {
  const flashcard = await flashcardRepo.create({
    userId,
    frontText: payload.frontText,
    backText: payload.backText,
    notes: payload.notes
  });
  return toFlashcardDto(flashcard);
}
