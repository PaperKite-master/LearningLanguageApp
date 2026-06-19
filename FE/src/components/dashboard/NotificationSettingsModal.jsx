import React, { useState, useEffect } from 'react';
import userApi from '../../api/userApi';
import { X, Bell, Clock, Calendar } from 'lucide-react';
import './NotificationSettingsModal.css';

const NotificationSettingsModal = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState({
    is_enabled: true,
    reminder_time: '08:00',
    reminder_type: 'DAILY',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await userApi.getNotificationConfig();
      if (data) {
        setConfig(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Failed to load notification config", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      await userApi.updateNotificationConfig(config);
      setMessage({ type: 'success', text: 'Cài đặt thông báo đã được lưu thành công!' });
      setTimeout(() => {
        onClose();
        setMessage({ type: '', text: '' });
      }, 1500);
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi khi lưu cài đặt thông báo.' });
      console.error("Failed to save notification config", err);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setMessage({ type: '', text: '' });
      await userApi.sendTestNotification();
      setMessage({ type: 'success', text: 'Đã gửi email nhắc nhở thử nghiệm!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Lỗi khi gửi email thử nghiệm.' });
      console.error("Failed to send test email", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="notification-modal-overlay">
      <div className="notification-modal-container">
        <div className="notification-modal-header">
          <h2>
            <Bell size={24} className="header-icon" /> Cài đặt Thông báo
          </h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="notification-modal-content">
          {loading ? (
            <div className="loading-state">Đang tải...</div>
          ) : (
            <>
              {message.text && (
                <div className={`status-message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <div className="setting-group">
                <div className="setting-label-row">
                  <div className="setting-title">
                    <h4>Bật thông báo qua Email</h4>
                    <p>Nhận email nhắc nhở học tập để duy trì chuỗi Streak</p>
                  </div>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={config.is_enabled} 
                      onChange={(e) => setConfig({...config, is_enabled: e.target.checked})} 
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>

              {config.is_enabled && (
                <div className="settings-details">
                  <div className="setting-group">
                    <label>
                      <Clock size={16} /> Giờ nhận email
                    </label>
                    <input 
                      type="time" 
                      value={config.reminder_time}
                      onChange={(e) => setConfig({...config, reminder_time: e.target.value})}
                      className="time-input"
                    />
                  </div>

                  <div className="setting-group">
                    <label>
                      <Calendar size={16} /> Tần suất
                    </label>
                    <select 
                      value={config.reminder_type}
                      onChange={(e) => setConfig({...config, reminder_type: e.target.value})}
                      className="type-select"
                    >
                      <option value="DAILY">Hàng ngày (Daily)</option>
                      <option value="ONE_TIME">Một lần (One-time)</option>
                    </select>
                  </div>
                  
                  <div className="setting-group">
                    <label>Múi giờ</label>
                    <input 
                      type="text" 
                      value={config.timezone}
                      readOnly
                      className="timezone-input"
                      title="Múi giờ tự động theo thiết bị"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="notification-modal-footer">
          <button className="btn-test" onClick={handleTest} disabled={loading || saving}>
            Gửi Test Email
          </button>
          <div className="footer-actions">
            <button className="btn-cancel" onClick={onClose} disabled={saving}>Hủy</button>
            <button className="btn-save" onClick={handleSave} disabled={loading || saving}>
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsModal;
