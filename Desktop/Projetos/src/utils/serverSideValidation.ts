// 🛡️ UTILITÁRIOS PARA VALIDAÇÃO SERVER-SIDE
// Funções auxiliares para integrar com o sistema server-side

import supabase from '@/lib/supabase';

// 🎯 Validar e registrar treino
export const validateAndRegisterTraining = async (
  eraName: string,
  questionsCorrect: number,
  questionsTotal: number,
  xpEarned: number = 0
): Promise<{ success: boolean; message: string; creditsEarned?: number }> => {
  try {
    // Calcular créditos baseado na performance
    const accuracy = (questionsCorrect / questionsTotal) * 100;
    const creditsEarned = Math.round(accuracy * 0.1); // 0.1 crédito por % de acerto

    // Registrar atividade no servidor
    const response = await fetch('/api/register-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        activity_type: 'training',
        credits_earned: creditsEarned,
        xp_earned: xpEarned,
        metadata: {
          era: eraName,
          questions_correct: questionsCorrect,
          questions_total: questionsTotal,
          accuracy: accuracy
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || 'Erro ao registrar treino'
      };
    }

    return {
      success: true,
      message: 'Treino registrado com sucesso',
      creditsEarned: creditsEarned
    };

  } catch (error) {
    console.error('Erro ao validar treino:', error);
    return {
      success: false,
      message: 'Erro ao validar treino'
    };
  }
};

// ⚔️ Validar e registrar PvP
export const validateAndRegisterPvP = async (
  opponentId: string,
  questionsCorrect: number,
  questionsTotal: number,
  isWinner: boolean,
  xpEarned: number = 0
): Promise<{ success: boolean; message: string; creditsEarned?: number }> => {
  try {
    // Calcular créditos baseado no resultado
    const creditsEarned = isWinner ? 2.5 : 0; // Vencedor ganha 2.5 créditos

    // Registrar atividade no servidor
    const response = await fetch('/api/register-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        activity_type: 'pvp',
        credits_earned: creditsEarned,
        xp_earned: xpEarned,
        metadata: {
          opponent_id: opponentId,
          questions_correct: questionsCorrect,
          questions_total: questionsTotal,
          is_winner: isWinner,
          accuracy: (questionsCorrect / questionsTotal) * 100
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || 'Erro ao registrar PvP'
      };
    }

    return {
      success: true,
      message: isWinner ? 'Vitória registrada!' : 'PvP registrado',
      creditsEarned: creditsEarned
    };

  } catch (error) {
    console.error('Erro ao validar PvP:', error);
    return {
      success: false,
      message: 'Erro ao validar PvP'
    };
  }
};

// 🏛️ Validar e registrar labirinto
export const validateAndRegisterLabyrinth = async (
  eraName: string,
  timeSpent: number,
  questionsCorrect: number,
  questionsTotal: number,
  xpEarned: number = 0
): Promise<{ success: boolean; message: string; creditsEarned?: number }> => {
  try {
    // Calcular créditos baseado na performance e tempo
    const accuracy = (questionsCorrect / questionsTotal) * 100;
    const timeBonus = Math.max(0, 300 - timeSpent) / 100; // Bônus por velocidade
    const creditsEarned = Math.round((accuracy * 0.05) + timeBonus); // 0.05 crédito por % + bônus tempo

    // Registrar atividade no servidor
    const response = await fetch('/api/register-activity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        activity_type: 'labyrinth',
        credits_earned: creditsEarned,
        xp_earned: xpEarned,
        metadata: {
          era: eraName,
          time_spent: timeSpent,
          questions_correct: questionsCorrect,
          questions_total: questionsTotal,
          accuracy: accuracy,
          time_bonus: timeBonus
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: result.error || 'Erro ao registrar labirinto'
      };
    }

    return {
      success: true,
      message: 'Labirinto completado!',
      creditsEarned: creditsEarned
    };

  } catch (error) {
    console.error('Erro ao validar labirinto:', error);
    return {
      success: false,
      message: 'Erro ao validar labirinto'
    };
  }
};

// 📊 Obter status completo dos limites
export const getCompleteLimitsStatus = async (): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> => {
  try {
    const { data, error } = await supabase.rpc('get_daily_limits_status', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error('Erro ao obter status dos limites:', error);
    return {
      success: false,
      message: 'Erro ao obter status dos limites'
    };
  }
};

// 🔄 Sincronizar dados locais com servidor
export const syncLocalDataWithServer = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Obter status do servidor
    const serverStatus = await getCompleteLimitsStatus();
    
    if (!serverStatus.success) {
      throw new Error('Erro ao obter dados do servidor');
    }

    // Sincronizar localStorage com dados do servidor
    const serverData = serverStatus.data;
    
    // Atualizar localStorage com dados do servidor
    localStorage.setItem('server_sync_date', new Date().toISOString());
    localStorage.setItem('server_limits', JSON.stringify(serverData.limits));
    localStorage.setItem('server_user_type', serverData.user_type);
    localStorage.setItem('server_tier', serverData.tier);

    return {
      success: true,
      message: 'Dados sincronizados com sucesso'
    };

  } catch (error) {
    console.error('Erro ao sincronizar dados:', error);
    return {
      success: false,
      message: 'Erro ao sincronizar dados'
    };
  }
};
