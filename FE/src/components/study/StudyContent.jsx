import React from 'react';
import LearningPath from './LearningPath';
import ProgressWidget from './ProgressWidget';

const StudyContent = () => {
  return (
    <div className="study-content-layout">
      {/* Page Title */}
      <div className="study-header-banner">
        <h2>HÀNH TRÌNH HỌC TẬP</h2>
        <p>Thành thạo tiếng Nhật cho ngành CNTT</p>
      </div>

      <div className="study-columns">
        {/* Left Column - Learning Tree */}
        <div className="study-main-col">
          <LearningPath />
        </div>

        {/* Right Column - Progress Sticky Widget */}
        <div className="study-side-col">
          <ProgressWidget />
        </div>
      </div>
    </div>
  );
};

export default StudyContent;
