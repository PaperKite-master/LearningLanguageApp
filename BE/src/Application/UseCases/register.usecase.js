import { signUp } from '../../Infrastructure/SupabaseAuthClient.js';
import { sendEmail } from '../../Infrastructure/MailClient.js';

/**
 * Register a new user via Supabase Auth, save profile, and send verification OTP code.
 * 
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {object} payload
 * @param {string} payload.email
 * @param {string} payload.password
 * @param {string} [payload.fullName]
 * @param {string} [payload.role]
 * @param {string} [payload.targetLevel]
 */
export async function registerUseCase(prisma, { email, password, fullName, role, targetLevel }) {
  // 1. Call standard Supabase signup (creates the user in Supabase Auth)
  const data = await signUp(email, password);
  const userId = data.user?.id;

  if (userId) {
    // 2. Upsert profile in public.profiles
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
  }

  // 3. Generate random 6-digit OTP code for registration confirmation
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

  // Store OTP in database
  await prisma.otp_codes.create({
    data: {
      email,
      code,
      expires_at: expiresAt,
    },
  });

  // Prepare HTML email template
  const html = `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0b0f19; color: #ffffff; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00e5ff; font-size: 28px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 2px;">HiNa App</h1>
        <p style="color: #9ca3af; font-size: 14px; margin: 5px 0 0 0;">Japanese for IT Professionals</p>
      </div>
      <div style="background-color: rgba(255, 255, 255, 0.02); border-radius: 12px; padding: 30px; border: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
        <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; color: #ffffff;">Xác Nhận Đăng Ký Tài Khoản</h2>
        <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">Cảm ơn bạn đã đăng ký học tập tại HiNa! Vui lòng nhập mã OTP dưới đây để xác thực email và kích hoạt tài khoản của bạn. Mã này có hiệu lực trong vòng 5 phút.</p>
        <div style="background: linear-gradient(135deg, #A855F7 0%, #3B0764 100%); padding: 15px 40px; border-radius: 8px; display: inline-block; margin-bottom: 20px;">
          <span style="font-size: 36px; font-weight: 800; color: #ffffff; letter-spacing: 6px; font-family: monospace;">${code}</span>
        </div>
        <p style="color: #ef4444; font-size: 13px; margin: 15px 0 0 0;">* Tuyệt đối không chia sẻ mã xác thực này với bất kỳ ai.</p>
      </div>
      <div style="text-align: center; margin-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 20px;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">&copy; 2026 HiNa Japanese Learning. All rights reserved.</p>
      </div>
    </div>
  `;

  // Send the email
  try {
    await sendEmail(email, `${code} là mã xác nhận đăng ký tài khoản HiNa`, html);
  } catch (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }

  return {
    id: userId || null,
    email: data.user?.email || email,
    message: 'Register successful. Please check your email for the verification code.',
  };
}

