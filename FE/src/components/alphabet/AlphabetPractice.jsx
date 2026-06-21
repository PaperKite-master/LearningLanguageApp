import React, { useState, useEffect, useRef } from 'react';
import './AlphabetPractice.css';
import playSound from '../../utils/soundEffects';
import { ArrowLeft, Check, RefreshCw, ChevronRight } from 'lucide-react';
import { 
  hiraganaData, hiraganaDakuonData, hiraganaYoonData,
  katakanaData, katakanaDakuonData, katakanaYoonData
} from '../../data/kana';

const yoonStarts = ['k', 's', 'c', 'n', 'h', 'm', 'r'];

const isKatakana = (char) => {
  if (!char) return false;
  return char.charCodeAt(0) >= 0x30A0 && char.charCodeAt(0) <= 0x30FF;
};

const AlphabetPractice = ({ onBack }) => {
  const [setupDone, setSetupDone] = useState(false);
  const [alphabetType, setAlphabetType] = useState('hiragana');
  const [selectedGroups, setSelectedGroups] = useState({
    gojuon: true,
    dakuon: false,
    yoon: false,
    dakuonYoon: false
  });

  const [mode, setMode] = useState('casual');
  const [gameStatus, setGameStatus] = useState('idle');
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

  const handleStartGame = () => {
    let finalData = [];
    const addData = (hData, kData, groupName) => {
      if (selectedGroups[groupName]) {
        if (alphabetType === 'hiragana' || alphabetType === 'both') finalData.push(...hData);
        if (alphabetType === 'katakana' || alphabetType === 'both') finalData.push(...kData);
      }
    };
    
    addData(hiraganaData, katakanaData, 'gojuon');
    addData(hiraganaDakuonData, katakanaDakuonData, 'dakuon');
    
    const hPureYoon = hiraganaYoonData.filter(item => item && yoonStarts.includes(item.romaji.charAt(0)));
    const kPureYoon = katakanaYoonData.filter(item => item && yoonStarts.includes(item.romaji.charAt(0)));
    addData(hPureYoon, kPureYoon, 'yoon');

    const hDakuonYoon = hiraganaYoonData.filter(item => item && !yoonStarts.includes(item.romaji.charAt(0)));
    const kDakuonYoon = katakanaYoonData.filter(item => item && !yoonStarts.includes(item.romaji.charAt(0)));
    addData(hDakuonYoon, kDakuonYoon, 'dakuonYoon');

    if (finalData.length === 0) {
      alert('Vui lòng chọn ít nhất một nhóm để luyện tập!');
      return;
    }

    const validData = finalData.filter(item => item !== null);
    const shuffled = [...validData].sort(() => Math.random() - 0.5);
    
    setQueue(shuffled);
    setTotalItems(shuffled.length);
    setCurrentChar(shuffled[0]);
    
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setInputValue('');
    setIsError(false);
    setTimeLeft(60);
    setGameStatus('playing');
    setSetupDone(true);
  };

  useEffect(() => {
    if (gameStatus === 'playing' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStatus, currentChar]);

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

  const handleCheck = () => {
    const value = inputValue.trim().toLowerCase();
    if (value === currentChar.romaji.toLowerCase()) {
      handleCorrect();
    } else if (value !== '') {
      handleWrong();
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsError(false);
    const value = e.target.value.trim().toLowerCase();
    if (value === currentChar.romaji.toLowerCase()) {
      handleCorrect();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCheck();
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
    setTimeout(() => setIsError(false), 400); 
  };

  const nextChar = () => {
    setInputValue('');
    const newQueue = [...queue];
    newQueue.shift();
    if (newQueue.length === 0) {
      setGameStatus('finished');
      clearInterval(timerRef.current);
      setCurrentChar(null);
    } else {
      setQueue(newQueue);
      setCurrentChar(newQueue[0]);
    }
  };

  if (!setupDone) {
    const isKata = alphabetType === 'katakana';
    const activeColor = isKata ? '#0ea5e9' : '#d946ef';

    const getPreviewData = () => {
      if (alphabetType === 'katakana') {
        return { basic: katakanaData, dakuon: katakanaDakuonData, yoon: katakanaYoonData };
      }
      if (alphabetType === 'hiragana') {
        return { basic: hiraganaData, dakuon: hiraganaDakuonData, yoon: hiraganaYoonData };
      }
      
      const combine = (hData, kData) => {
        return hData.map((h, i) => {
          if (!h) return null;
          return {
            ...h,
            kana: (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '0.85rem', lineHeight: '1.2' }}>
                <span>{h.kana}</span>
                <span style={{ opacity: 0.8 }}>{kData[i]?.kana}</span>
              </div>
            )
          };
        });
      };

      return {
        basic: combine(hiraganaData, katakanaData),
        dakuon: combine(hiraganaDakuonData, katakanaDakuonData),
        yoon: combine(hiraganaYoonData, katakanaYoonData)
      };
    };

    const previewData = getPreviewData();

    const pureYoon = previewData.yoon.filter(item => item && yoonStarts.includes(item.romaji.charAt(0)));
    const dakuonYoon = previewData.yoon.filter(item => item && !yoonStarts.includes(item.romaji.charAt(0)));

    const renderPreviewGrid = (data, groupKey, cols) => {
      const isSelected = selectedGroups[groupKey];
      return (
        <div style={{ marginBottom: '30px' }}>
          <div 
            onClick={() => setSelectedGroups(prev => ({...prev, [groupKey]: !prev[groupKey]}))}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', cursor: 'pointer', width: 'fit-content' }}
          >
            <div style={{ 
              width: '18px', height: '18px', borderRadius: '4px', border: `2px solid ${isSelected ? activeColor : '#cbd5e1'}`,
              background: isSelected ? activeColor : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
            }}>
              {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
            </div>
            <span style={{ fontWeight: 'bold', color: '#333' }}>
              {groupKey === 'gojuon' ? 'Gojūon' : groupKey === 'dakuon' ? 'Dakuon' : groupKey === 'yoon' ? 'Yōon' : 'Dakuon Yōon'}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '8px' }}>
            {data.map((item, idx) => {
              if (item === null) return <div key={`emp-${idx}`} />;
              return (
                <div key={item.id} style={{
                  background: isSelected ? activeColor : '#ffffff',
                  color: isSelected ? '#ffffff' : '#3b0764',
                  border: isSelected ? '1px solid transparent' : `1px solid #e2e8f0`,
                  borderRadius: '8px',
                  aspectRatio: '5 / 4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.1rem', fontWeight: 'bold',
                  boxShadow: isSelected 
                    ? `0 6px 12px ${activeColor}50` 
                    : '0 4px 10px rgba(0, 0, 0, 0.06)',
                  transform: isSelected ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.2s ease-out'
                }}>
                  {item.kana}
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <div style={{ background: '#ffffff', minHeight: '100%', width: '100%', padding: '40px', fontFamily: "'Inter', sans-serif" }}>
        <h1 style={{ textAlign: 'center', fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '20px' }}>
          BẠN MUỐN LUYỆN TẬP
        </h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginBottom: '50px' }}>
          {['hiragana', 'katakana', 'both'].map(type => {
            const label = type === 'hiragana' ? 'Hiragana' : type === 'katakana' ? 'Katakana' : 'Cả hai';
            const color = type === 'katakana' ? '#0ea5e9' : '#d946ef';
            const isSelected = alphabetType === type;
            return (
              <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569' }}>
                <div style={{ 
                  width: '20px', height: '20px', borderRadius: '50%', border: `2px solid ${isSelected ? color : '#cbd5e1'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                }}>
                  {isSelected && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />}
                </div>
                <input type="radio" hidden checked={isSelected} onChange={() => setAlphabetType(type)} />
                {label}
              </label>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ width: '250px' }}>
            {renderPreviewGrid(previewData.basic, 'gojuon', 5)}
          </div>
          <div style={{ width: '250px' }}>
            {renderPreviewGrid(previewData.dakuon, 'dakuon', 5)}
          </div>
          <div style={{ width: '150px' }}>
            {renderPreviewGrid(pureYoon, 'yoon', 3)}
            {renderPreviewGrid(dakuonYoon, 'dakuonYoon', 3)}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '40px' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px', background: '#fff', border: '1px solid #475569', color: '#475569', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer' }}>
            <ArrowLeft size={18} /> Trở lại
          </button>
          <button onClick={handleStartGame} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px', background: '#3b0764', color: '#fff', border: 'none', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59, 7, 100, 0.3)' }}>
            Bắt đầu <ArrowLeft size={18} style={{ transform: 'rotate(180deg)' }} />
          </button>
        </div>
      </div>
    );
  }

  if (gameStatus === 'finished') {
    const unfinished = currentChar ? [currentChar, ...queue].filter(i => i) : [];
    const correctCount = totalItems - unfinished.length;
    
    const numHira = unfinished.filter(item => !isKatakana(item.kana[0])).length;
    const numKata = unfinished.filter(item => isKatakana(item.kana[0])).length;

    return (
      <div style={{ background: '#ffffff', minHeight: '100%', width: '100%', padding: '40px 60px', fontFamily: "'Inter', sans-serif" }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b', marginBottom: '10px' }}>
          BẠN ĐÃ HOÀN THÀNH
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 'bold', marginBottom: '40px', textTransform: 'uppercase' }}>
          {correctCount}/{totalItems} CÂU TRẢ LỜI,
        </p>

        {unfinished.length > 0 && (
          <div style={{ marginBottom: '50px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Chưa Hoàn Thành</h2>
              {numHira > 0 && <span style={{ background: '#d946ef', color: '#fff', padding: '4px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>{numHira}</span>}
              {numKata > 0 && <span style={{ background: '#0ea5e9', color: '#fff', padding: '4px 15px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>{numKata}</span>}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {unfinished.map((item, idx) => {
                const color = isKatakana(item.kana[0]) ? '#0ea5e9' : '#d946ef';
                return (
                  <div key={idx} style={{
                    width: '45px', height: '35px', borderRadius: '6px',
                    background: color, color: '#fff', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', fontWeight: 'bold',
                    boxShadow: `0 3px 8px ${color}40`
                  }}>
                    {item.kana}
                  </div>
                );
              })}
            </div>
            
            <p style={{ color: '#64748b', marginTop: '30px', fontWeight: '500' }}>
              Còn {unfinished.length} từ chưa hoàn thành. Tiếp tục luyện tập?
            </p>
          </div>
        )}

        {unfinished.length === 0 && (
          <p style={{ color: '#10b981', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '50px' }}>
            Chúc mừng! Bạn đã hoàn thành tất cả!
          </p>
        )}

        <div style={{ display: 'flex', gap: '20px' }}>
          {unfinished.length > 0 && (
            <button onClick={() => {
               setGameStatus('playing');
            }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px', background: '#3b0764', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(59, 7, 100, 0.3)' }}>
              <ArrowLeft size={18} /> Tiếp tục
            </button>
          )}
          <button onClick={() => {
             setSetupDone(false);
             setGameStatus('idle');
          }} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px', background: '#fff', border: '1px solid #475569', color: '#475569', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            <ArrowLeft size={18} /> Trở lại
          </button>
        </div>
      </div>
    );
  }

  // PLAYING STATE
  const playingQueue = currentChar ? [currentChar, ...queue].slice(0, 8) : [];
  
  return (
    <div style={{ background: '#ffffff', minHeight: '100%', width: '100%', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Character Queue */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '25px', marginBottom: '80px', height: '100px' }}>
        {playingQueue.map((item, idx) => {
          if (!item) return null;
          const isFirst = idx === 0;
          return (
            <div key={idx} style={{
              fontSize: isFirst ? '4.5rem' : '3.5rem',
              fontWeight: 'bold',
              color: '#d946ef',
              opacity: 1 - (idx * 0.12),
              borderBottom: isFirst ? '4px dashed #d946ef' : 'none',
              paddingBottom: '5px',
              transition: 'all 0.3s'
            }}>
              {item.kana}
            </div>
          );
        })}
      </div>

      {/* Input Container */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '400px', marginBottom: '40px' }}>
        <input 
          ref={inputRef}
          type="text"
          className={isError ? 'error' : ''}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Đáp án của bạn"
          style={{ 
            width: '100%', padding: '15px 40px', borderRadius: '30px', 
            background: '#e2e8f0', border: 'none', fontSize: '1.1rem', 
            color: '#333', outline: 'none', textAlign: 'center',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
          }}
          autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck="false"
        />
        <ChevronRight style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', alignItems: 'center' }}>
        <ArrowLeft color="#d946ef" size={32} style={{ cursor: 'pointer', strokeWidth: 3, transition: 'transform 0.2s' }} 
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onClick={() => setGameStatus('finished')} 
        />
        <RefreshCw color="#d946ef" size={32} style={{ cursor: 'pointer', strokeWidth: 3, transition: 'transform 0.2s' }} 
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onClick={() => {
            handleStartGame(); // Restart with same settings
          }} 
        />
        <Check color="#d946ef" size={40} style={{ cursor: 'pointer', strokeWidth: 3, transition: 'transform 0.2s' }} 
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onClick={handleCheck} 
        />
      </div>
      
    </div>
  );
};

export default AlphabetPractice;
