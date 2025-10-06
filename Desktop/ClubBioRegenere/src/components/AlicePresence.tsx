import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Brain, MessageCircle, Sparkles, Users, Activity } from 'lucide-react';

interface AlicePresenceProps {
  emotion: 'caring' | 'curious' | 'encouraging' | 'empathetic' | 'professional' | 'neutral';
  isThinking?: boolean;
  isSpeaking?: boolean;
  messageCount: number;
  topics: string[];
}

export default function AlicePresence({ 
  emotion, 
  isThinking = false, 
  isSpeaking = false, 
  messageCount,
  topics 
}: AlicePresenceProps) {
  const [currentMood, setCurrentMood] = useState<string>('Pronta para te ouvir');
  const [pulseIntensity, setPulseIntensity] = useState(0.3);

  useEffect(() => {
    // Atualizar humor da Alice baseado na emoção
    const moods = {
      caring: 'Te acolhendo com carinho 💚',
      curious: 'Curiosa para saber mais 🌟',
      encouraging: 'Te incentivando sempre ✨',
      empathetic: 'Entendendo seus sentimentos 🤗',
      professional: 'Focada em te ajudar 🎯',
      neutral: 'Aqui para você 😊'
    };
    
    setCurrentMood(moods[emotion]);
    
    // Ajustar intensidade do pulse baseado na emoção
    const intensities = {
      caring: 0.6,
      encouraging: 0.8,
      empathetic: 0.5,
      curious: 0.7,
      professional: 0.4,
      neutral: 0.3
    };
    
    setPulseIntensity(intensities[emotion]);
  }, [emotion]);

  const getEmotionIcon = () => {
    switch (emotion) {
      case 'caring': return <Heart className="w-5 h-5 text-secondary" />;
      case 'curious': return <Sparkles className="w-5 h-5 text-accent" />;
      case 'encouraging': return <Activity className="w-5 h-5 text-tertiary" />;
      case 'empathetic': return <Users className="w-5 h-5 text-quaternary" />;
      case 'professional': return <Brain className="w-5 h-5 text-primary" />;
      default: return <MessageCircle className="w-5 h-5 text-primary" />;
    }
  };

  const getEmotionColor = () => {
    switch (emotion) {
      case 'caring': return 'from-secondary/20 to-secondary/10';
      case 'curious': return 'from-accent/20 to-accent/10';
      case 'encouraging': return 'from-tertiary/20 to-tertiary/10';
      case 'empathetic': return 'from-quaternary/20 to-quaternary/10';
      case 'professional': return 'from-primary/20 to-primary/10';
      default: return 'from-primary/20 to-primary/10';
    }
  };

  return (
    <motion.div
      className="fixed bottom-8 right-16 z-50 lg:right-24"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Alice Avatar Container */}
      <div className="relative">
        {/* Pulse Ring */}
        <motion.div
          className={`absolute inset-0 rounded-full bg-gradient-to-r ${getEmotionColor()} -m-4`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [pulseIntensity, pulseIntensity * 1.5, pulseIntensity],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Main Avatar */}
        <motion.div
          className="w-16 h-16 rounded-full border-3 border-card shadow-xl overflow-hidden relative bg-gradient-to-br from-primary to-primary/80"
          whileHover={{ scale: 1.05 }}
          animate={isSpeaking ? {
            boxShadow: [
              `0 0 20px hsl(var(--primary) / 0.3)`,
              `0 0 30px hsl(var(--primary) / 0.6)`,
              `0 0 20px hsl(var(--primary) / 0.3)`
            ]
          } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <img 
            src="/lovable-uploads/f2ba11b1-515b-4861-a031-846a68a96bd7.png"
            alt="Alice AI"
            className="w-full h-full object-cover"
          />
          
          {/* Emotion Overlay */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${getEmotionColor()}`}
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          
          {/* Thinking Indicator */}
          {isThinking && (
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              {/* Thinking dots animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex space-x-1">
                  <motion.div 
                    className="w-1.5 h-1.5 bg-white rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div 
                    className="w-1.5 h-1.5 bg-white rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-1.5 h-1.5 bg-white rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
              <div className="absolute inset-0 bg-accent/30 rounded-full" />
            </motion.div>
          )}
        </motion.div>
        
        {/* Status Tooltip */}
        <AnimatePresence>
          <motion.div
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 
                     bg-card/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg 
                     border border-primary/20 min-w-max"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 text-sm">
              {getEmotionIcon()}
              <span className="text-foreground font-medium">{currentMood}</span>
            </div>
            
            {/* Arrow */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                          border-l-8 border-r-8 border-t-8 
                          border-l-transparent border-r-transparent border-t-card/95" />
          </motion.div>
        </AnimatePresence>
        
        {/* Conversation Stats */}
        {messageCount > 5 && (
          <motion.div
            className="absolute -bottom-2 -right-2 w-6 h-6 bg-primary rounded-full 
                     flex items-center justify-center text-xs text-primary-foreground font-bold shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            {messageCount}
          </motion.div>
        )}
        
        {/* Specialty Indicators */}
        {topics.length > 0 && (
          <div className="absolute -left-12 top-0 flex flex-col gap-1">
            {topics.slice(0, 3).map((topic, index) => {
              const icons = {
                nutrition: '🥗',
                orthomolecular: '💊',
                physiotherapy: '🏃‍♀️',
                sleep: '😴',
                stress: '🧘‍♀️'
              };
              
              return (
                <motion.div
                  key={topic}
                  className="w-8 h-8 bg-card rounded-full shadow-md flex items-center justify-center text-lg border border-primary/10"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  {icons[topic as keyof typeof icons] || '💚'}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Interactive Elements */}
      <motion.div
        className="absolute -top-20 -left-20 opacity-20"
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-32 h-32 border border-primary/20 rounded-full" />
      </motion.div>
    </motion.div>
  );
}