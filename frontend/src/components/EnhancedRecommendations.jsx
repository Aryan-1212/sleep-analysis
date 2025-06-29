import { useState } from 'react';

const EnhancedRecommendations = ({ recommendations, sleepScore = 27, effectiveness = 51.2 }) => {
  const [expandedCard, setExpandedCard] = useState(null);

  // Parse the recommendations text to extract all components
  const parseRecommendations = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n').filter(line => line.trim());
    
    // Extract header info
    const headerMatch = text.match(/Sleep Recommendations for (.+?)\s*=/);
    const ageGroup = headerMatch ? headerMatch[1] : 'Young Adults (19-30 years)';
    
    // Extract priority level
    const priorityMatch = text.match(/Priority Level: (\w+)/);
    const priorityLevel = priorityMatch ? priorityMatch[1] : 'MODERATE';
    
    // Extract effectiveness
    const effectivenessMatch = text.match(/sleep effectiveness is ([\d.]+)%/);
    const effectivenessValue = effectivenessMatch ? effectivenessMatch[1] : effectiveness;
    
    // Extract numbered recommendations
    const recommendationMatches = text.match(/\d+\.\s+[^🔥💡]+/g) || [];
    const recommendations = recommendationMatches.map(item => {
      const lines = item.trim().split('\n');
      const firstLine = lines[0];
      
      // Extract emoji and title
      const emojiMatch = firstLine.match(/[\u{1F300}-\u{1F9FF}]/u);
      const emoji = emojiMatch ? emojiMatch[0] : '💤';
      
      // Extract title (text between ** markers)
      const titleMatch = firstLine.match(/\*\*(.+?)\*\*/);
      const title = titleMatch ? titleMatch[1] : 'Sleep Tip';
      
      // Extract description (text after title)
      const colonIndex = firstLine.indexOf(':');
      const description = colonIndex > 0 ? 
        firstLine.substring(colonIndex + 1).trim() + 
        (lines.length > 1 ? '\n' + lines.slice(1).join('\n') : '') : 
        firstLine;
      
      return {
        emoji,
        title,
        description: description.trim()
      };
    });
    
    // Extract general tips
    const generalTipsMatch = text.match(/💡 \*\*General Tips:\*\*([\s\S]*?)(?=============|$)/);
    const generalTips = generalTipsMatch ? 
      generalTipsMatch[1].split('•').filter(tip => tip.trim()).map(tip => tip.trim()) : 
      [];
    
    return {
      ageGroup,
      priorityLevel,
      effectivenessValue,
      recommendations,
      generalTips
    };
  };

  const parsedData = parseRecommendations(recommendations);

  if (!parsedData) {
    return (
      <div className="bg-white/5 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Sleep Recommendations</h3>
        <p className="text-gray-300">No recommendations available.</p>
      </div>
    );
  }

  const getPriorityColor = (level) => {
    switch (level.toUpperCase()) {
      case 'HIGH': return 'from-red-500 to-orange-500';
      case 'MODERATE': return 'from-yellow-500 to-orange-500';
      case 'LOW': return 'from-green-500 to-blue-500';
      default: return 'from-purple-500 to-blue-500';
    }
  };

  const getPriorityIcon = (level) => {
    switch (level.toUpperCase()) {
      case 'HIGH': return '🚨';
      case 'MODERATE': return '⚠️';
      case 'LOW': return '✅';
      default: return '💡';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">🌟 Sleep Recommendations</h3>
          <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getPriorityColor(parsedData.priorityLevel)} text-white font-semibold text-sm`}>
            {getPriorityIcon(parsedData.priorityLevel)} {parsedData.priorityLevel} PRIORITY
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-1">Target Age Group</h4>
            <p className="text-gray-300">{parsedData.ageGroup}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-1">Sleep Effectiveness</h4>
            <p className="text-gray-300">{parsedData.effectivenessValue}%</p>
          </div>
        </div>
        
        <p className="text-gray-300 text-sm">
          Consider implementing 2-3 of these recommendations to improve your sleep quality and effectiveness.
        </p>
      </div>

      {/* Add CSS for 3D flip effect */}
      <style jsx>{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Recommendations Grid with Flip Cards */}
      <div className="bg-white/5 rounded-xl p-6">
        <h4 className="text-xl font-semibold text-white mb-6">Personalized Recommendations</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {parsedData.recommendations.map((rec, index) => (
            <div
              key={index}
              className="relative h-48 cursor-pointer group"
              onClick={() => setExpandedCard(expandedCard === index ? null : index)}
            >
              <div className={`absolute inset-0 w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
                expandedCard === index ? 'rotate-y-180' : ''
              }`}>
                
                {/* Front of card */}
                <div className="absolute inset-0 w-full h-full backface-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-lg border border-white/10 flex flex-col items-center justify-center p-4 hover:from-purple-600/30 hover:to-blue-600/30 transition-all">
                  <div className="text-4xl mb-3">{rec.emoji}</div>
                  <h4 className="text-white font-semibold text-center text-sm leading-tight">
                    {rec.title}
                  </h4>
                  <div className="absolute bottom-3 text-xs text-gray-300 opacity-70">
                    Click to flip
                  </div>
                </div>

                {/* Back of card */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 backdrop-blur-sm rounded-lg border border-white/10 p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{rec.emoji}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedCard(null);
                      }}
                      className="text-white/60 hover:text-white text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <h4 className="text-white font-semibold text-sm mb-2">
                      {rec.title}
                    </h4>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      {rec.description}
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

      {/* General Tips Section */}
      {parsedData.generalTips.length > 0 && (
        <div className="bg-gradient-to-r from-green-600/20 to-teal-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h4 className="text-xl font-semibold text-white mb-4 flex items-center">
            💡 General Tips for Better Sleep
          </h4>
          <div className="space-y-3">
            {parsedData.generalTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedRecommendations;