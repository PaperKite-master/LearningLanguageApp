import React from 'react';

const Step1BasicInfo = ({ formData, setFormData, timelines }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="step-section">
      <h2 className="step-title">Basic Information</h2>
      
      <div className="form-group-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div className="form-group" style={{ flex: 2 }}>
          <label>Course Title <span style={{color: 'red'}}>*</span></label>
          <input 
            type="text" name="title" value={formData.title} onChange={handleChange} 
            className="modal-input" required placeholder="Ex: Bài 1: Chào hỏi cơ bản"
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Timeline <span style={{color: 'red'}}>*</span></label>
          <select 
            name="timelineId" value={formData.timelineId} onChange={handleChange} 
            className="modal-input" required
          >
            <option value="">-- Select Timeline --</option>
            {timelines.map(tl => (
              <option key={tl.id} value={tl.id}>
                {tl.title} ({tl.description || 'N5'})
              </option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Lesson Code</label>
          <input 
            type="text" name="lessonCode" value={formData.lessonCode} onChange={handleChange} 
            className="modal-input" placeholder="Ex: L001 (Auto if empty)"
          />
        </div>
      </div>
      
      <div className="form-group-row" style={{ display: 'flex', gap: '20px', marginBottom: 0 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Topic <span style={{color: 'red'}}>*</span></label>
          <input 
            type="text" name="topic" value={formData.topic} onChange={handleChange} 
            className="modal-input" required placeholder="Ex: Từ vựng, Ngữ pháp..."
          />
        </div>
        <div className="form-group" style={{ flex: 1.5 }}>
          <label>Video URL (Youtube/AWS)</label>
          <input 
            type="url" name="videoUrl" value={formData.videoUrl} onChange={handleChange} 
            className="modal-input" placeholder="https://..."
          />
        </div>
      </div>
    </div>
  );
};

export default Step1BasicInfo;
