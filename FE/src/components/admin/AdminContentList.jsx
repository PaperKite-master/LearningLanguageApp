import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Trash2, X } from 'lucide-react';
import lessonApi from '../../api/lessonApi';

const INITIAL_MOCK_CONTENT = [
  { id: 'L001', title: 'Luyện gõ chữ Hiragana', topic: 'Hiragana', level: 'N5', category: 'Bảng chữ cái', status: 'Published' },
  { id: 'L002', title: 'Ngữ pháp cơ bản: は・が・を', topic: 'Trợ từ', level: 'N5', category: 'Ngữ pháp', status: 'Published' },
  { id: 'L003', title: 'Từ vựng IT : Hardware', topic: 'Từ vựng', level: 'N5', category: 'Từ vựng', status: 'Draft' },
  { id: 'L004', title: 'Thuật ngữ phần mềm', topic: 'Từ vựng', level: 'N5', category: 'Từ vựng', status: 'Draft' }
];

const AdminContentList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [contentList, setContentList] = useState([]);
  
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const data = await lessonApi.getAll();
        const sortedData = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setContentList(sortedData);
      } catch (error) {
        console.error("Lỗi tải bài học:", error);
        setContentList(INITIAL_MOCK_CONTENT); // Tạm dùng dữ liệu giả nếu lỗi
      }
    };
    fetchLessons();
  }, []);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [formData, setFormData] = useState({ id: '', title: '', topic: '', level: 'N5', category: 'Từ vựng', status: 'Draft' });
  
  // Delete confirm state
  const [itemToDelete, setItemToDelete] = useState(null);

  const filteredContent = contentList.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleOpenAddModal = () => {
    navigate('/admin/content/create');
  };

  const handleOpenEditModal = (item) => {
    setModalMode('edit');
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'add') {
      setContentList([...contentList, formData]);
    } else {
      setContentList(contentList.map(item => item.id === formData.id ? formData : item));
    }
    setIsModalOpen(false);
  };

  const executeDelete = () => {
    setContentList(contentList.filter(item => item.id !== itemToDelete.id));
    setItemToDelete(null);
  };

  return (
    <div className="admin-content-area">
      <div className="admin-header flex-header">
        <h1 className="admin-heading">QUẢN LÝ NỘI DUNG BÀI HỌC</h1>
        <button className="admin-btn-primary" onClick={handleOpenAddModal}>
          + Thêm bài học mới
        </button>
      </div>

      <div className="admin-panel-container">
        
        {/* Search Bar */}
        <div className="admin-search-wrapper">
          <Search size={20} className="admin-search-icon" color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Tìm kiếm nội dung bài học..." 
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
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Chủ đề</th>
                <th>Cấp độ</th>
                <th>Phân loại</th>
                <th>Trạng thái</th>
                <th></th> {/* For Actions */}
              </tr>
            </thead>
            <tbody>
              {filteredContent.map((item) => (
                <tr key={item.id}>
                  <td className="col-id">
                    {item.order ? `L${String(item.order).padStart(3, '0')}` : item.id.substring(0, 8)}
                  </td>
                  <td className="col-name">{item.title}</td>
                  <td className="col-email">{item.topic || 'Chưa có'}</td>
                  
                  <td className="col-role">
                    <span className="role-badge role-level">
                      {item.level || 'N5'}
                    </span>
                  </td>
                  
                  <td className="col-category">
                    <span className="category-text">{item.category || 'Bài học'}</span>
                  </td>
                  
                  <td className="col-status">
                    <span className={`status-badge status-${(item.status || 'draft').toLowerCase()}`}>
                      {item.status || 'Draft'}
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
          
          {filteredContent.length === 0 && (
            <div className="no-data-msg">Không tìm thấy bài học phù hợp</div>
          )}
        </div>
        
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Thêm Bài Học Mới' : 'Chỉnh Sửa Bài Học'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label>Mã bài học (ID)</label>
                  <input type="text" value={formData.id} disabled className="modal-input disabled-input" />
                </div>
                <div className="form-group">
                  <label>Chủ đề</label>
                  <input 
                    type="text" 
                    value={formData.topic} 
                    onChange={e => setFormData({...formData, topic: e.target.value})} 
                    className="modal-input" 
                    required 
                    placeholder="VD: Từ vựng, Trợ từ..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tiêu đề bài học</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="modal-input" 
                  required 
                  placeholder="VD: Luyện gõ chữ Hiragana"
                />
              </div>

              <div className="form-group-row">
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
                <div className="form-group">
                  <label>Phân loại</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})} 
                    className="modal-input"
                  >
                    <option value="Bảng chữ cái">Bảng chữ cái</option>
                    <option value="Từ vựng">Từ vựng</option>
                    <option value="Ngữ pháp">Ngữ pháp</option>
                    <option value="Kanji">Kanji</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Trạng thái hiển thị</label>
                <div className="status-radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="status" 
                      value="Published" 
                      checked={formData.status === 'Published'}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    /> Thuận phát (Published)
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
                  {modalMode === 'add' ? 'Tạo Bài Học' : 'Lưu Thay Đổi'}
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
            <h2 className="delete-title">Xác nhận xóa khóa học</h2>
            <p>Bạn có chắc chắn muốn xóa bài học <strong>"{itemToDelete.title}"</strong> không? Hành động này không thể hoàn tác.</p>
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

export default AdminContentList;
