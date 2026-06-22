import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import paymentApi from '../../api/paymentApi';
import authApi from '../../api/authApi';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import './PaymentResult.css';

const waitForTransactionSuccess = async (transactionId, maxAttempts = 15, delayMs = 2000) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const res = await paymentApi.verifyTransaction(transactionId);
    if (res.data?.status === 'SUCCESS') {
      return res.data;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error('Transaction not confirmed yet');
};

const PaymentResult = () => {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processPayment = async () => {
      const params = new URLSearchParams(location.search);
      
      // VNPay params
      const vnp_ResponseCode = params.get('vnp_ResponseCode');
      const vnp_TxnRef = params.get('vnp_TxnRef');
      
      // MoMo params
      const resultCode = params.get('resultCode');
      const orderId = params.get('orderId');

      // PayOS params
      const payosCode = params.get('code');
      const payosCancel = params.get('cancel');
      const payosOrderCode = params.get('orderCode');

      const isVnPaySuccess = vnp_ResponseCode === '00';
      const isMomoSuccess = resultCode === '0';
      const isPayOsSuccess = payosCode === '00' && payosCancel !== 'true';
      
      const transactionId = vnp_TxnRef || orderId || payosOrderCode;

      if (!transactionId) {
        setStatus('error');
        setMessage('Không tìm thấy mã giao dịch hợp lệ.');
        return;
      }

      if (isVnPaySuccess || isMomoSuccess || isPayOsSuccess) {
        try {
          await waitForTransactionSuccess(transactionId);
          const updatedUser = await authApi.getMe();
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          setStatus('success');
          setMessage('Chúc mừng! Bạn đã nâng cấp thành công lên tài khoản PRO.');
        } catch (error) {
          console.error(error);
          setStatus('error');
          setMessage('Giao dịch thành công nhưng có lỗi khi cập nhật tài khoản. Vui lòng liên hệ hỗ trợ.');
        }
      } else {
        setStatus('error');
        setMessage('Giao dịch thất bại hoặc đã bị hủy.');
      }
    };

    processPayment();
  }, [location]);

  return (
    <div className="payment-result-container">
      <div className="payment-result-card">
        {status === 'loading' && (
          <>
            <Loader className="payment-icon loading-spin" size={64} color="#0ea5e9" />
            <h2>Đang xử lý...</h2>
            <p>{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="payment-icon success-color" size={64} color="#22c55e" />
            <h2>Thanh toán thành công!</h2>
            <p>{message}</p>
            <button className="payment-btn" onClick={() => navigate('/profile')}>
              Quay lại Hồ sơ
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="payment-icon error-color" size={64} color="#ef4444" />
            <h2>Thanh toán thất bại</h2>
            <p>{message}</p>
            <button className="payment-btn payment-btn-outline" onClick={() => navigate('/profile')}>
              Quay lại Hồ sơ
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResult;
