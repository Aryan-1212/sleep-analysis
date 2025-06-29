import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StarryBackground from '../components/StarryBackground';
import EnhancedRecommendations from '../components/EnhancedRecommendations';

const Dashboard = () => {
  const [quizHistory, setQuizHistory] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUserData(currentUser);

    const fetchQuizHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/results/${currentUser.email}`);
        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }
        const data = await response.json();
        if (data.success) {
          setQuizHistory(data.results);
        }
      } catch (error) {
        console.error('Error fetching quiz history:', error);
        // Handle error display if needed
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizHistory();
  }, [navigate]);

  const handleStartQuiz = () => {
    navigate('/questions');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <StarryBackground />
        <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-4">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  const latestResult = quizHistory.length > 0 ? quizHistory[0] : null;

  return (
    <div className="min-h-screen relative">
      <StarryBackground />
      
      <div className="relative z-10 min-h-screen py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">Dashboard</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-2">
                Welcome, {userData.name}!
              </h2>
              <p className="text-gray-300">
                {latestResult ? 'Here is your latest sleep analysis:' : 'You haven\'t taken the quiz yet.'}
              </p>
            </div>

            {latestResult ? (
              <div className="space-y-8">
                {/* Sleep Score and Effectiveness */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-xl p-6 text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">Sleep Score</h3>
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                      {latestResult.sleep_score}
                    </div>
                    <p className="text-gray-300 mt-2">out of 53</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-6 text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">Sleep Effectiveness</h3>
                    <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      {latestResult.effectiveness_percentage}%
                    </div>
                    <p className="text-gray-300 mt-2">
                      {latestResult.effectiveness_percentage < 50 ? 'Needs Improvement' : 
                       latestResult.effectiveness_percentage < 75 ? 'Good' : 'Excellent'}
                    </p>
                  </div>
                </div>

                {/* Enhanced Recommendations - Using the new component */}
                <EnhancedRecommendations 
                  recommendations={latestResult.recommendations}
                  sleepScore={latestResult.sleep_score}
                  effectiveness={latestResult.effectiveness_percentage}
                />

                <div className="text-center">
                  <button
                    onClick={handleStartQuiz}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                  >
                    Take a New Quiz
                  </button>
                </div>

                {/* Quiz History Section */}
                {quizHistory.length > 1 && (
                  <div className="bg-white/5 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Your Quiz History</h3>
                    <div className="space-y-4">
                      {quizHistory.slice(1).map((result) => (
                        <div key={result.id} className="bg-black/20 p-4 rounded-lg">
                          <p className="text-white font-medium">
                            Quiz taken on {new Date(result.timestamp).toLocaleString()}
                          </p>
                          <p className="text-gray-300 text-sm">
                            Score: {result.sleep_score} | Effectiveness: {result.effectiveness_percentage}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-300 mb-6">
                  Take our sleep analysis quiz to get personalized insights about your sleep patterns.
                </p>
                <button
                  onClick={handleStartQuiz}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
                >
                  Start Quiz
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;