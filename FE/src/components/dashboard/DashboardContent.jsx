import React from 'react';
import { 
  Flame, 
  Target, 
  Clock, 
  TrendingUp, 
  BookOpen,
  Layers,
  PlaySquare
} from 'lucide-react';

const DashboardContent = () => {
  return (
    <div className="dashboard-content">
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div className="welcome-text">
          <h1>おはよう、<span>DEVELOPER!</span></h1>
          <p>Tiếp tục hành trình học tiếng Nhật ngay!</p>
        </div>
        
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-header">
              <Flame className="stat-icon flame" size={18} />
              <span>Chuỗi ngày</span>
            </div>
            <div className="stat-value">34</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <Target className="stat-icon target" size={18} />
              <span>Mục tiêu</span>
            </div>
            <div className="stat-value">N2</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <Clock className="stat-icon clock" size={18} />
              <span>Số giờ học</span>
            </div>
            <div className="stat-value">156H</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <TrendingUp className="stat-icon trending" size={18} />
              <span>Tuần này</span>
            </div>
            <div className="stat-value success">+ 12%</div>
          </div>
        </div>
      </section>

      {/* Today's Goals */}
      <section className="dashboard-section">
        <h2 className="section-title">MỤC TIÊU HÔM NAY</h2>
        <div className="goals-grid">
          
          <div className="goal-card">
            <div className="goal-info">
              <span>Bài học</span>
              <span className="goal-fraction">2 / 3</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{width: '66.6%'}}></div>
            </div>
          </div>

          <div className="goal-card">
            <div className="goal-info">
              <span>Flashcards</span>
              <span className="goal-fraction">15 / 20</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{width: '75%'}}></div>
            </div>
          </div>

          <div className="goal-card">
            <div className="goal-info">
              <span>Luyện tập</span>
              <span className="goal-fraction">1 / 2</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{width: '50%'}}></div>
            </div>
          </div>
          
        </div>
      </section>

      {/* Quick Access */}
      <section className="dashboard-section">
        <h2 className="section-title">TRUY CẬP NHANH</h2>
        <div className="quick-access-grid">
          
          <div className="access-card">
            <div className="icon-wrapper">
              <BookOpen size={24} className="cyan-icon" />
            </div>
            <div className="access-info">
              <h3>Học</h3>
              <p>Học ngữ pháp và cách sử dụng từ</p>
            </div>
          </div>

          <div className="access-card">
            <div className="icon-wrapper">
              <span className="cyan-icon jp-char">あ</span>
            </div>
            <div className="access-info">
              <h3>Bảng chữ cái</h3>
              <p>Học bảng chữ cái Hiragana & Katakana</p>
            </div>
          </div>

          <div className="access-card">
            <div className="icon-wrapper">
              <Layers size={24} className="cyan-icon" />
            </div>
            <div className="access-info">
              <h3>Flash Card</h3>
              <p>Review</p>
            </div>
          </div>

          <div className="access-card">
            <div className="icon-wrapper">
              <PlaySquare size={24} className="cyan-icon" />
            </div>
            <div className="access-info">
              <h3>Videos</h3>
              <p>Xem bài học</p>
            </div>
          </div>

        </div>
      </section>
      
    </div>
  );
};

export default DashboardContent;
