import { updateUserPassword } from '../../Infrastructure/SupabaseAuthClient.js';

/**
 * Reset user password using the accessToken obtained from verifyOtp (type: recovery).
 */
export async function resetPasswordUseCase({ accessToken, newPassword }) {
  if (!accessToken) {
    const err = Object.assign(new Error('Access token is required'), { statusCode: 401 });
    throw err;
  }

  await updateUserPassword(accessToken, newPassword);

  return {
    message: 'Password successfully updated.',
  };
}
