export const OTP_LENGTH = 6;

export function formatEmailDeliveryError(message = '') {
  const text = String(message);

  if (/535|badcredentials|username and password not accepted|invalid login/i.test(text)) {
    return 'Gmail từ chối App Password. Hãy tạo lại App Password cho đúng tài khoản Gmail, cập nhật BE/.env, lưu file (Ctrl+S) rồi restart backend.';
  }

  if (/missing credentials|invalid login|authentication|PLAIN/i.test(text)) {
    return 'Không gửi được email: cấu hình Gmail App Password trong SMTP_USER và SMTP_PASS trên server.';
  }

  if (/timeout|timed out|ETIMEDOUT|ECONNECTION/i.test(text)) {
    return 'Không gửi được email: không kết nối được máy chủ SMTP Gmail.';
  }

  if (/60 giây|429/i.test(text)) {
    return 'Vui lòng đợi 60 giây trước khi gửi lại mã OTP.';
  }

  return text || 'Không gửi được email OTP. Vui lòng thử lại sau.';
}
