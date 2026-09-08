'use client';
import { useState, useEffect } from 'react';
import QuestionCard from '@/components/QuestionCard';
import AskQuestionModal from '@/components/AskQuestionModal';

export default function Home() {
  const [questions, setQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const subjects = ['All', 'Computer Science', 'Mathematics', 'Physics', 'Electronics', 'General'];

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const url = selectedSubject === 'All' ? '/api/questions' : `/api/questions?subject=${encodeURIComponent(selectedSubject)}`;
      const res = await fetch(url);
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject]);

  const handleModalSubmit = async (formData) => {
    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error submitting question:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Doubt Forum</h1>
        <p className="text-gray-600">Your centralized platform for academic Q&A</p>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={`px-4 py-2 rounded-full border transition-colors ${selectedSubject === subject ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
          >
            {subject}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No questions yet. Be the first to ask!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium z-50"
      >
        <span className="text-xl">✍️</span> Ask a Doubt
      </button>

      <AskQuestionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
