import React, { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

// ==========================================
// 1. DẠNG ĐIỀN TỪ (FILL IN THE BLANK)
// ==========================================
export const InteractiveFillBlank = ({ correctAnswer, onComplete }) => {
  const [value, setValue] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'correct', 'error'
  const [hasCompleted, setHasCompleted] = useState(false);

  const checkAnswer = (inputVal) => {
    setValue(inputVal);
    if (!inputVal) {
      setStatus('idle');
      return;
    }
    if (inputVal.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      setStatus('correct');
      if (!hasCompleted && onComplete) {
        setHasCompleted(true);
        onComplete();
      }
    } else {
      setStatus('error');
    }
  };

  return (
    <span className={`interactive-fill-blank ${status}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => checkAnswer(e.target.value)}
        className="fill-input"
        placeholder="..."
        style={{ width: `${Math.max(correctAnswer.length * 15, 60)}px` }}
      />
      {status === 'correct' && <Check size={16} className="status-icon correct-icon" />}
      {status === 'error' && value && <X size={16} className="status-icon error-icon" />}
    </span>
  );
};

// ==========================================
// 2. DẠNG GHÉP TỪ (MATCHING GAME)
// ==========================================
export const InteractiveMatching = ({ text, onComplete }) => {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);
  
  const [errorState, setErrorState] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // Parse the text block
    // Format expected: 
    // 私 : Tôi
    // 日本 : Nhật Bản
    const lines = text.split('\n').filter(l => l.trim().includes(':') || l.trim().includes('-'));
    
    let lItems = [];
    let rItems = [];
    
    lines.forEach((line, index) => {
      // Split by first occurrence of : or -
      const separator = line.includes(':') ? ':' : '-';
      const parts = line.split(separator);
      if (parts.length >= 2) {
        const leftText = parts[0].trim();
        const rightText = parts.slice(1).join(separator).trim();
        
        lItems.push({ id: `L_${index}`, matchId: index, text: leftText });
        rItems.push({ id: `R_${index}`, matchId: index, text: rightText });
      }
    });

    // Shuffle arrays to make it a game
    const shuffle = (array) => array.sort(() => Math.random() - 0.5);
    
    setLeftItems(shuffle(lItems));
    setRightItems(shuffle(rItems));
  }, [text]);

  const handleLeftClick = (id) => {
    if (matchedIds.includes(id)) return;
    setSelectedLeft(id);
    checkMatch(id, selectedRight);
  };

  const handleRightClick = (id) => {
    if (matchedIds.includes(id)) return;
    setSelectedRight(id);
    checkMatch(selectedLeft, id);
  };

  const checkMatch = (lId, rId) => {
    if (!lId || !rId) return;

    const lItem = leftItems.find(i => i.id === lId);
    const rItem = rightItems.find(i => i.id === rId);

    if (lItem && rItem && lItem.matchId === rItem.matchId) {
      // Correct Match!
      setMatchedIds(prev => {
        const newMatchedIds = [...prev, lId, rId];
        // Check if game is completely finished
        if (newMatchedIds.length === leftItems.length * 2) {
           if (!hasCompleted && onComplete) {
             setHasCompleted(true);
             onComplete();
           }
        }
        return newMatchedIds;
      });
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      // Wrong Match!
      setErrorState(true);
      setTimeout(() => {
        setErrorState(false);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500); // Shake animation duration
    }
  };

  const isComplete = matchedIds.length > 0 && matchedIds.length === (leftItems.length * 2);

  return (
    <div className={`interactive-matching ${errorState ? 'shake-error' : ''}`}>
      {isComplete ? (
        <div className="matching-success">
          <Check size={40} color="#10b981" />
          <h3>Tuyệt vời! Bạn đã ghép đúng tất cả.</h3>
          <button className="reset-match-btn" onClick={() => setMatchedIds([])}>Chơi lại</button>
        </div>
      ) : (
        <div className="matching-columns">
          {/* Left Column */}
          <div className="matching-col">
            {leftItems.map(item => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedLeft === item.id;
              return (
                <div 
                  key={item.id} 
                  className={`matching-item ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleLeftClick(item.id)}
                >
                  {item.text}
                </div>
              );
            })}
          </div>

          {/* Right Column */}
          <div className="matching-col">
            {rightItems.map(item => {
              const isMatched = matchedIds.includes(item.id);
              const isSelected = selectedRight === item.id;
              return (
                <div 
                  key={item.id} 
                  className={`matching-item ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleRightClick(item.id)}
                >
                  {item.text}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. DẠNG TRẮC NGHIỆM (MULTIPLE CHOICE)
// ==========================================
export const InteractiveMultipleChoice = ({ text, onComplete }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return;
    
    setQuestion(lines[0].trim());
    
    const parsedOptions = lines.slice(1).map((line, index) => {
      const isCorrect = line.trim().startsWith('*');
      const content = line.replace(/^[\*\-]\s*/, '').trim();
      return { id: index, content, isCorrect };
    });
    
    setOptions(parsedOptions);
  }, [text]);

  const handleSelect = (id) => {
    if (isSubmitted) return;
    setSelectedId(id);
  };

  const handleSubmit = () => {
    if (selectedId !== null) {
      setIsSubmitted(true);
      const selectedOption = options.find(o => o.id === selectedId);
      if (selectedOption?.isCorrect && !hasCompleted && onComplete) {
        setHasCompleted(true);
        onComplete();
      }
    }
  };

  return (
    <div className="interactive-mcq">
      <h4 className="mcq-question">{question}</h4>
      <div className="mcq-options">
        {options.map(opt => {
          let stateClass = '';
          if (isSubmitted) {
            if (opt.isCorrect) stateClass = 'correct';
            else if (selectedId === opt.id) stateClass = 'wrong';
          } else if (selectedId === opt.id) {
            stateClass = 'selected';
          }
          
          return (
            <div 
              key={opt.id} 
              className={`mcq-option ${stateClass}`} 
              onClick={() => handleSelect(opt.id)}
            >
              <div className="mcq-circle">
                {isSubmitted && opt.isCorrect ? <Check size={16} /> : 
                 isSubmitted && selectedId === opt.id ? <X size={16} /> : null}
              </div>
              <span>{opt.content}</span>
            </div>
          );
        })}
      </div>
      {!isSubmitted && selectedId !== null && (
        <button className="mcq-submit-btn" onClick={handleSubmit}>Kiểm tra</button>
      )}
      {isSubmitted && (
        <button className="mcq-reset-btn" onClick={() => { setIsSubmitted(false); setSelectedId(null); }}>Làm lại</button>
      )}
    </div>
  );
};

// ==========================================
// 4. DẠNG SẮP XẾP CÂU (SENTENCE REORDER)
// ==========================================
export const InteractiveReorder = ({ text, onComplete }) => {
  const [question, setQuestion] = useState('');
  const [availableWords, setAvailableWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'correct', 'error'
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return;
    
    setQuestion(lines[0].trim());
    
    const words = lines[1].split('/').map((w, i) => ({ id: i, text: w.trim() })).filter(w => w.text);
    
    // Shuffle words for available bank
    const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffle(words));
    setSelectedWords([]);
    setStatus('idle');
  }, [text]);

  const handleSelectWord = (word) => {
    if (isChecking) return;
    setAvailableWords(prev => prev.filter(w => w.id !== word.id));
    setSelectedWords(prev => [...prev, word]);
  };

  const handleDeselectWord = (word) => {
    if (isChecking) return;
    setSelectedWords(prev => prev.filter(w => w.id !== word.id));
    setAvailableWords(prev => [...prev, word]);
  };

  const checkAnswer = () => {
    setIsChecking(true);
    // Check if sorted array of selected matches 0,1,2,3...
    const isCorrect = selectedWords.every((w, i) => w.id === i) && availableWords.length === 0;
    
    if (isCorrect) {
      setStatus('correct');
      if (!hasCompleted && onComplete) {
        setHasCompleted(true);
        onComplete();
      }
    } else {
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setIsChecking(false);
      }, 800);
    }
  };

  const handleReset = () => {
    const allWords = [...selectedWords, ...availableWords];
    const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);
    setAvailableWords(shuffle(allWords));
    setSelectedWords([]);
    setStatus('idle');
    setIsChecking(false);
  };

  return (
    <div className={`interactive-reorder ${status === 'error' ? 'shake-error' : ''}`}>
      <h4 className="reorder-question">{question}</h4>
      
      <div className="reorder-answer-area">
        {selectedWords.length === 0 && <span className="reorder-placeholder">Bấm vào các từ bên dưới để ghép thành câu...</span>}
        {selectedWords.map(word => (
          <div key={word.id} className="reorder-word selected" onClick={() => handleDeselectWord(word)}>
            {word.text}
          </div>
        ))}
      </div>

      {status === 'correct' ? (
        <div className="reorder-success">
          <Check size={24} color="#10b981" />
          <span>Chính xác!</span>
          <button onClick={handleReset} className="reorder-reset-btn">Chơi lại</button>
        </div>
      ) : (
        <>
          <div className="reorder-bank-area">
            {availableWords.map(word => (
              <div key={word.id} className="reorder-word" onClick={() => handleSelectWord(word)}>
                {word.text}
              </div>
            ))}
          </div>
          <div className="reorder-actions">
            <button 
              className="reorder-check-btn" 
              disabled={selectedWords.length === 0 || isChecking}
              onClick={checkAnswer}
            >
              Kiểm tra
            </button>
          </div>
        </>
      )}
    </div>
  );
};

