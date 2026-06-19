import React, { useState, useEffect } from 'react';
import { BookOpen, Key, Lock, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import timelineApi from '../../api/timelineApi';
import quizApi from '../../api/quizApi';

const LearningPath = () => {
  const navigate = useNavigate();
  
  // ---------------------------------------------------------
  // DYNAMIC DATABASE STATE
  // ---------------------------------------------------------
  const [pathData, setPathData] = useState([]);

  useEffect(() => {
    const fetchTimelines = async () => {
      try {
        const timelines = await timelineApi.getAll();
        
        let dynamicPathData = [];
        let globalNodeCounter = 1;
        let checkpointCounter = 1;
        
        // Sort timelines by order
        const sortedTimelines = [...timelines].sort((a, b) => (a.order || 0) - (b.order || 0));

        sortedTimelines.forEach((timeline) => {
          // Add timeline title as divider
          dynamicPathData.push({
            id: `div-${timeline.id}`,
            type: 'divider',
            text: timeline.title ? timeline.title.toUpperCase() : 'BÀI HỌC'
          });
          
          const sortedLessons = (timeline.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0));
          
          sortedLessons.forEach((lesson) => {
             const userStr = localStorage.getItem('user');
             const userId = userStr ? JSON.parse(userStr).id : 'guest';
             const progressKey = `progress_${userId}_lesson_${lesson.id}`;
             
             const savedProgress = localStorage.getItem(progressKey);
             let progressValue = 0;
             if (savedProgress) {
               progressValue = JSON.parse(savedProgress).percentage || 0;
             }
             
             const isDraft = lesson.status === 'draft';

             dynamicPathData.push({
                id: lesson.id,
                realId: isDraft ? null : lesson.id,
                order: lesson.order,
                lessonCode: lesson.lessonCode,
                type: 'node',
                active: !isDraft, // Locked if it's a draft
                offset: (globalNodeCounter % 2 === 1) ? -110 : 110,
                progressValue
             });
             globalNodeCounter++;
          });
          
          // Add checkpoint after each timeline
          dynamicPathData.push({
             id: `ckpt-${timeline.id}`,
             timelineId: timeline.id,
             type: 'checkpoint',
             text: `Kiểm tra thử - ${checkpointCounter}`,
             num: checkpointCounter,
             quizId: null // will be populated below
          });
          checkpointCounter++;
        });
        
        // Fetch quizzes for each timeline to see if checkpoint is active
        const checkpoints = dynamicPathData.filter(d => d.type === 'checkpoint');
        await Promise.all(checkpoints.map(async (ckpt) => {
          try {
            const q = await quizApi.getQuizByTimeline(ckpt.timelineId);
            if (q && q.id) ckpt.quizId = q.id;
          } catch (e) {
            // No quiz found, ignore
          }
        }));

        setPathData(dynamicPathData);
      } catch (error) {
        console.error('Failed to load timelines for path:', error);
      }
    };
    
    fetchTimelines();
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
          stroke="#e2e8f0"
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
            const hasQuiz = !!item.quizId;
            return (
              <div key={item.id} className="checkpoint-container">
                <div 
                  className={`checkpoint-card ${hasQuiz ? 'active-checkpoint' : 'locked-checkpoint'}`}
                  style={{
                    cursor: hasQuiz ? 'pointer' : 'not-allowed',
                    opacity: hasQuiz ? 1 : 0.6,
                    border: hasQuiz ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                    background: hasQuiz ? 'rgba(59, 130, 246, 0.1)' : '#1c2035',
                  }}
                  onClick={() => {
                    if (hasQuiz) navigate(`/quiz/${item.quizId}`);
                  }}
                >
                  <div className="key-icon-wrapper" style={{ background: hasQuiz ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.05)' }}>
                    <Key size={20} color={hasQuiz ? '#fbbf24' : '#9ca3af'} />
                  </div>
                  <span style={{ color: hasQuiz ? '#fff' : '#9ca3af', fontWeight: hasQuiz ? 'bold' : 'normal' }}>{item.text}</span>
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
                    const displayId = item.lessonCode ? item.lessonCode : item.realId;
                    navigate(`/lesson/${displayId}`, { state: { realId: item.realId } });
                  }
                }}
              >
                {renderProgressRing(item)}
                <div className="node-circle" style={{ zIndex: 10 }}>
                  {item.progressValue === 100 ? (
                    <Crown size={28} color="#ffffff" />
                  ) : item.active ? (
                    item.progressValue > 0 ? <Star size={24} color="#ffffff" fill="#ffffff" /> : <BookOpen size={24} color="#ffffff" />
                  ) : (
                    <BookOpen size={24} color="#94a3b8" />
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
