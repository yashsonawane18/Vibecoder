'use client'

import React, { useState } from 'react';
import BestFitAnswerCard from '@/components/BestFitAnswerCard';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
};

export default function AnswerSection({ answers, questionId, onNewAnswer, onVote }) {
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('Peer');
  const [body, setBody] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!body.trim() || !authorName.trim()) return;
    onNewAnswer({ body, authorName, authorRole: authorRole.toLowerCase() });
    setBody('');
    setAuthorName('');
    setAuthorRole('Peer');
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Answers ({answers?.length || 0})</h2>
      
      {(!answers || answers.length === 0) ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500 mb-8 border border-gray-200">
          No answers yet. Be the first to help!
        </div>
      ) : (
        <div className="space-y-6 mb-8">
          {answers.map(answer => (
            answer.isBestFit ? (
              <BestFitAnswerCard key={answer.id} answer={answer} />
            ) : (
              <div key={answer.id} className="bg-white rounded-lg p-6 border shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{answer.authorName}</span>
                    <span className={`badge-role badge-${answer.authorRole.toLowerCase()}`}>
                      {answer.authorRole}
                    </span>
                    <span className="text-xs text-gray-500 mx-1">•</span>
                    <span className="text-xs text-gray-500">{formatTimeAgo(answer.createdAt)}</span>
                  </div>
                </div>
                
                <div className="text-gray-800 mb-4 whitespace-pre-wrap text-sm leading-relaxed">
                  {renderMarkdown(answer.body)}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <button 
                    onClick={() => onVote(answer.id, 'up')}
                    className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-indigo-600 transition-colors font-bold"
                  >
                    ▲
                  </button>
                  <span className="font-medium text-gray-700 min-w-[20px] text-center">
                    {answer.votes || 0}
                  </span>
                  <button 
                    onClick={() => onVote(answer.id, 'down')}
                    className="p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600 transition-colors font-bold"
                  >
                    ▼
                  </button>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Your Answer</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
                required
              />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              >
                <option value="Senior">Senior</option>
                <option value="Faculty">Faculty</option>
                <option value="Peer">Peer</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Answer</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2 border"
              required
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="btn-primary bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium shadow-sm transition-colors">
              Submit Answer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
