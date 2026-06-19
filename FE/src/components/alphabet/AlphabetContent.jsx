import React, { useState } from 'react';
import { 
  hiraganaData, hiraganaDakuonData, hiraganaYoonData,
  katakanaData, katakanaDakuonData, katakanaYoonData
} from '../../data/kana';
import AlphabetPractice from './AlphabetPractice';
import './AlphabetPractice.css';

const AlphabetContent = () => {
  const [activeTab, setActiveTab] = useState('hiragana');
  const [isPracticing, setIsPracticing] = useState(false);
  
  const currentBasic = activeTab === 'hiragana' ? hiraganaData : katakanaData;
  const currentDakuon = activeTab === 'hiragana' ? hiraganaDakuonData : katakanaDakuonData;
  const currentYoon = activeTab === 'hiragana' ? hiraganaYoonData : katakanaYoonData;
  const currentAll = [...currentBasic, ...currentDakuon, ...currentYoon];

  if (isPracticing) {
    return <AlphabetPractice kanaData={currentAll} onBack={() => setIsPracticing(false)} />;
  }

  const renderGrid = (data, isYoon = false) => (
    <div className={`alpha-grid ${isYoon ? 'alpha-grid-yoon' : ''}`}>
      {data.map((item, index) => {
        if (item === null) {
          return <div key={`empty-${index}`} className="alpha-empty"></div>;
        }
        return (
          <div key={item.id} className="alpha-card">
            <span className="alpha-char">{item.kana}</span>
            <span className="alpha-romaji">{item.romaji}</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="alphabet-content" style={{ background: '#ffffff', minHeight: '100%', padding: '40px 20px', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Minimalist Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px', borderBottom: '2px solid #f1f5f9', maxWidth: '400px', margin: '0 auto 40px auto' }}>
        <div 
          onClick={() => setActiveTab('hiragana')}
          style={{ 
            padding: '10px 30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem',
            color: activeTab === 'hiragana' ? '#d946ef' : '#9ca3af',
            borderBottom: activeTab === 'hiragana' ? '3px solid #d946ef' : '3px solid transparent',
            marginBottom: '-2px', transition: 'all 0.3s'
          }}
        >
          HIRAGANA
        </div>
        <div 
          onClick={() => setActiveTab('katakana')}
          style={{ 
            padding: '10px 30px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem',
            color: activeTab === 'katakana' ? '#d946ef' : '#9ca3af',
            borderBottom: activeTab === 'katakana' ? '3px solid #d946ef' : '3px solid transparent',
            marginBottom: '-2px', transition: 'all 0.3s'
          }}
        >
          KATAKANA
        </div>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '900', color: '#1e293b', marginBottom: '10px' }}>
          CÙNG HỌC CHỮ {activeTab.toUpperCase()}!
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '25px' }}>
          Làm quen với bảng chữ cái để bắt đầu học tiếng Nhật nhé
        </p>
        <button 
          onClick={() => setIsPracticing(true)}
          style={{
            background: 'linear-gradient(135deg, #d946ef 0%, #a855f7 100%)',
            color: '#fff', border: 'none', padding: '10px 30px', borderRadius: '30px',
            fontSize: '1rem', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(217, 70, 239, 0.3)', transition: 'transform 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Bắt đầu luyện tập →
        </button>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Basic Grid */}
        {renderGrid(currentBasic)}

        {/* Dakuon Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '40px 0 20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          <span style={{ padding: '0 15px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold' }}>ÂM ĐỤC VÀ ÂM BÁN ĐỤC</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        </div>

        {/* Dakuon Grid */}
        {renderGrid(currentDakuon)}

        {/* Yoon Divider */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '40px 0 20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          <span style={{ padding: '0 15px', color: '#94a3b8', fontSize: '0.8rem', fontWeight: 'bold' }}>ÂM GHÉP</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        </div>

        {/* Yoon Grid */}
        {renderGrid(currentYoon, true)}
      </div>

      {/* Add inline CSS for the specific grid styles */}
      <style>
        {`
          .alpha-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
          }
          .alpha-grid-yoon {
            grid-template-columns: repeat(3, 1fr);
          }
          .alpha-card {
            background: #ffffff;
            border: 2px solid transparent;
            border-radius: 12px;
            aspect-ratio: 5 / 4;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
            transition: all 0.2s;
          }
          .alpha-card:hover {
            border-color: #d946ef;
            transform: translateY(-4px);
            box-shadow: 0 12px 25px rgba(217, 70, 239, 0.2);
          }
          .alpha-char {
            font-size: 1.6rem;
            font-weight: bold;
            color: #3b0764; /* deep purple color for the character */
            margin-bottom: 5px;
          }
          .alpha-romaji {
            font-size: 0.8rem;
            color: #64748b;
          }
          .alpha-empty {
            visibility: hidden;
          }
        `}
      </style>
    </div>
  );
};

export default AlphabetContent;
