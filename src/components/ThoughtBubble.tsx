import React from 'react';
import { motion } from 'framer-motion';

interface ThoughtBubbleProps {
  thought: {
    id: string;
    type: 'curso' | 'ebook' | 'projeto' | 'protocolo' | 'link';
    icon: string;
    title: string;
    description: string;
    route?: string;
    action?: string;
  };
  index: number;
  onClick: () => void;
  onClose?: () => void;
}

const ThoughtBubble: React.FC<ThoughtBubbleProps> = ({ 
  thought, 
  index, 
  onClick, 
  onClose 
}) => {
  // Posições ajustadas: direita 8% mais próxima, esquerda 3% mais distante, esquerda com mais espaçamento vertical
  const positions = [
    { x: -476, y: -150 },  // Esquerda superior (3% mais distante, mais acima)
    { x: -435, y: 150 },   // Esquerda inferior (3% mais distante, mais abaixo)
    { x: 425, y: -106 },   // Direita superior (8% mais próxima)
    { x: 388, y: 106 },    // Direita inferior (8% mais próxima)
    { x: -517, y: -50 },   // Esquerda centro (3% mais distante, mais acima)
    { x: 462, y: 0 },      // Direita centro (8% mais próxima)
    { x: -408, y: -250 },  // Esquerda mais acima (3% mais distante, muito mais acima)
    { x: 364, y: -198 }    // Direita mais acima (8% mais próxima)
  ];
  
  const position = positions[index % positions.length];
  const finalX = position.x + (Math.random() * 85.6 - 42.8); // 7% mais variação
  const finalY = position.y + (Math.random() * 85.6 - 42.8); // 7% mais variação

  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{
        left: `calc(50% + ${finalX}px)`,
        top: `calc(50% + ${finalY}px)`,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
        outline: 'none',
        border: 'none'
      }}
      initial={{ 
        opacity: 0, 
        scale: 0.3,
        y: 0
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -10, 0]
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.3,
        y: 0
      }}
      transition={{ 
        delay: index * 0.3,
        duration: 0.6,
        y: {
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }
      }}
      onClick={(e) => {
        console.log('🎯 CARD CLICADO!', thought.title, thought.route)
        e.preventDefault()
        e.stopPropagation()
        if (onClick) {
          console.log('📞 Chamando onClick...')
          onClick()
        } else {
          console.log('❌ onClick não definido!')
        }
      }}
    >
      {/* Balão de pensamento */}
      <div className="relative">
        <motion.div
          className="bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 rounded-2xl p-3 shadow-xl min-w-[160px] max-w-[200px]"
          style={{ 
            outline: 'none',
            border: '1px solid rgba(75, 85, 99, 0.5)',
            userSelect: 'none',
            pointerEvents: 'auto'
          }}
          whileHover={{ 
            scale: 1.05,
            backgroundColor: "rgba(55, 65, 81, 0.95)"
          }}
          transition={{ duration: 0.2 }}
        >
          {/* Ícone e título */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{thought.icon}</span>
            <div className="flex-1">
              <h3 className="font-semibold text-white text-xs leading-tight">
                {thought.title}
              </h3>
            </div>
          </div>

          {/* Descrição */}
          <p className="text-gray-300 text-xs leading-tight mb-2">
            {thought.description}
          </p>

          {/* Botão de ação */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-blue-400 font-medium">
              {thought.action || 'Clique para abrir'}
            </span>
            {onClose && (
              <button
                onClick={(e) => {
                  console.log('❌ Botão X clicado!')
                  e.stopPropagation();
                  onClose();
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* Cauda do balão apontando para o avatar */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800/90"></div>
        </div>
      </div>

    </motion.div>
  );
};

export default ThoughtBubble;
