import { toGrammarDto } from '../DTOs/GrammarDto.js';

export async function updateGrammarUseCase({ grammarRepo, id, payload }) {
  const grammar = await grammarRepo.update(id, payload);
  return toGrammarDto(grammar);
}

