import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Flame, 
  Target, 
  Clock, 
  TrendingUp, 
  BookOpen,
  Layers,
  PlaySquare
} from 'lucide-react';
import userApi from '../../api/userApi';

const DashboardContent = () => {
  const navigate = useNavigate();
  // ---------------------------------------------------------
  // MOCK DATABASE STATE (Ready for API Integration)
  // Replace this with a useEffect fetch from your database
  // ---------------------------------------------------------
  const [userData, setUserData] = useState({
    username: '...',
    streak: 0,
    target: '...',
    hoursLearned: 0,
    weeklyProgress: '0%',
    todayGoals: [
      { id: 1, label: 'Bài học', current: 0, total: 3 },
      { id: 2, label: 'Flashcards', current: 0, total: 20 },
      { id: 3, label: 'Luyện tập', current: 0, total: 2 },
    ]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await userApi.getDashboardStats();
        if (response) {
          // Check if the actual payload is nested under 'data' property
          const payload = response.data && response.data.stats ? response.data : response;
          
          const userObj = payload.user || {};
          const statsObj = payload.stats || {};
          const dailyGoals = payload.dailyGoals || {};

          setUserData({
            username: userObj.name || 'Học viên',
            streak: statsObj.streak || 0,
            target: statsObj.target || 'N5',
            hoursLearned: statsObj.totalHours || 0,
            weeklyProgress: statsObj.weeklyGrowth != null ? (statsObj.weeklyGrowth >= 0 ? `+ ${statsObj.weeklyGrowth}%` : `${statsObj.weeklyGrowth}%`) : '+ 0%',
            todayGoals: [
              { 
                id: 1, 
                label: 'Bài học', 
                current: dailyGoals.lessons?.completed || 0, 
                total: dailyGoals.lessons?.target || 3 
              },
              { 
                id: 2, 
                label: 'Flashcards', 
                current: dailyGoals.flashcards?.completed || 0, 
                total: dailyGoals.flashcards?.target || 20 
              },
              { 
                id: 3, 
                label: 'Luyện tập', 
                current: dailyGoals.practice?.completed || 0, 
                total: dailyGoals.practice?.target || 2 
              },
            ]
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <div className="dashboard-content"><p>Đang tải dữ liệu...</p></div>;
  }

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
          
          <div className="access-card" onClick={() => navigate('/study')} style={{ cursor: 'pointer' }}>
            <div className="icon-wrapper">
              <BookOpen size={24} className="cyan-icon" />
            </div>
            <div className="access-info">
              <h3>Học</h3>
              <p>Học ngữ pháp và cách sử dụng từ</p>
            </div>
          </div>

          <div className="access-card" onClick={() => navigate('/alphabet')} style={{ cursor: 'pointer' }}>
            <div className="icon-wrapper">
              <span className="cyan-icon jp-char">あ</span>
            </div>
            <div className="access-info">
              <h3>Bảng chữ cái</h3>
              <p>Học bảng chữ cái Hiragana & Katakana</p>
            </div>
          </div>

          <div className="access-card" onClick={() => navigate('/flashcard')} style={{ cursor: 'pointer' }}>
            <div className="icon-wrapper">
              <Layers size={24} className="cyan-icon" />
            </div>
            <div className="access-info">
              <h3>Flash Card</h3>
              <p>Review</p>
            </div>
          </div>

          <div className="access-card" onClick={() => navigate('/videos')} style={{ cursor: 'pointer' }}>
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
