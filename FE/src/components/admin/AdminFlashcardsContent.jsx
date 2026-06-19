import React, { useState, useEffect } from 'react';
import { Search, Plus, ArrowLeft, Trash2, Edit2, X, Star, Layers } from 'lucide-react';
import flashcardApi from '../../api/flashcardApi';
import './AdminFlashcardsContent.css';

const AdminFlashcardsContent = () => {
  const [activeView, setActiveView] = useState('decks'); // 'decks' | 'cards'
  const [selectedDeck, setSelectedDeck] = useState(null);
  
  // Data states
  const [decks, setDecks] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  
  // Form states
  const [deckForm, setDeckForm] = useState({ id: '', name: '', description: '' });
  const [cardForm, setCardForm] = useState({ id: '', jp: '', kana: '', meaning: '', level: 'N5', status: 'PUBLISHED' });
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Decks
  const fetchDecks = async () => {
    try {
      setLoading(true);
      const data = await flashcardApi.getDecks();
      setDecks(data);
    } catch (err) {
      console.error("Failed to fetch decks", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Cards for a Deck
  const fetchCards = async (deckId) => {
    try {
      setLoading(true);
      const data = await flashcardApi.getAll({ deckId });
      setFlashcards(data);
    } catch (err) {
      console.error("Failed to fetch cards", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'decks') {
      fetchDecks();
    } else if (activeView === 'cards' && selectedDeck) {
      fetchCards(selectedDeck.id);
    }
  }, [activeView, selectedDeck]);

  // --- Handlers for Decks ---
  const handleDeckClick = (deck) => {
    setSelectedDeck(deck);
    setActiveView('cards');
    setSearchTerm('');
  };

  const handleOpenDeckModal = (mode, deck = null) => {
    setModalMode(mode);
    if (mode === 'edit' && deck) {
      setDeckForm({ id: deck.id, name: deck.name, description: deck.description || '' });
    } else {
      setDeckForm({ id: '', name: '', description: '' });
    }
    setIsDeckModalOpen(true);
  };

  const handleDeckSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modalMode === 'add') {
        await flashcardApi.createDeck({ name: deckForm.name, description: deckForm.description });
      } else {
        await flashcardApi.updateDeck(deckForm.id, { name: deckForm.name, description: deckForm.description });
      }
      setIsDeckModalOpen(false);
      fetchDecks();
    } catch (err) {
      console.error("Failed to save deck", err);
      alert("Đã xảy ra lỗi khi lưu bộ Flashcard!");
    }
  };

  const handleDeleteDeck = async (id, e) => {
    e.stopPropagation(); // Prevent opening the deck
    if (!window.confirm('Bạn có chắc chắn muốn xóa bộ Flashcard này? Toàn bộ thẻ bên trong cũng sẽ bị xóa.')) return;
    try {
      await flashcardApi.deleteDeck(id);
      fetchDecks();
    } catch (err) {
      console.error("Failed to delete deck", err);
    }
  };

  // --- Handlers for Cards ---
  const handleOpenCardModal = (mode, card = null) => {
    setModalMode(mode);
    if (mode === 'edit' && card) {
      setCardForm({
        id: card.id,
        jp: card.japaneseWord,
        kana: card.pronunciation,
        meaning: card.meaningVi,
        level: card.level || 'N5',
        status: card.status || 'PUBLISHED'
      });
    } else {
      setCardForm({ id: '', jp: '', kana: '', meaning: '', level: 'N5', status: 'PUBLISHED' });
    }
    setIsCardModalOpen(true);
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        deckId: selectedDeck.id,
        level: cardForm.level,
        japaneseWord: cardForm.jp,
        pronunciation: cardForm.kana,
        meaningVi: cardForm.meaning,
        status: cardForm.status
      };
      if (modalMode === 'add') {
        await flashcardApi.create(payload);
      } else {
        await flashcardApi.update(cardForm.id, payload);
      }
      setIsCardModalOpen(false);
      fetchCards(selectedDeck.id);
    } catch (err) {
      console.error("Failed to save card", err);
      alert("Đã xảy ra lỗi khi lưu thẻ!");
    }
  };

  const handleDeleteCard = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ này?')) return;
    try {
      await flashcardApi.delete(id);
      fetchCards(selectedDeck.id);
    } catch (err) {
      console.error("Failed to delete card", err);
    }
  };

  // --- Filtering ---
  const filteredDecks = decks.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCards = flashcards.filter(c => 
    (c.japaneseWord && c.japaneseWord.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.meaningVi && c.meaningVi.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="admin-fc-container">
      {/* Header */}
      <div className="admin-fc-header">
        {activeView === 'cards' && (
          <button className="back-btn" onClick={() => setActiveView('decks')}>
            <ArrowLeft size={24} />
          </button>
        )}
        <div className="admin-fc-title-group">
          <h1>Flash Card {activeView === 'cards' && ` - ${selectedDeck?.name}`}</h1>
          <p>Japanese vocabulary deck with spaced-repetition tracking.</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-fc-main">
        {/* Search */}
        <div className="admin-fc-search-wrapper">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder={activeView === 'decks' ? "Tìm kiếm bộ flashcard..." : "Tìm kiếm thẻ từ vựng..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="loading-state">Đang tải dữ liệu...</div>
        ) : (
          <>
            {/* DECKS VIEW */}
            {activeView === 'decks' && (
              <div className="decks-grid">
                {filteredDecks.map(deck => (
                  <div key={deck.id} className="deck-card" onClick={() => handleDeckClick(deck)}>
                    <div className="deck-card-content">
                      <div className="deck-card-header">
                        <div className="deck-icon-wrapper">
                          <Layers size={24} className="deck-icon" />
                        </div>
                        <div className="deck-count">{deck.totalCards || 0} thẻ</div>
                      </div>
                      <div className="deck-info">
                        <h3 className="deck-name">{deck.name}</h3>
                        {deck.description && <p className="deck-description">{deck.description}</p>}
                      </div>
                    </div>
                    <div className="deck-actions">
                      <button className="icon-btn edit" onClick={(e) => { e.stopPropagation(); handleOpenDeckModal('edit', deck); }}><Edit2 size={16} /></button>
                      <button className="icon-btn delete" onClick={(e) => handleDeleteDeck(deck.id, e)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {filteredDecks.length === 0 && <div className="empty-state">Chưa có bộ Flashcard nào</div>}
              </div>
            )}

            {/* CARDS VIEW */}
            {activeView === 'cards' && (
              <div className="cards-grid">
                {filteredCards.map(card => (
                  <div key={card.id} className="flashcard-item">
                    <div className="fc-top">
                      <div className="fc-badges">
                        <span className={`fc-level-badge ${card.level ? card.level.toLowerCase() : 'n5'}`}>{card.level || 'N5'}</span>
                        {card.status === 'DRAFT' && <span className="fc-status-badge draft">Nháp</span>}
                      </div>
                      <button className="icon-btn star"><Star size={18} color="#eab308" fill={card.status === 'PUBLISHED' ? "#eab308" : "none"} /></button>
                    </div>
                    <div className="fc-word-section">
                      <span className="fc-word">{card.japaneseWord}</span>
                    </div>
                    <div className="fc-divider"></div>
                    <div className="fc-details">
                      <div className="fc-detail-row">
                        <span className="fc-detail-label">Phiên âm</span>
                        <span className="fc-kana">{card.pronunciation}</span>
                      </div>
                      <div className="fc-detail-row">
                        <span className="fc-detail-label">Ý nghĩa</span>
                        <span className="fc-meaning">{card.meaningVi}</span>
                      </div>
                    </div>
                    <div className="fc-actions">
                      <button className="icon-btn edit" onClick={() => handleOpenCardModal('edit', card)}><Edit2 size={16} /></button>
                      <button className="icon-btn delete" onClick={() => handleDeleteCard(card.id)}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
                {filteredCards.length === 0 && <div className="empty-state">Chưa có thẻ nào trong bộ này</div>}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        className="admin-fc-fab"
        onClick={() => activeView === 'decks' ? handleOpenDeckModal('add') : handleOpenCardModal('add')}
      >
        <Plus size={28} />
      </button>

      {/* DECK MODAL */}
      {isDeckModalOpen && (
        <div className="admin-fc-modal-overlay">
          <div className="admin-fc-modal">
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Create New Flashcard Deck' : 'Edit Flashcard Deck'}</h2>
              <button className="close-btn" onClick={() => setIsDeckModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleDeckSubmit}>
              <div className="form-group">
                <label>Tên bộ flash card</label>
                <input 
                  type="text" 
                  value={deckForm.name} 
                  onChange={e => setDeckForm({...deckForm, name: e.target.value})} 
                  required 
                  placeholder="Nhập tên bộ thẻ..."
                />
              </div>
              <div className="form-group">
                <label>Mô tả (tùy chọn)</label>
                <input 
                  type="text" 
                  value={deckForm.description} 
                  onChange={e => setDeckForm({...deckForm, description: e.target.value})} 
                  placeholder="Mô tả bộ thẻ..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsDeckModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-submit">{modalMode === 'add' ? 'Tạo' : 'Lưu'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CARD MODAL */}
      {isCardModalOpen && (
        <div className="admin-fc-modal-overlay">
          <div className="admin-fc-modal">
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Create New Card' : 'Edit Card'}</h2>
              <button className="close-btn" onClick={() => setIsCardModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCardSubmit}>
              <div className="form-group-row">
                <div className="form-group">
                  <label>Từ (Kanji)</label>
                  <input 
                    type="text" 
                    value={cardForm.jp} 
                    onChange={e => setCardForm({...cardForm, jp: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Cách đọc (Hiragana)</label>
                  <input 
                    type="text" 
                    value={cardForm.kana} 
                    onChange={e => setCardForm({...cardForm, kana: e.target.value})} 
                    required 
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Nghĩa</label>
                <input 
                  type="text" 
                  value={cardForm.meaning} 
                  onChange={e => setCardForm({...cardForm, meaning: e.target.value})} 
                  required 
                />
              </div>
              
              {/* Keeping old functionalities hidden or integrated if needed. Here we add them back smoothly */}
              <div className="form-group-row">
                <div className="form-group">
                  <label>Cấp độ JLPT</label>
                  <select value={cardForm.level} onChange={e => setCardForm({...cardForm, level: e.target.value})}>
                    <option value="N5">N5</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="N1">N1</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select value={cardForm.status} onChange={e => setCardForm({...cardForm, status: e.target.value})}>
                    <option value="PUBLISHED">Đã xuất bản</option>
                    <option value="DRAFT">Lưu nháp</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setIsCardModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn-submit">{modalMode === 'add' ? 'Create New Card' : 'Save Card'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminFlashcardsContent;
