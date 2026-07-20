import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

const QuizBuilderModal = ({ isOpen, onClose, initialQuestions, onSave }) => {
  const [questions, setQuestions] = useState(initialQuestions || []);

  useEffect(() => {
    if (isOpen) {
      setQuestions(initialQuestions || []);
    }
  }, [isOpen, initialQuestions]);

  if (!isOpen) return null;

  const addQuestion = (type) => {
    let newQuestion = {
      question_type: type,
      question_text: '',
      explanation: '',
      options: {}
    };

    if (type === 'multiple_choice') {
      newQuestion.options = [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ];
    } else if (type === 'fill_in_blank' || type === 'typing') {
      newQuestion.question_type = 'typing';
      newQuestion.options = { answer: '' };
    } else if (type === 'matching') {
      newQuestion.options = [{ left: '', right: '' }, { left: '', right: '' }];
    } else if (type === 'reorder') {
      newQuestion.options = [{ text: '' }, { text: '' }];
    } else if (type === 'reading') {
      newQuestion.options = [
        {
          id: `sub_${Date.now()}_0`,
          questionText: '',
          options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false }
          ]
        }
      ];
    }

    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (index) => {
    const newQs = [...questions];
    newQs.splice(index, 1);
    setQuestions(newQs);
  };

  const updateQuestionText = (index, text) => {
    const newQs = [...questions];
    newQs[index].question_text = text;
    setQuestions(newQs);
  };

  const updateMultipleChoice = (qIndex, cIndex, value) => {
    const newQs = [...questions];
    newQs[qIndex].options[cIndex].text = value;
    setQuestions(newQs);
  };

  const setCorrectChoice = (qIndex, cIndex) => {
    const newQs = [...questions];
    newQs[qIndex].options.forEach((opt, idx) => {
      opt.isCorrect = (idx === cIndex);
    });
    setQuestions(newQs);
  };

  const handleSave = () => {
    // Basic validation
    for (let q of questions) {
      if (!q.question_text) {
        alert('Vui lòng điền nội dung câu hỏi cho tất cả các câu.');
        return;
      }
    }
    onSave(questions);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ width: '800px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e5e7eb', paddingBottom: '15px' }}>
          <h2 style={{ color: '#1f2937', margin: 0 }}>Quiz Builder</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button className="admin-btn-secondary" onClick={() => addQuestion('multiple_choice')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Plus size={16} /> Add Multiple Choice
          </button>
          <button className="admin-btn-secondary" onClick={() => addQuestion('fill_in_blank')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Plus size={16} /> Add Fill in Blank
          </button>
          <button className="admin-btn-secondary" onClick={() => addQuestion('matching')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Plus size={16} /> Add Matching
          </button>
          <button className="admin-btn-secondary" onClick={() => addQuestion('reorder')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Plus size={16} /> Add Reorder
          </button>
          <button className="admin-btn-secondary" onClick={() => addQuestion('reading')} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Plus size={16} /> Add Reading
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {questions.map((q, qIndex) => (
            <div key={qIndex} style={{ background: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', position: 'relative' }}>
              <button 
                onClick={() => removeQuestion(qIndex)}
                style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>

              <span style={{ display: 'inline-block', background: '#00f2fe', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '10px' }}>
                {q.question_type.toUpperCase()}
              </span>

              <div className="form-group">
                <label>Question Prompt</label>
                <input 
                  type="text" 
                  value={q.question_text} 
                  onChange={(e) => updateQuestionText(qIndex, e.target.value)} 
                  className="modal-input" 
                  placeholder="Enter the question..."
                />
              </div>

              {q.question_type === 'multiple_choice' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
                  {q.options.map((opt, cIndex) => (
                    <div key={cIndex} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                        type="radio" 
                        name={`correct-${qIndex}`}
                        checked={opt.isCorrect}
                        onChange={() => setCorrectChoice(qIndex, cIndex)}
                        style={{ cursor: 'pointer' }}
                      />
                      <input 
                        type="text" 
                        value={opt.text} 
                        onChange={(e) => updateMultipleChoice(qIndex, cIndex, e.target.value)} 
                        className="modal-input" 
                        style={{ flex: 1 }}
                        placeholder={`Option ${cIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {q.question_type === 'typing' && (
                <div className="form-group" style={{ marginTop: '15px' }}>
                  <label>Correct Answer</label>
                  <input 
                    type="text" 
                    value={q.options.answer || ''} 
                    onChange={(e) => {
                      const newQs = [...questions];
                      newQs[qIndex].options.answer = e.target.value;
                      setQuestions(newQs);
                    }} 
                    className="modal-input" 
                    placeholder="Enter the correct answer for the blank"
                  />
                </div>
              )}

              {q.question_type === 'matching' && (
                <div style={{ marginTop: '15px' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '10px' }}>Define the pairs. The system will automatically shuffle them for the student.</p>
                  {q.options.map((pair, pIndex) => (
                    <div key={pIndex} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <input 
                        type="text" 
                        value={pair.left} 
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[qIndex].options[pIndex].left = e.target.value;
                          setQuestions(newQs);
                        }} 
                        className="modal-input" 
                        placeholder="Left side"
                      />
                      <input 
                        type="text" 
                        value={pair.right} 
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[qIndex].options[pIndex].right = e.target.value;
                          setQuestions(newQs);
                        }} 
                        className="modal-input" 
                        placeholder="Right side"
                      />
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newQs = [...questions];
                      newQs[qIndex].options.push({ left: '', right: '' });
                      setQuestions(newQs);
                    }}
                    style={{ background: 'transparent', border: '1px dashed #00f2fe', color: '#00f2fe', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    + Add Pair
                  </button>
                </div>
              )}

              {q.question_type === 'reorder' && (
                <div style={{ marginTop: '15px' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '10px' }}>Nhập các cụm từ theo thứ tự ĐÚNG. Hệ thống sẽ tự động xáo trộn chúng khi hiển thị cho học sinh.</p>
                  {q.options && q.options.map((opt, oIndex) => (
                    <div key={oIndex} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                      <span style={{ fontWeight: 'bold', color: '#64748b', minWidth: '24px' }}>{oIndex + 1}.</span>
                      <input 
                        type="text" 
                        value={opt.text} 
                        onChange={(e) => {
                          const newQs = [...questions];
                          newQs[qIndex].options[oIndex].text = e.target.value;
                          setQuestions(newQs);
                        }} 
                        className="modal-input" 
                        style={{ flex: 1 }}
                        placeholder={`Cụm từ thứ ${oIndex + 1}`}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          const newQs = [...questions];
                          newQs[qIndex].options.splice(oIndex, 1);
                          setQuestions(newQs);
                        }}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newQs = [...questions];
                      newQs[qIndex].options.push({ text: '' });
                      setQuestions(newQs);
                    }}
                    style={{ background: 'transparent', border: '1px dashed #00f2fe', color: '#00f2fe', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    + Add Phrase/Word
                  </button>
                </div>
              )}

              {q.question_type === 'reading' && (
                <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginBottom: '5px' }}>Nhập nội dung đoạn văn/email vào ô "Question Prompt" ở trên. Sau đó thêm các câu hỏi phụ ở bên dưới.</p>
                  
                  {q.options && Array.isArray(q.options) && q.options.map((subQ, subIndex) => (
                    <div key={subQ.id || subIndex} style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: '#374151', fontSize: '0.9rem' }}>Câu hỏi phụ #{subIndex + 1}</span>
                        <button 
                          type="button" 
                          style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                          onClick={() => {
                            const newQs = [...questions];
                            newQs[qIndex].options.splice(subIndex, 1);
                            setQuestions(newQs);
                          }}
                        >
                          <Trash2 size={14} /> Xóa câu hỏi
                        </button>
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#4b5563' }}>Nội dung câu hỏi phụ</label>
                        <input 
                          type="text" 
                          value={subQ.questionText || ''} 
                          onChange={(e) => {
                            const newQs = [...questions];
                            newQs[qIndex].options[subIndex].questionText = e.target.value;
                            setQuestions(newQs);
                          }}
                          className="modal-input" 
                          placeholder="Ví dụ: Cụm từ trên có nghĩa là gì?"
                          required
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {subQ.options.map((opt, oIdx) => (
                          <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', padding: '6px 12px', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                            <input 
                              type="radio" 
                              name={`sub-correct-${qIndex}-${subIndex}`}
                              checked={opt.isCorrect}
                              onChange={() => {
                                const newQs = [...questions];
                                newQs[qIndex].options[subIndex].options.forEach((o, idx) => {
                                  o.isCorrect = (idx === oIdx);
                                });
                                setQuestions(newQs);
                              }}
                            />
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>{String.fromCharCode(65 + oIdx)}</span>
                            <input 
                              type="text" 
                              value={opt.text}
                              onChange={(e) => {
                                const newQs = [...questions];
                                newQs[qIndex].options[subIndex].options[oIdx].text = e.target.value;
                                setQuestions(newQs);
                              }}
                              style={{ border: 'none', borderBottom: '1px solid #cbd5e1', background: 'transparent', outline: 'none', fontSize: '0.85rem', flex: 1 }}
                              placeholder={`Đáp án ${String.fromCharCode(65 + oIdx)}`}
                              required
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button 
                    type="button"
                    onClick={() => {
                      const newQs = [...questions];
                      if (!Array.isArray(newQs[qIndex].options)) {
                        newQs[qIndex].options = [];
                      }
                      newQs[qIndex].options.push({
                        id: `sub_${Date.now()}_${newQs[qIndex].options.length}`,
                        questionText: '',
                        options: [
                          { text: '', isCorrect: true },
                          { text: '', isCorrect: false },
                          { text: '', isCorrect: false },
                          { text: '', isCorrect: false }
                        ]
                      });
                      setQuestions(newQs);
                    }}
                    style={{ background: 'transparent', border: '1px dashed #3b82f6', color: '#3b82f6', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', alignSelf: 'flex-start' }}
                  >
                    + Add Sub-Question
                  </button>
                </div>
              )}

            </div>
          ))}
          {questions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280', background: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '8px' }}>
              No questions added yet. Click the buttons above to start building the quiz.
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <button className="modal-btn-cancel" onClick={onClose}>Cancel</button>
          <button className="admin-btn-primary" onClick={handleSave}>Save Questions</button>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilderModal;
