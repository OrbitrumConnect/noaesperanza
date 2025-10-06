import { useState, useEffect, useCallback } from 'react';

export interface TimerState {
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
}

export const useBattleTimer = (
  gamePhase: string,
  onTimeUp?: () => void,
  timePerQuestion: number = 120
) => {
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // ⏰ Iniciar timer
  const startTimer = useCallback((initialTime?: number) => {
    setTimeLeft(initialTime || timePerQuestion);
    setIsRunning(true);
    setIsPaused(false);
  }, [timePerQuestion]);

  // ⏸️ Pausar timer
  const pauseTimer = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
  }, []);

  // ▶️ Retomar timer
  const resumeTimer = useCallback(() => {
    setIsPaused(false);
    setIsRunning(true);
  }, []);

  // 🔄 Reset timer
  const resetTimer = useCallback((newTime?: number) => {
    setTimeLeft(newTime || timePerQuestion);
    setIsRunning(false);
    setIsPaused(false);
  }, [timePerQuestion]);

  // ⏰ Timer por pergunta - reset a cada nova pergunta
  const resetForNewQuestion = useCallback(() => {
    setTimeLeft(timePerQuestion);
    setIsRunning(true);
    setIsPaused(false);
  }, [timePerQuestion]);

  // 🎯 Timer principal
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && !isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning, isPaused, timeLeft, onTimeUp]);

  // 🎮 Controlar timer baseado na fase do jogo
  useEffect(() => {
    switch (gamePhase) {
      case 'confirming':
        resetTimer(30); // 30 segundos para confirmar
        break;
      case 'playing':
        if (!isRunning && !isPaused) {
          startTimer();
        }
        break;
      case 'finished':
        pauseTimer();
        break;
      default:
        pauseTimer();
    }
  }, [gamePhase, isRunning, isPaused, resetTimer, startTimer, pauseTimer]);

  // 📊 Formatar tempo para exibição
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // 🎯 Estado do timer
  const timerState: TimerState = {
    timeLeft,
    isRunning,
    isPaused
  };

  return {
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    resetForNewQuestion,
    formatTime
  };
};
