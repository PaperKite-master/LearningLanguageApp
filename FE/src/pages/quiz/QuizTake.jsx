import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import quizApi from '../../api/quizApi';
import Sidebar from '../../components/dashboard/Sidebar';
import ProUpgradeBanner from '../../components/common/ProUpgradeBanner';
import hinaLogo from '../../assets/hina-reading.png';
import './QuizTake.css';

const MatchingQuestionUI = ({ question, answerPairs = [], onChange, readOnly, resultData }) => {
  const [selectedLeft, setSelectedLeft] = useState(null);

  const handleLeftClick = (val) => {
    if (readOnly) return;
    if (selectedLeft === val) setSelectedLeft(null);
    else setSelectedLeft(val);
  };

  const handleRightClick = (val) => {
    if (readOnly) return;
    if (selectedLeft) {
      let newPairs = [...answerPairs];
      const existingPairIndex = newPairs.findIndex(p => p.left === selectedLeft || p.right === val);
      if (existingPairIndex >= 0) {
        newPairs = newPairs.filter(p => p.left !== selectedLeft && p.right !== val);
      }
      newPairs.push({ left: selectedLeft, right: val });
      onChange(newPairs);
      setSelectedLeft(null);
    }
  };

  const removePair = (leftVal) => {
    if (readOnly) return;
    onChange(answerPairs.filter(p => p.left !== leftVal));
  };

  return (
    <div className="qt-match-grid">
      <div className="qt-match-column">
        {question.shuffledLeft?.map((leftItem, i) => {
          const isSelected = selectedLeft === leftItem;
          const pair = answerPairs.find(p => p.left === leftItem);
          const isPaired = !!pair;

          let classes = 'qt-match-item';
          if (isSelected) classes += ' selected';
          else if (isPaired) classes += ' paired';
          if (readOnly) classes += ' disabled';

          if (readOnly && resultData) {
            const correctPair = resultData.correctPairs?.find(p => p.left === leftItem);
            if (pair && correctPair && pair.right === correctPair.right) {
              classes += ' correct';
            } else if (pair) {
              classes += ' wrong';
            } else {
              classes += ' wrong'; // missing
            }
          }

          return (
            <div 
              key={`left-${i}`} 
              className={classes}
              onClick={() => isPaired ? removePair(leftItem) : handleLeftClick(leftItem)}
            >
              {leftItem}
              {isPaired && <span className="qt-match-subtext">Đã nối với: {pair.right}</span>}
              {readOnly && resultData && <span className="qt-match-subtext" style={{ color: '#16a34a' }}>Đáp án đúng: {resultData.correctPairs?.find(p => p.left === leftItem)?.right}</span>}
            </div>
          );
        })}
      </div>
      <div className="qt-match-column">
        {question.shuffledRight?.map((rightItem, i) => {
          const isPaired = answerPairs.some(p => p.right === rightItem);
          let classes = 'qt-match-item';
          if (isPaired) classes += ' paired-right';
          if (readOnly || !selectedLeft || isPaired) classes += ' disabled';

          return (
            <div 
              key={`right-${i}`} 
              className={classes}
              onClick={() => handleRightClick(rightItem)}
            >
              {rightItem}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ReorderQuizUI = ({ question, answerOrder = [], onChange, readOnly, resultData }) => {
  const [shuffledPool, setShuffledPool] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);

  useEffect(() => {
    if (readOnly) {
      setSelectedWords(answerOrder || []);
      setShuffledPool([]);
    } else {
      const original = (question.options || []).map(o => o.text);
      const userSelected = answerOrder || [];
      setSelectedWords(userSelected);
      
      const pool = [];
      const remainingCounts = {};
      
      (question.shuffledWords || original).forEach(w => {
        remainingCounts[w] = (remainingCounts[w] || 0) + 1;
      });
      
      userSelected.forEach(w => {
        if (remainingCounts[w] > 0) {
          remainingCounts[w]--;
        }
      });
      
      (question.shuffledWords || original).forEach(w => {
        if (remainingCounts[w] > 0) {
          pool.push(w);
          remainingCounts[w]--;
        }
      });
      
      setShuffledPool(pool);
    }
  }, [question, answerOrder, readOnly]);

  const selectWord = (word) => {
    if (readOnly) return;
    const newSelected = [...selectedWords, word];
    setSelectedWords(newSelected);
    onChange(newSelected);
  };

  const deselectWord = (word, idx) => {
    if (readOnly) return;
    const newSelected = selectedWords.filter((_, i) => i !== idx);
    setSelectedWords(newSelected);
    onChange(newSelected);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '12px' }}>
      <div className="qt-reorder-target" style={{ minHeight: '54px', padding: '12px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        {selectedWords.length === 0 && !readOnly && (
          <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>Nhấp vào các từ bên dưới để ghép câu...</span>
        )}
        {selectedWords.map((word, idx) => {
          let bg = '#3b82f6';
          let border = 'none';
          if (readOnly && resultData) {
            bg = resultData.isCorrect ? '#10b981' : '#ef4444';
          }
          return (
            <button
              key={`selected-${idx}`}
              onClick={() => deselectWord(word, idx)}
              disabled={readOnly}
              style={{
                padding: '8px 16px', background: bg, border, color: '#fff', borderRadius: '6px', cursor: readOnly ? 'default' : 'pointer', fontWeight: 500, fontSize: '0.95rem'
              }}
            >
              {word}
            </button>
          );
        })}
      </div>

      {!readOnly && (
        <div className="qt-reorder-pool" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '5px' }}>
          {shuffledPool.map((word, idx) => (
            <button
              key={`pool-${idx}`}
              onClick={() => selectWord(word)}
              style={{
                padding: '8px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 500, color: '#475569', fontSize: '0.95rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              {word}
            </button>
          ))}
        </div>
      )}

      {readOnly && resultData && !resultData.isCorrect && (
        <div style={{ marginTop: '5px', color: '#dc2626', fontSize: '0.9rem', fontWeight: 500 }}>
          Đáp án đúng: {(question.options || []).map(o => o.text).join(' ')}
        </div>
      )}
    </div>
  );
};

const QuizTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProLocked, setIsProLocked] = useState(false);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await quizApi.getQuizById(id);
        const processedQuestions = data.questions.map(q => {
          const qType = q.questionType || q.question_type;
          if (qType === 'matching' && Array.isArray(q.options)) {
            const lefts = q.options.map(o => o.left);
            const rights = q.options.map(o => o.right);
            return {
              ...q,
              shuffledLeft: [...lefts].sort(() => Math.random() - 0.5),
              shuffledRight: [...rights].sort(() => Math.random() - 0.5)
            };
          }
          if (qType === 'reorder' && Array.isArray(q.options)) {
            const original = q.options.map(o => o.text);
            return {
              ...q,
              shuffledWords: [...original].sort(() => Math.random() - 0.5)
            };
          }
          return q;
        });
        setQuiz({ ...data, questions: processedQuestions });
        if (data.time_limit && data.time_limit > 0) {
          setTimeLeft(data.time_limit * 60);
        }
      } catch (err) {
        const message = err?.message || '';
        if (message.toLowerCase().includes('pro')) {
          setIsProLocked(true);
          setError(null);
        } else {
          setIsProLocked(false);
          setError('Không thể tải bài kiểm tra. Có thể nó chưa sẵn sàng hoặc không tồn tại.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null || result) return;
    
    if (timeLeft === 0 && !submitting) {
      alert("Đã hết thời gian làm bài! Hệ thống tự động nộp bài.");
      handleSubmit(true);
      return;
    }
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft, result, submitting]);

  const formatTime = (seconds) => {
    if (seconds === null) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (questionId, index) => {
    if (result) return;
    setAnswers({ ...answers, [questionId]: { answerIndex: index } });
  };

  const handleReadingSelect = (questionId, subQuestionId, index) => {
    if (result) return;
    const currentReadingAnswers = answers[questionId]?.readingAnswers || [];
    let updatedReadingAnswers = [...currentReadingAnswers];
    const existingIndex = updatedReadingAnswers.findIndex(a => a.subQuestionId === subQuestionId);
    if (existingIndex >= 0) {
      updatedReadingAnswers[existingIndex] = { subQuestionId, answerIndex: index };
    } else {
      updatedReadingAnswers.push({ subQuestionId, answerIndex: index });
    }
    setAnswers({ ...answers, [questionId]: { readingAnswers: updatedReadingAnswers } });
  };

  const handleTextChange = (questionId, text) => {
    if (result) return;
    setAnswers({ ...answers, [questionId]: { answerText: text } });
  };

  const handleMatchingChange = (questionId, pairs) => {
    if (result) return;
    setAnswers({ ...answers, [questionId]: { answerPairs: pairs } });
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!isAutoSubmit && Object.keys(answers).length < quiz.questions.length) {
      if (!window.confirm('Bạn chưa trả lời hết các câu hỏi. Vẫn nộp bài?')) {
        return;
      }
    }
    
    setSubmitting(true);
    try {
      const formattedAnswers = Object.keys(answers).map(qId => ({
        questionId: qId,
        ...answers[qId]
      }));
      
      const res = await quizApi.submitQuiz(id, formattedAnswers);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResult(res.data);
    } catch (err) {
      alert('Có lỗi khi nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main-area" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h2>Đang tải bài kiểm tra...</h2>
        </main>
      </div>
    );
  }

  if (isProLocked) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main-area" style={{ padding: '40px 60px' }}>
          <ProUpgradeBanner
            title="Bài kiểm tra thuộc timeline PRO"
            description="Gói USER chỉ làm được kiểm tra của timeline đầu tiên. Nâng cấp PRO để mở khóa."
          />
          <button className="qt-btn-submit" onClick={() => navigate('/study')} style={{ marginTop: '20px' }}>
            Quay lại Lộ trình
          </button>
        </main>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2>Oops!</h2>
          <p>{error}</p>
          <button className="qt-btn-submit" onClick={() => navigate('/study')} style={{ marginTop: '20px' }}>
            Quay lại Lộ trình
          </button>
        </main>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main-area" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
          <style>
            {`
              @keyframes bounceLogo {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
              }
              @keyframes pulseShadow {
                0%, 100% { transform: scale(1); opacity: 0.2; }
                50% { transform: scale(0.8); opacity: 0.1; }
              }
            `}
          </style>
          <img 
            src={hinaLogo} 
            alt="Loading..." 
            style={{ width: '150px', animation: 'bounceLogo 1.5s ease-in-out infinite' }} 
          />
          <div style={{ width: '100px', height: '10px', background: '#000', borderRadius: '50%', animation: 'pulseShadow 1.5s ease-in-out infinite', marginTop: '10px' }}></div>
          <h2 style={{ marginTop: '30px', color: '#3b82f6', fontWeight: 'bold' }}>Đang chấm điểm...</h2>
          <p style={{ color: '#64748b' }}>Vui lòng đợi một chút nhé!</p>
        </main>
      </div>
    );
  }

  if (result) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main-area" style={{ background: '#f8fafc', padding: '20px' }}>
          <button className="qt-btn-back" onClick={() => navigate('/study')}>
            <ArrowLeft size={20} /> Quay lại
          </button>

          <div className="qt-result-container">
            <div className="qt-result-bg-blob1"></div>
            <div className="qt-result-bg-blob2"></div>
            
            <img 
              src={hinaLogo} 
              alt="Hina Logo" 
              style={{
                width: '180px', height: 'auto', marginBottom: '25px', zIndex: 1,
                transition: 'all 0.5s ease',
                ...(result.score >= 50 
                  ? { transform: 'scale(1)' } 
                  : { transform: 'scale(0.95) translateY(10px)', filter: 'grayscale(100%) contrast(0.8) sepia(0.2) hue-rotate(200deg) opacity(0.8)' })
              }} 
            />
            
            <h2 className={`qt-result-title ${result.score >= 50 ? 'success' : 'fail'}`}>
              {result.score >= 50 
                ? 'Chúc mừng bạn đã hoàn thành bài kiểm tra!' 
                : 'Đừng buồn nhé! Hãy ôn tập lại và thử sức lần nữa nha.'}
            </h2>
            
            <p className="qt-result-subtitle">
              Bạn đã làm đúng {result.correctCount} trên tổng số {result.totalQuestions} câu hỏi.
            </p>

            <div className="qt-result-score">
              {result.score}/100
            </div>
            
            <button className="qt-btn-return" onClick={() => navigate('/study')}>
              <ArrowLeft size={20} />
              Trở lại Lộ trình
            </button>
          </div>

          <div className="quiz-take-container">
            <h3 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '24px', fontWeight: '700' }}>Chi tiết kết quả</h3>
            <div className="qt-question-list">
              {quiz.questions.map((q, qIndex) => {
                const userAnswerObj = answers[q.id] || {};
                const qType = q.questionType || 'multiple_choice';
                const qResult = result.questionResults?.find(qr => qr.questionId === q.id);

                return (
                  <div key={q.id} className="qt-question-card">
                    <div className="qt-question-text">
                      <span className="qt-question-num">Câu {qIndex + 1}:</span> 
                      <span>{q.questionText}</span>
                    </div>

                    {/* Show answered state similarly to normal take but locked */}
                    {qType === 'multiple_choice' && (
                      <div className="qt-options-grid">
                        {q.options && q.options.map((opt, optIndex) => {
                          const isSelected = userAnswerObj.answerIndex === optIndex;
                          const isCorrectAnswer = qResult?.correctOptionIndex === optIndex;

                          let classes = 'qt-option disabled';
                          let icon = null;

                          if (isCorrectAnswer) {
                            classes += ' correct';
                            icon = <CheckCircle2 color="#16a34a" size={20} />;
                          } else if (isSelected && !isCorrectAnswer) {
                            classes += ' wrong';
                            icon = <XCircle color="#dc2626" size={20} />;
                          } else if (isSelected) {
                            classes += ' selected';
                          }

                          return (
                            <div key={optIndex} className={classes}>
                              <div className="qt-option-content">
                                <div className="qt-radio-circle"></div>
                                <span>{opt.text}</span>
                              </div>
                              {icon}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {qType === 'typing' && (
                      <div>
                        <input 
                          type="text"
                          value={userAnswerObj.answerText || ''}
                          readOnly
                          className={`qt-input disabled ${qResult?.isCorrect ? 'correct' : 'wrong'}`}
                        />
                        {qResult && (
                          <div className={`qt-feedback ${qResult.isCorrect ? 'correct' : 'wrong'}`}>
                            {qResult.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                            {qResult.isCorrect ? 'Chính xác!' : `Sai rồi. Đáp án đúng: ${qResult.correctAnswer}`}
                          </div>
                        )}
                      </div>
                    )}

                    {qType === 'matching' && (
                      <MatchingQuestionUI 
                        question={q} 
                        answerPairs={userAnswerObj.answerPairs || []}
                        onChange={() => {}}
                        readOnly={true}
                        resultData={qResult}
                      />
                    )}

                    {qType === 'reorder' && (
                      <ReorderQuizUI 
                        question={q}
                        answerOrder={userAnswerObj.answerOrder || []}
                        onChange={() => {}}
                        readOnly={true}
                        resultData={qResult}
                      />
                    )}

                    {qType === 'reading' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '15px' }}>
                        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '15px', color: '#334155' }}>
                          {q.questionText}
                        </div>
                        
                        {(q.options || []).map((subQ, subIdx) => {
                          const subQResult = qResult?.subQuestionResults?.find(sqr => sqr.subQuestionId === subQ.id);
                          const userSelIdx = subQResult ? subQResult.userAnswerIndex : -1;
                          const correctIdx = subQResult ? subQResult.correctOptionIndex : -1;
                          
                          return (
                            <div key={subQ.id || subIdx} style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>Câu {qIndex + 1}.{subIdx + 1}: {subQ.questionText}</span>
                                {subQResult && (
                                  subQResult.isCorrect 
                                    ? <CheckCircle2 color="#16a34a" size={18} /> 
                                    : <XCircle color="#dc2626" size={18} />
                                )}
                              </div>
                              <div className="qt-options-grid">
                                {(subQ.options || []).map((opt, optIndex) => {
                                  const isSelected = userSelIdx === optIndex;
                                  const isCorrectAnswer = correctIdx === optIndex;
                                  
                                  let classes = 'qt-option disabled';
                                  let icon = null;
                                  
                                  if (isCorrectAnswer) {
                                    classes += ' correct';
                                    icon = <CheckCircle2 color="#16a34a" size={20} />;
                                  } else if (isSelected && !isCorrectAnswer) {
                                    classes += ' wrong';
                                    icon = <XCircle color="#dc2626" size={20} />;
                                  } else if (isSelected) {
                                    classes += ' selected';
                                  }
                                  
                                  return (
                                    <div key={optIndex} className={classes}>
                                      <div className="qt-option-content">
                                        <div className="qt-radio-circle"></div>
                                        <span>{opt.text}</span>
                                      </div>
                                      {icon}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.explanation && (
                      <div className="qt-explanation">
                        <div className="qt-explanation-title">Giải thích:</div>
                        <pre className="qt-explanation-text">{q.explanation}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area quiz-take-page">
        <div className="quiz-take-container">
          
          <button className="qt-btn-back" onClick={() => navigate('/study')}>
            <ArrowLeft size={20} /> Quay lại
          </button>

          <div className="qt-header-card">
            <div className="qt-badge">Bài Kiểm Tra</div>
            <h1 className="qt-title">{quiz.title}</h1>
            <div className="qt-meta">
              <span>Số câu: {quiz.questions.length}</span>
              <span>Điểm qua môn: {quiz.passingScore}%</span>
            </div>
            
            {timeLeft !== null && (
              <div className={`qt-timer ${timeLeft < 60 ? 'urgent' : 'normal'}`}>
                <Clock size={20} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          <div className="qt-question-list">
            {quiz.questions.map((q, qIndex) => {
              const userAnswerObj = answers[q.id] || {};
              const qType = q.questionType || 'multiple_choice';

              return (
                <div key={q.id} className="qt-question-card">
                  <div className="qt-question-text">
                    <span className="qt-question-num">Câu {qIndex + 1}:</span> 
                    <span>{q.questionText}</span>
                  </div>
                  
                  {qType === 'multiple_choice' && (
                    <div className="qt-options-grid">
                      {q.options && q.options.map((opt, optIndex) => {
                        const isSelected = userAnswerObj.answerIndex === optIndex;
                        return (
                          <div 
                            key={optIndex}
                            className={`qt-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleOptionSelect(q.id, optIndex)}
                          >
                            <div className="qt-option-content">
                              <div className="qt-radio-circle"></div>
                              <span>{opt.text}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {qType === 'typing' && (
                    <input 
                      type="text"
                      value={userAnswerObj.answerText || ''}
                      onChange={(e) => handleTextChange(q.id, e.target.value)}
                      placeholder="Nhập câu trả lời của bạn..."
                      className="qt-input"
                    />
                  )}

                  {qType === 'matching' && (
                    <MatchingQuestionUI 
                      question={q} 
                      answerPairs={userAnswerObj.answerPairs || []}
                      onChange={(pairs) => handleMatchingChange(q.id, pairs)}
                      readOnly={false}
                    />
                  )}

                  {qType === 'reorder' && (
                    <ReorderQuizUI 
                      question={q}
                      answerOrder={userAnswerObj.answerOrder || []}
                      onChange={(words) => setAnswers({ ...answers, [q.id]: { answerOrder: words } })}
                      readOnly={false}
                    />
                  )}

                  {qType === 'reading' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '15px' }}>
                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '15px', color: '#334155' }}>
                        {q.questionText}
                      </div>
                      
                      {(q.options || []).map((subQ, subIdx) => {
                        const subUserAns = (userAnswerObj.readingAnswers || []).find(ua => ua.subQuestionId === subQ.id);
                        const selectedOptIndex = subUserAns ? subUserAns.answerIndex : -1;
                        
                        return (
                          <div key={subQ.id || subIdx} style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '12px', fontSize: '14px' }}>
                              Câu {qIndex + 1}.{subIdx + 1}: {subQ.questionText}
                            </div>
                            <div className="qt-options-grid">
                              {(subQ.options || []).map((opt, optIndex) => {
                                const isSelected = selectedOptIndex === optIndex;
                                return (
                                  <div 
                                    key={optIndex}
                                    className={`qt-option ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleReadingSelect(q.id, subQ.id, optIndex)}
                                  >
                                    <div className="qt-option-content">
                                      <div className="qt-radio-circle"></div>
                                      <span>{opt.text}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="qt-submit-section">
            <button 
              className="qt-btn-submit"
              onClick={() => handleSubmit()}
              disabled={submitting}
            >
              {submitting ? 'Đang nộp...' : 'Nộp bài'}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};

export default QuizTake;
