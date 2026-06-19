import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import authApi from '../../api/authApi';
import Header from '../../components/Header';
import computer from '../../assets/computer.png';
import './Auth.css';

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
    <div className="auth-page-container">
      <Header hideActions />
      
      <main className="auth-main-content">
        
        {/* Left Column - Illustration */}
        <div className="auth-left-column">
          <img 
            src={computer} 
            alt="HiNa Digital Learning" 
            className="auth-illustration" 
          />
        </div>
        
        {/* Right Column - Form */}
        <div className="auth-right-column">
          <div className="auth-form-container">
            <Link to="/login" className="auth-forgot-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '30px', color: '#6b7280', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Quay lại đăng nhập
            </Link>
            
            <h1 className="auth-heading">QUÊN MẬT KHẨU?</h1>
            
            <div className="auth-desc">
              Đừng lo lắng! Hãy nhập email bạn đã đăng ký, chúng tôi sẽ gửi liên kết để đặt lại mật khẩu.
            </div>
            
            {status === 'success' ? (
              <div style={{ background: '#ecfdf5', color: '#10b981', padding: '15px', borderRadius: '12px', marginTop: '20px', border: '1px solid #a7f3d0' }}>
                Yêu cầu thành công! Vui lòng kiểm tra hộp thư email của bạn để lấy liên kết đặt lại mật khẩu.
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
                <div className="auth-input-group">
                  <label className="auth-input-label">Email</label>
                  <div className="auth-input-wrapper">
                    <Mail className="auth-input-icon" size={20} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="auth-input" 
                      placeholder="Nhập địa chỉ email" 
                      required
                    />
                  </div>
                </div>
                
                {status === 'error' && (
                  <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '10px', marginBottom: '10px' }}>
                    {errorMessage}
                  </div>
                )}
                
                <button 
                  type="submit" 
                  className="auth-submit-btn"
                  disabled={status === 'loading'}
                  style={{ marginTop: status === 'error' ? '10px' : '15px', opacity: status === 'loading' ? 0.7 : 1 }}
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
