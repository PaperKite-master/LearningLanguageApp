import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Trash2 } from 'lucide-react';
import grammarApi from '../../api/grammarApi';

const AdminGrammarsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [grammarsList, setGrammarsList] = useState([]);
  const [lessonsMap, setLessonsMap] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [grammarsData, lessonsData] = await Promise.all([
          grammarApi.getAll(),
          import('../../api/lessonApi').then(m => m.default.getAll())
        ]);
        
        setGrammarsList(grammarsData || []);
        
        if (lessonsData) {
          const lMap = {};
          lessonsData.forEach(l => {
            lMap[l.id] = {
              title: l.title,
              lessonCode: l.lessonCode
            };
          });
          setLessonsMap(lMap);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu ngữ pháp:", error);
      }
    };
    fetchData();
  }, []);
  
  const filteredGrammars = grammarsList.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.lessonId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    navigate('/admin/content/create', { state: { initialContentType: 'grammar' } });
  };

  const handleOpenEditModal = (item) => {
    navigate('/admin/content/create', { 
      state: { 
        editMode: true, 
        initialContentType: 'grammar',
        lessonData: item 
      } 
    });
  };

  const executeDelete = async () => {
    try {
      if (itemToDelete && itemToDelete.id) {
        await grammarApi.delete(itemToDelete.id);
        setGrammarsList(grammarsList.filter(item => item.id !== itemToDelete.id));
        alert('Xóa ngữ pháp thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi xóa ngữ pháp:', error);
      alert('Có lỗi xảy ra khi xóa ngữ pháp. Vui lòng thử lại.');
    } finally {
      setItemToDelete(null);
    }
  };

  return (
    <div className="admin-content-area" style={{ paddingTop: 0 }}>
      <div className="admin-header flex-header" style={{ padding: '0 0 20px 0' }}>
        <h1 className="admin-heading" style={{ margin: 0 }}>QUẢN LÝ NGỮ PHÁP</h1>
        <button className="admin-btn-primary" onClick={handleOpenAddModal}>
          + Thêm ngữ pháp mới
        </button>
      </div>

      <div className="admin-panel-container">
        
        {/* Search Bar */}
        <div className="admin-search-wrapper">
          <Search size={20} className="admin-search-icon" color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Tìm kiếm ngữ pháp hoặc theo Mã bài học..." 
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
                <th>Tiêu đề Ngữ Pháp</th>
                <th>Thuộc Bài Học (Lesson ID)</th>
                <th>Order</th>
                <th>Trạng thái</th>
                <th></th> {/* For Actions */}
              </tr>
            </thead>
            <tbody>
              {filteredGrammars.map((item) => (
                <tr key={item.id}>
                  <td className="col-name">{item.title}</td>
                  <td style={{ color: '#9ca3af', fontSize: '0.95rem', minWidth: '220px' }}>
                    {lessonsMap[item.lessonId] ? 
                      `${lessonsMap[item.lessonId].lessonCode || item.lessonId.substring(0, 8)} - ${lessonsMap[item.lessonId].title}` 
                      : item.lessonId.substring(0, 8)
                    }
                  </td>
                  <td className="col-role">
                    <span className="role-badge role-level">
                      {item.order || 0}
                    </span>
                  </td>
                  <td className="col-status">
                    <span className={`status-badge status-${(item.status || 'published').toLowerCase()}`}>
                      {item.status === 'draft' ? 'Draft' : 'Published'}
                    </span>
                  </td>
                  
                  <td className="col-action">
                    <div className="col-action-group">
                      <button className="icon-action-btn edit-btn" title="Chỉnh sửa" onClick={() => handleOpenEditModal(item)}>
                        <Edit2 size={18} />
                      </button>
                      <button className="icon-action-btn delete-btn" title="Xóa" onClick={() => setItemToDelete(item)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredGrammars.length === 0 && (
            <div className="no-data-msg">Không tìm thấy ngữ pháp phù hợp</div>
          )}
        </div>
        
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box delete-confirm-box">
            <h2 className="delete-title">Xác nhận xóa ngữ pháp</h2>
            <p>Bạn có chắc chắn muốn xóa điểm ngữ pháp <strong>"{itemToDelete.title}"</strong> không? Hành động này không thể hoàn tác.</p>
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

export default AdminGrammarsList;
