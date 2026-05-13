export async function deleteFlashcardUseCase({ flashcardRepo, id, userId }) {
  const deleted = await flashcardRepo.delete(id, userId);

  if (!deleted) {
    const err = new Error('Flashcard not found');
    err.statusCode = 404;
    throw err;
  }
}
