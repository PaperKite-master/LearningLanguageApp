import { toFlashcardDto } from '../../DTOs/FlashcardDto.js';

export async function listFlashcardsUseCase({ flashcardRepo, userId }) {
  const flashcards = await flashcardRepo.listByUserId(userId);
  return flashcards.map(toFlashcardDto);
}
