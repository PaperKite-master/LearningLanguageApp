import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Header = () => {
  return (
    <header className="main-header">
      <div className="header-logo">
        <img src={logo} alt="HiNa Logo" />
      </div>
      <div className="header-actions">
        <Link to="/signup" className="register-link">Đăng ký</Link>
        <Link to="/login" className="login-btn-header">Đăng nhập</Link>
      </div>
    </header>
  );
};

export default Header;
