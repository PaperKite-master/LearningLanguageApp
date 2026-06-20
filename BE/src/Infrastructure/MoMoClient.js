import crypto from 'crypto';

export const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
  accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
  secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
  endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
};

export const MoMoClient = {
  /**
   * Create MoMo Payment Link
   */
  async createPayment(orderId, amount, orderInfo, redirectUrl, ipnUrl) {
    const { partnerCode, accessKey, secretKey, endpoint } = momoConfig;
    const requestId = orderId;
    const requestType = "captureWallet";
    const extraData = "";

    // Build raw signature string
    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    
    // Hash HMAC SHA256
    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    const requestBody = {
      partnerCode,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      requestType,
      autoCapture: true,
      extraData,
      signature
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  /**
   * Verify MoMo IPN Signature
   */
  verifyIpnSignature(query) {
    const { partnerCode, secretKey } = momoConfig;
    const {
      amount, extraData, message, orderId, orderInfo, orderType, 
      requestId, responseTime, resultCode, transId, signature
    } = query;

    const rawSignature = `accessKey=${momoConfig.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${query.payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(rawSignature)
      .digest('hex');

    return signature === expectedSignature;
  }
};
