'use client'

import React from 'react';
import Link from 'next/link';
import VoiceButton from '@/components/VoiceButton';

const subjectBadgeClass = {
  'Computer Science': 'badge-cs',
  'Mathematics': 'badge-math',
  'Physics': 'badge-physics',
  'Electronics': 'badge-electronics',
  'General': 'badge-general'
};

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

export default function QuestionCard({ question }) {
  if (!question) return null;

  return (
    <div className="card block hover:shadow-md transition-shadow relative bg-white rounded-lg p-6 border mb-4">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className={`badge-subject ${subjectBadgeClass[question.subject] || 'badge-general'}`}>
            {question.subject}
          </span>
          {question.aiAnswer && (
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
              🤖 AI Answered
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <VoiceButton mode="speak" text={question.title} />
        </div>
      </div>
      
      <Link href={`/question/${question.id}`} className="block mt-3 group">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
          {question.title}
        </h3>
        <p className="text-gray-600 mt-2 text-sm line-clamp-2">
          {question.body.length > 120 ? `${question.body.substring(0, 120)}...` : question.body}
        </p>
      </Link>

      {question.aiAnswer && (
        <div className="mt-3 p-3.5 bg-gradient-to-br from-indigo-50/90 to-purple-50/70 border border-indigo-100 rounded-lg text-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-800 mb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="text-base">🤖</span> Instant AI Solution
            </span>
            <VoiceButton mode="speak" text={question.aiAnswer} />
          </div>
          <p className="text-gray-700 text-xs line-clamp-3 leading-relaxed whitespace-pre-line">
            {question.aiAnswer}
          </p>
          <Link href={`/question/${question.id}`} className="inline-block mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-800 underline">
            Read full solution & discussion →
          </Link>
        </div>
      )}

      <div className="flex justify-between items-center mt-4 pt-4 border-t text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <span className="font-medium text-gray-900">{question.authorName}</span>
          <span className={`badge-role badge-${question.authorRole.toLowerCase()}`}>
            {question.authorRole}
          </span>
          <span className="mx-1">•</span>
          <span>{formatTimeAgo(question.createdAt)}</span>
        </div>
        <div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            question.status === 'open' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {question.status === 'open' ? 'Open' : 'Resolved'}
          </span>
        </div>
      </div>
    </div>
  );
}
