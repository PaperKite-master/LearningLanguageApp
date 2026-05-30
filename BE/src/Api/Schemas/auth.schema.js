import { Type } from '@sinclair/typebox';

export const RegisterBodySchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 255, description: 'User email address' }),
  password: Type.String({ minLength: 8, maxLength: 32, pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,32}$', description: 'Password (8-32 chars, at least 1 uppercase, 1 lowercase, 1 number)' }),
  fullName: Type.Optional(Type.String({ minLength: 2, maxLength: 100, description: 'Display name' })),
  role: Type.Optional(Type.Union([
    Type.Literal('USER'),
    Type.Literal('ADMIN'),
    Type.Literal('GUEST')
  ], { description: 'Role of the user (USER, ADMIN, GUEST)', default: 'USER' })),
});



export const ForgotPasswordBodySchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 255, description: 'User email address' }),
});

export const ResetPasswordBodySchema = Type.Object({
  newPassword: Type.String({ minLength: 8, maxLength: 32, pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,32}$', description: 'New password (8-32 chars, at least 1 uppercase, 1 lowercase, 1 number)' }),
});

export const LoginBodySchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 255, description: 'User email address' }),
  password: Type.String({ minLength: 8, maxLength: 32, pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,32}$', description: 'User password' }),
});

export const GenericMessageResponseSchema = Type.Object({
  message: Type.String(),
});

export const RegisterResponseSchema = Type.Object({
  id: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  email: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  message: Type.String(),
});

export const LoginResponseSchema = Type.Object({
  accessToken: Type.Optional(Type.String()),
  refreshToken: Type.Optional(Type.String()),
  expiresIn: Type.Optional(Type.Number()),
  tokenType: Type.Optional(Type.String()),
  message: Type.Optional(Type.String()),
  user: Type.Optional(Type.Object({
    id: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    role: Type.Optional(Type.String()),
    fullName: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    avatarUrl: Type.Optional(Type.Union([Type.String(), Type.Null()])),
    totalExp: Type.Optional(Type.Number()),
  })),
});

export const ProfileResponseSchema = Type.Object({
  id: Type.String(),
  full_name: Type.Union([Type.String(), Type.Null()]),
  avatar_url: Type.Union([Type.String(), Type.Null()]),
  role: Type.Union([Type.String(), Type.Null()]),
  total_exp: Type.Union([Type.Number(), Type.Null()]),
  updated_at: Type.Union([Type.String(), Type.Null()]),
});

export const ErrorResponseSchema = Type.Object({
  error: Type.String(),
  statusCode: Type.Number(),
});
