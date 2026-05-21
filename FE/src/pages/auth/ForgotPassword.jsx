import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import BackgroundLayer from '../../components/BackgroundLayer';
import LeftColumn from '../../components/LeftColumn';
import authApi from '../../api/authApi';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setStatus('loading');
      await authApi.forgotPassword(email);
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại.');
    }
  };

  return (
    <div className="app-container">
      <BackgroundLayer />
      <main className="main-content">
        <LeftColumn />
        <div className="right-column">
          <div className="login-form-container">
            <Link to="/login" className="back-button" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#fff', textDecoration: 'none', opacity: 0.7, marginBottom: '20px' }}>
              <ArrowLeft size={16} /> Quay lại
            </Link>
            
            <h1 className="login-heading">QUÊN MẬT KHẨU?</h1>
            
            <p className="login-desc">
              Đừng lo lắng! Hãy nhập email bạn đã đăng ký, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
            </p>
            
            {status === 'success' ? (
              <div className="success-message" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '15px', borderRadius: '12px', marginTop: '20px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                Yêu cầu thành công! Vui lòng kiểm tra hộp thư email của bạn để lấy liên kết đặt lại mật khẩu.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
                <div className="input-group">
                  <Mail className="input-icon" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="styled-input pill-element" 
                    placeholder="Email của bạn" 
                    required
                  />
                </div>
                
                {status === 'error' && (
                  <div className="error-message" style={{ color: '#ef4444', fontSize: '14px', marginTop: '10px', marginBottom: '10px' }}>
                    {errorMessage}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="login-btn pill-element"
                  disabled={status === 'loading'}
                  style={{ marginTop: status === 'error' ? '10px' : '25px', opacity: status === 'loading' ? 0.7 : 1, whiteSpace: 'nowrap' }}
                >
                  {status === 'loading' ? 'Đang gửi...' : 'Gửi yêu cầu khôi phục'}
                </button>
              </form>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
