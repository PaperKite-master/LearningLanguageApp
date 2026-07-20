import { sendEmail } from '../Infrastructure/MailClient.js';
import { generateOtpCode } from './otp.js';

export function buildSignupOtpEmailHtml(code) {
  return `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0b0f19; color: #ffffff; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00e5ff; font-size: 28px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 2px;">HiNa App</h1>
        <p style="color: #9ca3af; font-size: 14px; margin: 5px 0 0 0;">Japanese for IT Professionals</p>
      </div>
      <div style="background-color: rgba(255, 255, 255, 0.02); border-radius: 12px; padding: 30px; border: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
        <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; color: #ffffff;">Xác Nhận Đăng Ký Tài Khoản</h2>
        <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">Cảm ơn bạn đã đăng ký học tập tại HiNa! Nhập mã OTP dưới đây trong ứng dụng để kích hoạt tài khoản. Mã có hiệu lực 5 phút.</p>
        <div style="background: linear-gradient(135deg, #A855F7 0%, #3B0764 100%); padding: 15px 40px; border-radius: 8px; display: inline-block; margin-bottom: 20px;">
          <span style="font-size: 36px; font-weight: 800; color: #ffffff; letter-spacing: 2px; font-family: monospace;">${code}</span>
        </div>
        <p style="color: #ef4444; font-size: 13px; margin: 15px 0 0 0;">* Tuyệt đối không chia sẻ mã xác thực này với bất kỳ ai.</p>
      </div>
      <div style="text-align: center; margin-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 20px;">
        <p style="color: #6b7280; font-size: 12px; margin: 0;">&copy; 2026 HiNa Japanese Learning. All rights reserved.</p>
      </div>
    </div>
  `;
}

export async function issueSignupOtp(prisma, email, { resendCooldownMs = 60_000 } = {}) {
  if (resendCooldownMs > 0) {
    const recent = await prisma.otp_codes.findFirst({
      where: {
        email,
        used: false,
        created_at: { gte: new Date(Date.now() - resendCooldownMs) },
      },
      orderBy: { created_at: 'desc' },
    });

    if (recent) {
      const err = new Error('Vui lòng đợi 60 giây trước khi gửi lại mã OTP.');
      err.statusCode = 429;
      throw err;
    }
  }

  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.otp_codes.create({
    data: {
      email,
      code,
      expires_at: expiresAt,
    },
  });

  const html = buildSignupOtpEmailHtml(code);
  await sendEmail(email, `${code} là mã xác nhận đăng ký HiNa`, html);

  return code;
}
