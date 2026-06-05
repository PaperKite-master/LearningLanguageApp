import React, { useState, useEffect } from 'react';
import flashcardApi from '../../api/flashcardApi';
import MyFlashcards from './MyFlashcards';
import './FlashcardContent.css';

const FlashcardContent = () => {
  const [activeTab, setActiveTab] = useState('library');
  const [selectedLevel, setSelectedLevel] = useState(null); // To track which N-level box is opened
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState(false);
  const [clonedIds, setClonedIds] = useState(new Set());

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true);
        const [libraryData, myCardsData] = await Promise.all([
          flashcardApi.getLibrary(),
          flashcardApi.getMyCards()
        ]);
        
        // Parse library cards
        let libCards = [];
        if (Array.isArray(libraryData)) {
          libCards = libraryData;
        } else if (libraryData && libraryData.data && Array.isArray(libraryData.data)) {
          libCards = libraryData.data;
        }

        // Initialize clonedIds state
        const clonedSet = new Set();
        const myCards = Array.isArray(myCardsData) ? myCardsData : (myCardsData?.data || []);
        myCards.forEach(mc => {
          let originalId = null;
          try {
            if (mc.notes) originalId = JSON.parse(mc.notes).originalId;
          } catch(e) {}

          if (originalId) {
            clonedSet.add(originalId);
          } else {
            // fallback match
            const match = libCards.find(lc => lc.frontText === mc.frontText && lc.backText === mc.backText);
            if (match) clonedSet.add(match.id);
          }
        });
        setClonedIds(clonedSet);
        
        // Sort data by createdAt ascending (oldest first) exactly like Admin does
        const sortedData = [...libCards].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

        // Use the same parsing logic as Admin to map BE to FE
        const mappedData = sortedData.map((card, index) => {
          let parsedNotes = {};
          try {
            if (card.notes) parsedNotes = JSON.parse(card.notes);
          } catch (e) {
            // ignore
          }
          return {
            id: card.id,
            displayId: parsedNotes.displayId || `F${String(index + 1).padStart(3, '0')}`,
            jp: card.frontText,
            meaning: card.backText,
            kana: parsedNotes.kana || '',
            level: parsedNotes.level || 'N5',
            status: parsedNotes.status || 'Draft'
          };
        });

        // Sort by displayId ascending (F001 -> F002 -> F003) to handle any gap-filled IDs properly
        mappedData.sort((a, b) => {
          const numA = parseInt(a.displayId.replace('F', ''), 10);
          const numB = parseInt(b.displayId.replace('F', ''), 10);
          return numA - numB;
        });

        setFlashcards(mappedData);
      } catch (err) {
        console.error("Failed to fetch flashcards", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSelectLevel = (level) => {
    setSelectedLevel(level);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleBackToLibrary = () => {
    setSelectedLevel(null);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleCloneCard = async (e, id) => {
    e.stopPropagation(); // prevent card flip if placed on card
    if (clonedIds.has(id)) return;
    try {
      setCloning(true);
      await flashcardApi.cloneLibraryCard(id);
      setClonedIds(prev => new Set(prev).add(id));
      alert("Đã lưu thẻ vào Thẻ của tôi!");
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.error === 'You have already saved this flashcard') {
        setClonedIds(prev => new Set(prev).add(id));
        alert("Thẻ này đã có trong danh sách Thẻ Của Tôi rồi!");
      } else {
        console.error("Lỗi khi lưu thẻ:", err);
        alert("Đã xảy ra lỗi khi lưu thẻ.");
      }
    } finally {
      setCloning(false);
    }
  };

  // Only show published cards in the viewer
  const levelCards = flashcards.filter(c => c.level === selectedLevel && c.status === 'Published');
  const currentCard = levelCards[currentIndex];

  const jlptLevels = ['N5', 'N4', 'N3', 'N2', 'N1'];

  return (
    <div className="flashcard-content-area">
      <h1 className="flashcard-gradient-title">FLASH CARDS</h1>

      <div className="flashcard-tabs">
        <div className="flashcard-tab-container">
          <button 
            className={`fc-tab-btn ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            Thư viện thẻ
          </button>
          <button 
            className={`fc-tab-btn ${activeTab === 'mycards' ? 'active' : ''}`}
            onClick={() => setActiveTab('mycards')}
          >
            Thẻ của tôi
          </button>
        </div>
      </div>

      {activeTab === 'library' && (
        <div className="fc-library-section">
          {loading ? (
            <div className="fc-loading">Đang tải dữ liệu...</div>
          ) : !selectedLevel ? (
            <div className="fc-levels-grid">
              {jlptLevels.map((level) => {
                // Count published cards for this level
                const cardCount = flashcards.filter(c => c.level === level && c.status === 'Published').length;
                return (
                  <div key={level} className="fc-level-box" onClick={() => handleSelectLevel(level)}>
                    <div className="fc-level-title">{level}</div>
                    <div className="fc-level-count">{cardCount} từ vựng</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="fc-viewer-container">
              <button className="fc-back-btn" onClick={handleBackToLibrary}>
                &larr; Trở lại danh sách
              </button>
              
              {levelCards.length === 0 ? (
                <div className="fc-empty">Chưa có Flashcard nào cho cấp độ {selectedLevel}.</div>
              ) : (
                <>
                  <div className={`fc-card ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
                    <div className="fc-card-inner">
                      <div className="fc-card-front">
                        <div className="fc-card-text">{currentCard?.meaning}</div>
                        <div className="fc-card-hint">Nhấn để xem đáp án</div>
                      </div>
                      <div className="fc-card-back">
                        {currentCard?.jp && currentCard.jp.trim() !== '' && (
                          <div className="fc-card-text">{currentCard?.jp}</div>
                        )}
                        
                        {currentCard?.kana && (
                          <div className={currentCard?.jp && currentCard.jp.trim() !== '' ? "fc-kana-group" : ""}>
                            <div className={currentCard?.jp && currentCard.jp.trim() !== '' ? "fc-card-subtext" : "fc-card-text"}>
                              {currentCard?.kana}
                            </div>
                          </div>
                        )}
                        <div className="fc-card-hint">Nhấn để quay lại</div>
                      </div>
                    </div>
                  </div>

                  <div className="fc-controls">
                    <div className="fc-counter">
                      {currentIndex + 1}/{levelCards.length}
                    </div>
                    <div className="fc-nav-buttons">
                      <button 
                        className="fc-btn-clone" 
                        onClick={(e) => handleCloneCard(e, currentCard.id)}
                        disabled={cloning || clonedIds.has(currentCard.id)}
                        style={{
                          background: clonedIds.has(currentCard.id) ? '#10b981' : '#3b82f6',
                          color: 'white',
                          border: 'none',
                          padding: '10px 15px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          marginRight: '15px'
                        }}
                      >
                        {cloning ? 'Đang lưu...' : clonedIds.has(currentCard.id) ? '✓ Đã lưu' : '♥ Lưu thẻ'}
                      </button>

                      <button className="fc-btn-prev" onClick={handlePrev} disabled={currentIndex === 0}>
                        Trở lại
                      </button>
                      <button className="fc-btn-next" onClick={handleNext} disabled={currentIndex === levelCards.length - 1}>
                        Tiếp
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'mycards' && (
        <MyFlashcards />
      )}
    </div>
  );
};

export default FlashcardContent;
