import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Smartphone, Eye, EyeOff } from 'lucide-react';
import CustomLockIcon from '../../components/CustomLockIcon';
import BackgroundLayer from '../../components/BackgroundLayer';
import LeftColumn from '../../components/LeftColumn';

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
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: ''
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Tên đăng nhập không được để trống";
    if (!formData.password) newErrors.password = "Mật khẩu không được để trống";
    else if (formData.password.length < 6) newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }
    
    if (!formData.email.trim()) newErrors.email = "Email không được để trống";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email không hợp lệ";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form is valid', formData);
      // Proceed with registration
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
            
            <form onSubmit={handleSubmit} className="register-form">
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`styled-input pill-element ${errors.username ? 'input-error' : ''}`} 
                  placeholder="Tên đăng nhập" 
                />
                {errors.username && <span className="error-text">{errors.username}</span>}
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

              <div className="input-group">
                <Smartphone className="input-icon" size={20} />
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="styled-input pill-element" 
                  placeholder="Số điện thoại" 
                />
              </div>
              
              <button type="submit" className="login-btn pill-element">
                Đăng ký
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
