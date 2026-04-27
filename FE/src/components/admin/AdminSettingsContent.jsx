import React, { useState } from 'react';
import { Settings } from 'lucide-react';

const AdminSettingsContent = () => {
  // State for toggles
  const [studyReminder, setStudyReminder] = useState(true);
  const [emailReminder, setEmailReminder] = useState(true);

  return (
    <div className="admin-content-area">
      <div className="admin-header flex-header">
        <h1 className="admin-heading flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={28} color="#00e5ff" />
          CÀI ĐẶT HỆ THỐNG
        </h1>
      </div>

      <div className="admin-settings-container">
        
        <div className="admin-settings-panel">
          <h2 className="settings-panel-title">THÔNG BÁO</h2>
          
          <div className="settings-row">
            <div className="settings-info">
              <h3 className="settings-label">Nhắc nhở giờ học</h3>
              <p className="settings-desc">Gửi thông báo nhắc nhở giờ học đến người dùng</p>
            </div>
            
            {/* Custom Toggle Switch */}
            <div 
              className={`custom-toggle ${studyReminder ? 'active' : ''}`}
              onClick={() => setStudyReminder(!studyReminder)}
            >
              <div className="toggle-thumb"></div>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-info">
              <h3 className="settings-label">Lời nhắc qua email</h3>
              <p className="settings-desc">Nhắc nhở học tập hằng ngày qua email</p>
            </div>
            
            {/* Custom Toggle Switch */}
            <div 
              className={`custom-toggle ${emailReminder ? 'active' : ''}`}
              onClick={() => setEmailReminder(!emailReminder)}
            >
              <div className="toggle-thumb"></div>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default AdminSettingsContent;
