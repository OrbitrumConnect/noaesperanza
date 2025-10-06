// 🎯 LIMITES PADRÃO DEFINIDOS - SISTEMA UNIFICADO
// Baseado nos padrões definidos: 22.5 créditos/dia, 27 jogadas/dia total

export interface StandardLimits {
  // 💰 Créditos
  dailyCreditsLimit: number;        // 22.5 créditos/dia
  
  // ⚔️ PvP
  dailyPvPLimit: number;           // 3 PvP/dia
  
  // 🎯 Treinos por Era (4 eras)
  dailyTrainingPerEra: number;     // 3 treinos/era/dia
  totalDailyTrainings: number;     // 12 treinos/dia (4 eras × 3)
  
  // 🏛️ Labirinto
  dailyLabyrinthLimit: number;     // 12 labirintos/dia
  
  // 📊 Total
  totalDailyGames: number;         // 27 jogadas/dia (3 PvP + 12 treinos + 12 labirinto)
  
  // 💸 Saques
  withdrawalLimits: {
    regular: { min: 200, max: 400 };  // 90% dos usuários
    top10: { min: 400, max: 600 };    // 10% top performers
  };
}

// 🎯 CONFIGURAÇÃO PADRÃO
export const STANDARD_LIMITS: StandardLimits = {
  // 💰 Créditos - 22.5/dia para todos
  dailyCreditsLimit: 22.5,
  
  // ⚔️ PvP - 3/dia para todos
  dailyPvPLimit: 3,
  
  // 🎯 Treinos - 3 por era, 4 eras = 12 total
  dailyTrainingPerEra: 3,
  totalDailyTrainings: 12, // 4 eras × 3 treinos
  
  // 🏛️ Labirinto - 12/dia
  dailyLabyrinthLimit: 12,
  
  // 📊 Total - 27 jogadas/dia
  totalDailyGames: 27, // 3 PvP + 12 treinos + 12 labirinto
  
  // 💸 Saques
  withdrawalLimits: {
    regular: { min: 200, max: 400 },  // 90% usuários
    top10: { min: 400, max: 600 }     // 10% top
  }
};

// 🎯 FUNÇÃO PARA VALIDAR LIMITES PADRÃO
export const validateStandardLimits = (
  userType: 'free' | 'paid' | 'vip',
  activityType: 'training' | 'pvp' | 'labyrinth' | 'credits',
  currentUsage: {
    pvpToday: number;
    trainingToday: number;
    labyrinthToday: number;
    creditsEarnedToday: number;
    eraTrainingToday: Record<string, number>; // { 'egito-antigo': 2, 'mesopotamia': 1, ... }
  }
): {
  allowed: boolean;
  reason?: string;
  limit: number;
  used: number;
  remaining: number;
} => {
  
  switch (activityType) {
    case 'credits':
      if (currentUsage.creditsEarnedToday >= STANDARD_LIMITS.dailyCreditsLimit) {
        return {
          allowed: false,
          reason: 'Limite diário de créditos atingido',
          limit: STANDARD_LIMITS.dailyCreditsLimit,
          used: currentUsage.creditsEarnedToday,
          remaining: 0
        };
      }
      return {
        allowed: true,
        limit: STANDARD_LIMITS.dailyCreditsLimit,
        used: currentUsage.creditsEarnedToday,
        remaining: STANDARD_LIMITS.dailyCreditsLimit - currentUsage.creditsEarnedToday
      };
      
    case 'pvp':
      if (currentUsage.pvpToday >= STANDARD_LIMITS.dailyPvPLimit) {
        return {
          allowed: false,
          reason: 'Limite diário de PvP atingido',
          limit: STANDARD_LIMITS.dailyPvPLimit,
          used: currentUsage.pvpToday,
          remaining: 0
        };
      }
      return {
        allowed: true,
        limit: STANDARD_LIMITS.dailyPvPLimit,
        used: currentUsage.pvpToday,
        remaining: STANDARD_LIMITS.dailyPvPLimit - currentUsage.pvpToday
      };
      
    case 'training':
      // Verificar limite por era
      const totalTrainingToday = Object.values(currentUsage.eraTrainingToday).reduce((sum, count) => sum + count, 0);
      
      if (totalTrainingToday >= STANDARD_LIMITS.totalDailyTrainings) {
        return {
          allowed: false,
          reason: 'Limite diário de treinos atingido',
          limit: STANDARD_LIMITS.totalDailyTrainings,
          used: totalTrainingToday,
          remaining: 0
        };
      }
      return {
        allowed: true,
        limit: STANDARD_LIMITS.totalDailyTrainings,
        used: totalTrainingToday,
        remaining: STANDARD_LIMITS.totalDailyTrainings - totalTrainingToday
      };
      
    case 'labyrinth':
      if (currentUsage.labyrinthToday >= STANDARD_LIMITS.dailyLabyrinthLimit) {
        return {
          allowed: false,
          reason: 'Limite diário de labirinto atingido',
          limit: STANDARD_LIMITS.dailyLabyrinthLimit,
          used: currentUsage.labyrinthToday,
          remaining: 0
        };
      }
      return {
        allowed: true,
        limit: STANDARD_LIMITS.dailyLabyrinthLimit,
        used: currentUsage.labyrinthToday,
        remaining: STANDARD_LIMITS.dailyLabyrinthLimit - currentUsage.labyrinthToday
      };
      
    default:
      return {
        allowed: false,
        reason: 'Tipo de atividade inválido',
        limit: 0,
        used: 0,
        remaining: 0
      };
  }
};

// 🎯 FUNÇÃO PARA VALIDAR LIMITE POR ERA
export const validateEraTrainingLimit = (
  eraName: string,
  currentEraUsage: Record<string, number>
): {
  allowed: boolean;
  reason?: string;
  limit: number;
  used: number;
  remaining: number;
} => {
  const eraUsed = currentEraUsage[eraName] || 0;
  
  if (eraUsed >= STANDARD_LIMITS.dailyTrainingPerEra) {
    return {
      allowed: false,
      reason: `Limite diário de treinos para ${eraName} atingido`,
      limit: STANDARD_LIMITS.dailyTrainingPerEra,
      used: eraUsed,
      remaining: 0
    };
  }
  
  return {
    allowed: true,
    limit: STANDARD_LIMITS.dailyTrainingPerEra,
    used: eraUsed,
    remaining: STANDARD_LIMITS.dailyTrainingPerEra - eraUsed
  };
};

// 🎯 FUNÇÃO PARA CALCULAR SAQUE MÁXIMO
export const calculateMaxWithdrawal = (
  userRank: 'top1' | 'top5' | 'top10' | 'top20' | 'regular',
  monthlyEarnings: number
): {
  maxWithdrawal: number;
  tier: 'regular' | 'top10';
  reason: string;
} => {
  const isTop10 = ['top1', 'top5', 'top10'].includes(userRank);
  
  if (isTop10) {
    const maxWithdrawal = Math.min(monthlyEarnings, STANDARD_LIMITS.withdrawalLimits.top10.max);
    return {
      maxWithdrawal,
      tier: 'top10',
      reason: `Top 10% - Saque máximo: ${maxWithdrawal} créditos`
    };
  } else {
    const maxWithdrawal = Math.min(monthlyEarnings, STANDARD_LIMITS.withdrawalLimits.regular.max);
    return {
      maxWithdrawal,
      tier: 'regular',
      reason: `Usuário regular - Saque máximo: ${maxWithdrawal} créditos`
    };
  }
};

// 🎯 FUNÇÃO PARA OBTER RESUMO DOS LIMITES
export const getLimitsSummary = (): {
  daily: {
    credits: number;
    pvp: number;
    training: number;
    labyrinth: number;
    total: number;
  };
  monthly: {
    regularWithdrawal: { min: number; max: number };
    top10Withdrawal: { min: number; max: number };
  };
} => {
  return {
    daily: {
      credits: STANDARD_LIMITS.dailyCreditsLimit,
      pvp: STANDARD_LIMITS.dailyPvPLimit,
      training: STANDARD_LIMITS.totalDailyTrainings,
      labyrinth: STANDARD_LIMITS.dailyLabyrinthLimit,
      total: STANDARD_LIMITS.totalDailyGames
    },
    monthly: {
      regularWithdrawal: STANDARD_LIMITS.withdrawalLimits.regular,
      top10Withdrawal: STANDARD_LIMITS.withdrawalLimits.top10
    }
  };
};
