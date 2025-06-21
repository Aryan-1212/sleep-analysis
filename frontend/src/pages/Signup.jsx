import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import StarryBackground from '../components/StarryBackground';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!name || !email || !password) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Automatically log the user in by saving their info
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative">
      <StarryBackground />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-center text-white mb-8">Create Your Account</h2>
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 bg-white/10 text-white rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none transition"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-white/10 text-white rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none transition"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-white/10 text-white rounded-lg border-2 border-transparent focus:border-purple-500 focus:outline-none transition"
                placeholder="Create a password"
              />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:opacity-90 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </div>
          </form>
          <p className="text-center text-gray-300 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-purple-400 hover:text-purple-300">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup; 