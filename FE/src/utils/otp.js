export const OTP_LENGTH = 6;

export function formatEmailDeliveryError(message = '') {
  const text = String(message);

  if (/535|badcredentials|username and password not accepted|invalid login/i.test(text)) {
    return 'Gmail từ chối App Password. Hãy tạo lại App Password, cập nhật SMTP_PASS (local hoặc Render paid), rồi thử lại.';
  }

  if (/RESEND_API_KEY|Render free|chặn cổng 587|ENETUNREACH|ESOCKET|ETIMEDOUT|ECONNECTION/i.test(text)) {
    return 'Render free chặn SMTP Gmail. Thêm RESEND_API_KEY trên Render (https://resend.com), Save → Redeploy, rồi bấm "Gửi lại mã OTP".';
  }

  if (/Resend API error/i.test(text)) {
    return `Lỗi gửi email Resend: ${text.replace(/^Resend API error:\s*/i, '')}`;
  }

  if (/missing credentials|authentication|PLAIN/i.test(text)) {
    return 'Không gửi được email: thiếu RESEND_API_KEY (production) hoặc SMTP_USER/SMTP_PASS (local).';
  }

  if (/60 giây|429/i.test(text)) {
    return 'Vui lòng đợi 60 giây trước khi gửi lại mã OTP.';
  }

  return text || 'Không gửi được email OTP. Vui lòng thử lại sau.';
}
