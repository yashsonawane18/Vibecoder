import React from 'react';

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

export default function BestFitAnswerCard({ answer }) {
  if (!answer) return null;

  return (
    <div className="bg-emerald-50 rounded-lg p-6 border-2 border-emerald-400 shadow-sm relative overflow-hidden mb-6">
      <div className="absolute top-0 right-0">
        <div className="badge-bestfit bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
          ✅ AI Selected Top Solution
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4 mt-2">
        <span className="font-medium text-gray-900">{answer.authorName}</span>
        <span className={`badge-role badge-${answer.authorRole.toLowerCase()}`}>
          {answer.authorRole}
        </span>
        <span className="text-xs text-gray-500 mx-1">•</span>
        <span className="text-xs text-gray-500">{formatTimeAgo(answer.createdAt)}</span>
      </div>
      
      <div className="text-gray-800 mb-4 whitespace-pre-wrap text-sm leading-relaxed">
        {answer.body}
      </div>

      {answer.bestFitReason && (
        <div className="mt-4 bg-emerald-100/50 rounded p-3 border border-emerald-200">
          <p className="text-sm text-emerald-800 italic">
            <span className="font-semibold not-italic mr-1">AI Reasoning:</span>
            {answer.bestFitReason}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-emerald-200/60">
        <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
          Votes: {answer.votes || 0}
        </span>
      </div>
    </div>
  );
}
