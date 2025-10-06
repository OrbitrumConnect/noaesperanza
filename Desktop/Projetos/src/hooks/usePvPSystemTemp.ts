import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { useDailyPvPCredits } from './useDailyPvPCredits';
import { useAuth } from '@/hooks/useAuth';
import type { PvPQueueEntry, PvPRoom, PvPConfirmation } from '../types/pvp';
import { 
  checkUserCredits, 
  deductEntryFee, 
  refundEntryFee,
  processPvPBattleCredits,
  PVP_CREDITS_CONFIG 
} from '../utils/pvpCreditsSystem';

export const usePvPSystem = () => {
  const { user, loading: authLoading } = useAuth();
  const { creditsRemaining, getDailyPvPInfo } = useDailyPvPCredits();
  
  const [allQueue, setAllQueue] = useState<PvPQueueEntry[]>([]); // TODOS os jogadores na fila
  const [others, setOthers] = useState<PvPQueueEntry[]>([]); // Apenas outros jogadores
  const [currentRoom, setCurrentRoom] = useState<PvPRoom | null>(null);
  const [confirmations, setConfirmations] = useState<PvPConfirmation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isListenerActive, setIsListenerActive] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  
  // Controle de canais para evitar duplicação
  const [activeChannels, setActiveChannels] = useState<Set<string>>(new Set());
  
  // Função para gerenciar canais Supabase
  const manageChannel = useCallback((channelName: string, callback: () => void) => {
    if (activeChannels.has(channelName)) {
      console.log(`⚠️ Canal ${channelName} já está ativo, pulando...`);
      return;
    }
    
    setActiveChannels(prev => new Set(prev).add(channelName));
    callback();
    
    // Cleanup function
    return () => {
      setActiveChannels(prev => {
        const newSet = new Set(prev);
        newSet.delete(channelName);
        return newSet;
      });
    };
  }, [activeChannels]);

  // Função consolidada para atualizar estado da fila
  const updateQueueState = useCallback((queueData: PvPQueueEntry[]) => {
    const allQueueData = queueData || [];
    const othersData = allQueueData.filter(p => p.user_id !== user?.id);
    
    setAllQueue(allQueueData);
    setOthers(othersData);
    
    // Log apenas quando há mudanças significativas (sem dependências de estado)
    console.log('🔄 [QUEUE UPDATE] Fila atualizada:', {
      total: allQueueData.length,
      others: othersData.length,
      myId: user?.id,
      otherIds: othersData.map(p => p.user_id)
    });
  }, [user?.id]);


  // Função para limpar estado da batalha
  const clearBattleState = useCallback(async () => {
    if (!user) return;
    
    try {
      // 🧹 REMOVER DA FILA SE ESTIVER
      await (supabase as any)
        .from('pvp_queue')
        .delete()
        .eq('user_id', user.id);
      
      // 🧹 FINALIZAR SALA ATUAL SE EXISTIR
      if (currentRoom) {
        console.log('🧹 [CLEAR BATTLE] Finalizando sala atual:', currentRoom.id);
        await (supabase as any)
          .from('pvp_rooms')
          .update({ 
            status: 'finished',
            finished_at: new Date().toISOString()
          })
          .eq('id', currentRoom.id)
          .in('status', ['waiting', 'playing']); // Só finalizar se não estiver já finished
      }
      
      // 🧹 LIMPAR ESTADO LOCAL
      setCurrentRoom(null);
      setConfirmations([]);
      setError(null);
      
      // 🧹 LIMPAR SALAS ANTIGAS (mais de 1 hora) - apenas se necessário
      try {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        await (supabase as any)
          .from('pvp_rooms')
          .delete()
          .in('status', ['finished', 'cancelled'])
          .lt('created_at', oneHourAgo);
      } catch (cleanupError) {
        console.log('⚠️ Erro ao limpar salas antigas (não crítico):', cleanupError);
      }
    } catch (err) {
      console.error('Erro ao limpar estado:', err);
    }
  }, [user, currentRoom]);

  // 🧹 Função para limpar estado completamente (nova sala)
  const clearAllState = useCallback(() => {
    console.log('🧹 [CLEAR ALL] Limpando todo o estado...');
    setCurrentRoom(null);
    setConfirmations([]);
    setError(null);
    setAllQueue([]);
    setOthers([]);
    console.log('✅ [CLEAR ALL] Estado completamente limpo');
  }, []);

  // 🔄 Função para regenerar perguntas de uma sala
  const regenerateRoomQuestions = useCallback(async (roomId: string) => {
    console.log('🔄 [REGENERATE] Regenerando perguntas da sala:', roomId);
    
    try {
      // Buscar perguntas do banco
      const { data: questionsData, error: questionsError } = await (supabase as any)
        .from('knowledge_items')
        .select('*, eras(*)')
        .limit(50);
      
      if (questionsError) {
        console.error('❌ [REGENERATE] Erro ao buscar perguntas:', questionsError);
        return false;
      }
      
      if (!questionsData || questionsData.length === 0) {
        console.error('❌ [REGENERATE] Nenhuma pergunta encontrada');
        return false;
      }
      
      // Processar perguntas
      const allQuestions = questionsData.map((item: any) => {
        const wrongOptions = Array.isArray(item.wrong_options) ? item.wrong_options : [];
        const correctAnswer = item.correct_answer;
        const options = [correctAnswer, ...wrongOptions].slice(0, 4);
        
        while (options.length < 4) {
          options.push(`Opção ${String.fromCharCode(65 + options.length)}`);
        }
        
        // 🎯 EMBARALHAR OPÇÕES CORRETAMENTE - IGUAL AO SISTEMA DAS ERAS
        const shuffledOptions = [...options];
        console.log('🎲 [SHUFFLE DEBUG] Opções originais:', options);
        console.log('🎲 [SHUFFLE DEBUG] Resposta correta original:', correctAnswer);
        
        // 🚀 MÚLTIPLAS PASSADAS DE SHUFFLE PARA GARANTIR RANDOMIZAÇÃO TOTAL (IGUAL ERAS)
        for (let pass = 0; pass < 5; pass++) { // 5 PASSADAS COMO NAS ERAS!
          for (let i = shuffledOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
          }
        }
        
        console.log('🎲 [SHUFFLE DEBUG] Opções embaralhadas (5 passadas):', shuffledOptions);
        
        // Encontrar o novo índice da resposta correta após embaralhamento
        const correctIndex = shuffledOptions.findIndex(option => option === correctAnswer);
        console.log('🎲 [SHUFFLE DEBUG] Novo índice da resposta correta:', correctIndex);
        
        // 🚨 VERIFICAR SE O EMBARALHAMENTO FUNCIONOU
        if (correctIndex === -1) {
          console.log('❌ [SHUFFLE ERROR] Resposta correta não encontrada nas opções!');
          console.log('❌ [SHUFFLE ERROR] correctAnswer:', correctAnswer);
          console.log('❌ [SHUFFLE ERROR] shuffledOptions:', shuffledOptions);
        } else if (correctIndex === 0) {
          console.log('⚠️ [SHUFFLE WARNING] Resposta ainda está na primeira posição!');
          console.log('⚠️ [SHUFFLE WARNING] Tentando embaralhar novamente...');
          
          // 🚨 TENTAR EMBARALHAR NOVAMENTE SE AINDA ESTÁ NA POSIÇÃO 0
          for (let pass = 0; pass < 3; pass++) {
            for (let i = shuffledOptions.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
            }
          }
          
          const newCorrectIndex = shuffledOptions.findIndex(option => option === correctAnswer);
          console.log('🎲 [SHUFFLE RETRY] Novo índice após re-embaralhamento:', newCorrectIndex);
        } else {
          console.log('✅ [SHUFFLE SUCCESS] Resposta foi movida para posição:', correctIndex);
        }
        
        // 🎯 USAR O ÍNDICE CORRETO APÓS EMBARALHAMENTO
        const finalCorrectIndex = shuffledOptions.findIndex(option => option === correctAnswer);
        
        return {
          id: item.id,
          question: item.question,
          options: shuffledOptions,
          correct_answer: finalCorrectIndex, // 🎯 CORREÇÃO: Usar o índice correto após embaralhamento
          era: item.eras?.name || 'Geral'
        };
      });
      
      // Selecionar 25 perguntas
      const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
      const selectedQuestions = shuffledQuestions.slice(0, 25);
      
      // Atualizar sala no banco
      const { error: updateError } = await (supabase as any)
        .from('pvp_rooms')
        .update({ questions: selectedQuestions })
        .eq('id', roomId);
      
      if (updateError) {
        console.error('❌ [REGENERATE] Erro ao atualizar sala:', updateError);
        return false;
      }
      
      console.log('✅ [REGENERATE] Perguntas regeneradas com sucesso!');
      return true;
      
    } catch (error) {
      console.error('❌ [REGENERATE] Erro geral:', error);
      return false;
    }
  }, []);

  // 🚀 Função para forçar redirecionamento ao lobby
  const forceRedirectToLobby = useCallback(() => {
    console.log('🚀 [FORCE REDIRECT] Forçando redirecionamento ao lobby...');
    clearAllState();
    // Redirecionar para o lobby
    window.location.href = '/arena';
  }, [clearAllState]);

  // 🔄 Função para regenerar perguntas de uma sala existente

  // Função para limpar duplicatas da fila
  const cleanupDuplicateQueueEntries = useCallback(async () => {
    if (!user) return;
    
    try {
      // Buscar todas as entradas do usuário atual
      const { data: userEntries, error } = await (supabase as any)
        .from('pvp_queue')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Se há mais de uma entrada, manter apenas a mais recente
      if (userEntries && userEntries.length > 1) {
        const entriesToDelete = userEntries.slice(0, -1); // Todas exceto a última
        const idsToDelete = entriesToDelete.map(entry => entry.id);
        
        console.log('🧹 [CLEANUP] Removendo entradas duplicadas:', idsToDelete);
        
        await (supabase as any)
          .from('pvp_queue')
          .delete()
          .in('id', idsToDelete);
      }
    } catch (err) {
      console.error('Erro ao limpar duplicatas da fila:', err);
    }
  }, [user]);

  // Função para buscar fila (fonte da verdade única) com debounce
  const fetchQueue = useCallback(async () => {
    if (!user) {
      updateQueueState([]);
      setLoading(false);
      return;
    }
    
    // 🛡️ DEBOUNCE: Evitar múltiplas chamadas simultâneas
    if (loading) {
      console.log('⚠️ [FETCH QUEUE] Já está carregando, ignorando chamada duplicada');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔍 [FETCH QUEUE] Buscando fila para usuário:', user.id);
      
      const { data, error } = await (supabase as any)
        .from('pvp_queue')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ [FETCH QUEUE] Erro ao buscar fila:', error);
        setError(error.message);
        updateQueueState([]);
        return;
      }
      
      console.log('✅ [FETCH QUEUE] Fila carregada:', data?.length || 0, 'jogadores');
      
      // Usar função consolidada para atualizar estado
      updateQueueState(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ [FETCH QUEUE] Erro ao buscar fila:', err);
      setError('Erro ao carregar fila');
      updateQueueState([]);
    } finally {
      setLoading(false);
    }
  }, [user, loading]);

  // Função para entrar na fila (com Optimistic UI + Character ID)
  const joinQueue = useCallback(async (planType: string = 'basic', betAmount: number = 7, characterId: number = 1) => {
    if (!user) return;
    
      // 🛡️ PREVENIR MÚLTIPLAS CHAMADAS SIMULTÂNEAS
      if (loading) {
        console.log('⚠️ [JOIN QUEUE] Já está processando, ignorando chamada duplicada');
        return;
      }
      
      // 🛡️ TIMEOUT DE SEGURANÇA
      const timeoutId = setTimeout(() => {
        if (loading) {
          console.log('⏰ [JOIN QUEUE] Timeout - forçando setLoading(false)');
          setLoading(false);
        }
      }, 15000); // 15 segundos
      
      // 🛡️ VERIFICAR SE JÁ ESTÁ NA FILA
      const alreadyInQueue = allQueue.some(p => p.user_id === user.id);
      if (alreadyInQueue) {
        console.log('⚠️ [JOIN QUEUE] Usuário já está na fila, ignorando');
        return;
      }
    
    try {
      setLoading(true);
      setError(null);
      
      // Validar saldo e limites (versão simplificada)
      console.log('🔍 [JOIN QUEUE] Validando entrada na fila...');
      
      // 💰 VERIFICAR E DEDUZIR CRÉDITOS IMEDIATAMENTE
      console.log('💰 [JOIN QUEUE] Verificando e deduzindo créditos...');
      const creditCheck = await checkUserCredits(user.id);
      
      if (!creditCheck.canPlay) {
        setError(creditCheck.error || 'Saldo insuficiente para entrar no PvP');
        setLoading(false);
        return;
      }
      
      // 💰 VERIFICAR CRÉDITOS (SEM DEDUZIR AINDA)
      console.log('💰 [JOIN QUEUE] Verificando créditos disponíveis...');
      const queueCreditCheck = await checkUserCredits(user.id);
      
      if (!queueCreditCheck.canPlay) {
        setError(queueCreditCheck.error || 'Créditos insuficientes para entrar na fila');
        setLoading(false);
        return;
      }
      
      console.log('✅ [JOIN QUEUE] Créditos verificados:', {
        currentBalance: queueCreditCheck.currentBalance,
        requiredAmount: queueCreditCheck.requiredAmount
      });
      
      // OPTIMISTIC UI: Adicionar temporariamente à fila local
      const tempId = `temp-${Date.now()}`;
      const tempEntry: PvPQueueEntry = {
        id: tempId,
        user_id: user.id,
        plan_type: planType as 'basic' | 'standard' | 'premium',
        bet_amount: betAmount,
        selected_character_id: characterId,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      };
      
      // Atualizar estados localmente (resposta imediata)
      setAllQueue(prev => [...prev.filter(p => p.user_id !== user.id), tempEntry]);
      setOthers(prev => prev.filter(p => p.user_id !== user.id));
      
      // Remover da fila se já estiver (server-side)
      console.log('🗑️ [JOIN QUEUE] Removendo entradas antigas...');
      const { error: deleteError } = await (supabase as any)
        .from('pvp_queue')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.log('⚠️ [JOIN QUEUE] Erro ao remover entradas antigas:', deleteError);
      }
      
      // Adicionar à fila (server-side) com character_id
      console.log('📤 [JOIN QUEUE] Enviando dados para o servidor...');
      
      const insertData = {
          user_id: user.id,
          plan_type: planType,
          bet_amount: betAmount,
          selected_character_id: characterId,
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
      };
      
      console.log('📤 [JOIN QUEUE] Dados a serem inseridos:', insertData);
      
      const { data, error: insertError } = await (supabase as any)
        .from('pvp_queue')
        .insert(insertData)
        .select()
        .single();
      
      if (insertError) {
        console.error('❌ [JOIN QUEUE] Erro ao entrar na fila:', insertError);
        setError(`Erro ao entrar na fila: ${insertError.message}`);
        // Remover entrada temporária em caso de erro
        setAllQueue(prev => prev.filter(p => p.id !== tempId));
        return;
      }
      
      console.log('✅ [JOIN QUEUE] Usuário adicionado à fila com sucesso:', data);
      
      // Substituir entrada temporária pela real
      setAllQueue(prev => prev.map(p => p.id === tempId ? data : p));
      
    } catch (err) {
      console.error('❌ [JOIN QUEUE] Erro geral:', err);
      setError(`Erro ao entrar na fila: ${err.message || 'Erro desconhecido'}`);
      // Remover entrada temporária em caso de erro
      setAllQueue(prev => prev.filter(p => !p.id.toString().startsWith('temp-')));
    } finally {
      console.log('🏁 [JOIN QUEUE] Finalizando processo...');
      clearTimeout(timeoutId);
      setLoading(false);
    }
  }, [user, allQueue, loading]);

  // Função para sair da fila (com Optimistic UI)
  const leaveQueue = useCallback(async () => {
    if (!user) return;
    
    try {
      // Optimistic: remover localmente primeiro
      setAllQueue(prev => prev.filter(p => p.user_id !== user.id));
      setOthers(prev => prev.filter(p => p.user_id !== user.id));
      
      const { error } = await (supabase as any)
        .from('pvp_queue')
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro ao sair da fila:', error);
        // Rollback: recarregar fila em caso de erro
        await fetchQueue();
        return { error };
      }
      
      // 💰 REEMBOLSAR CRÉDITOS AO SAIR DA FILA
      console.log('💰 [LEAVE QUEUE] Reembolsando créditos...');
      const refundResult = await refundEntryFee(user.id, `queue-${Date.now()}`);
      
      if (refundResult.success) {
        console.log('✅ [LEAVE QUEUE] Créditos reembolsados:', refundResult.newBalance);
        
        // 🔄 FORÇAR REFRESH DO DASHBOARD
        window.dispatchEvent(new CustomEvent('pvp-transaction', { 
          detail: { type: 'refund', amount: 7, newBalance: refundResult.newBalance } 
        }));
      } else {
        console.error('❌ [LEAVE QUEUE] Erro ao reembolsar créditos:', refundResult.error);
      }
      
      console.log('✅ Usuário removido da fila');
      return { success: true };
    } catch (err) {
      console.error('Erro ao sair da fila:', err);
      // Rollback: recarregar fila em caso de erro
      await fetchQueue();
      return { error: err };
    }
  }, [user, fetchQueue]);

  // Função para confirmar batalha (MELHORADA COM LOGS DETALHADOS)
  const confirmBattle = useCallback(async (roomId: string) => {
    if (!user) return;
    
    // 🛡️ PREVENIR MÚLTIPLAS CHAMADAS SIMULTÂNEAS
    if (loading || isConfirming) {
      console.log('⚠️ [CONFIRM BATTLE] Já está processando, ignorando chamada duplicada');
      return;
    }
    
    try {
      setLoading(true);
      setIsConfirming(true);
      console.log('🎯 [CONFIRM BATTLE] Iniciando confirmação para sala:', roomId);
      console.log('👤 [CONFIRM BATTLE] Usuário:', user.id);
      
      // 💰 VERIFICAR CRÉDITOS ANTES DE CONFIRMAR
      console.log('💰 [CONFIRM BATTLE] Verificando créditos do usuário...');
      const creditCheck = await checkUserCredits(user.id);
      
      console.log('💰 [CONFIRM BATTLE] Resultado da verificação de créditos:', creditCheck);
      
      if (!creditCheck.canPlay) {
        console.error('❌ [CONFIRM BATTLE] Créditos insuficientes:', creditCheck.error);
        setError(creditCheck.error || 'Créditos insuficientes para entrar na partida');
        setLoading(false);
        setIsConfirming(false);
        return;
      }
      
      console.log('✅ [CONFIRM BATTLE] Créditos verificados:', {
        currentBalance: creditCheck.currentBalance,
        requiredAmount: creditCheck.requiredAmount
      });
      
      // 💸 DEDUZIR TAXA DE ENTRADA AGORA (QUANDO ENCONTRA OPONENTE)
      console.log('💸 [CONFIRM BATTLE] Deduzindo taxa de entrada...');
      const deductionResult = await deductEntryFee(user.id, `battle-${roomId}`);
      
      if (!deductionResult.success) {
        console.error('❌ [CONFIRM BATTLE] Erro ao deduzir taxa:', deductionResult.error);
        setError(deductionResult.error || 'Erro ao processar pagamento');
        setLoading(false);
        setIsConfirming(false);
        return;
      }
      
      console.log('✅ [CONFIRM BATTLE] Taxa de entrada deduzida:', deductionResult.newBalance);
      
      // 🔄 FORÇAR REFRESH DO DASHBOARD
      window.dispatchEvent(new CustomEvent('pvp-transaction', { 
        detail: { type: 'entry_fee', amount: -7, newBalance: deductionResult.newBalance } 
      }));
      
      const { data: roomData, error } = await (supabase as any)
        .from('pvp_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (error || !roomData) {
        console.error('❌ [CONFIRM BATTLE] Erro ao buscar sala:', error);
        return;
      }
      
      console.log('📋 [CONFIRM BATTLE] Sala encontrada:', {
        id: roomData.id,
        status: roomData.status,
        player1: roomData.player1_id,
        player2: roomData.player2_id,
        questions: roomData.questions?.length || 0
      });
      
      // Verificar se já existe confirmação
      const { data: existingConfirmation } = await (supabase as any)
        .from('pvp_confirmations')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', user.id)
        .single();
      
      if (existingConfirmation) {
        console.log('✅ [CONFIRM BATTLE] Confirmação já existe para este usuário');
        console.log('📝 [CONFIRM BATTLE] Confirmação existente:', existingConfirmation);
        
        // Se já confirmou, verificar se ambos confirmaram e redirecionar
        const { data: allConfirmations } = await (supabase as any)
          .from('pvp_confirmations')
          .select('*')
          .eq('room_id', roomId);
        
        const confirmedCount = allConfirmations?.filter((c: any) => c.confirmed).length || 0;
        
        if (confirmedCount >= 2) {
          console.log('🚀 [CONFIRM BATTLE] Ambos já confirmaram! Redirecionando imediatamente...');
          setTimeout(() => {
            window.location.href = `/arena/battle/${roomId}`;
          }, 1000);
        } else {
          console.log('⏳ [CONFIRM BATTLE] Aguardando confirmação do oponente...');
        }
        return;
      }
      
      // Criar confirmação
      const { error: confirmError } = await (supabase as any)
        .from('pvp_confirmations')
        .insert({
          room_id: roomId,
          user_id: user.id,
          confirmed: true,
          confirmed_at: new Date().toISOString()
        });
      
      if (confirmError) {
        console.error('❌ [CONFIRM BATTLE] Erro ao confirmar batalha:', confirmError);
        return;
      }
      
      console.log('✅ [CONFIRM BATTLE] Confirmação criada para usuário:', user.id);
      
      // Verificar se ambos confirmaram
      const { data: confirmationsData } = await (supabase as any)
        .from('pvp_confirmations')
        .select('*')
        .eq('room_id', roomId);
      
      console.log('📊 [CONFIRM BATTLE] Confirmações encontradas:', confirmationsData);
      
      const confirmedCount = confirmationsData?.filter((c: any) => c.confirmed).length || 0;
      
      console.log('🔢 [CONFIRM BATTLE] Confirmações confirmadas:', confirmedCount);
      console.log('👥 [CONFIRM BATTLE] IDs que confirmaram:', confirmationsData?.map((c: any) => c.user_id));
      
      if (confirmedCount >= 2) {
        console.log('🚀 [CONFIRM BATTLE] Ambos confirmaram! Iniciando batalha IMEDIATAMENTE...');
        
        // ✅ CRÉDITOS JÁ FORAM DEDUZIDOS NA ENTRADA DA FILA
        console.log('✅ [CONFIRM BATTLE] Créditos já foram deduzidos na entrada da fila');
        
        console.log('✅ [CONFIRM BATTLE] Iniciando batalha - créditos já processados');
        
        // INICIAR BATALHA IMEDIATAMENTE - SEM DELAY
        console.log('🎮 [CONFIRM BATTLE] Iniciando batalha IMEDIATAMENTE...');
        setCountdown(null);
        
        // Ambos confirmaram, iniciar batalha (SEM started_at ainda)
        const { error: updateError } = await (supabase as any)
          .from('pvp_rooms')
          .update({ 
            status: 'playing',
            current_question: 1, // Começar na pergunta 1 (não 0)
            player1_score: 0,
            player2_score: 0
            // NÃO definir started_at aqui - será definido quando ambos estiverem na tela
          })
          .eq('id', roomId);
        
        if (updateError) {
          console.error('❌ [CONFIRM BATTLE] Erro ao atualizar status da sala:', updateError);
          return;
        }
        
        console.log('✅ [CONFIRM BATTLE] Sala atualizada para status: playing');
        
        // Atualizar sala local
        const updatedRoom = { 
          ...roomData, 
          status: 'playing',
          current_question: 1, // Começar na pergunta 1 (não 0)
          player1_score: 0,
          player2_score: 0
          // NÃO definir started_at aqui - será definido quando ambos estiverem na tela
        };
        setCurrentRoom(updatedRoom);
        
        console.log('🎮 [CONFIRM BATTLE] Batalha iniciada! Redirecionando...');
        
        // 🚀 NOTIFICAR AMBOS OS PLAYERS PARA REDIRECIONAR
        console.log('📢 [BROADCAST] Enviando notificação para ambos os players...');
        
        // Notificar Player 1
        const player1Channel = (supabase as any).channel(`player_${roomData.player1_id}`);
        player1Channel.subscribe((status: any) => {
          if (status === 'SUBSCRIBED') {
            player1Channel.send({
              type: 'broadcast',
              event: 'redirect_to_battle',
              payload: {
                room_id: roomData.id,
                message: 'Redirecionando para batalha...'
              }
            });
          }
        });
        
        // Notificar Player 2
        const player2Channel = (supabase as any).channel(`player_${roomData.player2_id}`);
        player2Channel.subscribe((status: any) => {
          if (status === 'SUBSCRIBED') {
            player2Channel.send({
              type: 'broadcast',
              event: 'redirect_to_battle',
              payload: {
                room_id: roomData.id,
                message: 'Redirecionando para batalha...'
              }
            });
          }
        });
        
        // Redirecionar IMEDIATAMENTE - SEM DELAY
        console.log('🚀 [CONFIRM BATTLE] Redirecionando para batalha...');
        window.location.href = `/arena/battle/${roomId}`;
      } else {
        console.log('⏳ [CONFIRM BATTLE] Aguardando confirmação do oponente...');
      }
      
      // Recarregar confirmações
      setConfirmations(confirmationsData || []);
    } catch (err) {
      console.error('❌ [CONFIRM BATTLE] Erro ao confirmar batalha:', err);
    } finally {
      setLoading(false);
      setIsConfirming(false);
    }
  }, [user, loading, isConfirming]);

  // Função para executar matchmaking IDEMPOTENTE e GLOBAL
  const runMatchmaking = useCallback(async () => {
    if (!user) return;
    
    // 🛡️ DEBOUNCE: Prevenir múltiplas execuções simultâneas
    if (loading) {
      console.log('⚠️ [MATCHMAKING] Já está processando, ignorando chamada duplicada');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Executando matchmaking IDEMPOTENTE...');
      console.log('👤 Usuário atual:', user.id);
      console.log('🎯 [MATCHMAKING] Iniciando processo de matchmaking...');
      console.log('⏰ [MATCHMAKING] Timestamp:', new Date().toISOString());
      console.log('🔄 [MATCHMAKING] Thread ID:', Math.random().toString(36).substr(2, 9));
      
      // 1. Verificar se usuário já está em alguma sala (AGUARDANDO ou JOGANDO)
      const { data: existingRooms } = await (supabase as any)
        .from('pvp_rooms')
        .select('*')
        .or(`player1_id.eq.${user.id},player2_id.eq.${user.id}`)
        .in('status', ['waiting', 'playing']);
      
      if (existingRooms && existingRooms.length > 0) {
        const existingRoom = existingRooms[0];
        
        // Verificar se a sala não está muito antiga (mais de 1 hora)
        const roomAge = new Date().getTime() - new Date(existingRoom.created_at).getTime();
        const maxAge = 60 * 60 * 1000; // 1 hora em millisegundos
        
        if (roomAge > maxAge) {
          console.log('⏰ Sala existente muito antiga, removendo...');
          
          // Adicionar usuário de volta à fila antes de remover a sala
          try {
            const { error: queueError } = await (supabase as any)
              .from('pvp_queue')
              .insert({
                user_id: user.id,
                plan_type: 'basic',
                bet_amount: 5
              });
            
            if (queueError) {
              console.error('❌ Erro ao adicionar usuário de volta à fila:', queueError);
              // Não falhar o processo por causa deste erro
            } else {
              console.log('✅ Usuário adicionado de volta à fila');
            }
          } catch (error) {
            console.error('❌ Erro crítico ao adicionar usuário à fila:', error);
            // Continuar o processo mesmo com erro
          }
          
          // Remover sala antiga
          try {
            await (supabase as any)
              .from('pvp_rooms')
              .delete()
              .eq('id', existingRoom.id);
            
            // Remover confirmações da sala antiga
            await (supabase as any)
              .from('pvp_confirmations')
              .delete()
              .eq('room_id', existingRoom.id);
            
            console.log('✅ Sala antiga removida, continuando matchmaking...');
          } catch (error) {
            console.error('❌ Erro ao remover sala antiga:', error);
            // Continuar o processo mesmo com erro
          }
        } else {
          console.log('🎯 Usuário já está em uma sala válida:', existingRoom);
          setCurrentRoom(existingRoom);
        return;
        }
      }
      
      // 2. Verificar quantos jogadores estão na fila com retry para sincronização
      let queueData = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        const { data } = await (supabase as any)
        .from('pvp_queue')
        .select('*')
        .order('created_at', { ascending: true });
      
        queueData = data;
      const totalInQueue = queueData?.length || 0;
        
        console.log(`📊 [RETRY ${retryCount + 1}] Total na fila:`, totalInQueue);
        console.log('👥 [RETRY] Todos os IDs na fila:', queueData?.map(p => p.user_id));
        
        // Se encontrou pelo menos 2 players, parar o retry
        if (totalInQueue >= 2) {
          console.log('✅ [RETRY] Encontrou 2+ players, parando retry');
          break;
        }
        
        // Se não encontrou 2 players, aguardar e tentar novamente
        if (retryCount < maxRetries - 1) {
          console.log('⏳ [RETRY] Aguardando sincronização...');
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo
        }
        
        retryCount++;
      }
      
      const totalInQueue = queueData?.length || 0;
      
      // 3. Verificar se há pelo menos 2 jogadores
      console.log('🔍 [DEBUG] Verificando jogadores na fila...');
      console.log('📊 [DEBUG] totalInQueue:', totalInQueue);
      console.log('📊 [DEBUG] queueData length:', queueData?.length);
      console.log('📊 [DEBUG] queueData:', queueData);
      
      if (totalInQueue < 2) {
        console.log('❌ [MATCHMAKING] Não há jogadores suficientes para matchmaking');
        console.log('🔍 [DEBUG] Motivo: totalInQueue =', totalInQueue, '< 2');
        setError('Precisa de pelo menos 2 jogadores na fila');
        return;
      }
      
      // 3.5. Verificar se o usuário atual está na fila
      const userInQueue = queueData?.find(p => p.user_id === user.id);
      if (!userInQueue) {
        console.log('❌ [MATCHMAKING] Usuário não está na fila - saindo do matchmaking');
        return; // Não é erro, apenas não está na fila
      }
      
      console.log('✅ [MATCHMAKING] Usuário está na fila:', userInQueue);
      
      // 4. Executar matchmaking atômico com character_id
      console.log('🔄 [MATCHMAKING] Chamando função atômica...');
      console.log('🎯 [MATCHMAKING] Executando RPC create_atomic_pvp_room...');
      console.log('📊 [MATCHMAKING] Total na fila antes do RPC:', allQueue.length);
      console.log('👥 [MATCHMAKING] IDs na fila:', allQueue.map(q => q.user_id));
      
      // ⏰ Pequeno delay para garantir sincronização
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 🔄 Tentar RPC primeiro, se falhar, criar sala manualmente
      let matchmakingResult = null;
      
      try {
      const { data, error } = await (supabase as any)
        .rpc('create_atomic_pvp_room');
      
      if (error) {
          console.error('❌ [MATCHMAKING] Erro no RPC, tentando método manual:', error);
          throw error;
        }
        
        matchmakingResult = data;
        console.log('✅ [MATCHMAKING] RPC executado com sucesso:', data);
        
        // 🚨 FORÇAR FALLBACK MANUAL SE RPC RETORNA SUCCESS: FALSE
        if (!data.success) {
          console.log('⚠️ [MATCHMAKING] RPC retornou success: false, forçando fallback manual...');
          throw new Error('RPC retornou success: false');
        }
        
      } catch (rpcError) {
        console.log('🔄 [MATCHMAKING] RPC falhou, criando sala manualmente...');
        console.log('❌ [MATCHMAKING] Erro do RPC:', rpcError);
        
        // 🛠️ Método manual: criar sala diretamente
        if (queueData && queueData.length >= 2) {
          // Usar queueData (dados frescos) em vez de allQueue (estado local)
          const player1 = queueData[0];
          const player2 = queueData[1];
          
          console.log('👥 [MATCHMAKING] Criando sala manual com dados frescos:', {
            player1: player1.user_id,
            player2: player2.user_id,
            bet1: player1.bet_amount,
            bet2: player2.bet_amount,
            totalInQueue: queueData.length
          });
          
          // 🎯 GERAR PERGUNTAS SINCRONIZADAS PARA A SALA
          console.log('🎯 [MATCHMAKING] Gerando perguntas sincronizadas...');
          
          // Buscar perguntas do banco - QUERY MENOS RESTRITIVA
          const { data: questionsData, error: questionsError } = await (supabase as any)
            .from('knowledge_items')
            .select(`
              id,
              question,
              correct_answer,
              wrong_options,
              era_id,
              eras(name, slug)
            `)
            .eq('item_type', 'qa')
            .not('question', 'is', null)
            .not('correct_answer', 'is', null)
            .not('wrong_options', 'is', null)
            .limit(500); // Aumentar para 500 para garantir diversidade // Aumentar limite para garantir que temos perguntas suficientes
          
          if (questionsError) {
            console.error('❌ [MATCHMAKING] Erro ao buscar perguntas:', questionsError);
          }
          
          console.log('🔍 [DEBUG] Perguntas retornadas do banco:', questionsData?.length || 0);
          console.log('🔍 [DEBUG] Primeiras 5 perguntas do banco:', questionsData?.slice(0, 5).map(q => q.question?.substring(0, 50)));
          console.log('🚨 [DEBUG] TODAS AS PERGUNTAS DO BANCO:', questionsData?.map(q => q.question));
          console.log('🔍 [DEBUG] Primeiras 5 perguntas:', questionsData?.slice(0, 5));
          
          // 🚨 LOG CRÍTICO: Verificar se o banco tem perguntas suficientes
          if (questionsData && questionsData.length > 0) {
            console.log('✅ [DEBUG] Banco tem perguntas:', questionsData.length);
            console.log('🔍 [DEBUG] Estrutura da primeira pergunta:', questionsData[0]);
          } else {
            console.error('❌ [DEBUG] BANCO VAZIO - Nenhuma pergunta encontrada!');
          }
          
          // 🚨 VERIFICAÇÃO CRÍTICA: Verificar se o banco retornou perguntas
          if (!questionsData || questionsData.length === 0) {
            console.error('❌ [MATCHMAKING] ERRO CRÍTICO: Nenhuma pergunta retornada do banco!');
            console.error('❌ [MATCHMAKING] questionsData:', questionsData);
            console.error('❌ [MATCHMAKING] questionsError:', questionsError);
            setError('Nenhuma pergunta disponível no banco de dados');
            return;
          }
          
          if (questionsData.length < 25) {
            console.warn('⚠️ [MATCHMAKING] ATENÇÃO: Apenas', questionsData.length, 'perguntas no banco, mas precisamos de 25!');
          }
          
          // Transformar perguntas para o formato da sala
          console.log('🔍 [DEBUG] Iniciando transformação de perguntas...');
          const allQuestions = (questionsData || []).map((item: any) => {
            const wrongOptions = Array.isArray(item.wrong_options) ? item.wrong_options : [];
            const correctAnswer = item.correct_answer;
            
            // Criar array de opções: [correta, erradas...]
            const options = [correctAnswer, ...wrongOptions].slice(0, 4);
            
            // 🛡️ GARANTIR QUE SEMPRE TENHA 4 OPÇÕES
            while (options.length < 4) {
              options.push(`Opção ${String.fromCharCode(65 + options.length)}`);
            }
            
            // 🎯 EMBARALHAR OPÇÕES CORRETAMENTE - IGUAL AO SISTEMA DAS ERAS
            const shuffledOptions = [...options];
            console.log('🎲 [SHUFFLE DEBUG 2] Opções originais:', options);
            console.log('🎲 [SHUFFLE DEBUG 2] Resposta correta original:', correctAnswer);
            
            // 🚀 MÚLTIPLAS PASSADAS DE SHUFFLE PARA GARANTIR RANDOMIZAÇÃO TOTAL (IGUAL ERAS)
            for (let pass = 0; pass < 5; pass++) { // 5 PASSADAS COMO NAS ERAS!
              for (let i = shuffledOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
              }
            }
            
            console.log('🎲 [SHUFFLE DEBUG 2] Opções embaralhadas (5 passadas):', shuffledOptions);
            
            // Encontrar o novo índice da resposta correta após embaralhamento
            const correctIndex = shuffledOptions.findIndex(option => option === correctAnswer);
            console.log('🎲 [SHUFFLE DEBUG 2] Novo índice da resposta correta:', correctIndex);
            
            // 🚨 VERIFICAR SE O EMBARALHAMENTO FUNCIONOU
            if (correctIndex === -1) {
              console.log('❌ [SHUFFLE ERROR 2] Resposta correta não encontrada nas opções!');
              console.log('❌ [SHUFFLE ERROR 2] correctAnswer:', correctAnswer);
              console.log('❌ [SHUFFLE ERROR 2] shuffledOptions:', shuffledOptions);
            } else if (correctIndex === 0) {
              console.log('⚠️ [SHUFFLE WARNING 2] Resposta ainda está na primeira posição!');
            } else {
              console.log('✅ [SHUFFLE SUCCESS 2] Resposta foi movida para posição:', correctIndex);
            }
            
            const questionData = {
              id: item.id,
              question: item.question?.substring(0, 100), // 🚨 LIMITAR AINDA MAIS
              options: shuffledOptions.map(opt => opt?.substring(0, 50)), // 🚨 LIMITAR AINDA MAIS
              correct_answer: correctIndex, // 🎯 CORREÇÃO: Usar o índice correto após embaralhamento
              era: item.eras?.name || 'Geral',
              era_slug: item.eras?.slug || 'geral'
            };
            
            console.log('🔍 [MATCHMAKING] Pergunta processada:', questionData);
            return questionData;
          });
          
          console.log('🔍 [DEBUG] Perguntas transformadas:', allQuestions.length);
          console.log('🔍 [DEBUG] Primeiras 3 perguntas transformadas:', allQuestions.slice(0, 3));
          console.log('🔍 [DEBUG] TODAS as perguntas transformadas:', allQuestions.map(q => q.question?.substring(0, 50)));
          
          // 🚨 FORÇAR 25 PERGUNTAS - SEMPRE!
          console.log('🚨 [FORCE] FORÇANDO 25 PERGUNTAS SEMPRE!');
          
          // 🎯 MELHORAR SHUFFLE: Usar algoritmo Fisher-Yates para melhor randomização
          const shuffledQuestions = [...allQuestions];
          for (let i = shuffledQuestions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
          }
          
          // 🚨 SEMPRE SELECIONAR 25 PERGUNTAS
          let selectedQuestions: any[];
          if (allQuestions.length >= 25) {
            selectedQuestions = shuffledQuestions.slice(0, 25);
            console.log('✅ [MATCHMAKING] Selecionando 25 perguntas únicas de', allQuestions.length, 'disponíveis');
          } else {
            // Se tiver menos de 25, repetir perguntas OTIMIZADO
            const repetitions = Math.ceil(25 / shuffledQuestions.length);
            selectedQuestions = Array.from({ length: 25 }, (_, i) => {
              const question = shuffledQuestions[i % shuffledQuestions.length];
              const repetition = Math.floor(i / shuffledQuestions.length) + 1;
              return {
                ...question,
                id: `${question.id}_${i}`,
                question: repetition > 1 ? `${question.question} (${repetition})` : question.question
              };
            });
            console.log('⚠️ [MATCHMAKING] Repetindo perguntas para completar 25');
          }
          
          console.log('🔍 [MATCHMAKING] Primeiras 5 perguntas selecionadas:', selectedQuestions.slice(0, 5).map(q => q.question?.substring(0, 50)));
          
          // 🚨 VERIFICAÇÃO CRÍTICA: GARANTIR QUE TEMOS EXATAMENTE 25 PERGUNTAS
          if (selectedQuestions.length !== 25) {
            console.error('❌ [MATCHMAKING] ERRO CRÍTICO: selectedQuestions.length =', selectedQuestions.length, 'deveria ser 25!');
            console.error('❌ [MATCHMAKING] selectedQuestions:', selectedQuestions);
            
            // 🚨 FORÇAR 25 PERGUNTAS OTIMIZADO
            const needed = 25 - selectedQuestions.length;
            for (let i = 0; i < needed; i++) {
              const randomQuestion = allQuestions[Math.floor(Math.random() * allQuestions.length)];
              selectedQuestions.push({
                ...randomQuestion,
                id: `${randomQuestion.id}_extra_${selectedQuestions.length + 1}`,
                question: `${randomQuestion.question} (extra ${selectedQuestions.length + 1})`
              });
            }
            
            // Se tiver mais de 25, cortar para 25
            selectedQuestions = selectedQuestions.slice(0, 25);
            
            console.log('🔧 [MATCHMAKING] CORRIGIDO: Agora temos exatamente', selectedQuestions.length, 'perguntas');
          }
          
          console.log('✅ [MATCHMAKING] Perguntas geradas:', selectedQuestions.length);
          console.log('🔍 [DEBUG] Primeira pergunta a ser salva:', selectedQuestions[0]);
          console.log('🔍 [DEBUG] Primeira pergunta options:', selectedQuestions[0]?.options);
          console.log('🔍 [DEBUG] Todas as perguntas:', selectedQuestions);
          console.log('🔍 [DEBUG] Tamanho do JSON das perguntas:', JSON.stringify(selectedQuestions).length);
          console.log('🔍 [DEBUG] Verificando se todas as 25 perguntas estão presentes:', selectedQuestions.map((q, i) => `${i}: ${q.question?.substring(0, 30)}...`));
          
          // 🚨 LOG CRÍTICO: Verificar se o JSON é muito grande
          const jsonSize = JSON.stringify(selectedQuestions).length;
          console.log('🚨 [DEBUG] TAMANHO DO JSON:', jsonSize, 'bytes');
          if (jsonSize > 10000) {
            console.warn('⚠️ [DEBUG] JSON muito grande! Pode ser truncado pelo Supabase');
          }
          
          // Criar sala com perguntas e HP inicial
          console.log('🔍 [DEBUG] Salvando perguntas na sala:', selectedQuestions);
          console.log('🔍 [DEBUG] Primeira pergunta antes de salvar:', selectedQuestions[0]);
          console.log('🔍 [DEBUG] JSON.stringify da primeira pergunta:', JSON.stringify(selectedQuestions[0]));
          
          const roomInsertData = {
            player1_id: player1.user_id,
            player2_id: player2.user_id,
            bet_amount: Math.min(player1.bet_amount, player2.bet_amount),
            status: 'waiting', // ✅ CORRIGIDO: Deve ser 'waiting' para sincronização
            current_question: 1,
            questions: selectedQuestions, // 🎯 PERGUNTAS SINCRONIZADAS
            player1_score: 0,
            player2_score: 0
            // Removido plan_type que não existe na tabela
          };
          
          console.log('🔍 [DEBUG] Dados completos para inserir:', roomInsertData);
          console.log('🔍 [DEBUG] JSON.stringify do questions:', JSON.stringify(selectedQuestions));
          
          const { data: roomData, error: roomError } = await (supabase as any)
            .from('pvp_rooms')
            .insert(roomInsertData)
            .select()
            .single();
          
          if (roomError) {
            console.error('❌ [MATCHMAKING] Erro ao criar sala manual:', roomError);
            setError('Erro ao criar sala de batalha');
        return;
      }
      
          console.log('🔍 [DEBUG] Sala criada com sucesso:', roomData);
          console.log('🔍 [DEBUG] Perguntas retornadas do Supabase:', roomData?.questions);
          console.log('🔍 [DEBUG] Quantidade de perguntas retornadas:', roomData?.questions?.length);
          
          // 🚨 VERIFICAÇÃO CRÍTICA: Comparar perguntas enviadas vs recebidas
          console.log('🔍 [DEBUG] Perguntas enviadas para o Supabase:', selectedQuestions.length);
          console.log('🔍 [DEBUG] Perguntas recebidas do Supabase:', roomData?.questions?.length);
          
          if (roomData?.questions?.length !== selectedQuestions.length) {
            console.error('❌ [MATCHMAKING] ERRO CRÍTICO: Supabase truncou as perguntas!');
            console.error('❌ [MATCHMAKING] Enviadas:', selectedQuestions.length, 'Recebidas:', roomData?.questions?.length);
            console.error('❌ [MATCHMAKING] Perguntas enviadas:', selectedQuestions.map(q => q.question?.substring(0, 30)));
            console.error('❌ [MATCHMAKING] Perguntas recebidas:', roomData?.questions?.map(q => q.question?.substring(0, 30)));
          }
          
          // 🚨 VERIFICAÇÃO CRÍTICA: GARANTIR QUE A SALA FOI CRIADA COM 25 PERGUNTAS
          if (roomData?.questions?.length !== 25) {
            console.error('❌ [MATCHMAKING] ERRO CRÍTICO: Sala criada com apenas', roomData?.questions?.length, 'perguntas em vez de 25!');
            console.error('❌ [MATCHMAKING] Perguntas salvas:', roomData?.questions);
            
            // 🚨 TENTAR CORRIGIR A SALA
            console.log('🔧 [MATCHMAKING] Tentando corrigir a sala...');
            const { error: fixError } = await (supabase as any)
              .from('pvp_rooms')
              .update({ questions: selectedQuestions })
              .eq('id', roomData.id);
            
            if (fixError) {
              console.error('❌ [MATCHMAKING] Erro ao corrigir sala:', fixError);
            } else {
              console.log('✅ [MATCHMAKING] Sala corrigida com 25 perguntas!');
            }
          } else {
            console.log('✅ [MATCHMAKING] Sala criada corretamente com 25 perguntas!');
          }
          console.log('🔍 [DEBUG] Primeira pergunta retornada:', roomData?.questions?.[0]);
          console.log('🔍 [DEBUG] JSON.stringify da primeira pergunta retornada:', JSON.stringify(roomData?.questions?.[0]));
          console.log('🔍 [DEBUG] Verificando se todas as perguntas foram salvas:', roomData?.questions?.map((q, i) => `${i}: ${q.question?.substring(0, 30)}...`));
          
          // 🚨 VERIFICAÇÃO CRÍTICA: Garantir que a sala foi criada com 25 perguntas
          if (!roomData?.questions || roomData.questions.length < 25) {
            console.error('❌ [MATCHMAKING] ERRO CRÍTICO: Sala criada com apenas', roomData?.questions?.length, 'perguntas!');
            console.error('❌ [MATCHMAKING] Esperado: 25 perguntas, Recebido:', roomData?.questions?.length);
            console.error('❌ [MATCHMAKING] Tentando corrigir automaticamente...');
            
            // Corrigir automaticamente
            const { error: fixError } = await (supabase as any)
              .from('pvp_rooms')
              .update({ questions: selectedQuestions })
              .eq('id', roomData.id);
              
            if (fixError) {
              console.error('❌ [MATCHMAKING] Falha ao corrigir sala:', fixError);
            } else {
              console.log('✅ [MATCHMAKING] Sala corrigida com 25 perguntas!');
            }
          } else {
            console.log('✅ [MATCHMAKING] Sala criada corretamente com', roomData.questions.length, 'perguntas!');
          }
          
          // Remover players da fila
          await (supabase as any)
            .from('pvp_queue')
            .delete()
            .in('user_id', [player1.user_id, player2.user_id]);
          
          matchmakingResult = {
            success: true,
            room_id: roomData.id,
            player1_id: player1.user_id,
            player2_id: player2.user_id,
            player1_character_id: player1.selected_character_id,
            player2_character_id: player2.selected_character_id,
            bet_amount: Math.min(player1.bet_amount, player2.bet_amount)
          };
          
          console.log('✅ [MATCHMAKING] Sala criada manualmente:', matchmakingResult);
        } else {
          matchmakingResult = {
            success: false,
            reason: 'Não há jogadores suficientes na fila'
          };
        }
      }
      
      console.log('📊 [MATCHMAKING] Success:', matchmakingResult?.success);
      console.log('🎯 [MATCHMAKING] Resultado completo:', JSON.stringify(matchmakingResult, null, 2));
      console.log('📊 [MATCHMAKING] Reason:', matchmakingResult?.reason);
      
      // 5. Verificar se uma sala foi criada
      if (matchmakingResult?.success && matchmakingResult?.room_id) {
        console.log('🎮 Sala criada ATÔMICAMENTE:', matchmakingResult.room_id);
        console.log('👥 Player1:', matchmakingResult.player1_id, 'Character:', matchmakingResult.player1_character_id);
        console.log('👥 Player2:', matchmakingResult.player2_id, 'Character:', matchmakingResult.player2_character_id);
        console.log('💰 Bet Amount:', matchmakingResult.bet_amount);
        
        // Buscar dados completos da sala
        const { data: roomData, error: roomError } = await (supabase as any)
          .from('pvp_rooms')
          .select('*')
          .eq('id', matchmakingResult.room_id)
          .single();
        
        if (roomError) {
          console.error('Erro ao buscar sala:', roomError);
          return;
        }
        
        console.log('📋 Dados da sala:', roomData);
        
        // Verificar se o usuário está na sala
        if (roomData.player1_id === user.id || roomData.player2_id === user.id) {
          console.log('🎯 Usuário está na sala! Redirecionando...');
          console.log('👤 Player1 ID:', roomData.player1_id);
          console.log('👤 Player2 ID:', roomData.player2_id);
          console.log('👤 Meu ID:', user.id);
          console.log('🎯 Sou Player1:', roomData.player1_id === user.id);
          console.log('🎯 Sou Player2:', roomData.player2_id === user.id);
          setCurrentRoom(roomData);
          
          // Notificar ambos os jogadores que a sala foi criada
          console.log('📢 [NOTIFICATION] Notificando ambos os jogadores sobre a sala criada...');
          
          // Enviar notificação via real-time para ambos os jogadores
          const notificationChannel = (supabase as any).channel(`matchmaking_${roomData.id}`);
          notificationChannel.subscribe((status: any) => {
            if (status === 'SUBSCRIBED') {
              notificationChannel.send({
                type: 'broadcast',
                event: 'room_created',
                payload: {
                  room_id: roomData.id,
                  player1_id: roomData.player1_id,
                  player2_id: roomData.player2_id,
                  message: 'Sala criada! Redirecionando...'
                }
              });
            }
          });
          
          // 🚀 NOTIFICAÇÃO DIRETA PARA AMBOS OS PLAYERS
          console.log('📢 [BROADCAST] Enviando notificação direta para ambos os players...');
          
          // Notificar Player 1
          const player1Channel = (supabase as any).channel(`player_${roomData.player1_id}`);
          player1Channel.subscribe((status: any) => {
            if (status === 'SUBSCRIBED') {
              player1Channel.send({
                type: 'broadcast',
                event: 'redirect_to_battle',
                payload: {
                  room_id: roomData.id,
                  message: 'Redirecionando para batalha...'
                }
              });
            }
          });
          
          // Notificar Player 2
          const player2Channel = (supabase as any).channel(`player_${roomData.player2_id}`);
          player2Channel.subscribe((status: any) => {
            if (status === 'SUBSCRIBED') {
              player2Channel.send({
                type: 'broadcast',
                event: 'redirect_to_battle',
                payload: {
                  room_id: roomData.id,
                  message: 'Redirecionando para batalha...'
                }
              });
            }
          });
          
          // 🎯 CONFIRMAÇÃO AUTOMÁTICA PARA AMBOS OS PLAYERS
          console.log('🎯 [AUTO-CONFIRM] Confirmando automaticamente ambos os players...');
          
          // Confirmar automaticamente Player 1
          await (supabase as any)
            .from('pvp_confirmations')
            .upsert({
              room_id: roomData.id,
              user_id: roomData.player1_id,
              confirmed: true,
              confirmed_at: new Date().toISOString()
            });
          
          // Confirmar automaticamente Player 2
          await (supabase as any)
            .from('pvp_confirmations')
            .upsert({
              room_id: roomData.id,
              user_id: roomData.player2_id,
              confirmed: true,
              confirmed_at: new Date().toISOString()
            });
          
          console.log('✅ [AUTO-CONFIRM] Ambos os players confirmados automaticamente!');
          
          // 🚀 CHAMAR confirmBattle PARA PROCESSAR AS CONFIRMAÇÕES E INICIAR O JOGO
          console.log('🚀 [AUTO-CONFIRM] Chamando confirmBattle para iniciar o jogo...');
          console.log('🚀 [AUTO-CONFIRM] Room ID:', roomData.id);
          console.log('🚀 [AUTO-CONFIRM] Room Status:', roomData.status);
          
          try {
            await confirmBattle(roomData.id);
            console.log('✅ [AUTO-CONFIRM] confirmBattle executado com sucesso!');
          } catch (error) {
            console.error('❌ [AUTO-CONFIRM] Erro ao executar confirmBattle:', error);
          }
          
          // FORÇAR REDIRECIONAMENTO IMEDIATO PARA AMBOS OS PLAYERS
          console.log('🚀 [REDIRECT] Forçando redirecionamento para sala:', roomData.id);
          
          // Aguardar um pouco para garantir que as notificações sejam enviadas
          setTimeout(() => {
            console.log('🚀 [REDIRECT] Executando redirecionamento IMEDIATO...');
            window.location.href = `/arena/battle/${roomData.id}`;
          }, 1000);
        } else {
          console.log('⚠️ Usuário não está na sala criada');
          console.log('👤 Player1 ID:', roomData.player1_id);
          console.log('👤 Player2 ID:', roomData.player2_id);
          console.log('👤 Meu ID:', user.id);
        }
      } else {
        console.log('ℹ️ Nenhuma sala criada - aguardando mais jogadores');
        console.log('📊 Motivo:', matchmakingResult?.reason || 'Desconhecido');
      }
      
    } catch (err) {
      console.error('Erro no matchmaking:', err);
      setError('Erro ao executar matchmaking');
    } finally {
      setLoading(false);
    }
  }, [user, loading]);

  // 🚀 MATCHMAKING AUTOMÁTICO quando há 2+ players na fila
  useEffect(() => {
    if (!user?.id || loading || allQueue.length < 2) return;
    
    // Verificar se o usuário está na fila
    const userInQueue = allQueue.some(q => q.user_id === user.id);
    if (!userInQueue) return;
    
    // Verificar se já existe uma sala para este usuário
    if (currentRoom) return;
    
    // 🛡️ VERIFICAR SE HÁ USUÁRIOS DIFERENTES (não duplicados)
    const uniqueUserIds = [...new Set(allQueue.map(q => q.user_id))];
    if (uniqueUserIds.length < 2) {
      console.log('⚠️ [AUTO-MATCHMAKING] Apenas 1 usuário único na fila, ignorando...');
      console.log('👥 [AUTO-MATCHMAKING] IDs únicos:', uniqueUserIds);
      return;
    }
    
    console.log('🚀 [AUTO-MATCHMAKING] Detectado 2+ players únicos na fila!');
    console.log('👥 [AUTO-MATCHMAKING] Total na fila:', allQueue.length);
    console.log('👥 [AUTO-MATCHMAKING] Usuários únicos:', uniqueUserIds.length);
    console.log('👤 [AUTO-MATCHMAKING] Meu ID:', user.id);
    console.log('🎯 [AUTO-MATCHMAKING] Executando matchmaking automático...');
    
    // 🚀 EXECUTAR MATCHMAKING AUTOMÁTICO
    console.log('🚀 [AUTO-MATCHMAKING] Executando matchmaking automático...');
    
    // Executar matchmaking automático com delay para evitar conflitos
    const autoMatchmakingTimeout = setTimeout(() => {
      runMatchmaking();
    }, 2000); // 2 segundos de delay
    
    return () => clearTimeout(autoMatchmakingTimeout);
  }, [allQueue.length, user?.id, loading, currentRoom, runMatchmaking]);

  // 🎯 LISTENER PARA DETECTAR CRIAÇÃO DE SALAS (PARA AMBOS OS PLAYERS)
  useEffect(() => {
    if (authLoading) {
      console.log('⏳ [ROOM LISTENER] Aguardando autenticação...');
      return;
    }

    if (!user || isListenerActive) {
      if (!user) {
        console.log('👤 [ROOM LISTENER] Usuário não autenticado - pulando configuração');
      } else {
        console.log('🔄 [ROOM LISTENER] Listener já ativo - pulando configuração');
      }
      return;
    }

    console.log('🔄 [ROOM LISTENER] Configurando listener para criação de salas...');
    
    // Marcar listener como ativo
    setIsListenerActive(true);
    
    // Inicializar REALTIME uma única vez
    console.log('🚀 [REALTIME] Inicializando sistema PvP...');
    setIsRealtimeActive(true);
    
    // Inicializar fila
    fetchQueue();
    
    // Escutar mudanças na tabela pvp_rooms
    const roomChannel = (supabase as any).channel('pvp_rooms_changes');
    
    // Listener para salas
    roomChannel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'pvp_rooms'
    }, (payload: any) => {
      console.log('📡 [ROOM LISTENER] Nova sala criada detectada:', payload);
      
      const newRoom = payload.new;
      
      // Verificar se o usuário atual está nesta sala
      if (newRoom.player1_id === user.id || newRoom.player2_id === user.id) {
        console.log('🎯 [ROOM LISTENER] Usuário está na nova sala! Redirecionando...');
        console.log('👤 [ROOM LISTENER] Player1:', newRoom.player1_id);
        console.log('👤 [ROOM LISTENER] Player2:', newRoom.player2_id);
        console.log('👤 [ROOM LISTENER] Meu ID:', user.id);
        
        // Aguardar um pouco para garantir que a sala esteja completamente criada
        setTimeout(() => {
          console.log('🚀 [ROOM LISTENER] Redirecionando para sala:', newRoom.id);
          window.location.href = `/arena/battle/${newRoom.id}`;
        }, 1500);
      } else {
        console.log('⚠️ [ROOM LISTENER] Usuário não está nesta sala');
      }
    });

    // 🚀 LISTENER CRÍTICO: Escutar atualizações da sala atual (perguntas, scores, etc.)
    roomChannel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'pvp_rooms'
    }, (payload: any) => {
      console.log('🚨 [ROOM UPDATE] ===== ATUALIZAÇÃO DETECTADA =====');
      console.log('🔄 [ROOM UPDATE] Atualização de sala detectada:', payload);
      console.log('🔄 [ROOM UPDATE] Sala atual:', currentRoom?.id);
      console.log('🔄 [ROOM UPDATE] Sala atualizada:', payload.new?.id);
      console.log('🔄 [ROOM UPDATE] Usuário atual:', user?.id);
      console.log('🔄 [ROOM UPDATE] Player1 da sala:', payload.new?.player1_id);
      console.log('🔄 [ROOM UPDATE] Player2 da sala:', payload.new?.player2_id);
      console.log('🔄 [ROOM UPDATE] Evento:', payload.eventType);
      console.log('🔄 [ROOM UPDATE] Timestamp:', new Date().toISOString());
      console.log('🚨 [ROOM UPDATE] ================================');
      
      const updatedRoom = payload.new;
      const oldRoom = payload.old;
      
      // Verificar se é a sala atual do usuário
      const isUserInRoom = updatedRoom.player1_id === user?.id || updatedRoom.player2_id === user?.id;
      console.log('🔄 [ROOM UPDATE] Usuário está na sala?', isUserInRoom);
      
      if (currentRoom && updatedRoom.id === currentRoom.id && isUserInRoom) {
        console.log('🎯 [ROOM UPDATE] É a nossa sala! Sincronizando...');
        console.log('📊 [ROOM UPDATE] Pergunta anterior:', oldRoom.current_question);
        console.log('📊 [ROOM UPDATE] Pergunta atual:', updatedRoom.current_question);
        console.log('📊 [ROOM UPDATE] Score P1 anterior:', oldRoom.player1_score);
        console.log('📊 [ROOM UPDATE] Score P1 atual:', updatedRoom.player1_score);
        console.log('📊 [ROOM UPDATE] Score P2 anterior:', oldRoom.player2_score);
        console.log('📊 [ROOM UPDATE] Score P2 atual:', updatedRoom.player2_score);
        
        // Atualizar sala local imediatamente com força visual
        console.log('⚡ [ROOM UPDATE] ATUALIZANDO CURRENTROOM AGORA!');
        console.log('⚡ [ROOM UPDATE] Dados da sala atualizada:', {
          id: updatedRoom.id,
          player1_score: updatedRoom.player1_score,
          player2_score: updatedRoom.player2_score,
          current_question: updatedRoom.current_question
        });
        
        setCurrentRoom({ ...updatedRoom, _lastUpdate: Date.now() });
        
        // 🎯 UMA ÚNICA ATUALIZAÇÃO SIMPLES - SEM PISCAR
        console.log('✅ [ROOM UPDATE] Sala atualizada com sucesso!');
        console.log('🎯 [ROOM UPDATE] Dados finais da sala:', {
          id: updatedRoom.id,
          player1_score: updatedRoom.player1_score,
          player2_score: updatedRoom.player2_score,
          current_question: updatedRoom.current_question,
          status: updatedRoom.status
        });
        
        // 🚨 FORÇAR ATUALIZAÇÃO IMEDIATA PARA AMBOS OS JOGADORES
        console.log('🚨 [ROOM UPDATE] FORÇANDO SINCRONIZAÇÃO IMEDIATA!');
        setTimeout(() => {
          setCurrentRoom(prev => ({ ...prev, _forceSync: Date.now() }));
          console.log('🚨 [ROOM UPDATE] Re-sincronização forçada!');
        }, 50);
        console.log('🚀 [ROOM UPDATE] FORÇANDO RE-RENDER IMEDIATO!');
        console.log('🚀 [ROOM UPDATE] Dados finais:', {
          id: updatedRoom.id,
          player1_score: updatedRoom.player1_score,
          player2_score: updatedRoom.player2_score,
          current_question: updatedRoom.current_question,
          status: updatedRoom.status
        });
        
        // Se a pergunta mudou, notificar
        if (oldRoom.current_question !== updatedRoom.current_question) {
          console.log('🚀 [ROOM UPDATE] PERGUNTA AVANÇOU!', {
            de: oldRoom.current_question,
            para: updatedRoom.current_question
          });
        }
        
        // Se o score mudou, notificar
        if (oldRoom.player1_score !== updatedRoom.player1_score || 
            oldRoom.player2_score !== updatedRoom.player2_score) {
          console.log('📈 [ROOM UPDATE] SCORE ATUALIZADO!', {
            p1: `${oldRoom.player1_score} → ${updatedRoom.player1_score}`,
            p2: `${oldRoom.player2_score} → ${updatedRoom.player2_score}`
          });
          console.log('🎯 [ROOM UPDATE] FORÇANDO RE-RENDER DA INTERFACE!');
          console.log('🎯 [ROOM UPDATE] setCurrentRoom chamado com:', updatedRoom);
        }
      } else if (isUserInRoom) {
        // Usuário está na sala, mas currentRoom pode estar undefined
        console.log('🔄 [ROOM UPDATE] Usuário está na sala, mas currentRoom undefined. Atualizando...');
        console.log('🔄 [ROOM UPDATE] Atualizando currentRoom com sala:', updatedRoom.id);
        setCurrentRoom(updatedRoom);
      } else {
        console.log('⚠️ [ROOM UPDATE] Não é nossa sala atual');
        console.log('⚠️ [ROOM UPDATE] CurrentRoom ID:', currentRoom?.id);
        console.log('⚠️ [ROOM UPDATE] UpdatedRoom ID:', updatedRoom.id);
      }
    });

    // Listener para fila
    roomChannel.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pvp_queue'
    }, (payload: any) => {
      console.log('📡 [REALTIME] Mudança na fila detectada:', payload);
      fetchQueue();
    });
    
    roomChannel.subscribe((status: any) => {
      console.log('📡 [ROOM LISTENER] Status do canal:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ [ROOM LISTENER] Canal ativado com sucesso!');
        setIsListenerActive(true);
      }
    });
    
    return () => {
      console.log('🧹 [ROOM LISTENER] Limpando listener de salas...');
      console.log('🧹 [REALTIME] Limpando recursos...');
      setIsListenerActive(false);
      setIsRealtimeActive(false);
      roomChannel.unsubscribe();
    };
  }, [user, authLoading]);

  // 🛡️ TIMEOUT DE SEGURANÇA - Evitar loading infinito
  useEffect(() => {
    const safetyTimeout = setTimeout(() => {
      if (loading) {
        console.log('⚠️ [SAFETY] Loading timeout - forçando setLoading(false)');
        setLoading(false);
      }
    }, 10000); // 10 segundos

    return () => clearTimeout(safetyTimeout);
  }, [loading]);

  // Real-time para fila (sincronização automática + matchmaking automático)
  // 🧹 LIMPEZA AUTOMÁTICA DE SALAS ANTIGAS (COM DELAY DE 1 MINUTO)
  useEffect(() => {
    const cleanupOldRooms = async () => {
      try {
        // Limpar apenas salas FINALIZADAS há mais de 2 minutos - dar tempo para processar
        console.log('🧹 [CLEANUP] Iniciando limpeza de salas finalizadas há mais de 2 minutos...');
        
        // Primeiro, listar as salas que serão deletadas (apenas as finalizadas há mais de 2 minutos)
        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString(); // 2 minutos atrás
        const { data: roomsToDelete } = await (supabase as any)
          .from('pvp_rooms')
          .select('id, status, created_at, finished_at')
          .in('status', ['completed', 'finished'])
          .or(`finished_at.lt.${twoMinutesAgo},and(finished_at.is.null,created_at.lt.${twoMinutesAgo})`);
        
        if (roomsToDelete && roomsToDelete.length > 0) {
          console.log('🔍 [CLEANUP] Salas finalizadas encontradas:', roomsToDelete.length);
          console.log('🔍 [CLEANUP] IDs:', roomsToDelete.map(r => r.id));
          
          // Deletar salas finalizadas (após partida terminar)
          let deletedCount = 0;
          for (const room of roomsToDelete) {
            try {
              const { error } = await (supabase as any)
                .from('pvp_rooms')
                .delete()
                .eq('id', room.id);
              
              if (error) {
                console.error(`❌ [CLEANUP] Erro ao deletar sala ${room.id}:`, error);
              } else {
                deletedCount++;
                console.log(`✅ [CLEANUP] Sala finalizada ${room.id} deletada`);
              }
            } catch (err) {
              console.error(`❌ [CLEANUP] Erro ao deletar sala ${room.id}:`, err);
            }
          }
          
          console.log('✅ [CLEANUP] Total de salas deletadas:', deletedCount);
        } else {
          console.log('✅ [CLEANUP] Nenhuma sala waiting/confirming encontrada');
        }
        
        // Limpar salas criadas há mais de 7 minutos (5 min de jogo + 2 min de buffer)
        const sevenMinutesAgo = new Date(Date.now() - 7 * 60 * 1000).toISOString();
        await (supabase as any)
          .from('pvp_rooms')
          .delete()
          .lt('created_at', sevenMinutesAgo);
        
        // Limpar fila expirada
        await (supabase as any)
            .from('pvp_queue')
          .delete()
          .lt('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());
        
        // Verificar se há salas 'waiting' restantes
        const { data: waitingRooms } = await (supabase as any)
          .from('pvp_rooms')
          .select('id, status, created_at')
          .eq('status', 'waiting');
        
        if (waitingRooms && waitingRooms.length > 0) {
          console.log('⚠️ [CLEANUP] Salas waiting restantes:', waitingRooms.length);
          console.log('🔍 [CLEANUP] IDs das salas:', waitingRooms.map(r => r.id));
        }
        
        console.log('🧹 [CLEANUP] Limpeza automática executada');
      } catch (error) {
        console.error('❌ [CLEANUP] Erro na limpeza automática:', error);
      }
    };

    // Executar limpeza imediatamente e depois a cada 5 minutos (menos agressivo)
    cleanupOldRooms();
    const cleanupInterval = setInterval(cleanupOldRooms, 5 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // 🎯 REALTIME PARA FILA (ATUALIZAÇÃO AUTOMÁTICA) - REMOVIDO (consolidado no listener de salas)

  // Real-time para salas (sincronização automática)
  useEffect(() => {
    if (!user) return;
    
    console.log('🔄 [REALTIME] Configurando listener para usuário:', user.id);
    
    // 🚀 CACHE PARA EVITAR PROCESSAMENTO DUPLICADO
    const processedUpdates = new Set<string>();
    
    const roomsChannel = (supabase as any)
      .channel(`pvp_rooms_realtime_${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pvp_rooms'
      }, (payload: any) => {
        const room = payload.new || payload.old;
        
        // 🚀 VERIFICAR SE JÁ PROCESSAMOS ESTA ATUALIZAÇÃO
        const updateKey = `${room?.id}_${payload.event}_${Date.now()}`;
        if (processedUpdates.has(updateKey)) {
          console.log('⚠️ [REALTIME] Atualização já processada - ignorando');
          return;
        }
        processedUpdates.add(updateKey);
        
        // 🧹 LIMPAR CACHE ANTIGO (manter apenas últimas 100 atualizações)
        if (processedUpdates.size > 100) {
          const firstKey = processedUpdates.values().next().value;
          processedUpdates.delete(firstKey);
        }
        
        console.log('🔄 [REALTIME] Mudança na sala detectada:', payload.event, room);
        console.log('👤 [REALTIME] Meu ID:', user.id);
        console.log('👥 [REALTIME] Player1 ID:', room?.player1_id);
        console.log('👥 [REALTIME] Player2 ID:', room?.player2_id);
        console.log('📊 [REALTIME] Status da sala:', room?.status);
        console.log('📊 [REALTIME] Pergunta atual:', room?.current_question);
        console.log('📊 [REALTIME] Score P1:', room?.player1_score, 'Score P2:', room?.player2_score);
        console.log('🕐 [REALTIME] Started at:', room?.started_at);
        
        // 🚀 FORÇAR ATUALIZAÇÃO VISUAL IMEDIATA
        console.log('🎯 [REALTIME] Forçando atualização visual...');
        console.log('🔄 [REALTIME] Payload completo:', payload);
        console.log('🚨 [REALTIME] LISTENER ACIONADO! - Evento:', payload.event);
        console.log('🚨 [REALTIME] Sala ID:', room?.id);
        console.log('🚨 [REALTIME] Timestamp:', new Date().toISOString());
        
        // 🔍 FILTRO INTELIGENTE: Verificar se o usuário está nesta sala específica
        if (!room || !room.id) {
          console.log('⚠️ [REALTIME] Sala inválida ou sem ID');
          return;
        }
        
        const isPlayer1 = room.player1_id === user.id;
        const isPlayer2 = room.player2_id === user.id;
        const isInRoom = isPlayer1 || isPlayer2;
        
        console.log('🔍 [REALTIME] Verificação de participação:', {
          roomId: room.id,
          isPlayer1,
          isPlayer2,
          isInRoom,
          myUserId: user.id,
          player1Id: room.player1_id,
          player2Id: room.player2_id
        });
        
        // 🚀 PROCESSAR APENAS SE O USUÁRIO ESTÁ NESTA SALA
        if (isInRoom) {
          console.log('🎯 [REALTIME] ✅ USUÁRIO ESTÁ NA SALA! Processando atualização...');
          console.log('🔄 [REALTIME] Atualizando currentRoom com:', room);
          console.log('📊 [REALTIME] Dados da atualização:', {
            roomId: room.id,
            currentQuestion: room.current_question,
            player1Score: room.player1_score,
            player2Score: room.player2_score,
            status: room.status,
            event: payload.event
          });
          setCurrentRoom(room);
          
          // 🚀 REDIRECIONAMENTO AUTOMÁTICO QUANDO NOVA SALA É CRIADA
          if (payload.event === 'INSERT' && room.status === 'playing') {
            console.log('🚀 [REALTIME] Nova sala criada! Redirecionando automaticamente...');
            console.log('🚀 [REALTIME] Redirecionando para sala:', room.id);
            setTimeout(() => {
              window.location.href = `/arena/battle/${room.id}`;
            }, 500); // Pequeno delay para garantir sincronização
          }
          
          // Se a batalha terminou, limpar estado
          if (room.status === 'finished') {
            console.log('🏁 Batalha finalizada! Limpando estado em 3 segundos...');
            setTimeout(() => {
              clearBattleState();
            }, 3000);
          }
        } else {
          console.log('⚠️ [REALTIME] Usuário não está nesta sala - ignorando atualização');
          console.log('⚠️ [REALTIME] Sala ignorada:', {
            roomId: room.id,
            player1Id: room.player1_id,
            player2Id: room.player2_id,
            myUserId: user.id
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(roomsChannel);
    };
  }, [user, clearBattleState]);

  // Real-time para confirmações
  useEffect(() => {
    if (!user || !currentRoom) return;
    
    const confirmationsChannel = (supabase as any)
      .channel('pvp_confirmations_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pvp_confirmations',
        filter: `room_id=eq.${currentRoom.id}`
      }, (payload: any) => {
        console.log('🔄 Confirmação atualizada:', payload);
        
        // Recarregar confirmações
        (supabase as any)
          .from('pvp_confirmations')
          .select('*')
          .eq('room_id', currentRoom.id)
          .then(({ data }: any) => {
            setConfirmations(data || []);
            
            // Verificar se ambos confirmaram
            const confirmedCount = data?.filter((c: any) => c.confirmed).length || 0;
            if (confirmedCount >= 2) {
              console.log('✅ Ambos confirmaram! Recarregando sala...');
              // Recarregar sala para verificar status
              (supabase as any)
                .from('pvp_rooms')
                .select('*')
                .eq('id', currentRoom.id)
                .single()
                .then(({ data: roomData }: any) => {
                  if (roomData) {
                    setCurrentRoom(roomData);
                  }
                });
            }
          });
      })
      .subscribe();

    return () => {
      confirmationsChannel.unsubscribe();
    };
  }, [user, currentRoom]);

  // Remover useEffect duplicado (já está no real-time)

  // Função para responder pergunta (SISTEMA SINCRONIZADO)
  const answerQuestion = useCallback(async (roomId: string, questionIndex: number, answerIndex: number, timeTaken: number = 0) => {
    console.log('🎯 [ANSWER QUESTION] ===== FUNÇÃO CHAMADA =====');
    console.log('🎯 [ANSWER QUESTION] Parâmetros:', { roomId, questionIndex, answerIndex, timeTaken });
    console.log('🎯 [ANSWER QUESTION] user:', user?.id);
    console.log('🎯 [ANSWER QUESTION] currentRoom:', currentRoom?.id);
    console.log('🎯 [ANSWER QUESTION] currentRoom completo:', currentRoom);
    console.log('🎯 [ANSWER QUESTION] =========================');

    // Se não temos currentRoom, tentar carregar do banco
    let roomToUse = currentRoom;
    
    if (!user) {
      console.log('❌ [ANSWER QUESTION] Usuário não encontrado');
      return;
    }
    
    if (!roomToUse) {
      console.log('❌ [ANSWER QUESTION] currentRoom não encontrado, carregando do banco...');
      console.log('❌ [ANSWER QUESTION] user existe:', !!user);
      console.log('❌ [ANSWER QUESTION] currentRoom existe:', !!currentRoom);
      
      try {
        const { data: roomData, error } = await (supabase as any)
          .from('pvp_rooms')
          .select('*')
          .eq('id', roomId)
          .single();
          
        if (error) {
          console.error('❌ [ANSWER QUESTION] Erro ao carregar sala:', error);
          return;
        }
        
        if (roomData) {
          console.log('✅ [ANSWER QUESTION] Sala carregada do banco:', roomData);
          roomToUse = roomData;
          // Atualizar o estado para futuras chamadas
          setCurrentRoom(roomData);
          console.log('🔄 [ANSWER QUESTION] roomToUse definido como:', roomToUse?.id);
        } else {
          console.log('❌ [ANSWER QUESTION] Sala não encontrada no banco');
          return;
        }
      } catch (error) {
        console.error('❌ [ANSWER QUESTION] Erro ao tentar carregar sala:', error);
        return;
      }
    }
    
    console.log('🚀 [ANSWER QUESTION] Saindo do bloco de carregamento, roomToUse:', roomToUse?.id);
    
    // Usar a sala carregada (seja do estado ou do banco)
    console.log('🎯 [ANSWER QUESTION] Usando sala:', roomToUse?.id);
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🎯 [ANSWER QUESTION] Respondendo pergunta ${questionIndex + 1}, resposta ${answerIndex + 1}, tempo: ${timeTaken}s`);
      console.log(`👤 [ANSWER QUESTION] Usuário: ${user.id}`);
      console.log(`🏠 [ANSWER QUESTION] Sala: ${roomId}`);
      console.log(`📊 [ANSWER QUESTION] current_question atual: ${roomToUse.current_question}`);
      console.log(`📊 [ANSWER QUESTION] questionIndex recebido: ${questionIndex}`);
      console.log(`📊 [ANSWER QUESTION] Total de perguntas: ${roomToUse.questions?.length || 0}`);
      
      // 🚫 VERIFICAR SE O JOGO JÁ TERMINOU
      if (roomToUse.status === 'finished') {
        console.log('🏁 [ANSWER QUESTION] Jogo já finalizado - ignorando resposta');
        return;
      }
      
      // 🚫 REMOVIDO: Limitação que impedia as 25 perguntas
      
      // 🚨 VERIFICAÇÃO DE SEGURANÇA: Verificar se temos perguntas suficientes
      if (!roomToUse.questions || roomToUse.questions.length === 0) {
        console.error(`❌ [ANSWER QUESTION] Sala sem perguntas!`);
        setError('Sala sem perguntas disponíveis');
        return;
      }
      
      // 🚨 VERIFICAÇÃO DE SEGURANÇA: Verificar se o índice está dentro do array
      if (questionIndex < 0 || questionIndex >= roomToUse.questions.length) {
        console.error(`❌ [ANSWER QUESTION] Índice fora do range!`);
        console.error(`❌ [ANSWER QUESTION] questionIndex: ${questionIndex}, Total perguntas: ${roomToUse.questions.length}`);
        console.error(`❌ [ANSWER QUESTION] current_question da sala: ${roomToUse.current_question}`);
        console.error(`❌ [ANSWER QUESTION] Perguntas disponíveis:`, roomToUse.questions.map((q, i) => `${i}: ${q.question?.substring(0, 50)}`));
        
        // 🚨 CORREÇÃO AUTOMÁTICA: Se temos poucas perguntas, regenerar a sala
        if (roomToUse.questions.length < 25) {
          console.log(`🔄 [ANSWER QUESTION] Sala com apenas ${roomToUse.questions.length} perguntas - regenerando...`);
          const regenerated = await regenerateRoomQuestions(roomId);
          if (regenerated) {
            console.log(`✅ [ANSWER QUESTION] Sala regenerada com sucesso!`);
            
      // 🔄 FORÇAR RECARREGAMENTO DA SALA PARA ATUALIZAR PERGUNTAS
      console.log(`🔄 [ANSWER QUESTION] Recarregando sala para atualizar perguntas...`);
      const { data: updatedRoomData } = await (supabase as any)
        .from('pvp_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (updatedRoomData) {
        console.log(`✅ [ANSWER QUESTION] Sala recarregada com ${updatedRoomData.questions?.length} perguntas!`);
        console.log(`🔄 [ANSWER QUESTION] Scores após recarregamento:`, {
          player1_score: updatedRoomData.player1_score,
          player2_score: updatedRoomData.player2_score,
          current_question: updatedRoomData.current_question
        });
        setCurrentRoom(updatedRoomData);
        console.log(`🔄 [ANSWER QUESTION] Estado atualizado com novas perguntas e scores!`);
      }
            
            setError('Sala regenerada automaticamente - continue jogando!');
            return;
          } else {
            console.error(`❌ [ANSWER QUESTION] Falha ao regenerar sala`);
            setError('Falha ao regenerar sala');
            return;
          }
        } else {
          // 🚨 CORREÇÃO AUTOMÁTICA: Ajustar current_question para o último índice válido
          const maxValidIndex = roomToUse.questions.length - 1;
          console.log(`🔧 [ANSWER QUESTION] Ajustando current_question de ${roomToUse.current_question} para ${maxValidIndex + 1}`);
          
          await (supabase as any)
            .from('pvp_rooms')
            .update({ current_question: maxValidIndex + 1 })
            .eq('id', roomId);
          
          setError('Pergunta ajustada automaticamente');
          return;
        }
      }
      
      // Verificar se a resposta está correta
      // questionIndex já é baseado em 0, então usar diretamente
      const question = roomToUse.questions?.[questionIndex];
      
      if (!question) {
        console.error(`❌ [ANSWER QUESTION] Pergunta não encontrada no índice ${questionIndex}`);
        console.error(`❌ [ANSWER QUESTION] Total de perguntas: ${roomToUse.questions?.length || 0}`);
        console.error(`❌ [ANSWER QUESTION] Perguntas disponíveis:`, roomToUse.questions);
        console.error(`❌ [ANSWER QUESTION] roomToUse.questions é:`, typeof roomToUse.questions);
        setError('Pergunta não encontrada');
        return;
      }
      
      const isCorrect = answerIndex === question.correct_answer;
      const points = isCorrect ? 1 : 0;
      
      console.log(`✅ [ANSWER QUESTION] Resposta ${isCorrect ? 'CORRETA' : 'INCORRETA'} - Pontos: ${points}`);
      console.log(`🔍 [ANSWER QUESTION] Resposta escolhida: ${answerIndex}, Resposta correta: ${question.correct_answer}`);
      console.log(`🔍 [ANSWER QUESTION] Pergunta: ${question.question}`);
      
      // Registrar resposta
      const { error } = await (supabase as any)
        .from('pvp_moves')
        .insert({
          room_id: roomId,
          user_id: user.id,
          question_number: questionIndex + 1,
          question_index: questionIndex,
          answer_index: answerIndex,
          answer: `Resposta ${answerIndex + 1}`,
          is_correct: isCorrect,
          time_taken: timeTaken,
          answered_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('❌ [ANSWER QUESTION] Erro ao responder pergunta:', error);
        setError('Erro ao responder pergunta');
        return;
      }
      
      console.log('✅ [ANSWER QUESTION] Resposta registrada com sucesso');
      
      // 🎯 NOVA LÓGICA: Se jogador erra, oponente ganha ponto
      const isPlayer1 = user.id === roomToUse.player1_id;
      const playerField = isPlayer1 ? 'player1_score' : 'player2_score';
      const opponentField = isPlayer1 ? 'player2_score' : 'player1_score';
      
      let updateData: any = {};
      
      if (isCorrect) {
        // Jogador acertou - ganha ponto
        const currentScore = isPlayer1 ? roomToUse.player1_score : roomToUse.player2_score;
        updateData[playerField] = currentScore + 1;
        console.log(`✅ [ANSWER QUESTION] Jogador acertou! Atualizando ${playerField}: ${currentScore} → ${currentScore + 1}`);
      } else {
        // Jogador errou - oponente ganha ponto
        const opponentScore = isPlayer1 ? roomToUse.player2_score : roomToUse.player1_score;
        updateData[opponentField] = opponentScore + 1;
        console.log(`❌ [ANSWER QUESTION] Jogador errou! Oponente ganha ponto. Atualizando ${opponentField}: ${opponentScore} → ${opponentScore + 1}`);
      }
      
      // 🚀 ATUALIZAÇÃO ÚNICA E COMPLETA - EVITAR RACE CONDITIONS
      console.log(`🚀 [ANSWER QUESTION] Avançando para próxima pergunta IMEDIATAMENTE...`);
      
      // 🎮 MUDAR STATUS PARA 'playing' SE AINDA ESTIVER 'waiting'
      const nextQuestionIndex = questionIndex + 1; // questionIndex é baseado em 0, então +1 para próxima pergunta
      
      // 🚨 VALIDAÇÃO CRÍTICA: Verificar se não ultrapassa o limite de perguntas
      // 🎯 CORREÇÃO: Usar current_question atual em vez de nextQuestionIndex
      const maxQuestions = 25; // Sempre 25 perguntas
      const currentQuestionNumber = roomToUse.current_question || 1;
      
      console.log(`🔍 [FINALIZATION DEBUG] Verificando finalização:`);
      console.log(`🔍 [FINALIZATION DEBUG] current_question: ${currentQuestionNumber}`);
      console.log(`🔍 [FINALIZATION DEBUG] maxQuestions: ${maxQuestions}`);
      console.log(`🔍 [FINALIZATION DEBUG] current_question >= maxQuestions: ${currentQuestionNumber >= maxQuestions}`);
      console.log(`🔍 [FINALIZATION DEBUG] roomToUse.status: ${roomToUse.status}`);
      
      if (currentQuestionNumber >= maxQuestions) {
        console.log(`🏁 [ANSWER QUESTION] Jogo finalizado! Chegou no limite de perguntas (${maxQuestions})`);
        console.log(`🏁 [ANSWER QUESTION] current_question: ${currentQuestionNumber}, maxQuestions: ${maxQuestions}`);
        updateData.status = 'finished';
        updateData.finished_at = new Date().toISOString();
        updateData.current_question = maxQuestions; // Manter no último índice válido
        
        console.log('🚨 [FINALIZATION] FORÇANDO FINALIZAÇÃO IMEDIATA DO JOGO!');
        console.log('🚨 [FINALIZATION] Status mudando de "playing" para "finished"');
        
        // 🏆 DETERMINAR VENCEDOR BASEADO EM PONTUAÇÃO
        const isPlayer1 = user.id === roomToUse.player1_id;
        const player1Score = isPlayer1 ? updateData.player1_score : roomToUse.player1_score;
        const player2Score = isPlayer1 ? roomToUse.player2_score : updateData.player2_score;
        
        console.log(`🏆 [FINALIZATION] Scores finais - Player1: ${player1Score}, Player2: ${player2Score}`);
        
        let winnerId = null;
        if (player1Score > player2Score) {
          winnerId = roomToUse.player1_id;
          console.log(`🏆 [FINALIZATION] Player1 venceu com ${player1Score} pontos!`);
        } else if (player2Score > player1Score) {
          winnerId = roomToUse.player2_id;
          console.log(`🏆 [FINALIZATION] Player2 venceu com ${player2Score} pontos!`);
        } else {
          console.log(`🤝 [FINALIZATION] Empate! Ambos com ${player1Score} pontos`);
        }
        
        updateData.winner_id = winnerId;
        
        console.log(`🏆 [ANSWER QUESTION] Partida finalizada com vencedor: ${updateData.winner_id}`);
        
        // 💰 TRANSFERIR PONTOS PARA CARTEIRA DOS JOGADORES (FUNÇÃO SQL PROFISSIONAL)
        console.log('💰 [WALLET] Iniciando transferência de pontos para carteira...');
        try {
          const { error } = await (supabase as any).rpc("transfer_pvp_points", {
            room_id: roomId
          });
          
          if (error) {
            console.error('❌ [WALLET] Erro na função SQL:', error);
            throw error;
          }
          
          console.log('✅ [WALLET] Pontos transferidos com sucesso via função SQL!');
        } catch (error) {
          console.error('❌ [WALLET] Erro ao transferir pontos:', error);
        }
      } else {
        // 🎯 CORREÇÃO: Incrementar current_question em vez de usar nextQuestionIndex
        const newCurrentQuestion = (roomToUse.current_question || 1) + 1;
        updateData.current_question = newCurrentQuestion;
        console.log(`🚀 [ANSWER QUESTION] Avançando de pergunta ${roomToUse.current_question || 1} para ${newCurrentQuestion}`);
      }
      
      // 🎮 MUDAR STATUS PARA 'playing' SE AINDA ESTIVER 'waiting' (apenas se não finalizou)
      if (roomToUse.status === 'waiting' && updateData.status !== 'finished') {
        console.log('🎮 [ANSWER QUESTION] Mudando status de waiting para playing!');
        updateData.status = 'playing';
        // Removido started_at - coluna não existe na tabela
        console.log('🕐 [ANSWER QUESTION] Status mudado para playing (sem started_at)');
      }
      
      console.log('⚡ [ANSWER QUESTION] DADOS COMPLETOS PARA ATUALIZAR:', updateData);
      console.log('🎯 [ANSWER QUESTION] Atualizando sala no banco de dados...');
      
      // 🎯 ATUALIZAÇÃO ÚNICA: PONTUAÇÃO + PERGUNTA + STATUS
      const { error: updateError } = await (supabase as any)
        .from('pvp_rooms')
        .update(updateData)
        .eq('id', roomId);
      
      if (updateError) {
        console.error('❌ [ANSWER QUESTION] Erro ao atualizar sala:', updateError);
        console.error('❌ [ANSWER QUESTION] Dados que causaram erro:', updateData);
        return;
      }
      
      console.log(`✅ [ANSWER QUESTION] Banco atualizado com sucesso!`);
      console.log(`📊 [ANSWER QUESTION] Pontuação:`, updateData);
      console.log(`🚀 [ANSWER QUESTION] Pergunta avançada para: ${nextQuestionIndex}`);
      console.log(`🎯 [ANSWER QUESTION] Retornando sucesso da função`);
      console.log(`🔄 [ANSWER QUESTION] REAL-TIME DEVE DISPARAR AGORA PARA O OPONENTE!`);
      console.log(`🔄 [ANSWER QUESTION] O oponente deve receber a atualização via listener!`);
      
      // 🔍 DEBUG: Verificar se a pontuação foi atualizada corretamente
      if (isCorrect) {
        console.log(`✅ [DEBUG] JOGADOR ACERTOU - Pontuação atualizada para ${playerField}:`, updateData[playerField]);
      } else {
        console.log(`❌ [DEBUG] JOGADOR ERROU - Oponente ganhou ponto em ${opponentField}:`, updateData[opponentField]);
        console.log(`🎯 [DEBUG] O oponente deveria ver o ponto na tela agora!`);
      }
      
      // 🎯 ATUALIZAÇÃO ÚNICA DO ESTADO LOCAL
      const updatedRoom = {
        ...roomToUse,
        ...updateData
      };
      
      console.log('🎯 [ANSWER QUESTION] Atualizando estado local...');
      console.log('🎯 [ANSWER QUESTION] Sala atual:', roomToUse);
      console.log('🎯 [ANSWER QUESTION] Dados para atualizar:', updateData);
      console.log('🎯 [ANSWER QUESTION] Sala atualizada:', updatedRoom);
      
      setCurrentRoom(updatedRoom);
      console.log('🔄 [ANSWER QUESTION] Estado local atualizado com sucesso');
      
      // Verificar se é a última pergunta e finalizar partida
      if (questionIndex >= roomToUse.questions.length - 1) {
        console.log('🏁 [ANSWER QUESTION] Última pergunta respondida - finalizando partida...');
        
        // Aguardar um pouco para sincronizar com o oponente
        setTimeout(async () => {
          try {
            // Buscar pontuação final atualizada
            const { data: finalRoom } = await (supabase as any)
              .from('pvp_rooms')
              .select('*')
              .eq('id', roomId)
              .single();
            
            if (finalRoom) {
              // 🔍 VERIFICAR CONSISTÊNCIA DOS SCORES
              console.log(`🔍 [FINAL SCORE] Verificando consistência dos scores:`, {
                roomToUse: {
                  player1_score: roomToUse.player1_score,
                  player2_score: roomToUse.player2_score
                },
                finalRoom: {
                  player1_score: finalRoom.player1_score,
                  player2_score: finalRoom.player2_score
                }
              });
              
              // Determinar vencedor usando os dados mais atualizados
              let winnerId = null;
              if (finalRoom.player1_score > finalRoom.player2_score) {
                winnerId = finalRoom.player1_id;
              } else if (finalRoom.player2_score > finalRoom.player1_score) {
                winnerId = finalRoom.player2_id;
              }
              
              console.log(`🏆 [ANSWER QUESTION] Pontuação final - P1: ${finalRoom.player1_score}, P2: ${finalRoom.player2_score}`);
              console.log(`🏆 [ANSWER QUESTION] Vencedor: ${winnerId || 'EMPATE'}`);
              console.log(`🏆 [ANSWER QUESTION] Dados da sala final:`, {
                id: finalRoom.id,
                player1_id: finalRoom.player1_id,
                player2_id: finalRoom.player2_id,
                player1_score: finalRoom.player1_score,
                player2_score: finalRoom.player2_score,
                current_question: finalRoom.current_question,
                status: finalRoom.status
              });
              
              // Finalizar partida
              await (supabase as any)
                .from('pvp_rooms')
                .update({
                  status: 'finished',
                  winner_id: winnerId
                })
                .eq('id', roomId);
              
              console.log('🏆 [ANSWER QUESTION] Partida finalizada com vencedor:', winnerId);
            }
          } catch (err) {
            console.error('❌ [ANSWER QUESTION] Erro ao finalizar partida:', err);
          }
        }, 2000); // Aguardar 2 segundos para sincronização
      }
      
    } catch (err) {
      console.error('❌ [ANSWER QUESTION] Erro ao responder pergunta:', err);
      setError('Erro ao responder pergunta');
    } finally {
      setLoading(false);
    }
  }, [user, currentRoom]);

  // Função para determinar vencedor
  const determineWinner = useCallback(async (roomId: string) => {
    if (!user) return null;
    
    try {
      console.log('🏆 [DETERMINE WINNER] Determinando vencedor da sala:', roomId);
      
      const { data: roomData, error } = await (supabase as any)
        .from('pvp_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (error || !roomData) {
        console.error('❌ [DETERMINE WINNER] Erro ao buscar sala:', error);
        return null;
      }
      
      let winnerId = null;
      if (roomData.player1_score > roomData.player2_score) {
        winnerId = roomData.player1_id;
      } else if (roomData.player2_score > roomData.player1_score) {
        winnerId = roomData.player2_id;
      }
      
      console.log(`🏆 [DETERMINE WINNER] Pontuação final - P1: ${roomData.player1_score}, P2: ${roomData.player2_score}`);
      console.log(`🏆 [DETERMINE WINNER] Vencedor: ${winnerId || 'EMPATE'}`);
      console.log(`🏆 [DETERMINE WINNER] Dados da sala para determinação:`, {
        id: roomData.id,
        player1_id: roomData.player1_id,
        player2_id: roomData.player2_id,
        player1_score: roomData.player1_score,
        player2_score: roomData.player2_score,
        current_question: roomData.current_question,
        status: roomData.status
      });
      
      return winnerId;
    } catch (err) {
      console.error('❌ [DETERMINE WINNER] Erro ao determinar vencedor:', err);
      return null;
    }
  }, [user]);

  // Função para processar resultado da batalha
  const processBattleResult = useCallback(async (roomId: string) => {
    if (!user) return;
    
    try {
      console.log('🎮 [PROCESS BATTLE RESULT] Processando resultado da batalha:', roomId);
      
      const { data: roomData, error } = await (supabase as any)
        .from('pvp_rooms')
        .select('*')
        .eq('id', roomId)
        .single();
      
      if (error || !roomData) {
        console.error('❌ [PROCESS BATTLE RESULT] Erro ao buscar sala:', error);
        return;
      }
      
      const isPlayer1 = user.id === roomData.player1_id;
      const isWinner = roomData.winner_id === user.id;
      const isDraw = !roomData.winner_id;
      
      console.log(`🎮 [PROCESS BATTLE RESULT] Resultado para usuário ${user.id}:`);
      console.log(`🎮 [PROCESS BATTLE RESULT] É Player1: ${isPlayer1}`);
      console.log(`🎮 [PROCESS BATTLE RESULT] É Vencedor: ${isWinner}`);
      console.log(`🎮 [PROCESS BATTLE RESULT] É Empate: ${isDraw}`);
      
      // 💰 PROCESSAR CRÉDITOS DA BATALHA
      console.log('💰 [PROCESS BATTLE RESULT] Processando créditos da batalha...');
      const creditsResult = await processPvPBattleCredits(
        roomId,
        roomData.winner_id,
        roomData.player1_id,
        roomData.player2_id
      );
      
      if (creditsResult.success) {
        console.log('✅ [PROCESS BATTLE RESULT] Créditos processados com sucesso:', creditsResult.results);
      } else {
        console.error('❌ [PROCESS BATTLE RESULT] Erro ao processar créditos:', creditsResult.error);
      }
      
      return {
        isWinner,
        isDraw,
        playerScore: isPlayer1 ? roomData.player1_score : roomData.player2_score,
        opponentScore: isPlayer1 ? roomData.player2_score : roomData.player1_score,
        creditsProcessed: creditsResult.success,
        creditsResult: creditsResult.results
      };
      
    } catch (err) {
      console.error('❌ [PROCESS BATTLE RESULT] Erro ao processar resultado:', err);
      return null;
    }
  }, [user]);

  // Função para forçar refresh da fila
  const forceRefreshQueue = useCallback(async () => {
    console.log('🔄 [FORCE REFRESH] Forçando atualização da fila...');
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('pvp_queue')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('❌ [FORCE REFRESH] Erro:', error);
        setError(error.message);
        return;
      }
      
      console.log('✅ [FORCE REFRESH] Fila atualizada:', data?.length || 0, 'jogadores');
      updateQueueState(data || []);
      setError(null);
    } catch (err) {
      console.error('❌ [FORCE REFRESH] Erro:', err);
      setError('Erro ao atualizar fila');
    } finally {
      setLoading(false);
    }
  }, [updateQueueState]);

  // --- NOVO: sincronização manual da sala ---
  const setActiveRoom = useCallback((room: any) => {
    if (!room) return;
    console.log("⚡ [SYNC] Sala ativa definida no hook:", room.id);
    setCurrentRoom(room);
  }, []);

  // 🎯 FORÇAR SINCRONIZAÇÃO VISUAL DA SALA
  const forceSyncRoom = useCallback(async (roomId: string) => {
    if (!user) return;

    try {
      console.log('🔄 [FORCE SYNC] Forçando sincronização visual da sala:', roomId);
      
      const { data: room, error } = await (supabase as any)
        .from('pvp_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) throw error;

      if (room) {
        console.log('✅ [FORCE SYNC] Sala sincronizada:', {
          id: room.id,
          status: room.status,
          current_question: room.current_question,
          player1_score: room.player1_score,
          player2_score: room.player2_score
        });
        
        // 🚀 FORÇAR RE-RENDER VISUAL
        setCurrentRoom({ ...room, _forceUpdate: Date.now() });
        console.log('🎯 [FORCE SYNC] Re-render visual forçado!');
      }
    } catch (error) {
      console.error('❌ [FORCE SYNC] Erro ao sincronizar sala:', error);
    }
  }, [user]);

  return {
    allQueue, // TODOS os jogadores na fila
    others, // Apenas outros jogadores
    queue: allQueue, // Compatibilidade com código existente
    currentRoom,
    setActiveRoom, // exporta o novo método
    confirmations,
    loading,
    error,
    countdown,
    isConfirming,
    creditsRemaining,
    creditsUsed: 0, // Placeholder
    maxCredits: 10, // Placeholder
    creditsLoading: false, // Placeholder
    joinQueue,
    leaveQueue,
    confirmBattle,
    clearBattleState,
    clearAllState,
    forceRedirectToLobby,
    regenerateRoomQuestions,
    cleanupDuplicateQueueEntries,
    fetchQueue,
    forceRefreshQueue,
    runMatchmaking,
    answerQuestion,
    forceSyncRoom,
    determineWinner,
    processBattleResult,
    totalCount: allQueue.length, // Total de jogadores na fila
    isInQueue: allQueue.some(q => q.user_id === user?.id) // Se o usuário está na fila
  };
};
