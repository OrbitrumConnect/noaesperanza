import { useUserType } from './useUserType';
import { useTrainingLimit } from './useTrainingLimit';
import { usePvPLimit } from './usePvPLimit';
import { useLabyrinthLimit } from './useLabyrinthLimit';

/**
 * Hook unificado para gerenciar todos os limites do usuário
 * Integra automaticamente com o Supabase para obter o tipo de usuário
 */
export const useLimits = () => {
  const { userType, loading: userTypeLoading } = useUserType();
  const trainingLimit = useTrainingLimit(userType);
  const pvpLimit = usePvPLimit(userType);
  const labyrinthLimit = useLabyrinthLimit(userType);

  return {
    // Tipo de usuário
    userType,
    userTypeLoading,
    
    // Limites de treino
    training: {
      count: trainingLimit.trainingCount,
      canTrain: trainingLimit.canTrain,
      maxTrainings: trainingLimit.maxTrainings,
      remainingTrainings: trainingLimit.remainingTrainings,
      incrementTraining: trainingLimit.incrementTrainingCount,
      resetTraining: trainingLimit.resetTrainingCount
    },
    
    // Limites de PvP
    pvp: {
      battlesPlayed: pvpLimit.battlesPlayed,
      canPlayPvP: pvpLimit.canPlayPvP,
      battlesRemaining: pvpLimit.getBattlesRemaining(),
      dailyLimit: pvpLimit.getPvPLimitInfo().dailyLimit,
      incrementBattles: pvpLimit.incrementBattles,
      resetBattles: pvpLimit.resetDailyLimit
    },
    
    // Limites de labirinto
    labyrinth: {
      count: labyrinthLimit.labyrinthCount,
      canPlayLabyrinth: labyrinthLimit.canPlayLabyrinth,
      maxLabyrinths: labyrinthLimit.maxLabyrinths,
      remainingLabyrinths: labyrinthLimit.remainingLabyrinths,
      incrementLabyrinth: labyrinthLimit.incrementLabyrinthCount,
      resetLabyrinth: labyrinthLimit.resetLabyrinthCount
    },
    
    // Status geral
    isFree: userType === 'free',
    isPaid: userType === 'paid',
    isVIP: userType === 'vip',
    isBanned: userType === 'banned',
    
    // Resumo dos limites
    getLimitsSummary: () => ({
      userType,
      training: `${trainingLimit.remainingTrainings}/${trainingLimit.maxTrainings}`,
      pvp: `${pvpLimit.getBattlesRemaining()}/${pvpLimit.getPvPLimitInfo().dailyLimit}`,
      labyrinth: `${labyrinthLimit.remainingLabyrinths}/${labyrinthLimit.maxLabyrinths}`
    })
  };
};
