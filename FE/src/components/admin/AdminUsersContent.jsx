import React, { useState, useEffect } from 'react';
import { Search, Trash2, X, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, Edit2 } from 'lucide-react';
import userApi from '../../api/userApi';
import './AdminUsersContent.css'; // Make sure we use a specific CSS file for styling

const AdminUsersContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [filterCourse, setFilterCourse] = useState('All');
  const [sortBy, setSortBy] = useState('Name');
  
  // Modal states
  const [userToDelete, setUserToDelete] = useState(null);
  const [sendMessageUser, setSendMessageUser] = useState(null);
  const [userProgressDetails, setUserProgressDetails] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState({});
  const [selectedReminders, setSelectedReminders] = useState([]);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({ role: '', status: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers();
      
      const formattedUsers = data.map((user, index) => {
        let uiStatus = 'Active';
        if (user.status === 'INACTIVE') uiStatus = 'Inactive';
        if (user.progress === 100) uiStatus = 'Completed';

        // Format dates
        const lastActivityDate = user.last_activity_at ? new Date(user.last_activity_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Never';

        // Format spent
        const spentVal = user.spent || 0;
        const formattedSpent = spentVal >= 1000 ? `${spentVal / 1000}K VNĐ` : `${spentVal} VNĐ`;
        
        // Mock current course from target level
        let courseName = user.target_level;
        if (user.target_level === 'N5') courseName = 'JLPT N5 Foundation';
        if (user.target_level === 'N4') courseName = 'JLPT N4 Grammar';
        if (user.target_level === 'N3') courseName = 'JLPT N3 Mastery';

        return {
          ...user,
          displayId: `U${String(index + 1).padStart(3, '0')}`,
          name: user.full_name || 'Người dùng', // Map full_name to name
          uiStatus,
          spentText: formattedSpent,
          lastActivityText: lastActivityDate,
          currentCourse: courseName
        };
      });
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  let filteredUsers = users.filter(user => 
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Apply course filter
  if (filterCourse !== 'All') {
    filteredUsers = filteredUsers.filter(user => user.currentCourse === filterCourse);
  }

  // Apply sorting
  filteredUsers.sort((a, b) => {
    if (sortBy === 'Name') {
      return (a.name || '').localeCompare(b.name || '');
    } else if (sortBy === 'Spent') {
      const spentA = a.spent || 0;
      const spentB = b.spent || 0;
      return spentB - spentA; // Highest spent first
    } else if (sortBy === 'Recent') {
      const dateA = a.last_activity_at ? new Date(a.last_activity_at).getTime() : 0;
      const dateB = b.last_activity_at ? new Date(b.last_activity_at).getTime() : 0;
      return dateB - dateA; // Newest activity first
    }
    return 0;
  });

  const executeDelete = async () => {
    try {
      await userApi.deleteUser(userToDelete.id);
      fetchUsers();
      setUserToDelete(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Có lỗi xảy ra khi xóa người dùng');
    }
  };

  const handleEditClick = (user) => {
    setUserToEdit(user);
    const currentRole = (user.role || 'USER').toUpperCase();
    setEditFormData({ 
      role: currentRole, 
      status: user.status || 'ACTIVE' 
    });
  };

  const executeEdit = async (e) => {
    e.preventDefault();
    try {
      await userApi.updateRole(userToEdit.id, editFormData.role.toUpperCase());
      fetchUsers();
      setUserToEdit(null);
    } catch (error) {
      console.error('Failed to update user:', error);
      alert('Có lỗi xảy ra khi cập nhật người dùng');
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUserIds.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const executeBulkDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedUserIds.length} học viên đã chọn? Hành động này không thể hoàn tác.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await Promise.all(selectedUserIds.map(id => userApi.deleteUser(id)));
      await fetchUsers();
      setSelectedUserIds([]);
    } catch (error) {
      console.error('Failed to bulk delete users:', error);
      alert('Có lỗi xảy ra khi xóa danh sách người dùng. Một số tài khoản có thể chưa được xóa.');
      setLoading(false);
    }
  };

  const openSendMessageModal = async (user) => {
    setSendMessageUser(user);
    setSelectedReminders([]); // Clear previous selections
    setProgressLoading(true);
    try {
      const data = await userApi.getProgressDetails(user.id);
      setUserProgressDetails(data || []);
      // Auto expand the first level
      if (data && data.length > 0) {
        setExpandedLevels({ [data[0].level]: true });
      } else {
        setExpandedLevels({});
      }
    } catch (error) {
      console.error('Failed to fetch user progress details', error);
      setUserProgressDetails([]);
    } finally {
      setProgressLoading(false);
    }
  };

  const toggleLevelExpand = (level) => {
    setExpandedLevels(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  return (
    <div className="students-content-area">
      <div className="students-header">
        <h1 className="students-heading">Students</h1>
      </div>

      <div className="students-panel-container">
        <div className="students-toolbar">
          <div className="students-search-wrapper" style={{ maxWidth: '400px' }}>
            <Search size={20} className="students-search-icon" color="#9ca3af" />
            <input 
              type="text" 
              placeholder="What do you want to find" 
              className="students-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="students-filters" style={{ display: 'flex', alignItems: 'center' }}>
            {selectedUserIds.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginRight: '16px', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '6px 16px', borderRadius: '24px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Đã chọn {selectedUserIds.length}</span>
                <button 
                  className="action-icon-btn danger-btn" 
                  onClick={executeBulkDelete}
                  title="Xóa học viên đã chọn"
                  style={{ padding: '4px', backgroundColor: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
            <div style={{ position: 'relative' }}>
              <select 
                className="students-filter-btn" 
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                style={{ appearance: 'none', paddingRight: '32px', cursor: 'pointer', outline: 'none' }}
              >
                <option value="All">All Courses</option>
                <option value="JLPT N5 Foundation">JLPT N5 Foundation</option>
                <option value="JLPT N4 Grammar">JLPT N4 Grammar</option>
                <option value="JLPT N3 Mastery">JLPT N3 Mastery</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#475569' }} />
            </div>

            <div style={{ position: 'relative' }}>
              <select 
                className="students-filter-btn" 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ appearance: 'none', paddingRight: '32px', cursor: 'pointer', outline: 'none' }}
              >
                <option value="Name">Sort By: Name</option>
                <option value="Spent">Sort By: Spent (High to Low)</option>
                <option value="Recent">Sort By: Recent Activity</option>
              </select>
              <ChevronDown size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#475569' }} />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="students-table-wrapper">
          {loading ? (
             <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Đang tải dữ liệu...</div>
          ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th className="col-checkbox">
                  <input 
                    type="checkbox" 
                    checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="col-name">Student Name</th>
                <th className="col-email">Email</th>
                <th className="col-course">Current course</th>
                <th className="col-spent">Spent</th>
                <th className="col-activity">Last Activity</th>
                <th className="col-status">Status</th>
                <th className="col-action">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ backgroundColor: selectedUserIds.includes(user.id) ? '#f8fafc' : 'transparent' }}>
                  <td className="col-checkbox">
                    <input 
                      type="checkbox" 
                      checked={selectedUserIds.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </td>
                  <td className="col-name">{user.name}</td>
                  <td className="col-email">{user.email}</td>
                  <td className="col-course">{user.currentCourse}</td>
                  <td className="col-spent">{user.spentText}</td>
                  <td className="col-activity">{user.lastActivityText}</td>
                  
                  <td className="col-status">
                    <span className={`status-badge status-${user.uiStatus.toLowerCase()}`}>
                      <span className="status-dot"></span>
                      {user.uiStatus}
                    </span>
                  </td>
                  
                  <td className="col-action">
                    <div className="action-buttons-inline">
                      <button 
                        className="action-icon-btn"
                        onClick={() => handleEditClick(user)}
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        className="action-icon-btn danger-btn"
                        onClick={() => setUserToDelete(user)}
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button 
                        className="action-icon-btn"
                        onClick={() => openSendMessageModal(user)}
                        title="Send Message"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
          
          {!loading && filteredUsers.length === 0 && (
            <div className="no-data-msg">Không tìm thấy tài khoản phù hợp</div>
          )}
        </div>
      </div>

      {/* SEND MESSAGE MODAL */}
      {sendMessageUser && (
        <div className="students-modal-overlay">
          <div className="students-modal-box send-message-modal">
            <div className="modal-header">
              <div>
                <h2>{sendMessageUser.name}</h2>
                <p className="modal-subtitle">{sendMessageUser.currentCourse}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setSendMessageUser(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body progress-accordion-body">
              {progressLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>Đang tải...</div>
              ) : (
                <div className="accordion-list">
                  {userProgressDetails.map((levelGroup, idx) => (
                    <div className="accordion-item" key={idx}>
                      <div className="accordion-header" onClick={() => toggleLevelExpand(levelGroup.level)}>
                        <div className="accordion-title">
                          <CheckCircle2 size={20} className="accordion-check-icon checked" />
                          <span>{levelGroup.level}</span>
                        </div>
                        {expandedLevels[levelGroup.level] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                      
                      {expandedLevels[levelGroup.level] && (
                        <div className="accordion-content">
                          {levelGroup.lessons.map((lesson) => {
                            const isSelected = selectedReminders.includes(lesson.id);
                            return (
                            <div 
                              className="lesson-check-item" 
                              key={lesson.id}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedReminders(selectedReminders.filter(id => id !== lesson.id));
                                } else {
                                  setSelectedReminders([...selectedReminders, lesson.id]);
                                }
                              }}
                              style={{ 
                                cursor: 'pointer', 
                                backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <input 
                                  type="checkbox" 
                                  checked={isSelected}
                                  onChange={() => {}} // Handled by div onClick
                                  style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0ea5e9' }}
                                />
                                <span style={{ fontWeight: isSelected ? '600' : '400', color: isSelected ? '#0f172a' : '#334155' }}>
                                  {lesson.title}
                                </span>
                              </div>
                              <CheckCircle2 
                                size={18} 
                                fill={lesson.is_completed ? "#0ea5e9" : "none"}
                                color={lesson.is_completed ? "#ffffff" : "#0ea5e9"}
                                style={{ flexShrink: 0 }}
                                title={lesson.is_completed ? "Đã hoàn thành" : "Chưa hoàn thành"}
                              />
                            </div>
                            );
                          })}
                          {levelGroup.lessons.length === 0 && (
                            <div className="lesson-check-item no-lessons">Chưa có bài học nào.</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {userProgressDetails.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>Không có dữ liệu tiến độ.</div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer modal-footer-centered">
              <button 
                className="btn-send-message" 
                onClick={() => {
                  if (selectedReminders.length === 0) {
                    alert('Vui lòng chọn ít nhất 1 bài học để nhắc nhở!');
                    return;
                  }
                  alert(`Đã gửi thông báo nhắc nhở học tập cho ${selectedReminders.length} bài học thành công!`);
                  setSendMessageUser(null);
                }}
              >
                Send message {selectedReminders.length > 0 ? `(${selectedReminders.length})` : ''}
              </button>
              <button className="btn-cancel-message" onClick={() => setSendMessageUser(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="students-modal-overlay">
          <div className="students-modal-box delete-confirm-box">
            <h2 className="delete-title">Xóa Người Dùng</h2>
            <p>Xóa tài khoản <strong>{userToDelete.name} ({userToDelete.email})</strong>?</p>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setUserToDelete(null)}>Hủy bỏ</button>
              <button className="modal-btn-danger" onClick={executeDelete}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {userToEdit && (
        <div className="students-modal-overlay">
          <div className="students-modal-box" style={{ maxWidth: '500px', padding: '32px' }}>
            <div className="modal-header" style={{ padding: '0 0 24px 0' }}>
              <h2>Chỉnh Sửa Người Dùng</h2>
              <button className="modal-close-btn" onClick={() => setUserToEdit(null)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={executeEdit} className="modal-body-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Tên học viên</label>
                <input type="text" value={userToEdit.name} disabled className="students-search-input" style={{ background: '#f8fafc', color: '#94a3b8', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Email</label>
                <input type="text" value={userToEdit.email} disabled className="students-search-input" style={{ background: '#f8fafc', color: '#94a3b8', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
              </div>
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Phân quyền (Role)</label>
                <select 
                  value={editFormData.role} 
                  onChange={e => setEditFormData({...editFormData, role: e.target.value})} 
                  className="students-search-input"
                  style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                >
                  <option value="USER">Học viên (User)</option>
                  <option value="PRO">Học viên (PRO)</option>
                  <option value="ADMIN">Quản trị viên (Admin)</option>
                </select>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="modal-btn-cancel" onClick={() => setUserToEdit(null)}>Hủy bỏ</button>
                <button type="submit" className="btn-send-message">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsersContent;
