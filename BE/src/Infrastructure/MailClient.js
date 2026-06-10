import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for others
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send an email via SMTP
 * @param {string} to recipient email address
 * @param {string} subject email subject line
 * @param {string} html email body content as HTML
 */
export async function sendEmail(to, subject, html) {
  const fromName = process.env.SMTP_FROM_NAME || 'HiNa Japanese Learning';
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error('Error sending email via SMTP:', error);
    throw error;
  }
}
