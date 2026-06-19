import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X, Copy, Star, Plus } from 'lucide-react';
import flashcardApi from '../../api/flashcardApi';

const MyFlashcards = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ id: '', jp: '', kana: '', meaning: '', level: 'N5', status: 'Published' });
  
  // Delete confirm state
  const [itemToDelete, setItemToDelete] = useState(null);

  // Quizlet Export State
  const [isQuizletModalOpen, setIsQuizletModalOpen] = useState(false);
  const [quizletText, setQuizletText] = useState('');
  const [copied, setCopied] = useState(false);

  const filteredFlashcards = flashcards.filter(item => 
    (item.jp && item.jp.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (item.meaning && item.meaning.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.kana && item.kana.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const data = await flashcardApi.getMyCards();
      
      const sortedData = [...data].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      
      const mappedData = sortedData.map((card, index) => {
        let parsedNotes = {};
        try {
          if (card.notes) parsedNotes = JSON.parse(card.notes);
        } catch (e) {
          // ignore
        }
        return {
          id: card.id,
          displayId: parsedNotes.displayId || `M${String(index + 1).padStart(3, '0')}`,
          jp: card.frontText,
          meaning: card.backText,
          kana: parsedNotes.kana || '',
          level: parsedNotes.level || 'N5',
          status: parsedNotes.status || 'Published'
        };
      });
      
      mappedData.sort((a, b) => {
        const numA = parseInt(a.displayId.replace('M', ''), 10);
        const numB = parseInt(b.displayId.replace('M', ''), 10);
        return numB - numA; 
      });
      
      setFlashcards(mappedData);
    } catch (err) {
      console.error("Failed to fetch my flashcards", err);
      setError("Không thể tải danh sách thẻ của bạn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode('add');
    
    const existingNums = flashcards
      .map(c => parseInt(c.displayId.replace('M', ''), 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
      
    let nextNum = 1;
    for (let i = 0; i < existingNums.length; i++) {
      if (existingNums[i] === nextNum) {
        nextNum++;
      } else if (existingNums[i] > nextNum) {
        break; 
      }
    }

    setFormData({ 
      id: '',
      displayId: `M${String(nextNum).padStart(3, '0')}`,
      jp: '', kana: '', meaning: '', level: 'N5', status: 'Published' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const extraNotes = JSON.stringify({
      kana: formData.kana,
      level: formData.level,
      status: formData.status,
      displayId: formData.displayId
    });

    const payload = {
      frontText: formData.jp,
      backText: formData.meaning,
      notes: extraNotes
    };

    try {
      if (modalMode === 'add') {
        await flashcardApi.createMyCard(payload);
      } else {
        await flashcardApi.updateMyCard(formData.id, payload);
      }
      setIsModalOpen(false);
      fetchFlashcards(); 
    } catch (err) {
      console.error("Failed to save flashcard", err);
      alert("Đã xảy ra lỗi khi lưu Flashcard!");
    }
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await flashcardApi.deleteMyCard(itemToDelete.id);
      setItemToDelete(null);
      fetchFlashcards(); 
    } catch (err) {
      console.error("Failed to delete flashcard", err);
      alert("Đã xảy ra lỗi khi xóa Flashcard!");
    }
  };

  const handleExportQuizlet = async () => {
    try {
      const text = await flashcardApi.exportMyCardsQuizlet();
      setQuizletText(text);
      setCopied(false);
      setIsQuizletModalOpen(true);
    } catch (err) {
      console.error("Failed to export to Quizlet", err);
      alert("Đã xảy ra lỗi khi xuất dữ liệu!");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quizletText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fc-mycards-section">
      <div style={{ position: 'absolute', top: '40px', right: '40px', zIndex: 10 }}>
        <button className="fc-export-btn-new" onClick={handleExportQuizlet}>
          Xuất sang Quizlet
        </button>
      </div>

      <div className="admin-content-card" style={{ background: 'transparent', boxShadow: 'none', padding: 0 }}>
        <div style={{ marginBottom: '30px' }}>
          <div className="fc-search-container">
            <Search size={20} color="#94a3b8" />
            <input 
              className="fc-search-input"
              type="text" 
              placeholder="Tìm kiếm Thẻ của tôi..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="fc-loading">Đang tải thẻ...</div>
          ) : error ? (
            <div className="error-message" style={{ color: 'red', textAlign: 'center', padding: '20px' }}>
              {error}
              <div style={{ marginTop: '10px', fontSize: '14px', color: '#64748b' }}>
                Gợi ý: Hãy thử đăng xuất và đăng nhập lại.
              </div>
            </div>
          ) : (
            <div>
              <div className="fc-mycards-grid">
                {filteredFlashcards.map(item => (
                  <div className="fc-mycard-item" key={item.id} onClick={() => handleOpenEditModal(item)}>
                    <div className="fc-mycard-top">
                      <div className="fc-mycard-jp">{item.jp}</div>
                      <Star className="fc-mycard-star" size={16} fill="#3b0764" color="#3b0764" />
                    </div>
                    <div className="fc-mycard-kana">{item.kana}</div>
                    <div className="fc-mycard-meaning">{item.meaning}</div>
                    <div className="fc-mycard-divider"></div>
                    <button className="fc-mycard-delete" onClick={(e) => { e.stopPropagation(); setItemToDelete(item); }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              {filteredFlashcards.length === 0 && (
                <div className="fc-empty">Bạn chưa tạo Flashcard nào.</div>
              )}
            </div>
          )}
          
          <button className="fc-mycard-fab" onClick={handleOpenAddModal} title="Thêm thẻ mới">
            <Plus size={24} />
          </button>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fc-modal-overlay">
          <div className="fc-modal-box">
            <div className="fc-modal-header">
              <h2>{modalMode === 'add' ? 'THÊM THẺ' : 'CHỈNH SỬA THẺ'}</h2>
              <button className="fc-modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="fc-modal-form">
              <div className="fc-modal-group">
                <input 
                  type="text" 
                  value={formData.jp} 
                  onChange={e => setFormData({...formData, jp: e.target.value})} 
                  className="fc-modal-input" 
                  placeholder="Từ"
                />
              </div>
              <div className="fc-modal-group">
                <input 
                  type="text" 
                  value={formData.kana} 
                  onChange={e => setFormData({...formData, kana: e.target.value})} 
                  className="fc-modal-input" 
                  required 
                  placeholder="Cách đọc"
                />
              </div>
              <div className="fc-modal-group">
                <input 
                  type="text" 
                  value={formData.meaning} 
                  onChange={e => setFormData({...formData, meaning: e.target.value})} 
                  className="fc-modal-input" 
                  required 
                  placeholder="Nghĩa"
                />
              </div>

              {/* Hide the level and displayId inputs to keep UI clean, but still submit them */}
              <input type="hidden" value={formData.level} />
              <input type="hidden" value={formData.displayId} />

              <div className="fc-modal-actions">
                <button type="button" className="fc-btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className="fc-btn-submit">
                  {modalMode === 'add' ? 'Tạo' : 'Lưu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fc-modal-overlay">
          <div className="fc-modal-box" style={{ maxWidth: '400px' }}>
            <div className="fc-modal-header">
              <h2 style={{ color: '#ef4444' }}>Xóa thẻ</h2>
            </div>
            <p style={{ marginBottom: '30px', color: '#64748b', fontSize: '16px', lineHeight: '1.5' }}>
              Bạn có chắc chắn muốn xóa thẻ <strong>"{itemToDelete.jp}"</strong> không? Hành động này không thể hoàn tác.
            </p>
            <div className="fc-modal-actions">
              <button className="fc-btn-cancel" onClick={() => setItemToDelete(null)}>Hủy</button>
              <button className="fc-btn-submit" style={{ background: '#ef4444' }} onClick={executeDelete}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* QUIZLET EXPORT MODAL */}
      {isQuizletModalOpen && (
        <div className="fc-modal-overlay">
          <div className="fc-modal-box" style={{ maxWidth: '600px' }}>
            <div className="fc-modal-header">
              <h2>Xuất sang Quizlet</h2>
              <button className="fc-modal-close-btn" onClick={() => setIsQuizletModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body-form">
              <p style={{ marginBottom: '15px', color: '#64748b' }}>
                Copy đoạn văn bản dưới đây và dán vào phần <strong>Nhập từ Word, Excel, Google Docs, v.v.</strong> khi tạo Học phần mới trên Quizlet.
              </p>
              
              <div style={{ position: 'relative' }}>
                <textarea 
                  readOnly 
                  value={quizletText} 
                  style={{
                    width: '100%',
                    height: '250px',
                    backgroundColor: '#f8fafc',
                    color: '#1e293b',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    fontFamily: 'monospace',
                    resize: 'none'
                  }}
                />
                
                {quizletText && (
                  <button 
                    onClick={copyToClipboard}
                    style={{
                      position: 'absolute',
                      bottom: '15px',
                      right: '15px',
                      backgroundColor: copied ? '#10b981' : '#c084fc',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontWeight: 'bold',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <Copy size={16} />
                    {copied ? 'Đã Copy!' : 'Copy Text'}
                  </button>
                )}
              </div>
              
              {quizletText === '' && (
                <div style={{ color: '#ef4444', marginTop: '10px' }}>
                  Bạn chưa có thẻ cá nhân nào để xuất!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFlashcards;
