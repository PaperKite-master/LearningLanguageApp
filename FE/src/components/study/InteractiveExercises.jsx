import React, { useState, useEffect } from 'react';
import { Check, X, Volume2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableWord } from './SortableWord';
import playSound from '../../utils/soundEffects';

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
      if (!hasCompleted) {
        playSound('correct');
        setHasCompleted(true);
        if (onComplete) onComplete();
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
    const lines = text.split('\n').filter(l => l.trim().includes(':') || l.trim().includes('-'));
    let lItems = [];
    let rItems = [];
    lines.forEach((line, index) => {
      const separator = line.includes(':') ? ':' : '-';
      const parts = line.split(separator);
      if (parts.length >= 2) {
        const leftText = parts[0].trim();
        const rightText = parts.slice(1).join(separator).trim();
        lItems.push({ id: `L_${index}`, matchId: index, text: leftText });
        rItems.push({ id: `R_${index}`, matchId: index, text: rightText });
      }
    });
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
      playSound('correct');
      setMatchedIds(prev => {
        const newMatchedIds = [...prev, lId, rId];
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
      playSound('wrong');
      setErrorState(true);
      setTimeout(() => {
        setErrorState(false);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 500);
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
// 3. DẠNG TRẮC NGHIỆM (MULTIPLE CHOICE) - NÂNG CẤP UI
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
      if (selectedOption?.isCorrect) {
        playSound('correct');
        if (!hasCompleted && onComplete) {
          setHasCompleted(true);
          onComplete();
        }
      } else {
        playSound('wrong');
      }
    }
  };

  const isCorrectAnswer = isSubmitted && options.find(o => o.id === selectedId)?.isCorrect;
  const isWrongAnswer = isSubmitted && !options.find(o => o.id === selectedId)?.isCorrect;

  return (
    <div className={`interactive-mcq ${isCorrectAnswer ? 'mcq-success-anim' : ''} ${isWrongAnswer ? 'shake-error' : ''}`}>
      <div className="mcq-header">
        <h4 className="mcq-question">{question}</h4>
      </div>
      
      <div className="mcq-options-grid">
        {options.map((opt, idx) => {
          let stateClass = '';
          if (isSubmitted) {
            if (opt.isCorrect) stateClass = 'correct';
            else if (selectedId === opt.id) stateClass = 'wrong';
          } else if (selectedId === opt.id) {
            stateClass = 'selected';
          }
          
          const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
          
          return (
            <div 
              key={opt.id} 
              className={`mcq-card ${stateClass}`} 
              onClick={() => handleSelect(opt.id)}
            >
              <div className="mcq-card-letter">{letters[idx] || (idx+1)}</div>
              <div className="mcq-card-content">{opt.content}</div>
              <div className="mcq-card-icon">
                {isSubmitted && opt.isCorrect ? <Check size={20} /> : 
                 isSubmitted && selectedId === opt.id ? <X size={20} /> : null}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mcq-footer">
        {!isSubmitted && selectedId !== null && (
          <button className="mcq-btn mcq-submit" onClick={handleSubmit}>Kiểm tra đáp án</button>
        )}
        {isSubmitted && (
          <button className="mcq-btn mcq-reset" onClick={() => { setIsSubmitted(false); setSelectedId(null); }}>
            Làm lại
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. DẠNG SẮP XẾP CÂU (SENTENCE REORDER) - DRAG & DROP
// ==========================================
export const InteractiveReorder = ({ text, onComplete }) => {
  const [question, setQuestion] = useState('');
  const [words, setWords] = useState([]);
  const [originalOrder, setOriginalOrder] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle', 'correct', 'error'
  const [hasCompleted, setHasCompleted] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return;
    
    setQuestion(lines[0].trim());
    
    const parsedWords = lines[1].split('/').map((w, i) => ({ id: `word-${i}`, text: w.trim(), originalIndex: i })).filter(w => w.text);
    setOriginalOrder(parsedWords.map(w => w.id));
    
    // Shuffle words initially
    const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);
    setWords(shuffle(parsedWords));
    setStatus('idle');
  }, [text]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setWords((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const checkAnswer = () => {
    setIsChecking(true);
    // Check if the current order of word IDs matches the original order
    const currentOrder = words.map(w => w.id);
    const isCorrect = currentOrder.join(',') === originalOrder.join(',');
    
    if (isCorrect) {
      playSound('correct');
      setStatus('correct');
      if (!hasCompleted && onComplete) {
        setHasCompleted(true);
        onComplete();
      }
    } else {
      playSound('wrong');
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
        setIsChecking(false);
      }, 800);
    }
  };

  const handleReset = () => {
    const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);
    setWords(shuffle(words));
    setStatus('idle');
    setIsChecking(false);
  };

  return (
    <div className={`interactive-reorder dnd-reorder ${status === 'error' ? 'shake-error' : ''}`}>
      <h4 className="reorder-question">
        <Volume2 size={18} style={{marginRight: 8, display: 'inline', verticalAlign: 'text-bottom', color: '#10b981'}} />
        {question}
      </h4>
      
      {status === 'correct' ? (
        <div className="reorder-success">
          <Check size={28} color="#10b981" />
          <span>Bạn đã sắp xếp câu xuất sắc!</span>
          <button onClick={handleReset} className="reorder-reset-btn">Chơi lại</button>
        </div>
      ) : (
        <div className="dnd-container">
          <p className="dnd-instruction">Kéo và thả các khối từ bên dưới để tạo thành câu hoàn chỉnh đúng nghĩa:</p>
          
          <div className="dnd-dropzone">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={words.map(w => w.id)} strategy={rectSortingStrategy}>
                <div className="dnd-word-list">
                  {words.map(word => (
                    <SortableWord key={word.id} id={word.id} text={word.text} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
          
          <div className="reorder-actions">
            <button 
              className="reorder-check-btn dnd-check" 
              disabled={isChecking}
              onClick={checkAnswer}
            >
              Kiểm tra câu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export * from './InteractiveConnect';
