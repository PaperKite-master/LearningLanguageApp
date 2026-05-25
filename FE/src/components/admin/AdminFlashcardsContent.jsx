import React, { useState } from 'react';
import { Search, Edit2, Trash2, X } from 'lucide-react';

const INITIAL_MOCK_FLASHCARDS = [
  { id: 'F001', jp: 'コンピュータ', kana: 'こんぴゅーた', meaning: 'Máy tính', level: 'N5', status: 'Published' },
  { id: 'F002', jp: 'プログラム', kana: 'ぷろぐらむ', meaning: 'Chương trình', level: 'N5', status: 'Published' },
  { id: 'F003', jp: 'データベース', kana: 'でーたべーす', meaning: 'Database', level: 'N5', status: 'Draft' },
  { id: 'F004', jp: '実装する', kana: 'じっそうする', meaning: 'Để thực hiện (Implement)', level: 'N5', status: 'Draft' }
];

const AdminFlashcardsContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [flashcards, setFlashcards] = useState(INITIAL_MOCK_FLASHCARDS);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({ id: '', jp: '', kana: '', meaning: '', level: 'N5', status: 'Draft' });
  
  // Delete confirm state
  const [itemToDelete, setItemToDelete] = useState(null);

  const filteredFlashcards = flashcards.filter(item => 
    item.jp.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kana.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({ 
      id: `F00${flashcards.length + 1}`,
      jp: '', kana: '', meaning: '', level: 'N5', status: 'Draft' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      setFlashcards([...flashcards, formData]);
    } else {
      setFlashcards(flashcards.map(item => item.id === formData.id ? formData : item));
    }
    setIsModalOpen(false);
  };

  const executeDelete = () => {
    setFlashcards(flashcards.filter(item => item.id !== itemToDelete.id));
    setItemToDelete(null);
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
                  <td className="col-id" style={{ color: '#9ca3af', fontFamily: 'monospace' }}>{item.id}</td>
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
                <div className="form-group">
                  <label>Mã thẻ (ID)</label>
                  <input type="text" value={formData.id} disabled className="modal-input disabled-input" />
                </div>
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
