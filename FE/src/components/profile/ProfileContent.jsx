import React, { useState, useEffect } from 'react';
import { Pencil, MapPin, X, Check } from 'lucide-react';
import userApi from '../../api/userApi';
import './ProfileContent.css';

const ProfileContent = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: 'Alex',
    email: 'Alex234@gmail.com',
    location: 'Hồ Chí Minh, VN',
    bio: "I'm a UI/UX designer with 7+ years of experience in creating intuitive and accessible interfaces. I love simplifying complex design concepts for beginners.",
    phone: '',
    address: '',
    preferredContact: 'Email',
    visibility: true,
    avatarUrl: 'https://i.pravatar.cc/150?img=11',
    stats: {
      completed: 2,
      completedGrowth: 'Tăng 5%',
      hours: '15h 20m',
      hoursGrowth: 'Tăng 3%',
      streak: '10 days',
      streakGrowth: 'Tăng 10%',
      progress: '20%',
      progressGrowth: 'Tăng 2%'
    }
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bio: ''
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Load local user from storage
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined') {
          try {
            const parsedUser = JSON.parse(userStr);
            setUserData(prev => ({ 
              ...prev, 
              email: parsedUser.email || prev.email, 
              name: parsedUser.name || prev.name,
              avatarUrl: parsedUser.avatarUrl || prev.avatarUrl,
              visibility: parsedUser.visibility ?? prev.visibility,
              phone: parsedUser.phone || prev.phone,
              address: parsedUser.address || prev.address,
              location: parsedUser.address || prev.location,
              bio: parsedUser.bio || prev.bio,
              preferredContact: parsedUser.preferredContact || prev.preferredContact
            }));
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
            avatarUrl: userObj.avatarUrl || prev.avatarUrl,
            visibility: userObj.visibility ?? prev.visibility,
            phone: userObj.phone || prev.phone,
            address: userObj.address || prev.address,
            location: userObj.address || prev.location,
            bio: userObj.bio || prev.bio,
            preferredContact: userObj.preferredContact || prev.preferredContact,
            stats: {
              ...prev.stats,
              streak: `${statsObj.streak || 0} days`,
              hours: `${statsObj.totalHours || 0}H`,
              progress: `${statsObj.progress || 0}%`
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

  const handleOpenEditModal = () => {
    setEditForm({
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      address: userData.address || userData.location,
      bio: userData.bio
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      // Optimistic update
      setUserData(prev => ({
        ...prev,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        location: editForm.address,
        bio: editForm.bio
      }));
      
      // Call API
      await userApi.updateProfile({
        fullName: editForm.name,
        phone: editForm.phone,
        address: editForm.address,
        bio: editForm.bio
      });

      // Update local storage
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        const parsedUser = JSON.parse(userStr);
        parsedUser.name = editForm.name;
        parsedUser.phone = editForm.phone;
        parsedUser.address = editForm.address;
        parsedUser.bio = editForm.bio;
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }
      
      setIsEditModalOpen(false);
      alert("Cập nhật thông tin thành công!");
    } catch (err) {
      console.error("Lỗi khi lưu profile", err);
      alert("Có lỗi xảy ra khi cập nhật!");
    }
  };

  const toggleVisibility = async () => {
    const newVisibility = !userData.visibility;
    setUserData(prev => ({ ...prev, visibility: newVisibility }));
    try {
      await userApi.updateProfile({ visibility: newVisibility });
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        const parsedUser = JSON.parse(userStr);
        parsedUser.visibility = newVisibility;
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }
    } catch (e) {
      console.error("Failed to update visibility", e);
      setUserData(prev => ({ ...prev, visibility: !newVisibility }));
    }
  };

  const handlePreferredContactChange = async (e) => {
    const newValue = e.target.value;
    setUserData(prev => ({ ...prev, preferredContact: newValue }));
    try {
      await userApi.updateProfile({ preferredContact: newValue });
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== 'undefined') {
        const parsedUser = JSON.parse(userStr);
        parsedUser.preferredContact = newValue;
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }
    } catch (err) {
      console.error("Failed to update preferred contact", err);
    }
  };

  const fileInputRef = React.useRef(null);

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        setUserData(prev => ({ ...prev, avatarUrl: base64String }));
        try {
          await userApi.updateProfile({ avatarUrl: base64String });
          const userStr = localStorage.getItem('user');
          if (userStr && userStr !== 'undefined') {
            const parsedUser = JSON.parse(userStr);
            parsedUser.avatarUrl = base64String;
            localStorage.setItem('user', JSON.stringify(parsedUser));
          }
        } catch (err) {
          console.error("Avatar update failed:", err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', color: '#1a1a1a' }}>Đang tải dữ liệu hồ sơ...</div>;
  }

  return (
    <div className="profile-page-container">
      {/* HEADER SECTION */}
      <div className="profile-header-new">
        <div className="profile-avatar-large">
          <img src={userData.avatarUrl || "https://i.pravatar.cc/150?img=11"} alt="Avatar" />
          <button className="profile-edit-avatar-btn" onClick={handleAvatarClick}>
            <Pencil size={12} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept="image/*"
            onChange={handleAvatarChange}
          />
        </div>
        
        <div className="profile-user-info-new">
          <h2>{userData.name}</h2>
          <p>{userData.email}</p>
          <p style={{ marginTop: '5px' }}>
            <MapPin size={14} color="#64748b" /> {userData.location || 'Chưa cập nhật'}
          </p>
        </div>

        <button className="profile-header-btn" onClick={handleOpenEditModal}>
          Chỉnh sửa hồ sơ
        </button>
      </div>

      {/* STATS SECTION */}
      <div className="profile-stats-grid-new">
        <div className="profile-stat-box-new">
          <h3 className="profile-stat-title-new">Đã hoàn thành</h3>
          <p className="profile-stat-value-new">{userData.stats.completed}</p>
          <p className="profile-stat-desc-new">{userData.stats.completedGrowth}</p>
        </div>
        <div className="profile-stat-box-new">
          <h3 className="profile-stat-title-new">Số giờ học</h3>
          <p className="profile-stat-value-new">{userData.stats.hours}</p>
          <p className="profile-stat-desc-new">{userData.stats.hoursGrowth}</p>
        </div>
        <div className="profile-stat-box-new">
          <h3 className="profile-stat-title-new">Chuỗi ngày</h3>
          <p className="profile-stat-value-new">{userData.stats.streak}</p>
          <p className="profile-stat-desc-new">{userData.stats.streakGrowth}</p>
        </div>
        <div className="profile-stat-box-new">
          <h3 className="profile-stat-title-new">Tiến độ mục tiêu</h3>
          <p className="profile-stat-value-new">{userData.stats.progress}</p>
          <p className="profile-stat-desc-new">{userData.stats.progressGrowth}</p>
        </div>
      </div>

      {/* BIO SECTION */}
      <h3 className="profile-section-title">Giới thiệu</h3>
      <p className="profile-bio-text">{userData.bio}</p>

      {/* CONTACT INFORMATION */}
      <h3 className="profile-section-title">Thông tin liên hệ</h3>
      <div className="profile-contact-form">
        <div className="profile-form-grid">
          <input 
            type="email" 
            className="profile-input-new" 
            placeholder="Email" 
            value={userData.email}
            readOnly
          />
          <input 
            type="text" 
            className="profile-input-new" 
            placeholder="Phone number" 
            value={userData.phone}
            readOnly
          />
          </div>
          <select className="profile-select-new" value={userData.preferredContact} onChange={handlePreferredContactChange}>
            <option value="Email">Preferred Contact Method: Email</option>
            <option value="Phone">Preferred Contact Method: Phone</option>
          </select>
        <div style={{ marginTop: '20px', overflow: 'hidden' }}>
          <button className="profile-btn-save" onClick={() => alert('Đã lưu thông tin liên hệ!')}>Save Changes</button>
        </div>
      </div>

      {/* PROFILE VISIBILITY */}
      <div className="profile-visibility-card">
        <div className="profile-visibility-info">
          <h4>Profile Visibility</h4>
          <p>Kiểm soát ai có thể xem hồ sơ của bạn</p>
        </div>
        <div className={`profile-custom-toggle ${userData.visibility ? 'active' : ''}`} onClick={toggleVisibility}>
          <div className="profile-toggle-thumb"></div>
        </div>
      </div>

      {/* SUBSCRIPTION PLANS */}
      <h3 className="profile-section-title">Nâng cấp gói học</h3>
      <div className="profile-plans-grid">
        <div className="profile-plan-card">
          <h4 className="profile-plan-title">STUDENT</h4>
          <p className="profile-plan-price">0 VNĐ/ tháng</p>
          <ul className="profile-plan-features">
            <li><Check size={16} color="#0ea5e9" /> Từ vựng CNTT cốt lõi (500+ thuật ngữ)</li>
            <li><Check size={16} color="#0ea5e9" /> Chương trình JLPT từ N5 đến N3</li>
            <li><Check size={16} color="#0ea5e9" /> Các mô-đun ngữ pháp cơ bản</li>
            <li><Check size={16} color="#0ea5e9" /> Quyền truy cập cộng đồng Discord</li>
            <li><Check size={16} color="#0ea5e9" /> Bảng điều khiển theo dõi tiến độ</li>
            <li><Check size={16} color="#0ea5e9" /> Bài kiểm tra và đánh giá hằng tuần</li>
          </ul>
          <button className="profile-plan-btn" style={{ opacity: 0.8 }}>Gói hiện tại</button>
        </div>

        <div className="profile-plan-card">
          <h4 className="profile-plan-title">PRO</h4>
          <p className="profile-plan-price">99.000VNĐ/ tháng</p>
          <ul className="profile-plan-features">
            <li><Check size={16} color="#0ea5e9" /> Mọi nội dung trong gói Student</li>
            <li><Check size={16} color="#0ea5e9" /> Từ vựng CNTT đầy đủ (hơn 2.000 thuật ngữ)</li>
            <li><Check size={16} color="#0ea5e9" /> Chương trình JLPT từ N2 đến N1</li>
            <li><Check size={16} color="#0ea5e9" /> Mô-đun chuẩn bị phỏng vấn</li>
            <li><Check size={16} color="#0ea5e9" /> Keigo & mẫu email công việc</li>
            <li><Check size={16} color="#0ea5e9" /> Buổi học 1-1 với gia sư (2 lần/tháng)</li>
            <li><Check size={16} color="#0ea5e9" /> Thư viện tình huống thực tế CNTT</li>
            <li><Check size={16} color="#0ea5e9" /> Đánh giá CV & hồ sơ năng lực</li>
          </ul>
          <button className="profile-plan-btn" style={{ opacity: 0.6 }}>Đăng ký ngay</button>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-box">
            <div className="profile-modal-header">
              <h2>Chỉnh sửa thông tin cá nhân</h2>
              <button className="profile-modal-close" onClick={handleCloseEditModal}>
                <X size={24} />
              </button>
            </div>
            
            <div className="profile-modal-form">
              <input 
                type="text" 
                name="name"
                className="profile-modal-input" 
                placeholder="Tên người dùng" 
                value={editForm.name}
                onChange={handleEditChange}
              />
              <input 
                type="email" 
                name="email"
                className="profile-modal-input" 
                placeholder="Email" 
                value={editForm.email}
                onChange={handleEditChange}
                disabled
              />
              <input 
                type="text" 
                name="phone"
                className="profile-modal-input" 
                placeholder="SĐT" 
                value={editForm.phone}
                onChange={handleEditChange}
              />
              <input 
                type="text" 
                name="address"
                className="profile-modal-input" 
                placeholder="Địa chỉ" 
                value={editForm.address}
                onChange={handleEditChange}
              />
              <textarea 
                name="bio"
                className="profile-modal-textarea" 
                placeholder="Giới thiệu"
                value={editForm.bio}
                onChange={handleEditChange}
              />
            </div>

            <div className="profile-modal-actions">
              <button className="profile-modal-btn-cancel" onClick={handleCloseEditModal}>Hủy</button>
              <button className="profile-modal-btn-save" onClick={handleSaveProfile}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileContent;
