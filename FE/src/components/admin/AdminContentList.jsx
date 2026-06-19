import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit2, Trash2, ExternalLink } from 'lucide-react';
import lessonApi from '../../api/lessonApi';
import './AdminContentList.css';

const AdminContentList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [contentList, setContentList] = useState([]);
  const [activeTab, setActiveTab] = useState('Published');
  const [loading, setLoading] = useState(true);

  // Delete confirm state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const data = await lessonApi.getAllAdmin();
        const sortedData = [...(data || [])].sort((a, b) => {
          const codeA = a.lessonCode || '';
          const codeB = b.lessonCode || '';
          return codeB.localeCompare(codeA, undefined, { numeric: true });
        });
        
        setContentList(sortedData);
      } catch (error) {
        console.error("Lỗi tải bài học:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

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
        setSelectedCourseIds(prev => prev.filter(id => id !== itemToDelete.id));
        alert('Xóa bài học thành công!');
      }
    } catch (error) {
      console.error('Lỗi khi xóa bài học:', error);
      alert('Có lỗi xảy ra khi xóa bài học. Vui lòng thử lại.');
    } finally {
      setItemToDelete(null);
    }
  };

  const filteredContent = contentList.filter(item => {
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (item.lessonCode && item.lessonCode.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by tab status
    const itemStatus = (item.status || 'published').toLowerCase();
    const tabStatus = activeTab.toLowerCase();
    
    return matchSearch && itemStatus === tabStatus;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const toggleCourseSelection = (courseId) => {
    setSelectedCourseIds(prev => 
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCourseIds.length === filteredContent.length && filteredContent.length > 0) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(filteredContent.map(c => c.id));
    }
  };

  const executeBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedCourseIds.length} course đã chọn? Hành động này không thể hoàn tác.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await Promise.all(selectedCourseIds.map(id => lessonApi.delete(id)));
      
      const data = await lessonApi.getAllAdmin();
      const sortedData = [...(data || [])].sort((a, b) => {
        const codeA = a.lessonCode || '';
        const codeB = b.lessonCode || '';
        return codeB.localeCompare(codeA, undefined, { numeric: true });
      });
      setContentList(sortedData);
      
      setSelectedCourseIds([]);
      alert(`Đã xóa thành công ${selectedCourseIds.length} course!`);
    } catch (error) {
      console.error('Failed to bulk delete courses:', error);
      alert('Có lỗi xảy ra khi xóa danh sách course. Một số course có thể chưa được xóa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-courses-area">
      <div className="admin-courses-header">
        <h1 className="admin-courses-title">Courses</h1>
        <button className="admin-btn-primary" onClick={handleOpenAddModal}>
          + Create New Course
        </button>
      </div>

      <div className="admin-courses-tabs-container">
        <div className="admin-courses-tabs">
          {['Published', 'Draft', 'Archived'].map(tab => (
            <button 
              key={tab}
              className={`admin-course-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="admin-courses-search-sort" style={{ display: 'flex', alignItems: 'center' }}>
          {selectedCourseIds.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', marginRight: '16px', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '6px 16px', borderRadius: '24px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Đã chọn {selectedCourseIds.length}</span>
              <button 
                className="action-icon-btn delete-btn" 
                onClick={executeBulkDelete}
                title="Xóa course đã chọn"
                style={{ padding: '4px', backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
              >
                <Trash2 size={16} color="#ef4444" />
              </button>
            </div>
          )}
          <span className="sort-by-text">Sort By <span className="sort-arrow">v</span></span>
        </div>
      </div>

      <div className="admin-courses-table-wrapper">
        <table className="admin-courses-table">
          <thead>
            <tr>
              <th className="col-checkbox">
                <input 
                  type="checkbox" 
                  checked={filteredContent.length > 0 && selectedCourseIds.length === filteredContent.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Course Title</th>
              <th>Status</th>
              <th>Enrollments</th>
              <th>Completion Rate</th>
              <th>Last Updated</th>
              <th className="col-actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>Loading...</td></tr>
            ) : filteredContent.length === 0 ? (
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>No courses found</td></tr>
            ) : (
              filteredContent.map((item) => (
                <tr key={item.id} style={{ backgroundColor: selectedCourseIds.includes(item.id) ? '#f8fafc' : 'transparent' }}>
                  <td className="col-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedCourseIds.includes(item.id)}
                      onChange={() => toggleCourseSelection(item.id)}
                    />
                  </td>
                  <td className="col-title">{item.title}</td>
                  <td className="col-status">
                    <span className={`course-status-pill ${item.status?.toLowerCase() || 'published'}`}>
                      <span className="status-dot"></span>
                      {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Published'}
                    </span>
                  </td>
                  <td className="col-enrollments">{item.enrollments > 0 ? item.enrollments : '-'}</td>
                  <td className="col-completion">{item.completionRate > 0 ? `${item.completionRate}%` : '-'}</td>
                  <td className="col-date">{formatDate(item.createdAt)}</td>
                  
                  <td className="col-actions">
                    <div className="action-buttons">
                      <button className="icon-action-btn edit-btn" title="Edit" onClick={() => handleOpenEditModal(item)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-action-btn delete-btn" title="Delete" onClick={() => setItemToDelete(item)}>
                        <Trash2 size={16} color="#ef4444" />
                      </button>
                      <button className="icon-action-btn external-btn" title="View" onClick={() => window.open(`/study/lesson/${item.id}`, '_blank')}>
                        <ExternalLink size={16} />
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
            <h2 className="delete-title">Delete Course Confirmation</h2>
            <p>Are you sure you want to delete <strong>"{itemToDelete.title}"</strong>? This action cannot be undone.</p>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setItemToDelete(null)}>Cancel</button>
              <button className="modal-btn-danger" onClick={executeDelete}>Delete Permanently</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentList;
