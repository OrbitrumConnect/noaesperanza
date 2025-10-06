import { useState, useEffect } from 'react';

interface TrainingData {
  date: string;
  count: number;
}

export const useTrainingLimit = (userType: 'free' | 'paid' | 'vip' | 'banned' = 'free') => {
  const [trainingCount, setTrainingCount] = useState<number>(0);
  const [canTrain, setCanTrain] = useState<boolean>(true);
  
  // Limites baseados no tipo de usuário
  const MAX_TRAINING_PER_DAY = userType === 'free' ? 8 : 12; // FREE: 8, PAGOS: 12

  useEffect(() => {
    checkDailyLimit();
  }, [userType]);

  // 🔄 ATUALIZAR LIMITES QUANDO USER_TYPE MUDAR
  useEffect(() => {
    if (userType === 'paid' || userType === 'vip') {
      // ✅ Usuário virou PAID/VIP - resetar contadores antigos
      const today = new Date().toDateString();
      const newData: TrainingData = {
        date: today,
        count: 0
      };
      localStorage.setItem('training_limit', JSON.stringify(newData));
      setTrainingCount(0);
      setCanTrain(true);
      console.log('🎯 Usuário virou PAID/VIP - Limites atualizados!');
    }
  }, [userType]);

  const checkDailyLimit = () => {
    const today = new Date().toDateString();
    const storedData = localStorage.getItem('training_limit');
    
    if (storedData) {
      const trainingData: TrainingData = JSON.parse(storedData);
      
      if (trainingData.date === today) {
        // Mesmo dia - verificar limite
        setTrainingCount(trainingData.count);
        setCanTrain(trainingData.count < MAX_TRAINING_PER_DAY);
      } else {
        // Novo dia - resetar contador
        resetDailyCount();
      }
    } else {
      // Primeira vez - inicializar
      resetDailyCount();
    }
  };

  const resetDailyCount = () => {
    const today = new Date().toDateString();
    const newData: TrainingData = {
      date: today,
      count: 0
    };
    
    localStorage.setItem('training_limit', JSON.stringify(newData));
    setTrainingCount(0);
    setCanTrain(true);
  };

  const incrementTrainingCount = () => {
    const today = new Date().toDateString();
    const newCount = trainingCount + 1;
    
    const newData: TrainingData = {
      date: today,
      count: newCount
    };
    
    localStorage.setItem('training_limit', JSON.stringify(newData));
    setTrainingCount(newCount);
    setCanTrain(newCount < MAX_TRAINING_PER_DAY);
    
    console.log(`🎯 Treinamento ${newCount}/${MAX_TRAINING_PER_DAY} realizado hoje`);
  };

  const getRemainingTrainings = (): number => {
    return Math.max(0, MAX_TRAINING_PER_DAY - trainingCount);
  };

  const resetTrainingCount = () => {
    resetDailyCount();
    console.log('🔄 Contador de treinamentos resetado');
  };

  return {
    trainingCount,
    canTrain,
    maxTrainings: MAX_TRAINING_PER_DAY,
    remainingTrainings: getRemainingTrainings(),
    incrementTrainingCount,
    resetTrainingCount,
    checkDailyLimit
  };
};
