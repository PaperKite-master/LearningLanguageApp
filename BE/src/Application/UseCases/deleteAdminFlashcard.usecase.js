/**
 * Delete an admin flashcard (hard delete).
 */
export async function deleteAdminFlashcardUseCase({ adminFlashcardRepo, id }) {
  await adminFlashcardRepo.delete(id);
}
