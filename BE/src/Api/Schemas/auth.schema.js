import { Type } from '@sinclair/typebox';

export const RegisterBodySchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 255, description: 'User email address' }),
  password: Type.String({ minLength: 8, maxLength: 32, pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,32}$', description: 'Password (8-32 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special character)', examples: ['Password123!'] }),
  fullName: Type.Optional(Type.String({ minLength: 2, maxLength: 100, description: 'Display name' })),
  role: Type.Optional(Type.Union([
    Type.Literal('USER'),
    Type.Literal('ADMIN'),
    Type.Literal('GUEST')
  ], { description: 'Role of the user (USER, ADMIN, GUEST)', default: 'USER' })),
  targetLevel: Type.Optional(Type.String({ description: 'Target JLPT level (e.g. N5, N4, N3)', default: 'N5' })),
});



export const ForgotPasswordBodySchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 255, description: 'User email address' }),
});

export const ResetPasswordBodySchema = Type.Object({
  newPassword: Type.String({ minLength: 8, maxLength: 32, pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,32}$', description: 'New password (8-32 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special character)', examples: ['Password123!'] }),
});

export const LoginBodySchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 255, description: 'User email address' }),
  password: Type.String({ minLength: 8, maxLength: 32, pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,32}$', description: 'User password', examples: ['Password123!'] }),
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
    targetLevel: Type.Optional(Type.Union([Type.String(), Type.Null()])),
  })),
});

export const ProfileResponseSchema = Type.Object({
  id: Type.String(),
  full_name: Type.Union([Type.String(), Type.Null()]),
  avatar_url: Type.Union([Type.String(), Type.Null()]),
  role: Type.Union([Type.String(), Type.Null()]),
  total_exp: Type.Union([Type.Number(), Type.Null()]),
  target_level: Type.Union([Type.String(), Type.Null()]),
  updated_at: Type.Union([Type.String(), Type.Null()]),
});

export const ErrorResponseSchema = Type.Object({
  error: Type.String(),
  statusCode: Type.Number(),
  message: Type.Optional(Type.String()),
});

export const SendOtpBodySchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 255, description: 'User email address' }),
  createUser: Type.Optional(Type.Boolean({ default: true, description: 'Whether to create user if they do not exist' })),
});

export const VerifyOtpBodySchema = Type.Object({
  email: Type.String({ format: 'email', maxLength: 255, description: 'User email address' }),
  token: Type.String({ minLength: 6, maxLength: 8, description: 'OTP code' }),
  type: Type.Union([
    Type.Literal('email'),
    Type.Literal('signup'),
    Type.Literal('recovery')
  ], { description: 'Verification type: email (login), signup, recovery' }),
});

