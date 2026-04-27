import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomLockIcon from '../../components/CustomLockIcon';
import BackgroundLayer from '../../components/BackgroundLayer';
import LeftColumn from '../../components/LeftColumn';

const AdminLogin = () => {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate API login, then redirect
    navigate('/admin/dashboard');
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
                  <User size={18} color="#a0a8b9" strokeWidth={2} />
                  {/* Pseudo edit/badge indicator simulated via CSS or simple lucide combo */}
                </div>
                <input 
                  type="text" 
                  className="admin-input" 
                  placeholder="Tên đăng nhập" 
                />
              </div>
              
              <div className="admin-input-group">
                <div className="admin-icon-wrapper">
                  <CustomLockIcon size={18} color="#a0a8b9" />
                </div>
                <input 
                  type="password" 
                  className="admin-input" 
                  placeholder="Mật khẩu" 
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
