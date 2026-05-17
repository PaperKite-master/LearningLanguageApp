import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, Edit2, Trash2, X, Lock } from 'lucide-react';
import userApi from '../../api/userApi';

const AdminUsersContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  // Modal states
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({ role: '', status: '' });

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAllUsers();
      
      const formattedUsers = data.map((user, index) => {
        const formatRole = (roleStr) => {
          if (!roleStr || roleStr.toUpperCase() === 'USER') return 'User';
          return roleStr.charAt(0).toUpperCase() + roleStr.slice(1).toLowerCase();
        };
        const formatStatus = (statusStr) => {
          if (statusStr === 'INACTIVE') return 'Inactive';
          return 'Active';
        };

        return {
          ...user,
          displayId: `U${String(index + 1).padStart(3, '0')}`,
          name: user.full_name || 'Người dùng', // Map full_name to name
          uiRole: formatRole(user.role),
          uiStatus: formatStatus(user.status),
          progress: user.progress || 0
        };
      });
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.displayId && user.displayId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleDropdown = (e, userId) => {
    e.stopPropagation();
    if (activeDropdown === userId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(userId);
    }
  };

  const handleEditClick = (user) => {
    setUserToEdit(user);
    const currentRole = (user.role || 'USER').toUpperCase();
    setEditFormData({ 
      role: currentRole, 
      status: user.status || 'ACTIVE' 
    });
    setActiveDropdown(null);
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

  const toggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await userApi.updateStatus(user.id, newStatus);
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
    setActiveDropdown(null);
  };

  return (
    <div className="admin-content-area" onClick={() => setActiveDropdown(null)}>
      <div className="admin-header">
        <h1 className="admin-heading">QUẢN LÝ NGƯỜI DÙNG</h1>
      </div>

      <div className="admin-panel-container">
        
        {/* Search Bar */}
        <div className="admin-search-wrapper">
          <Search size={20} className="admin-search-icon" color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Tìm kiếm người dùng ...." 
            className="admin-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Data Table */}
        <div className="admin-table-wrapper">
          {loading ? (
             <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Đang tải dữ liệu...</div>
          ) : (
          <table className="admin-users-table" style={{ position: 'relative' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ và tên</th>
                <th>Email</th>
                <th>Role</th>
                <th>Tiến độ</th>
                <th>Trạng thái</th>
                <th></th> {/* For Action Menu */}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="col-id">{user.displayId}</td>
                  <td className="col-name">{user.name || 'Người dùng'}</td>
                  <td className="col-email">{user.email}</td>
                  
                  <td className="col-role">
                    <span className={`role-badge role-${user.uiRole.toLowerCase()}`}>
                      {user.uiRole}
                    </span>
                  </td>
                  
                  <td className="col-progress">
                    <div className="progress-cell-inner">
                      <div className="progress-track">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${user.progress}%` }} 
                        ></div>
                      </div>
                      <span className="progress-text">{user.progress}%</span>
                    </div>
                  </td>
                  
                  <td className="col-status">
                    <span className={`status-badge status-${user.uiStatus.toLowerCase()}`}>
                      {user.uiStatus}
                    </span>
                  </td>
                  
                  <td className="col-action" style={{ position: 'relative' }}>
                    <div ref={activeDropdown === user.id ? dropdownRef : null}>
                      <button 
                        className="action-btn" 
                        onClick={(e) => toggleDropdown(e, user.id)}
                      >
                        <MoreHorizontal size={20} color={activeDropdown === user.id ? "#00e5ff" : "#9ca3af"} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeDropdown === user.id && (
                        <div className="kebab-dropdown">
                          <button className="kebab-dropdown-item" onClick={() => handleEditClick(user)}>
                            <Edit2 size={16} /> Chỉnh sửa
                          </button>
                          <button className="kebab-dropdown-item" onClick={() => toggleStatus(user)}>
                            <Lock size={16} /> {user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                          </button>
                          <button className="kebab-dropdown-item danger-item" onClick={() => {
                            setUserToDelete(user);
                            setActiveDropdown(null);
                          }}>
                            <Trash2 size={16} /> Xóa người dùng
                          </button>
                        </div>
                      )}
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

      {/* EDIT USER MODAL */}
      {userToEdit && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-header">
              <h2>Chỉnh Sửa Người Dùng</h2>
              <button className="modal-close-btn" onClick={() => setUserToEdit(null)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={executeEdit} className="modal-body-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label>ID</label>
                  <input type="text" value={userToEdit.id} disabled className="modal-input disabled-input" />
                </div>
                <div className="form-group">
                  <label>Tên</label>
                  <input type="text" value={userToEdit.name} disabled className="modal-input disabled-input" />
                </div>
              </div>
              <div className="form-group-row">
                <div className="form-group">
                  <label>Phân quyền (Role)</label>
                  <select 
                    value={editFormData.role} 
                    onChange={e => setEditFormData({...editFormData, role: e.target.value})} 
                    className="modal-input"
                  >
                    <option value="USER">Học viên (User)</option>
                    <option value="ADMIN">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select 
                    value={editFormData.status} 
                    onChange={e => setEditFormData({...editFormData, status: e.target.value})} 
                    className="modal-input disabled-input"
                    disabled
                  >
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Bị vô hiệu / Khóa</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={() => setUserToEdit(null)}>Hủy bỏ</button>
                <button type="submit" className="admin-btn-primary">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box delete-confirm-box">
            <h2 className="delete-title">Xóa Người Dùng</h2>
            <p>Xóa tài khoản <strong>{userToDelete.name} ({userToDelete.email})</strong>?</p>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={() => setUserToDelete(null)}>Hủy bỏ</button>
              <button className="modal-btn-danger" onClick={executeDelete}>Xóa vĩnh viễn</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsersContent;
