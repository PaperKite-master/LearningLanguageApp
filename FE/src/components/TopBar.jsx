import React from 'react';
import { ChevronDown } from 'lucide-react';

const TopBar = () => {
  return (
    <div className="top-bar">
      <div className="promo-text">
        Ưu đãi có hạn chỉ dành cho bạn! Đăng ký ngay - giảm 50%!
      </div>
      <div className="language-selector">
        <span>Vietnameses</span>
        <ChevronDown size={14} />
      </div>
    </div>
  );
};

export default TopBar;
