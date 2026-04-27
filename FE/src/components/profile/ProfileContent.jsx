import React, { useState } from 'react';
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

const ProfileContent = () => {
  // ---------------------------------------------------------
  // MOCK DATABASE STATE (Ready for API Integration)
  // ---------------------------------------------------------
  // When a user logs in via Gmail/Database, fetch their data here
  const [userData, setUserData] = useState({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    password: '••••••••••',
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

  // Example DB Fetch:
  // useEffect(() => {
  //   fetch('/api/user/profile')
  //     .then(res => res.json())
  //     .then(data => setUserData(data));
  // }, []);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handlers for controlled inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleSave = () => {
    // API Call to save user changes here
    console.log("Saving new profile data:", userData);
    alert('Đã lưu thông tin hồ sơ!');
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
            name="name" 
            value={userData.name} 
            onChange={handleInputChange} 
            className="profile-input" 
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            name="email" 
            value={userData.email} 
            onChange={handleInputChange} 
            className="profile-input" 
            placeholder="nguyenvana@example.com"
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu mới</label>
          <div className="password-input-wrapper">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              value={userData.password} 
              onChange={handleInputChange} 
              className="profile-input password-input" 
              placeholder="••••••••••"
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
