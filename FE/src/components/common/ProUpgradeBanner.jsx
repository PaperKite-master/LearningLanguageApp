import React from 'react';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './ProUpgradeBanner.css';

const ProUpgradeBanner = ({
  title = 'Nội dung dành cho gói PRO',
  description = 'Nâng cấp PRO để mở khóa toàn bộ timeline, bài học và kiểm tra thử.',
  buttonText = 'Nâng cấp PRO',
  onUpgrade,
}) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    navigate('/profile');
  };

  return (
    <div className="pro-upgrade-banner">
      <div className="pro-upgrade-banner-icon">
        <Lock size={22} />
      </div>
      <div className="pro-upgrade-banner-content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <button type="button" className="pro-upgrade-banner-btn" onClick={handleUpgrade}>
        {buttonText}
      </button>
    </div>
  );
};

export default ProUpgradeBanner;
