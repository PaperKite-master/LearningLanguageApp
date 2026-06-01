import { Type } from '@sinclair/typebox';

export const AdminUserIdParamsSchema = Type.Object({
  id: Type.String()
});

export const AdminUserRoleSchema = Type.Union([
  Type.Literal('ADMIN'),
  Type.Literal('PRO'),
  Type.Literal('USER'),
  Type.Literal('GUEST')]);

export const AdminUserStoredRoleSchema = Type.Union([
  Type.Literal('ADMIN'),
  Type.Literal('PRO'),
  Type.Literal('USER')
]);

export const AdminUserStatusSchema = Type.Union([
  Type.Literal('ACTIVE'),
  Type.Literal('INACTIVE')
]);

export const AdminUserDtoSchema = Type.Object({
  id: Type.String(),
  email: Type.Union([Type.String(), Type.Null()]),
  full_name: Type.Union([Type.String(), Type.Null()]),
  avatar_url: Type.Union([Type.String(), Type.Null()]),
  role: Type.Union([AdminUserStoredRoleSchema, Type.Null()]),
  status: AdminUserStatusSchema,
  progress: Type.Integer({ minimum: 0, maximum: 100 }),
  total_exp: Type.Union([Type.Integer(), Type.Null()]),
  target_level: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  banned_until: Type.Union([Type.String(), Type.Null()]),
  created_at: Type.Union([Type.String(), Type.Null()]),
  updated_at: Type.Union([Type.String(), Type.Null()])
});

export const AdminUsersListResponseSchema = Type.Object({
  data: Type.Array(AdminUserDtoSchema)
});

export const AdminUserResponseSchema = Type.Object({
  data: AdminUserDtoSchema
});

export const UpdateAdminUserRoleBodySchema = Type.Object({
  role: AdminUserRoleSchema
});

export const UpdateAdminUserStatusBodySchema = Type.Object({
  status: AdminUserStatusSchema
});