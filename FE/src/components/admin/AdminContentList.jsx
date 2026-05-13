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
        const sortedData = (data || []).sort((a, b) => (b.order || 0) - (a.order || 0));
        setContentList(sortedData);
      } catch (error) {
        console.error("Lỗi tải bài học:", error);
        setContentList(INITIAL_MOCK_CONTENT); // Tạm dùng dữ liệu giả nếu lỗi
      }
    };
    fetchLessons();
  }, []);
  
  // Modal states
  // Removed old modal states
  
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
    navigate('/admin/content/create', { state: { editMode: true, lessonData: item } });
  };

  const executeDelete = async () => {
    try {
      if (itemToDelete && itemToDelete.id) {
        await lessonApi.delete(itemToDelete.id);
        setContentList(contentList.filter(item => item.id !== itemToDelete.id));
        alert('Xóa bài học thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi xóa bài học:', error);
      alert('Có lỗi xảy ra khi xóa bài học. Vui lòng thử lại.');
    } finally {
      setItemToDelete(null);
    }
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
