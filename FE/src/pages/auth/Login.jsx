import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import authApi from '../../api/authApi';
import Header from '../../components/Header';
import computer from '../../assets/computer.png';
import './Auth.css';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    <path fill="none" d="M1 1h22v22H1z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#1d4ed8">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 384 512" width="16" height="16" fill="#000000">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 24 184.8 8 273.5q-9 53.5 32.7 131.5c24 45.3 53.3 93 103 91.5 49.3-1.6 63.4-30.8 119.5-30.8 55.6 0 68 30.8 119.5 30.8 51.5 0 77.2-44.1 101.4-89.9 31.2-59 42.7-111 44.5-113.8-1.5-1-49.9-19.5-50.5-94.2zm-127.3-176c24.5-29.3 40.1-71.1 35.6-112.5-35.7 1.4-81 23.5-106.6 52.8-20.4 23.4-39.1 66.8-33.8 107.5 40.5 3.1 84-21.7 104.8-47.8z"/>
  </svg>
);

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const payload = {
      email: formData.email,
      password: formData.password
    };
    
    try {
      const result = await authApi.login(payload);
      console.log('Login success:', result.message);
      
      const user = result.user || {};
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      alert('Đăng nhập thất bại: ' + error.message);
    }
  };

  const handleGoogleLogin = () => {
    const redirectUrl = `${window.location.origin}/`;
    window.location.href = `https://ohhddvagmhlylklypknj.supabase.co/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="auth-page-container">
      {/* Reusing the Header component */}
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
            <h1 className="auth-heading">CHÀO MỪNG<br />TRỞ LẠI VỚI HINA!</h1>
            
            <div className="auth-social-buttons">
              <button type="button" className="auth-social-btn google" onClick={handleGoogleLogin}>
                <div className="social-icon"><GoogleIcon /></div>
                Đăng nhập bằng Google
              </button>
              
              <button type="button" className="auth-social-btn facebook" onClick={() => alert('Đăng nhập bằng Facebook chưa được cấu hình')}>
                <div className="social-icon"><FacebookIcon /></div>
                Đăng nhập bằng Facebook
              </button>

              <button type="button" className="auth-social-btn apple" onClick={() => alert('Đăng nhập bằng Apple chưa được cấu hình')}>
                <div className="social-icon"><AppleIcon /></div>
                Đăng nhập với Apple
              </button>
            </div>
            
            <div className="auth-divider">
              <span className="auth-divider-text">or continue with</span>
            </div>
            
            <form onSubmit={handleLogin}>
              <div className="auth-input-group">
                <label className="auth-input-label">Email</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" size={20} />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="auth-input" 
                    placeholder="Enter email address" 
                    required
                  />
                </div>
              </div>
              
              <div className="auth-input-group">
                <label className="auth-input-label">Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="auth-input" 
                    placeholder="Enter Password" 
                    required
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

              <div className="auth-form-options">
                <label className="auth-checkbox-label">
                  <input type="checkbox" className="auth-checkbox" />
                  Remember Me
                </label>
                <Link to="/forgot-password" className="auth-forgot-link">
                  Forgot Password?
                </Link>
              </div>
              
              <button type="submit" className="auth-submit-btn">
                Login
              </button>
            </form>
            
            <div className="auth-footer-text">
              Don't have an account? <Link to="/signup" className="auth-footer-link">Sign Up</Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Login;
