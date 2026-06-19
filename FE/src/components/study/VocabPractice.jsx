import React, { useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const VocabPractice = ({ questions }) => {
  if (!questions || questions.length === 0) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});

  const handleSelect = (qId, optionIndex) => {
    if (results[qId] !== undefined) return;
    setAnswers({ ...answers, [qId]: optionIndex });
  };

  const handleType = (qId, text) => {
    if (results[qId] !== undefined) return;
    setAnswers({ ...answers, [qId]: text });
  };

  const checkAnswer = (qId, q) => {
    let isCorrect = false;
    const qType = q.questionType || q.question_type;

    if (qType === 'multiple_choice') {
      const selectedIndex = answers[qId];
      if (selectedIndex !== undefined) {
        isCorrect = q.options[selectedIndex]?.isCorrect;
      }
    } else if (qType === 'typing') {
      const typed = answers[qId] || '';
      const correct = q.options?.answer || '';
      isCorrect = typed.trim().toLowerCase() === correct.trim().toLowerCase();
    }
    
    setResults({ ...results, [qId]: isCorrect });
  };

  return (
    <div style={{ marginTop: '20px', width: '100%', borderTop: '1px dashed #e2e8f0', paddingTop: '15px' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px 16px', color: '#475569', fontWeight: 600, cursor: 'pointer', width: '100%', transition: 'all 0.2s' }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
      >
        {isOpen ? 'Đóng Bài Tập' : `Luyện Tập (${questions.length} Câu)`}
      </button>

      {isOpen && (
        <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
          {questions.map((q, index) => {
            const qType = q.questionType || q.question_type;
            const qId = q.id || `temp-${index}`;
            const result = results[qId];
            
            return (
              <div key={qId} style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ fontWeight: 600, marginBottom: '12px', color: '#1e293b' }}>{index + 1}. {q.questionText || q.question_text}</p>
                
                {qType === 'multiple_choice' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options && q.options.map((opt, optIndex) => {
                      const isSelected = answers[qId] === optIndex;
                      let bg = '#ffffff';
                      let borderColor = isSelected ? '#3b82f6' : '#e2e8f0';
                      let textColor = '#334155';

                      if (result !== undefined) {
                        if (opt.isCorrect) {
                          bg = '#dcfce7'; borderColor = '#22c55e'; textColor = '#15803d';
                        } else if (isSelected && !opt.isCorrect) {
                          bg = '#fee2e2'; borderColor = '#ef4444'; textColor = '#b91c1c';
                        }
                      }

                      return (
                        <div 
                          key={optIndex}
                          onClick={() => handleSelect(qId, optIndex)}
                          style={{
                            padding: '10px 15px', border: `1px solid ${borderColor}`, borderRadius: '8px', background: bg, cursor: result !== undefined ? 'default' : 'pointer', color: textColor, transition: 'all 0.2s', fontSize: '0.95rem'
                          }}
                        >
                          {opt.text}
                        </div>
                      )
                    })}
                  </div>
                )}

                {qType === 'typing' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <input 
                      type="text" 
                      value={answers[qId] || ''}
                      onChange={(e) => handleType(qId, e.target.value)}
                      disabled={result !== undefined}
                      style={{
                        padding: '10px 15px', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', width: '100%', fontSize: '0.95rem', background: result !== undefined ? '#f1f5f9' : '#fff'
                      }}
                      placeholder="Nhập đáp án của bạn..."
                    />
                    {result !== undefined && (
                      <div style={{ marginTop: '5px', color: result ? '#15803d' : '#b91c1c', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {result ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {result ? 'Chính xác!' : `Sai rồi. Đáp án đúng: ${q.options?.answer}`}
                      </div>
                    )}
                  </div>
                )}

                {result === undefined && (
                  <button 
                    onClick={() => checkAnswer(qId, q)}
                    disabled={answers[qId] === undefined || answers[qId] === ''}
                    style={{
                      marginTop: '12px', padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: (answers[qId] === undefined || answers[qId] === '') ? 'not-allowed' : 'pointer', opacity: (answers[qId] === undefined || answers[qId] === '') ? 0.5 : 1, fontWeight: 500
                    }}
                  >
                    Kiểm tra
                  </button>
                )}
                {result !== undefined && q.explanation && (
                  <div style={{ marginTop: '12px', padding: '10px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.9rem', color: '#475569' }}>
                    <strong>Giải thích:</strong> {q.explanation}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
};

export default VocabPractice;
