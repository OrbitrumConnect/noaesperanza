import { useState, useEffect } from 'react';
import { useUserType } from './useUserType';

// Sistema de créditos PvP diários para usuários PAID
const DAILY_PVP_CREDITS = 7; // 1 PvP por dia
const STORAGE_KEY = 'daily_pvp_credits';

interface DailyPvPCreditsData {
  date: string;
  creditsReceived: number;
  creditsUsed: number;
  creditsRemaining: number;
}

export const useDailyPvPCredits = () => {
  const [dailyCredits, setDailyCredits] = useState<DailyPvPCreditsData | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState(0);
  const { userType } = useUserType();

  useEffect(() => {
    if (userType === 'free') {
      setCreditsRemaining(0);
      return;
    }

    const today = new Date().toDateString();
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        const data: DailyPvPCreditsData = JSON.parse(stored);
        
        if (data.date === today) {
          // Mesmo dia - usar dados existentes
          setDailyCredits(data);
          setCreditsRemaining(data.creditsRemaining);
        } else {
          // Novo dia - resetar créditos
          const newData: DailyPvPCreditsData = {
            date: today,
            creditsReceived: DAILY_PVP_CREDITS,
            creditsUsed: 0,
            creditsRemaining: DAILY_PVP_CREDITS
          };
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
          setDailyCredits(newData);
          setCreditsRemaining(DAILY_PVP_CREDITS);
          
          console.log('🔄 Novo dia - 7 créditos PvP renovados!');
        }
      } catch (error) {
        console.error('Erro ao carregar créditos PvP diários:', error);
        // Reset em caso de erro
        const newData: DailyPvPCreditsData = {
          date: today,
          creditsReceived: DAILY_PVP_CREDITS,
          creditsUsed: 0,
          creditsRemaining: DAILY_PVP_CREDITS
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
        setDailyCredits(newData);
        setCreditsRemaining(DAILY_PVP_CREDITS);
      }
    } else {
      // Primeira vez - dar créditos iniciais
      const newData: DailyPvPCreditsData = {
        date: today,
        creditsReceived: DAILY_PVP_CREDITS,
        creditsUsed: 0,
        creditsRemaining: DAILY_PVP_CREDITS
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setDailyCredits(newData);
      setCreditsRemaining(DAILY_PVP_CREDITS);
      
      console.log('🎉 Primeiro dia - 7 créditos PvP recebidos!');
    }
  }, [userType]);

  const usePvPCredits = (amount: number = 7) => {
    if (userType === 'free') return false;
    
    const today = new Date().toDateString();
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        const data: DailyPvPCreditsData = JSON.parse(stored);
        
        if (data.date === today && data.creditsRemaining >= amount) {
          const updatedData: DailyPvPCreditsData = {
            ...data,
            creditsUsed: data.creditsUsed + amount,
            creditsRemaining: data.creditsRemaining - amount
          };
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
          setDailyCredits(updatedData);
          setCreditsRemaining(updatedData.creditsRemaining);
          
          console.log(`⚔️ PvP: ${amount} créditos usados. Restam: ${updatedData.creditsRemaining}`);
          return true;
        }
      } catch (error) {
        console.error('Erro ao usar créditos PvP:', error);
      }
    }
    
    return false;
  };

  const getDailyPvPInfo = () => {
    if (userType === 'free') {
      return {
        canPlayPvP: false,
        creditsRemaining: 0,
        creditsUsed: 0,
        creditsTotal: 0,
        warningMessage: '⚠️ Usuários gratuitos não podem jogar PvP'
      };
    }

    return {
      canPlayPvP: creditsRemaining >= 7,
      creditsRemaining,
      creditsUsed: dailyCredits?.creditsUsed || 0,
      creditsTotal: DAILY_PVP_CREDITS,
      warningMessage: `⚔️ Créditos PvP: ${creditsRemaining}/${DAILY_PVP_CREDITS} (renovam todo dia)`
    };
  };

  return {
    creditsRemaining,
    usePvPCredits,
    getDailyPvPInfo,
    dailyCredits
  };
};
