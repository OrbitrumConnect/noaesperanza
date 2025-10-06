import { useState, useCallback, useEffect } from 'react';

export interface AnimationState {
  showAttackAnimation: boolean;
  attackEffect: 'player1' | 'player2' | null;
  showAnswerFeedback: boolean;
  correctAnswerIndex: number | null;
  animationTrigger: number;
}

export const useBattleAnimations = () => {
  const [showAttackAnimation, setShowAttackAnimation] = useState(false);
  const [attackEffect, setAttackEffect] = useState<'player1' | 'player2' | null>(null);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [animationTrigger, setAnimationTrigger] = useState(0);

  // 🎬 Disparar animação de ataque
  const triggerAttackAnimation = useCallback((player: 'player1' | 'player2') => {
    console.log('🎬 [ANIMATION] Disparando animação de ataque para:', player);
    
    setShowAttackAnimation(true);
    setAttackEffect(player);
    setAnimationTrigger(prev => prev + 1);
    
    // Auto-reset após 2 segundos
    setTimeout(() => {
      setAttackEffect(null);
      setShowAttackAnimation(false);
    }, 2000);
  }, []);

  // ✅ Mostrar feedback de resposta correta
  const showCorrectAnswer = useCallback((correctIndex: number) => {
    setCorrectAnswerIndex(correctIndex);
    setShowAnswerFeedback(true);
    
    // Auto-reset após 2 segundos
    setTimeout(() => {
      setShowAnswerFeedback(false);
      setCorrectAnswerIndex(null);
    }, 2000);
  }, []);

  // ❌ Mostrar feedback de resposta incorreta
  const showIncorrectAnswer = useCallback(() => {
    setShowAnswerFeedback(true);
    
    // Auto-reset após 2 segundos
    setTimeout(() => {
      setShowAnswerFeedback(false);
    }, 2000);
  }, []);

  // 🔄 Reset todas as animações
  const resetAnimations = useCallback(() => {
    setShowAttackAnimation(false);
    setAttackEffect(null);
    setShowAnswerFeedback(false);
    setCorrectAnswerIndex(null);
  }, []);

  // 🎯 Processar resposta com animações
  const processAnswer = useCallback((
    answerIndex: number, 
    correctIndex: number, 
    isPlayer1: boolean
  ) => {
    const isCorrect = answerIndex === correctIndex;
    
    if (isCorrect) {
      // Jogador acertou - disparar animação de ataque
      triggerAttackAnimation(isPlayer1 ? 'player1' : 'player2');
      showCorrectAnswer(correctIndex);
    } else {
      // Jogador errou - mostrar feedback
      showIncorrectAnswer();
    }
    
    return isCorrect;
  }, [triggerAttackAnimation, showCorrectAnswer, showIncorrectAnswer]);

  // 🎮 Estado completo das animações
  const animationState: AnimationState = {
    showAttackAnimation,
    attackEffect,
    showAnswerFeedback,
    correctAnswerIndex,
    animationTrigger
  };

  return {
    animationState,
    triggerAttackAnimation,
    showCorrectAnswer,
    showIncorrectAnswer,
    resetAnimations,
    processAnswer
  };
};
