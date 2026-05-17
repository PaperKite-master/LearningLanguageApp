import React, { useState, useEffect, useRef } from 'react';
import { Check, X } from 'lucide-react';
import playSound from '../../utils/soundEffects';

export const InteractiveConnect = ({ text, onComplete }) => {
  const [leftItems, setLeftItems] = useState([]);
  const [rightItems, setRightItems] = useState([]);
  const [connections, setConnections] = useState([]); // { leftId, rightId, status }
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [dimensions, setDimensions] = useState(0); // Trigger re-render for lines

  const containerRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    // Parse the text block
    // Format expected: a. 作ります＿làm
    const lines = text.split('\n').filter(l => l.trim().includes('＿') || l.trim().includes('_'));
    let lItems = [];
    let rItems = [];
    
    lines.forEach((line, index) => {
      const separator = line.includes('＿') ? '＿' : '_';
      const parts = line.split(separator);
      if (parts.length >= 2) {
        // Handle "a. " prefix if exists, or keep it
        let leftText = parts[0].trim();
        // optionally remove a. b. c. if user friend added them: 
        // leftText = leftText.replace(/^[a-zA-Z0-9]\.\s*/, '');
        
        let rightText = parts.slice(1).join(separator).trim();
        
        lItems.push({ id: `L_${index}`, matchId: index, text: leftText });
        rItems.push({ id: `R_${index}`, matchId: index, text: rightText });
      }
    });

    const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);
    setLeftItems(shuffle(lItems));
    setRightItems(shuffle(rItems));
  }, [text]);

  // Handle window resize to recalculate line positions
  useEffect(() => {
    const handleResize = () => setDimensions(prev => prev + 1);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setRef = (id) => (el) => {
    if (el) itemRefs.current[id] = el;
  };

  const handleLeftClick = (id) => {
    if (connections.some(c => c.leftId === id && c.status === 'correct')) return;
    
    if (selectedLeft === id) {
      setSelectedLeft(null); // Toggle off
      return;
    }
    
    setSelectedLeft(id);
    if (selectedRight) {
      checkMatch(id, selectedRight);
    }
  };

  const handleRightClick = (id) => {
    if (connections.some(c => c.rightId === id && c.status === 'correct')) return;

    if (selectedRight === id) {
      setSelectedRight(null); // Toggle off
      return;
    }

    setSelectedRight(id);
    if (selectedLeft) {
      checkMatch(selectedLeft, id);
    }
  };

  const checkMatch = (lId, rId) => {
    const lItem = leftItems.find(i => i.id === lId);
    const rItem = rightItems.find(i => i.id === rId);

    const isCorrect = lItem.matchId === rItem.matchId;
    
    const newConnection = { leftId: lId, rightId: rId, status: isCorrect ? 'correct' : 'wrong' };
    
    setConnections(prev => [...prev.filter(c => c.leftId !== lId && c.rightId !== rId), newConnection]);
    setSelectedLeft(null);
    setSelectedRight(null);

    if (isCorrect) {
      playSound('correct');
      // Check if all are correct
      setConnections(prev => {
        const correctCount = prev.filter(c => c.status === 'correct').length;
        if (correctCount === leftItems.length) {
          if (!hasCompleted && onComplete) {
            setHasCompleted(true);
            setTimeout(() => onComplete(), 500);
          }
        }
        return prev;
      });
    } else {
      playSound('wrong');
      // Remove the wrong connection after a delay
      setTimeout(() => {
        setConnections(prev => prev.filter(c => c !== newConnection));
      }, 800);
    }
  };

  const getLineCoordinates = (lId, rId) => {
    if (!containerRef.current || !itemRefs.current[lId] || !itemRefs.current[rId]) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const lRect = itemRefs.current[lId].getBoundingClientRect();
    const rRect = itemRefs.current[rId].getBoundingClientRect();

    return {
      x1: lRect.right - containerRect.left,
      y1: lRect.top + lRect.height / 2 - containerRect.top,
      x2: rRect.left - containerRect.left,
      y2: rRect.top + rRect.height / 2 - containerRect.top,
    };
  };

  const isComplete = connections.filter(c => c.status === 'correct').length === leftItems.length && leftItems.length > 0;

  return (
    <div className="interactive-connect">
      {isComplete && (
        <div className="connect-success">
          <Check size={28} color="#10b981" />
          <span>Tuyệt vời! Bạn đã nối đúng tất cả.</span>
          <button className="reorder-reset-btn" onClick={() => setConnections([])}>Chơi lại</button>
        </div>
      )}
      
      <div className="connect-instruction">Nhấn vào mục cột trái, sau đó nhấn mục cột phải để nối từ:</div>

      <div className="connect-columns" ref={containerRef}>
        <svg className="connect-svg">
          {/* Render pending line if one item is selected - optional, hard without mouse tracking */}
          
          {/* Render completed connections */}
          {connections.map((conn, idx) => {
            const coords = getLineCoordinates(conn.leftId, conn.rightId);
            if (!coords) return null;
            
            const isWrong = conn.status === 'wrong';
            return (
              <line 
                key={idx}
                x1={coords.x1} 
                y1={coords.y1} 
                x2={coords.x2} 
                y2={coords.y2} 
                className={`connect-line ${isWrong ? 'wrong' : 'correct'}`}
              />
            );
          })}
        </svg>

        <div className="connect-col">
          {leftItems.map(item => {
            const isCorrect = connections.some(c => c.leftId === item.id && c.status === 'correct');
            const isWrong = connections.some(c => c.leftId === item.id && c.status === 'wrong');
            const isSelected = selectedLeft === item.id;
            
            let classes = 'connect-item ';
            if (isCorrect) classes += 'correct ';
            if (isWrong) classes += 'shake-error ';
            if (isSelected) classes += 'selected ';

            return (
              <div 
                key={item.id} 
                ref={setRef(item.id)}
                className={classes}
                onClick={() => handleLeftClick(item.id)}
              >
                <div className="connect-dot right"></div>
                {item.text}
              </div>
            );
          })}
        </div>

        <div className="connect-col">
          {rightItems.map(item => {
            const isCorrect = connections.some(c => c.rightId === item.id && c.status === 'correct');
            const isWrong = connections.some(c => c.rightId === item.id && c.status === 'wrong');
            const isSelected = selectedRight === item.id;
            
            let classes = 'connect-item ';
            if (isCorrect) classes += 'correct ';
            if (isWrong) classes += 'shake-error ';
            if (isSelected) classes += 'selected ';

            return (
              <div 
                key={item.id} 
                ref={setRef(item.id)}
                className={classes}
                onClick={() => handleRightClick(item.id)}
              >
                <div className="connect-dot left"></div>
                {item.text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
