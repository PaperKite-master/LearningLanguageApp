import React from 'react';
import { Settings, Eye, Clock, CheckCircle, BarChart2 } from 'lucide-react';

const Step4Publish = ({ formData, setFormData }) => {
  const handleChange = (e) => {
    setFormData({ ...formData, status: e.target.value });
  };

  return (
    <div className="step-section">
      <h2 className="step-title">Publish Settings</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
        
        <div style={{ background: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <h3 style={{ color: '#1f2937', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={20} color="#3b82f6" /> Visibility Settings
          </h3>
          
          <div className="status-radio-group" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <label 
              className={`radio-label ${formData.status === 'published' ? 'selected' : ''}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '15px', background: formData.status === 'published' ? '#f0fdf4' : '#f9fafb', borderRadius: '8px', cursor: 'pointer', border: formData.status === 'published' ? '1px solid #22c55e' : '1px solid #e5e7eb' }}
            >
              <input 
                type="radio" 
                value="published" 
                checked={formData.status === 'published'} 
                onChange={handleChange} 
                style={{ marginTop: '4px' }}
              />
              <div>
                <strong style={{ color: formData.status === 'published' ? '#16a34a' : '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}><Eye size={16} /> Publish Now</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Course will be immediately visible to all students.</p>
              </div>
            </label>

            <label 
              className={`radio-label ${formData.status === 'draft' ? 'selected' : ''}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '15px', background: formData.status === 'draft' ? '#fefce8' : '#f9fafb', borderRadius: '8px', cursor: 'pointer', border: formData.status === 'draft' ? '1px solid #eab308' : '1px solid #e5e7eb' }}
            >
              <input 
                type="radio" 
                value="draft" 
                checked={formData.status === 'draft'} 
                onChange={handleChange} 
                style={{ marginTop: '4px' }}
              />
              <div>
                <strong style={{ color: formData.status === 'draft' ? '#d97706' : '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> Save as Draft</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Course will be hidden from students until published.</p>
              </div>
            </label>

            <label 
              className={`radio-label ${formData.status === 'archived' ? 'selected' : ''}`}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '15px', padding: '15px', background: formData.status === 'archived' ? '#fef2f2' : '#f9fafb', borderRadius: '8px', cursor: 'pointer', border: formData.status === 'archived' ? '1px solid #ef4444' : '1px solid #e5e7eb' }}
            >
              <input 
                type="radio" 
                value="archived" 
                checked={formData.status === 'archived'} 
                onChange={handleChange} 
                style={{ marginTop: '4px' }}
              />
              <div>
                <strong style={{ color: formData.status === 'archived' ? '#dc2626' : '#4b5563', display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={16} /> Archived</strong>
                <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#6b7280' }}>Course is retired and moved to archive.</p>
              </div>
            </label>
          </div>
        </div>

        <div style={{ background: '#f9fafb', padding: '25px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ color: '#1f2937', fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart2 size={20} color="#3b82f6" />
            Course Summary
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#6b7280', fontSize: '0.95rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', paddingBottom: '10px' }}>
              <span>Title</span>
              <span style={{ color: '#1f2937', fontWeight: '500' }}>{formData.title || '(Untitled)'}</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', paddingBottom: '10px' }}>
              <span>Vocabulary Words</span>
              <span style={{ color: '#1f2937', fontWeight: '500' }}>{formData.vocabularies.length}</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e5e7eb', paddingBottom: '10px' }}>
              <span>Total Quiz Questions</span>
              <span style={{ color: '#1f2937', fontWeight: '500' }}>{formData.vocabularies.reduce((acc, v) => acc + (v.questions?.length || 0), 0)}</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9ca3af' }}>Status</span>
              <span style={{ color: formData.status === 'published' ? '#22c55e' : formData.status === 'draft' ? '#eab308' : '#ef4444', fontWeight: 'bold', textTransform: 'capitalize' }}>
                {formData.status}
              </span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Step4Publish;
