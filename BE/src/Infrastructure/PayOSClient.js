import PayOSModule from '@payos/node';

const PayOS = PayOSModule.PayOS || PayOSModule;

// Lấy credentials từ biến môi trường hoặc dùng giá trị rỗng mặc định để tránh lỗi crash lúc khởi động nếu chưa điền key
const clientId = process.env.PAYOS_CLIENT_ID || 'dummy-client-id';
const apiKey = process.env.PAYOS_API_KEY || 'dummy-api-key';
const checksumKey = process.env.PAYOS_CHECKSUM_KEY || 'dummy-checksum-key';

export const payOS = new PayOS({
  clientId: clientId,
  apiKey: apiKey,
  checksumKey: checksumKey
});
