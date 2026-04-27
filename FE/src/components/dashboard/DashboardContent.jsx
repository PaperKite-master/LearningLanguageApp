import React, { useState, useEffect } from 'react';
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
  // ---------------------------------------------------------
  // MOCK DATABASE STATE (Ready for API Integration)
  // Replace this with a useEffect fetch from your database
  // ---------------------------------------------------------
  const [userData, setUserData] = useState({
    username: 'DEVELOPER!',
    streak: 34,
    target: 'N2',
    hoursLearned: 156,
    weeklyProgress: '+ 12%',
    todayGoals: [
      { id: 1, label: 'Bài học', current: 2, total: 3 },
      { id: 2, label: 'Flashcards', current: 15, total: 20 },
      { id: 3, label: 'Luyện tập', current: 1, total: 2 },
    ]
  });

  // Example of how you would fetch from DB:
  // useEffect(() => {
  //   fetch('/api/user/dashboard').then(res => res.json()).then(data => setUserData(data));
  // }, []);

  return (
    <div className="dashboard-content">
      {/* Welcome Banner */}
      <section className="welcome-banner">
        <div className="welcome-text">
          <h1>おはよう、<span>{userData.username}</span></h1>
          <p>Tiếp tục hành trình học tiếng Nhật ngay!</p>
        </div>
        
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-header">
              <Flame className="stat-icon flame" size={18} />
              <span>Chuỗi ngày</span>
            </div>
            <div className="stat-value">{userData.streak}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <Target className="stat-icon target" size={18} />
              <span>Mục tiêu</span>
            </div>
            <div className="stat-value">{userData.target}</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <Clock className="stat-icon clock" size={18} />
              <span>Số giờ học</span>
            </div>
            <div className="stat-value">{userData.hoursLearned}H</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <TrendingUp className="stat-icon trending" size={18} />
              <span>Tuần này</span>
            </div>
            <div className="stat-value success">{userData.weeklyProgress}</div>
          </div>
        </div>
      </section>

      {/* Today's Goals */}
      <section className="dashboard-section">
        <h2 className="section-title">MỤC TIÊU HÔM NAY</h2>
        <div className="goals-grid">
          
          {userData.todayGoals.map(goal => {
            const progressPercent = (goal.current / goal.total) * 100;
            return (
              <div key={goal.id} className="goal-card">
                <div className="goal-info">
                  <span>{goal.label}</span>
                  <span className="goal-fraction">{goal.current} / {goal.total}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{width: `${progressPercent}%`}}></div>
                </div>
              </div>
            );
          })}
          
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
