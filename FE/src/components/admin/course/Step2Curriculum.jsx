import React, { useCallback } from 'react';
import MDEditor from '@uiw/react-md-editor';
import remarkBreaks from 'remark-breaks';
import { FileText } from 'lucide-react';

const Step2Curriculum = ({ formData, setFormData }) => {
  const handleChange = (val) => {
    setFormData({ ...formData, contentMarkdown: val });
  };

  const onImageUpload = useCallback(async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://fake-supabase-storage.com/images/${Date.now()}-${file.name}`);
      }, 1500);
    });
  }, []);

  const handleDrop = async (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const url = await onImageUpload(file);
      const imageMarkdown = `\n![${file.name}](${url})\n`;
      handleChange(formData.contentMarkdown + imageMarkdown);
    }
  };

  const handlePaste = async (event) => {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') === 0) {
        event.preventDefault();
        const file = item.getAsFile();
        const url = await onImageUpload(file);
        const imageMarkdown = `\n![Pasted Image](${url})\n`;
        handleChange(formData.contentMarkdown + imageMarkdown);
      }
    }
  };

  return (
    <div className="step-section">
      <h2 className="step-title">Curriculum Builder</h2>
      
      <div 
        className="markdown-editor-container"
        data-color-mode="light"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onPaste={handlePaste}
        style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}
      >
        <div className="editor-helper-bar" style={{ background: '#f9fafb', padding: '10px 15px', fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e5e7eb' }}>
          <FileText size={16} />
          <span>Hỗ trợ Kéo/Thả (Drag & Drop) hoặc Dán (Ctrl+V) ảnh minh họa trực tiếp vào khung soạn thảo.</span>
        </div>
        <MDEditor
          value={formData.contentMarkdown}
          onChange={handleChange}
          height={500}
          preview="live"
          previewOptions={{
            remarkPlugins: [remarkBreaks]
          }}
        />
      </div>
    </div>
  );
};

export default Step2Curriculum;
