import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import lessonApi from '../../../api/lessonApi';
import timelineApi from '../../../api/timelineApi';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Curriculum from './Step2Curriculum';
import Step3Vocabulary from './Step3Vocabulary';
import Step4Publish from './Step4Publish';
import './AdminCourseCreate.css';

const AdminCourseCreateContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const editMode = location.state?.editMode || false;
  const lessonData = location.state?.lessonData || null;

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    timelineId: '',
    videoUrl: '',
    lessonCode: '',
    contentMarkdown: '## Cấu trúc\n\n## Cách dùng\n\n## Ví dụ\n',
    vocabularies: [],
    status: 'published',
  });

  const [timelines, setTimelines] = useState([]);

  useEffect(() => {
    const fetchTimelines = async () => {
      try {
        const data = await timelineApi.getAll();
        setTimelines(data || []);
      } catch (e) {
        console.error("Failed to fetch timelines", e);
      }
    };
    fetchTimelines();

    if (editMode && lessonData) {
      setFormData({
        title: lessonData.title || '',
        topic: lessonData.topic || '',
        timelineId: lessonData.timelineId || '',
        videoUrl: lessonData.videoUrl || '',
        lessonCode: lessonData.lessonCode || '',
        contentMarkdown: lessonData.contentMarkdown || '## Cấu trúc\n\n## Cách dùng\n\n## Ví dụ\n',
        vocabularies: lessonData.vocabularies || [],
        status: lessonData.status || 'published',
      });
    }
  }, [editMode, lessonData]);

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title || !formData.timelineId || !formData.topic) {
      alert('Vui lòng điền Tiêu đề, Topic và Lộ trình ở Step 1!');
      setCurrentStep(1);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        timelineId: formData.timelineId,
        topic: formData.topic,
        status: formData.status,
        videoUrl: formData.videoUrl,
        contentMarkdown: formData.contentMarkdown,
        lessonCode: formData.lessonCode,
        vocabularies: formData.vocabularies
      };

      if (editMode) {
        await lessonApi.update(lessonData.id, payload);
        alert('Cập nhật bài học thành công!');
      } else {
        await lessonApi.create(payload);
        alert('Tạo bài học thành công!');
      }
      navigate('/admin/content');
    } catch (error) {
      alert('Lưu thất bại: ' + error.message);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1BasicInfo formData={formData} setFormData={setFormData} timelines={timelines} />;
      case 2:
        return <Step2Curriculum formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step3Vocabulary formData={formData} setFormData={setFormData} />;
      case 4:
        return <Step4Publish formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-content-area admin-course-create-page">
      <div className="admin-header flex-header" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            className="action-btn" 
            onClick={() => navigate('/admin/content')}
            style={{ padding: '8px', background: '#f3f4f6', borderRadius: '8px', border: '1px solid #e5e7eb' }}
          >
            <ArrowLeft size={24} color="#4b5563" />
          </button>
          <h1 className="admin-heading" style={{ marginBottom: 0, color: '#1f2937' }}>
            {editMode ? 'CHỈNH SỬA KHÓA HỌC' : 'TẠO KHÓA HỌC MỚI'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="modal-btn-cancel" onClick={() => navigate('/admin/content')}>
            Hủy
          </button>
          <button className="admin-btn-primary" onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} /> {editMode ? 'Lưu Thay Đổi' : 'Publish Course'}
          </button>
        </div>
      </div>

      <div className="stepper-container">
        {['Basic Information', 'Curriculum Builder', 'Vocabulary List', 'Publish Settings'].map((step, index) => {
          const stepNum = index + 1;
          const isActive = currentStep === stepNum;
          const isCompleted = currentStep > stepNum;
          return (
            <div key={stepNum} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`} onClick={() => setCurrentStep(stepNum)}>
              <div className="step-circle">
                {isCompleted ? <CheckCircle size={16} /> : stepNum}
              </div>
              <span className="step-label">{step}</span>
            </div>
          );
        })}
      </div>

      <div className="step-content-wrapper">
        {renderStepContent()}
      </div>

      <div className="stepper-footer">
        <button className="modal-btn-cancel" onClick={handlePrev} disabled={currentStep === 1}>
          Quay lại
        </button>
        {currentStep < totalSteps ? (
          <button className="admin-btn-primary" onClick={handleNext}>
            Tiếp theo
          </button>
        ) : (
          <button className="admin-btn-primary" onClick={handleSave}>
            Hoàn tất & Publish
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminCourseCreateContent;
