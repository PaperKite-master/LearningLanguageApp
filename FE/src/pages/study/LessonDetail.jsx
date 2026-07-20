import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText, ArrowRight, Edit2, Lock, ClipboardList, Database, CheckCircle2 } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import remarkBreaks from 'remark-breaks';
import userLessonApi from '../../api/userLessonApi';
import lessonApi from '../../api/lessonApi';
import quizApi from '../../api/quizApi';
import Sidebar from '../../components/dashboard/Sidebar';
import DashboardTopBar from '../../components/dashboard/DashboardTopBar';
import { InteractiveFillBlank, InteractiveMatching, InteractiveMultipleChoice, InteractiveReorder, InteractiveConnect } from '../../components/study/InteractiveExercises';
import VocabPractice from '../../components/study/VocabPractice';
import BilingualVideoPlayer from '../../components/study/BilingualVideoPlayer';
import ProUpgradeBanner from '../../components/common/ProUpgradeBanner';
import './LessonDetailNew.css';

const extractText = (children) => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children?.props?.children) return extractText(children.props.children);
  return String(children);
};

const getMarkdownComponents = (onComplete) => ({
  code: ({ inline, className, children, node, ...props }) => {
    const text = extractText(children);
    const match = /language-(\w+)/.exec(className || '');
    
    const exerciseId = node?.position?.start?.offset ? `ex_${node.position.start.offset}` : text;
    
    if (!inline && match && match[1] === 'match') {
      return <InteractiveMatching text={text} onComplete={() => onComplete && onComplete(exerciseId)} />;
    }
    
    if (!inline && match && match[1] === 'connect') {
      return <InteractiveConnect text={text} onComplete={() => onComplete && onComplete(exerciseId)} />;
    }

    if (!inline && match && match[1] === 'mcq') {
      return <InteractiveMultipleChoice text={text} onComplete={() => onComplete && onComplete(exerciseId)} />;
    }
    
    if (!inline && match && match[1] === 'reorder') {
      return <InteractiveReorder text={text} onComplete={() => onComplete && onComplete(exerciseId)} />;
    }
    
    if (text.startsWith('ans:')) {
      const answer = text.replace('ans:', '');
      return <InteractiveFillBlank correctAnswer={answer} onComplete={() => onComplete && onComplete(exerciseId)} />;
    }
    
    return <code className={className} {...props}>{children}</code>;
  }
});

const LessonDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [grammars, setGrammars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isProLocked, setIsProLocked] = useState(false);
  const [totalExercises, setTotalExercises] = useState(0);
  const [completedIds, setCompletedIds] = useState([]);
  
  // 'overview' | 'grammar' | 'exercise' | 'quiz'
  const [viewMode, setViewMode] = useState('overview'); 
  const [selectedGrammar, setSelectedGrammar] = useState(null);
  
  const [lessonQuiz, setLessonQuiz] = useState(null);

  const { parsedLessonContent } = useMemo(() => {
    if (!lesson?.contentMarkdown) return { parsedLessonContent: '' };
    // Legacy support for markdown vocab if exists, but we mainly rely on lesson.vocabularies now
    const regex = /(?:^|\n)###\s*(Từ vựng|Từ Vựng|TỪ VỰNG|Vocabulary)[\s\S]*?(?=\n#{1,3} |$)/i;
    const match = lesson.contentMarkdown.match(regex);
    if (match && lesson.vocabularies && lesson.vocabularies.length > 0) {
      return { parsedLessonContent: lesson.contentMarkdown.replace(match[0], '').trim() };
    }
    return { parsedLessonContent: lesson.contentMarkdown };
  }, [lesson?.contentMarkdown, lesson?.vocabularies]);

  const hasVocab = lesson?.vocabularies && lesson.vocabularies.length > 0;

  const countExercises = (markdown) => {
    if (!markdown) return 0;
    let count = 0;
    count += (markdown.match(/ans:/g) || []).length;
    count += (markdown.match(/```match/g) || []).length;
    count += (markdown.match(/```connect/g) || []).length;
    count += (markdown.match(/```mcq/g) || []).length;
    count += (markdown.match(/```reorder/g) || []).length;
    return count;
  };

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        const lessonData = await userLessonApi.getLessonById(id);
        setLesson(lessonData);
        
        const total = countExercises(lessonData.contentMarkdown);
        setTotalExercises(total);
        
        const realId = lessonData.id || id;
        const userStr = localStorage.getItem('user');
        const userId = userStr ? JSON.parse(userStr).id : 'guest';
        const progressKey = `progress_${userId}_lesson_${realId}`;
        
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          setCompletedIds(parsed.completedIds || []);
        }

        try {
          await lessonApi.saveProgress(realId, 'OPEN');
        } catch (apiErr) {}

        try {
          const grammarData = await userLessonApi.getGrammarsByLessonId(id);
          setGrammars(grammarData || []);
        } catch (grammarErr) {}

        try {
          const q = await quizApi.getQuizByLesson(realId);
          if (q && q.id) setLessonQuiz(q);
        } catch (quizErr) {}
      } catch (err) {
        const message = err?.message || '';
        if (message.toLowerCase().includes('pro')) {
          setIsProLocked(true);
          setError('');
        } else {
          setIsProLocked(false);
          setError('Không thể tải dữ liệu bài học. Vui lòng thử lại sau.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [id]);

  const handleExerciseComplete = useCallback((exerciseId) => {
    setCompletedIds(prev => {
      if (prev.includes(exerciseId)) return prev;

      const newIds = [...prev, exerciseId];
      const realId = lesson?.id || id;
      const safeTotal = totalExercises > 0 ? totalExercises : 1;
      const percentage = Math.min(100, Math.round((newIds.length / safeTotal) * 100));
      
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : 'guest';
      const progressKey = `progress_${userId}_lesson_${realId}`;
      
      localStorage.setItem(progressKey, JSON.stringify({
        completedCount: newIds.length,
        completedIds: newIds,
        totalExercises,
        percentage
      }));

      if (percentage === 100) {
        lessonApi.saveProgress(realId, 'COMPLETE').catch(err => {});
      }

      return newIds;
    });
  }, [id, lesson?.id, totalExercises]);

  const mdComponents = useMemo(() => getMarkdownComponents(handleExerciseComplete), [handleExerciseComplete]);

  const renderGrammarContent = (markdown) => {
    if (!markdown) return null;
    // Tách bằng thẻ heading level 3 (###)
    const parts = markdown.split(/(?=\n### )|(?=^### )/).filter(p => p.trim());
    
    return (
      <div className="grammar-detail-layout">
        {parts.map((part, idx) => {
          const match = part.match(/^###\s+(.*)\n([\s\S]*)/);
          const isFullWidth = parts.length === 1 || (idx === parts.length - 1 && parts.length % 2 !== 0);
          
          if (match) {
            return (
              <div key={idx} className={`grammar-detail-card ${isFullWidth ? 'grammar-full-width' : ''}`}>
                <h4>{match[1]}</h4>
                <MDEditor.Markdown source={match[2]} style={{ background: 'transparent' }} remarkPlugins={[remarkBreaks]} />
              </div>
            );
          } else {
            return (
              <div key={idx} className={`grammar-detail-card ${isFullWidth ? 'grammar-full-width' : ''}`}>
                <MDEditor.Markdown source={part} style={{ background: 'transparent' }} remarkPlugins={[remarkBreaks]} />
              </div>
            );
          }
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2>Đang tải...</h2>
        </main>
      </div>
    );
  }

  if (isProLocked) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main-area" style={{ padding: '40px 60px' }}>
          <ProUpgradeBanner
            title="Bài học thuộc timeline PRO"
            description="Gói USER chỉ học được timeline đầu tiên. Nâng cấp PRO để mở khóa bài học này."
          />
          <button className="practice-btn" onClick={() => navigate('/study')} style={{ marginTop: '20px' }}>
            Quay lại Lộ trình
          </button>
        </main>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Oops!</h2>
          <p>{error || 'Bài học không tồn tại.'}</p>
          <button className="practice-btn" onClick={() => navigate('/study')} style={{ marginTop: '20px' }}>
            Quay lại Lộ trình
          </button>
        </main>
      </div>
    );
  }

  const isExerciseCompleted = totalExercises > 0 && completedIds.length === totalExercises;

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area lesson-detail-new" data-color-mode="light">
        <DashboardTopBar />
        
        <div className="study-columns">
          <div className="study-main-col">
            
            {/* OVERVIEW MODE */}
            {viewMode === 'overview' && (
              <>
                <div className="lesson-header-new">
                  <button className="back-btn-new" onClick={() => navigate('/study')}>
                    <ArrowLeft size={24} />
                  </button>
                  <h2>{lesson.title.toUpperCase()}</h2>
                </div>

                <div>
                  <span className="pill-badge exercise-badge">Bài học</span>
                  <div className="card-list">
                    <div className="item-card" onClick={() => setViewMode('exercise')}>
                      <div className="item-icon-left exercise-icon">
                        <Edit2 size={24} color="#ffffff" strokeWidth={1.5} />
                      </div>
                      <div className="item-info">
                        <h4>Bài Học</h4>
                        <p>{totalExercises > 0 ? `${totalExercises} câu hỏi` : 'Đọc hiểu'}</p>
                      </div>
                      <div className="item-icon-right">
                        {isExerciseCompleted ? <CheckCircle2 size={24} color="#10b981" /> : <ArrowRight size={24} color="#a855f7" />}
                      </div>
                    </div>
                  </div>
                </div>

                {grammars && grammars.length > 0 && (
                  <div>
                    <span className="pill-badge grammar-badge">Ngữ pháp</span>
                    <div className="card-list">
                      {grammars.map((g, index) => (
                        <div className="item-card" key={g.id || index} onClick={() => { setSelectedGrammar(g); setViewMode('grammar'); }}>
                          <div className="item-icon-left grammar-icon">
                            <FileText size={24} color="#3b82f6" strokeWidth={1.5} />
                          </div>
                          <div className="item-info">
                            <h4>Bài {index + 1}</h4>
                            <p>{g.title}</p>
                          </div>
                          <div className="item-icon-right">
                            <ArrowRight size={20} color="#3b82f6" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {lessonQuiz && (
                  <div>
                    <span className="pill-badge quiz-badge">Kiểm tra</span>
                    <div className="card-list">
                      <div className="item-card" onClick={() => navigate(`/quiz/${lessonQuiz.id}`)}>
                        <div className="item-icon-left exercise-icon">
                          <ClipboardList size={24} color="#ffffff" strokeWidth={1.5} />
                        </div>
                        <div className="item-info">
                          <h4>Bài Kiểm Tra</h4>
                          <p>{lessonQuiz.questions?.length || 0} câu hỏi</p>
                        </div>
                        <div className="item-icon-right">
                          <ArrowRight size={24} color="#a855f7" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* GRAMMAR DETAIL MODE */}
            {viewMode === 'grammar' && selectedGrammar && (
              <>
                <div className="lesson-header-new">
                  <button className="back-btn-new" onClick={() => { setSelectedGrammar(null); setViewMode('overview'); }}>
                    <ArrowLeft size={24} />
                  </button>
                  <h2>NGỮ PHÁP</h2>
                </div>
                
                {renderGrammarContent(selectedGrammar.contentMarkdown)}
                
                <div className="practice-btn-container">
                  <button className="practice-btn" onClick={() => setViewMode('exercise')}>
                    Bài học
                  </button>
                </div>
              </>
            )}

            {/* VOCAB MODE */}
            {viewMode === 'vocab' && hasVocab && (
              <>
                <div className="lesson-header-new">
                  <button className="back-btn-new" onClick={() => setViewMode('overview')}>
                    <ArrowLeft size={24} />
                  </button>
                  <h2>TỪ VỰNG ({lesson.vocabularies.length} từ)</h2>
                </div>
                
                <div className="lesson-exercise-content vocab-grid">
                  {lesson.vocabularies.map((vocab, index) => (
                    <div key={vocab.id || index} className="student-vocab-card">
                      <div className="vocab-jp-group">
                        <div className="vocab-hiragana">{vocab.hiragana}</div>
                        {vocab.kanji && <div className="vocab-kanji">{vocab.kanji}</div>}
                        {vocab.romaji && <div className="vocab-romaji">[{vocab.romaji}]</div>}
                      </div>
                      <div className="vocab-meaning-group">
                        <div className="vocab-meaning">{vocab.meaning}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {lesson.questions && lesson.questions.length > 0 && (
                  <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px dashed #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '20px', fontWeight: 'bold' }}>Luyện tập</h3>
                    <VocabPractice questions={lesson.questions} />
                  </div>
                )}
              </>
            )}

            {/* EXERCISE / LESSON MODE */}
            {viewMode === 'exercise' && (
              <>
                <div className="lesson-header-new">
                  <button className="back-btn-new" onClick={() => setViewMode('overview')}>
                    <ArrowLeft size={24} />
                  </button>
                  <h2>THỰC HÀNH</h2>
                </div>
                
                <div className="lesson-exercise-content">
                  {lesson.videoUrl && (
                    <BilingualVideoPlayer
                      videoUrl={lesson.videoUrl}
                      subtitles={Array.isArray(lesson.subtitles) ? lesson.subtitles : []}
                    />
                  )}

                  {totalExercises > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #f1f5f9' }}>
                      <span style={{ color: '#64748b', fontWeight: 'bold' }}>Tiến độ:</span>
                      <span style={{ color: '#10b981', fontWeight: 'bold' }}>{completedIds.length} / {totalExercises} Hoàn thành</span>
                    </div>
                  )}

                  <div className="wmde-markdown-var">
                    <MDEditor.Markdown 
                      source={parsedLessonContent} 
                      components={mdComponents}
                      remarkPlugins={[remarkBreaks]}
                    />
                  </div>
                </div>
              </>
            )}

          </div>

          <div className="study-side-col">
            <div 
              className="vocab-card"
              style={{ cursor: hasVocab ? 'pointer' : 'default', opacity: hasVocab ? 1 : 0.6 }}
              onClick={() => { if (hasVocab) setViewMode('vocab'); }}
            >
              <h3>TỪ VỰNG</h3>
              <div className="vocab-icon">
                <Database size={60} color="#2e156f" strokeWidth={1.5} />
              </div>
              {!hasVocab && <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '10px' }}>Chưa có dữ liệu</p>}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default LessonDetail;
