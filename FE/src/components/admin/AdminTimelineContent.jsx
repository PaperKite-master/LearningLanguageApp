import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Edit2, Trash2, X } from 'lucide-react';

const INITIAL_TIMELINE_DATA = [
  {
    id: "path-1",
    level: "N5",
    title: "NGƯỜI MỚI BẮT ĐẦU",
    items: [
      { id: "item-1", content: "Nói lời chào và tạm biệt" },
      { id: "item-2", content: "Tạo câu phủ định và trả lời câu hỏi" },
      { id: "item-3", content: "Nói về đồ dùng cá nhân" }
    ]
  },
  {
    id: "path-2",
    level: "N4",
    title: "TIỂU HỌC",
    items: [
      { id: "item-4", content: "Thuật ngữ phần mềm" },
      { id: "item-5", content: "Cấu trúc câu: て形" },
      { id: "item-6", content: "Cụm từ đánh giá mã" }
    ]
  },
  {
    id: "path-3",
    level: "N3",
    title: "TRUNG CẤP",
    items: [
      { id: "item-7", content: "Đọc tài liệu" },
      { id: "item-8", content: "Viết báo cáo" },
      { id: "item-9", content: "Giao tiếp về kỹ thuật" }
    ]
  }
];

const AdminTimelineContent = () => {
  const [paths, setPaths] = useState(INITIAL_TIMELINE_DATA);
  const [isMounted, setIsMounted] = useState(false);

  // Modal State for adding new path
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [pathFormData, setPathFormData] = useState({ id: '', title: '', level: 'N5' });

  // Modal State for adding/editing an item (Bài học)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState('add');
  const [itemFormData, setItemFormData] = useState({ id: '', content: '' });
  const [targetPathId, setTargetPathId] = useState('');

  useEffect(() => {
    // Avoid hydration mismatch for DND kit in strict mode
    setIsMounted(true);
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      // Move to different list
      const sourcePath = paths.find(p => p.id === source.droppableId);
      const destPath = paths.find(p => p.id === destination.droppableId);
      
      const sourceItems = [...sourcePath.items];
      const destItems = [...destPath.items];
      
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);
      
      setPaths(paths.map(p => {
        if (p.id === source.droppableId) return { ...p, items: sourceItems };
        if (p.id === destination.droppableId) return { ...p, items: destItems };
        return p;
      }));
    } else {
      // Reorder within same list
      const path = paths.find(p => p.id === source.droppableId);
      const items = [...path.items];
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);

      setPaths(paths.map(p => 
        p.id === source.droppableId ? { ...p, items } : p
      ));
    }
  };

  const handleAddNewPath = (e) => {
    e.preventDefault();
    const newPath = {
      id: `path-${Date.now()}`,
      level: pathFormData.level,
      title: pathFormData.title,
      items: []
    };
    setPaths([...paths, newPath]);
    setIsPathModalOpen(false);
  };

  const handleOpenAddItem = (pathId) => {
    setTargetPathId(pathId);
    setItemModalMode('add');
    setItemFormData({ id: `item-${Date.now()}`, content: '' });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (pathId, item) => {
    setTargetPathId(pathId);
    setItemModalMode('edit');
    setItemFormData(item);
    setIsItemModalOpen(true);
  };

  const handleItemSubmit = (e) => {
    e.preventDefault();
    setPaths(paths.map(p => {
      if (p.id === targetPathId) {
        if (itemModalMode === 'add') {
          return { ...p, items: [...p.items, itemFormData] };
        } else {
          return { ...p, items: p.items.map(i => i.id === itemFormData.id ? itemFormData : i) };
        }
      }
      return p;
    }));
    setIsItemModalOpen(false);
  };

  const deleteItem = (pathId, itemId) => {
    setPaths(paths.map(p => {
      if (p.id === pathId) {
        return { ...p, items: p.items.filter(item => item.id !== itemId) };
      }
      return p;
    }));
  };

  if (!isMounted) return null;

  return (
    <div className="admin-content-area">
      <div className="admin-header flex-header">
        <h1 className="admin-heading">QUẢN LÝ TIMELINE</h1>
        <button className="admin-btn-primary" onClick={() => {
          setPathFormData({ title: '', level: 'N5' });
          setIsPathModalOpen(true);
        }}>
          + Thêm lộ trình mới
        </button>
      </div>

      <div className="timeline-dnd-container">
        <DragDropContext onDragEnd={onDragEnd}>
          {paths.map((path) => (
            <div key={path.id} className="timeline-path-block">
              <div className="timeline-path-header">
                <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                  <span className="role-badge role-level">{path.level}</span>
                  <span className="timeline-path-title">{path.title}</span>
                  <span className="timeline-path-count">{path.items.length} bài</span>
                </div>
                <button 
                  style={{
                    background: 'rgba(255,255,255,0.05)', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    color: 'var(--white)', 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                  onClick={() => handleOpenAddItem(path.id)}
                >
                  + Thêm bài học
                </button>
              </div>
              
              <Droppable droppableId={path.id}>
                {(provided, snapshot) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className={`timeline-droppable-area ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {path.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`timeline-draggable-item ${snapshot.isDragging ? 'is-dragging' : ''}`}
                          >
                            <div className="timeline-item-left">
                              <div {...provided.dragHandleProps} className="timeline-drag-handle">
                                <GripVertical size={20} color="#6b7280" />
                              </div>
                              <span className="timeline-item-content">{item.content}</span>
                            </div>
                            
                            {/* Hidden by default, show on hover via CSS */}
                            <div className="timeline-item-actions">
                              <button className="icon-action-btn edit-btn" title="Chỉnh sửa" onClick={() => handleOpenEditItem(path.id, item)}>
                                <Edit2 size={16} />
                              </button>
                              <button className="icon-action-btn delete-btn" title="Xóa" onClick={() => deleteItem(path.id, item.id)}>
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
      </div>

      {/* CREATE PATH MODAL */}
      {isPathModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-header">
              <h2>Thêm Lộ Trình Mới</h2>
              <button className="modal-close-btn" onClick={() => setIsPathModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddNewPath} className="modal-body-form">
              <div className="form-group">
                <label>Tên Lộ Trình</label>
                <input 
                  type="text" 
                  value={pathFormData.title} 
                  onChange={e => setPathFormData({...pathFormData, title: e.target.value})} 
                  className="modal-input" 
                  required 
                  placeholder="VD: CAO CẤP"
                />
              </div>

              <div className="form-group">
                <label>Trình độ (Cấp bậc)</label>
                <select 
                  value={pathFormData.level} 
                  onChange={e => setPathFormData({...pathFormData, level: e.target.value})} 
                  className="modal-input"
                >
                  <option value="N5">JLPT N5</option>
                  <option value="N4">JLPT N4</option>
                  <option value="N3">JLPT N3</option>
                  <option value="N2">JLPT N2</option>
                  <option value="N1">JLPT N1</option>
                </select>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsPathModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="admin-btn-primary">Tạo Lộ Trình</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT ITEM MODAL */}
      {isItemModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-header">
              <h2>{itemModalMode === 'add' ? 'Thêm Bài Học Mới' : 'Chỉnh Sửa Bài Học'}</h2>
              <button className="modal-close-btn" onClick={() => setIsItemModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleItemSubmit} className="modal-body-form">
              <div className="form-group">
                <label>Tên Bài Học</label>
                <input 
                  type="text" 
                  value={itemFormData.content} 
                  onChange={e => setItemFormData({...itemFormData, content: e.target.value})} 
                  className="modal-input" 
                  required 
                  placeholder="VD: Nói lời chào và tạm biệt"
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsItemModalOpen(false)}>Hủy bỏ</button>
                <button type="submit" className="admin-btn-primary">Lưu Thay Đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTimelineContent;
