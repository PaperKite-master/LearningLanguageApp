import { authController } from '../Controllers/auth.controller.js';
import { authenticate } from '../Middlewares/authenticate.js';
import {
  RegisterBodySchema,
  RegisterResponseSchema,
  LoginBodySchema,
  LoginResponseSchema,
  VerifyOtpBodySchema,
  ForgotPasswordBodySchema,
  ResetPasswordBodySchema,
  GenericMessageResponseSchema,
  ProfileResponseSchema,
  ErrorResponseSchema,
  SendOtpBodySchema,
} from '../Schemas/auth.schema.js';

export async function authRoutes(fastify, options) {
  fastify.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description: 'Creates a new user and sends an email verification link.',
      body: RegisterBodySchema,
      response: {
        201: RegisterResponseSchema,
        400: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: authController.register,
  });

  fastify.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login with email and password',
      description: 'Logs in and returns the JWT tokens.',
      body: LoginBodySchema,
      response: {
        200: LoginResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: authController.login,
  });

  fastify.post('/forgot-password', {
    schema: {
      tags: ['Auth'],
      summary: 'Request password reset OTP',
      description: 'Sends an OTP to the email. Use /verify (type: recovery) with the OTP to get an access token.',
      body: ForgotPasswordBodySchema,
      response: {
        200: GenericMessageResponseSchema,
        400: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: authController.forgotPassword,
  });

  fastify.post('/reset-password', {
    preHandler: [authenticate],
    schema: {
      tags: ['Auth'],
      summary: 'Reset password',
      description: 'Resets the password. Requires the Bearer token obtained from /verify (type: recovery).',
      security: [{ bearerAuth: [] }],
      body: ResetPasswordBodySchema,
      response: {
        200: GenericMessageResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: authController.resetPassword,
  });

  fastify.get('/me', {
    preHandler: [authenticate],
    schema: {
      tags: ['Auth'],
      summary: 'Get current user profile',
      description: 'Retrieves the currently authenticated user based on JWT.',
      security: [{ bearerAuth: [] }],
      response: {
        200: ProfileResponseSchema,
        401: ErrorResponseSchema,
        404: ErrorResponseSchema,
      },
    },
    handler: authController.getProfile,
  });

  fastify.post('/send-otp', {
    schema: {
      tags: ['Auth'],
      summary: 'Send an OTP to email',
      description: 'Triggers sending a 6-digit OTP code to the provided email address.',
      body: SendOtpBodySchema,
      response: {
        200: GenericMessageResponseSchema,
        400: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: authController.sendOtp,
  });

  fastify.post('/verify-otp', {
    schema: {
      tags: ['Auth'],
      summary: 'Verify OTP code',
      description: 'Verifies the OTP code for signup, login (type: email), or recovery, and returns JWT tokens + user profile (if type is signup/email).',
      body: VerifyOtpBodySchema,
      response: {
        200: LoginResponseSchema,
        400: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
    handler: authController.verifyOtp,
  });
}
