import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Trash2 } from 'lucide-react';
import grammarApi from '../../api/grammarApi';
import './AdminGrammarsList.css';

const AdminGrammarsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [grammarsList, setGrammarsList] = useState([]);
  const [lessonsMap, setLessonsMap] = useState({});
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedGrammarIds, setSelectedGrammarIds] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      } finally {
        setLoading(false);
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
        setSelectedGrammarIds(prev => prev.filter(id => id !== itemToDelete.id));
        alert('Xóa ngữ pháp thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi xóa ngữ pháp:', error);
      alert('Có lỗi xảy ra khi xóa ngữ pháp. Vui lòng thử lại.');
    } finally {
      setItemToDelete(null);
    }
  };

  const toggleGrammarSelection = (grammarId) => {
    setSelectedGrammarIds(prev => 
      prev.includes(grammarId) ? prev.filter(id => id !== grammarId) : [...prev, grammarId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedGrammarIds.length === filteredGrammars.length && filteredGrammars.length > 0) {
      setSelectedGrammarIds([]);
    } else {
      setSelectedGrammarIds(filteredGrammars.map(g => g.id));
    }
  };

  const executeBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedGrammarIds.length} ngữ pháp đã chọn? Hành động này không thể hoàn tác.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await Promise.all(selectedGrammarIds.map(id => grammarApi.delete(id)));
      
      const data = await grammarApi.getAll();
      setGrammarsList(data || []);
      
      setSelectedGrammarIds([]);
      alert(`Đã xóa thành công ${selectedGrammarIds.length} ngữ pháp!`);
    } catch (error) {
      console.error('Failed to bulk delete grammars:', error);
      alert('Có lỗi xảy ra khi xóa danh sách ngữ pháp. Một số ngữ pháp có thể chưa được xóa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-grammars-area">
      <div className="admin-grammars-header">
        <h1 className="admin-grammars-title">Grammars</h1>
        <button className="admin-btn-primary" onClick={handleOpenAddModal}>
          + Create New Grammar
        </button>
      </div>

      <div className="admin-grammars-toolbar">
        <div className="admin-grammars-search-wrapper">
          <Search size={20} className="admin-grammars-search-icon" />
          <input 
            type="text" 
            placeholder="Tìm kiếm ngữ pháp hoặc theo Mã bài học..." 
            className="admin-grammars-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {selectedGrammarIds.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '6px 16px', borderRadius: '24px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Đã chọn {selectedGrammarIds.length}</span>
              <button 
                className="icon-action-btn delete-btn" 
                onClick={executeBulkDelete}
                title="Xóa ngữ pháp đã chọn"
                style={{ padding: '4px', backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Trash2 size={16} color="#ef4444" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="admin-grammars-table-wrapper">
        <table className="admin-grammars-table">
          <thead>
            <tr>
              <th className="col-checkbox">
                <input 
                  type="checkbox" 
                  checked={filteredGrammars.length > 0 && selectedGrammarIds.length === filteredGrammars.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Tiêu đề Ngữ Pháp</th>
                <th>Thuộc Bài Học (Lesson ID)</th>
                <th>Order</th>
                <th>Trạng thái</th>
                <th>{/* For Actions */}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Đang tải...</td></tr>
              ) : filteredGrammars.length === 0 ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Không tìm thấy ngữ pháp phù hợp</td></tr>
              ) : (
                filteredGrammars.map((item) => (
                  <tr key={item.id} style={{ backgroundColor: selectedGrammarIds.includes(item.id) ? '#f8fafc' : 'transparent' }}>
                    <td className="col-checkbox">
                      <input 
                        type="checkbox" 
                        checked={selectedGrammarIds.includes(item.id)}
                        onChange={() => toggleGrammarSelection(item.id)}
                      />
                    </td>
                    <td className="col-title">{item.title}</td>
                    <td className="col-lesson">
                      {lessonsMap[item.lessonId] ? 
                        `${lessonsMap[item.lessonId].lessonCode || item.lessonId.substring(0, 8)} - ${lessonsMap[item.lessonId].title}` 
                        : item.lessonId.substring(0, 8)
                      }
                    </td>
                    <td className="col-order">
                      {item.order || 0}
                    </td>
                    <td className="col-status">
                      <span className={`grammar-status-pill ${(item.status || 'published').toLowerCase()}`}>
                        <span className="status-dot"></span>
                        {item.status === 'draft' ? 'Draft' : 'Published'}
                      </span>
                    </td>
                    
                    <td className="col-actions">
                      <div className="action-buttons">
                        <button className="icon-action-btn edit-btn" title="Chỉnh sửa" onClick={() => handleOpenEditModal(item)}>
                          <Edit2 size={16} />
                        </button>
                        <button className="icon-action-btn delete-btn" title="Xóa" onClick={() => setItemToDelete(item)}>
                          <Trash2 size={16} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
