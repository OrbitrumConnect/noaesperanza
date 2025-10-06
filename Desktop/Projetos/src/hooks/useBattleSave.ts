import { useState } from 'react';
import supabase from '@/lib/supabase';
import { useCreditsPerception } from '@/hooks/useCreditsPerception';

interface BattleData {
  eraName: string;
  questionsTotal: number;
  questionsCorrect: number;
  xpEarned: number;
  moneyEarned: number;
  battleDurationSeconds?: number;
  battleType?: 'training' | 'pvp' | 'tournament';
}

export const useBattleSave = () => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🏆 SINCRONIZAR COM RANKING
  const syncWithRanking = async (userId: string, battleData: BattleData, accuracyPercentage: number, isWin: boolean) => {
    try {
      console.log('🏆 Sincronizando com ranking...', { userId, xp: battleData.xpEarned, accuracy: accuracyPercentage });

      // Verificar se usuário é premium (assumir que todos são free por enquanto)
      const isPremium = false; // TODO: implementar verificação de premium
      const rankingTable = isPremium ? 'premium_rankings' : 'free_rankings';

      // Buscar dados atuais do ranking
      const { data: existingRanking } = await supabase
        .from(rankingTable)
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingRanking) {
        // Criar novo registro no ranking
        const { error: insertError } = await supabase
          .from(rankingTable)
          .insert({
            user_id: userId,
            total_points: battleData.xpEarned,
            arena_points: battleData.xpEarned,
            training_points: battleData.battleType === 'training' ? battleData.xpEarned : 0,
            credits_points: battleData.moneyEarned,
            battles_won: isWin ? 1 : 0,
            total_xp: battleData.xpEarned,
            accuracy_average: accuracyPercentage,
            current_rank: 999999, // Será atualizado pelo sistema
            last_updated: new Date().toISOString()
          });

        if (insertError) {
          console.error('Erro ao criar ranking:', insertError);
        } else {
          console.log('✅ Novo usuário adicionado ao ranking!');
        }
      } else {
        // Atualizar ranking existente
        const newTotalPoints = existingRanking.total_points + battleData.xpEarned;
        const newArenaPoints = existingRanking.arena_points + battleData.xpEarned;
        const newTrainingPoints = existingRanking.training_points + (battleData.battleType === 'training' ? battleData.xpEarned : 0);
        const newCreditsPoints = existingRanking.credits_points + battleData.moneyEarned;
        const newBattlesWon = existingRanking.battles_won + (isWin ? 1 : 0);
        const newTotalXp = existingRanking.total_xp + battleData.xpEarned;
        
        // Calcular nova média de precisão
        const totalBattles = (existingRanking.battles_won || 0) + 1;
        const newAccuracyAverage = Math.round(((existingRanking.accuracy_average || 0) * (totalBattles - 1) + accuracyPercentage) / totalBattles);

        const { error: updateError } = await supabase
          .from(rankingTable)
          .update({
            total_points: newTotalPoints,
            arena_points: newArenaPoints,
            training_points: newTrainingPoints,
            credits_points: newCreditsPoints,
            battles_won: newBattlesWon,
            total_xp: newTotalXp,
            accuracy_average: newAccuracyAverage,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Erro ao atualizar ranking:', updateError);
        } else {
          console.log('✅ Ranking atualizado com sucesso!', {
            totalPoints: newTotalPoints,
            battlesWon: newBattlesWon,
            accuracy: newAccuracyAverage
          });
        }
      }
    } catch (err) {
      console.error('❌ Erro ao sincronizar com ranking:', err);
      // Não falhar a batalha se o ranking der erro
    }
  };

  // Obter ID do usuário autenticado
  const getUserId = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw new Error('Usuário não autenticado');
    }
    
    return user.id;
  };

  // Salvar dados no Supabase
  const saveToSupabase = async (userId: string, battleData: BattleData) => {
    const accuracyPercentage = Math.round((battleData.questionsCorrect / battleData.questionsTotal) * 100);
    const isWin = accuracyPercentage >= 70;

    // 1. Criar ou atualizar perfil do usuário
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingProfile) {
      // Criar novo perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          display_name: `Guerreiro ${userId.slice(-4)}`,
          total_xp: battleData.xpEarned,
          total_battles: 1,
          battles_won: isWin ? 1 : 0,
          favorite_era: battleData.eraName,
        });

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        throw profileError;
      }
    } else {
      // Atualizar perfil existente
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          total_xp: existingProfile.total_xp + battleData.xpEarned,
          total_battles: existingProfile.total_battles + 1,
          battles_won: existingProfile.battles_won + (isWin ? 1 : 0),
          favorite_era: battleData.eraName,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        throw profileError;
      }
    }

    // 2. Criar ou atualizar carteira do usuário
    const { data: existingWallet } = await supabase
      .from('user_wallet')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!existingWallet) {
      // Criar nova carteira
      const { error: walletError } = await supabase
        .from('user_wallet')
        .insert({
          user_id: userId,
          balance: battleData.moneyEarned,
          total_earned: battleData.moneyEarned,
          total_spent: 0,
        });

      if (walletError) {
        console.error('Erro ao criar carteira:', walletError);
        throw walletError;
      }
    } else {
      // Atualizar carteira existente
      const { error: walletError } = await supabase
        .from('user_wallet')
        .update({
          balance: existingWallet.balance + battleData.moneyEarned,
          total_earned: existingWallet.total_earned + battleData.moneyEarned,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (walletError) {
        console.error('Erro ao atualizar carteira:', walletError);
        throw walletError;
      }
    }

    // 3. Salvar histórico de batalha
    const { data: battleRecord, error: battleError } = await supabase
      .from('battle_history')
      .insert({
        user_id: userId,
        era_name: battleData.eraName,
        questions_total: battleData.questionsTotal,
        questions_correct: battleData.questionsCorrect,
        accuracy_percentage: accuracyPercentage,
        xp_earned: battleData.xpEarned,
        money_earned: battleData.moneyEarned,
        battle_duration_seconds: battleData.battleDurationSeconds || 180,
      })
      .select()
      .single();

    if (battleError) {
      console.error('Erro ao salvar batalha:', battleError);
      throw battleError;
    }

    // 4. Adicionar transação na carteira
    if (battleData.moneyEarned > 0) {
      const { error: transactionError } = await supabase
        .from('wallet_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'earned',
          amount: battleData.moneyEarned,
          description: `${isWin ? 'Vitória' : 'Participação'} - ${battleData.eraName}`,
          battle_id: battleRecord.id,
        });

      if (transactionError) {
        console.error('Erro ao salvar transação:', transactionError);
        // Não falhar se a transação der erro
      }
    }

    // 5. 🏆 SINCRONIZAR COM RANKING
    await syncWithRanking(userId, battleData, accuracyPercentage, isWin);

    return { success: true, battleId: battleRecord.id, userId };
  };

  // Fallback para localStorage
  const saveToLocalStorage = async (userId: string, battleData: BattleData) => {
    const accuracyPercentage = Math.round((battleData.questionsCorrect / battleData.questionsTotal) * 100);
    const isWin = accuracyPercentage >= 70;

    let localProfile = JSON.parse(localStorage.getItem(`profile_${userId}`) || 'null');
    let localWallet = JSON.parse(localStorage.getItem(`wallet_${userId}`) || 'null');
    const localBattles = JSON.parse(localStorage.getItem(`battles_${userId}`) || '[]');

    if (!localProfile) {
      localProfile = {
        id: `profile-${userId}`,
        user_id: userId,
        display_name: `Guerreiro ${userId.slice(-4)}`,
        total_xp: battleData.xpEarned,
        total_battles: 1,
        battles_won: isWin ? 1 : 0,
        favorite_era: battleData.eraName,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else {
      localProfile.total_xp += battleData.xpEarned;
      localProfile.total_battles += 1;
      localProfile.battles_won += isWin ? 1 : 0;
      localProfile.favorite_era = battleData.eraName;
      localProfile.updated_at = new Date().toISOString();
    }

    if (!localWallet) {
      localWallet = {
        id: `wallet-${userId}`,
        user_id: userId,
        balance: battleData.moneyEarned,
        total_earned: battleData.moneyEarned,
        total_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else {
      localWallet.balance += battleData.moneyEarned;
      localWallet.total_earned += battleData.moneyEarned;
      localWallet.updated_at = new Date().toISOString();
    }

    const newBattle = {
      id: `battle-${Date.now()}`,
      user_id: userId,
      era_name: battleData.eraName,
      questions_total: battleData.questionsTotal,
      questions_correct: battleData.questionsCorrect,
      accuracy_percentage: accuracyPercentage,
      xp_earned: battleData.xpEarned,
      money_earned: battleData.moneyEarned,
      battle_duration_seconds: battleData.battleDurationSeconds || 180,
      completed_at: new Date().toISOString()
    };

    localBattles.unshift(newBattle);

    // Salvar dados específicos do usuário
    localStorage.setItem(`profile_${userId}`, JSON.stringify(localProfile));
    localStorage.setItem(`wallet_${userId}`, JSON.stringify(localWallet));
    localStorage.setItem(`battles_${userId}`, JSON.stringify(localBattles));

    return { success: true, battleId: newBattle.id, userId, local: true };
  };

  const saveBattleResult = async (battleData: BattleData) => {
    try {
      setSaving(true);
      setError(null);

      const userId = await getUserId();
      console.log('🎯 Salvando batalha para usuário:', userId);

      // Tentar Supabase primeiro
      try {
        const result = await saveToSupabase(userId, battleData);
        console.log('✅ Dados salvos no Supabase com sucesso!', {
          user: userId,
          xp: battleData.xpEarned,
          money: battleData.moneyEarned,
          era: battleData.eraName
        });
        setSaving(false);
        return result;
      } catch (supabaseError) {
        console.log('❌ Erro no Supabase, usando localStorage como fallback:', supabaseError);
        
        // Fallback para localStorage
        const localResult = await saveToLocalStorage(userId, battleData);
        console.log('💾 Dados salvos localmente como fallback');
        setSaving(false);
        return localResult;
      }

    } catch (err) {
      console.error('❌ Erro crítico ao salvar dados:', err);
      setError('Erro ao salvar dados da batalha');
      setSaving(false);
      return { success: false, error: err };
    }
  };

  return {
    saveBattleResult,
    saving,
    error,
  };
};
