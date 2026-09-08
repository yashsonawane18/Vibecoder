'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AnswerSection from '@/components/AnswerSection';
import VoiceButton from '@/components/VoiceButton';
import PdfExportButton from '@/components/PdfExportButton';

export default function QuestionDetail() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const fetchQuestionAndAnswers = async () => {
    try {
      const res = await fetch(`/api/questions/${id}`);
      if (res.ok) {
        const data = await res.json();
        setQuestion(data.question);
        setAnswers(data.answers || []);
      }
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchQuestionAndAnswers();
    }
  }, [id]);

  const handleNewAnswer = async (formData) => {
    try {
      const res = await fetch(`/api/questions/${id}/answers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchQuestionAndAnswers();
      }
    } catch (error) {
      console.error('Error posting answer:', error);
    }
  };

  const handleVote = async (answerId, direction) => {
    try {
      const res = await fetch(`/api/questions/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId, direction }),
      });
      if (res.ok) {
        fetchQuestionAndAnswers();
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const handleTriggerAI = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/questions/${id}/best-fit`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchQuestionAndAnswers();
      }
    } catch (error) {
      console.error('Error triggering AI:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Question not found</h2>
        <Link href="/" className="text-indigo-600 hover:underline">← Back to Forum</Link>
      </div>
    );
  }

  const bestFitAnswer = answers.find(a => a.isBestFit);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/" className="inline-block text-indigo-600 hover:underline mb-6 font-medium">
        ← Back to Forum
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {question.subject}
          </span>
          <span className="text-gray-500 text-sm">
            {new Date(question.createdAt).toLocaleDateString()}
          </span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{question.title}</h1>
        <p className="text-gray-700 whitespace-pre-wrap mb-6">{question.body}</p>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
            {question.authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-gray-900">{question.authorName}</div>
            <div className="text-xs text-gray-500 capitalize">{question.authorRole}</div>
          </div>
        </div>

        {question.aiAnswer && (
          <div className="mt-6 border border-indigo-200 bg-gradient-to-br from-indigo-50/90 via-purple-50/70 to-pink-50/50 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-indigo-900 flex items-center gap-2 text-base">
                <span className="text-xl">🤖</span> AI Instant Answer
              </h3>
              <VoiceButton mode="speak" text={question.aiAnswer} />
            </div>
            <div className="text-gray-800 text-sm whitespace-pre-wrap leading-relaxed bg-white/70 p-4 rounded-lg border border-indigo-100/80">
              {question.aiAnswer}
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-100 flex flex-wrap gap-4">
          <VoiceButton mode="speak" text={question.body} />
          <PdfExportButton question={question} answers={answers} bestFitAnswer={bestFitAnswer} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-900">{answers.length} Answers</h2>
        {answers.length >= 2 && (
          <button 
            onClick={handleTriggerAI}
            disabled={analyzing}
            className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-200 font-medium text-sm flex items-center gap-2"
          >
            {analyzing ? (
              <><div className="w-4 h-4 rounded-full border-2 border-indigo-700 border-t-transparent animate-spin"></div> Analyzing...</>
            ) : (
              '✨ Trigger AI Analysis'
            )}
          </button>
        )}
      </div>

      <AnswerSection 
        answers={answers} 
        questionId={question.id} 
        onNewAnswer={handleNewAnswer}
        onVote={handleVote}
      />
    </div>
  );
}
