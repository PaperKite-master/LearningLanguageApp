import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Award } from 'lucide-react';
import quizApi from '../../api/quizApi';
import Sidebar from '../../components/dashboard/Sidebar';

const QuizTake = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({}); // { questionId: answerIndex }
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await quizApi.getQuizById(id);
        setQuiz(data);
      } catch (err) {
        setError('Không thể tải bài kiểm tra. Có thể nó chưa sẵn sàng hoặc không tồn tại.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleOptionSelect = (questionId, index) => {
    if (result) return; // Prevent changing after submit
    setAnswers({ ...answers, [questionId]: index });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      if (!window.confirm('Bạn chưa trả lời hết các câu hỏi. Vẫn nộp bài?')) {
        return;
      }
    }
    
    setSubmitting(true);
    try {
      const formattedAnswers = Object.keys(answers).map(qId => ({
        questionId: qId,
        answerIndex: answers[qId]
      }));
      
      const res = await quizApi.submitQuiz(id, formattedAnswers);
      setResult(res.data);
    } catch (err) {
      alert('Có lỗi khi nộp bài. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
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
          <button className="pill-element" onClick={() => navigate('/study')} style={{ marginTop: '20px', padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Quay lại Lộ trình
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area study-area" style={{ padding: '30px', overflowY: 'auto' }}>
        
        <button 
          onClick={() => navigate('/study')} 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', marginBottom: '20px', fontSize: '1rem' }}
        >
          <ArrowLeft size={20} /> Quay lại
        </button>

        <div style={{ marginBottom: '30px', background: '#1c2035', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ display: 'inline-block', padding: '4px 12px', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '12px' }}>
            Bài Kiểm Tra
          </span>
          <h1 style={{ fontSize: '2.2rem', color: '#fff', margin: '0 0 10px 0' }}>{quiz.title}</h1>
          <div style={{ display: 'flex', gap: '20px', color: '#9ca3af' }}>
            <span>Số câu: {quiz.questions.length}</span>
            <span>Điểm qua môn: {quiz.passingScore}%</span>
          </div>
        </div>

        {result && (
          <div style={{ marginBottom: '30px', background: result.isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${result.isPassed ? '#10b981' : '#ef4444'}`, padding: '30px', borderRadius: '16px', textAlign: 'center' }}>
            <Award size={48} color={result.isPassed ? '#10b981' : '#ef4444'} style={{ marginBottom: '15px' }} />
            <h2 style={{ color: result.isPassed ? '#10b981' : '#ef4444', marginBottom: '10px' }}>
              {result.isPassed ? 'Chúc mừng! Bạn đã đạt!' : 'Rất tiếc! Bạn chưa đạt!'}
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#e2e8f0', marginBottom: '20px' }}>
              Điểm của bạn: <strong style={{ fontSize: '1.5rem' }}>{result.score}%</strong> ({result.correctCount}/{result.totalQuestions} câu)
            </p>
            <button 
              onClick={handleRetake}
              style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
            >
              Làm lại bài
            </button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {quiz.questions.map((q, qIndex) => {
            const userAnswer = answers[q.id];
            
            // Tìm kết quả cho câu hỏi này (nếu đã nộp bài)
            let qResult = null;
            if (result && result.questionResults) {
              qResult = result.questionResults.find(qr => qr.questionId === q.id);
            }

            return (
              <div key={q.id} style={{ background: '#1c2035', padding: '25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ color: '#e2e8f0', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <span style={{ color: '#3b82f6', minWidth: '35px' }}>Câu {qIndex + 1}:</span> 
                  <span>{q.questionText}</span>
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {q.options && q.options.map((opt, optIndex) => {
                    const isSelected = userAnswer === optIndex;
                    let bg = isSelected ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)';
                    let border = isSelected ? '1px solid #3b82f6' : '1px solid transparent';
                    let icon = null;

                    if (result && qResult) {
                      const isCorrectAnswer = qResult.correctOptionIndex === optIndex;
                      if (isCorrectAnswer) {
                        bg = 'rgba(16, 185, 129, 0.2)';
                        border = '1px solid #10b981';
                        icon = <CheckCircle2 color="#10b981" size={20} />;
                      } else if (isSelected && !isCorrectAnswer) {
                        bg = 'rgba(239, 68, 68, 0.2)';
                        border = '1px solid #ef4444';
                        icon = <XCircle color="#ef4444" size={20} />;
                      }
                    }

                    return (
                      <div 
                        key={optIndex}
                        onClick={() => handleOptionSelect(q.id, optIndex)}
                        style={{ 
                          padding: '15px 20px', 
                          borderRadius: '10px', 
                          background: bg, 
                          border: border,
                          cursor: result ? 'default' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          color: '#e2e8f0',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: isSelected ? '6px solid #3b82f6' : '2px solid rgba(255,255,255,0.2)', background: 'transparent' }} />
                          <span>{opt.text}</span>
                        </div>
                        {icon}
                      </div>
                    );
                  })}
                </div>
                
                {result && q.explanation && (
                  <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', borderLeft: '4px solid #a855f7' }}>
                    <strong style={{ color: '#c084fc' }}>Giải thích:</strong>
                    <p style={{ color: '#9ca3af', margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>{q.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!result && (
          <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={handleSubmit}
              disabled={submitting}
              style={{ 
                background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', 
                color: '#fff', 
                border: 'none', 
                padding: '14px 40px', 
                borderRadius: '30px', 
                fontSize: '1.1rem', 
                fontWeight: 'bold',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
              }}
            >
              {submitting ? 'Đang nộp...' : 'Nộp bài'}
            </button>
          </div>
        )}

      </main>
    </div>
  );
};

export default QuizTake;
