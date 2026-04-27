import React from 'react';
import Sidebar from '../../components/dashboard/Sidebar';
import AlphabetContent from '../../components/alphabet/AlphabetContent';

const Alphabet = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="dashboard-main-area alphabet-area">
        <AlphabetContent />
      </main>
    </div>
  );
};

export default Alphabet;
