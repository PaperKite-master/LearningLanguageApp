import React from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import FlashcardContent from '../../components/flashcard/FlashcardContent';

const Flashcard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area">
        <FlashcardContent />
      </main>
    </div>
  );
};

export default Flashcard;
