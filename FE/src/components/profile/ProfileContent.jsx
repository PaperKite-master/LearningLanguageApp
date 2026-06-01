import React, { useState, useEffect } from 'react';
import { 
  User, 
  Flame, 
  Target, 
  Clock, 
  TrendingUp, 
  UserCog, 
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import userApi from '../../api/userApi';

const ProfileContent = () => {
  // ---------------------------------------------------------
  // MOCK DATABASE STATE (Ready for API Integration)
  // ---------------------------------------------------------
  // When a user logs in via Gmail/Database, fetch their data here
  const [userData, setUserData] = useState({
    name: 'Nguyễn Văn A',
    email: '',
    currentPassword: '',
    newPassword: '',
    targetLevel: 'N5',
    plan: 'PRO',
    stats: {
      streak: 34,
      target: 'N2',
      hoursLearned: '156H',
      weeklyProgress: '+ 12%'
    },
    settings: {
      soundEffects: true,
      encouragement: true,
      listeningExercises: true,
      personalizedAds: true
    }
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Lấy email từ localStorage
        const userStr = localStorage.getItem('user');
        let localEmail = 'nguyenvana@example.com';
        if (userStr && userStr !== 'undefined') {
          try {
            const parsedUser = JSON.parse(userStr);
            if (parsedUser.email) {
              localEmail = parsedUser.email;
            }
          } catch (e) {
            console.warn("Could not parse user from localStorage", e);
          }
        }

        const response = await userApi.getDashboardStats();
        if (response) {
          const payload = response.data && response.data.stats ? response.data : response;
          const userObj = payload.user || {};
          const statsObj = payload.stats || {};
          
          setUserData(prev => ({
            ...prev,
            name: userObj.name || prev.name,
            email: localEmail,
            targetLevel: statsObj.target || 'N5',
            stats: {
              streak: statsObj.streak || 0,
              target: statsObj.target || 'N5',
              hoursLearned: `${statsObj.totalHours || 0}H`,
              weeklyProgress: statsObj.weeklyGrowth != null ? (statsObj.weeklyGrowth >= 0 ? `+ ${statsObj.weeklyGrowth}%` : `${statsObj.weeklyGrowth}%`) : '+ 0%'
            }
          }));
        }
      } catch (error) {
        console.error("Failed to fetch profile stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  // Handlers for controlled inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Nếu đổi targetLevel ở dưới form thì cập nhật luôn lên stats badge cho đồng bộ
    if (name === 'targetLevel') {
      setUserData(prev => ({
        ...prev,
        targetLevel: value,
        stats: {
          ...prev.stats,
          target: value
        }
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const toggleSetting = (settingKey) => {
    setUserData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [settingKey]: !prev.settings[settingKey]
      }
    }));
  };

  const handleSave = async () => {
    try {
      const payload = {
        fullName: userData.name,
        targetLevel: userData.targetLevel
      };
      
      if (userData.newPassword) {
        payload.newPassword = userData.newPassword;
      }
      
      await userApi.updateProfile(payload);
      alert('Đã lưu thông tin hồ sơ!');
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert('Có lỗi xảy ra khi lưu thay đổi!');
    }
  };

  return (
    <div className="profile-content-area">
      
      {/* Header */}
      <div className="profile-header">
        <h1 className="profile-heading">HỒ SƠ CÁ NHÂN</h1>
      </div>

      {/* Card 1: User Summary */}
      <div className="profile-card summary-card">
        <div className="summary-top">
          <div className="avatar-placeholder">
            <User size={32} strokeWidth={1.5} color="#00e5ff" />
          </div>
          <div className="summary-info">
            <h2>{userData.name.toUpperCase()}</h2>
            <p>{userData.email}</p>
          </div>
          <div className="badge-pro">{userData.plan}</div>
        </div>
        
        <div className="profile-stats-row">
          <div className="profile-stat">
            <Flame size={24} color="#f59e0b" />
            <div className="stat-value">{userData.stats.streak}</div>
            <div className="stat-label">Chuỗi ngày</div>
          </div>
          <div className="profile-stat">
            <Target size={24} color="#38bdf8" />
            <div className="stat-value">{userData.stats.target}</div>
            <div className="stat-label">Mục tiêu</div>
          </div>
          <div className="profile-stat">
            <Clock size={24} color="#a855f7" />
            <div className="stat-value">{userData.stats.hoursLearned}</div>
            <div className="stat-label">Số giờ học</div>
          </div>
          <div className="profile-stat">
            <TrendingUp size={24} color="#10b981" />
            <div className="stat-value success">{userData.stats.weeklyProgress}</div>
            <div className="stat-label">Tuần này</div>
          </div>
        </div>
      </div>

      {/* Card 2: User Inputs */}
      <div className="profile-card settings-card">
        <div className="card-title-row">
          <UserCog className="cyan-icon" size={24} />
          <h3 className="card-title">CÀI ĐẶT THÔNG TIN NGƯỜI DÙNG</h3>
        </div>

        <div className="form-group">
          <label>Tên hiển thị</label>
          <input 
            type="text" 
            name="accountName" 
            value={userData.name} 
            className="profile-input" 
            disabled
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="accountEmail" 
            value={userData.email} 
            className="profile-input" 
            disabled
            autoComplete="off"
          />
        </div>

        <div className="form-group">
          <label>Mục tiêu (Target Level)</label>
          <select 
            name="targetLevel" 
            value={userData.targetLevel} 
            onChange={handleInputChange} 
            className="profile-input" 
            style={{ appearance: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: 'var(--white)' }}
          >
            <option value="N5" style={{ backgroundColor: '#1c2035' }}>Mục tiêu: N5 (Sơ cấp 1)</option>
            <option value="N4" style={{ backgroundColor: '#1c2035' }}>Mục tiêu: N4 (Sơ cấp 2)</option>
            <option value="N3" style={{ backgroundColor: '#1c2035' }}>Mục tiêu: N3 (Trung cấp)</option>
            <option value="N2" style={{ backgroundColor: '#1c2035' }}>Mục tiêu: N2 (Cao cấp 1)</option>
            <option value="N1" style={{ backgroundColor: '#1c2035' }}>Mục tiêu: N1 (Cao cấp 2)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Mật khẩu hiện tại</label>
          {/* Honeypot to defeat Edge/Chrome autofill */}
          <input type="text" name="fakeusernameremembered" style={{display: 'none'}} aria-hidden="true" />
          <input type="password" name="fakepasswordremembered" style={{display: 'none'}} aria-hidden="true" />
          
          <div className="password-input-wrapper">
            <input 
              type={showPassword ? "text" : "password"} 
              name="currentPassword" 
              value={userData.currentPassword || ''} 
              onChange={handleInputChange} 
              className="profile-input password-input" 
              placeholder="Nhập mật khẩu hiện tại..."
              autoComplete="new-password"
            />
            <button 
              type="button" 
              className="password-toggle-btn" 
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Mật khẩu mới</label>
          <div className="password-input-wrapper">
            <input 
              type={showNewPassword ? "text" : "password"} 
              name="newPassword" 
              value={userData.newPassword || ''} 
              onChange={handleInputChange} 
              className="profile-input password-input" 
              placeholder="Nhập mật khẩu mới..."
              autoComplete="new-password"
            />
            <button 
              type="button" 
              className="password-toggle-btn" 
              onClick={toggleNewPasswordVisibility}
            >
              {showNewPassword ? <EyeOff size={20} color="#6b7280" /> : <Eye size={20} color="#6b7280" />}
            </button>
          </div>
        </div>

        <button className="btn-save" onClick={handleSave}>Lưu thay đổi</button>
      </div>

      {/* Card 3: Experience Settings */}
      <div className="profile-card toggles-card">
        <div className="card-title-row">
          <Settings className="cyan-icon" size={24} />
          <h3 className="card-title">CÀI ĐẶT TRẢI NGHIỆM HỌC</h3>
        </div>

        <div className="toggle-row">
          <span className="toggle-label">Hiệu ứng âm thanh</span>
          <div 
            className={`custom-toggle ${userData.settings.soundEffects ? 'active' : ''}`}
            onClick={() => toggleSetting('soundEffects')}
          >
            <div className="toggle-thumb"></div>
          </div>
        </div>

        <div className="toggle-row">
          <span className="toggle-label">Thông báo khích lệ</span>
          <div 
            className={`custom-toggle ${userData.settings.encouragement ? 'active' : ''}`}
            onClick={() => toggleSetting('encouragement')}
          >
            <div className="toggle-thumb"></div>
          </div>
        </div>

        <div className="toggle-row">
          <span className="toggle-label">Bài tập nghe</span>
          <div 
            className={`custom-toggle ${userData.settings.listeningExercises ? 'active' : ''}`}
            onClick={() => toggleSetting('listeningExercises')}
          >
            <div className="toggle-thumb"></div>
          </div>
        </div>

        <div className="toggle-row">
          <span className="toggle-label">Cá nhân hóa quảng cáo (Pro)</span>
          <div 
            className={`custom-toggle ${userData.settings.personalizedAds ? 'active' : ''}`}
            onClick={() => toggleSetting('personalizedAds')}
          >
            <div className="toggle-thumb"></div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProfileContent;
