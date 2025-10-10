import React, { useEffect, useRef } from 'react';

interface MatrixBackgroundProps {
  isActive?: boolean;
  opacity?: number;
}

const MatrixBackground: React.FC<MatrixBackgroundProps> = ({ 
  isActive = false, 
  opacity = 0.1 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar canvas
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Caracteres para o efeito Matrix
    const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const charArray = chars.split('');

    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];
    const speeds: number[] = []; // Velocidades diferentes para cada coluna
    const brightness: number[] = []; // Brilho diferente para cada coluna

    // Inicializar drops com padrão de linhas, velocidades e brilhos
    for (let i = 0; i < columns; i++) {
      // Padrão: a cada 1 linha remove 1, a cada 2 linhas remove 1, a cada 3 linhas remove 1
      const pattern = (i % 6);
      if (pattern === 0 || pattern === 2 || pattern === 5) {
        drops[i] = 0; // Linha removida (não desenha)
      } else {
        drops[i] = 1; // Linha ativa
      }
      
      // Velocidades variadas (ainda mais lentas)
      speeds[i] = 0.1 + Math.random() * 0.4; // Entre 0.1 e 0.5
      
      // Brilho uniforme para todas as linhas
      brightness[i] = 0.8; // Brilho fixo para todas as linhas (aumentado 10%)
    }

    const draw = () => {
      // Fundo semi-transparente
      ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Configurar texto
      ctx.fillStyle = '#0F4';
      ctx.font = `${fontSize}px monospace`;

      // Desenhar caracteres
      for (let i = 0; i < drops.length; i++) {
        // Verificar se a linha deve ser desenhada
        const pattern = (i % 6);
        const shouldDraw = !(pattern === 0 || pattern === 2 || pattern === 5);
        
        if (shouldDraw && drops[i] > 0) {
          const text = charArray[Math.floor(Math.random() * charArray.length)];
          
          // Aplicar brilho neon uniforme
          const neonIntensity = brightness[i];
          const r = Math.floor(0 * neonIntensity);
          const g = Math.floor(255 * neonIntensity);
          const b = Math.floor(68 * neonIntensity);
          
          // Efeito neon com sombra uniforme
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${neonIntensity})`;
          ctx.shadowBlur = 18; // Brilho fixo para todas as linhas (aumentado 10%)
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          
          // Resetar sombra
          ctx.shadowBlur = 0;
        }

        // Resetar drop se chegou ao fim da tela + 90% extra (30% + 60%)
        if (drops[i] * fontSize > canvas.height * 1.9) {
          drops[i] = 0;
        }
        
        // Só incrementar se a linha deve ser desenhada, com velocidade variada
        if (shouldDraw) {
          drops[i] += speeds[i];
        }
      }
    };

    const interval = setInterval(draw, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isActive, opacity]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity }}
    />
  );
};

export default MatrixBackground;
