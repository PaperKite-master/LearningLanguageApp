export function formatEmailDeliveryError(error) {
  const message = String(error?.message || error || '');

  if (/535|badcredentials|username and password not accepted|invalid login/i.test(message)) {
    return 'Gmail từ chối đăng nhập SMTP: App Password sai hoặc chưa tạo đúng tài khoản nguyentuankit123@gmail.com. Tạo lại App Password, lưu BE/.env, restart backend.';
  }

  if (/missing credentials|invalid login|authentication/i.test(message)) {
    return 'Không gửi được email: server chưa cấu hình SMTP (SMTP_USER, SMTP_PASS). Liên hệ quản trị viên.';
  }

  if (/self signed certificate|certificate/i.test(message)) {
    return 'Không gửi được email: lỗi chứng chỉ SMTP. Kiểm tra cấu hình SMTP_SECURE/SMTP_HOST.';
  }

  if (/timeout|timed out|ETIMEDOUT|ECONNECTION/i.test(message)) {
    return 'Không gửi được email: không kết nối được máy chủ SMTP. Thử lại sau.';
  }

  return 'Không gửi được email OTP. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.';
}
