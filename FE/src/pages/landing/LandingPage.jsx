import React from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Header from '../../components/Header';
import BackgroundLayer from '../../components/BackgroundLayer';
import computer from '../../assets/computer.png';

const LandingPage = () => {
  return (
    <div className="landing-page-container">
      <BackgroundLayer />
      
      <div className="landing-content-wrapper">
        <TopBar />
        <Header />
        
        <main className="hero-section">
          {/* Left Content */}
          <div className="hero-text-content">
            <h1 className="hero-heading">
              <span className="text-white">THÀNH THẠO TIẾNG NHẬT</span>
              <br />
              <span className="text-gradient">CHUYÊN NGÀNH IT</span>
            </h1>
            
            <ul className="hero-description">
              <li>Nền tảng ngôn ngữ được thiết kế riêng cho các lập trình viên.</li>
              <li>Hãy chinh phục công việc mơ ước tại các công ty công nghệ hàng đầu Nhật Bản với vốn từ vựng chuyên ngành, kính ngữ trong kinh doanh, và sự chuẩn bị cho phỏng vấn kỹ thuật.</li>
            </ul>
            
            <Link to="/signup" className="cta-button">
              Bắt đầu ngay
            </Link>
          </div>
          
          {/* Right Content */}
          <div className="hero-illustration">
            <img 
              src={computer} 
              alt="HiNa Digital Learning Platform" 
              className="computer-image" 
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
