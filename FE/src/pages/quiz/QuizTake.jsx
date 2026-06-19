import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Clock } from 'lucide-react';
import quizApi from '../../api/quizApi';
import Sidebar from '../../components/dashboard/Sidebar';
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

const QuizTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await quizApi.getQuizById(id);
        const processedQuestions = data.questions.map(q => {
          if (q.questionType === 'matching' && Array.isArray(q.options)) {
            const lefts = q.options.map(o => o.left);
            const rights = q.options.map(o => o.right);
            return {
              ...q,
              shuffledLeft: [...lefts].sort(() => Math.random() - 0.5),
              shuffledRight: [...rights].sort(() => Math.random() - 0.5)
            };
          }
          return q;
        });
        setQuiz({ ...data, questions: processedQuestions });
        if (data.time_limit && data.time_limit > 0) {
          setTimeLeft(data.time_limit * 60);
        }
      } catch (err) {
        setError('Không thể tải bài kiểm tra. Có thể nó chưa sẵn sàng hoặc không tồn tại.');
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
