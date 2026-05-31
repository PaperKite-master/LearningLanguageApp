import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X, Copy } from 'lucide-react';
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
    <div style={{ width: '100%' }}>
      <div className="fc-mycards-header" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <button className="fc-export-btn" onClick={handleExportQuizlet}>Xuất qua Quizlet</button>
      </div>

      <div className="admin-content-area" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
        <div className="admin-header flex-header" style={{ marginBottom: '15px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white' }}>Thẻ cá nhân của bạn</h2>
          <button className="admin-btn-primary" onClick={handleOpenAddModal} style={{ background: '#3b82f6' }}>
            + Thêm thẻ mới
          </button>
        </div>

        <div className="admin-panel-container">
          
          {/* Search Bar */}
          <div className="admin-search-wrapper">
            <Search size={20} className="admin-search-icon" color="#9ca3af" />
            <input 
              type="text" 
              placeholder="Tìm kiếm thẻ cá nhân..." 
              className="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Data Table */}
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Đang tải thẻ của bạn...</div>
          ) : error ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>{error}</div>
          ) : (
          <div className="admin-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Mã thẻ</th>
                  <th style={{ textAlign: 'center' }}>Tiếng Nhật</th>
                  <th>Phát âm (Hiragana)</th>
                  <th>Nghĩa Tiếng Việt</th>
                  <th>Cấp độ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredFlashcards.map((item) => (
                  <tr key={item.id}>
                    <td className="col-id" style={{ color: '#9ca3af', fontFamily: 'monospace' }}>{item.displayId}</td>
                    <td className="col-name" style={{ textAlign: 'center' }}>{item.jp}</td>
                    <td className="col-email">{item.kana}</td>
                    <td className="col-category">
                      <span className="category-text">{item.meaning}</span>
                    </td>
                    <td className="col-role">
                      <span className="role-badge role-level">
                        {item.level}
                      </span>
                    </td>
                    
                    <td className="col-action col-action-group">
                      <button className="icon-action-btn edit-btn" title="Chỉnh sửa" onClick={() => handleOpenEditModal(item)}>
                        <Edit2 size={18} />
                      </button>
                      <button className="icon-action-btn delete-btn" title="Xóa" onClick={() => setItemToDelete(item)}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredFlashcards.length === 0 && (
              <div className="no-data-msg">Bạn chưa tạo Flashcard nào.</div>
            )}
          </div>
          )}
          
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Thêm Thẻ Cá Nhân' : 'Chỉnh Sửa Thẻ'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label>Mã thẻ (Tự động)</label>
                  <input type="text" value={formData.displayId} disabled className="modal-input disabled-input" />
                </div>
                <div className="form-group">
                  <label>Cấp độ (Mục tiêu)</label>
                  <select 
                    value={formData.level} 
                    onChange={e => setFormData({...formData, level: e.target.value})} 
                    className="modal-input"
                  >
                    <option value="N5">JLPT N5</option>
                    <option value="N4">JLPT N4</option>
                    <option value="N3">JLPT N3</option>
                    <option value="N2">JLPT N2</option>
                    <option value="N1">JLPT N1</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Tiếng Nhật (Kanji/Kana)</label>
                  <input 
                    type="text" 
                    value={formData.jp} 
                    onChange={e => setFormData({...formData, jp: e.target.value})} 
                    className="modal-input" 
                    required 
                    placeholder="VD: コンピュータ"
                  />
                </div>
                <div className="form-group">
                  <label>Phát âm (Hiragana)</label>
                  <input 
                    type="text" 
                    value={formData.kana} 
                    onChange={e => setFormData({...formData, kana: e.target.value})} 
                    className="modal-input" 
                    required 
                    placeholder="VD: こんぴゅーた"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Nghĩa Tiếng Việt</label>
                <input 
                  type="text" 
                  value={formData.meaning} 
                  onChange={e => setFormData({...formData, meaning: e.target.value})} 
                  className="modal-input" 
                  required 
                  placeholder="VD: Máy tính"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="admin-btn-primary" style={{ background: '#3b82f6' }}>
                  {modalMode === 'add' ? 'Lưu Thẻ Cá Nhân' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box delete-confirm-box">
            <h2 className="delete-title">Xác nhận xóa Flashcard</h2>
            <p>Bạn có chắc chắn muốn xóa thẻ từ vựng <strong>"{itemToDelete.jp}"</strong> không? Hành động này không thể hoàn tác.</p>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setItemToDelete(null)}>Hủy bỏ</button>
              <button className="modal-btn-danger" onClick={executeDelete}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}

      {/* QUIZLET EXPORT MODAL */}
      {isQuizletModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Xuất sang Quizlet</h2>
              <button className="modal-close-btn" onClick={() => setIsQuizletModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body-form">
              <p style={{ marginBottom: '15px', color: '#9ca3af' }}>
                Copy đoạn văn bản dưới đây và dán vào phần <strong>Nhập từ Word, Excel, Google Docs, v.v.</strong> khi tạo Học phần mới trên Quizlet.
              </p>
              
              <div style={{ position: 'relative' }}>
                <textarea 
                  readOnly 
                  value={quizletText} 
                  style={{
                    width: '100%',
                    height: '250px',
                    backgroundColor: '#1f2937',
                    color: '#e5e7eb',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #374151',
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
                      backgroundColor: copied ? '#10b981' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      padding: '8px 12px',
                      borderRadius: '4px',
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
