// 💰 Sistema de Créditos PvP - Implementação Segura
// Baseado na análise: 7 créditos entrada, 9.5 ao vencedor, 4.5 retidos

import supabase from '@/lib/supabase';

export interface PvPCreditsConfig {
  entryFee: number;          // 7 créditos para entrar
  winnerPrize: number;       // 9.5 créditos ao vencedor
  platformRetention: number; // 4.5 créditos retidos (14 - 9.5 = 4.5)
  totalPool: number;         // 14 créditos total (7 + 7)
}

export const PVP_CREDITS_CONFIG: PvPCreditsConfig = {
  entryFee: 7,
  winnerPrize: 9.5,
  platformRetention: 4.5,
  totalPool: 14
};

export interface PvPCreditsTransaction {
  userId: string;
  roomId: string;
  type: 'entry_fee' | 'winner_prize' | 'refund';
  amount: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

// 💳 Verificar se usuário tem créditos suficientes para entrar no PvP
export const checkUserCredits = async (userId: string): Promise<{
  canPlay: boolean;
  currentBalance: number;
  requiredAmount: number;
  error?: string;
}> => {
  try {
    // 🔍 Verificar se o usuário é PAID/VIP primeiro
    const { data: profile, error: profileError } = await (supabase as any)
      .from('profiles')
      .select('user_type')
      .eq('user_id', userId)
      .single();

    if (profileError) {
      console.error('❌ Erro ao verificar tipo de usuário:', profileError);
    }

    const userType = profile?.user_type || 'free';
    console.log('🔍 [CREDITS] Tipo de usuário:', userType);

    // 💰 Buscar carteira do usuário
    const { data: wallet, error } = await (supabase as any)
      .from('user_wallet')
      .select('credits_balance, balance, total_earned')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('❌ Erro ao verificar créditos:', error);
      
      // 🎯 Se usuário é PAID/VIP e não tem carteira, criar uma
      if (userType === 'paid' || userType === 'vip') {
        console.log('💰 [CREDITS] Usuário PAID/VIP sem carteira - criando carteira com créditos iniciais...');
        
        const { error: createError } = await (supabase as any)
          .from('user_wallet')
          .insert({
            user_id: userId,
            credits_balance: 21, // Dar 21 créditos iniciais para usuários pagos
            balance: 21,
            total_earned: 21,
            total_spent: 0
          });

        if (createError) {
          console.error('❌ Erro ao criar carteira:', createError);
          return {
            canPlay: false,
            currentBalance: 0,
            requiredAmount: PVP_CREDITS_CONFIG.entryFee,
            error: 'Erro ao criar carteira'
          };
        }

        return {
          canPlay: true,
          currentBalance: 21,
          requiredAmount: PVP_CREDITS_CONFIG.entryFee,
          error: undefined
        };
      }

      return {
        canPlay: false,
        currentBalance: 0,
        requiredAmount: PVP_CREDITS_CONFIG.entryFee,
        error: 'Erro ao verificar saldo'
      };
    }

    const currentBalance = wallet?.credits_balance || wallet?.balance || 0;
    
    // 🎯 Usuários PAID/VIP podem jogar mesmo com saldo baixo (dar créditos extras)
    if ((userType === 'paid' || userType === 'vip') && currentBalance < PVP_CREDITS_CONFIG.entryFee) {
      console.log('💰 [CREDITS] Usuário PAID/VIP com saldo baixo - adicionando créditos...');
      
      const newBalance = currentBalance + 21; // Adicionar 21 créditos
      
      const { error: updateError } = await (supabase as any)
        .from('user_wallet')
        .update({
          credits_balance: newBalance,
          balance: newBalance,
          total_earned: (wallet?.total_earned || 0) + 21
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('❌ Erro ao adicionar créditos:', updateError);
      } else {
        console.log('✅ [CREDITS] Créditos adicionados para usuário PAID/VIP');
      }

      return {
        canPlay: true,
        currentBalance: newBalance,
        requiredAmount: PVP_CREDITS_CONFIG.entryFee,
        error: undefined
      };
    }

    const canPlay = currentBalance >= PVP_CREDITS_CONFIG.entryFee;

    return {
      canPlay,
      currentBalance,
      requiredAmount: PVP_CREDITS_CONFIG.entryFee,
      error: canPlay ? undefined : `Saldo insuficiente. Necessário: ${PVP_CREDITS_CONFIG.entryFee} créditos`
    };
  } catch (error) {
    console.error('❌ Erro ao verificar créditos:', error);
    return {
      canPlay: false,
      currentBalance: 0,
      requiredAmount: PVP_CREDITS_CONFIG.entryFee,
      error: 'Erro interno do sistema'
    };
  }
};

// 💸 Deduzir taxa de entrada do PvP
export const deductEntryFee = async (userId: string, roomId: string): Promise<{
  success: boolean;
  newBalance: number;
  error?: string;
}> => {
  try {
    console.log('💸 [ENTRY FEE] Deduzindo taxa de entrada:', { userId, roomId, amount: PVP_CREDITS_CONFIG.entryFee });

    // Verificar saldo atual
    const creditCheck = await checkUserCredits(userId);
    if (!creditCheck.canPlay) {
      return {
        success: false,
        newBalance: creditCheck.currentBalance,
        error: creditCheck.error
      };
    }

    // Deduzir taxa de entrada
    const deductedBalance = creditCheck.currentBalance - PVP_CREDITS_CONFIG.entryFee;
    const { data: updatedWallet, error } = await (supabase as any)
      .from('user_wallet')
      .update({
        credits_balance: deductedBalance,
        balance: deductedBalance
      })
      .eq('user_id', userId)
      .select('credits_balance, balance')
      .single();

    if (error) {
      console.error('❌ Erro ao deduzir taxa de entrada:', error);
      return {
        success: false,
        newBalance: creditCheck.currentBalance,
        error: 'Erro ao processar pagamento'
      };
    }

    const finalBalance = updatedWallet?.credits_balance || updatedWallet?.balance || 0;

    // Registrar transação
    await recordPvPTransaction({
      userId,
      roomId,
      type: 'entry_fee',
      amount: -PVP_CREDITS_CONFIG.entryFee, // Negativo para débito
      timestamp: new Date().toISOString(),
      status: 'completed'
    });

    console.log('✅ [ENTRY FEE] Taxa deduzida com sucesso:', { newBalance: finalBalance });
    return {
      success: true,
      newBalance: finalBalance
    };
  } catch (error) {
    console.error('❌ Erro ao deduzir taxa de entrada:', error);
    return {
      success: false,
      newBalance: 0,
      error: 'Erro interno do sistema'
    };
  }
};

// 🏆 Creditar prêmio ao vencedor
export const creditWinnerPrize = async (userId: string, roomId: string): Promise<{
  success: boolean;
  newBalance: number;
  error?: string;
}> => {
  try {
    console.log('🏆 [WINNER PRIZE] Creditando prêmio:', { userId, roomId, amount: PVP_CREDITS_CONFIG.winnerPrize });

    // Buscar carteira atual
    const { data: wallet, error: walletError } = await (supabase as any)
      .from('user_wallet')
      .select('credits_balance, balance, pvp_earnings')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      console.error('❌ Erro ao buscar carteira:', walletError);
      return { success: false, newBalance: 0, error: 'Erro ao buscar carteira' };
    }

    // Creditar prêmio
    const currentBalance = wallet?.credits_balance || wallet?.balance || 0;
    const newBalance = currentBalance + PVP_CREDITS_CONFIG.winnerPrize;
    
    console.log('💰 [WINNER PRIZE] Valores:', {
      currentBalance,
      prizeAmount: PVP_CREDITS_CONFIG.winnerPrize,
      newBalance,
      userId,
      walletData: wallet
    });
    
    const { data: updatedWallet, error } = await (supabase as any)
      .from('user_wallet')
      .update({
        credits_balance: newBalance,
        balance: newBalance,
        pvp_earnings: (wallet?.pvp_earnings || 0) + PVP_CREDITS_CONFIG.winnerPrize
      })
      .eq('user_id', userId)
      .select('credits_balance, balance')
      .single();

    if (error) {
      console.error('❌ Erro ao creditar prêmio:', error);
      return {
        success: false,
        newBalance: 0,
        error: 'Erro ao processar prêmio'
      };
    }

    const finalBalance = updatedWallet?.credits_balance || updatedWallet?.balance || 0;

    // Registrar transação
    await recordPvPTransaction({
      userId,
      roomId,
      type: 'winner_prize',
      amount: PVP_CREDITS_CONFIG.winnerPrize,
      timestamp: new Date().toISOString(),
      status: 'completed'
    });

    console.log('✅ [WINNER PRIZE] Prêmio creditado com sucesso:', { newBalance: finalBalance });
    return {
      success: true,
      newBalance: finalBalance
    };
  } catch (error) {
    console.error('❌ Erro ao creditar prêmio:', error);
    return {
      success: false,
      newBalance: 0,
      error: 'Erro interno do sistema'
    };
  }
};

// 🔄 Reembolsar taxa de entrada (em caso de erro ou cancelamento)
export const refundEntryFee = async (userId: string, roomId: string): Promise<{
  success: boolean;
  newBalance: number;
  error?: string;
}> => {
  try {
    console.log('🔄 [REFUND] Reembolsando taxa de entrada:', { userId, roomId, amount: PVP_CREDITS_CONFIG.entryFee });

    // Buscar carteira atual
    const { data: wallet, error: walletError } = await (supabase as any)
      .from('user_wallet')
      .select('credits_balance, balance')
      .eq('user_id', userId)
      .single();

    if (walletError) {
      console.error('❌ Erro ao buscar carteira:', walletError);
      return { success: false, newBalance: 0, error: 'Erro ao buscar carteira' };
    }

    // Reembolsar taxa
    const { data: updatedWallet, error } = await (supabase as any)
      .from('user_wallet')
      .update({
        credits_balance: (wallet?.credits_balance || 0) + PVP_CREDITS_CONFIG.entryFee,
        balance: (wallet?.balance || 0) + PVP_CREDITS_CONFIG.entryFee
      })
      .eq('user_id', userId)
      .select('credits_balance, balance')
      .single();

    if (error) {
      console.error('❌ Erro ao reembolsar taxa:', error);
      return {
        success: false,
        newBalance: 0,
        error: 'Erro ao processar reembolso'
      };
    }

    const finalBalance = updatedWallet?.credits_balance || updatedWallet?.balance || 0;

    // Registrar transação
    await recordPvPTransaction({
      userId,
      roomId,
      type: 'refund',
      amount: PVP_CREDITS_CONFIG.entryFee,
      timestamp: new Date().toISOString(),
      status: 'completed'
    });

    console.log('✅ [REFUND] Reembolso processado com sucesso:', { newBalance: finalBalance });
    return {
      success: true,
      newBalance: finalBalance
    };
  } catch (error) {
    console.error('❌ Erro ao reembolsar taxa:', error);
    return {
      success: false,
      newBalance: 0,
      error: 'Erro interno do sistema'
    };
  }
};

// 📝 Registrar transação PvP (para auditoria)
export const recordPvPTransaction = async (transaction: PvPCreditsTransaction): Promise<boolean> => {
  try {
    // Criar tabela de transações PvP se não existir
    const { error } = await (supabase as any)
      .from('pvp_transactions')
      .insert({
        user_id: transaction.userId,
        room_id: transaction.roomId,
        transaction_type: transaction.type,
        amount: transaction.amount,
        timestamp: transaction.timestamp,
        status: transaction.status
      });

    if (error) {
      console.error('❌ Erro ao registrar transação PvP:', error);
      return false;
    }

    console.log('✅ [TRANSACTION] Transação PvP registrada:', transaction);
    return true;
  } catch (error) {
    console.error('❌ Erro ao registrar transação PvP:', error);
    return false;
  }
};

// 🎯 Processar resultado completo da batalha PvP
export const processPvPBattleCredits = async (
  roomId: string,
  winnerId: string | null,
  player1Id: string,
  player2Id: string
): Promise<{
  success: boolean;
  results: {
    player1: { success: boolean; newBalance: number; error?: string };
    player2: { success: boolean; newBalance: number; error?: string };
  };
  error?: string;
}> => {
  try {
    console.log('🎯 [BATTLE CREDITS] Processando créditos da batalha:', { roomId, winnerId, player1Id, player2Id });
    
    // 🔍 VERIFICAR SE WINNER_ID É VÁLIDO
    if (winnerId && winnerId !== player1Id && winnerId !== player2Id) {
      console.error('❌ [BATTLE CREDITS] winnerId inválido:', winnerId);
      return {
        success: false,
        results: {
          player1: { success: false, newBalance: 0, error: 'Winner ID inválido' },
          player2: { success: false, newBalance: 0, error: 'Winner ID inválido' }
        },
        error: 'Winner ID não corresponde a nenhum dos jogadores'
      };
    }

    const results = {
      player1: { success: false, newBalance: 0 },
      player2: { success: false, newBalance: 0 }
    };

    if (winnerId === player1Id) {
      // Player1 venceu
      console.log('🏆 [BATTLE CREDITS] Player1 venceu - creditando prêmio...');
      console.log('🏆 [BATTLE CREDITS] Player1 ID:', player1Id, 'Room ID:', roomId);
      const player1Result = await creditWinnerPrize(player1Id, roomId);
      results.player1 = player1Result;
      console.log('✅ [BATTLE CREDITS] Player1 resultado:', player1Result);
      
      // Player2 perdeu (não recebe nada, já pagou a taxa)
      const player2Check = await checkUserCredits(player2Id);
      results.player2 = {
        success: true,
        newBalance: player2Check.currentBalance
      };
      console.log('💔 [BATTLE CREDITS] Player2 perdeu - saldo atual:', player2Check.currentBalance);
    } else if (winnerId === player2Id) {
      // Player2 venceu
      console.log('🏆 [BATTLE CREDITS] Player2 venceu - creditando prêmio...');
      console.log('🏆 [BATTLE CREDITS] Player2 ID:', player2Id, 'Room ID:', roomId);
      const player2Result = await creditWinnerPrize(player2Id, roomId);
      results.player2 = player2Result;
      console.log('✅ [BATTLE CREDITS] Player2 resultado:', player2Result);
      
      // Player1 perdeu (não recebe nada, já pagou a taxa)
      const player1Check = await checkUserCredits(player1Id);
      results.player1 = {
        success: true,
        newBalance: player1Check.currentBalance
      };
      console.log('💔 [BATTLE CREDITS] Player1 perdeu - saldo atual:', player1Check.currentBalance);
    } else {
      // Empate - reembolsar ambos
      console.log('🤝 [BATTLE CREDITS] Empate - reembolsando ambos...');
      const player1Result = await refundEntryFee(player1Id, roomId);
      const player2Result = await refundEntryFee(player2Id, roomId);
      
      results.player1 = player1Result;
      results.player2 = player2Result;
      console.log('🔄 [BATTLE CREDITS] Reembolsos:', { player1: player1Result, player2: player2Result });
    }

    const allSuccessful = results.player1.success && results.player2.success;

    console.log('✅ [BATTLE CREDITS] Processamento concluído:', { allSuccessful, results });
    return {
      success: allSuccessful,
      results,
      error: allSuccessful ? undefined : 'Alguns processamentos falharam'
    };
  } catch (error) {
    console.error('❌ Erro ao processar créditos da batalha:', error);
    return {
      success: false,
      results: {
        player1: { success: false, newBalance: 0, error: 'Erro interno' },
        player2: { success: false, newBalance: 0, error: 'Erro interno' }
      },
      error: 'Erro interno do sistema'
    };
  }
};
