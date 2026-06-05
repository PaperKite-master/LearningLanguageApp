import { Type } from '@sinclair/typebox';

// ─── DTO Schema ─────────────────────────────────────────────────────────────

export const FlashcardDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  userId: Type.Union([Type.String({ format: 'uuid' }), Type.Null()]),
  frontText: Type.String(),
  backText: Type.String(),
  notes: Type.Union([Type.String(), Type.Null()]),
  createdAt: Type.Union([Type.String(), Type.Null()])
});

// ─── Param Schemas ───────────────────────────────────────────────────────────

export const FlashcardIdParamsSchema = Type.Object({
  id: Type.String({ description: 'Flashcard UUID' })
});

// ─── Body Schemas ────────────────────────────────────────────────────────────

export const CreateFlashcardBodySchema = Type.Object({
  frontText: Type.String({ description: 'Front side of the card (e.g. Kanji/word)' }),
  backText: Type.String({ minLength: 1, description: 'Back side of the card (e.g. meaning)' }),
  notes: Type.Optional(Type.Union([Type.String(), Type.Null()], { description: 'Optional personal notes' }))
});

export const UpdateFlashcardBodySchema = Type.Partial(CreateFlashcardBodySchema);

// ─── Response Schemas ────────────────────────────────────────────────────────

export const FlashcardResponseSchema = Type.Object({
  data: FlashcardDtoSchema
});

export const ListFlashcardsResponseSchema = Type.Object({
  data: Type.Array(FlashcardDtoSchema)
});

export const ExportQuizletResponseSchema = Type.Object({
  data: Type.String({ description: 'Tab-delimited text ready to paste into Quizlet Import' })
});
