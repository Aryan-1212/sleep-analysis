import Lottie from 'lottie-react';
import moonAnimation from '../animations/Animation-moon.json';
import catAnimation from '../animations/Animation-cat.json';

// Moon animation component (fixed position)
export const MoonAnimation = () => {
  return (
    <div className="fixed top-8 right-40 w-20 h-20 z-10">
      <Lottie
        animationData={moonAnimation}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

// Card animations component (relative to quiz card)
export const CardAnimations = () => {
  return (
    <>
      {/* Sleeping cat animation on top edge of the card - LARGER SIZE */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-36 z-20 hidden sm:block">
        <div className="relative w-full h-full">
          <Lottie
            animationData={catAnimation}
            loop
            autoplay
            style={{ 
              width: '100%', 
              height: '100%',
              transform: 'rotate(-8deg)',
              filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.5))'
            }}
          />
          {/* Sleeping ZZZ animation */}
          <div className="absolute -top-4 -right-4 opacity-90 animate-float">
            <div className="text-white text-sm font-bold space-y-1">
              {/* <div className="animate-pulse">Z</div>
              <div className="animate-pulse delay-300 ml-1">Z</div>
              <div className="animate-pulse delay-700 ml-2">Z</div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile cat animation - smaller size for mobile screens */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-20 z-20 sm:hidden">
        <div className="relative w-full h-full">
          <Lottie
            animationData={catAnimation}
            loop
            autoplay
            style={{ 
              width: '100%', 
              height: '100%',
              transform: 'rotate(-8deg)',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))'
            }}
          />
        </div>
      </div>
    </>
  );
};

// Main component for backward compatibility
const QuizAnimations = () => {
  return (
    <>
      <MoonAnimation />
    </>
  );
};

export default QuizAnimations;