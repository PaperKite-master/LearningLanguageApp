import { Type } from '@sinclair/typebox';

export const AdminHeadersSchema = Type.Object({
  'x-admin-key': Type.Optional(Type.String()),
  'x-role': Type.Optional(Type.String())
});

