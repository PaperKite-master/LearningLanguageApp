import { recoverPassword } from '../../Infrastructure/SupabaseAuthClient.js';

/**
 * Send a forgot password email containing the recovery OTP code.
 */
export async function forgotPasswordUseCase({ email }) {
  await recoverPassword(email);

  return {
    message: 'If the email exists, a password reset code has been sent.',
  };
}
