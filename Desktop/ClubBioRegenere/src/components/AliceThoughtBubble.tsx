import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Music, Sparkles, X } from 'lucide-react';

interface AliceThoughtBubbleProps {
  biohackingTip?: string;
  frequencyRecommendation?: string;
  personalizationNote?: string;
  isVisible: boolean;
  onClose: () => void;
}

export default function AliceThoughtBubble({ 
  biohackingTip, 
  frequencyRecommendation, 
  personalizationNote,
  isVisible,
  onClose
}: AliceThoughtBubbleProps) {
  const [currentTip, setCurrentTip] = useState<{type: string, content: string} | null>(null);

  useEffect(() => {
    if (!isVisible) {
      setCurrentTip(null);
      return;
    }

    // Priorizar qual dica mostrar
    if (biohackingTip) {
      setCurrentTip({
        type: 'biohacking',
        content: biohackingTip.replace(/💡.*?:/, '').trim()
      });
    } else if (frequencyRecommendation) {
      setCurrentTip({
        type: 'frequency',
        content: frequencyRecommendation.replace(/🎵.*?:/, '').trim()
      });
    } else if (personalizationNote) {
      setCurrentTip({
        type: 'personalization',
        content: personalizationNote.replace(/✨/, '').trim()
      });
    }
  }, [biohackingTip, frequencyRecommendation, personalizationNote, isVisible]);

  const getIcon = () => {
    switch (currentTip?.type) {
      case 'biohacking': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'frequency': return <Music className="w-4 h-4 text-purple-500" />;
      case 'personalization': return <Sparkles className="w-4 h-4 text-pink-500" />;
      default: return <Lightbulb className="w-4 h-4 text-primary" />;
    }
  };

  const getBgColor = () => {
    switch (currentTip?.type) {
      case 'biohacking': return 'from-yellow-100 to-yellow-50 border-yellow-200';
      case 'frequency': return 'from-purple-100 to-purple-50 border-purple-200';
      case 'personalization': return 'from-pink-100 to-pink-50 border-pink-200';
      default: return 'from-primary/10 to-primary/5 border-primary/20';
    }
  };

  if (!currentTip || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-32 right-16 z-40 max-w-xs lg:right-24"
        initial={{ opacity: 0, scale: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0, x: 20, y: 20 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25,
          duration: 0.3 
        }}
      >
        {/* Thought Bubble */}
        <div className={`relative bg-gradient-to-br ${getBgColor()} backdrop-blur-sm rounded-2xl shadow-lg border p-4`}>
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <X className="w-3 h-3 text-gray-500" />
          </button>

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getIcon()}
              <span className="text-xs font-semibold text-gray-700">
                {currentTip.type === 'biohacking' && 'Dica de Biohacking'}
                {currentTip.type === 'frequency' && 'Frequência Recomendada'}
                {currentTip.type === 'personalization' && 'Nota Pessoal'}
              </span>
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed">
              {currentTip.content}
            </p>
          </div>

          {/* Bubble Tail */}
          <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white"></div>
        </div>

        {/* Floating bubbles animation */}
        <motion.div
          className="absolute -top-4 -right-2 w-3 h-3 bg-white/70 rounded-full"
          animate={{
            y: [-2, -8, -2],
            opacity: [0.7, 0.3, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -top-6 -right-6 w-2 h-2 bg-white/50 rounded-full"
          animate={{
            y: [-1, -6, -1],
            opacity: [0.5, 0.2, 0.5]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}