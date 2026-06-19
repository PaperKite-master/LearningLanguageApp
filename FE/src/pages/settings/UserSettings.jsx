import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Bell, ChevronRight, ChevronDown, Flame } from 'lucide-react';
import { ChangePasswordModal, LinkAccountsModal, DeleteAccountModal } from './AccountModals';
import './UserSettings.css';

const UserSettings = () => {
  const navigate = useNavigate();
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isLinkAccountsOpen, setLinkAccountsOpen] = useState(false);
  const [isDeleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // Handle logout or dropdown (simplified for UI)
  const handleDropdown = () => {
    // Logic for dropdown if needed
  };

  return (
    <div className="user-settings-layout">
      {/* Settings Sidebar */}
      <aside className="settings-sidebar">
        <div className="settings-logo" onClick={() => navigate('/study')} style={{ cursor: 'pointer' }}>
          <h1 style={{ color: '#fff', fontSize: '2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Hi<span style={{ color: '#ff7043' }}>n</span>a
          </h1>
        </div>

        <nav className="settings-nav">
          <NavLink to="/settings" className="settings-nav-item active">
            <User size={20} />
            <span>Account Settings</span>
          </NavLink>
          
          <NavLink to="/settings/notifications" className="settings-nav-item">
            <Bell size={20} />
            <span>Notification Settings</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Area */}
      <main className="settings-main">
        {/* Topbar */}
        <header className="settings-topbar">
          <div className="settings-topbar-actions">
            <div className="settings-streak">
              <Flame size={20} color="#64748b" />
              <span>1</span>
            </div>
            
            <Bell className="settings-bell" size={20} />
            
            <div className="settings-user-profile" onClick={handleDropdown}>
              <div className="settings-avatar-wrapper">
                <User size={20} color="#ffffff" />
                <div style={{ position: 'absolute', bottom: -2, right: -4, background: '#311b92', borderRadius: '50%', padding: '2px' }}>
                  <ChevronDown size={12} color="#ffffff" />
                </div>
              </div>
              <span className="settings-username">Alex</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="settings-content">
          <h2 className="settings-title">ACCOUNT SETTINGS</h2>

          <div className="settings-list">
            <div className="settings-list-item" onClick={() => setChangePasswordOpen(true)} style={{ cursor: 'pointer' }}>
              <div className="settings-item-info">
                <div className="settings-item-title">ĐỔI MẬT KHẨU</div>
                <div className="settings-item-desc">Đổi mật khẩu để giữ an toàn cho tài khoản của bạn</div>
              </div>
              <ChevronRight className="settings-item-action" size={24} />
            </div>

            <div className="settings-list-item" onClick={() => setLinkAccountsOpen(true)} style={{ cursor: 'pointer' }}>
              <div className="settings-item-info">
                <div className="settings-item-title">LIÊN KẾT TÀI KHOẢN</div>
                <div className="settings-item-desc">Quản lý kết nối với Google và các nền tảng khác</div>
              </div>
              <ChevronRight className="settings-item-action" size={24} />
            </div>

            <div className="settings-list-item" style={{ borderBottom: 'none' }}>
              <div className="settings-item-info">
                <div className="settings-item-title">XÓA TÀI KHOẢN</div>
                <div className="settings-item-desc">Xóa hoàn toàn tài khoản và toàn bộ dữ liệu</div>
              </div>
              <button className="settings-btn-delete" onClick={() => setDeleteAccountOpen(true)}>Delete</button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ChangePasswordModal isOpen={isChangePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
      <LinkAccountsModal isOpen={isLinkAccountsOpen} onClose={() => setLinkAccountsOpen(false)} />
      <DeleteAccountModal isOpen={isDeleteAccountOpen} onClose={() => setDeleteAccountOpen(false)} />
    </div>
  );
};

export default UserSettings;
