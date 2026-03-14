import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
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

const Login = () => {
  return (
    <div className="app-container">
      <BackgroundLayer />
      <main className="main-content">
        <LeftColumn />
        <div className="right-column">
          
          <div className="login-form-container">
            <h1 className="login-heading">CHÀO MỪNG TRỞ LẠI<br />VỚI HINA!</h1>
            
            <p className="login-desc">
              Sẵn sàng tiếp tục? Đăng nhập bằng tài khoản cũ và tiếp tục từ nơi<br />bạn đã dừng lại.
            </p>
            
                <div className="signup-text">
                  Chưa có tài khoản? <Link to="/signup" className="signup-link">Tạo tài khoản học tập miễn phí!</Link>
                </div>
            
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="input-group">
                <User className="input-icon" size={20} />
                <input 
                  type="text" 
                  className="styled-input pill-element" 
                  placeholder="Tên đăng nhập" 
                />
              </div>
              
              <div className="input-group">
                <CustomLockIcon className="input-icon" size={20} />
                <input 
                  type="password" 
                  className="styled-input pill-element" 
                  placeholder="Mật khẩu" 
                />
              </div>
              
              <button type="submit" className="login-btn pill-element">
                Đăng nhập
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

export default Login;
