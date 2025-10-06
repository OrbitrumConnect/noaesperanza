import { useState, useEffect } from 'react';

interface LabyrinthData {
  date: string;
  count: number;
}

export const useLabyrinthLimit = (userType: 'free' | 'paid' | 'vip' | 'banned' = 'free') => {
  const [labyrinthCount, setLabyrinthCount] = useState<number>(0);
  const [canPlayLabyrinth, setCanPlayLabyrinth] = useState<boolean>(true);
  
  // Limites baseados no tipo de usuário
  const MAX_LABYRINTH_PER_DAY = userType === 'free' ? 0 : 8; // FREE: 0, PAGOS: 8

  useEffect(() => {
    checkDailyLimit();
  }, [userType]);

  const checkDailyLimit = () => {
    if (userType === 'free') {
      // Usuários gratuitos não podem jogar labirinto
      setCanPlayLabyrinth(false);
      setLabyrinthCount(0);
      return;
    }

    const today = new Date().toDateString();
    const storedData = localStorage.getItem('labyrinth_limit');
    
    if (storedData) {
      const labyrinthData: LabyrinthData = JSON.parse(storedData);
      
      if (labyrinthData.date === today) {
        // Mesmo dia - verificar limite
        setLabyrinthCount(labyrinthData.count);
        setCanPlayLabyrinth(labyrinthData.count < MAX_LABYRINTH_PER_DAY);
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
    const newData: LabyrinthData = {
      date: today,
      count: 0
    };
    
    localStorage.setItem('labyrinth_limit', JSON.stringify(newData));
    setLabyrinthCount(0);
    setCanPlayLabyrinth(userType !== 'free');
  };

  const incrementLabyrinthCount = () => {
    if (userType === 'free') return; // Usuários gratuitos não podem jogar

    const today = new Date().toDateString();
    const newCount = labyrinthCount + 1;
    
    const newData: LabyrinthData = {
      date: today,
      count: newCount
    };
    
    localStorage.setItem('labyrinth_limit', JSON.stringify(newData));
    setLabyrinthCount(newCount);
    setCanPlayLabyrinth(newCount < MAX_LABYRINTH_PER_DAY);
    
    console.log(`🏰 Labirinto ${newCount}/${MAX_LABYRINTH_PER_DAY} realizado hoje`);
  };

  const getRemainingLabyrinths = (): number => {
    if (userType === 'free') return 0;
    return Math.max(0, MAX_LABYRINTH_PER_DAY - labyrinthCount);
  };

  const resetLabyrinthCount = () => {
    resetDailyCount();
    console.log('🔄 Contador de labirintos resetado');
  };

  return {
    labyrinthCount,
    canPlayLabyrinth,
    maxLabyrinths: MAX_LABYRINTH_PER_DAY,
    remainingLabyrinths: getRemainingLabyrinths(),
    incrementLabyrinthCount,
    resetLabyrinthCount,
    checkDailyLimit
  };
};
