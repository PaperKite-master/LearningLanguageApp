import { toGrammarDto } from '../DTOs/GrammarDto.js';

export async function listAdminGrammarsUseCase({ grammarRepo }) {
  const grammars = await grammarRepo.listAll();
  return grammars.map(toGrammarDto);
}
