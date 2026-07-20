import { createUserAdmin } from '../../Infrastructure/SupabaseAuthClient.js';
import { issueSignupOtp } from '../../Shared/signupOtpEmail.js';

/**
 * Register via Supabase (admin, no Supabase OTP email) + send OTP via Gmail SMTP.
 */
export async function registerUseCase(prisma, { email, password, fullName, role, targetLevel }) {
  let created;
  try {
    created = await createUserAdmin(email, password, {
      full_name: fullName ?? null,
    });
  } catch (error) {
    const message = String(error.message || '');
    if (/already registered|already exists|duplicate/i.test(message)) {
      const err = new Error('Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.');
      err.statusCode = 409;
      throw err;
    }
    if (/service_role|Thiếu SUPABASE_SERVICE_ROLE_KEY/i.test(message)) {
      const err = new Error('Server thiếu SUPABASE_SERVICE_ROLE_KEY trong BE/.env. Hãy thêm key rồi restart backend.');
      err.statusCode = 500;
      throw err;
    }
    throw error;
  }

  const userId = created.id;

  const userRole = role ? role.toUpperCase() : 'USER';
  await prisma.profiles.upsert({
    where: { id: userId },
    update: { full_name: fullName ?? null, role: userRole, target_level: targetLevel ?? 'N5' },
    create: {
      id: userId,
      full_name: fullName ?? null,
      role: userRole,
      target_level: targetLevel ?? 'N5',
    },
  });

  let emailSent = true;
  try {
    await issueSignupOtp(prisma, email, { resendCooldownMs: 0 });
  } catch (error) {
    emailSent = false;
    console.error('Failed to send signup OTP email:', error);
  }

  return {
    id: userId,
    email: created.email || email,
    requiresOtpVerification: true,
    emailSent,
    otpProvider: 'gmail',
    message: emailSent
      ? 'Đăng ký thành công. Vui lòng kiểm tra email Gmail để lấy mã OTP 6 số.'
      : 'Đăng ký thành công nhưng chưa gửi được email OTP. Kiểm tra SMTP Gmail trên server rồi bấm "Gửi lại mã OTP".',
  };
}

export async function resendSignupOtpUseCase(prisma, { email }) {
  await issueSignupOtp(prisma, email);
  return {
    message: 'Mã OTP mới đã được gửi qua email. Vui lòng kiểm tra hộp thư (kể cả Spam).',
  };
}
