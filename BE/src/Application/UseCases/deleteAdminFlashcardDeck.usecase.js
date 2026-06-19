export async function deleteAdminFlashcardDeckUseCase({ adminFlashcardDeckRepo, id }) {
  await adminFlashcardDeckRepo.delete(id);
  return true;
}
