import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import ReactConfetti from 'react-confetti';

// Animation keyframes
const fireEmoji = keyframes`
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-80px) scale(1.2) rotate(20deg); opacity: 0; }
`;

const sparkleEmoji = keyframes`
  0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-100px) scale(1.2) rotate(180deg); opacity: 0; }
`;

const partyEmoji = keyframes`
  0% { transform: translateY(0) scale(0.5) rotate(-10deg); opacity: 0; }
  50% { opacity: 1; transform: translateY(-50px) scale(1.1) rotate(10deg); }
  100% { transform: translateY(-120px) scale(1) rotate(-10deg); opacity: 0; }
`;

const glassesEmoji = keyframes`
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  40% { transform: translateY(-40px) scale(1.3); opacity: 1; }
  60% { transform: translateY(-70px) scale(1.4) rotate(10deg); opacity: 1; }
  100% { transform: translateY(-150px) scale(1) rotate(-5deg); opacity: 0; }
`;

// Emoji options with more noun-themed celebration
const emojiTypes = ['🔥', '✨', '🎉', '🥳', '🎊', '🎯', '🌟', '⚡'];
const nounEmojis = ['👓', '🤓', '😎', '🧠', '🎭', '🎨', '🔍'];

interface MintSuccessProps {
  active: boolean;
}

export const MintSuccess = ({ active }: MintSuccessProps) => {
  const [emojis, setEmojis] = useState<Array<{ id: number, type: string, left: number, animType: string }>>([]);
  const [windowDimensions, setWindowDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  
  useEffect(() => {
    if (!active) return;
    
    // Update dimensions on window resize
    const handleResize = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    // Create initial burst of emojis
    const initialEmojis = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      type: i % 3 === 0 
        ? nounEmojis[Math.floor(Math.random() * nounEmojis.length)]
        : emojiTypes[Math.floor(Math.random() * emojiTypes.length)],
      left: Math.random() * 100, // Random position across container
      animType: i % 5 === 0 ? 'glasses' : ['fire', 'sparkle', 'party'][Math.floor(Math.random() * 3)]
    }));
    
    setEmojis(initialEmojis);
    
    // Add more emojis over time
    const interval = setInterval(() => {
      setEmojis(prev => [
        ...prev,
        {
          id: Date.now(),
          type: Math.random() > 0.6 
            ? emojiTypes[Math.floor(Math.random() * emojiTypes.length)]
            : nounEmojis[Math.floor(Math.random() * nounEmojis.length)],
          left: Math.random() * 100,
          animType: Math.random() > 0.75 ? 'glasses' : ['fire', 'sparkle', 'party'][Math.floor(Math.random() * 3)]
        }
      ]);
    }, 200); // Faster for more celebration
    
    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);
  
  if (!active) return null;
  
  // Map animation type to animation keyframe
  const getAnimation = (type: string) => {
    switch(type) {
      case 'fire': return fireEmoji;
      case 'sparkle': return sparkleEmoji;
      case 'glasses': return glassesEmoji;
      default: return partyEmoji;
    }
  };
  
  return (
    <>
      {/* Enhanced React Confetti for a richer celebration effect */}
      <ReactConfetti
        width={windowDimensions.width}
        height={windowDimensions.height}
        numberOfPieces={350}
        recycle={false}
        gravity={0.1}
        initialVelocityY={15}
        tweenDuration={7000}
        friction={0.99}
        colors={[
          '#FF0000', // Red (Nouns color)
          '#FFD700', // Gold
          '#00BFFF', // Deep Sky Blue
          '#32CD32', // Lime Green
          '#FF69B4', // Hot Pink
          '#FFA500', // Orange
          '#9400D3', // Violet
          '#00FF00', // Green
          '#FF00FF', // Magenta
          '#000000', // Black (for Nouns glasses effect)
          '#FFFFFF'  // White
        ]}
      />
      
      {/* Emoji fireworks for additional flair */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        overflow="hidden"
        pointerEvents="none"
        zIndex="10"
      >
        {emojis.map(emoji => (
          <Box
            key={emoji.id}
            position="absolute"
            bottom="0"
            left={`${emoji.left}%`}
            fontSize={emoji.type.includes('👓') || emoji.type.includes('🤓') || emoji.type.includes('😎') ? "38px" : "28px"}
            animation={`${getAnimation(emoji.animType)} ${Math.random() * 1 + 1.8}s ease-out forwards`}
          >
            {emoji.type}
          </Box>
        ))}
      </Box>
    </>
  );
};
