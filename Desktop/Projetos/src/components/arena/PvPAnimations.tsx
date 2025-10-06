// 🎮 Componente de Animações PvP
import React, { useEffect, useState } from 'react';

interface PvPAnimationsProps {
  showFireEffect: boolean;
  showLightningEffect: boolean;
  onAnimationComplete: () => void;
}

export const PvPAnimations: React.FC<PvPAnimationsProps> = ({
  showFireEffect,
  showLightningEffect,
  onAnimationComplete
}) => {
  const [fireAnimation, setFireAnimation] = useState(false);
  const [lightningAnimation, setLightningAnimation] = useState(false);

  useEffect(() => {
    if (showFireEffect) {
      setFireAnimation(true);
      const timer = setTimeout(() => {
        setFireAnimation(false);
        onAnimationComplete();
      }, 1500); // Duração reduzida para 1.5s
      return () => clearTimeout(timer);
    } else {
      // Limpar imediatamente se showFireEffect for false
      setFireAnimation(false);
    }
  }, [showFireEffect, onAnimationComplete]);

  useEffect(() => {
    if (showLightningEffect) {
      setLightningAnimation(true);
      const timer = setTimeout(() => {
        setLightningAnimation(false);
        onAnimationComplete();
      }, 1500); // Duração reduzida para 1.5s
      return () => clearTimeout(timer);
    } else {
      // Limpar imediatamente se showLightningEffect for false
      setLightningAnimation(false);
    }
  }, [showLightningEffect, onAnimationComplete]);

  return (
    <>
      {/* Animação de Fogo (Oponente) - Movimento A→B→A em 2s, mais próximos */}
      {fireAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50">
          
          {/* Fogo principal se movendo da direita para esquerda */}
          <div className="absolute top-1/2 left-0 transform -translate-y-1/2 fire-move-right-to-left">
            <div className="text-3xl fire-effect">🔥</div>
          </div>
          
          {/* Fogos secundários espaçados verticalmente */}
          <div className="absolute top-1/3 left-0 transform -translate-y-1/2 fire-move-right-to-left-delay-1">
            <div className="text-2xl fire-effect">🔥</div>
          </div>
          <div className="absolute top-2/3 left-0 transform -translate-y-1/2 fire-move-right-to-left-delay-2">
            <div className="text-xl fire-effect">🔥</div>
          </div>
        </div>
      )}

      {/* Animação de Raio (Herói) - Movimento B→A→B em 2s, mais próximos */}
      {lightningAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50">
          
          {/* Raio principal se movendo da esquerda para direita */}
          <div className="absolute top-1/2 right-0 transform -translate-y-1/2 lightning-move-left-to-right">
            <div className="text-3xl lightning-effect">⚡</div>
          </div>
          
          {/* Raios secundários espaçados verticalmente */}
          <div className="absolute top-1/3 right-0 transform -translate-y-1/2 lightning-move-left-to-right-delay-1">
            <div className="text-2xl lightning-effect">⚡</div>
          </div>
          <div className="absolute top-2/3 right-0 transform -translate-y-1/2 lightning-move-left-to-right-delay-2">
            <div className="text-xl lightning-effect">⚡</div>
          </div>
        </div>
      )}

      {/* CSS para animações customizadas */}
      <style>{`
        @keyframes fireGlow {
          0%, 100% { 
            box-shadow: 0 0 20px #ff4444, 0 0 40px #ff4444, 0 0 60px #ff4444;
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 30px #ff6666, 0 0 60px #ff6666, 0 0 90px #ff6666;
            transform: scale(1.1);
          }
        }

        @keyframes lightningFlash {
          0%, 100% { 
            box-shadow: 0 0 20px #4488ff, 0 0 40px #4488ff, 0 0 60px #4488ff;
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 30px #66aaff, 0 0 60px #66aaff, 0 0 90px #66aaff;
            transform: scale(1.1);
          }
        }

        .fire-effect {
          animation: fireGlow 0.5s ease-in-out infinite;
        }

        .lightning-effect {
          animation: lightningFlash 0.3s ease-in-out infinite;
        }
        
        @keyframes moveRightToLeft {
          0% { 
            transform: translateX(100vw) translateY(-50%);
            opacity: 1;
          }
          50% { 
            transform: translateX(0vw) translateY(-50%);
            opacity: 0.8;
          }
          100% { 
            transform: translateX(-120vw) translateY(-50%);
            opacity: 0;
            visibility: hidden;
          }
        }
        
        @keyframes moveLeftToRight {
          0% { 
            transform: translateX(-100vw) translateY(-50%);
            opacity: 1;
          }
          50% { 
            transform: translateX(0vw) translateY(-50%);
            opacity: 0.8;
          }
          100% { 
            transform: translateX(120vw) translateY(-50%);
            opacity: 0;
            visibility: hidden;
          }
        }
        
        .fire-move-right-to-left {
          animation: moveRightToLeft 1.5s ease-in-out;
        }
        
        .fire-move-right-to-left-delay-1 {
          animation: moveRightToLeft 1.5s ease-in-out 0.1s;
        }
        
        .fire-move-right-to-left-delay-2 {
          animation: moveRightToLeft 1.5s ease-in-out 0.2s;
        }
        
        .lightning-move-left-to-right {
          animation: moveLeftToRight 1.5s ease-in-out;
        }
        
        .lightning-move-left-to-right-delay-1 {
          animation: moveLeftToRight 1.5s ease-in-out 0.1s;
        }
        
        .lightning-move-left-to-right-delay-2 {
          animation: moveLeftToRight 1.5s ease-in-out 0.2s;
        }
        
        @keyframes fireParticleTrail {
          0% { 
            transform: translateX(100vw) translateY(-50%);
            opacity: 1;
          }
          50% { 
            transform: translateX(0vw) translateY(-50%);
            opacity: 0.8;
          }
          100% { 
            transform: translateX(-120vw) translateY(-50%);
            opacity: 0;
            visibility: hidden;
          }
        }
        
        @keyframes lightningParticleTrail {
          0% { 
            transform: translateX(-100vw) translateY(-50%);
            opacity: 1;
          }
          50% { 
            transform: translateX(0vw) translateY(-50%);
            opacity: 0.8;
          }
          100% { 
            transform: translateX(120vw) translateY(-50%);
            opacity: 0;
            visibility: hidden;
          }
        }
        
        .fire-particle-trail {
          animation: fireParticleTrail 1.5s ease-in-out;
        }
        
        .lightning-particle-trail {
          animation: lightningParticleTrail 1.5s ease-in-out;
        }
      `}</style>
    </>
  );
};

// Componente de Partículas de Fogo - Mais próximas com rastro
export const FireParticles: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-red-500 rounded-full fire-particle-trail"
          style={{
            left: `${75 + Math.random() * 25}%`, // Mais concentrado no lado direito
            top: `${40 + Math.random() * 20}%`, // Mais espalhado verticalmente
            animationDelay: `${i * 0.1}s`, // Sequencial mais rápido
            animationDuration: '1.5s',
            boxShadow: '0 0 8px #ff4444, 0 0 16px #ff6666'
          }}
        />
      ))}
      {[...Array(4)].map((_, i) => (
        <div
          key={`small-${i}`}
          className="absolute w-0.5 h-0.5 bg-orange-400 rounded-full fire-particle-trail"
          style={{
            left: `${80 + Math.random() * 20}%`, // Mais próximo do oponente
            top: `${45 + Math.random() * 10}%`, // Mais próximo do centro
            animationDelay: `${i * 0.15}s`, // Sequencial mais rápido
            animationDuration: '1.5s'
          }}
        />
      ))}
    </div>
  );
};

// Componente de Partículas de Raio - Mais próximas com rastro
export const LightningParticles: React.FC<{ active: boolean }> = ({ active }) => {
  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-3 bg-blue-400 rounded-full lightning-particle-trail"
          style={{
            left: `${Math.random() * 25}%`, // Mais concentrado no lado esquerdo
            top: `${40 + Math.random() * 20}%`, // Mais espalhado verticalmente
            animationDelay: `${i * 0.1}s`, // Sequencial mais rápido
            animationDuration: '1.5s',
            transform: `rotate(${Math.random() * 360}deg)`,
            boxShadow: '0 0 6px #4488ff, 0 0 12px #66aaff'
          }}
        />
      ))}
      {[...Array(3)].map((_, i) => (
        <div
          key={`small-${i}`}
          className="absolute w-0.5 h-2 bg-cyan-300 rounded-full lightning-particle-trail"
          style={{
            left: `${Math.random() * 20}%`, // Mais próximo do herói
            top: `${45 + Math.random() * 10}%`, // Mais próximo do centro
            animationDelay: `${i * 0.15}s`, // Sequencial mais rápido
            animationDuration: '1.5s',
            transform: `rotate(${Math.random() * 180}deg)`
          }}
        />
      ))}
    </div>
  );
};
