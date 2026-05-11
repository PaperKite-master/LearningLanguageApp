export async function deleteGrammarUseCase({ grammarRepo, id }) {
  await grammarRepo.delete(id);
}
