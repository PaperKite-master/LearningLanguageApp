import React, { useState, useEffect } from 'react';
import { Flame, Target, Rocket } from 'lucide-react';

import lessonApi from '../../api/lessonApi';

const ProgressWidget = () => {
  const [progressData, setProgressData] = useState({
    overallPercentage: 0,
    streak: 34,
    achievements: { current: 0, total: 0 }
  });

  useEffect(() => {
    const fetchAndCalculateProgress = async () => {
      try {
        const data = await lessonApi.getAll();
        const totalLessons = data ? data.length : 0;
        
        if (totalLessons === 0) return;

        let totalPercentageSum = 0;
        let fullyCompletedCount = 0;

        data.forEach(lesson => {
          const savedProgress = localStorage.getItem(`lessonProgress_${lesson.id}`);
          if (savedProgress) {
            const parsed = JSON.parse(savedProgress);
            const percent = parsed.percentage || 0;
            totalPercentageSum += percent;
            if (percent === 100) {
              fullyCompletedCount += 1;
            }
          }
        });

        const overall = Math.round(totalPercentageSum / totalLessons);

        setProgressData(prev => ({
          ...prev,
          overallPercentage: overall,
          achievements: { current: fullyCompletedCount, total: totalLessons }
        }));
      } catch (error) {
        console.error('Failed to load lessons for progress widget:', error);
      }
    };

    fetchAndCalculateProgress();
  }, []);

  // Circular progress calculation
  const percentage = progressData.overallPercentage;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  
  // Create a 75% arc (leaving a 25% gap at the bottom)
  const arcPercentage = 0.75;
  const arcLength = circumference * arcPercentage;
  const progressLength = arcLength * (percentage / 100);

  return (
    <div className="progress-widget">
      <h3 className="widget-title">QUÁ TRÌNH HỌC</h3>
      
      <div className="circle-progress-container">
        <svg className="progress-ring" width="160" height="160" style={{ transform: 'rotate(135deg)' }}>
          {/* Background circle arc */}
          <circle
            className="ring-bg"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            r={radius}
            cx="80"
            cy="80"
          />
          {/* Progress circle arc */}
          <circle
            className="ring-progress"
            stroke="url(#gradient)"
            strokeWidth="8"
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={`${progressLength} ${circumference}`}
            r={radius}
            cx="80"
            cy="80"
            style={{ transition: 'stroke-dasharray 0.5s ease-in-out' }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d433ff" />
              <stop offset="100%" stopColor="#00e5ff" />
            </linearGradient>
            
            {/* Rocket Icon Glow */}
            <filter id="glow">
               <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
               <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
               </feMerge>
            </filter>
          </defs>
        </svg>
        
        {/* Center Icon */}
        <div className="progress-center" style={{ marginTop: '-5px' }}>
          <Rocket className="rocket-icon" size={32} strokeWidth={1.5} style={{ transform: 'rotate(-45deg)', filter: 'drop-shadow(0 0 8px rgba(212,51,255,0.8))' }} />
        </div>
        
        {/* Percentage Label */}
        <div className="progress-label">
          {percentage}%
        </div>
      </div>

      <div className="stats-pills">
        <div className="stat-pill">
          <Flame size={18} className="stat-icon-flame" />
          <div className="stat-details">
            <span className="stat-num">{progressData.streak}</span>
            <span className="stat-desc">Chuỗi ngày</span>
          </div>
        </div>
        <div className="stat-pill">
          <Target size={18} className="stat-icon-hex" />
          <div className="stat-details">
            <span className="stat-num">{progressData.achievements.current} / {progressData.achievements.total}</span>
            <span className="stat-desc">Thành tích</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressWidget;
