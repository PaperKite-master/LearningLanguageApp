import { Type } from '@sinclair/typebox';
import { GrammarDtoSchema } from './adminGrammar.schemas.js';

export const GrammarListQuerySchema = Type.Object({
  lessonId: Type.String({ minLength: 1 })
});

export const GrammarListResponseSchema = Type.Object({
  data: Type.Array(GrammarDtoSchema)
});
