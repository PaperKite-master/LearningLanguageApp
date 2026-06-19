import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  WholeWord,
  Layers, 
  Video, 
  UserSquare
} from 'lucide-react';
import logo from '../../assets/logo.png'; // Assuming logo can be reused

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-logo">
        <NavLink to="/">
          <img src={logo} alt="HiNa" />
        </NavLink>
      </div>

      <nav className="sidebar-nav">
        
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
          <Video className="nav-icon" size={24} />
          <span>Videos</span>
        </NavLink>
        
        <NavLink to="/profile" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <UserSquare className="nav-icon" size={24} />
          <span>Hồ sơ</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
