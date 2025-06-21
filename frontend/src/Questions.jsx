import { useState } from 'react';

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
  }
];

const colors = [
  'from-purple-500 to-pink-500',
  'from-blue-500 to-cyan-500',
  'from-green-500 to-emerald-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
];

export default function Questions() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleAnswer = (answer) => {
    setSelectedOption(answer);
    setTimeout(() => {
      setAnswers({
        ...answers,
        [currentQuestion]: answer
      });
      setSelectedOption(null);
    }, 300);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 transform transition-all duration-500 hover:scale-[1.02]">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-8 text-center">
            Your Sleep Analysis Results
          </h2>
          <div className="space-y-6">
            {questions.map((q, index) => (
              <div 
                key={index} 
                className="border-b border-gray-200 pb-6 transform transition-all duration-300 hover:translate-x-2"
              >
                <p className="font-medium text-gray-900 mb-2">{q.question}</p>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                  Your answer: {answers[index]}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setShowResults(false);
              setCurrentQuestion(0);
              setAnswers({});
            }}
            className="mt-8 w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-pink-700 transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentColor = colors[currentQuestion % colors.length];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 transform transition-all duration-500 hover:scale-[1.02]">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              Sleep Analysis Quiz
            </h2>
            <span className="text-gray-600 bg-gray-100 px-4 py-2 rounded-full">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${currentColor} transition-all duration-500 ease-out`}
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6 transform transition-all duration-300 hover:scale-105">
            {questions[currentQuestion].question}
          </h3>
          <div className="space-y-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                  answers[currentQuestion] === option
                    ? `bg-gradient-to-r ${currentColor} text-white border-transparent`
                    : selectedOption === option
                    ? 'bg-gray-100 border-purple-300'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
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
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              currentQuestion === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
            }`}
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion]}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 ${
              !answers[currentQuestion]
                ? 'bg-gray-300 cursor-not-allowed'
                : `bg-gradient-to-r ${currentColor} text-white hover:opacity-90`
            }`}
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
} 