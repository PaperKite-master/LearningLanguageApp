import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Filter, Play, MoreVertical, Edit2, Trash2, EyeOff, X, Image as ImageIcon, Video, BookOpen, Layers } from 'lucide-react';
import timelineApi from '../../api/timelineApi';
import lessonApi from '../../api/lessonApi';
import './AdminVideosContent.css';

const AdminVideosContent = () => {
  const [timelines, setTimelines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    contentMarkdown: '',
    level: 'N5',
    timelineId: '',
    videoUrl: '',
    status: 'published'
  });

  const [activeDropdown, setActiveDropdown] = useState(null); // track which lesson's dropdown is open

  useEffect(() => {
    fetchTimelines();
  }, []);

  const fetchTimelines = async () => {
    try {
      setIsLoading(true);
      const data = await timelineApi.getAll();
      setTimelines(data);
    } catch (error) {
      console.error('Failed to fetch timelines', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTimelines = useMemo(() => {
    return timelines.map(timeline => {
      // Filter by course/level
      if (filterCourse !== 'All' && timeline.description !== filterCourse) return null;

      // Filter by search query (match timeline title or lesson titles)
      const q = searchQuery.toLowerCase();
      const matchesTimeline = timeline.title?.toLowerCase().includes(q);
      
      const filteredLessons = timeline.lessons?.filter(lesson => 
        lesson.title?.toLowerCase().includes(q)
      ) || [];

      if (!matchesTimeline && filteredLessons.length === 0 && q) {
        return null;
      }

      // Sort lessons by order
      const sortedLessons = [...(timeline.lessons || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

      return {
        ...timeline,
        lessons: q ? filteredLessons : sortedLessons
      };
    }).filter(Boolean);
  }, [timelines, searchQuery, filterCourse]);

  // Derived options for timelineId select in modal based on selected level
  const timelineOptionsForLevel = useMemo(() => {
    return timelines.filter(t => t.description === formData.level);
  }, [timelines, formData.level]);

  // Ensure selected timeline matches the level when level changes
  useEffect(() => {
    if (timelineOptionsForLevel.length > 0 && !timelineOptionsForLevel.find(t => t.id === formData.timelineId)) {
      setFormData(prev => ({ ...prev, timelineId: timelineOptionsForLevel[0].id }));
    } else if (timelineOptionsForLevel.length === 0) {
      setFormData(prev => ({ ...prev, timelineId: '' }));
    }
  }, [timelineOptionsForLevel, formData.level]);

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      id: '',
      title: '',
      contentMarkdown: '',
      level: 'N5',
      timelineId: '',
      videoUrl: '',
      status: 'published'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (lesson, timeline) => {
    setModalMode('edit');
    setFormData({
      id: lesson.id,
      title: lesson.title,
      contentMarkdown: lesson.contentMarkdown || '',
      level: timeline.description || 'N5',
      timelineId: lesson.timelineId || timeline.id,
      videoUrl: lesson.videoUrl || '',
      status: lesson.status || 'published'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e, statusOverride) => {
    if (e) e.preventDefault();
    const finalStatus = statusOverride || formData.status;

    try {
      if (modalMode === 'add') {
        // Auto generate lessonCode
        const allLessons = await lessonApi.getAll();
        let maxCode = 0;
        allLessons.forEach(l => {
          if (l.lessonCode && l.lessonCode.startsWith('L')) {
            const num = parseInt(l.lessonCode.substring(1), 10);
            if (!isNaN(num) && num > maxCode) maxCode = num;
          }
        });
        const finalLessonCode = `L${String(maxCode + 1).padStart(3, '0')}`;

        await lessonApi.create({
          title: formData.title,
          timelineId: formData.timelineId,
          contentMarkdown: formData.contentMarkdown,
          videoUrl: formData.videoUrl,
          status: finalStatus,
          lessonCode: finalLessonCode
        });
      } else {
        await lessonApi.update(formData.id, {
          title: formData.title,
          timelineId: formData.timelineId,
          contentMarkdown: formData.contentMarkdown,
          videoUrl: formData.videoUrl,
          status: finalStatus
        });
      }
      setIsModalOpen(false);
      fetchTimelines();
    } catch (err) {
      console.error('Failed to save lesson', err);
      alert('Lưu thất bại!');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học video này?')) return;
    try {
      await lessonApi.delete(id);
      fetchTimelines();
    } catch (err) {
      console.error('Failed to delete lesson', err);
      alert('Xóa thất bại!');
    }
  };

  const handleUnpublish = async (lesson) => {
    try {
      await lessonApi.update(lesson.id, { status: 'draft' });
      fetchTimelines();
    } catch (err) {
      console.error('Failed to unpublish lesson', err);
    }
  };

  return (
    <div className="admin-videos-container">
      <div className="av-header">
        <div className="av-header-left">
          <h1>Video</h1>
          <p>Browse every video lesson grouped by course and module.</p>
        </div>
        <div className="av-header-right">
          <div className="av-search-box">
            <Search size={18} className="av-search-icon" />
            <input 
              type="text" 
              placeholder="Search by lesson, module or course..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="av-filter-box">
            <Filter size={18} className="av-filter-icon" />
            <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)}>
              <option value="All">All courses</option>
              <option value="N5">JLPT N5</option>
              <option value="N4">JLPT N4</option>
              <option value="N3">JLPT N3</option>
              <option value="N2">JLPT N2</option>
              <option value="N1">JLPT N1</option>
            </select>
          </div>
          <button className="av-btn-primary" onClick={openAddModal}>
            <Plus size={18} />
            <span>New lesson</span>
          </button>
        </div>
      </div>

      <div className="av-content">
        {isLoading ? (
          <div className="av-loading">Đang tải dữ liệu...</div>
        ) : filteredTimelines.length === 0 ? (
          <div className="av-empty">
            <Video size={48} className="av-empty-icon" />
            <h3>No video lessons found</h3>
            <p>Try adjusting your search or filter.</p>
          </div>
        ) : (
          filteredTimelines.map((timeline) => (
            <div key={timeline.id} className="av-module-block">
              <div className="av-module-header">
                <h2>{timeline.title}</h2>
                <span className="av-module-count">{timeline.lessons?.length || 0} lessons</span>
              </div>
              <div className="av-lessons-list">
                {timeline.lessons && timeline.lessons.length > 0 ? (
                  timeline.lessons.map((lesson) => (
                    <div key={lesson.id} className="av-lesson-row">
                      <div className="av-lesson-left">
                        <div className="av-lesson-thumb">
                          {lesson.videoUrl ? <Play size={20} className="av-play-icon" /> : <ImageIcon size={20} className="av-no-video-icon" />}
                        </div>
                        <div className="av-lesson-info">
                          <span className="av-lesson-title">{lesson.title}</span>
                          <span className="av-lesson-badge">{timeline.description || 'N5'}</span>
                        </div>
                      </div>
                      <div className="av-lesson-right">
                        {lesson.status === 'published' ? (
                          <span className="av-status-badge published">Published</span>
                        ) : (
                          <span className="av-status-badge draft">Draft</span>
                        )}
                        <div className="av-options-wrapper">
                          <button 
                            className="av-icon-btn" 
                            onClick={() => setActiveDropdown(activeDropdown === lesson.id ? null : lesson.id)}
                            onBlur={() => setTimeout(() => setActiveDropdown(null), 200)}
                          >
                            <MoreVertical size={18} />
                          </button>
                          {activeDropdown === lesson.id && (
                            <div className="av-dropdown-menu">
                              <button onClick={() => openEditModal(lesson, timeline)}>
                                <Edit2 size={16} /> Edit
                              </button>
                              {lesson.status === 'published' && (
                                <button onClick={() => handleUnpublish(lesson)}>
                                  <EyeOff size={16} /> Unpublish
                                </button>
                              )}
                              <button className="av-danger-text" onClick={() => handleDelete(lesson.id)}>
                                <Trash2 size={16} /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="av-no-lessons">Chưa có bài học nào trong module này.</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Add/Edit Lesson */}
      {isModalOpen && (
        <div className="av-modal-overlay">
          <div className="av-modal-box">
            <div className="av-modal-header">
              <h2>{modalMode === 'add' ? 'Add a lesson' : 'Edit lesson'}</h2>
              <button className="av-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <form className="av-modal-form">
              <div className="av-form-group">
                <label>Lesson title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. Câu khẳng định"
                />
              </div>

              <div className="av-form-group">
                <label>Description</label>
                <textarea 
                  value={formData.contentMarkdown}
                  onChange={(e) => setFormData({...formData, contentMarkdown: e.target.value})}
                  placeholder="Optional description or notes for the video lesson"
                  rows={3}
                />
              </div>

              <div className="av-form-row">
                <div className="av-form-group">
                  <label>Level (Course)</label>
                  <select 
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                  >
                    <option value="N5">JLPT N5</option>
                    <option value="N4">JLPT N4</option>
                    <option value="N3">JLPT N3</option>
                    <option value="N2">JLPT N2</option>
                    <option value="N1">JLPT N1</option>
                  </select>
                </div>
                <div className="av-form-group">
                  <label>Module</label>
                  <select 
                    value={formData.timelineId}
                    onChange={(e) => setFormData({...formData, timelineId: e.target.value})}
                  >
                    {timelineOptionsForLevel.map(t => (
                      <option key={t.id} value={t.id}>{t.title}</option>
                    ))}
                    {timelineOptionsForLevel.length === 0 && (
                      <option value="" disabled>No modules available</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="av-form-group">
                <label>Video URL</label>
                <input 
                  type="text" 
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                  placeholder="YouTube link or direct video URL"
                />
              </div>

              <div className="av-modal-footer">
                <button type="button" className="av-btn-secondary" onClick={() => handleSubmit(null, 'draft')}>
                  Save as Draft
                </button>
                <button type="button" className="av-btn-primary" onClick={() => handleSubmit(null, 'published')}>
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVideosContent;
