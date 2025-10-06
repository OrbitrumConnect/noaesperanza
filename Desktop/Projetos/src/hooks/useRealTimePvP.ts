import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PvPRoom {
  id: string;
  player1_id: string;
  player2_id: string;
  status: 'waiting' | 'playing' | 'finished';
  current_question: number;
  player1_score: number;
  player2_score: number;
  questions: any[];
  player1_answers: any[];
  player2_answers: any[];
  winner_id?: string;
  created_at: string;
}

interface PvPMove {
  id: string;
  room_id: string;
  user_id: string;
  question_number: number;
  answer_index: number;
  is_correct: boolean;
  time_taken: number;
  answered_at: string;
}

export const useRealTimePvP = () => {
  const { user } = useAuth();
  const [currentRoom, setCurrentRoom] = useState<PvPRoom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameState, setGameState] = useState<{
    currentQuestion: number;
    timeLeft: number;
    player1Score: number;
    player2Score: number;
    gamePhase: 'waiting' | 'playing' | 'finished';
    winner: 'player1' | 'player2' | 'draw' | null;
  }>({
    currentQuestion: 0,
    timeLeft: 30,
    player1Score: 0,
    player2Score: 0,
    gamePhase: 'waiting',
    winner: null
  });

  // 🎯 CONFIGURAÇÃO REAL-TIME
  useEffect(() => {
    if (!currentRoom || !user) return;

    console.log('🔄 Configurando real-time para sala:', currentRoom.id);

    // Canal para mudanças na sala
    const roomChannel = supabase
      .channel(`pvp_room_${currentRoom.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'pvp_rooms',
        filter: `id=eq.${currentRoom.id}`
      }, (payload) => {
        console.log('📡 Atualização da sala recebida:', payload);
        const updatedRoom = payload.new as PvPRoom;
        setCurrentRoom(updatedRoom);
        
        // Atualizar estado do jogo
        setGameState(prev => ({
          ...prev,
          currentQuestion: updatedRoom.current_question,
          player1Score: updatedRoom.player1_score,
          player2Score: updatedRoom.player2_score,
          gamePhase: updatedRoom.status as any,
          winner: updatedRoom.winner_id ? 
            (updatedRoom.winner_id === updatedRoom.player1_id ? 'player1' : 'player2') : 
            null
        }));

        // Se a partida terminou, processar resultado
        if (updatedRoom.status === 'finished') {
          console.log('🏁 Partida finalizada!');
          processGameResult(updatedRoom);
        }
      })
      .subscribe();

    // Canal para movimentos dos jogadores
    const movesChannel = supabase
      .channel(`pvp_moves_${currentRoom.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pvp_moves',
        filter: `room_id=eq.${currentRoom.id}`
      }, (payload) => {
        console.log('🎮 Movimento recebido:', payload);
        const move = payload.new as PvPMove;
        
        // Atualizar pontuação em tempo real
        updateScoreFromMove(move);
      })
      .subscribe();

    return () => {
      roomChannel.unsubscribe();
      movesChannel.unsubscribe();
    };
  }, [currentRoom, user]);

  // 🎯 ATUALIZAR PONTUAÇÃO BASEADA NO MOVIMENTO
  const updateScoreFromMove = useCallback((move: PvPMove) => {
    if (!currentRoom) return;

    const isPlayer1 = move.user_id === currentRoom.player1_id;
    const points = move.is_correct ? 1 : 0;

    setGameState(prev => ({
      ...prev,
      player1Score: isPlayer1 ? prev.player1Score + points : prev.player1Score,
      player2Score: !isPlayer1 ? prev.player2Score + points : prev.player2Score
    }));
  }, [currentRoom]);

  // 🎯 PROCESSAR RESULTADO DO JOGO
  const processGameResult = useCallback((room: PvPRoom) => {
    if (!user) return;

    const isPlayer1 = user.id === room.player1_id;
    const myScore = isPlayer1 ? room.player1_score : room.player2_score;
    const opponentScore = isPlayer1 ? room.player2_score : room.player1_score;

    let result: 'victory' | 'defeat' | 'draw' = 'draw';
    if (myScore > opponentScore) result = 'victory';
    else if (myScore < opponentScore) result = 'defeat';

    console.log('🏆 Resultado final:', { myScore, opponentScore, result });

    // Atualizar estado final
    setGameState(prev => ({
      ...prev,
      gamePhase: 'finished',
      winner: result
    }));

    // Retornar ao lobby após 5 segundos
    setTimeout(() => {
      console.log('🔄 Retornando ao lobby...');
      setCurrentRoom(null);
      setGameState({
        currentQuestion: 0,
        timeLeft: 30,
        player1Score: 0,
        player2Score: 0,
        gamePhase: 'waiting',
        winner: null
      });
    }, 5000);
  }, [user]);

  // 🎯 RESPONDER PERGUNTA COM SINCRONIZAÇÃO
  const answerQuestion = useCallback(async (questionIndex: number, answerIndex: number, timeTaken: number) => {
    if (!user || !currentRoom) return;

    try {
      console.log(`🎯 Respondendo pergunta ${questionIndex + 1}, resposta ${answerIndex + 1}`);

      // Verificar se a resposta está correta
      const question = currentRoom.questions[questionIndex];
      const isCorrect = answerIndex === question.correct_answer;

      // Registrar movimento no banco
      const { error } = await supabase
        .from('pvp_moves')
        .insert({
          room_id: currentRoom.id,
          user_id: user.id,
          question_number: questionIndex + 1,
          answer_index: answerIndex,
          is_correct: isCorrect,
          time_taken: timeTaken,
          answered_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erro ao registrar resposta:', error);
        setError('Erro ao registrar resposta');
        return;
      }

      console.log('✅ Resposta registrada com sucesso');

      // Atualizar pontuação local imediatamente
      const isPlayer1 = user.id === currentRoom.player1_id;
      const points = isCorrect ? 1 : 0;

      setGameState(prev => ({
        ...prev,
        player1Score: isPlayer1 ? prev.player1Score + points : prev.player1Score,
        player2Score: !isPlayer1 ? prev.player2Score + points : prev.player2Score
      }));

      // Atualizar pontuação no banco
      const updateField = isPlayer1 ? 'player1_score' : 'player2_score';
      const currentScore = isPlayer1 ? gameState.player1Score : gameState.player2Score;
      const newScore = currentScore + points;

      await supabase
        .from('pvp_rooms')
        .update({
          [updateField]: newScore,
          current_question: questionIndex + 1
        })
        .eq('id', currentRoom.id);

      // Verificar se é a última pergunta
      if (questionIndex >= currentRoom.questions.length - 1) {
        console.log('🏁 Última pergunta respondida - finalizando partida...');
        
        // Aguardar um pouco para sincronizar com o oponente
        setTimeout(async () => {
          try {
            // Determinar vencedor
            const finalPlayer1Score = isPlayer1 ? newScore : gameState.player1Score;
            const finalPlayer2Score = !isPlayer1 ? newScore : gameState.player2Score;
            
            let winnerId = null;
            if (finalPlayer1Score > finalPlayer2Score) {
              winnerId = currentRoom.player1_id;
            } else if (finalPlayer2Score > finalPlayer1Score) {
              winnerId = currentRoom.player2_id;
            }

            // Finalizar partida
            await supabase
              .from('pvp_rooms')
              .update({
                status: 'finished',
                winner_id: winnerId,
                player1_score: finalPlayer1Score,
                player2_score: finalPlayer2Score
              })
              .eq('id', currentRoom.id);

            console.log('🏆 Partida finalizada com vencedor:', winnerId);
          } catch (err) {
            console.error('❌ Erro ao finalizar partida:', err);
          }
        }, 2000); // Aguardar 2 segundos para sincronização
      }

    } catch (err) {
      console.error('❌ Erro ao responder pergunta:', err);
      setError('Erro ao responder pergunta');
    }
  }, [user, currentRoom, gameState]);

  // 🎯 INICIAR TIMER SINCRONIZADO
  const startGameTimer = useCallback(() => {
    if (!currentRoom || gameState.gamePhase !== 'playing') return;

    const timer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          // Tempo esgotado - resposta automática
          console.log('⏰ Tempo esgotado para pergunta', prev.currentQuestion);
          
          // Registrar resposta automática (errada)
          answerQuestion(prev.currentQuestion, -1, 30);
          
          // Avançar para próxima pergunta
          const nextQuestion = prev.currentQuestion + 1;
          if (nextQuestion >= (currentRoom?.questions.length || 0)) {
            // Última pergunta - finalizar
            return { ...prev, timeLeft: 0, gamePhase: 'finished' as any };
          } else {
            // Próxima pergunta
            return { ...prev, timeLeft: 30, currentQuestion: nextQuestion };
          }
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRoom, gameState.gamePhase, answerQuestion]);

  // 🎯 INICIAR PARTIDA
  const startGame = useCallback(async (room: PvPRoom) => {
    console.log('🎮 Iniciando partida:', room.id);
    setCurrentRoom(room);
    setGameState({
      currentQuestion: 0,
      timeLeft: 30,
      player1Score: 0,
      player2Score: 0,
      gamePhase: 'playing',
      winner: null
    });
  }, []);

  // 🎯 LIMPAR ESTADO
  const clearGameState = useCallback(() => {
    setCurrentRoom(null);
    setGameState({
      currentQuestion: 0,
      timeLeft: 30,
      player1Score: 0,
      player2Score: 0,
      gamePhase: 'waiting',
      winner: null
    });
    setError(null);
  }, []);

  return {
    currentRoom,
    gameState,
    loading,
    error,
    answerQuestion,
    startGame,
    clearGameState,
    startGameTimer
  };
};