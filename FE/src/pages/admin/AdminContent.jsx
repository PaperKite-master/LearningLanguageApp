import React, { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminContentList from '../../components/admin/AdminContentList';
import AdminGrammarsList from '../../components/admin/AdminGrammarsList';
import AdminQuizzesContent from '../../components/admin/AdminQuizzesContent';

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons', 'grammars', or 'tests'

  return (
    <div className="dashboard-layout">
      <AdminSidebar />
      <main className="dashboard-main-area admin-dashboard-area">
        <div style={{ marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '20px' }}>
          <button 
            style={{ 
              background: 'none', border: 'none', color: activeTab === 'lessons' ? '#00f2fe' : '#9ca3af', 
              padding: '10px 0', fontSize: '1.1rem', fontWeight: activeTab === 'lessons' ? 'bold' : 'normal',
              borderBottom: activeTab === 'lessons' ? '2px solid #00f2fe' : '2px solid transparent',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('lessons')}
          >
            Bài Học
          </button>
          <button 
            style={{ 
              background: 'none', border: 'none', color: activeTab === 'grammars' ? '#00f2fe' : '#9ca3af', 
              padding: '10px 0', fontSize: '1.1rem', fontWeight: activeTab === 'grammars' ? 'bold' : 'normal',
              borderBottom: activeTab === 'grammars' ? '2px solid #00f2fe' : '2px solid transparent',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab('grammars')}
          >
            Ngữ Pháp
          </button>
        </div>

        {activeTab === 'lessons' ? <AdminContentList /> : <AdminGrammarsList />}
      </main>
    </div>
  );
};

export default AdminContent;
