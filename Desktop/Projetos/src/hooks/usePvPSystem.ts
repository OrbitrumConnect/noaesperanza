import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { useDailyPvPCredits } from './useDailyPvPCredits';
import { useAuth } from '@/hooks/useAuth';
import type { PvPQueueEntry, PvPRoom, PvPConfirmation, PvPMove } from '../types/pvp';

// Sistema PvP real usando Supabase
export interface PvPQueueEntry {
  id: string;
  user_id: string;
  plan_type: 'basic' | 'standard' | 'premium';
  bet_amount: number;
  created_at: string;
  expires_at: string;
  display_name?: string;
}

export interface PvPRoom {
  id: string;
  player1_id: string;
  player2_id: string;
  status: 'waiting' | 'confirming' | 'playing' | 'finished';
  questions: any[];
  current_question: number;
  player1_score: number;
  player2_score: number;
  player1_answers: number[];
  player2_answers: number[];
  winner_id?: string;
  plan_type: string;
  bet_amount: number;
  created_at: string;
  started_at?: string;
  finished_at?: string;
}

export interface PvPConfirmation {
  id: string;
  room_id: string;
  user_id: string;
  confirmed: boolean;
  confirmed_at?: string;
  created_at: string;
}

export const usePvPSystem = () => {
  const { user } = useAuth();
  const [queue, setQueue] = useState<PvPQueueEntry[]>([]);
  const [currentRoom, setCurrentRoom] = useState<PvPRoom | null>(null);
  const [confirmations, setConfirmations] = useState<PvPConfirmation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { usePvPCredits, getDailyPvPInfo } = useDailyPvPCredits();

  // 🎯 Entrar na fila de matchmaking (REAL - Supabase)
  const joinQueue = useCallback(async (planType: 'basic' | 'standard' | 'premium' = 'basic', betAmount: number = 7) => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 💰 VALIDAR SALDO E LIMITES (ALINHADO COM FRONTEND)
      const { data: validationResult, error: validationError } = await (supabase as any).rpc('validate_pvp_balance_and_limits', {
        p_user_id: user.id,
        p_bet_amount: betAmount
      });

      if (validationError) {
        throw new Error('Erro ao validar: ' + validationError.message);
      }

      if (!validationResult.canPlay) {
        throw new Error(validationResult.reason + (validationResult.suggestion ? ' - ' + validationResult.suggestion : ''));
      }

      // Remover da fila se já estiver
      await supabase
        .from('pvp_queue')
        .delete()
        .eq('user_id', user.id);

      // Entrar na fila REAL
      const { data, error: insertError } = await supabase
        .from('pvp_queue')
        .insert({
          user_id: user.id,
          plan_type: planType,
          bet_amount: betAmount
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 🎯 VERIFICAR MATCH APENAS QUANDO HÁ USUÁRIOS NA FILA
      // Não executar matchmaking automático - apenas quando necessário
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 🎯 Sair da fila (REAL - Supabase)
  const leaveQueue = useCallback(async () => {
    if (!user) return;

    try {
      // Limpar da fila
      await supabase
        .from('pvp_queue')
        .delete()
        .eq('user_id', user.id);

      // Limpar estado local
      setCurrentRoom(null);
      setConfirmations([]);
      setError(null);
      
      console.log('✅ Usuário saiu da fila e estado limpo');
    } catch (err: any) {
      setError(err.message);
    }
  }, [user]);

  // 🎯 MATCHMAKING AUTOMÁTICO (REAL - Supabase)
  const runMatchmaking = useCallback(async () => {
    try {
      console.log('🔍 Executando matchmaking automático...');
      
      // Executar função de matchmaking do Supabase
      const { data, error } = await supabase.rpc('create_atomic_pvp_room');
      
      if (error) {
        console.error('❌ Erro no matchmaking:', error);
        return;
      }
      
      console.log('✅ Matchmaking executado com sucesso');
    } catch (err: any) {
      console.error('❌ Erro no runMatchmaking:', err);
      setError(err.message);
    }
  }, []);

  // 🎯 Verificar se há match disponível (REAL - Supabase)
  const checkForMatch = useCallback(async () => {
    if (!user) return;

    try {
      console.log('🔍 Verificando match para usuário:', user.id);
      
      // Buscar oponente na fila REAL
      const { data: opponent, error } = await supabase
        .from('pvp_queue')
        .select('*')
        .eq('plan_type', 'basic') // Por enquanto só basic
        .neq('user_id', user.id)
        .order('created_at')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao buscar oponente:', error);
        return;
      }

      console.log('🎯 Oponente encontrado:', opponent);

      if (opponent) {
        console.log('⚔️ Criando sala de batalha...');
        // Criar sala de batalha
        await createBattleRoom(opponent);
      } else {
        console.log('⏳ Nenhum oponente encontrado, aguardando...');
      }
    } catch (err: any) {
      console.error('❌ Erro no checkForMatch:', err);
      setError(err.message);
    }
  }, [user]);

  // 🎯 Criar sala de batalha (REAL - Supabase)
  const createBattleRoom = useCallback(async (opponent: PvPQueueEntry) => {
    if (!user) return;

    try {
      console.log('🏗️ Criando sala de batalha...');
      console.log('👤 Player 1:', user.id);
      console.log('👤 Player 2:', opponent.user_id);
      
      // Gerar perguntas aleatórias
      const questions = await generateRandomQuestions();
      console.log('📝 Perguntas geradas:', questions.length);

      // Criar sala REAL no Supabase
      const { data: room, error: roomError } = await supabase
        .from('pvp_rooms')
        .insert({
          player1_id: user.id,
          player2_id: opponent.user_id,
          status: 'confirming',
          questions: questions,
          plan_type: opponent.plan_type,
          bet_amount: opponent.bet_amount
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Remover ambos da fila REAL
      await supabase
        .from('pvp_queue')
        .delete()
        .in('user_id', [user.id, opponent.user_id]);

      // Criar confirmações REAIS
      await supabase
        .from('pvp_confirmations')
        .insert([
          { room_id: room.id, user_id: user.id },
          { room_id: room.id, user_id: opponent.user_id }
        ]);

      setCurrentRoom(room);
      
      // 🎯 REDIRECIONAR IMEDIATAMENTE PARA A BATALHA
      console.log('🎮 Sala criada! Redirecionando para batalha:', room.id);
      window.location.href = `/arena/battle/${room.id}`;
      
    } catch (err: any) {
      setError(err.message);
    }
  }, [user]);

  // 🎯 Confirmar batalha (REAL - Supabase)
  const confirmBattle = useCallback(async (roomId: string) => {
    if (!user) return;

    try {
      // Atualizar confirmação REAL
      await supabase
        .from('pvp_confirmations')
        .update({ 
          confirmed: true, 
          confirmed_at: new Date().toISOString() 
        })
        .eq('room_id', roomId)
        .eq('user_id', user.id);

      // Verificar se ambos confirmaram
      const { data: allConfirmations } = await supabase
        .from('pvp_confirmations')
        .select('*')
        .eq('room_id', roomId);

      if (allConfirmations && allConfirmations.length === 2 && allConfirmations.every(c => c.confirmed)) {
        // Iniciar batalha REAL
        await supabase
          .from('pvp_rooms')
          .update({ 
            status: 'playing',
            started_at: new Date().toISOString()
          })
          .eq('id', roomId);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [user]);

  // 🎯 Responder pergunta
  const answerQuestion = useCallback(async (roomId: string, questionNumber: number, answer: number) => {
    if (!user || !currentRoom) return;

    try {
      // Verificar se a resposta está correta
      const question = currentRoom.questions[questionNumber];
      const isCorrect = answer === question.correct_answer;

      // Salvar resposta
      await supabase
        .from('pvp_moves')
        .insert({
          room_id: roomId,
          user_id: user.id,
          question_number: questionNumber,
          answer: answer,
          is_correct: isCorrect,
          response_time_ms: 0 // TODO: calcular tempo real
        });

      // Atualizar pontuação
      const isPlayer1 = user.id === currentRoom.player1_id;
      const newScore = isPlayer1 ? currentRoom.player1_score + (isCorrect ? 1 : 0) : currentRoom.player2_score + (isCorrect ? 1 : 0);

      await supabase
        .from('pvp_rooms')
        .update({
          player1_score: isPlayer1 ? newScore : currentRoom.player1_score,
          player2_score: isPlayer1 ? currentRoom.player2_score : newScore,
          current_question: questionNumber + 1
        })
        .eq('id', roomId);

    } catch (err: any) {
      setError(err.message);
    }
  }, [user, currentRoom]);

  // 🎯 Gerar perguntas aleatórias
  const generateRandomQuestions = async () => {
    try {
      const { data: questions } = await supabase
        .from('knowledge_items')
        .select('*')
        .eq('item_type', 'qa')
        .eq('is_verified', true)
        .limit(50);

      if (!questions) return [];

      // Misturar e pegar 30 aleatórias
      const shuffled = questions.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 30);
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  };

  // 🎯 Processar resultado da batalha (REAL - Supabase)
  const processBattleResult = useCallback(async (roomId: string, winnerId: string, loserId: string, betAmount: number) => {
    try {
      console.log('🏆 Processando resultado da batalha:', { roomId, winnerId, loserId, betAmount });
      
      // Executar função de processamento do Supabase
      const { error } = await supabase.rpc('process_pvp_battle_result', {
        p_room_id: roomId,
        p_winner_id: winnerId,
        p_loser_id: loserId,
        p_bet_amount: betAmount
      });
      
      if (error) {
        console.error('❌ Erro ao processar resultado:', error);
        setError(error.message);
        return;
      }
      
      console.log('✅ Resultado processado com sucesso');
    } catch (err: any) {
      console.error('❌ Erro no processBattleResult:', err);
      setError(err.message);
    }
  }, []);

  // 🎯 Determinar vencedor automaticamente (REAL - Supabase)
  const determineWinner = useCallback(async (roomId: string) => {
    try {
      console.log('🏆 Determinando vencedor automaticamente para sala:', roomId);
      
      // Executar função de determinação automática do Supabase
      const { data: winnerId, error } = await supabase.rpc('determine_pvp_winner', {
        p_room_id: roomId
      });
      
      if (error) {
        console.error('❌ Erro ao determinar vencedor:', error);
        setError(error.message);
        return null;
      }
      
      console.log('✅ Vencedor determinado:', winnerId);
      return winnerId;
    } catch (err: any) {
      console.error('❌ Erro no determineWinner:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // 🧹 Limpar estado completo após batalha
  const clearBattleState = useCallback(async () => {
    if (!user) return;

    try {
      // Limpar da fila
      await supabase
        .from('pvp_queue')
        .delete()
        .eq('user_id', user.id);

      // Limpar estado local completamente
      setCurrentRoom(null);
      setConfirmations([]);
      setError(null);
      
      // Recarregar fila
      await fetchQueue();
      
      console.log('🧹 Estado de batalha limpo completamente');
    } catch (err: any) {
      console.error('❌ Erro ao limpar estado:', err);
      setError(err.message);
    }
  }, [user, fetchQueue]);

  // 🎧 Escutar mudanças em tempo real
  useEffect(() => {
    if (!user) return;

    // Escutar mudanças na fila
    const queueChannel = supabase
      .channel('pvp-queue')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pvp_queue'
      }, (payload) => {
        // Atualizar fila
        fetchQueue();
      })
      .subscribe();

    // Escutar mudanças nas salas
    const roomsChannel = supabase
      .channel('pvp-rooms')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pvp_rooms'
      }, (payload) => {
        if (payload.new && (payload.new.player1_id === user.id || payload.new.player2_id === user.id)) {
          const room = payload.new as PvPRoom;
          setCurrentRoom(room);
          
          // 🎯 REDIRECIONAR AUTOMATICAMENTE QUANDO SALA FOR CRIADA
          if (payload.eventType === 'INSERT' && room.status === 'confirming') {
            console.log('🎮 Sala criada via realtime! Redirecionando:', room.id);
            // Redirecionar imediatamente
            window.location.href = `/arena/battle/${room.id}`;
          }
          
          // 🧹 LIMPAR AUTOMATICAMENTE QUANDO BATALHA TERMINAR
          if (room.status === 'finished') {
            console.log('🏁 Batalha terminou! Limpando estado automaticamente...');
            setTimeout(() => {
              clearBattleState();
            }, 3000); // Aguardar 3 segundos para mostrar resultado
          }
        }
      })
      .subscribe();

    // Escutar confirmações
    const confirmationsChannel = supabase
      .channel('pvp-confirmations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pvp_confirmations'
      }, (payload) => {
        if (payload.new && payload.new.user_id === user.id) {
          fetchConfirmations();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
      supabase.removeChannel(roomsChannel);
      supabase.removeChannel(confirmationsChannel);
    };
  }, [user]);

  // 🎯 Buscar fila atual (REAL - Supabase)
  const fetchQueue = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('pvp_queue')
        .select('*')
        .order('created_at');

      // Buscar nomes dos usuários separadamente
      const queueWithNames = await Promise.all((data || []).map(async (entry) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', entry.user_id)
          .single();
        
        return {
          ...entry,
          display_name: profile?.display_name || 'Guerreiro'
        };
      }));

      setQueue(queueWithNames);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // 🎯 Buscar confirmações (REAL - Supabase)
  const fetchConfirmations = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('pvp_confirmations')
        .select('*')
        .eq('user_id', user.id);

      setConfirmations(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  }, [user]);

  // 🎯 Buscar sala atual (REAL - Supabase)
  const fetchCurrentRoom = useCallback(async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('pvp_rooms')
        .select('*')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .in('status', ['confirming', 'playing'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      setCurrentRoom(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [user]);

  // 🎯 Inicializar
  useEffect(() => {
    if (user) {
      fetchQueue();
      fetchCurrentRoom();
      fetchConfirmations();
      
      // 🧹 LIMPEZA AUTOMÁTICA AO CARREGAR
      // Se há sala ativa, verificar se ainda é válida
      const checkAndCleanup = async () => {
        if (currentRoom) {
          const { data: roomCheck } = await supabase
            .from('pvp_rooms')
            .select('*')
            .eq('id', currentRoom.id)
            .single();
          
          // Se sala não existe mais ou está finished, limpar estado
          if (!roomCheck || roomCheck.status === 'finished') {
            console.log('🧹 Sala inválida encontrada! Limpando estado...');
            await clearBattleState();
          }
        }
      };
      
      checkAndCleanup();
      
      // Executar matchmaking a cada 5 segundos se há usuários na fila
      const matchmakingInterval = setInterval(() => {
        if (queue.length >= 2) {
          console.log('🔄 Executando matchmaking automático...');
          runMatchmaking();
        }
      }, 5000);
      
      return () => clearInterval(matchmakingInterval);
    }
  }, [user, fetchQueue, fetchCurrentRoom, fetchConfirmations, queue.length, runMatchmaking, currentRoom, clearBattleState]);

  return {
    // Estado
    queue,
    currentRoom,
    confirmations,
    loading,
    error,

    // Ações
    joinQueue,
    leaveQueue,
    confirmBattle,
    answerQuestion,
    fetchQueue,
    fetchCurrentRoom,
    fetchConfirmations,
    runMatchmaking,
    processBattleResult,
    determineWinner,
    clearBattleState
  };
};
