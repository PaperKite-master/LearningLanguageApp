import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Shuffle, X } from 'lucide-react';
import adminQuizApi from '../../api/adminQuizApi';
import './AdminExams.css';

const AdminQuizQuestionsContent = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [activeTab, setActiveTab] = useState('multiple_choice');

  const [formData, setFormData] = useState({
    question_text: '',
    explanation: '',
    options: [
      { text: '', isCorrect: true },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
    fillBlankAnswer: '',
    matchingPairs: [
      { left: '', right: '' },
      { left: '', right: '' }
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
      const qType = question.question_type || 'multiple_choice';
      setEditingQuestion(question);
      setActiveTab(qType);
      
      let fillAns = '';
      let matchPairs = [
        { left: '', right: '' },
        { left: '', right: '' }
      ];
      let mcOptions = [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ];

      if (qType === 'multiple_choice' && question.options) {
        mcOptions = [...question.options];
      } else if (qType === 'typing' && question.options) {
        fillAns = question.options[0]?.correctAnswer || '';
      } else if (qType === 'matching' && question.options) {
        matchPairs = [...question.options];
      }

      setFormData({
        question_text: question.question_text || '',
        explanation: question.explanation || '',
        options: mcOptions,
        fillBlankAnswer: fillAns,
        matchingPairs: matchPairs
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
        ],
        fillBlankAnswer: '',
        matchingPairs: [
          { left: '', right: '' },
          { left: '', right: '' }
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

  const handleMatchingChange = (index, side, value) => {
    const newPairs = [...formData.matchingPairs];
    newPairs[index][side] = value;
    setFormData({ ...formData, matchingPairs: newPairs });
  };

  const addMatchingPair = (e) => {
    e.preventDefault();
    setFormData({ ...formData, matchingPairs: [...formData.matchingPairs, { left: '', right: '' }] });
  };

  const removeMatchingPair = (index) => {
    const newPairs = formData.matchingPairs.filter((_, i) => i !== index);
    setFormData({ ...formData, matchingPairs: newPairs });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.question_text.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi.");
      return;
    }
    
    let optionsToSave = [];

    if (activeTab === 'multiple_choice') {
      const validOptions = formData.options.every(opt => opt.text.trim() !== '');
      if (!validOptions) {
        alert("Vui lòng nhập đầy đủ 4 đáp án.");
        return;
      }
      optionsToSave = formData.options;
    } else if (activeTab === 'typing') {
      if (!formData.fillBlankAnswer.trim()) {
        alert("Vui lòng nhập đáp án đúng.");
        return;
      }
      optionsToSave = [{ correctAnswer: formData.fillBlankAnswer.trim() }];
    } else if (activeTab === 'matching') {
      const validPairs = formData.matchingPairs.filter(p => p.left.trim() && p.right.trim());
      if (validPairs.length < 2) {
        alert("Vui lòng nhập ít nhất 2 cặp từ hợp lệ.");
        return;
      }
      optionsToSave = validPairs;
    }

    try {
      const payload = {
        question_text: formData.question_text,
        question_type: activeTab,
        options: optionsToSave,
        explanation: formData.explanation,
        order: editingQuestion ? editingQuestion.order : questions.length + 1
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

  const renderQuestionPreview = (q) => {
    const qType = q.question_type || 'multiple_choice';
    
    if (qType === 'multiple_choice') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {(q.options || []).map((opt, i) => (
            <div key={i} style={{ 
              padding: '12px 16px', 
              background: opt.isCorrect ? '#f0fdf4' : '#f8fafc',
              border: opt.isCorrect ? '1px solid #86efac' : '1px solid #e2e8f0',
              borderRadius: '8px',
              color: opt.isCorrect ? '#166534' : '#475569',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontWeight: 'bold' }}>{String.fromCharCode(65 + i)}.</span> {opt.text}
            </div>
          ))}
        </div>
      );
    } else if (qType === 'typing') {
      const correctAns = q.options?.[0]?.correctAnswer || '';
      return (
        <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: '8px', color: '#166534', fontSize: '14px' }}>
          <span style={{ fontWeight: 'bold', marginRight: '8px' }}>ab</span> {correctAns}
        </div>
      );
    } else if (qType === 'matching') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(q.options || []).map((pair, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ flex: 1, padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', fontSize: '14px' }}>
                {pair.left}
              </div>
              <Shuffle size={16} color="#94a3b8" />
              <div style={{ flex: 1, padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#475569', fontSize: '14px' }}>
                {pair.right}
              </div>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="admin-exams-page">
      <div className="admin-question-list-header">
        <button 
          className="exam-modal-close" 
          onClick={() => navigate('/admin/tests')}
          style={{ width: '40px', height: '40px', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="admin-question-list-title">Quản lý câu hỏi</h1>
        
        <button className="btn-new-exam" onClick={() => handleOpenModal()} style={{ marginLeft: 'auto' }}>
          <Plus size={18} /> Add Question
        </button>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {loading ? (
          <div className="no-data-msg">Đang tải câu hỏi...</div>
        ) : questions.length === 0 ? (
          <div className="admin-question-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ color: '#64748b', marginBottom: '16px' }}>Chưa có câu hỏi nào. Hãy tạo câu hỏi đầu tiên!</p>
            <button className="btn-new-exam" onClick={() => handleOpenModal()} style={{ margin: '0 auto' }}>
              <Plus size={18} /> Create Question
            </button>
          </div>
        ) : (
          questions.map((q, index) => {
            const typeLabels = {
              'multiple_choice': 'Multiple choice',
              'typing': 'Fill in the blank',
              'matching': 'Matching'
            };
            
            return (
              <div className="admin-question-card" key={q.id}>
                <div className="admin-question-card-header">
                  <span className="admin-question-type-badge">{typeLabels[q.question_type || 'multiple_choice']}</span>
                  <div className="admin-question-card-actions">
                    <button onClick={() => handleOpenModal(q)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="delete" onClick={() => handleDelete(q.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="admin-question-text">
                  {index + 1}. {q.question_text}
                </div>
                
                {renderQuestionPreview(q)}
              </div>
            );
          })
        )}
      </div>

      {/* QUESTION BUILDER MODAL */}
      {showModal && (
        <div className="exam-modal-overlay">
          <div className="exam-modal-box" style={{ maxWidth: '700px' }}>
            <div className="exam-modal-header" style={{ padding: '24px 32px' }}>
              <h2>{editingQuestion ? 'Edit Question' : 'Create Question'}</h2>
              <button className="exam-modal-close" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="exam-modal-body" style={{ padding: '24px 32px' }}>
                
                <div className="qb-tabs">
                  <button 
                    type="button"
                    className={`qb-tab-btn ${activeTab === 'multiple_choice' ? 'active' : ''}`}
                    onClick={() => setActiveTab('multiple_choice')}
                  >
                    Multiple choice
                  </button>
                  <button 
                    type="button"
                    className={`qb-tab-btn ${activeTab === 'typing' ? 'active' : ''}`}
                    onClick={() => setActiveTab('typing')}
                  >
                    Fill in the blank
                  </button>
                  <button 
                    type="button"
                    className={`qb-tab-btn ${activeTab === 'matching' ? 'active' : ''}`}
                    onClick={() => setActiveTab('matching')}
                  >
                    Matching
                  </button>
                </div>

                <h3 className="qb-section-title">Question</h3>
                <textarea 
                  className="qb-textarea"
                  value={formData.question_text}
                  onChange={(e) => setFormData({...formData, question_text: e.target.value})}
                  placeholder={
                    activeTab === 'typing' ? 'Use ___ to indicate the blank space.' : 'Enter your question here...'
                  }
                  required
                />

                <h3 className="qb-section-title">Answer</h3>

                {activeTab === 'multiple_choice' && (
                  <div className="qb-options-grid">
                    {formData.options.map((opt, i) => (
                      <div className="qb-option-wrapper" key={i}>
                        <input 
                          type="radio" 
                          name="qb-correct"
                          className="qb-option-radio"
                          checked={opt.isCorrect}
                          onChange={() => handleSetCorrect(i)}
                        />
                        <span className="qb-option-label">Option {String.fromCharCode(65 + i)}</span>
                        <input 
                          type="text" 
                          className="qb-option-input"
                          value={opt.text}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'typing' && (
                  <div className="qb-fill-blank-wrapper">
                    <span className="qb-ab-icon">ab</span>
                    <input 
                      type="text" 
                      className="qb-fill-blank-input"
                      value={formData.fillBlankAnswer}
                      onChange={(e) => setFormData({...formData, fillBlankAnswer: e.target.value})}
                      placeholder="Example: 来ます"
                    />
                  </div>
                )}

                {activeTab === 'matching' && (
                  <div>
                    {formData.matchingPairs.map((pair, i) => (
                      <div className="qb-matching-pair" key={i}>
                        <input 
                          type="text" 
                          className="qb-match-input"
                          placeholder="Left Side"
                          value={pair.left}
                          onChange={(e) => handleMatchingChange(i, 'left', e.target.value)}
                        />
                        <div className="qb-shuffle-icon">
                          <Shuffle size={18} />
                        </div>
                        <input 
                          type="text" 
                          className="qb-match-input"
                          placeholder="Right Side"
                          value={pair.right}
                          onChange={(e) => handleMatchingChange(i, 'right', e.target.value)}
                        />
                        <button type="button" className="qb-delete-btn" onClick={() => removeMatchingPair(i)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    <button type="button" className="qb-add-pair-btn" onClick={addMatchingPair}>
                      <Plus size={16} /> Add New Pair
                    </button>
                  </div>
                )}

              </div>

              <div className="exam-modal-footer" style={{ padding: '20px 32px' }}>
                <button type="button" className="exam-btn-cancel" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="exam-btn-done">Done</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminQuizQuestionsContent;
