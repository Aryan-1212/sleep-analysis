import { useState } from 'react';

const RecommendationCards = ({ recommendations }) => {
  const [flippedCard, setFlippedCard] = useState(null);

  // Parse recommendations text to extract individual recommendations
  const parseRecommendations = (text) => {
    if (!text) return [];
    
    // Split by numbered items (1. 2. 3. etc.)
    const items = text.split(/\d+\.\s+/).filter(item => item.trim());
    
    return items.map(item => {
      const lines = item.trim().split('\n');
      const firstLine = lines[0];
      
      // Extract title (text before first colon)
      const colonIndex = firstLine.indexOf(':');
      let title = '';
      let description = '';
      
      if (colonIndex > 0) {
        const titlePart = firstLine.substring(0, colonIndex);
        // Remove emoji and clean up title
        title = titlePart.replace(/[^\w\s-()]/g, '').trim();
        description = firstLine.substring(colonIndex + 1).trim() + 
                     (lines.length > 1 ? '\n' + lines.slice(1).join('\n') : '');
      } else {
        // Fallback: use first few words as title
        const words = firstLine.split(' ');
        title = words.slice(0, 3).join(' ').replace(/[^\w\s-()]/g, '').trim();
        description = firstLine;
      }
      
      return {
        title: title || 'Sleep Tip',
        description: description.trim(),
        emoji: firstLine.match(/[\u{1F300}-\u{1F9FF}]/u)?.[0] || '💤'
      };
    }).filter(item => item.description); // Filter out empty items
  };

  const recommendationCards = parseRecommendations(recommendations);

  const handleCardClick = (index) => {
    setFlippedCard(flippedCard === index ? null : index);
  };

  return (
    <div className="bg-white/5 rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Personalized Recommendations</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendationCards.map((card, index) => (
          <div
            key={index}
            className="relative h-48 cursor-pointer group"
            onClick={() => handleCardClick(index)}
          >
            <div className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
              flippedCard === index ? 'rotate-y-180' : ''
            }`}>
              
              {/* Front of card */}
              <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-lg border border-white/10 flex flex-col items-center justify-center p-4 hover:from-purple-600/30 hover:to-blue-600/30 transition-all">
                <div className="text-4xl mb-3">{card.emoji}</div>
                <h4 className="text-white font-semibold text-center text-sm leading-tight">
                  {card.title}
                </h4>
                <div className="absolute bottom-3 text-xs text-gray-300 opacity-70">
                  Click to read
                </div>
              </div>

              {/* Back of card */}
              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm rounded-lg border border-white/10 p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{card.emoji}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFlippedCard(null);
                    }}
                    className="text-white/60 hover:text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <h4 className="text-white font-semibold text-sm mb-2">
                    {card.title}
                  </h4>
                  <p className="text-gray-300 text-xs leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          💡 Click on any card to read the full recommendation
        </p>
      </div>
    </div>
  );
};

export default RecommendationCards;