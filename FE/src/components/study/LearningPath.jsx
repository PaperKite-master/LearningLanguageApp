import React, { useState, useEffect } from 'react';
import { BookOpen, Key, Lock, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import lessonApi from '../../api/lessonApi';

const LearningPath = () => {
  const navigate = useNavigate();
  
  // ---------------------------------------------------------
  // MOCK DATABASE STATE (Ready for API Integration)
  // Replace this with a useEffect fetch from your database
  // ---------------------------------------------------------
  const [pathData, setPathData] = useState([
    { id: 'div1', type: 'divider', text: 'NÓI LỜI CHÀO VÀ TẠM BIỆT' },
    { id: 1, type: 'node', active: false, offset: -110, progressValue: 0 },
    { id: 2, type: 'node', active: false, offset: 110, progressValue: 0 },
    { id: 3, type: 'node', active: false, offset: -110, progressValue: 0 },
    { id: 4, type: 'node', active: false, offset: 110, progressValue: 0 }, 
    { id: 5, type: 'node', active: false, offset: -110, progressValue: 0 }, 
    { id: 'ckpt1', type: 'checkpoint', text: 'Kiểm tra thử - 1', num: 1 },
    
    { id: 'div2', type: 'divider', text: 'TẠO CÂU PHỦ ĐỊNH VÀ TRẢ LỜI CÂU HỎI' },
    { id: 6, type: 'node', active: false, offset: -110, progressValue: 0 },
    { id: 7, type: 'node', active: false, offset: 110, progressValue: 0 },
    { id: 8, type: 'node', active: false, offset: -110, progressValue: 0 },
    { id: 9, type: 'node', active: false, offset: 110, progressValue: 0 },
    { id: 10, type: 'node', active: false, offset: -110, progressValue: 0 },
    { id: 'ckpt2', type: 'checkpoint', text: 'Kiểm tra thử - 2', num: 2 },
    
    { id: 'div3', type: 'divider', text: 'NÓI VỀ ĐỒ DÙNG CÁ NHÂN' },
    { id: 11, type: 'node', active: false, offset: -110, progressValue: 0 },
    { id: 12, type: 'node', active: false, offset: 110, progressValue: 0 },
    { id: 13, type: 'node', active: false, offset: -110, progressValue: 0 },
    { id: 14, type: 'node', active: false, offset: 110, progressValue: 0 },
    { id: 15, type: 'node', active: false, offset: -110, progressValue: 0 },
    { id: 'ckpt3', type: 'checkpoint', text: 'Kiểm tra thử - 3', num: 3 },
  ]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const data = await lessonApi.getAll();
        const rawLessons = data || [];
        
        // Sắp xếp bài học theo vị trí order
        const realLessons = rawLessons.sort((a, b) => {
          return (a.order || 0) - (b.order || 0);
        });
        
        setPathData(prevPath => {
          return prevPath.map(item => {
            if (item.type === 'node') {
              // Tìm bài học có order tương ứng với id của node trên bản đồ
              const lesson = realLessons.find(l => l.order === item.id);
              
              if (lesson) {
                const savedProgress = localStorage.getItem(`lessonProgress_${lesson.id}`);
                let progressValue = 0;
                if (savedProgress) {
                  const parsed = JSON.parse(savedProgress);
                  progressValue = parsed.percentage || 0;
                }
                return {
                  ...item,
                  realId: lesson.id,
                  order: lesson.order,
                  active: true,
                  progressValue
                };
              }
            }
            return item;
          });
        });
      } catch (error) {
        console.error('Failed to load lessons for path:', error);
      }
    };
    
    fetchLessons();
  }, []);

  // SVG Connector line helper
  const renderLineToNextNode = (currentOffset, nextOffset, isActive) => {
    if (nextOffset === null || nextOffset === undefined) return null;
    
    const strokeColor = isActive ? "#00e5ff" : "rgba(255,255,255,0.2)";
    const styleLine = isActive ? { filter: 'drop-shadow(0 0 4px #00e5ff)' } : {};

    // SVG Dimensions are 450x300. SVG Center is 225, 150
    // Node wrapper total height = 80 + 35*2 (margins) = 150px
    // Circle radius = 35. Start Y = Base Center Y + 35
    const canvasCenterX = 225;
    const canvasCenterY = 150;
    
    const verticalJump = 130; // Total height footprint including margins
    
    // Start drawing 46px below and above center, exactly outside the 42px progress ring so it never overlaps
    const startX = canvasCenterX;
    const startY = canvasCenterY + 46; 
    const endX = canvasCenterX + (nextOffset - currentOffset);
    const endY = canvasCenterY + verticalJump - 46;
    
    // Smooth, very wide S-curve similar to Figma
    // Use the exact middle point of the vertical distance for control points
    const middleY = (startY + endY) / 2;
    const cp1X = startX;
    const cp1Y = middleY;
    const cp2X = endX;
    const cp2Y = middleY; 

    const svgPath = `M ${startX},${startY} C ${cp1X},${cp1Y} ${cp2X},${cp2Y} ${endX},${endY}`;

    return (
      <svg className="node-connector" style={styleLine}>
        <path 
          d={svgPath}
          fill="transparent" 
          stroke={strokeColor} 
          strokeWidth="3.5" 
          strokeDasharray="8 8"
          strokeLinecap="round"
        />
      </svg>
    );
  };

  // Node Progress Ring helper (dynamic for all nodes)
  const renderProgressRing = (item) => {
    if (item.progressValue === undefined) return null;
    
    const radius = 42; 
    const circumference = 2 * Math.PI * radius;
    const percentage = item.progressValue;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    const ringColor = percentage === 100 ? "#fbbf24" : "#38bdf8";

    return (
      <svg 
        className="node-progress-ring" 
        width="100" height="100" 
        style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%) rotate(-90deg)', 
          pointerEvents: 'none',
          zIndex: 0
        }}
      >
        <circle
          stroke="#4b5563"
          strokeWidth="8"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <circle
          stroke={ringColor}
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          r={radius}
          cx="50"
          cy="50"
        />
      </svg>
    );
  };

  return (
    <div className="learning-path">
      {/* Path Header */}
      <div className="path-header">
        <div className="level-badge">N5</div>
        <div className="level-info">
          <h3>N5 - BEGINNER</h3>
          <p>Tiếng Nhật cho IT & Căn bản</p>
        </div>
      </div>

      {/* Nodes Container */}
      <div className="path-nodes-container">
        {pathData.map((item, index) => {
          
          if (item.type === 'divider') {
            return (
              <div key={item.id} className="path-divider">
                <span className="line"></span>
                <span className="text">{item.text}</span>
                <span className="line"></span>
              </div>
            );
          }

          if (item.type === 'checkpoint') {
            return (
              <div key={item.id} className="checkpoint-container">
                <div className="checkpoint-card">
                  <div className="key-icon-wrapper">
                    <Key size={20} />
                  </div>
                  <span>{item.text}</span>
                </div>
              </div>
            );
          }

          if (item.type === 'node') {
            // Find the next node in the array to determine where to draw the line to
            let nextOffset = null;
            for (let i = index + 1; i < pathData.length; i++) {
              if (pathData[i].type === 'node') {
                nextOffset = pathData[i].offset;
                break;
              }
              if (pathData[i].type !== 'node') {
                // If we hit a checkpoint or divider, the line stops
                break;
              }
            }

            // Determine specific styling classes
            let dynamicClasses = [];
            if (item.active) dynamicClasses.push('active');
            if (item.progressValue === 100) dynamicClasses.push('completed');
            if (item.progressValue > 0 && item.progressValue < 100) dynamicClasses.push('in-progress');

            return (
              <div 
                key={item.id} 
                className={`node-wrapper ${dynamicClasses.join(' ')}`}
                style={{ 
                  transform: `translateX(${item.offset}px)`,
                  cursor: item.realId ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (item.realId) {
                    const displayId = item.order ? `L${String(item.order).padStart(3, '0')}` : item.realId;
                    navigate(`/lesson/${displayId}`, { state: { realId: item.realId } });
                  }
                }}
              >
                {renderProgressRing(item)}
                <div className="node-circle" style={{ zIndex: 10 }}>
                  {item.progressValue === 100 ? (
                    <Crown size={28} color="#fbbf24" fill="#fbbf24" />
                  ) : item.active ? (
                    item.progressValue > 0 ? <Star size={24} color="#38bdf8" /> : <BookOpen size={24} />
                  ) : (
                    <Lock size={24} opacity={0.5} />
                  )}
                </div>
                {renderLineToNextNode(item.offset, nextOffset, item.active)}
              </div>
            );
          }

          return null;
        })}
        
        {/* Locked Section Bottom */}
        <div className="locked-section-card">
          <div className="locked-icon-wrapper">
            <Lock size={20} className="lock-icon" />
          </div>
          <h3>Phần 2</h3>
          <p>Học từ, cụm từ và chủ điểm ngữ pháp<br/>để giao tiếp cơ bản</p>
          <button className="unlock-btn">Mở khóa</button>
        </div>
        
      </div>
    </div>
  );
};

export default LearningPath;
