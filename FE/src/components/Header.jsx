import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Header = ({ hideActions = false }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  let user = null;
  try {
    if (userStr) user = JSON.parse(userStr);
  } catch (e) {}

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="main-header">
      <div className="header-logo">
        <Link to="/">
          <img src={logo} alt="HiNa Logo" />
        </Link>
      </div>
      {!hideActions && (
        <div className="header-actions">
          {token ? (
            <>
              <Link to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'} className="register-link">
                {user?.role === 'ADMIN' ? 'Trang quản lý' : 'Vào học'}
              </Link>
              <button onClick={handleLogout} className="login-btn-header" style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '1rem' }}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <Link to="/signup" className="register-link">Đăng ký</Link>
              <Link to="/login" className="login-btn-header">Đăng nhập</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
