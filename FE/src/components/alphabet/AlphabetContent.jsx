import React, { useState } from 'react';
import { hiraganaData, katakanaData } from '../../data/kana';

const AlphabetContent = () => {
  const [activeTab, setActiveTab] = useState('hiragana');
  
  const currentData = activeTab === 'hiragana' ? hiraganaData : katakanaData;

  return (
    <div className="alphabet-content">
      <div className="alphabet-header">
        <h2>BẢNG CHỮ CÁI TIẾNG NHẬT</h2>
        
        {/* Toggle Switch */}
        <div className="toggle-switch-container">
          <div className="toggle-switch">
            <button 
              className={`toggle-btn ${activeTab === 'hiragana' ? 'active' : ''}`}
              onClick={() => setActiveTab('hiragana')}
            >
              Hiragana
            </button>
            <button 
              className={`toggle-btn ${activeTab === 'katakana' ? 'active' : ''}`}
              onClick={() => setActiveTab('katakana')}
            >
              Katakana
            </button>
          </div>
        </div>
      </div>

      {/* Kana Grid */}
      <div className="kana-grid-container">
        <div className="kana-grid">
          {currentData.map((item, index) => {
            if (item === null) {
              return <div key={`empty-${index}`} className="kana-empty"></div>;
            }
            return (
              <div key={item.id} className="kana-card">
                <span className="kana-char">{item.kana}</span>
                <span className="kana-romaji">{item.romaji}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Button */}
      <div className="alphabet-footer">
        <button className="start-practice-btn">
          Bắt đầu luyện tập →
        </button>
      </div>
    </div>
  );
};

export default AlphabetContent;
