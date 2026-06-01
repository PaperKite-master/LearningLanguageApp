import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Smartphone, Eye, EyeOff } from 'lucide-react';
import CustomLockIcon from '../../components/CustomLockIcon';
import BackgroundLayer from '../../components/BackgroundLayer';
import LeftColumn from '../../components/LeftColumn';
import authApi from '../../api/authApi';

const GoogleIcon = () => (
  <svg className="google-icon" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path fill="none" d="M1 1h22v22H1z" />
  </svg>
);

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Họ và tên không được để trống";
    if (!formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,32}$/.test(formData.password)) {
      newErrors.password = "Mật khẩu phải từ 8-32 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt";
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    
    if (!formData.email.trim()) newErrors.email = "Email không được để trống";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const payload = {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: "USER"
        };
        await authApi.register(payload);
        alert('Đăng ký tài khoản thành công!');
        navigate('/login');
      } catch (error) {
        console.error('Registration failed:', error);
        setErrors({ submit: error.response?.data?.error || 'Đăng ký thất bại. Vui lòng thử lại.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="app-container">
      <BackgroundLayer />
      <main className="main-content">
        <LeftColumn />
        <div className="right-column">
          
          <div className="login-form-container register-container">
            <h1 className="login-heading">CHÀO MỪNG ĐẾN VỚI<br />HINA!</h1>
            
            <p className="login-desc">
              Nền tảng ngôn ngữ được thiết kế riêng cho các lập trình viên.
            </p>
            
            <p className="signup-text">
              Đã có tài khoản rồi? <Link to="/login" className="signup-link">Đăng nhập lại.</Link>
            </p>
            
            {errors.submit && <div className="error-message" style={{ color: '#ef4444', textAlign: 'center', marginBottom: '15px' }}>{errors.submit}</div>}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`styled-input pill-element ${errors.fullName ? 'input-error' : ''}`} 
                  placeholder="Họ và tên" 
                />
                {errors.fullName && <span className="error-text">{errors.fullName}</span>}
              </div>
              
              <div className="input-group">
                <CustomLockIcon className="input-icon" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`styled-input pill-element ${errors.password ? 'input-error' : ''}`} 
                  placeholder="Mật khẩu" 
                />
                <button 
                  type="button" 
                  className="toggle-password-btn" 
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {errors.password && <span className="error-text">{errors.password}</span>}
              </div>

              <div className="input-group">
                <CustomLockIcon className="input-icon" size={20} />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`styled-input pill-element ${errors.confirmPassword ? 'input-error' : ''}`} 
                  placeholder="Xác nhận mật khẩu" 
                />
                <button 
                  type="button" 
                  className="toggle-password-btn" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
                {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
              </div>

              <div className="input-group">
                <Mail className="input-icon" size={20} />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`styled-input pill-element ${errors.email ? 'input-error' : ''}`} 
                  placeholder="Email" 
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>


              
              <button type="submit" className="login-btn pill-element" disabled={isLoading}>
                {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>
            
            <div className="divider">
              <span className="divider-text">HOẶC</span>
            </div>
            
            <button type="button" className="social-btn pill-element">
              <GoogleIcon />
              <span>Tiếp tục qua google</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Signup;
