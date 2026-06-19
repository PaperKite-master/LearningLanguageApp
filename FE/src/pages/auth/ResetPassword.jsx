import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff } from 'lucide-react';
import authApi from '../../api/authApi';
import Header from '../../components/Header';
import computer from '../../assets/computer.png';
import './Auth.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
              <ArrowLeft size={16} /> Về đăng nhập
            </Link>
            
            <h1 className="auth-heading">ĐẶT LẠI MẬT KHẨU</h1>
            
            <div className="auth-desc">
              Vui lòng nhập mật khẩu mới của bạn bên dưới.
            </div>
            
            {status === 'success' ? (
              <div style={{ background: '#ecfdf5', color: '#10b981', padding: '15px', borderRadius: '12px', marginTop: '20px', border: '1px solid #a7f3d0', textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 10px 0' }}>Đổi mật khẩu thành công!</h3>
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>Hệ thống sẽ chuyển hướng về trang Đăng nhập trong giây lát...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
                <div className="auth-input-group">
                  <label className="auth-input-label">Mật khẩu mới</label>
                  <div className="auth-input-wrapper">
                    <Lock className="auth-input-icon" size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      name="newPassword"
                      value={passwords.newPassword}
                      onChange={handleChange}
                      className="auth-input" 
                      placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" 
                      required
                      disabled={!token || status === 'loading'}
                    />
                    <button 
                      type="button" 
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div className="auth-input-group">
                  <label className="auth-input-label">Xác nhận mật khẩu mới</label>
                  <div className="auth-input-wrapper">
                    <Lock className="auth-input-icon" size={20} />
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirmPassword"
                      value={passwords.confirmPassword}
                      onChange={handleChange}
                      className="auth-input" 
                      placeholder="Xác nhận mật khẩu mới" 
                      required
                      disabled={!token || status === 'loading'}
                    />
                    <button 
                      type="button" 
                      className="auth-password-toggle"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
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
                  disabled={!token || status === 'loading'}
                  style={{ marginTop: status === 'error' ? '10px' : '15px', opacity: (!token || status === 'loading') ? 0.7 : 1 }}
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
