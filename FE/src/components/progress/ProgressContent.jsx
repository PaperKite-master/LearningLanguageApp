import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Target, 
  Clock, 
  TrendingUp, 
  CheckCircle2,
  Circle
} from 'lucide-react';
import userApi from '../../api/userApi';

const ProgressContent = () => {
  // ---------------------------------------------------------
  // MOCK DATABASE STATE (Ready for API Integration)
  // Replace this with a useEffect fetch from your database
  // ---------------------------------------------------------
  const [progressData, setProgressData] = useState({
    stats: {
      streak: 34,
      target: 'N2',
      hoursLearned: '156H',
      weeklyProgress: '+ 12%'
    },
    skillProgress: [
      { id: 'kanji', label: 'Kanji', current: 890, total: 2000 },
      { id: 'vocab', label: 'Từ vựng', current: 1240, total: 1720 },
      { id: 'grammar', label: 'Ngữ pháp', current: 145, total: 250 },
      { id: 'video', label: 'Video', current: 95, total: 150, unit: 'hrs' },
    ],
    todayFocus: [
      { id: 1, title: 'Video', sub: '30 phút' },
      { id: 2, title: 'Viết email', sub: '20 phút' },
      { id: 3, title: 'Từ vựng', sub: '15 từ' },
    ],
    completedLessons: [
      { id: 1, title: 'Hiragana', done: true },
      { id: 2, title: 'Katakana', done: true },
      { id: 3, title: 'Chào hỏi cơ bản', done: true },
      { id: 4, title: 'Số và số đếm', done: true },
      { id: 5, title: 'Hán tự', done: false },
      { id: 6, title: 'Ngữ pháp cơ bản', done: false },
    ]
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await userApi.getDashboardStats();
        if (response) {
          const payload = response.data && response.data.stats ? response.data : response;
          const statsObj = payload.stats || {};
          
          setProgressData(prev => ({
            ...prev,
            stats: {
              streak: statsObj.streak || 0,
              target: statsObj.target || 'N5',
              hoursLearned: `${statsObj.totalHours || 0}H`,
              weeklyProgress: statsObj.weeklyGrowth != null ? (statsObj.weeklyGrowth >= 0 ? `+ ${statsObj.weeklyGrowth}%` : `${statsObj.weeklyGrowth}%`) : '+ 0%'
            }
          }));
        }
      } catch (error) {
        console.error("Failed to fetch progress stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <div className="progress-content-area">
      
      {/* Header */}
      <div className="progress-header">
        <h1 className="progress-heading">TIẾN ĐỘ HỌC TẬP</h1>
        <p className="progress-subheading">Theo dõi hành trình và thành tích học tập của bạn</p>
      </div>

      {/* Main Dashboard Card */}
      <div className="progress-dashboard-card">
        
        {/* Section 1: Stats Row */}
        <div className="progress-stats-row">
          <div className="progress-stat-pill">
            <div className="stat-header">
              <Flame className="stat-icon flame" size={16} />
              <span>Chuỗi ngày</span>
            </div>
            <div className="stat-value">{progressData.stats.streak}</div>
          </div>
          
          <div className="progress-stat-pill">
            <div className="stat-header">
              <Target className="stat-icon target" size={16} />
              <span>Mục tiêu</span>
            </div>
            <div className="stat-value">{progressData.stats.target}</div>
          </div>
          
          <div className="progress-stat-pill">
            <div className="stat-header">
              <Clock className="stat-icon clock" size={16} />
              <span>Số giờ học</span>
            </div>
            <div className="stat-value">{progressData.stats.hoursLearned}</div>
          </div>
          
          <div className="progress-stat-pill">
            <div className="stat-header">
              <TrendingUp className="stat-icon trending" size={16} />
              <span>Tuần này</span>
            </div>
            <div className="stat-value success">{progressData.stats.weeklyProgress}</div>
          </div>
        </div>

        {/* Section 2: Skill Progress Bars */}
        <div className="skill-progress-section">
          {progressData.skillProgress.map(skill => {
            const percent = (skill.current / skill.total) * 100;
            return (
              <div key={skill.id} className="skill-row">
                <div className="skill-labels">
                  <span className="skill-name">{skill.label}</span>
                  <span className="skill-fraction">
                    {skill.current.toLocaleString()} / {skill.total.toLocaleString()} {skill.unit || ''}
                  </span>
                </div>
                <div className="skill-track">
                  <div 
                    className="skill-fill" 
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Section 3: Today's Focus */}
        <div className="focus-section">
          <h3 className="progress-section-title">TRỌNG TÂM HÔM NAY</h3>
          <div className="focus-grid">
            {progressData.todayFocus.map(task => (
              <div key={task.id} className="focus-card">
                <h4>{task.title}</h4>
                <p>{task.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="progress-divider"></div>

        {/* Section 4: Completed Lessons */}
        <div className="completed-lessons-section">
          <h3 className="progress-section-title">BÀI HỌC ĐÃ HOÀN THÀNH</h3>
          <div className="lessons-grid">
            {progressData.completedLessons.map(lesson => (
              <div 
                key={lesson.id} 
                className={`lesson-pill ${lesson.done ? 'done' : 'pending'}`}
              >
                <div className="lesson-icon">
                  {lesson.done ? (
                    <div className="check-circle-wrapper">
                      <CheckCircle2 fill="#00e676" color="#1c2035" size={24} />
                    </div>
                  ) : (
                    <Circle color="rgba(255, 255, 255, 0.3)" size={24} strokeWidth={1.5} />
                  )}
                </div>
                <span className="lesson-title">{lesson.title}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProgressContent;
