import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, X, Edit2, List, Trash2 } from 'lucide-react';
import adminQuizApi from '../../api/adminQuizApi';
import lessonApi from '../../api/lessonApi';
import timelineApi from '../../api/timelineApi';
import './AdminExams.css';

const AdminQuizzesContent = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [timelines, setTimelines] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  
  // Tag input state
  const [tagInput, setTagInput] = useState('');

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    level: 'N5',
    status: 'draft',
    belongsToType: 'none',
    lesson_id: '',
    timeline_id: '',
    time_limit: 0,
    passing_score: 50,
    tags: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [quizzesData, lessonsData, timelinesData] = await Promise.all([
        adminQuizApi.getQuizzes(),
        lessonApi.getAllAdmin(),
        timelineApi.getAll()
      ]);
      const sortedQuizzes = (quizzesData || []).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setQuizzes(sortedQuizzes);
      setLessons(lessonsData || []);
      setTimelines(timelinesData || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({
      id: '',
      title: '',
      level: 'N5',
      status: 'published',
      belongsToType: 'none',
      lesson_id: '',
      timeline_id: '',
      time_limit: 0,
      passing_score: 50,
      tags: []
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (quiz) => {
    setModalMode('edit');
    let belongsToType = 'none';
    if (quiz.lesson_id) belongsToType = 'lesson';
    else if (quiz.timeline_id) belongsToType = 'timeline';

    setFormData({
      id: quiz.id,
      title: quiz.title || '',
      level: quiz.level || 'N5',
      status: quiz.status || 'draft',
      belongsToType,
      lesson_id: quiz.lesson_id || '',
      timeline_id: quiz.timeline_id || '',
      time_limit: quiz.time_limit || 0,
      passing_score: quiz.passing_score || 50,
      tags: quiz.tags || []
    });
    setTagInput('');
    setIsModalOpen(true);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Vui lòng nhập tiêu đề bài kiểm tra.");
      return;
    }

    const payload = {
      title: formData.title,
      type: 'lesson_test',
      passing_score: parseInt(formData.passing_score) || 50,
      status: formData.status,
      level: formData.level,
      lesson_id: formData.belongsToType === 'lesson' ? formData.lesson_id : null,
      timeline_id: formData.belongsToType === 'timeline' ? formData.timeline_id : null,
      time_limit: parseInt(formData.time_limit) || 0,
      tags: formData.tags
    };

    try {
      let savedQuiz;
      if (modalMode === 'add') {
        savedQuiz = await adminQuizApi.createQuiz(payload);
      } else {
        savedQuiz = await adminQuizApi.updateQuiz(formData.id, payload);
      }
      setIsModalOpen(false);
      
      // HYBRID APPROACH: Navigate to questions page immediately after creating new exam
      if (modalMode === 'add' && savedQuiz?.id) {
        navigate(`/admin/tests/${savedQuiz.id}/questions`);
      } else {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to save quiz", error);
      alert("Có lỗi khi lưu bài kiểm tra.");
    }
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await adminQuizApi.deleteQuiz(itemToDelete.id);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Failed to delete quiz", error);
      alert("Có lỗi khi xóa bài kiểm tra.");
    }
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-exams-page">
      <div className="admin-exams-header">
        <div className="admin-exams-title">
          <h1>Exams</h1>
          <p>Multi-section exams</p>
        </div>
        <button className="btn-new-exam" onClick={handleOpenAddModal}>
          <Plus size={18} /> New Exam
        </button>
      </div>

      <div className="admin-search-wrapper" style={{ marginBottom: '24px', maxWidth: '400px' }}>
        <Search className="admin-search-icon" size={20} color="#9ca3af" />
        <input 
          type="text" 
          placeholder="What do you want to find"
          className="admin-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '24px' }}
        />
      </div>

      {loading ? (
        <div className="no-data-msg">Đang tải dữ liệu...</div>
      ) : (
        <div className="admin-exams-grid">
          {filteredQuizzes.length === 0 ? (
            <div className="no-data-msg" style={{ gridColumn: '1 / -1', background: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center' }}>
              Không tìm thấy bài kiểm tra nào.
            </div>
          ) : (
            filteredQuizzes.map((quiz) => (
              <div className="exam-card" key={quiz.id}>
                <div className="exam-card-header">
                  <h2 className="exam-card-level">{quiz.level || 'N5'}</h2>
                  <div className="exam-card-status" style={{ 
                    background: quiz.status === 'published' ? '#e0f2fe' : '#f1f5f9',
                    color: quiz.status === 'published' ? '#0ea5e9' : '#64748b'
                  }}>
                    <span style={{ 
                      display: 'inline-block', 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      background: quiz.status === 'published' ? '#10b981' : '#94a3b8' 
                    }}></span>
                    {quiz.status === 'published' ? 'Active' : 'Draft'}
                  </div>
                </div>
                
                <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', color: '#1e293b' }}>{quiz.title}</h3>
                {quiz.lesson_id && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    Thuộc Bài học: {lessons.find(l => l.id === quiz.lesson_id)?.title || 'Không rõ'}
                  </div>
                )}
                {quiz.timeline_id && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                    Thuộc Timeline: {timelines.find(t => t.id === quiz.timeline_id)?.title || 'Không rõ'}
                  </div>
                )}
                <div className="exam-card-meta">
                  {quiz.time_limit ? `${quiz.time_limit} min` : 'Không giới hạn'} • {quiz.question_count || 0} câu
                </div>

                <div className="exam-card-tags">
                  {(quiz.tags && quiz.tags.length > 0) ? (
                    quiz.tags.map((tag, idx) => (
                      <span key={idx} className="exam-tag">{tag}</span>
                    ))
                  ) : (
                    <span className="exam-tag" style={{ opacity: 0.5 }}>Chưa có tag</span>
                  )}
                </div>

                <div className="exam-card-pass-rate">
                  <div className="pass-rate-labels">
                    <span>Pass rate</span>
                    <span>{quiz.attempts || 0} attempts</span>
                  </div>
                  <div className="pass-rate-bar-bg">
                    <div className="pass-rate-bar-fill" style={{ width: `${quiz.pass_rate || 0}%` }}></div>
                  </div>
                </div>

                <div className="exam-card-actions">
                  <button className="exam-action-btn btn-manage-q" onClick={() => navigate(`/admin/tests/${quiz.id}/questions`)}>
                    <List size={16} /> Câu hỏi
                  </button>
                  <button className="exam-action-btn btn-edit-exam" onClick={() => handleOpenEditModal(quiz)}>
                    <Edit2 size={16} /> Sửa
                  </button>
                  <button className="exam-action-btn btn-edit-exam" onClick={() => setItemToDelete(quiz)} style={{ color: '#ef4444', flex: '0 0 auto', width: '40px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-box">
            <div className="exam-modal-header">
              <h2>{modalMode === 'add' ? 'Create exam' : 'Edit exam'}</h2>
              <button className="exam-modal-close" type="button" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="exam-modal-body">
                <div className="exam-form-group">
                  <label>Exam Title</label>
                  <input 
                    type="text" 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                    className="exam-input" 
                    placeholder="Example: Bài thi JLPT N5..."
                    required
                  />
                </div>

                <div className="exam-form-row">
                  <div className="exam-form-group">
                    <label>Level</label>
                    <select 
                      value={formData.level} 
                      onChange={e => setFormData({...formData, level: e.target.value})} 
                      className="exam-input"
                    >
                      <option value="N5">N5</option>
                      <option value="N4">N4</option>
                      <option value="N3">N3</option>
                      <option value="N2">N2</option>
                      <option value="N1">N1</option>
                    </select>
                  </div>
                  <div className="exam-form-group">
                    <label>Total duration (minutes)</label>
                    <input 
                      type="number" 
                      value={formData.time_limit} 
                      onChange={e => setFormData({...formData, time_limit: e.target.value})} 
                      className="exam-input" 
                      placeholder="0 = No limit"
                      min="0"
                    />
                  </div>
                </div>

                <div className="exam-form-row">
                  <div className="exam-form-group">
                    <label>Loại bài</label>
                    <select 
                      value={formData.belongsToType} 
                      onChange={e => setFormData({...formData, belongsToType: e.target.value, lesson_id: '', timeline_id: ''})} 
                      className="exam-input"
                    >
                      <option value="none">Độc lập</option>
                      <option value="lesson">Thuộc Bài học</option>
                      <option value="timeline">Thuộc Timeline</option>
                    </select>
                  </div>
                  {formData.belongsToType === 'lesson' && (
                    <div className="exam-form-group">
                      <label>Chọn Bài học</label>
                      <select 
                        value={formData.lesson_id} 
                        onChange={e => setFormData({...formData, lesson_id: e.target.value})} 
                        className="exam-input"
                        required
                      >
                        <option value="">-- Chọn bài học --</option>
                        {lessons.map(l => (
                          <option key={l.id} value={l.id}>{l.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {formData.belongsToType === 'timeline' && (
                    <div className="exam-form-group">
                      <label>Chọn Timeline</label>
                      <select 
                        value={formData.timeline_id} 
                        onChange={e => setFormData({...formData, timeline_id: e.target.value})} 
                        className="exam-input"
                        required
                      >
                        <option value="">-- Chọn timeline --</option>
                        {timelines.map(t => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {formData.belongsToType === 'none' && (
                    <div className="exam-form-group">
                      {/* Empty div to keep grid layout aligned if needed */}
                    </div>
                  )}
                </div>

                <div className="exam-form-row">
                  <div className="exam-form-group">
                    <label>Passing score</label>
                    <input 
                      type="number" 
                      value={formData.passing_score} 
                      onChange={e => setFormData({...formData, passing_score: e.target.value})} 
                      className="exam-input" 
                      placeholder="VD: 50"
                      min="0"
                    />
                  </div>
                  <div className="exam-form-group">
                    <label>Status</label>
                    <select 
                      value={formData.status} 
                      onChange={e => setFormData({...formData, status: e.target.value})} 
                      className="exam-input"
                    >
                      <option value="published">Published (Active)</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="exam-form-group">
                  <label>Tags (Press Enter to add)</label>
                  <div className="exam-tags-input-wrapper">
                    {formData.tags.map((tag, idx) => (
                      <div className="exam-tag-item" key={idx}>
                        {tag}
                        <span className="exam-tag-remove" onClick={() => handleRemoveTag(tag)}>
                          <X size={14} />
                        </span>
                      </div>
                    ))}
                    <input 
                      type="text"
                      className="exam-tag-input"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="VD: Từ vựng..."
                    />
                  </div>
                </div>

              </div>

              <div className="exam-modal-footer">
                <button type="button" className="exam-btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="exam-btn-done">
                  {modalMode === 'add' ? 'Create & Add Questions' : 'Done'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="exam-modal-overlay" style={{ zIndex: 1100 }}>
          <div className="exam-modal-box" style={{ maxWidth: '400px' }}>
            <div className="exam-modal-header">
              <h2>Xóa bài kiểm tra</h2>
            </div>
            <div className="exam-modal-body">
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>
                Bạn có chắc chắn muốn xóa bài kiểm tra <strong>"{itemToDelete.title}"</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="exam-modal-footer">
              <button className="exam-btn-cancel" onClick={() => setItemToDelete(null)}>Hủy</button>
              <button className="exam-btn-done" style={{ background: '#ef4444' }} onClick={executeDelete}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizzesContent;
