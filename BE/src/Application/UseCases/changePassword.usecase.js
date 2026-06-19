import { signInWithPassword, updateUserPassword } from '../../Infrastructure/SupabaseAuthClient.js';

/**
 * Change the user's password using the Supabase REST API.
 * First verifies the old password.
 */
export async function changePasswordUseCase(email, oldPassword, newPassword) {
  // 1. Verify old password by attempting to sign in
  let authData;
  try {
    authData = await signInWithPassword(email, oldPassword);
  } catch (error) {
    const err = new Error('Mật khẩu cũ không chính xác.');
    err.statusCode = 400;
    throw err;
  }

  // 2. We now have an access token for this session. Use it to update the password.
  const accessToken = authData.access_token;
  try {
    await updateUserPassword(accessToken, newPassword);
  } catch (error) {
    const err = new Error('Có lỗi xảy ra khi cập nhật mật khẩu mới.');
    err.statusCode = 500;
    throw err;
  }
}
