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
  // Posições originais restauradas
  const positions = [
    { x: -476, y: -150 },  // Esquerda superior
    { x: -435, y: 150 },   // Esquerda inferior
    { x: 425, y: -106 },   // Direita superior
    { x: 388, y: 106 },    // Direita inferior
    { x: -517, y: -50 },   // Esquerda centro
    { x: 462, y: 0 },      // Direita centro
    { x: -408, y: -250 },  // Esquerda mais acima
    { x: 364, y: -198 }    // Direita mais acima
  ];
  
  const position = positions[index % positions.length];
  // CORRIGIDO: Posições fixas, sem variação aleatória
  const finalX = position.x;
  const finalY = position.y;


  console.log('🎯 ThoughtBubble renderizando:', thought.title, 'posição:', finalX, finalY)

  return (
    <motion.div
      className="absolute cursor-pointer group"
      style={{
        left: `calc(50% + ${finalX}px)`,
        top: `calc(50% + ${finalY}px)`,
        transform: 'translate(-50%, -50%)',
        zIndex: 9999, // Alto para ficar acima de tudo
        pointerEvents: 'auto',
        backgroundColor: 'rgba(255, 0, 0, 0.3)', // DEBUG: Fundo vermelho para ver onde está
        minWidth: '200px', // DEBUG: Área de clique maior
        minHeight: '100px' // DEBUG: Área de clique maior
      }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
      exit={{ opacity: 0, scale: 0.3 }}
      transition={{
        delay: index * 0.3,
        duration: 0.6,
        y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
      }}
    >
      {/* Balão */}
      <motion.div
        className="bg-gray-800/90 backdrop-blur-sm border border-gray-600/50 
                   rounded-2xl p-3 shadow-xl min-w-[160px] max-w-[200px] cursor-pointer"
        whileHover={{ scale: 1.05, backgroundColor: 'rgba(55,65,81,0.95)' }}
        transition={{ duration: 0.2 }}
        onClick={(e) => {
          e.stopPropagation();
          console.log('🎯 Clique no balão!', thought.title);
          console.log('🎯 onClick prop:', typeof onClick);
          if (onClick) {
            console.log('🎯 Chamando onClick...');
            onClick();
          } else {
            console.log('❌ onClick não definido!');
          }
        }}
        onMouseDown={(e) => {
          console.log('🖱️ MOUSE DOWN no card:', thought.title);
          e.stopPropagation();
        }}
        onMouseUp={(e) => {
          console.log('🖱️ MOUSE UP no card:', thought.title);
          e.stopPropagation();
        }}
        onMouseEnter={() => {
          console.log('🖱️ MOUSE ENTER no card:', thought.title);
        }}
        onMouseLeave={() => {
          console.log('🖱️ MOUSE LEAVE no card:', thought.title);
        }}
      >
        {/* Conteúdo */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{thought.icon}</span>
          <h3 className="font-semibold text-white text-xs">{thought.title}</h3>
        </div>
        <p className="text-gray-300 text-xs mb-2">{thought.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-xs text-blue-400 font-medium">
            {thought.action || 'Clique para abrir'}
          </span>
          {onClose && (
            <button
              className="text-gray-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              ✕
            </button>
          )}
        </div>
      </motion.div>

      {/* Cauda */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 
                        border-transparent border-t-gray-800/90"></div>
      </div>
    </motion.div>
  );
};

export default ThoughtBubble;
