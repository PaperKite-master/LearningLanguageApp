import React, { useState } from 'react';
import { X, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import userApi from '../../api/userApi';
import authApi from '../../api/authApi';
import { useNavigate } from 'react-router-dom';

export const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await userApi.changePassword({ oldPassword, newPassword });
      setSuccess('Đổi mật khẩu thành công!');
      setTimeout(() => {
        onClose();
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra khi đổi mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h3>Đổi mật khẩu</h3>
          <button className="settings-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="settings-modal-content">
          {error && <div className="settings-alert error">{error}</div>}
          {success && <div className="settings-alert success">{success}</div>}

          <div className="settings-form-group">
            <label>Mật khẩu cũ</label>
            <div className="settings-input-wrapper">
              <input 
                type={showOld ? "text" : "password"} 
                value={oldPassword} 
                onChange={(e) => setOldPassword(e.target.value)} 
                required 
              />
              <button type="button" onClick={() => setShowOld(!showOld)}>
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="settings-form-group">
            <label>Mật khẩu mới</label>
            <div className="settings-input-wrapper">
              <input 
                type={showNew ? "text" : "password"} 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                required 
              />
              <button type="button" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="settings-form-group">
            <label>Xác nhận mật khẩu mới</label>
            <div className="settings-input-wrapper">
              <input 
                type={showConfirm ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required 
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="settings-modal-footer">
            <button type="button" className="settings-btn-cancel" onClick={onClose}>Hủy</button>
            <button type="submit" className="settings-btn-primary" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const LinkAccountsModal = ({ isOpen, onClose }) => {
  // In a real implementation, you would check if the user signed in with Google
  // from their auth provider metadata.
  const [linked, setLinked] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLinkGoogle = async () => {
    setLoading(true);
    // Placeholder for actual OAuth linkage logic
    setTimeout(() => {
      setLinked(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal">
        <div className="settings-modal-header">
          <h3>Liên kết tài khoản</h3>
          <button className="settings-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="settings-modal-content">
          <p style={{ color: '#64748b', marginBottom: '20px' }}>
            Liên kết với các nền tảng khác để đăng nhập dễ dàng hơn.
          </p>

          <div className="linked-account-item">
            <div className="linked-info">
              <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="provider-icon" />
              <div>
                <h4>Google</h4>
                <p className={linked ? "status-linked" : "status-unlinked"}>
                  {linked ? "Đã liên kết" : "Chưa liên kết"}
                </p>
              </div>
            </div>
            <button 
              className={`settings-btn-outline ${linked ? 'danger' : 'primary'}`}
              onClick={linked ? () => setLinked(false) : handleLinkGoogle}
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (linked ? 'Hủy liên kết' : 'Liên kết')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmText !== 'XAC NHAN') {
      setError('Vui lòng nhập đúng chữ XAC NHAN');
      return;
    }

    setLoading(true);
    try {
      await userApi.deleteAccount();
      // Clear local storage and redirect to login
      authApi.logout();
      navigate('/login');
    } catch (err) {
      setError('Có lỗi xảy ra khi xóa tài khoản. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal delete-modal">
        <div className="settings-modal-header">
          <h3 style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={24} />
            Cảnh báo nguy hiểm
          </h3>
          <button className="settings-modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="settings-modal-content">
          <p style={{ color: '#1e293b', fontWeight: '500', marginBottom: '12px' }}>
            Bạn đang yêu cầu xóa toàn bộ dữ liệu tài khoản và quá trình học tập.
          </p>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '24px' }}>
            Hành động này <strong>không thể hoàn tác</strong>. Xin vui lòng cân nhắc kỹ trước khi thực hiện.
          </p>
          
          {error && <div className="settings-alert error">{error}</div>}

          <div className="settings-form-group">
            <label>Nhập <strong>XAC NHAN</strong> để tiếp tục</label>
            <input 
              type="text" 
              value={confirmText} 
              onChange={(e) => setConfirmText(e.target.value)} 
              placeholder="XAC NHAN"
              className="danger-input"
            />
          </div>

          <div className="settings-modal-footer">
            <button className="settings-btn-cancel" onClick={onClose} disabled={loading}>Hủy bỏ</button>
            <button 
              className="settings-btn-delete-confirm" 
              onClick={handleDelete} 
              disabled={confirmText !== 'XAC NHAN' || loading}
            >
              {loading ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
