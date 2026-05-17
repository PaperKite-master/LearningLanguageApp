import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import remarkBreaks from 'remark-breaks';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import lessonApi from '../../api/lessonApi';
import grammarApi from '../../api/grammarApi';
import { InteractiveFillBlank, InteractiveMatching, InteractiveMultipleChoice, InteractiveReorder, InteractiveConnect } from '../../components/study/InteractiveExercises';

const extractText = (children) => {
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (children?.props?.children) return extractText(children.props.children);
  return String(children);
};

const markdownComponents = {
  code: ({ inline, className, children, ...props }) => {
    const text = extractText(children);
    const match = /language-(\w+)/.exec(className || '');
    
    if (!inline && match && match[1] === 'match') {
      return <InteractiveMatching text={text} />;
    }
    if (!inline && match && match[1] === 'mcq') {
      return <InteractiveMultipleChoice text={text} />;
    }
    if (!inline && match && match[1] === 'reorder') {
      return <InteractiveReorder text={text} />;
    }
    if (!inline && match && match[1] === 'connect') {
      return <InteractiveConnect text={text} />;
    }
    if (text.startsWith('ans:')) {
      const answer = text.replace('ans:', '');
      return <InteractiveFillBlank correctAnswer={answer} />;
    }
    return <code className={className} {...props}>{children}</code>;
  }
};

const AdminLessonCreateContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const editMode = location.state?.editMode || false;
  const lessonData = location.state?.lessonData || null;

  const defaultTemplate = `## Mục tiêu\n- \n\n## Nội dung chính\n1. \n\n## Từ vựng mới\n- \n\n## Bài tập luyện tập\n1. `;
  const [markdownValue, setMarkdownValue] = useState(editMode && lessonData?.contentMarkdown ? lessonData.contentMarkdown : defaultTemplate);
  const [contentType, setContentType] = useState('lesson'); // 'lesson' or 'grammar'
  
  // Dữ liệu cho admin/lessons
  const [lessonFormData, setLessonFormData] = useState({
    title: editMode ? lessonData.title || '' : '',
    timelineId: editMode ? lessonData.timelineId || '' : '',
    topic: editMode ? lessonData.topic || '' : '',
    status: editMode ? lessonData.status || 'published' : 'published',
    videoUrl: editMode ? lessonData.videoUrl || '' : '',
    order: editMode ? lessonData.order || '' : ''
  });

  // Dữ liệu cho admin/grammars
  const [grammarFormData, setGrammarFormData] = useState({
    title: '',
    lessonId: ''
  });

  const handleLessonChange = (e) => {
    const { name, value } = e.target;
    setLessonFormData({ ...lessonFormData, [name]: value });
  };

  const handleGrammarChange = (e) => {
    const { name, value } = e.target;
    setGrammarFormData({ ...grammarFormData, [name]: value });
  };

  // Fake Image Upload handler imitating Supabase Storage flow
  const onImageUpload = useCallback(async (file) => {
    return new Promise((resolve) => {
      // Fake delay for upload simulation
      setTimeout(() => {
        console.log("Fake uploading file to Supabase:", file.name);
        // Return a mock URL
        resolve(`https://fake-supabase-storage.com/images/${Date.now()}-${file.name}`);
      }, 1500);
    });
  }, []);

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = await onImageUpload(file);
      const imageMarkdown = `\n![${file.name}](${url})\n`;
      setMarkdownValue((prev) => prev + imageMarkdown);
    }
  };

  const handlePaste = async (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        event.preventDefault();
        const file = item.getAsFile();
        const url = await onImageUpload(file);
        const imageMarkdown = `\n![Pasted Image](${url})\n`;
        setMarkdownValue((prev) => prev + imageMarkdown);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    try {
      if (contentType === 'lesson') {
        let finalOrder = parseInt(lessonFormData.order);
        
        // Nếu user bỏ trống hoặc nhập số không hợp lệ, tự động tính max(order) + 1
        if (isNaN(finalOrder)) {
          const existingLessons = await lessonApi.getAll();
          if (existingLessons && existingLessons.length > 0) {
            const maxOrder = Math.max(...existingLessons.map(l => l.order || 0));
            finalOrder = maxOrder + 1;
          } else {
            finalOrder = 1;
          }
        }

        const payload = {
          title: lessonFormData.title,
          timelineId: lessonFormData.timelineId,
          topic: lessonFormData.topic,
          status: lessonFormData.status,
          videoUrl: lessonFormData.videoUrl,
          contentMarkdown: markdownValue,
          order: finalOrder
        };
        
        if (editMode) {
          await lessonApi.update(lessonData.id, payload);
          alert('Cập nhật bài học thành công!');
        } else {
          await lessonApi.create(payload);
          alert('Tạo bài học thành công!');
        }
      } else {
        const payload = {
          lessonId: grammarFormData.lessonId,
          title: grammarFormData.title,
          contentMarkdown: markdownValue,
          order: 0
        };
        await grammarApi.create(payload);
        alert('Tạo ngữ pháp thành công!');
      }
      
      navigate('/admin/content');
    } catch (error) {
      alert('Lưu thất bại: ' + error.message);
    }
  };

  return (
    <div className="admin-content-area admin-markdown-editor-page" data-color-mode="dark">
      
      {/* Header */}
      <div className="admin-header flex-header" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            className="action-btn" 
            onClick={() => navigate('/admin/content')}
            style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}
          >
            <ArrowLeft size={24} color="#fff" />
          </button>
          <h1 className="admin-heading" style={{ marginBottom: 0 }}>
            {editMode ? 'CHỈNH SỬA BÀI HỌC' : 'TẠO BÀI HỌC MỚI'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="modal-btn-cancel" onClick={() => navigate('/admin/content')}>
            Hủy
          </button>
          <button className="admin-btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} /> {editMode ? 'Lưu Thay Đổi' : 'Lưu & Xuất bản'}
          </button>
        </div>
      </div>

      {/* Meta Data Form */}
      <div className="admin-settings-panel" style={{ maxWidth: '100%', marginBottom: '24px', padding: '24px' }}>
        
        <div className="form-group" style={{ marginBottom: '20px' }}>
          <label>Loại nội dung tạo mới</label>
          <div className="status-radio-group">
            <label className="radio-label">
              <input 
                type="radio" 
                value="lesson" 
                checked={contentType === 'lesson'} 
                onChange={() => setContentType('lesson')} 
              /> 📚 Bài học chính (Lesson)
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                value="grammar" 
                checked={contentType === 'grammar'} 
                onChange={() => setContentType('grammar')} 
              /> ✍️ Ngữ pháp bổ trợ (Grammar)
            </label>
          </div>
        </div>

        {/* Dynamic Form based on Selection */}
        {contentType === 'lesson' ? (
          <>
            <div className="form-group-row" style={{ marginBottom: '15px' }}>
              <div className="form-group" style={{ flex: 2 }}>
                <label>Tiêu đề bài học</label>
                <input 
                  type="text" name="title" value={lessonFormData.title} onChange={handleLessonChange} 
                  className="modal-input" required placeholder="VD: Bài 1: Chào hỏi cơ bản"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Mã Lộ trình (Timeline ID)</label>
                <input 
                  type="text" name="timelineId" value={lessonFormData.timelineId} onChange={handleLessonChange} 
                  className="modal-input" required placeholder="VD: timeline_n5_01"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Vị trí Mã bài học (Order)</label>
                <input 
                  type="number" name="order" value={lessonFormData.order} onChange={handleLessonChange} 
                  className="modal-input" placeholder="Để trống = Auto"
                />
              </div>
            </div>
            <div className="form-group-row" style={{ marginBottom: 0 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Chủ đề (Topic)</label>
                <input 
                  type="text" name="topic" value={lessonFormData.topic} onChange={handleLessonChange} 
                  className="modal-input" required placeholder="VD: Từ vựng, Ngữ pháp..."
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Trạng thái</label>
                <select name="status" value={lessonFormData.status} onChange={handleLessonChange} className="modal-input">
                  <option value="published">Đã xuất bản (Published)</option>
                  <option value="draft">Bản nháp (Draft)</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1.5 }}>
                <label>Video URL (Youtube/AWS)</label>
                <input 
                  type="url" name="videoUrl" value={lessonFormData.videoUrl} onChange={handleLessonChange} 
                  className="modal-input" placeholder="https://..."
                />
              </div>
            </div>
          </>
        ) : (
          <div className="form-group-row" style={{ marginBottom: 0 }}>
            <div className="form-group" style={{ flex: 2 }}>
              <label>Tiêu đề Ngữ Pháp</label>
              <input 
                type="text" name="title" value={grammarFormData.title} onChange={handleGrammarChange} 
                className="modal-input" required placeholder="VD: Ngữ pháp は・が"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Thuộc Bài Học (Lesson ID)</label>
              <input 
                type="text" name="lessonId" value={grammarFormData.lessonId} onChange={handleGrammarChange} 
                className="modal-input" required placeholder="VD: lesson_123"
              />
            </div>
          </div>
        )}

      </div>

      {/* Markdown Editor Area */}
      <div 
        className="markdown-editor-wrapper" 
        style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onPaste={handlePaste}
      >
        <div className="editor-helper-bar" style={{ background: '#1c2035', padding: '10px 15px', fontSize: '0.85rem', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <FileText size={16} />
          <span>Hỗ trợ Kéo/Thả (Drag & Drop) hoặc Dán (Ctrl+V) ảnh minh họa trực tiếp vào khung soạn thảo. Hệ thống sẽ tự động Upload lên Supabase.</span>
        </div>
        <MDEditor
          value={markdownValue}
          onChange={setMarkdownValue}
          height={600}
          preview="live"
          previewOptions={{
            components: markdownComponents,
            remarkPlugins: [remarkBreaks]
          }}
        />
      </div>

    </div>
  );
};

export default AdminLessonCreateContent;
