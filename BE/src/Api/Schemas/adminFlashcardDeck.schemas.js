export const AdminFlashcardDeckIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', format: 'uuid' }
  }
};

export const AdminFlashcardDeckResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        description: { type: 'string', nullable: true },
        totalCards: { type: 'number' },
        createdAt: { type: 'string', format: 'date-time', nullable: true },
        updatedAt: { type: 'string', format: 'date-time', nullable: true }
      }
    }
  }
};

export const ListAdminFlashcardDecksQuerySchema = {
  type: 'object',
  properties: {
    search: { type: 'string' },
    page: { type: 'integer', minimum: 1, default: 1 },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 }
  }
};

export const ListAdminFlashcardDecksResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    data: {
      type: 'array',
      items: AdminFlashcardDeckResponseSchema.properties.data
    },
    meta: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        page: { type: 'number' }
      }
    }
  }
};

export const CreateAdminFlashcardDeckBodySchema = {
  type: 'object',
  required: ['name'],
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', nullable: true }
  }
};

export const UpdateAdminFlashcardDeckBodySchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1 },
    description: { type: 'string', nullable: true }
  }
};

export const DeleteAdminFlashcardDeckResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' }
  }
};
