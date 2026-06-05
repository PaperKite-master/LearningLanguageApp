import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  BrainCircuit, 
  Map, 
  Layers, 
  Settings,
  LogOut
} from 'lucide-react';
import logo from '../../assets/logo.png';
import authApi from '../../api/authApi';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <aside className="dashboard-sidebar admin-sidebar">
      <div className="sidebar-logo">
        <NavLink to="/">
          <img src={logo} alt="HiNa" />
        </NavLink>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard size={24} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/users" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Users size={24} />
          <span>Người dùng</span>
        </NavLink>
        <NavLink to="/admin/content" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <BookOpen size={24} />
          <span>Nội dung</span>
        </NavLink>
        <NavLink to="/admin/tests" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <BrainCircuit size={24} />
          <span>Kiểm tra thử</span>
        </NavLink>
        <NavLink to="/admin/timeline" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Map size={24} />
          <span>Timeline</span>
        </NavLink>
        <NavLink to="/admin/flashcard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Layers size={24} />
          <span>Flash Card</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <NavLink to="/admin/settings" className={({isActive}) => isActive ? "bottom-btn bottom-active" : "bottom-btn"}>
          <Settings size={32} strokeWidth={2.5} />
        </NavLink>
        <button onClick={handleLogout} className="bottom-btn" title="Đăng xuất">
          <LogOut size={32} strokeWidth={2.5} />
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
