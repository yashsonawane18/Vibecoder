'use client';
import { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/leaderboard');
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users || []);
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const tierStyles = {
    'Novice': 'bg-gray-100 text-gray-700',
    'Expert': 'bg-blue-100 text-blue-700', 
    'Master': 'bg-purple-100 text-purple-700',
    'Grandmaster': 'bg-amber-100 text-amber-700'
  };

  const tierEmojis = {
    'Novice': '🌱',
    'Expert': '⭐',
    'Master': '💎',
    'Grandmaster': '👑'
  };

  const getMedal = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">🏆 Mentor Leaderboard</h1>
        <p className="text-lg text-gray-600">Recognizing our top contributors</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center text-gray-500 text-lg">
          No contributors yet. Answer questions to appear here!
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rank</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mentor</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Points</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tier</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className={`${index < 3 ? 'bg-yellow-50/30' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-indigo-50/50 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-xl font-bold ${index < 3 ? 'text-gray-900' : 'text-gray-500'}`}>
                        {getMedal(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-indigo-600">{user.points.toLocaleString()} pts</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full ${tierStyles[user.tier] || tierStyles['Novice']} items-center gap-1.5`}>
                        {tierEmojis[user.tier] || tierEmojis['Novice']} {user.tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
