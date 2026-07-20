import React, { useState } from 'react';
import { Plus, Trash2, Edit2, ListChecks } from 'lucide-react';
import QuizBuilderModal from './QuizBuilderModal';

const Step3Vocabulary = ({ formData, setFormData }) => {
  const [vocabularies, setVocabularies] = useState(formData.vocabularies || []);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeVocabIndex, setActiveVocabIndex] = useState(null);

  const addVocabulary = () => {
    const newVocabs = [...vocabularies, { 
      hiragana: '', 
      romaji: '', 
      kanji: '', 
      meaning: '', 
      questions: [] 
    }];
    setVocabularies(newVocabs);
    updateForm(newVocabs);
  };

  const removeVocabulary = (index) => {
    const newVocabs = [...vocabularies];
    newVocabs.splice(index, 1);
    setVocabularies(newVocabs);
    updateForm(newVocabs);
  };

  const handleChange = (index, field, value) => {
    const newVocabs = [...vocabularies];
    newVocabs[index][field] = value;
    setVocabularies(newVocabs);
    updateForm(newVocabs);
  };

  const updateForm = (vocabs) => {
    setFormData({ ...formData, vocabularies: vocabs });
  };

  const openQuizModal = (index) => {
    setActiveVocabIndex(index);
    setModalOpen(true);
  };

  const handleSaveQuestions = (questions) => {
    if (activeVocabIndex === -1) {
      setFormData({ ...formData, questions });
    } else {
      const newVocabs = [...vocabularies];
      newVocabs[activeVocabIndex].questions = questions;
      setVocabularies(newVocabs);
      updateForm(newVocabs);
    }
    setModalOpen(false);
  };

  return (
    <div className="step-section">
      <h2 className="step-title">Vocabulary List</h2>
      
      <div className="vocab-list">
        {vocabularies.map((vocab, index) => (
          <div key={index} className="vocab-card">
            <div className="vocab-card-header">
              <span className="vocab-card-title">Vocabulary #{index + 1}</span>
                <button 
                  onClick={() => removeVocabulary(index)}
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                  title="Remove Vocabulary"
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div className="vocab-inputs" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginTop: '16px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 500, color: '#374151', fontSize: '0.95rem' }}>Katakana/Hiragana <span style={{color: '#ef4444'}}>*</span></label>
                <input 
                  type="text" 
                  value={vocab.hiragana} 
                  onChange={(e) => handleChange(index, 'hiragana', e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: '0.95rem', color: '#1f2937', outline: 'none', transition: 'all 0.2s', marginTop: '6px' }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; e.target.style.boxShadow = 'none' }}
                  placeholder="ex: りんご"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 500, color: '#374151', fontSize: '0.95rem' }}>Romaji</label>
                <input 
                  type="text" 
                  value={vocab.romaji || ''} 
                  onChange={(e) => handleChange(index, 'romaji', e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: '0.95rem', color: '#1f2937', outline: 'none', transition: 'all 0.2s', marginTop: '6px' }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; e.target.style.boxShadow = 'none' }}
                  placeholder="ex: ringo"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 500, color: '#374151', fontSize: '0.95rem' }}>Kanji</label>
                <input 
                  type="text" 
                  value={vocab.kanji || ''} 
                  onChange={(e) => handleChange(index, 'kanji', e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: '0.95rem', color: '#1f2937', outline: 'none', transition: 'all 0.2s', marginTop: '6px' }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; e.target.style.boxShadow = 'none' }}
                  placeholder="ex: 林檎"
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 500, color: '#374151', fontSize: '0.95rem' }}>Meaning <span style={{color: '#ef4444'}}>*</span></label>
                <input 
                  type="text" 
                  value={vocab.meaning} 
                  onChange={(e) => handleChange(index, 'meaning', e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', fontSize: '0.95rem', color: '#1f2937', outline: 'none', transition: 'all 0.2s', marginTop: '6px' }}
                  onFocus={(e) => { e.target.style.borderColor = '#3b82f6'; e.target.style.backgroundColor = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)' }}
                  onBlur={(e) => { e.target.style.borderColor = '#e5e7eb'; e.target.style.backgroundColor = '#f9fafb'; e.target.style.boxShadow = 'none' }}
                  placeholder="ex: Apple"
                />
              </div>
            </div>

          </div>
        ))}

        <button onClick={addVocabulary} className="admin-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
          <Plus size={20} /> Add Vocabulary
        </button>
      </div>

      {/* Practice Questions Section */}
      <div className="practice-questions-section" style={{ marginTop: '40px', padding: '24px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ color: '#1f2937', margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Practice Questions ({formData.questions?.length || 0})</h3>
            <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '0.85rem' }}>Thêm câu hỏi luyện tập cho bài học này tại đây (các câu hỏi sẽ không gắn liền với từ vựng cụ thể nào).</p>
          </div>
          <button 
            onClick={() => {
              setActiveVocabIndex(-1);
              setModalOpen(true);
            }}
            className="admin-btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontSize: '0.9rem' }}
          >
            <ListChecks size={18} /> Manage Questions
          </button>
        </div>
        
        {formData.questions && formData.questions.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {formData.questions.map((q, qIndex) => (
              <div key={qIndex} className="question-item" style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="question-type-badge" style={{ padding: '4px 8px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  {q.question_type || 'multiple_choice'}
                </span>
                <span style={{ color: '#1f2937', flex: 1, fontWeight: 500, fontSize: '0.95rem' }}>
                  {qIndex + 1}. {q.question_text}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <p style={{ color: '#6b7280', fontSize: '0.95rem', margin: 0, fontStyle: 'italic' }}>
              Chưa có câu hỏi luyện tập nào cho bài học này.
            </p>
          </div>
        )}
      </div>

      {modalOpen && (
        <QuizBuilderModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          initialQuestions={activeVocabIndex === -1 ? (formData.questions || []) : (vocabularies[activeVocabIndex]?.questions || [])}
          onSave={handleSaveQuestions}
        />
      )}
    </div>
  );
};

export default Step3Vocabulary;
