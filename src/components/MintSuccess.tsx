import { useEffect, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

// Animation keyframes
const fireEmoji = keyframes`
  0% { transform: translateY(0) scale(0.5); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
`;

const sparkleEmoji = keyframes`
  0% { transform: translateY(0) scale(0.5) rotate(0deg); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(-100px) scale(1) rotate(180deg); opacity: 0; }
`;

interface MintSuccessProps {
  active: boolean;
}

export const MintSuccess = ({ active }: MintSuccessProps) => {
  const [emojis, setEmojis] = useState<Array<{ id: number, type: string, left: number }>>([]);
  
  useEffect(() => {
    if (!active) return;
    
    // Create initial set of emojis
    const initialEmojis = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      type: Math.random() > 0.5 ? '🔥' : '✨',
      left: Math.random() * 100, // Random position across container
    }));
    
    setEmojis(initialEmojis);
    
    // Add more emojis over time
    const interval = setInterval(() => {
      setEmojis(prev => [
        ...prev,
        {
          id: Date.now(),
          type: Math.random() > 0.5 ? '🔥' : '✨',
          left: Math.random() * 100,
        }
      ]);
    }, 300);
    
    // Cleanup
    return () => clearInterval(interval);
  }, [active]);
  
  if (!active) return null;
  
  return (
    <Box
      position="absolute"
      bottom="0"
      left="0"
      width="100%"
      height="150px"
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
          fontSize="24px"
          animation={`${emoji.type === '🔥' ? fireEmoji : sparkleEmoji} 2s ease-out forwards`}
        >
          {emoji.type}
        </Box>
      ))}
    </Box>
  );
};
