import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Edit2, Trash2, X } from 'lucide-react';
import timelineApi from '../../api/timelineApi';
import lessonApi from '../../api/lessonApi';

const AdminTimelineContent = () => {
  const [paths, setPaths] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for adding/editing new path
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
  const [pathModalMode, setPathModalMode] = useState('add');
  const [pathFormData, setPathFormData] = useState({ id: '', title: '', level: 'N5' });

  // Modal State for adding/editing an item (Bài học)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalMode, setItemModalMode] = useState('add');
  const [itemFormData, setItemFormData] = useState({ id: '', content: '' });
  const [targetPathId, setTargetPathId] = useState('');

  useEffect(() => {
    setIsMounted(true);
    fetchTimelines();
  }, []);

  const fetchTimelines = async () => {
    try {
      setIsLoading(true);
      const data = await timelineApi.getAll();
      
      const formattedPaths = data.map(timeline => {
        const sortedLessons = (timeline.lessons || []).sort((a, b) => (a.order || 0) - (b.order || 0));
        return {
          id: timeline.id,
          level: timeline.description || 'N5', // Using description for level as a workaround
          title: timeline.title,
          items: sortedLessons.map(lesson => ({
            id: lesson.id,
            content: lesson.title
          }))
        };
      });
      // Sort timelines by order
      setPaths(formattedPaths);
    } catch (err) {
      console.error('Failed to fetch timelines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onDragEnd = async (result) => {
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

      // Background update for the moved item
      try {
        await lessonApi.update(removed.id, {
          timelineId: destination.droppableId,
          order: destination.index
        });
        
        // Also update order of other items in destination if needed (optional optimization)
        for (let i = 0; i < destItems.length; i++) {
          if (destItems[i].id !== removed.id) {
            await lessonApi.update(destItems[i].id, { order: i });
          }
        }
      } catch (err) {
        console.error('Drag update failed:', err);
      }

    } else {
      // Reorder within same list
      const path = paths.find(p => p.id === source.droppableId);
      const items = [...path.items];
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);

      setPaths(paths.map(p => 
        p.id === source.droppableId ? { ...p, items } : p
      ));

      // Background update
      try {
        for (let i = 0; i < items.length; i++) {
          await lessonApi.update(items[i].id, { order: i });
        }
      } catch (err) {
        console.error('Reorder update failed:', err);
      }
    }
  };

  const handleSavePath = async (e) => {
    e.preventDefault();
    try {
      if (pathModalMode === 'add') {
        const newTimeline = await timelineApi.create({
          title: pathFormData.title,
          description: pathFormData.level,
          order: paths.length
        });
        
        const newPath = {
          id: newTimeline.id,
          level: newTimeline.description || pathFormData.level,
          title: newTimeline.title,
          items: []
        };
        setPaths([...paths, newPath]);
      } else {
        const updatedTimeline = await timelineApi.update(pathFormData.id, {
          title: pathFormData.title,
          description: pathFormData.level
        });
        
        setPaths(paths.map(p => {
          if (p.id === pathFormData.id) {
            return {
              ...p,
              title: updatedTimeline.title,
              level: updatedTimeline.description || pathFormData.level
            };
          }
          return p;
        }));
      }
      setIsPathModalOpen(false);
    } catch (err) {
      console.error('Failed to save timeline:', err);
      alert('Lưu lộ trình thất bại!');
    }
  };

  const handleOpenEditPath = (path) => {
    setPathModalMode('edit');
    setPathFormData({ id: path.id, title: path.title, level: path.level });
    setIsPathModalOpen(true);
  };

  const handleDeletePath = async (pathId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa TOÀN BỘ lộ trình này và tất cả các bài học bên trong không? Hành động này không thể hoàn tác!')) return;
    try {
      await timelineApi.delete(pathId);
      setPaths(paths.filter(p => p.id !== pathId));
    } catch (err) {
      console.error('Failed to delete timeline:', err);
      alert('Xóa lộ trình thất bại! Có thể do lỗi kết nối.');
    }
  };

  const handleOpenAddItem = (pathId) => {
    setTargetPathId(pathId);
    setItemModalMode('add');
    setItemFormData({ id: '', content: '' });
    setIsItemModalOpen(true);
  };

  const handleOpenEditItem = (pathId, item) => {
    setTargetPathId(pathId);
    setItemModalMode('edit');
    setItemFormData(item);
    setIsItemModalOpen(true);
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      if (itemModalMode === 'add') {
        const path = paths.find(p => p.id === targetPathId);
        
        // Auto generate lessonCode
        const existingLessons = await lessonApi.getAll();
        let finalLessonCode = 'L001';
        if (existingLessons && existingLessons.length > 0) {
          let maxIndex = 0;
          existingLessons.forEach(l => {
            if (l.lessonCode && l.lessonCode.startsWith('L')) {
              const num = parseInt(l.lessonCode.substring(1), 10);
              if (!isNaN(num) && num > maxIndex) maxIndex = num;
            }
          });
          finalLessonCode = `L${String(maxIndex + 1).padStart(3, '0')}`;
        }

        const newLesson = await lessonApi.create({
          title: itemFormData.content,
          timelineId: targetPathId,
          order: path.items.length,
          status: 'published',
          lessonCode: finalLessonCode
        });
        
        setPaths(paths.map(p => {
          if (p.id === targetPathId) {
            return { ...p, items: [...p.items, { id: newLesson.id, content: newLesson.title }] };
          }
          return p;
        }));
      } else {
        const updatedLesson = await lessonApi.update(itemFormData.id, {
          title: itemFormData.content
        });
        
        setPaths(paths.map(p => {
          if (p.id === targetPathId) {
            return { ...p, items: p.items.map(i => i.id === updatedLesson.id ? { id: updatedLesson.id, content: updatedLesson.title } : i) };
          }
          return p;
        }));
      }
      setIsItemModalOpen(false);
    } catch (err) {
      console.error('Failed to save lesson:', err);
      alert('Lưu thất bại!');
    }
  };

  const deleteItem = async (pathId, itemId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      await lessonApi.delete(itemId);
      setPaths(paths.map(p => {
        if (p.id === pathId) {
          return { ...p, items: p.items.filter(item => item.id !== itemId) };
        }
        return p;
      }));
    } catch (err) {
      console.error('Failed to delete lesson:', err);
      alert('Xóa thất bại!');
    }
  };

  if (!isMounted) return null;

  return (
    <div className="admin-content-area">
      <div className="admin-header flex-header">
        <h1 className="admin-heading">QUẢN LÝ TIMELINE</h1>
        <button className="admin-btn-primary" onClick={() => {
          setPathModalMode('add');
          setPathFormData({ id: '', title: '', level: 'N5' });
          setIsPathModalOpen(true);
        }}>
          + Thêm lộ trình mới
        </button>
      </div>

      {isLoading ? (
        <div style={{ color: '#fff', padding: '2rem' }}>Đang tải dữ liệu...</div>
      ) : (
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
                  <div style={{display: 'flex', gap: '8px'}}>
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
                    <button 
                      style={{
                        background: 'rgba(59, 130, 246, 0.1)', 
                        border: '1px solid rgba(59, 130, 246, 0.3)', 
                        color: '#3b82f6', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                      title="Chỉnh sửa lộ trình"
                      onClick={() => handleOpenEditPath(path)}
                    >
                      Sửa
                    </button>
                    <button 
                      style={{
                        background: 'rgba(239,68,68,0.1)', 
                        border: '1px solid rgba(239,68,68,0.3)', 
                        color: '#ef4444', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                      title="Xóa lộ trình"
                      onClick={() => handleDeletePath(path.id)}
                    >
                      Xóa
                    </button>
                  </div>
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
      )}

      {/* CREATE PATH MODAL */}
      {isPathModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box">
            <div className="modal-header">
              <h2>{pathModalMode === 'add' ? 'Thêm Lộ Trình Mới' : 'Chỉnh Sửa Lộ Trình'}</h2>
              <button className="modal-close-btn" onClick={() => setIsPathModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSavePath} className="modal-body-form">
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
                <button type="submit" className="admin-btn-primary">{pathModalMode === 'add' ? 'Tạo Lộ Trình' : 'Lưu Thay Đổi'}</button>
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
