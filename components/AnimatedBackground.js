import { useEffect, useState } from 'react'

export default function AnimatedBackground() {
  const [symbols, setSymbols] = useState([])

  useEffect(() => {
    // Generate random X and O symbols
    const generateSymbols = () => {
      const newSymbols = []
      const symbolCount = 20 // Number of symbols
      
      for (let i = 0; i < symbolCount; i++) {
        newSymbols.push({
          id: i,
          type: Math.random() > 0.5 ? 'X' : 'O',
          x: Math.random() * 100, // Random position (%)
          y: Math.random() * 100,
          size: 20 + Math.random() * 40, // Random size
          rotation: Math.random() * 360,
          duration: 10 + Math.random() * 20, // Animation duration
          delay: Math.random() * 5, // Animation delay
          opacity: 0.03 + Math.random() * 0.05
        })
      }
      
      setSymbols(newSymbols)
    }

    generateSymbols()
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid Background */}
      <div className="animated-grid absolute inset-0"></div>
      
      {/* Animated X and O Symbols */}
      {symbols.map((symbol) => (
        <div
          key={symbol.id}
          className="absolute font-black"
          style={{
            left: `${symbol.x}%`,
            top: `${symbol.y}%`,
            fontSize: `${symbol.size}px`,
            color: symbol.type === 'X' ? 'rgb(59, 130, 246)' : 'rgb(236, 72, 153)',
            opacity: symbol.opacity,
            animation: `floatAndRotate ${symbol.duration}s ease-in-out infinite`,
            animationDelay: `${symbol.delay}s`,
            transform: `rotate(${symbol.rotation}deg)`,
          }}
        >
          {symbol.type}
        </div>
      ))}

      <style jsx>{`
        @keyframes floatAndRotate {
          0%, 100% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0.03;
          }
          25% {
            transform: translateY(-30px) rotate(90deg) scale(1.2);
            opacity: 0.08;
          }
          50% {
            transform: translateY(-15px) rotate(180deg) scale(0.8);
            opacity: 0.02;
          }
          75% {
            transform: translateY(-40px) rotate(270deg) scale(1.1);
            opacity: 0.06;
          }
        }
      `}</style>
    </div>
  )
}
