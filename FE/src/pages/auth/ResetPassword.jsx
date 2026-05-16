import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CustomLockIcon from '../../components/CustomLockIcon';
import BackgroundLayer from '../../components/BackgroundLayer';
import LeftColumn from '../../components/LeftColumn';
import authApi from '../../api/authApi';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Supabase usually sends the access token in the URL hash like #access_token=xyz&type=recovery
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        setToken(accessToken);
      } else {
        setStatus('error');
        setErrorMessage('Đường link không hợp lệ hoặc đã hết hạn.');
      }
    } else {
      setStatus('error');
      setErrorMessage('Không tìm thấy token bảo mật trong URL.');
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    if (passwords.newPassword.length < 6) {
      setStatus('error');
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setStatus('error');
      setErrorMessage('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setStatus('loading');
      await authApi.resetPassword(passwords.newPassword, token);
      setStatus('success');
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setStatus('error');
      setErrorMessage(error.message || 'Có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.');
    }
  };

  return (
    <div className="app-container">
      <BackgroundLayer />
      <main className="main-content">
        <LeftColumn />
        <div className="right-column">
          <div className="login-form-container" style={{ position: 'relative' }}>
            <Link to="/login" className="back-button" style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', gap: '5px', color: '#fff', textDecoration: 'none', opacity: 0.7 }}>
              <ArrowLeft size={16} /> Về đăng nhập
            </Link>
            
            <h1 className="login-heading" style={{ marginTop: '30px' }}>ĐẶT LẠI<br />MẬT KHẨU</h1>
            
            <p className="login-desc">
              Vui lòng nhập mật khẩu mới của bạn bên dưới.
            </p>
            
            {status === 'success' ? (
              <div className="success-message" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '15px', borderRadius: '12px', marginTop: '20px', border: '1px solid rgba(16, 185, 129, 0.3)', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Đổi mật khẩu thành công!</h3>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Hệ thống sẽ chuyển hướng về trang Đăng nhập trong giây lát...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
                <div className="input-group">
                  <CustomLockIcon className="input-icon" size={20} />
                  <input 
                    type="password" 
                    name="newPassword"
                    value={passwords.newPassword}
                    onChange={handleChange}
                    className="styled-input pill-element" 
                    placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" 
                    required
                    disabled={!token || status === 'loading'}
                  />
                </div>
                
                <div className="input-group">
                  <CustomLockIcon className="input-icon" size={20} />
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={passwords.confirmPassword}
                    onChange={handleChange}
                    className="styled-input pill-element" 
                    placeholder="Xác nhận mật khẩu mới" 
                    required
                    disabled={!token || status === 'loading'}
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
                  disabled={!token || status === 'loading'}
                  style={{ marginTop: status === 'error' ? '10px' : '25px', opacity: (!token || status === 'loading') ? 0.7 : 1 }}
                >
                  {status === 'loading' ? 'Đang xử lý...' : 'Xác nhận thay đổi'}
                </button>
              </form>
            )}
            
          </div>
        </div>
      </main>
    </div>
  );
};

export default ResetPassword;
