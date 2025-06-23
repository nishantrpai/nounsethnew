import { useEffect, useState } from 'react';
import ReactConfetti from 'react-confetti';

interface MintSuccessProps {
  active: boolean;
}

export const MintSuccess = ({ active }: MintSuccessProps) => {
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
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [active]);
  
  if (!active) return null;
  
  return (
    <>
      {/* React Confetti for celebration effect - no emoji confetti */}
      <ReactConfetti
        width={windowDimensions.width}
        height={windowDimensions.height}
        numberOfPieces={400}
        recycle={false}
        gravity={0.1}
        initialVelocityY={20}
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
    </>
  );
};
