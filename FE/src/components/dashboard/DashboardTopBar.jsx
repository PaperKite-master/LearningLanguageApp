import React, { useState, useEffect, useRef } from 'react';
import { Flame, Bell, UserCircle, ChevronDown, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';
import userApi from '../../api/userApi';
import NotificationSettingsModal from './NotificationSettingsModal';

const DashboardTopBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState('');
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch streak and username
    const fetchUserData = async () => {
      try {
        const response = await userApi.getDashboardStats();
        if (response) {
          const payload = response.data && response.data.stats ? response.data : response;
          const userObj = payload.user || {};
          const statsObj = payload.stats || {};
          
          setStreak(statsObj.streak || 0);
          setUserName(userObj.name || 'Học viên');
        }
      } catch (error) {
        console.error("Failed to fetch top bar stats:", error);
      }
    };
    
    // Also try to get user from localstorage as fallback
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.fullName) setUserName(user.fullName);
      } catch (e) {}
    }

    fetchUserData();
  }, []);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleLogout = () => {
    authApi.logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-topbar">
      <div className="topbar-spacer"></div>
      
      <div className="topbar-actions">
        {/* Streak */}
        <div className="topbar-streak">
          <Flame size={20} color="#6b7280" />
          <span className="streak-count">{streak}</span>
        </div>
        
        {/* Notifications */}
        <button className="topbar-icon-btn">
          <Bell size={20} color="#6b7280" />
        </button>
        
        {/* Profile Dropdown */}
        <div className="topbar-profile" ref={dropdownRef}>
          <button 
            className="profile-trigger" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="avatar-circle">
              <UserCircle size={20} color="#fff" />
              <div className="status-dot"></div>
            </div>
            <span className="user-name">{userName}</span>
            <ChevronDown size={16} color="#6b7280" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} className="transition-transform" />
          </button>
          
          {isDropdownOpen && (
            <div className="profile-dropdown-menu">
              <button className="dropdown-item" onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }}>
                <div className="icon-bg icon-bg-user">
                  <User size={18} color="#9333ea" strokeWidth={2.5} />
                </div>
                <span>Account Settings</span>
              </button>
              <button className="dropdown-item" onClick={() => { setIsNotificationModalOpen(true); setIsDropdownOpen(false); }}>
                <div className="icon-bg icon-bg-bell">
                  <Bell size={18} color="#8b5cf6" strokeWidth={2.5} />
                </div>
                <span>Notification Settings</span>
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <div className="icon-bg icon-bg-logout">
                  <LogOut size={18} color="#ef4444" strokeWidth={2.5} />
                </div>
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <NotificationSettingsModal 
        isOpen={isNotificationModalOpen} 
        onClose={() => setIsNotificationModalOpen(false)} 
      />
    </div>
  );
};

export default DashboardTopBar;
