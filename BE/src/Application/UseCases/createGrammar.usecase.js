import { toGrammarDto } from '../DTOs/GrammarDto.js';

export async function createGrammarUseCase({ grammarRepo, payload }) {
  const grammar = await grammarRepo.create(payload);
  return toGrammarDto(grammar);
}

