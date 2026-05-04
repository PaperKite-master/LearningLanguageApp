import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import CustomLockIcon from '../../components/CustomLockIcon';
import BackgroundLayer from '../../components/BackgroundLayer';
import LeftColumn from '../../components/LeftColumn';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

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
      console.log('Admin login success:', result.message);
      navigate('/admin/dashboard');
    } catch (error) {
      alert('Đăng nhập Admin thất bại: ' + error.message);
    }
  };

  return (
    <div className="app-container admin-login-wrapper">
      <BackgroundLayer />
      <main className="main-content admin-main">
        
        <LeftColumn />

        {/* Right Side: The Admin Login Panel */}
        <div className="admin-right-column">
          <div className="login-form-container">
            <h1 className="admin-login-heading">CHÀO MỪNG ADMIN<br />TRỞ LẠI VỚI HINA!</h1>
            
            <form onSubmit={handleLogin} className="admin-login-form">
              
              <div className="admin-input-group">
                <div className="admin-icon-wrapper">
                  <Mail size={18} color="#a0a8b9" strokeWidth={2} />
                </div>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="admin-input" 
                  placeholder="Email Admin" 
                  required
                />
              </div>
              
              <div className="admin-input-group">
                <div className="admin-icon-wrapper">
                  <CustomLockIcon size={18} color="#a0a8b9" />
                </div>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="admin-input" 
                  placeholder="Mật khẩu" 
                  required
                />
              </div>
              
              <button type="submit" className="login-btn pill-element">
                Đăng nhập
              </button>
              
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;
