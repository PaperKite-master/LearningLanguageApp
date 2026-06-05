import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2 } from 'lucide-react';
import adminQuizApi from '../../api/adminQuizApi';

const AdminQuizQuestionsContent = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question_text: '',
    explanation: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]
  });

  useEffect(() => {
    fetchQuestions();
  }, [quizId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await adminQuizApi.getQuestions(quizId);
      setQuestions(data || []);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        question_text: question.question_text || '',
        explanation: question.explanation || '',
        options: question.options || [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ]
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        question_text: '',
        explanation: '',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ]
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSetCorrect = (index) => {
    const newOptions = formData.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index
    }));
    setFormData({ ...formData, options: newOptions });
  };

  const handleSave = async () => {
    if (!formData.question_text.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi.");
      return;
    }
    
    const validOptions = formData.options.every(opt => opt.text.trim() !== '');
    if (!validOptions) {
      alert("Vui lòng nhập đầy đủ 4 đáp án.");
      return;
    }

    try {
      const payload = {
        question_text: formData.question_text,
        question_type: 'multiple_choice',
        options: formData.options,
        explanation: formData.explanation,
        order: questions.length + 1
      };

      if (editingQuestion) {
        await adminQuizApi.updateQuestion(quizId, editingQuestion.id, payload);
      } else {
        await adminQuizApi.createQuestion(quizId, payload);
      }
      
      handleCloseModal();
      fetchQuestions();
    } catch (error) {
      console.error("Failed to save question:", error);
      alert("Có lỗi xảy ra khi lưu câu hỏi.");
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    try {
      await adminQuizApi.deleteQuestion(quizId, questionId);
      fetchQuestions();
    } catch (error) {
      console.error("Failed to delete question:", error);
      alert("Có lỗi khi xóa câu hỏi.");
    }
  };

  return (
    <div className="admin-content-area">
      <div className="admin-header flex-header" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <button 
          className="admin-btn-secondary" 
          onClick={() => navigate('/admin/tests')}
          style={{ padding: '8px', display: 'flex', alignItems: 'center', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="admin-heading" style={{ margin: 0 }}>QUẢN LÝ CÂU HỎI</h1>
        <div style={{ marginLeft: 'auto' }}>
          <button className="admin-btn-primary" onClick={() => handleOpenModal()}>
            + Thêm câu hỏi
          </button>
        </div>
      </div>

      <div className="admin-panel-container">
        {loading ? (
          <div className="no-data-msg">Đang tải câu hỏi...</div>
        ) : questions.length === 0 ? (
          <div className="no-data-msg" style={{ padding: '40px 20px', textAlign: 'center' }}>
            Chưa có câu hỏi nào trong bài kiểm tra này. Hãy tạo câu hỏi đầu tiên!
          </div>
        ) : (
          <div className="questions-list" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {questions.map((q, index) => (
              <div key={q.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0, color: '#00f2fe' }}>Câu {index + 1}: {q.question_text}</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="icon-action-btn edit-btn" onClick={() => handleOpenModal(q)} title="Sửa">
                      <Edit2 size={18} />
                    </button>
                    <button className="icon-action-btn delete-btn" onClick={() => handleDelete(q.id)} title="Xóa">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {(q.options || []).map((opt, i) => (
                    <div 
                      key={i} 
                      style={{ 
                        padding: '10px 15px', 
                        background: opt.isCorrect ? 'rgba(0, 255, 102, 0.1)' : 'rgba(255,255,255,0.05)',
                        border: opt.isCorrect ? '1px solid #00ff66' : '1px solid transparent',
                        borderRadius: '8px',
                        color: opt.isCorrect ? '#00ff66' : '#fff'
                      }}
                    >
                      {String.fromCharCode(65 + i)}. {opt.text}
                    </div>
                  ))}
                </div>

                {q.explanation && (
                  <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', borderLeft: '4px solid #0ea5e9', color: '#9ca3af' }}>
                    <strong>Giải thích:</strong> {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: '#1a1f2e', padding: '30px', borderRadius: '16px',
            width: '90%', maxWidth: '600px', border: '1px solid rgba(255,255,255,0.1)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#fff' }}>
              {editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px' }}>Nội dung câu hỏi *</label>
              <textarea 
                value={formData.question_text}
                onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', minHeight: '80px', resize: 'vertical' }}
                placeholder="Nhập nội dung câu hỏi..."
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px' }}>Các đáp án (Chọn đáp án đúng) *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {formData.options.map((opt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="radio" 
                      name="correct_option"
                      checked={opt.isCorrect}
                      onChange={() => handleSetCorrect(i)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <span style={{ color: '#fff', width: '30px' }}>{String.fromCharCode(65 + i)}.</span>
                    <input 
                      type="text" 
                      value={opt.text}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: opt.isCorrect ? '1px solid #00ff66' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                      placeholder={`Đáp án ${String.fromCharCode(65 + i)}`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label style={{ display: 'block', color: '#9ca3af', marginBottom: '8px' }}>Giải thích (Không bắt buộc)</label>
              <textarea 
                value={formData.explanation}
                onChange={(e) => setFormData({...formData, explanation: e.target.value})}
                style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', minHeight: '80px', resize: 'vertical' }}
                placeholder="Giải thích vì sao chọn đáp án này..."
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
              <button 
                onClick={handleCloseModal}
                style={{ padding: '10px 20px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', cursor: 'pointer' }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleSave}
                style={{ padding: '10px 20px', background: '#00f2fe', border: 'none', borderRadius: '8px', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Lưu câu hỏi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizQuestionsContent;
