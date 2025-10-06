// 🛡️ HOOK PARA USAR VALIDAÇÃO SERVER-SIDE
// Este hook substitui os hooks locais por validação no servidor

import { useState, useCallback } from 'react';
import supabase from '@/lib/supabase';

interface LimitValidation {
  allowed: boolean;
  reason?: string;
  limit: number;
  used: number;
  remaining: number;
  requested?: number;
}

interface DailyLimitsStatus {
  user_type: string;
  tier: string;
  date: string;
  limits: {
    credits: { limit: number; used: number; remaining: number };
    training: { limit: number; used: number; remaining: number };
    pvp: { limit: number; used: number; remaining: number };
  };
}

export const useServerSideLimits = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Validar se pode realizar uma atividade
  const validateActivity = useCallback(async (
    activityType: 'training' | 'pvp' | 'credits',
    amount: number = 1
  ): Promise<LimitValidation | null> => {
    try {
      setLoading(true);
      setError(null);

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Chamar edge function para validação
      const response = await fetch('/api/validate-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          activity_type: activityType,
          amount: amount
        })
      });

      if (!response.ok) {
        throw new Error('Erro na validação');
      }

      const validation = await response.json();
      return validation;

    } catch (err) {
      console.error('Erro ao validar atividade:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 📝 Registrar uma atividade
  const registerActivity = useCallback(async (
    activityType: 'training' | 'pvp' | 'credits' | 'labyrinth',
    creditsEarned: number = 0,
    xpEarned: number = 0,
    metadata: Record<string, any> = {}
  ): Promise<{ success: boolean; message?: string; validation?: LimitValidation }> => {
    try {
      setLoading(true);
      setError(null);

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Chamar edge function para registrar
      const response = await fetch('/api/register-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          user_id: user.id,
          activity_type: activityType,
          credits_earned: creditsEarned,
          xp_earned: xpEarned,
          metadata: metadata
        })
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.error || 'Erro ao registrar atividade'
        };
      }

      return {
        success: true,
        message: result.message,
        validation: result.validation
      };

    } catch (err) {
      console.error('Erro ao registrar atividade:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return {
        success: false,
        message: 'Erro ao registrar atividade'
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // 📊 Obter status dos limites
  const getLimitsStatus = useCallback(async (): Promise<DailyLimitsStatus | null> => {
    try {
      setLoading(true);
      setError(null);

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Chamar função server-side
      const { data, error } = await supabase.rpc('get_daily_limits_status', {
        p_user_id: user.id
      });

      if (error) {
        throw error;
      }

      return data;

    } catch (err) {
      console.error('Erro ao obter status dos limites:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // 🎯 Validar treino
  const canTrain = useCallback(async (): Promise<boolean> => {
    const validation = await validateActivity('training');
    return validation?.allowed || false;
  }, [validateActivity]);

  // ⚔️ Validar PvP
  const canPlayPvP = useCallback(async (): Promise<boolean> => {
    const validation = await validateActivity('pvp');
    return validation?.allowed || false;
  }, [validateActivity]);

  // 💰 Validar créditos
  const canEarnCredits = useCallback(async (amount: number): Promise<boolean> => {
    const validation = await validateActivity('credits', amount);
    return validation?.allowed || false;
  }, [validateActivity]);

  return {
    // Estados
    loading,
    error,
    
    // Funções principais
    validateActivity,
    registerActivity,
    getLimitsStatus,
    
    // Funções de conveniência
    canTrain,
    canPlayPvP,
    canEarnCredits,
    
    // Limpar erro
    clearError: () => setError(null)
  };
};
