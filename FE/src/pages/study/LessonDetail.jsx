import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, BookOpen } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import remarkBreaks from 'remark-breaks';
import userLessonApi from '../../api/userLessonApi';
import lessonApi from '../../api/lessonApi';
import Sidebar from '../../components/dashboard/Sidebar';
import { InteractiveFillBlank, InteractiveMatching, InteractiveMultipleChoice, InteractiveReorder } from '../../components/study/InteractiveExercises';

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
    
    // Tạo ID duy nhất cho exercise, ưu tiên dùng node offset nếu có, nếu không thì dùng text
    const exerciseId = node?.position?.start?.offset ? `ex_${node.position.start.offset}` : text;
    
    // Xử lý game ghép từ (code block dạng: ```match)
    if (!inline && match && match[1] === 'match') {
      return <InteractiveMatching text={text} onComplete={() => onComplete && onComplete(exerciseId)} />;
    }
    
    // Xử lý trắc nghiệm (code block dạng: ```mcq)
    if (!inline && match && match[1] === 'mcq') {
      return <InteractiveMultipleChoice text={text} onComplete={() => onComplete && onComplete(exerciseId)} />;
    }
    
    // Xử lý sắp xếp câu (code block dạng: ```reorder)
    if (!inline && match && match[1] === 'reorder') {
      return <InteractiveReorder text={text} onComplete={() => onComplete && onComplete(exerciseId)} />;
    }
    
    // Xử lý điền từ (inline code dạng: `ans:TỪ_KHÓA`)
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
  const [totalExercises, setTotalExercises] = useState(0);
  const [completedIds, setCompletedIds] = useState([]);

  const countExercises = (markdown) => {
    if (!markdown) return 0;
    let count = 0;
    count += (markdown.match(/ans:/g) || []).length;
    count += (markdown.match(/```match/g) || []).length;
    count += (markdown.match(/```mcq/g) || []).length;
    count += (markdown.match(/```reorder/g) || []).length;
    return count;
  };

  useEffect(() => {
    const fetchLessonData = async () => {
      try {
        setLoading(true);
        // Lấy chi tiết bài học
        const lessonData = await userLessonApi.getLessonById(id);
        setLesson(lessonData);
        
        const total = countExercises(lessonData.contentMarkdown);
        setTotalExercises(total);
        
        // Khôi phục tiến độ từ localStorage
        const realId = lessonData.id || id;
        const userStr = localStorage.getItem('user');
        const userId = userStr ? JSON.parse(userStr).id : 'guest';
        const progressKey = `progress_${userId}_lesson_${realId}`;
        
        const savedProgress = localStorage.getItem(progressKey);
        if (savedProgress) {
          const parsed = JSON.parse(savedProgress);
          setCompletedIds(parsed.completedIds || []);
        }

        // Gọi API backend báo mở bài
        try {
          await lessonApi.saveProgress(realId, 'OPEN');
        } catch (apiErr) {
          console.log('Không thể lưu tiến độ mở bài lên server:', apiErr);
        }

        // Lấy danh sách ngữ pháp liên quan (không bắt buộc, nếu API lỗi thì có thể bỏ qua)
        try {
          const grammarData = await userLessonApi.getGrammarsByLessonId(id);
          setGrammars(grammarData || []);
        } catch (grammarErr) {
          console.log('Không tải được ngữ pháp hoặc bài học không có ngữ pháp:', grammarErr);
        }
      } catch (err) {
        setError('Không thể tải dữ liệu bài học. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonData();
  }, [id]);

  const handleExerciseComplete = (exerciseId) => {
    setCompletedIds(prev => {
      if (prev.includes(exerciseId)) return prev;

      const newIds = [...prev, exerciseId];
      const realId = lesson?.id || id;
      // Tránh việc phần trăm vượt quá 100 nếu admin sửa bài làm tăng số lượng
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

      // Gọi API báo hoàn thành
      if (percentage === 100) {
        lessonApi.saveProgress(realId, 'COMPLETE').catch(err => {
          console.error('Không thể lưu tiến độ hoàn thành:', err);
        });
      }

      return newIds;
    });
  };

  // Hàm chuyển đổi link Youtube sang định dạng nhúng (embed)
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return url; // Fallback
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2>Đang tải bài học...</h2>
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
          <button className="pill-element" onClick={() => navigate('/study')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Quay lại Lộ trình
          </button>
        </main>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(lesson.videoUrl);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area study-area" data-color-mode="dark" style={{ padding: '30px', overflowY: 'auto' }}>
        
        {/* Nút quay lại */}
        <button 
          onClick={() => navigate('/study')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', marginBottom: '20px', fontSize: '1rem' }}
        >
          <ArrowLeft size={20} /> Quay lại lộ trình
        </button>

        {/* Tiêu đề bài học */}
        <div style={{ marginBottom: '30px' }}>
          <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '12px' }}>
            {lesson.topic || 'Bài học'}
          </span>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', margin: 0 }}>{lesson.title}</h1>
        </div>

        {/* Khu vực Video */}
        {embedUrl && (
          <div style={{ marginBottom: '40px', background: '#1c2035', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', marginBottom: '15px' }}>
              <PlayCircle size={20} color="#3b82f6" /> Video Bài Giảng
            </h3>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px' }}>
              <iframe 
                src={embedUrl} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title="Lesson Video"
              />
            </div>
          </div>
        )}

        {/* Khu vực Nội dung Bài học (Markdown) */}
        {lesson.contentMarkdown && (
          <div style={{ marginBottom: '40px', background: '#1c2035', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', marginBottom: '20px' }}>
              <BookOpen size={20} color="#10b981" /> Nội Dung Chính
            </h3>
            <div className="markdown-preview-wrapper" style={{ fontSize: '1.1rem', lineHeight: '1.8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Tiến độ bài học:</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>{completedIds.length} / {totalExercises} Hoàn thành</span>
              </div>
              <MDEditor.Markdown 
                source={lesson.contentMarkdown} 
                style={{ background: 'transparent' }} 
                components={getMarkdownComponents(handleExerciseComplete)}
                remarkPlugins={[remarkBreaks]}
              />
            </div>
          </div>
        )}

        {/* Khu vực Ngữ pháp (Nếu có) */}
        {grammars && grammars.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              Ngữ pháp bổ trợ
            </h2>
            {grammars.map((grammar, index) => (
              <div key={grammar.id || index} style={{ marginBottom: '20px', background: '#1c2035', padding: '24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ fontSize: '1.3rem', color: '#60a5fa', marginBottom: '15px' }}>{grammar.title}</h4>
                <div className="markdown-preview-wrapper" style={{ fontSize: '1.05rem', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>
                  <MDEditor.Markdown 
                    source={grammar.contentMarkdown} 
                    style={{ background: 'transparent' }} 
                    components={markdownComponents}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default LessonDetail;
