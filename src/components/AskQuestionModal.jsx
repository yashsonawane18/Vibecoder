'use client'

import React, { useState, useEffect, useCallback } from 'react';
import RedundancyAlert from '@/components/RedundancyAlert';
import VoiceButton from '@/components/VoiceButton';

const SUBJECTS = ['Computer Science', 'Mathematics', 'Physics', 'Electronics', 'General'];

export default function AskQuestionModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [authorName, setAuthorName] = useState('');
  const [mode, setMode] = useState('mentor');
  const [duplicates, setDuplicates] = useState(null);
  
  const checkDuplicates = useCallback(async (searchTitle, searchSubject) => {
    if (!searchTitle.trim()) {
      setDuplicates(null);
      return;
    }
    try {
      const response = await fetch('/api/questions/check-duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: searchTitle, body: '', subject: searchSubject })
      });
      if (response.ok) {
        const data = await response.json();
        setDuplicates(data.duplicates?.length > 0 ? data.duplicates : null);
      }
    } catch (err) {
      console.error('Error checking duplicates:', err);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      checkDuplicates(title, subject);
    }, 500);
    return () => clearTimeout(handler);
  }, [title, subject, checkDuplicates]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim() || !authorName.trim()) return;
    
    onSubmit({
      title,
      body,
      subject,
      authorName,
      authorRole: 'student',
      mode
    });
    
    // Reset
    setTitle('');
    setBody('');
    setAuthorName('');
    setSubject(SUBJECTS[0]);
    setMode('mentor');
    setDuplicates(null);
    onClose();
  };

  const handleVoiceResult = (transcript) => {
    setBody(prev => prev ? `${prev} ${transcript}` : transcript);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Ask Your Doubt</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-sm mx-auto mb-6">
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'ai' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setMode('ai')}
            >
              🤖 Ask AI
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${mode === 'mentor' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}
              onClick={() => setMode('mentor')}
            >
              👨‍🏫 Ask Mentors
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              placeholder="e.g., How does quicksort work?"
              required
            />
            {duplicates && <div className="mt-3"><RedundancyAlert duplicates={duplicates} /></div>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <VoiceButton mode="listen" onResult={handleVoiceResult} />
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              placeholder="Provide more details about your doubt..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              placeholder="Your Name"
              required
            />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 font-medium"
            >
              Post Doubt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
