import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StarryBackground from '../components/StarryBackground';

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user is authenticated
    const user = localStorage.getItem('user');
    if (user) {
      setUserData(JSON.parse(user));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUserData(null);
  };

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen relative">
      <StarryBackground />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6">
            Sleep Analysis Project
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Discover the secrets to better sleep with our comprehensive analysis platform.
            Track, analyze, and improve your sleep patterns for a healthier life.
          </p>
          {!isAuthenticated ? (
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/login"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transform transition-all duration-300 hover:scale-105"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transform transition-all duration-300 hover:scale-105"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="mt-8 flex flex-col items-center gap-4">
              <p className="text-xl text-white">
                Welcome back, {userData?.name}!
              </p>
              <button
                onClick={handleStartQuiz}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transform transition-all duration-300 hover:scale-105"
              >
                Attempt Quiz
              </button>
              <button
                onClick={handleLogout}
                className="px-8 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transform transition-all duration-300 hover:scale-105"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl w-full grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Sleep Tracking</h3>
            <p className="text-gray-300">Monitor your sleep patterns and quality with detailed analytics and insights.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Analysis</h3>
            <p className="text-gray-300">Get detailed insights about your sleep patterns and quality over time.</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 transform transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Recommendations</h3>
            <p className="text-gray-300">Receive personalized tips and recommendations for better sleep quality.</p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl w-full">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8 text-center">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-gray-300 mb-4">"This platform has completely transformed my sleep habits. The insights are incredibly helpful!"</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></div>
                <div className="ml-4">
                  <p className="text-white font-semibold">Sarah Johnson</p>
                  <p className="text-gray-400 text-sm">Sleep Quality Improved by 40%</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-gray-300 mb-4">"The personalized recommendations are spot on. I'm sleeping better than ever before."</p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full"></div>
                <div className="ml-4">
                  <p className="text-white font-semibold">Michael Chen</p>
                  <p className="text-gray-400 text-sm">Consistent Sleep Schedule</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index; 