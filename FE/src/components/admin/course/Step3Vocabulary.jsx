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
    const newVocabs = [...vocabularies];
    newVocabs[activeVocabIndex].questions = questions;
    setVocabularies(newVocabs);
    updateForm(newVocabs);
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

            <div className="vocab-questions-section" style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px dashed #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '10px', gap: '15px' }}>
                  <h4 style={{ color: '#4b5563', margin: 0, fontSize: '0.95rem' }}>Questions ({vocab.questions?.length || 0})</h4>
                  <button 
                    onClick={() => openQuizModal(index)}
                    className="admin-btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.85rem' }}
                  >
                  <ListChecks size={16} /> Manage Questions
                </button>
              </div>
              
              {vocab.questions && vocab.questions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {vocab.questions.map((q, qIndex) => (
                    <div key={qIndex} className="question-item">
                      <span style={{ color: '#6b7280', fontSize: '0.85rem' }}>{q.question_type}</span>
                      <span style={{ color: '#1f2937', flex: 1, margin: '0 15px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {q.question_text}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#6b7280', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                  No questions added for this vocabulary.
                </p>
              )}
            </div>

          </div>
        ))}

          <button onClick={addVocabulary} className="admin-btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start' }}>
          <Plus size={20} /> Add Vocabulary
        </button>
      </div>

      {modalOpen && (
        <QuizBuilderModal 
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          initialQuestions={vocabularies[activeVocabIndex]?.questions || []}
          onSave={handleSaveQuestions}
        />
      )}
    </div>
  );
};

export default Step3Vocabulary;
