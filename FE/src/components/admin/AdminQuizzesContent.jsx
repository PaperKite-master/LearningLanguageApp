import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Trash2, List, X } from 'lucide-react';
import adminQuizApi from '../../api/adminQuizApi';
import lessonApi from '../../api/lessonApi';
import timelineApi from '../../api/timelineApi';

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
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    level: 'N5',
    status: 'draft',
    belongsToType: 'none', // 'none', 'lesson', 'timeline'
    lesson_id: '',
    timeline_id: ''
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
      const sortedQuizzes = (quizzesData || []).sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
      const mappedQuizzes = sortedQuizzes.map((quiz, index) => ({
        ...quiz,
        displayId: `Q${String(index + 1).padStart(3, '0')}`
      }));
      // Sort backwards for display so newest is on top
      mappedQuizzes.sort((a, b) => {
        const numA = parseInt(a.displayId.replace('Q', ''), 10);
        const numB = parseInt(b.displayId.replace('Q', ''), 10);
        return numB - numA;
      });
      setQuizzes(mappedQuizzes);
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
      status: 'draft',
      belongsToType: 'none',
      lesson_id: '',
      timeline_id: ''
    });
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
      timeline_id: quiz.timeline_id || ''
    });
    setIsModalOpen(true);
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
      passing_score: 50,
      status: formData.status,
      level: formData.level,
      lesson_id: formData.belongsToType === 'lesson' ? formData.lesson_id : null,
      timeline_id: formData.belongsToType === 'timeline' ? formData.timeline_id : null,
    };

    try {
      if (modalMode === 'add') {
        await adminQuizApi.createQuiz(payload);
      } else {
        await adminQuizApi.updateQuiz(formData.id, payload);
      }
      setIsModalOpen(false);
      fetchData();
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
    <div className="admin-content-area">
      <div className="admin-header flex-header">
        <h1 className="admin-heading">QUẢN LÝ BÀI KIỂM TRA</h1>
        <button className="admin-btn-primary" onClick={handleOpenAddModal}>
          + Thêm bài kiểm tra mới
        </button>
      </div>

      <div className="admin-panel-container">
        <div className="admin-search-wrapper">
          <Search className="admin-search-icon" size={20} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Tìm kiếm bài kiểm tra ...."
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="no-data-msg">Đang tải dữ liệu...</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Số lượng câu hỏi</th>
                <th>Cấp độ</th>
                <th>Avg Score</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data-msg" style={{padding: '20px', textAlign: 'center'}}>Không tìm thấy bài kiểm tra nào.</td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id}>
                    <td className="col-id" style={{ color: '#9ca3af', fontFamily: 'monospace' }}>
                      {quiz.displayId}
                    </td>
                    <td className="col-name">
                      {quiz.title}
                      {(quiz.lesson_id || quiz.timeline_id) && (
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>
                          Thuộc: {quiz.lesson_id 
                            ? `Bài học - ${lessons.find(l => l.id === quiz.lesson_id)?.title || 'Không rõ'}` 
                            : `Timeline - ${timelines.find(t => t.id === quiz.timeline_id)?.title || 'Không rõ'}`}
                        </div>
                      )}
                    </td>
                    <td>{quiz.question_count || 0}</td>
                    <td className="col-role">
                      <span className="role-badge role-level">
                        {quiz.level || 'N5'}
                      </span>
                    </td>
                    <td>{quiz.avg_score || 0}</td>
                    <td className="col-status">
                      <span className={`status-badge status-${(quiz.status || 'draft').toLowerCase()}`}>
                        {quiz.status || 'Draft'}
                      </span>
                    </td>
                    <td className="col-action col-action-group">
                      <button className="icon-action-btn" onClick={() => navigate(`/admin/tests/${quiz.id}/questions`)} title="Quản lý câu hỏi" style={{ color: '#0ea5e9' }}>
                        <List size={18} />
                      </button>
                      <button className="icon-action-btn edit-btn" onClick={() => handleOpenEditModal(quiz)} title="Sửa">
                        <Edit2 size={18} />
                      </button>
                      <button className="icon-action-btn delete-btn" onClick={() => setItemToDelete(quiz)} title="Xóa">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Thêm Bài Kiểm Tra Mới' : 'Chỉnh Sửa Bài Kiểm Tra'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body-form">
              <div className="form-group">
                <label>Tiêu đề bài kiểm tra</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="modal-input" 
                  placeholder="VD: Bài thi cuối kỳ N5"
                  required
                />
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Cấp độ</label>
                  <select 
                    value={formData.level} 
                    onChange={e => setFormData({...formData, level: e.target.value})} 
                    className="modal-input"
                  >
                    <option value="N5">JLPT N5</option>
                    <option value="N4">JLPT N4</option>
                    <option value="N3">JLPT N3</option>
                    <option value="N2">JLPT N2</option>
                    <option value="N1">JLPT N1</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Loại bài</label>
                  <select 
                    value={formData.belongsToType} 
                    onChange={e => setFormData({...formData, belongsToType: e.target.value, lesson_id: '', timeline_id: ''})} 
                    className="modal-input"
                  >
                    <option value="none">Độc lập (Không thuộc bài nào)</option>
                    <option value="lesson">Thuộc Bài học (Lesson)</option>
                    <option value="timeline">Thuộc Timeline</option>
                  </select>
                </div>
              </div>

              {formData.belongsToType === 'lesson' && (
                <div className="form-group">
                  <label>Chọn bài học</label>
                  <select 
                    value={formData.lesson_id} 
                    onChange={e => setFormData({...formData, lesson_id: e.target.value})} 
                    className="modal-input"
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
                <div className="form-group">
                  <label>Chọn Timeline</label>
                  <select 
                    value={formData.timeline_id} 
                    onChange={e => setFormData({...formData, timeline_id: e.target.value})} 
                    className="modal-input"
                    required
                  >
                    <option value="">-- Chọn timeline --</option>
                    {timelines.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>Trạng thái</label>
                <div className="status-radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="status" 
                      value="published" 
                      checked={formData.status === 'published'}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    /> Đang hoạt động (Published)
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="status" 
                      value="draft" 
                      checked={formData.status === 'draft'}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    /> Lưu nháp (Draft)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="admin-btn-primary">
                  {modalMode === 'add' ? 'Lưu Bài Kiểm Tra' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box delete-confirm-box">
            <h2 className="delete-title">Xác nhận xóa bài kiểm tra</h2>
            <p>Bạn có chắc chắn muốn xóa bài kiểm tra <strong>"{itemToDelete.title}"</strong> không? Hành động này không thể hoàn tác.</p>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setItemToDelete(null)}>Hủy bỏ</button>
              <button className="modal-btn-danger" onClick={executeDelete}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizzesContent;
