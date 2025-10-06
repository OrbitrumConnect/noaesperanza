import { useState, useEffect } from 'react';

// Limite diário de partidas PvP para controlar ganhos
const DAILY_PVP_LIMIT = 6; // Limite diário de PvP (3 ganhando crédito + 3 diversão)
const STORAGE_KEY = 'pvp_daily_limit';

interface PvPLimitData {
  date: string;
  battlesPlayed: number;
}

export const usePvPLimit = (userType: 'free' | 'paid' | 'vip' | 'banned' = 'free') => {
  const [battlesPlayed, setBattlesPlayed] = useState(0);
  const [canPlayPvP, setCanPlayPvP] = useState(userType !== 'free');
  
  useEffect(() => {
    if (userType === 'free') {
      // Usuários gratuitos não podem jogar PvP
      setCanPlayPvP(false);
      setBattlesPlayed(0);
      return;
    }

    const today = new Date().toDateString();
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        const data: PvPLimitData = JSON.parse(stored);
        
        if (data.date === today) {
          // Mesmo dia - usar dados existentes
          setBattlesPlayed(data.battlesPlayed);
          setCanPlayPvP(data.battlesPlayed < DAILY_PVP_LIMIT);
        } else {
          // Novo dia - resetar contadores
          resetDailyLimit();
        }
      } catch {
        resetDailyLimit();
      }
    } else {
      resetDailyLimit();
    }
  }, [userType]);

  // 🎯 LISTENER PARA INCREMENTAR CONTADOR QUANDO PARTIDA É FINALIZADA
  useEffect(() => {
    const handleBattleCompleted = (event: CustomEvent) => {
      console.log('🎯 [PvP LIMIT] Partida finalizada, incrementando contador...');
      incrementBattles();
    };

    window.addEventListener('pvp-battle-completed', handleBattleCompleted as EventListener);
    
    return () => {
      window.removeEventListener('pvp-battle-completed', handleBattleCompleted as EventListener);
    };
  }, []);

  // 🔄 ATUALIZAR LIMITES PvP QUANDO USER_TYPE MUDAR
  useEffect(() => {
    if (userType === 'paid' || userType === 'vip') {
      // ✅ Usuário virou PAID/VIP - resetar contadores PvP
      const today = new Date().toDateString();
      const newData: PvPLimitData = {
        date: today,
        battlesPlayed: 0
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setBattlesPlayed(0);
      setCanPlayPvP(true);
      console.log('⚔️ Usuário virou PAID/VIP - PvP liberado!');
    }
  }, [userType]);

  const resetDailyLimit = () => {
    const today = new Date().toDateString();
    const newData: PvPLimitData = {
      date: today,
      battlesPlayed: 0
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setBattlesPlayed(0);
    setCanPlayPvP(userType !== 'free');
  };

  const incrementBattles = () => {
    if (userType === 'free') return 0; // Usuários gratuitos não podem jogar PvP

    const today = new Date().toDateString();
    const newCount = battlesPlayed + 1;
    
    const newData: PvPLimitData = {
      date: today,
      battlesPlayed: newCount
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    setBattlesPlayed(newCount);
    setCanPlayPvP(newCount < DAILY_PVP_LIMIT);
    
    return newCount;
  };

  const getBattlesRemaining = () => {
    if (userType === 'free') return 0;
    return Math.max(0, DAILY_PVP_LIMIT - battlesPlayed);
  };

  const getPvPLimitInfo = () => {
    return {
      dailyLimit: DAILY_PVP_LIMIT,
      battlesPlayed,
      battlesRemaining: getBattlesRemaining(),
      canPlay: canPlayPvP,
      resetTime: "00:00 (meia-noite)",
      warningMessage: `⚠️ Limite diário: ${DAILY_PVP_LIMIT} partidas (3 ganhando crédito + 3 diversão)`
    };
  };

  return {
    battlesPlayed,
    canPlayPvP,
    incrementBattles,
    getBattlesRemaining,
    getPvPLimitInfo,
    resetDailyLimit // Para testes
  };
};
