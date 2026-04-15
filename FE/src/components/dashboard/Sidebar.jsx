import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  WholeWord, // using this for "Bảng chữ cái"
  Layers, 
  PlaySquare, 
  TrendingUp,
  UserCircle,
  LogOut
} from 'lucide-react';
import logo from '../../assets/logo.png'; // Assuming logo can be reused

const Sidebar = () => {
  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="HiNa" />
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard className="nav-icon" size={24} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/study" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <BookOpen className="nav-icon" size={24} />
          <span>Học</span>
        </NavLink>
        
        <NavLink to="/alphabet" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <span className="nav-icon jp-icon">あ</span>
          <span>Bảng chữ cái</span>
        </NavLink>
        
        <NavLink to="/flashcard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Layers className="nav-icon" size={24} />
          <span>Flash Card</span>
        </NavLink>
        
        <NavLink to="/videos" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <PlaySquare className="nav-icon" size={24} />
          <span>Videos</span>
        </NavLink>
        
        <NavLink to="/progress" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <TrendingUp className="nav-icon" size={24} />
          <span>Tiến Độ</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button className="bottom-btn">
          <UserCircle size={36} strokeWidth={2.5} />
        </button>
        <button className="bottom-btn">
          <LogOut size={36} strokeWidth={2.5} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
