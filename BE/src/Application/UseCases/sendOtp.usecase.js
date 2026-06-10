import { sendEmail } from '../../Infrastructure/MailClient.js';

/**
 * Send OTP use case - generates a random 6-digit code, stores it, and sends via SMTP
 * 
 * @param {import('@prisma/client').PrismaClient} prisma
 * @param {object} payload
 * @param {string} payload.email
 * @param {boolean} [payload.createUser]
 */
export async function sendOtpUseCase(prisma, { email, createUser }) {
  // Generate random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Create expiration timestamp (5 minutes from now)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Store in database
  await prisma.otp_codes.create({
    data: {
      email,
      code,
      expires_at: expiresAt,
    },
  });

  // Prepare premium HTML email
  const html = `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0b0f19; color: #ffffff; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #00e5ff; font-size: 28px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 2px;">HiNa App</h1>
        <p style="color: #9ca3af; font-size: 14px; margin: 5px 0 0 0;">Japanese for IT Professionals</p>
      </div>
      <div style="background-color: rgba(255, 255, 255, 0.02); border-radius: 12px; padding: 30px; border: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
        <h2 style="font-size: 20px; font-weight: 600; margin-top: 0; color: #ffffff;">Mã Xác Thực OTP</h2>
        <p style="color: #9ca3af; font-size: 15px; line-height: 1.6; margin-bottom: 30px;">Vui lòng sử dụng mã OTP dưới đây để xác thực đăng nhập hoặc đăng ký tài khoản của bạn. Mã này có hiệu lực trong vòng 5 phút.</p>
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
    await sendEmail(email, `${code} là mã xác thực HiNa của bạn`, html);
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return {
    message: 'OTP sent successfully. Please check your email.',
  };
}
