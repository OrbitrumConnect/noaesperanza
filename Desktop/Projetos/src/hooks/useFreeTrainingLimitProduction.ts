import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export const useFreeTrainingLimitProduction = (eraSlug: string) => {
  const { user } = useAuth();
  const safeEraSlug = eraSlug || 'egito-antigo';
  
  console.log('🔍 useFreeTrainingLimitProduction chamado com eraSlug:', eraSlug, 'safeEraSlug:', safeEraSlug);

  const [canTrain, setCanTrain] = useState<boolean>(true);
  const [trainingCount, setTrainingCount] = useState<number>(0);
  const [maxTrainings] = useState<number>(8); // 8 treinos totais por dia para FREE
  const [eraTrainingCount, setEraTrainingCount] = useState<number>(0);
  const [remainingTrainings, setRemainingTrainings] = useState<number>(8);
  const [remainingEraTrainings, setRemainingEraTrainings] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      checkDailyLimit();
    }
  }, [safeEraSlug, user]);

  const checkDailyLimit = async () => {
    if (!user) {
      console.log('❌ Usuário não autenticado');
      setLoading(false);
      return;
    }

    if (!supabase) {
      console.log('❌ Supabase não disponível');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 checkDailyLimit executado com safeEraSlug:', safeEraSlug);
      
      const today = new Date().toDateString();
      
      // Buscar dados do daily_limits
      const { data: dailyLimits, error } = await supabase
        .from('daily_limits')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar daily_limits:', error);
        // Em produção, não temos fallback - apenas log do erro
        setCanTrain(false);
        setLoading(false);
        return;
      }

      // Verificar se é o mesmo dia
      const lastResetDate = new Date(dailyLimits.last_reset_date).toDateString();
      
      if (lastResetDate === today) {
        // Mesmo dia - usar dados do Supabase
        const totalQuestions = dailyLimits.daily_questions_answered || 0;
        
        // Para FREE, vamos usar uma lógica simples:
        // - Máximo 8 perguntas por dia
        // - Máximo 2 por era (vamos implementar isso depois)
        
        setTrainingCount(totalQuestions);
        setCanTrain(totalQuestions < maxTrainings);
        setRemainingTrainings(Math.max(0, maxTrainings - totalQuestions));
        
        console.log(`🔍 FREE: Estado atualizado - Total: ${totalQuestions}/8, Restantes: ${Math.max(0, maxTrainings - totalQuestions)}`);
      } else {
        // Novo dia - resetar contador
        await resetDailyCount();
      }
      
    } catch (error) {
      console.error('❌ Erro inesperado na função checkDailyLimit:', error);
      // Em produção, não temos fallback - apenas log do erro
      setCanTrain(false);
    } finally {
      setLoading(false);
    }
  };

  const resetDailyCount = async () => {
    if (!user) {
      console.log('❌ Usuário não autenticado para reset');
      return;
    }

    if (!supabase) {
      console.log('❌ Supabase não disponível para reset');
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      // Resetar no Supabase
      const { error } = await supabase
        .from('daily_limits')
        .update({
          daily_credits_earned: 0,
          daily_questions_answered: 0,
          last_reset_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao resetar daily_limits:', error);
        return;
      }

      // Resetar estado local
      setTrainingCount(0);
      setEraTrainingCount(0);
      setCanTrain(true);
      setRemainingTrainings(maxTrainings);
      setRemainingEraTrainings(2);
      
      console.log('🔄 Contador de treinamentos FREE resetado no Supabase');
      
    } catch (error) {
      console.error('❌ Erro ao resetar contador:', error);
    }
  };

  const incrementTrainingCount = async () => {
    if (!user) {
      console.log('❌ Usuário não autenticado para incrementar');
      return;
    }

    if (!supabase) {
      console.log('❌ Supabase não disponível para incrementar');
      return;
    }

    try {
      // Incrementar no Supabase
      const { error } = await supabase
        .from('daily_limits')
        .update({
          daily_questions_answered: trainingCount + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao incrementar daily_limits:', error);
        return;
      }

      // Atualizar estado local
      const newCount = trainingCount + 1;
      setTrainingCount(newCount);
      setCanTrain(newCount < maxTrainings);
      setRemainingTrainings(Math.max(0, maxTrainings - newCount));

      console.log(`🎯 FREE: Treino ${safeEraSlug} realizado! ${newCount}/8 total hoje`);
      
    } catch (error) {
      console.error('❌ Erro ao incrementar contador:', error);
    }
  };

  const resetTrainingCount = () => {
    resetDailyCount();
    console.log('🔄 Contador de treinamentos FREE resetado');
  };

  return {
    trainingCount,
    canTrain,
    maxTrainings,
    remainingTrainings,
    eraTrainingCount,
    remainingEraTrainings,
    incrementTrainingCount,
    resetTrainingCount,
    checkDailyLimit,
    loading
  };
};
