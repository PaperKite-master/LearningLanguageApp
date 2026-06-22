import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import paymentApi from '../../api/paymentApi';
import authApi from '../../api/authApi';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import './PaymentResult.css';

const waitForTransactionSuccess = async (transactionId, maxAttempts = 30, delayMs = 3000) => {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const res = await paymentApi.verifyTransaction(transactionId);
    if (res.data?.status === 'SUCCESS') {
      return res.data;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error('Transaction not confirmed yet');
};

const syncUserProfile = async () => {
  const updatedUser = await authApi.getMe();
  localStorage.setItem('user', JSON.stringify(updatedUser));
  return updatedUser;
};

const PaymentResult = () => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  const [transactionId, setTransactionId] = useState(null);
  const [paymentSucceeded, setPaymentSucceeded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const finishSuccess = useCallback(async () => {
    await syncUserProfile();
    setStatus('success');
    setMessage('Chúc mừng! Bạn đã nâng cấp thành công lên tài khoản PRO.');
  }, []);

  const processPayment = useCallback(async () => {
    setStatus('loading');
    setMessage('Đang xác nhận giao dịch với hệ thống...');

    const params = new URLSearchParams(location.search);

    const vnp_ResponseCode = params.get('vnp_ResponseCode');
    const vnp_TxnRef = params.get('vnp_TxnRef');
    const resultCode = params.get('resultCode');
    const orderId = params.get('orderId');
    const payosCode = params.get('code');
    const payosCancel = params.get('cancel');
    const payosOrderCode = params.get('orderCode');

    const isVnPaySuccess = vnp_ResponseCode === '00';
    const isMomoSuccess = resultCode === '0';
    const isPayOsSuccess = payosCode === '00' && payosCancel !== 'true';

    const resolvedTransactionId = vnp_TxnRef || orderId || payosOrderCode;
    setTransactionId(resolvedTransactionId);

    if (!resolvedTransactionId) {
      setStatus('error');
      setPaymentSucceeded(false);
      setMessage('Không tìm thấy mã giao dịch hợp lệ.');
      return;
    }

    if (!isVnPaySuccess && !isMomoSuccess && !isPayOsSuccess) {
      setStatus('error');
      setPaymentSucceeded(false);
      setMessage('Giao dịch thất bại hoặc đã bị hủy.');
      return;
    }

    setPaymentSucceeded(true);

    try {
      await waitForTransactionSuccess(resolvedTransactionId);
      await finishSuccess();
    } catch (error) {
      console.error(error);

      try {
        const user = await syncUserProfile();
        if (user?.role === 'PRO') {
          setStatus('success');
          setMessage('Chúc mừng! Bạn đã nâng cấp thành công lên tài khoản PRO.');
          return;
        }
      } catch (profileError) {
        console.error(profileError);
      }

      setStatus('error');
      setMessage(
        'Thanh toán đã thành công. Hệ thống đang xác nhận — vui lòng bấm "Thử lại" hoặc quay lại Hồ sơ sau vài phút.'
      );
    }
  }, [location.search, finishSuccess]);

  useEffect(() => {
    processPayment();
  }, [processPayment]);

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
            <h2>{paymentSucceeded ? 'Đang xác nhận thanh toán' : 'Thanh toán thất bại'}</h2>
            <p>{message}</p>
            {paymentSucceeded && transactionId && (
              <button className="payment-btn" onClick={processPayment}>
                Thử lại
              </button>
            )}
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
