import { registerUseCase } from '../../Application/UseCases/register.usecase.js';
import { loginUseCase } from '../../Application/UseCases/login.usecase.js';
import { verifyOtpUseCase } from '../../Application/UseCases/verifyOtp.usecase.js';
import { forgotPasswordUseCase } from '../../Application/UseCases/forgotPassword.usecase.js';
import { resetPasswordUseCase } from '../../Application/UseCases/resetPassword.usecase.js';

export const authController = {
  async register(req, reply) {
    try {
      const result = await registerUseCase(req.server.prisma, req.body);
      return reply.code(201).send(result);
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 500).send({
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  },

  async login(req, reply) {
    try {
      const result = await loginUseCase(req.server.prisma, req.body);
      return reply.code(200).send(result);
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 401).send({
        error: err.message,
        statusCode: err.statusCode || 401,
      });
    }
  },

  async verifyOtp(req, reply) {
    try {
      const result = await verifyOtpUseCase(req.body);
      return reply.code(200).send(result);
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 400).send({
        error: err.message,
        statusCode: err.statusCode || 400,
      });
    }
  },

  async forgotPassword(req, reply) {
    try {
      const result = await forgotPasswordUseCase(req.body);
      return reply.code(200).send(result);
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 500).send({
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  },

  async resetPassword(req, reply) {
    try {
      // The authentication middleware places the verify token payload into req.user
      // We also need the raw token to pass to Supabase.
      const authHeader = req.headers['authorization'];
      const accessToken = authHeader.slice(7);

      const result = await resetPasswordUseCase({ accessToken, newPassword: req.body.newPassword });
      return reply.code(200).send(result);
    } catch (err) {
      req.log.error(err);
      return reply.code(err.statusCode || 500).send({
        error: err.message,
        statusCode: err.statusCode || 500,
      });
    }
  },

  async getProfile(req, reply) {
    try {
      // req.user is populated by earlier auth middleware
      let profile = await req.server.prisma.profiles.findUnique({
        where: { id: req.user.sub },
      });

      if (!profile) {
        // If profile is not found (e.g., first time login via Google OAuth), create one automatically
        profile = await req.server.prisma.profiles.create({
          data: {
            id: req.user.sub,
            full_name: req.user.user_metadata?.full_name || null,
            avatar_url: req.user.user_metadata?.avatar_url || req.user.user_metadata?.picture || null,
            role: 'USER',
            target_level: 'N5',
          }
        });
      }

      return reply.code(200).send({
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role,
        total_exp: profile.total_exp,
        target_level: profile.target_level,
        updated_at: profile.updated_at,
      });
    } catch (err) {
      req.log.error(err);
      return reply.code(500).send({
        error: 'Internal Server Error',
        statusCode: 500,
      });
    }
  },
};
