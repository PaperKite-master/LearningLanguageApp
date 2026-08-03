import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const ReorderPractice = ({ question, onAnswerChange, disabled, isChecked, isCorrect }) => {
  const [shuffledPool, setShuffledPool] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);

  useEffect(() => {
    const original = (question.options || []).map(o => o.text);
    // Shuffle pool
    const shuffled = [...original].sort(() => Math.random() - 0.5);
    setShuffledPool(shuffled);
    setSelectedWords([]);
  }, [question]);

  const selectWord = (word, poolIndex) => {
    if (disabled) return;
    const newPool = shuffledPool.filter((_, idx) => idx !== poolIndex);
    const newSelected = [...selectedWords, word];
    setShuffledPool(newPool);
    setSelectedWords(newSelected);
    onAnswerChange(newSelected);
  };

  const deselectWord = (word, selectedIndex) => {
    if (disabled) return;
    const newSelected = selectedWords.filter((_, idx) => idx !== selectedIndex);
    const newPool = [...shuffledPool, word];
    setShuffledPool(newPool);
    setSelectedWords(newSelected);
    onAnswerChange(newSelected);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {/* Target Area */}
      <div style={{ minHeight: '54px', padding: '10px', background: '#f1f5f9', border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {selectedWords.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', paddingLeft: '5px' }}>Nhấp vào các từ bên dưới để ghép câu...</span>}
        {selectedWords.map((word, idx) => (
          <button
            key={idx}
            onClick={() => deselectWord(word, idx)}
            disabled={disabled}
            style={{
              padding: '6px 12px', background: isChecked ? (isCorrect ? '#22c55e' : '#ef4444') : '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: disabled ? 'default' : 'pointer', fontWeight: 500, fontSize: '0.9rem'
            }}
          >
            {word}
          </button>
        ))}
      </div>

      {/* Shuffled Pool */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {shuffledPool.map((word, idx) => (
          <button
            key={idx}
            onClick={() => selectWord(word, idx)}
            disabled={disabled}
            style={{
              padding: '6px 12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: disabled ? 'default' : 'pointer', fontWeight: 500, color: '#475569', fontSize: '0.9rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
};

const VocabPractice = ({ questions }) => {
  if (!questions || questions.length === 0) return null;

  const [isOpen, setIsOpen] = useState(false);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState({});
  const [readingSubResults, setReadingSubResults] = useState({});

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
    } else if (qType === 'reorder') {
      const userSelected = answers[qId] || [];
      const correctOrder = (q.options || []).map(o => o.text.trim());
      
      let match = true;
      if (userSelected.length !== correctOrder.length) {
        match = false;
      } else {
        for (let i = 0; i < correctOrder.length; i++) {
          if (correctOrder[i] !== userSelected[i]) {
            match = false;
            break;
          }
        }
      }
      isCorrect = match;
    } else if (qType === 'reading') {
      const subAnswers = answers[qId] || {};
      const subQuestions = q.options || [];
      const subResults = {};
      let allCorrect = true;
      
      subQuestions.forEach(subQ => {
        const selectedIdx = subAnswers[subQ.id];
        const isSubCorrect = selectedIdx !== undefined && subQ.options[selectedIdx]?.isCorrect;
        subResults[subQ.id] = isSubCorrect;
        if (!isSubCorrect) allCorrect = false;
      });
      
      setReadingSubResults(prev => ({ ...prev, [qId]: subResults }));
      isCorrect = allCorrect;
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
                <p style={{ fontWeight: 600, marginBottom: '12px', color: '#1e293b', whiteSpace: 'pre-wrap' }}>
                  {index + 1}. {qType === 'reading' ? 'Đọc đoạn văn/email dưới đây và trả lời các câu hỏi phụ:' : (q.questionText || q.question_text)}
                </p>
                
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

                {qType === 'reorder' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <ReorderPractice 
                      question={q}
                      onAnswerChange={(words) => setAnswers({ ...answers, [qId]: words })}
                      disabled={result !== undefined}
                      isChecked={result !== undefined}
                      isCorrect={result}
                    />
                    {result !== undefined && (
                      <div style={{ marginTop: '5px', color: result ? '#15803d' : '#b91c1c', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {result ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        {result ? 'Chính xác!' : `Sai rồi. Đáp án đúng: ${(q.options || []).map(o => o.text).join(' ')}`}
                      </div>
                    )}
                  </div>
                )}

                {qType === 'reading' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
                    <div style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.95rem', color: '#334155' }}>
                      {q.questionText || q.question_text}
                    </div>

                    {(q.options || []).map((subQ, subIdx) => {
                      const subUserAns = (answers[qId] || {})[subQ.id];
                      const subResult = (readingSubResults[qId] || {})[subQ.id];
                      
                      return (
                        <div key={subQ.id || subIdx} style={{ background: '#ffffff', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>Câu {subIdx + 1}: {subQ.questionText}</span>
                            {result !== undefined && (
                              subResult 
                                ? <CheckCircle2 color="#22c55e" size={16} /> 
                                : <XCircle color="#ef4444" size={16} />
                            )}
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(subQ.options || []).map((opt, optIndex) => {
                              const isSelected = subUserAns === optIndex;
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
                                  onClick={() => {
                                    if (result !== undefined) return;
                                    const currentSubAnswers = answers[qId] || {};
                                    setAnswers({
                                      ...answers,
                                      [qId]: { ...currentSubAnswers, [subQ.id]: optIndex }
                                    });
                                  }}
                                  style={{
                                    padding: '8px 12px', border: `1px solid ${borderColor}`, borderRadius: '6px', background: bg, cursor: result !== undefined ? 'default' : 'pointer', color: textColor, transition: 'all 0.1s', fontSize: '0.85rem'
                                  }}
                                >
                                  {opt.text}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {result === undefined && (() => {
                  const ans = answers[qId];
                  const isAnswered = (() => {
                    if (ans === undefined || ans === '') return false;
                    if (qType === 'reading') {
                      const subs = q.options || [];
                      return subs.length > 0 && subs.every(s => ans[s.id] !== undefined);
                    }
                    return true;
                  })();

                  return (
                    <button 
                      onClick={() => checkAnswer(qId, q)}
                      disabled={!isAnswered}
                      style={{
                        marginTop: '12px', padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: !isAnswered ? 'not-allowed' : 'pointer', opacity: !isAnswered ? 0.5 : 1, fontWeight: 500
                      }}
                    >
                      Kiểm tra
                    </button>
                  );
                })()}
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
