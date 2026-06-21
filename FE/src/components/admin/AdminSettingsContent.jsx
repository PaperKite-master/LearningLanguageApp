import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import userApi from '../../api/userApi';

const AdminSettingsContent = () => {
  // State for toggles
  const [studyReminder, setStudyReminder] = useState(true);
  const [emailReminder, setEmailReminder] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await userApi.getAdminSettings();
        if (data) {
          setStudyReminder(data.study_reminder_enabled ?? true);
          setEmailReminder(data.email_reminder_enabled ?? true);
        }
      } catch (error) {
        console.error("Failed to fetch admin settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const toggleStudyReminder = async () => {
    const newVal = !studyReminder;
    setStudyReminder(newVal);
    try {
      await userApi.updateAdminSettings({ study_reminder_enabled: newVal });
    } catch (error) {
      setStudyReminder(!newVal); // Revert on failure
      console.error("Failed to update study_reminder_enabled", error);
    }
  };

  const toggleEmailReminder = async () => {
    const newVal = !emailReminder;
    setEmailReminder(newVal);
    try {
      await userApi.updateAdminSettings({ email_reminder_enabled: newVal });
    } catch (error) {
      setEmailReminder(!newVal); // Revert on failure
      console.error("Failed to update email_reminder_enabled", error);
    }
  };

  return (
    <div className="admin-content-area">
      <div className="admin-header flex-header">
        <h1 className="admin-heading flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#1e293b', marginTop: '15px' }}>
          <Settings size={28} color="#3b82f6" />
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
              className={`custom-toggle ${studyReminder ? 'active' : ''} ${loading ? 'disabled' : ''}`}
              onClick={!loading ? toggleStudyReminder : undefined}
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
              className={`custom-toggle ${emailReminder ? 'active' : ''} ${loading ? 'disabled' : ''}`}
              onClick={!loading ? toggleEmailReminder : undefined}
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
