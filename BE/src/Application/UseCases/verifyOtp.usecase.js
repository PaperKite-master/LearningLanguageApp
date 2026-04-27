import { verifyOtp } from '../../Infrastructure/SupabaseAuthClient.js';

/**
 * Verify OTP (One Time Password) sent to email for sign-up or recovery.
 * 
 * If type is 'signup', it confirms the user's email.
 * If type is 'recovery', it verifies the password reset code and returns an accessToken to be used for reset.
 */
export async function verifyOtpUseCase({ email, token, type }) {
  const data = await verifyOtp(email, token, type);
  
  // verifyOtp returns the session tokens and user data on success
  let profile = null;
  // if you want to attach profile data, you could optionally fetch it here, 
  // but usually OTP verification is just to obtain the valid token.

  return {
    accessToken: data.session?.access_token || data.access_token,
    refreshToken: data.session?.refresh_token || data.refresh_token,
    expiresIn: data.session?.expires_in || data.expires_in,
    user: data.user,
    message: type === 'signup' ? 'Email verified successfully.' : 'Recovery token verified successfully.',
  };
}
