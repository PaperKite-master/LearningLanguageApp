import dns from 'node:dns';
import dnsPromises from 'node:dns/promises';
import nodemailer from 'nodemailer';

// Prefer IPv4 for SMTP (local / paid hosts). Render free tier blocks SMTP ports entirely.
dns.setDefaultResultOrder('ipv4first');

/**
 * Send via Resend HTTP API (works on Render free — uses HTTPS :443, not SMTP).
 * @see https://resend.com/docs/api-reference/emails/send-email
 */
async function sendViaResend(to, subject, html) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromName = process.env.SMTP_FROM_NAME || 'HiNa Japanese Learning';
  const fromEmail = process.env.RESEND_FROM || process.env.SMTP_FROM || 'onboarding@resend.dev';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${fromName} <${fromEmail}>`,
      to: [to],
      subject,
      html,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data?.message || data?.error || JSON.stringify(data) || res.statusText;
    const err = new Error(`Resend API error: ${detail}`);
    err.statusCode = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

async function resolveSmtpIpv4(hostname) {
  const { address } = await dnsPromises.lookup(hostname, { family: 4 });
  return address;
}

async function buildSmtpTransporter() {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const ipv4Address = await resolveSmtpIpv4(smtpHost);

  return nodemailer.createTransport({
    // Connect by IPv4 literal so Node never attempts IPv6.
    host: ipv4Address,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      servername: smtpHost,
    },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });
}

let smtpTransporterPromise;

function resetSmtpTransporter() {
  smtpTransporterPromise = undefined;
}

async function getSmtpTransporter() {
  if (!smtpTransporterPromise) {
    smtpTransporterPromise = buildSmtpTransporter();
  }
  return smtpTransporterPromise;
}

async function sendViaSmtp(to, subject, html) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    const err = new Error(
      'Thiếu cấu hình email. Trên Render free hãy thêm RESEND_API_KEY (SMTP bị chặn). Local: set SMTP_USER/SMTP_PASS.'
    );
    err.statusCode = 500;
    throw err;
  }

  const fromName = process.env.SMTP_FROM_NAME || 'HiNa Japanese Learning';
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  const mailOptions = {
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  };

  try {
    const transporter = await getSmtpTransporter();
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    if (error?.code === 'ESOCKET' || error?.code === 'ENETUNREACH' || error?.code === 'ETIMEDOUT') {
      resetSmtpTransporter();
      const err = new Error(
        'Không kết nối được SMTP (Render free thường chặn cổng 587/465). Hãy thêm RESEND_API_KEY trên Render rồi redeploy.'
      );
      err.statusCode = 502;
      err.cause = error;
      throw err;
    }
    throw error;
  }
}

/**
 * Send an email — Resend (HTTPS) if RESEND_API_KEY is set, otherwise Gmail SMTP.
 * @param {string} to recipient email address
 * @param {string} subject email subject line
 * @param {string} html email body content as HTML
 */
export async function sendEmail(to, subject, html) {
  try {
    if (process.env.RESEND_API_KEY) {
      return await sendViaResend(to, subject, html);
    }
    return await sendViaSmtp(to, subject, html);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}
