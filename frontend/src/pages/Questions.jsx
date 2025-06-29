import { useState } from 'react';
import StarryBackground from '../components/StarryBackground';
import { MoonAnimation, CardAnimations } from '../components/QuizAnimations';
import { useNavigate } from 'react-router-dom';

const Questions = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const navigate = useNavigate();

  const questions = [
    {
      question: "What is your age group?",
      options: ["0–12 (Children)", "13–18 (Adolescents)", "19–30 (Young Adults)", "31+ (Adults & Seniors)"]
    },
    {
      question: "On average, how many hours do you sleep at night?",
      options: ["Less than 4 hours", "4–6 hours", "6–8 hours", "More than 8 hours"]
    },
    {
      question: "How often do you have trouble falling asleep?",
      options: ["Never", "Occasionally", "Frequently", "Always"]
    },
    {
      question: "Do you wake up feeling well-rested?",
      options: ["Always", "Often", "Sometimes", "Never"]
    },
    {
      question: "How often do you feel tired or drowsy during the day?",
      options: ["Never", "Rarely", "Frequently", "Every day"]
    },
    {
      question: "Do you face difficulty concentrating or staying focused during the day?",
      options: ["Never", "Occasionally", "Often", "Always"]
    },
    {
      question: "How often do you feel anxious or nervous?",
      options: ["Never", "Sometimes", "Often", "Always"]
    },
    {
      question: "How would you describe your current emotional state?",
      options: ["Happy and content", "Occasionally stressed", "Often overwhelmed", "Mentally distressed"]
    },
    {
      question: "Have you experienced trauma that continues to disturb your sleep?",
      options: ["No trauma", "Yes, but sleep unaffected", "Yes, occasionally affects sleep", "Yes, frequently affects sleep"]
    },
    {
      question: "Do you often worry excessively about the future or daily tasks before bed?",
      options: ["Never", "Occasionally", "Frequently", "Always"]
    },
    {
      question: "Do you dwell on past events (rumination) before falling asleep?",
      options: ["Never", "Occasionally", "Frequently", "Always"]
    },
    {
      question: "Do you experience chronic worry that keeps your mind active at night?",
      options: ["Never", "Occasionally", "Frequently", "Always"]
    },
    {
      question: "How often do you use mobile or digital devices before sleeping?",
      options: ["Never", "Occasionally", "Most nights", "Every night"]
    },
    {
      question: "How often do you consume caffeinated drinks (tea/coffee/energy drinks) after evening?",
      options: ["Never", "Rarely", "Frequently", "Daily"]
    },
    {
      question: "Do you have someone to talk to when you feel mentally low or stressed?",
      options: ["Always", "Most of the time", "Sometimes", "Never"]
    },
    {
      question: "How would you describe the environment at your home/school/work?",
      options: ["Very supportive", "Somewhat supportive", "Neutral", "Stressful and unsupportive"]
    },
    {
      question: "How often does bright lighting in your room affect your ability to sleep?",
      options: ["Never", "Sometimes", "Often", "Always"]
    },
    {
      question: "How would you rate the noise level in your sleeping environment?",
      options: ["Very quiet", "Mostly quiet", "Occasionally noisy", "Very noisy"]
    },
    {
      question: "How often does your sleeping environment (room temperature, bedding, etc.) feel uncomfortable?",
      options: ["Never", "Sometimes", "Often", "Always"]
    },
    {
      question: "Do you experience any physical pain or discomfort while trying to sleep?",
      options: ["Never", "Occasionally", "Often", "Always"]
    },
    {
      question: "How often do you exercise during the day?",
      options: ["Never", "Occasionally", "Regularly", "Daily"]
    },
    {
      question: "How would you rate your stress levels before bedtime?",
      options: ["Very low", "Moderate", "High", "Extremely high"]
    },
    {
      question: "How often do you take naps during the day?",
      options: ["Never", "Rarely", "Sometimes", "Daily"]
    },
    {
      question: "How would you describe your bedtime routine?",
      options: ["Consistent and relaxing", "Somewhat consistent", "Inconsistent", "No routine"]
    },
    {
      question: "How often do you feel refreshed after waking up?",
      options: ["Always", "Often", "Sometimes", "Rarely"]
    }
  ];

  const colors = [
    'from-purple-600 to-pink-600',
    'from-blue-600 to-cyan-600',
    'from-green-600 to-emerald-600',
    'from-orange-600 to-red-600',
    'from-indigo-600 to-purple-600'
  ];

  const currentColor = colors[currentQuestion % colors.length];

  const handleAnswer = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestion]: answer
    });
    setSelectedOption(answer);
  };

  const sendToBackend = async () => {
    try {
      setIsLoading(true);
      
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser || !currentUser.email) {
        alert('You must be logged in to submit a quiz.');
        navigate('/login');
        return;
      }

      // Transform answers to the format expected by backend
      const transformedAnswers = {};
      questions.forEach((q, index) => {
        if (answers[index] !== undefined) {
          transformedAnswers[q.question] = answers[index];
        }
      });

      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: currentUser.email,
          answers: transformedAnswers
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // We no longer need to save to local storage here,
        // as the dashboard will fetch the latest results from the DB.
        // However, we can pass the result to the results page directly.
        setPredictionResult(result);
        setShowResults(true);
      } else {
        throw new Error(result.error || 'Prediction failed');
      }
    } catch (error) {
      console.error('Error sending data to backend:', error);
      alert('Failed to get prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      // Get current user's email
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) {
        alert('Please login to save your results');
        navigate('/login');
        return;
      }

      // Send data to backend for prediction
      sendToBackend();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <StarryBackground />
        <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 transform transition-all duration-500 hover:scale-[1.02] relative mt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-3"></div>
            <h2 className="text-xl font-bold text-white mb-3">Analyzing Your Sleep Patterns...</h2>
            <p className="text-gray-300 text-sm">Please wait while we process your responses and generate personalized recommendations.</p>
          </div>
        </div>
      </div>
    );
  }

  if (showResults && predictionResult) {
    return (
      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <StarryBackground />
        <MoonAnimation />
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 transform transition-all duration-500 hover:scale-[1.02] border border-white/20 relative mt-20">
          <CardAnimations />
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-6 text-center">
            Your Sleep Analysis Results
          </h2>
          
          {/* Sleep Score and Effectiveness */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Sleep Score</h3>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                {predictionResult.sleep_score}
              </div>
              <p className="text-gray-300 mt-1 text-sm">out of 53</p>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <h3 className="text-lg font-semibold text-white mb-2">Sleep Effectiveness</h3>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {predictionResult.effectiveness_percentage}%
              </div>
              <p className="text-gray-300 mt-1 text-sm">
                {predictionResult.effectiveness_percentage < 50 ? 'Needs Improvement' : 
                 predictionResult.effectiveness_percentage < 75 ? 'Good' : 'Excellent'}
              </p>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Personalized Recommendations</h3>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap text-xs text-gray-300 font-mono bg-black/20 p-3 rounded-lg overflow-x-auto max-h-32 overflow-y-auto">
                {predictionResult.recommendations}
              </pre>
            </div>
          </div>

          {/* Your Answers Summary */}
          <div className="bg-white/5 rounded-xl p-4 mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Your Responses Summary</h3>
            <div className="grid md:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
              {questions.map((q, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-2">
                  <p className="text-white font-medium text-xs mb-1">{q.question}</p>
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 text-xs">
                    {answers[index]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentQuestion(0);
                setAnswers({});
                setSelectedOption(null);
                setPredictionResult(null);
              }}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Retake Quiz
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 px-4 rounded-xl hover:from-blue-700 hover:to-cyan-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <StarryBackground />
      <MoonAnimation />
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-6 transform transition-all duration-500 border border-white/20 relative mt-20">
        <CardAnimations />
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Sleep Analysis Quiz
            </h2>
            <span className="text-white bg-white/10 px-3 py-1 rounded-full text-sm">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${currentColor} transition-all duration-500 ease-out`}
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-4 transform transition-all duration-300">
            {questions[currentQuestion].question}
          </h3>
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  answers[currentQuestion] === option
                    ? `bg-gradient-to-r ${currentColor} text-white border-transparent`
                    : selectedOption === option
                    ? 'bg-white/20 border-purple-300 text-white'
                    : 'border-white/20 hover:border-purple-300 hover:bg-white/10 text-white'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className={`flex-1 py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              currentQuestion === 0
                ? 'bg-white/10 cursor-not-allowed text-white/50'
                : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion]}
            className={`flex-1 py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              !answers[currentQuestion]
                ? 'bg-white/10 cursor-not-allowed text-white/50'
                : `bg-gradient-to-r ${currentColor} text-white hover:opacity-90`
            }`}
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questions; 