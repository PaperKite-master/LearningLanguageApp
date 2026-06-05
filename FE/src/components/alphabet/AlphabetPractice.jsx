import React, { useState, useEffect, useRef } from 'react';
import './AlphabetPractice.css';
import playSound from '../../utils/soundEffects';

const AlphabetPractice = ({ kanaData, onBack }) => {
  const [mode, setMode] = useState('menu'); // 'menu', 'casual', 'time_attack'
  const [gameStatus, setGameStatus] = useState('idle'); // 'idle', 'playing', 'finished'
  const [queue, setQueue] = useState([]);
  const [currentChar, setCurrentChar] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isError, setIsError] = useState(false);
  
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalItems, setTotalItems] = useState(0);

  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Audio Context for sound effects is imported from utils

  // Initialize Game
  const startGame = (selectedMode) => {
    // Filter out nulls and shuffle
    const validData = kanaData.filter(item => item !== null);
    const shuffled = [...validData].sort(() => Math.random() - 0.5);
    
    setQueue(shuffled);
    setTotalItems(shuffled.length);
    setCurrentChar(shuffled[0]);
    
    setMode(selectedMode);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setInputValue('');
    setIsError(false);
    setTimeLeft(60);
    setGameStatus('playing');
  };

  useEffect(() => {
    if (gameStatus === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStatus, currentChar]);

  // Timer for Time Attack
  useEffect(() => {
    if (gameStatus === 'playing' && mode === 'time_attack') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setGameStatus('finished');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameStatus, mode]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsError(false); // remove error state on typing
    
    const value = e.target.value.trim().toLowerCase();
    
    // Auto-check on typing (so they don't need to press enter if it matches)
    if (value === currentChar.romaji.toLowerCase()) {
      handleCorrect();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      const value = inputValue.trim().toLowerCase();
      if (value === currentChar.romaji.toLowerCase()) {
        handleCorrect();
      } else if (value !== '') {
        handleWrong();
      }
    }
  };

  const handleCorrect = () => {
    playSound('correct');
    const newCombo = combo + 1;
    setCombo(newCombo);
    if (newCombo > maxCombo) setMaxCombo(newCombo);
    setScore(prev => prev + 10 + (newCombo > 1 ? newCombo * 2 : 0));
    
    nextChar();
  };

  const handleWrong = () => {
    playSound('wrong');
    setCombo(0);
    setIsError(true);
    setInputValue('');
    // remove animation class after it plays so it can play again
    setTimeout(() => setIsError(false), 400); 
  };

  const nextChar = () => {
    setInputValue('');
    const newQueue = [...queue];
    newQueue.shift(); // remove current
    
    if (newQueue.length === 0) {
      // Finished the alphabet
      setGameStatus('finished');
      clearInterval(timerRef.current);
    } else {
      setQueue(newQueue);
      setCurrentChar(newQueue[0]);
    }
  };

  if (mode === 'menu' || gameStatus === 'idle') {
    return (
      <div className="alphabet-practice-container">
        <div className="ap-menu">
          <h2>Chọn Chế Độ Luyện Tập</h2>
          <button className="ap-mode-btn" onClick={() => startGame('casual')}>
            Thư giãn (Không tính giờ)
          </button>
          <button className="ap-mode-btn" style={{ borderColor: '#ef4444' }} onClick={() => startGame('time_attack')}>
            Thử thách (60 giây)
          </button>
          <button className="ap-btn-cancel" onClick={onBack} style={{ marginTop: '20px' }}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (gameStatus === 'finished') {
    return (
      <div className="alphabet-practice-container">
        <div className="ap-finished">
          <h2>Hoàn Thành!</h2>
          <div className="stats">
            {mode === 'time_attack' && (
              <>
                <p>Điểm số: <strong style={{ color: '#0ea5e9' }}>{score}</strong></p>
                <p>Combo cao nhất: <strong style={{ color: '#10b981' }}>{maxCombo}</strong></p>
              </>
            )}
            {queue.length === 0 && <p style={{ color: '#f59e0b', marginTop: '10px' }}>Chúc mừng bạn đã hoàn thành bảng chữ cái!</p>}
          </div>
          <div className="ap-actions">
            <button className="ap-btn-cancel" onClick={onBack}>Quay lại</button>
            <button className="ap-play-again-btn" onClick={() => startGame(mode)}>Chơi Lại</button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = ((totalItems - queue.length) / totalItems) * 100;

  return (
    <div className="alphabet-practice-container">
      <div className="ap-game">
        <div className="ap-header">
          {mode === 'time_attack' ? (
            <div className="ap-score">Điểm: {score} | Combo: x{combo}</div>
          ) : (
            <div className="ap-score">Chế độ Thư giãn</div>
          )}
          {mode === 'time_attack' && <div className="ap-timer">⏳ {timeLeft}s</div>}
        </div>
        
        {currentChar && (
          <div className="ap-kana-display">
            {currentChar.kana}
          </div>
        )}
        
        <div className="ap-input-container">
          <input 
            ref={inputRef}
            type="text"
            className={`ap-input ${isError ? 'error' : ''}`}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Gõ Romaji (VD: a)"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
          />
        </div>

        <div className="ap-progress">
          <div className="ap-progress-bar" style={{ width: `${progressPercent}%` }}></div>
        </div>

        <div className="ap-actions">
          <button className="ap-btn-cancel" onClick={() => setGameStatus('finished')}>
            Kết thúc sớm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlphabetPractice;
