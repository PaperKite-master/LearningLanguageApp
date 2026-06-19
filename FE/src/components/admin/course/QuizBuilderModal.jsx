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
