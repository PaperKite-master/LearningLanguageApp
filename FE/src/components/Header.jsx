import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { useAuth, useLogout } from '../context/AuthContext';

const Header = ({ hideActions = false }) => {
  const { status, user, isAuthenticated } = useAuth();
  const handleLogout = useLogout();

  return (
    <header className="main-header">
      <div className="header-logo">
        <Link to="/">
          <img src={logo} alt="HiNa Logo" />
        </Link>
      </div>
      {!hideActions && (
        <div className="header-actions">
          {status === 'loading' ? null : isAuthenticated ? (
            <>
              <Link to={user?.role === 'ADMIN' ? '/admin/dashboard' : '/study'} className="register-link">
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
