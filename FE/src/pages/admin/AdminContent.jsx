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
      <main className="dashboard-main-area" style={{ backgroundColor: '#f1f5f9' }}>
        <div style={{ 
          padding: '40px 60px 0 60px', 
          backgroundColor: '#f1f5f9',
          display: 'flex', 
          gap: '12px' 
        }}>
          <button 
            style={{ 
              padding: '10px 24px',
              backgroundColor: activeTab === 'lessons' ? '#0f172a' : '#ffffff',
              color: activeTab === 'lessons' ? '#ffffff' : '#64748b',
              border: activeTab === 'lessons' ? 'none' : '1px solid #e2e8f0',
              borderRadius: '24px',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'lessons' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onClick={() => setActiveTab('lessons')}
          >
            Bài Học
          </button>
          <button 
            style={{ 
              padding: '10px 24px',
              backgroundColor: activeTab === 'grammars' ? '#0f172a' : '#ffffff',
              color: activeTab === 'grammars' ? '#ffffff' : '#64748b',
              border: activeTab === 'grammars' ? 'none' : '1px solid #e2e8f0',
              borderRadius: '24px',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === 'grammars' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onClick={() => setActiveTab('grammars')}
          >
            Ngữ Pháp
          </button>
        </div>

        {/* Both AdminContentList and AdminGrammarsList handle their own padding now, but AdminContentList has padding built into .admin-courses-area. We will wrap them if necessary, but currently they have padding: 40px 60px.
            Wait, we added padding-top here. We should check if AdminContentList has padding.
            AdminContentList has .admin-courses-area { padding: 40px 60px; }. We should change AdminContent padding.
        */}
        <div>
          {activeTab === 'lessons' ? <AdminContentList /> : <AdminGrammarsList />}
        </div>
      </main>
    </div>
  );
};

export default AdminContent;
