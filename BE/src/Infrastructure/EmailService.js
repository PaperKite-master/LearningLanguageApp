import nodemailer from 'nodemailer';

/**
 * Nodemailer transporter using Gmail SMTP (App Password).
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // STARTTLS on port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
/**
 * Send the daily study reminder email to a user.
 * @param {string} to       - recipient email address
 * @param {string} name     - recipient display name (for personalisation)
 */
export async function sendReminderEmail(to, name) {
  const displayName = name || 'bạn';

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Nhắc nhở học bài</title>
</head>
<body style="margin:0;padding:0;background:#f0f4ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6c63ff 0%,#3b82f6 100%);padding:40px 48px;text-align:center;">
              <div style="font-size:48px;margin-bottom:8px;">🎌</div>
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;letter-spacing:-0.5px;">LearningApp</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 48px 32px;text-align:center;">
              <h2 style="color:#1e1b4b;font-size:22px;margin:0 0 16px;font-weight:700;">
                Xin chào, ${displayName}! 👋
              </h2>
              <p style="color:#4b5563;font-size:16px;line-height:1.7;margin:0 0 24px;">
                Đã đến giờ học tiếng Nhật rồi! Hãy truy cập vào website để tiếp tục bài học của bạn nhé.
              </p>
              <!-- CTA Button -->
              <div style="margin-bottom:16px;">
                <a href="#" style="display:inline-block;background:linear-gradient(135deg,#6c63ff,#3b82f6);color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;padding:16px 40px;border-radius:50px;box-shadow:0 4px 15px rgba(108,99,255,0.4);">
                  🚀 Bắt đầu học ngay
                </a>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: '🎌 Đến giờ học tiếng Nhật rồi! Đừng bỏ lỡ hôm nay nhé~',
    html,
  });
}

/**
 * Verify SMTP connection on startup (optional, logs result).
 */
export async function verifySMTPConnection() {
  try {
    await transporter.verify();
    console.log('[EmailService] SMTP connection OK ✓');
  } catch (err) {
    console.error('[EmailService] SMTP connection FAILED:', err.message);
  }
}
