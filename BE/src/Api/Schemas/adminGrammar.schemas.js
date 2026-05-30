import { Type } from '@sinclair/typebox';

export const GrammarIdParamsSchema = Type.Object({
  id: Type.String()
});

export const GrammarDtoSchema = Type.Object({
  id: Type.String(),
  lessonId: Type.String(),
  title: Type.String(),
  contentMarkdown: Type.Union([Type.String(), Type.Null()]),
  order: Type.Integer(),
  createdAt: Type.Union([Type.String(), Type.Null()])
});

export const CreateGrammarBodySchema = Type.Object({
  lessonId: Type.String({ minLength: 1 }),
  title: Type.String({ minLength: 1 }),
  contentMarkdown: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  order: Type.Optional(Type.Integer({ minimum: 0 }))
});

export const UpdateGrammarBodySchema = Type.Partial(CreateGrammarBodySchema);

export const GrammarResponseSchema = Type.Object({
  data: GrammarDtoSchema
});

export const GrammarListResponseSchema = Type.Object({
  data: Type.Array(GrammarDtoSchema)
});

