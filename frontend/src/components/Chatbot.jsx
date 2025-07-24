import React, { useState, useRef, useEffect } from 'react';
import {
  Moon,
  Sun,
  Trash2,
  Send,
  Copy,
  User,
  Bot,
  Clock,
  Heart,
  Hotel
} from 'lucide-react';
import StarryBackground from './StarryBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const SUGGESTIONS = [
  { text: "I can't sleep properly at night. What can I do?", icon: <Moon size={24} /> },
  { text: "How many hours of sleep are ideal for adults?", icon: <Clock size={24} /> },
  { text: "What are some tips for better sleep hygiene?", icon: <Heart size={24} /> },
  { text: "Can afternoon naps affect nighttime sleep?", icon: <Hotel size={24} /> },
];

const LANGUAGES = [
  { code: '', name: 'English', disabled: true },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'or', name: 'Odia' },
  { code: 'as', name: 'Assamese' },
  { code: 'ur', name: 'Urdu' },
  { code: 'ne', name: 'Nepali' },
];

const API_BASE = 'http://localhost:5000/api';

const Chatbot = () => {
  const [theme, setTheme] = useState('dark');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [translatingId, setTranslatingId] = useState(null);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);
  const endOfMessagesRef = useRef(null);
  const navigate = useNavigate();
  // Typing status animation
  const [typingStatus, setTypingStatus] = useState('Thinking...');
  const [typingIcon, setTypingIcon] = useState('💭');
  useEffect(() => {
    if (isLoading) {
      const statuses = [
        { text: 'Thinking...', icon: '💭', delay: 3200 },
        { text: 'Reasoning...', icon: '🧠', delay: 2200 },
        { text: 'Generating...', icon: '⚙️', delay: 2200 },
        { text: 'Typing...', icon: '⌨️', delay: 2200 },
      ];
      let idx = 0;
      setTypingStatus(statuses[0].text);
      setTypingIcon(statuses[0].icon);
      let timeout;
      function nextStatus() {
        if (!isLoading) return;
        if (idx < statuses.length) {
          setTypingStatus(statuses[idx].text);
          setTypingIcon(statuses[idx].icon);
          timeout = setTimeout(() => {
            idx++;
            nextStatus();
          }, statuses[idx].delay);
        }
      }
      nextStatus();
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
    document.body.classList.toggle('light_mode', theme === 'light');
    document.body.classList.toggle('hide-header', !showHeader);
  }, [theme, showHeader]);

  // Scroll to bottom when messages or loading state changes
  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setError(null);
    const userMsg = {
      id: Date.now(),
      type: 'user',
      text: input.trim(),
      lang: '',
      translated: '',
    };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setShowHeader(false);
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text }),
      });
      if (!res.ok) throw new Error('Failed to fetch bot response');
      const data = await res.json();
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: data.reply,
        lang: '',
        translated: '',
      };
      setMessages((msgs) => [...msgs, botMsg]);
    } catch (err) {
      setError('Failed to get response from server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestion = (text) => {
    setInput(text);
    setTimeout(() => {
      handleSend({ preventDefault: () => {} });
    }, 100);
  };

  const handleThemeToggle = () => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  };

  const handleDeleteChat = () => {
    if (window.confirm('Are you sure you want to delete all the chats?')) {
      setMessages([]);
      setShowHeader(true);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleTranslate = async (id, lang) => {
    if (!lang) return;
    setTranslatingId(id);
    setError(null);
    try {
      const msg = messages.find((m) => m.id === id);
      const res = await fetch(`${API_BASE}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg.text, lang }),
      });
      if (!res.ok) throw new Error('Failed to fetch translation');
      const data = await res.json();
      setMessages((msgs) =>
        msgs.map((m) =>
          m.id === id
            ? { ...m, lang, translated: data.translated_text }
            : m
        )
      );
    } catch (err) {
      setError('Failed to get translation from server.');
    } finally {
      setTranslatingId(null);
    }
  };

  return (
    <div className={`min-h-screen relative transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900/80 text-gray-100' : 'bg-white/80 text-gray-900'}`}>
      <StarryBackground />
      {/* Back button */}
      <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 20 }}>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 dark:bg-gray-900/80 shadow hover:bg-white/90 dark:hover:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 transition"
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
      </div>
      {/* Overlay content above the starry background */}
      <div className="relative z-10">
        {showHeader && (
          <header className="max-w-4xl mx-auto pt-16 px-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
                  MedBot
                </h1>
                <p className={`text-4xl font-semibold mt-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent drop-shadow-md`}>How can I help you?</p>
              </div>
            </div>
            <ul className="flex gap-5 mt-12 overflow-x-auto pb-2">
              {SUGGESTIONS.map((s, i) => (
                <li key={i} className={`cursor-pointer p-5 w-[222px] flex flex-col items-end rounded-xl ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} shadow-lg`} onClick={() => handleSuggestion(s.text)}>
                  <h4 className="text text-lg font-normal">{s.text}</h4>
                  <span className={`w-10 h-10 flex items-center justify-center text-2xl mt-10 rounded-full ${theme === 'dark' ? 'bg-gradient-to-br from-purple-700 to-blue-700 text-white' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'}`}>{s.icon}</span>
                </li>
              ))}
            </ul>
          </header>
        )}
        <div ref={chatRef} className="max-w-4xl mx-auto px-4 pt-4 pb-48 min-h-[40vh] overflow-y-auto" style={{scrollBehavior: 'smooth', position: 'relative'}}>
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex gap-4 mb-6 ${msg.type === 'bot' ? 'incoming' : 'outgoing'} items-start animate-fade-in-slide`}
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <span className={`w-10 h-10 flex items-center justify-center rounded-full text-2xl ${msg.type === 'bot' ? (theme === 'dark' ? 'bg-gradient-to-br from-purple-700 to-blue-700 text-white' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white') : (theme === 'dark' ? 'bg-gradient-to-br from-blue-700 to-cyan-700 text-white' : 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white')}`}>
                {msg.type === 'bot' ? <Bot size={24} /> : <User size={24} />}
              </span>
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col w-full gap-1">
                    <span className="whitespace-pre-wrap flex items-center gap-2">
                      {msg.text}
                      {msg.type === 'bot' && (msg.translated ? (
                        <button className={`w-7 h-7 flex items-center justify-center rounded-full hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} onClick={() => handleCopy(msg.text)} title="Copy original English text">
                          <Copy size={18} />
                          <span className="sr-only">Copy original</span>
                        </button>
                      ) : (
                        <button className={`w-7 h-7 flex items-center justify-center rounded-full hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} onClick={() => handleCopy(msg.text)} title="Copy">
                          <Copy size={18} />
                        </button>
                      ))}
                    </span>
                    {msg.translated && (
                      <span className={`italic border-t pt-2 flex items-center gap-2 ${theme === 'dark' ? 'text-yellow-200 border-gray-700' : 'text-yellow-700 border-gray-300'}`}>
                        {msg.translated}
                        <button className={`w-7 h-7 flex items-center justify-center rounded-full hover:${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} onClick={() => handleCopy(msg.translated)} title="Copy translated text">
                          <Copy size={18} />
                          <span className="sr-only">Copy translated</span>
                        </button>
                      </span>
                    )}
                    {translatingId === msg.id && (
                      <span className={`flex items-center gap-2 mt-2 pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                        <span className={`w-6 h-6 border-2 ${theme === 'dark' ? 'border-yellow-400 border-t-transparent' : 'border-yellow-700 border-t-transparent'} rounded-full animate-spin`}></span>
                        <span>Translating...</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {msg.type === 'bot' && (
                      <>
                        <select
                          className={`px-2 py-1 rounded ${theme === 'dark' ? 'bg-gray-800 text-gray-100' : 'bg-gray-200 text-gray-900'}`}
                          value={msg.lang || ''}
                          onChange={(e) => handleTranslate(msg.id, e.target.value)}
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code} disabled={l.disabled}>{l.name}</option>
                          ))}
                        </select>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 mb-6 incoming items-start">
              <span className={`w-10 h-10 flex items-center justify-center rounded-full text-2xl ${theme === 'dark' ? 'bg-gradient-to-br from-purple-700 to-blue-700 text-white' : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white'}`}><Bot size={24} /></span>
              <div className="flex-1">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{typingIcon}</span>
                      <span className="font-semibold text-base animate-pulse">{typingStatus}</span>
                    </div>
                    <div className={`h-3 w-full rounded bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse bg-[length:200%_100%]`}></div>
                    <div className={`h-3 w-3/4 rounded bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse bg-[length:200%_100%]`}></div>
                    <div className={`h-3 w-1/2 rounded bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse bg-[length:200%_100%]`}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-center my-4">{error}</div>
          )}
          <div ref={endOfMessagesRef} />
        </div>
        <div className={`fixed w-full left-0 bottom-0 p-4 ${theme === 'dark' ? 'bg-gray-900/90' : 'bg-white/90'} z-10`}>
          <form className="flex gap-3 max-w-4xl mx-auto" onSubmit={handleSend} autoComplete="off">
            <div className="flex-1 h-14 flex relative">
              <input
                type="text"
                className={`h-full w-full border-none outline-none resize-none text-base px-6 pr-16 rounded-full ${theme === 'dark' ? 'bg-gray-800 text-gray-100 focus:bg-gray-700' : 'bg-gray-200 text-gray-900 focus:bg-gray-100'}`}
                placeholder="Write Something"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
              />
              <button
                type="submit"
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-full text-2xl transition-transform duration-200 ${input.trim() ? 'scale-100' : 'scale-0'} ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
              >
                <Send size={20} />
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <span
                className={`w-14 h-14 flex items-center justify-center rounded-full text-2xl cursor-pointer ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={handleThemeToggle}
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </span>
              <span
                className={`w-14 h-14 flex items-center justify-center rounded-full text-2xl cursor-pointer ${theme === 'dark' ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'}`}
                onClick={handleDeleteChat}
                title="Delete chat"
              >
                <Trash2 size={20} />
              </span>
            </div>
          </form>
          <p className="text-center text-sm mt-2 text-gray-400">
            While the chatbot provides helpful information, always verify details for accuracy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;