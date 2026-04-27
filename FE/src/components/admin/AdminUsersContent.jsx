import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, Edit2, Trash2, X, Lock } from 'lucide-react';

const MOCK_USERS = [
  { id: 'U001', name: 'Nguyễn Văn A', email: 'anguyen@12gmail.com', role: 'Student', progress: 75, status: 'Active' },
  { id: 'U002', name: 'Hồ Thị Bích', email: 'aassfv@214gmail.com', role: 'Pro', progress: 39, status: 'Active' },
  { id: 'U003', name: 'Nguyễn Hoàng Luân', email: 'dsgtb@12gmail.com', role: 'Admin', progress: 55, status: 'Active' },
  { id: 'U004', name: 'Nguyễn Thị Bích Ngọc', email: 'jmtyfgs@12gmail.com', role: 'Student', progress: 91, status: 'Active' },
  { id: 'U005', name: 'Trần Thanh Thảo', email: 'ádafasa@12gmail.com', role: 'Student', progress: 6, status: 'Inactive' },
  { id: 'U006', name: 'Lưu Hoàng Phúc An', email: 'hgmfn@12gmail.com', role: 'Student', progress: 16, status: 'Active' },
  { id: 'U007', name: 'Phạm Hoàng An', email: 'hgmfn@12gmail.com', role: 'Student', progress: 50, status: 'Inactive' },
  { id: 'U008', name: 'Hoàng Tuyết Nhi', email: 'aassfv@214gmail.com', role: 'Pro', progress: 87, status: 'Inactive' }
];

const AdminUsersContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(MOCK_USERS);
  
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

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
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
    setEditFormData({ role: user.role, status: user.status });
    setActiveDropdown(null);
  };

  const executeEdit = (e) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === userToEdit.id ? { ...u, role: editFormData.role, status: editFormData.status } : u));
    setUserToEdit(null);
  };

  const executeDelete = () => {
    setUsers(users.filter(u => u.id !== userToDelete.id));
    setUserToDelete(null);
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
                  <td className="col-id">{user.id}</td>
                  <td className="col-name">{user.name}</td>
                  <td className="col-email">{user.email}</td>
                  
                  <td className="col-role">
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>
                      {user.role}
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
                    <span className={`status-badge status-${user.status.toLowerCase()}`}>
                      {user.status}
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
                          <button className="kebab-dropdown-item" onClick={() => {
                            setUsers(users.map(u => u.id === user.id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
                            setActiveDropdown(null);
                          }}>
                            <Lock size={16} /> {user.status === 'Active' ? 'Khóa tài khoản' : 'Mở khóa'}
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
          
          {filteredUsers.length === 0 && (
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
                    <option value="Student">Học viên (Student)</option>
                    <option value="Pro">Tài khoản Pro</option>
                    <option value="Admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Trạng thái</label>
                  <select 
                    value={editFormData.status} 
                    onChange={e => setEditFormData({...editFormData, status: e.target.value})} 
                    className="modal-input"
                  >
                    <option value="Active">Đang hoạt động</option>
                    <option value="Inactive">Bị vô hiệu / Khóa</option>
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
