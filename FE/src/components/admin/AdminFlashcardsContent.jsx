import React, { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X } from 'lucide-react';
import flashcardApi from '../../api/flashcardApi';

const AdminFlashcardsContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ id: '', jp: '', kana: '', meaning: '', level: 'N5', status: 'Draft' });
  
  // Delete confirm state
  const [itemToDelete, setItemToDelete] = useState(null);

  const filteredFlashcards = flashcards.filter(item => 
    (item.jp && item.jp.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (item.meaning && item.meaning.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.kana && item.kana.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const data = await flashcardApi.getAll();
      
      // Sort data by createdAt ascending (oldest first)
      const sortedData = [...data].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      
      // Map BE schema to FE schema and use saved displayId if available
      const mappedData = sortedData.map((card, index) => {
        let parsedNotes = {};
        try {
          if (card.notes) parsedNotes = JSON.parse(card.notes);
        } catch (e) {
          // If notes is not valid JSON, ignore
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
      
      // Sort by displayId descending so that gap-filled IDs appear in their correct numerical position
      mappedData.sort((a, b) => {
        const numA = parseInt(a.displayId.replace('F', ''), 10);
        const numB = parseInt(b.displayId.replace('F', ''), 10);
        return numB - numA; // Largest first (e.g., F004, F003, F002, F001)
      });
      
      setFlashcards(mappedData);
    } catch (err) {
      console.error("Failed to fetch flashcards", err);
      setError("Không thể tải danh sách Flashcard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const handleOpenAddModal = () => {
    setModalMode('add');
    
    // Gap-filling logic: find the lowest missing number
    const existingNums = flashcards
      .map(c => parseInt(c.displayId.replace('F', ''), 10))
      .filter(n => !isNaN(n))
      .sort((a, b) => a - b);
      
    let nextNum = 1;
    for (let i = 0; i < existingNums.length; i++) {
      if (existingNums[i] === nextNum) {
        nextNum++;
      } else if (existingNums[i] > nextNum) {
        break; // found the lowest missing gap
      }
    }

    setFormData({ 
      id: '',
      displayId: `F${String(nextNum).padStart(3, '0')}`,
      jp: '', kana: '', meaning: '', level: 'N5', status: 'Draft' 
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
    
    // Pack extra fields into JSON for the 'notes' field, including the permanent displayId
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
        await flashcardApi.create(payload);
      } else {
        await flashcardApi.update(formData.id, payload);
      }
      setIsModalOpen(false);
      fetchFlashcards(); // Refresh list after success
    } catch (err) {
      console.error("Failed to save flashcard", err);
      alert("Đã xảy ra lỗi khi lưu Flashcard!");
    }
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      await flashcardApi.delete(itemToDelete.id);
      setItemToDelete(null);
      fetchFlashcards(); // Refresh list after deletion
    } catch (err) {
      console.error("Failed to delete flashcard", err);
      alert("Đã xảy ra lỗi khi xóa Flashcard!");
    }
  };

  return (
    <div className="admin-content-area">
      <div className="admin-header flex-header">
        <h1 className="admin-heading">QUẢN LÝ FLASHCARD</h1>
        <button className="admin-btn-primary" onClick={handleOpenAddModal}>
          + Thêm thẻ mới
        </button>
      </div>

      <div className="admin-panel-container">
        
        {/* Search Bar */}
        <div className="admin-search-wrapper">
          <Search size={20} className="admin-search-icon" color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Tìm kiếm Flashcard..." 
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Data Table */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Đang tải dữ liệu Flashcard...</div>
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
                <th>Trạng thái</th>
                <th></th> {/* For Actions */}
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
                  <td className="col-status">
                    <span className={`status-badge status-${item.status.toLowerCase()}`}>
                      {item.status}
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
            <div className="no-data-msg">Không tìm thấy thẻ Flashcard phù hợp</div>
          )}
        </div>
        )}
        
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Thêm Flashcard Mới' : 'Chỉnh Sửa Flashcard'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body-form">
              <div className="form-group-row">
                {modalMode === 'edit' && (
                  <div className="form-group">
                    <label>Mã thẻ (ID)</label>
                    <input type="text" value={formData.displayId} disabled className="modal-input disabled-input" />
                  </div>
                )}
                <div className="form-group">
                  <label>Cấp độ</label>
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

              <div className="form-group">
                <label>Trạng thái</label>
                <div className="status-radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Published" 
                      checked={formData.status === 'Published'}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    /> Đang hoạt động (Published)
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Draft" 
                      checked={formData.status === 'Draft'}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    /> Lưu nháp (Draft)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="admin-btn-primary">
                  {modalMode === 'add' ? 'Lưu Thẻ Nhớ' : 'Lưu Thay Đổi'}
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
    </div>
  );
};

export default AdminFlashcardsContent;
