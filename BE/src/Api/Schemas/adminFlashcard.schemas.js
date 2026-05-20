import { Type } from '@sinclair/typebox';

// ─── Enum Values ─────────────────────────────────────────────────────────────

const FlashcardLevelEnum = Type.Union([
  Type.Literal('N5'),
  Type.Literal('N4'),
  Type.Literal('N3'),
  Type.Literal('N2'),
  Type.Literal('N1')
], { description: 'JLPT level (N5 = easiest, N1 = hardest)' });

const FlashcardStatusEnum = Type.Union([
  Type.Literal('PUBLISHED'),
  Type.Literal('DRAFT')
], { description: 'Visibility status of the flashcard' });

// ─── Param Schemas ───────────────────────────────────────────────────────────

export const AdminFlashcardIdParamsSchema = Type.Object({
  id: Type.String({ description: 'Admin Flashcard UUID' })
});

// ─── Query Schemas ───────────────────────────────────────────────────────────

export const ListAdminFlashcardsQuerySchema = Type.Object({
  search: Type.Optional(Type.String({ description: 'Search by Japanese word or Vietnamese meaning' })),
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1, description: 'Page number' })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20, description: 'Items per page' }))
});

// ─── DTO Schema ──────────────────────────────────────────────────────────────

export const AdminFlashcardDtoSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  level: FlashcardLevelEnum,
  japaneseWord: Type.String(),
  pronunciation: Type.String(),
  meaningVi: Type.String(),
  status: FlashcardStatusEnum,
  createdAt: Type.Union([Type.String(), Type.Null()]),
  updatedAt: Type.Union([Type.String(), Type.Null()])
});

// ─── Body Schemas ────────────────────────────────────────────────────────────

export const CreateAdminFlashcardBodySchema = Type.Object({
  level: FlashcardLevelEnum,
  japaneseWord: Type.String({ minLength: 1, description: 'Japanese word (Kanji/Kana)' }),
  pronunciation: Type.String({ minLength: 1, description: 'Pronunciation (Hiragana)' }),
  meaningVi: Type.String({ minLength: 1, description: 'Vietnamese meaning' }),
  status: Type.Optional(FlashcardStatusEnum)
});

export const UpdateAdminFlashcardBodySchema = Type.Partial(CreateAdminFlashcardBodySchema);

// ─── Response Schemas ────────────────────────────────────────────────────────

export const AdminFlashcardResponseSchema = Type.Object({
  status: Type.String(),
  data: AdminFlashcardDtoSchema
});

export const ListAdminFlashcardsResponseSchema = Type.Object({
  status: Type.String(),
  data: Type.Array(AdminFlashcardDtoSchema),
  meta: Type.Object({
    total: Type.Integer(),
    page: Type.Integer()
  })
});

export const DeleteAdminFlashcardResponseSchema = Type.Object({
  message: Type.String()
});
