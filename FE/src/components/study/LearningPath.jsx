import React, { useState, useEffect } from 'react';
import { BookOpen, Key, Lock, Star, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import timelineApi from '../../api/timelineApi';
import quizApi from '../../api/quizApi';
import { useAuth } from '../../context/AuthContext';
import { getAccessibleTimelines, getVisibleTimelines, hasFullTimelineAccess } from '../../utils/planAccess';
import ProUpgradeBanner from '../common/ProUpgradeBanner';

const LearningPath = () => {
  const navigate = useNavigate();
  const { user, status } = useAuth();
  const [pathData, setPathData] = useState([]);
  const [hasLockedTimelines, setHasLockedTimelines] = useState(false);

  useEffect(() => {
    if (status !== 'ready') return;

    const fetchTimelines = async () => {
      try {
        const timelines = await timelineApi.getAll();
        const accessibleTimelines = getAccessibleTimelines(timelines, user?.role);
        const visibleTimelines = getVisibleTimelines(timelines, user?.role);
        setHasLockedTimelines(
          !hasFullTimelineAccess(user?.role) && accessibleTimelines.some((timeline) => timeline.isLocked)
        );

        let dynamicPathData = [];
        let globalNodeCounter = 1;
        let checkpointCounter = 1;

        visibleTimelines.forEach((timeline) => {
          const timelineLocked = timeline.isLocked;

          dynamicPathData.push({
            id: `div-${timeline.id}`,
            type: 'divider',
            text: timeline.title ? timeline.title.toUpperCase() : 'BÀI HỌC',
            isProLocked: timelineLocked,
          });

          const sortedLessons = (timeline.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0));

          sortedLessons.forEach((lesson) => {
            const userId = user?.id || 'guest';
            const progressKey = `progress_${userId}_lesson_${lesson.id}`;

            const savedProgress = localStorage.getItem(progressKey);
            let progressValue = 0;
            if (savedProgress) {
              progressValue = JSON.parse(savedProgress).percentage || 0;
            }

            const isDraft = lesson.status === 'draft';

            dynamicPathData.push({
              id: lesson.id,
              realId: !isDraft && !timelineLocked ? lesson.id : null,
              order: lesson.order,
              lessonCode: lesson.lessonCode,
              type: 'node',
              active: !isDraft && !timelineLocked,
              isProLocked: timelineLocked,
              offset: globalNodeCounter % 2 === 1 ? -110 : 110,
              progressValue,
            });
            globalNodeCounter += 1;
          });

          dynamicPathData.push({
            id: `ckpt-${timeline.id}`,
            timelineId: timeline.id,
            type: 'checkpoint',
            text: `Kiểm tra thử - ${checkpointCounter}`,
            num: checkpointCounter,
            quizId: null,
            isProLocked: timelineLocked,
          });
          checkpointCounter += 1;
        });

        const checkpoints = dynamicPathData.filter((item) => item.type === 'checkpoint');
        await Promise.all(
          checkpoints.map(async (checkpoint) => {
            if (checkpoint.isProLocked) return;
            try {
              const quiz = await quizApi.getQuizByTimeline(checkpoint.timelineId);
              if (quiz && quiz.id) checkpoint.quizId = quiz.id;
            } catch {
              // No quiz or locked timeline
            }
          })
        );

        setPathData(dynamicPathData);
      } catch (error) {
        console.error('Failed to load timelines for path:', error);
      }
    };

    fetchTimelines();
  }, [status, user?.id, user?.role]);

  const renderLineToNextNode = (currentOffset, nextOffset, isActive) => {
    if (nextOffset === null || nextOffset === undefined) return null;

    const strokeColor = isActive ? '#00e5ff' : 'rgba(255,255,255,0.2)';
    const styleLine = isActive ? { filter: 'drop-shadow(0 0 4px #00e5ff)' } : {};

    const canvasCenterX = 225;
    const canvasCenterY = 150;
    const verticalJump = 130;
    const startX = canvasCenterX;
    const startY = canvasCenterY + 46;
    const endX = canvasCenterX + (nextOffset - currentOffset);
    const endY = canvasCenterY + verticalJump - 46;
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

  const renderProgressRing = (item) => {
    if (item.progressValue === undefined) return null;

    const radius = 42;
    const circumference = 2 * Math.PI * radius;
    const percentage = item.progressValue;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const ringColor = percentage === 100 ? '#fbbf24' : '#38bdf8';

    return (
      <svg
        className="node-progress-ring"
        width="100"
        height="100"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-90deg)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <circle stroke="#e2e8f0" strokeWidth="8" fill="transparent" r={radius} cx="50" cy="50" />
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

  const handleLockedClick = () => {
    navigate('/profile');
  };

  return (
    <div className="learning-path">
      <div className="path-header">
        <div className="level-badge">N5</div>
        <div className="level-info">
          <h3>N5 - BEGINNER</h3>
          <p>Tiếng Nhật cho IT & Căn bản</p>
        </div>
      </div>

      {!hasFullTimelineAccess(user?.role) && (
        <ProUpgradeBanner
          title="Gói USER: mở timeline đầu tiên"
          description="Bạn đang học timeline đầu tiên miễn phí. Nâng cấp PRO để mở toàn bộ lộ trình và kiểm tra thử."
        />
      )}

      <div className="path-nodes-container">
        {pathData.map((item, index) => {
          if (item.type === 'divider') {
            return (
              <div key={item.id} className={`path-divider ${item.isProLocked ? 'is-locked' : ''}`}>
                <span className="line"></span>
                <span className="text">
                  {item.text}
                  {item.isProLocked ? ' · PRO' : ''}
                </span>
                <span className="line"></span>
              </div>
            );
          }

          if (item.type === 'checkpoint') {
            const hasQuiz = !!item.quizId && !item.isProLocked;
            return (
              <div key={item.id} className="checkpoint-container">
                <div
                  className={`checkpoint-card ${hasQuiz ? 'active-checkpoint' : 'locked-checkpoint'}`}
                  style={{
                    cursor: hasQuiz ? 'pointer' : item.isProLocked ? 'pointer' : 'not-allowed',
                    opacity: hasQuiz ? 1 : 0.6,
                    border: hasQuiz ? '1px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)',
                    background: hasQuiz ? 'rgba(59, 130, 246, 0.1)' : '#1c2035',
                  }}
                  onClick={() => {
                    if (item.isProLocked) {
                      handleLockedClick();
                      return;
                    }
                    if (hasQuiz) navigate(`/quiz/${item.quizId}`);
                  }}
                >
                  <div
                    className="key-icon-wrapper"
                    style={{ background: hasQuiz ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.05)' }}
                  >
                    {item.isProLocked ? <Lock size={20} color="#c084fc" /> : <Key size={20} color={hasQuiz ? '#fbbf24' : '#9ca3af'} />}
                  </div>
                  <span style={{ color: hasQuiz ? '#fff' : '#9ca3af', fontWeight: hasQuiz ? 'bold' : 'normal' }}>
                    {item.text}
                    {item.isProLocked ? ' · PRO' : ''}
                  </span>
                </div>
              </div>
            );
          }

          if (item.type === 'node') {
            let nextOffset = null;
            for (let i = index + 1; i < pathData.length; i += 1) {
              if (pathData[i].type === 'node') {
                nextOffset = pathData[i].offset;
                break;
              }
              if (pathData[i].type !== 'node') break;
            }

            const dynamicClasses = [];
            if (item.active) dynamicClasses.push('active');
            if (item.isProLocked) dynamicClasses.push('pro-locked');
            if (item.progressValue === 100) dynamicClasses.push('completed');
            if (item.progressValue > 0 && item.progressValue < 100) dynamicClasses.push('in-progress');

            return (
              <div
                key={item.id}
                className={`node-wrapper ${dynamicClasses.join(' ')}`}
                style={{
                  transform: `translateX(${item.offset}px)`,
                  cursor: item.realId || item.isProLocked ? 'pointer' : 'default',
                }}
                onClick={() => {
                  if (item.isProLocked) {
                    handleLockedClick();
                    return;
                  }
                  if (item.realId) {
                    const displayId = item.lessonCode ? item.lessonCode : item.realId;
                    navigate(`/lesson/${displayId}`, { state: { realId: item.realId } });
                  }
                }}
              >
                {renderProgressRing(item)}
                <div className="node-circle" style={{ zIndex: 10 }}>
                  {item.isProLocked ? (
                    <Lock size={22} color="#c084fc" />
                  ) : item.progressValue === 100 ? (
                    <Crown size={28} color="#ffffff" />
                  ) : item.active ? (
                    item.progressValue > 0 ? (
                      <Star size={24} color="#ffffff" fill="#ffffff" />
                    ) : (
                      <BookOpen size={24} color="#ffffff" />
                    )
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

        {hasLockedTimelines && (
          <div className="locked-section-card">
            <div className="locked-icon-wrapper">
              <Lock size={20} className="lock-icon" />
            </div>
            <h3>Timeline tiếp theo</h3>
            <p>
              Gói USER chỉ mở timeline đầu tiên.
              <br />
              Nâng cấp PRO để học tiếp toàn bộ lộ trình.
            </p>
            <button type="button" className="unlock-btn" onClick={handleLockedClick}>
              Nâng cấp PRO
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPath;
