import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Questions from './pages/questions';
import Dashboard from './pages/Dashboard';
import ChatBot from './components/Chatbot';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/questions" element={<Questions />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/quiz" element={<Questions />} />
        <Route path="/chat" element={<ChatBot />} />
      </Routes>
    </Router>
  );
}

export default App;