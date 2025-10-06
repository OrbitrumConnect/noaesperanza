import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { usePvPSystem } from '@/hooks/usePvPSystemTemp';
import type { PvPRoom } from '@/types/pvp';
import { processPvPBattleCredits } from '@/utils/pvpCreditsSystem';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  era: string;
}
import { ActionButton } from '@/components/arena/ActionButton';
import { ParticleBackground } from '@/components/ui/particles';
import { PvPAnimations, FireParticles, LightningParticles } from '@/components/arena/PvPAnimations';
import { PvPResult } from '@/components/arena/PvPResult';
import { useToast } from '@/hooks/use-toast';
import supabase from '@/lib/supabase';

// 🎮 MAPA DE PERSONAGENS
const CHARACTERS = {
  1: { 
    name: "O Desconhecido", 
    sprite: "/adversariopvp.gif", 
    color: "red",
    skills: ["Ataque Básico", "Defesa", "Contra-ataque"],
    description: "Guerreiro misterioso"
  },
  2: { 
    name: "Eux Mestre do Saber", 
    sprite: "/heroipvp.gif", 
    color: "blue",
    skills: ["Sabedoria", "Conhecimento", "Iluminação"],
    description: "Mestre da sabedoria"
  }
};

const PvPBattle = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, loading: authLoading } = useAuth();
  const { currentRoom, setActiveRoom, confirmBattle, answerQuestion, processBattleResult, determineWinner, clearBattleState, clearAllState, forceRedirectToLobby } = usePvPSystem();
  const { toast } = useToast();
  
  // TODOS OS HOOKS PRIMEIRO - ANTES DE QUALQUER RETURN CONDICIONAL
  const [localRoom, setLocalRoom] = useState<PvPRoom | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  // REMOVIDO: localCurrentQuestion não utilizado
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | 'draw' | null>(null);
  // Animações de ataque
  const [attackEffect, setAttackEffect] = useState<'player1' | 'player2' | null>(null);
  const [showAttackAnimation, setShowAttackAnimation] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [lastAnswerData, setLastAnswerData] = useState<any>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  
  // 🎮 Estados para animações
  const [showFireEffect, setShowFireEffect] = useState(false);
  const [showLightningEffect, setShowLightningEffect] = useState(false);
  const [fireParticles, setFireParticles] = useState(false);
  const [lightningParticles, setLightningParticles] = useState(false);
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [animationTrigger, setAnimationTrigger] = useState<number>(0);
  const [isExiting, setIsExiting] = useState(false);

  // Sem modo demo - apenas dados reais
  
  // 🎯 FUNÇÃO PARA EMBARALHAR OPÇÕES (IGUAL AO SISTEMA DAS ERAS)
  const shuffleOptions = useCallback((options: string[], correctIndex: number) => {
    const shuffled = [...options];
    let correctAnswer = shuffled[correctIndex];
    
    // Embaralhar o array
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // Encontrar o novo índice da resposta correta
    const newCorrectIndex = shuffled.findIndex(option => option === correctAnswer);
    
    return {
      shuffledOptions: shuffled,
      correctIndex: newCorrectIndex
    };
  }, []);

  // 🎯 SINCRONIZAR ÍNDICE DA PERGUNTA COM A SALA
  useEffect(() => {
    if (localRoom?.questions && localRoom.questions.length > 0) {
      console.log('✅ [QUESTIONS] Definindo índice inicial da pergunta');
      // Converter de 1-based (banco) para 0-based (array JS)
      const initialIndex = Math.max(0, (localRoom.current_question || 1) - 1);
      setCurrentQuestionIndex(initialIndex);
    }
  }, [localRoom]);

  // 🚀 SINCRONIZAR ÍNDICE DA PERGUNTA QUANDO CURRENT_QUESTION MUDAR
  useEffect(() => {
    if (localRoom?.current_question !== undefined) {
      const newIndex = Math.max(0, localRoom.current_question - 1);
      console.log('🔄 [QUESTION SYNC] Sincronizando índice da pergunta:', {
        current_question: localRoom.current_question,
        newIndex: newIndex,
        currentIndex: currentQuestionIndex
      });
      
      if (newIndex !== currentQuestionIndex) {
        console.log('🚀 [QUESTION SYNC] ATUALIZANDO ÍNDICE DA PERGUNTA!');
        setCurrentQuestionIndex(newIndex);
        
        // Resetar estado da resposta quando pergunta muda
        setSelectedAnswer(null);
        setShowAnswerFeedback(false);
        setCorrectAnswerIndex(null);
      }
    }
  }, [localRoom?.current_question, currentQuestionIndex]);

  // 🎯 SINCRONIZAR LOCALROOM COM CURRENTROOM (TEMPO REAL)
  useEffect(() => {
    if (currentRoom && currentRoom.id === roomId) {
      console.log('🔄 [SYNC] Atualizando localRoom com currentRoom:', currentRoom);
      console.log('🚨 [SYNC] VERIFICANDO SINCRONIZAÇÃO...');
      setLocalRoom(currentRoom);
      
      // 🎯 RESETAR ESTADO LOCAL QUANDO NOVA PARTIDA INICIA
      if (currentRoom.status === 'playing' && currentRoom.current_question === 1) {
        console.log('🔄 [RESET] Nova partida iniciada - resetando estado local');
        setCurrentQuestionIndex(0); // Resetar índice da pergunta
        setSelectedAnswer(null); // Limpar resposta selecionada
        setShowAnswerFeedback(false); // Limpar feedback
        setCorrectAnswerIndex(null); // Limpar resposta correta
        
        // 🕐 DEFINIR STARTED_AT QUANDO AMBOS ESTIVEREM NA TELA (APENAS PLAYER1)
        if (!(currentRoom as any).started_at) {
          // const isPlayer1 = user?.id === currentRoom.player1_id; // REMOVIDO: já declarado no topo
          
          if (isPlayer1) {
            console.log('🕐 [TIMER START] Player1 definindo started_at para ambos');
            const battleStartTime = new Date().toISOString();
            console.log('🕐 [TIMER START] Timestamp atual (ms):', new Date().getTime());
            console.log('🕐 [TIMER START] Usuário:', user?.id);
            
            // Atualizar no banco
        (supabase as any)
          .from('pvp_rooms')
          .update({ started_at: battleStartTime })
          .eq('id', roomId)
              .then(() => {
                console.log('🕐 [TIMER START] started_at definido no banco:', battleStartTime);
                console.log('🕐 [TIMER START] Timestamp salvo (ms):', new Date(battleStartTime).getTime());
              });
      } else {
            console.log('🕐 [TIMER START] Player2 aguardando started_at do Player1');
          }
        }
      }
    }
  }, [currentRoom, roomId]);

  // 🎯 FORÇAR ATUALIZAÇÃO APENAS QUANDO NECESSÁRIO - SEM PISCAR
  useEffect(() => {
    if (currentRoom) {
      console.log('🔄 [FORCE UPDATE] currentRoom mudou, atualizando...', {
        player1_score: currentRoom?.player1_score,
        player2_score: currentRoom?.player2_score,
        current_question: currentRoom?.current_question,
        status: currentRoom?.status,
        roomId: currentRoom?.id,
        _lastUpdate: (currentRoom as any)?._lastUpdate
      });
      console.log('🚀 [FORCE UPDATE] FORÇANDO RE-RENDER DA INTERFACE!');
      console.log('🎯 [FORCE UPDATE] Scores que serão exibidos:', {
        player1Score: currentRoom?.player1_score || 0,
        player2Score: currentRoom?.player2_score || 0
      });
      
      // 🚨 FORÇAR ATUALIZAÇÃO IMEDIATA
      setForceUpdate(prev => {
        const newValue = prev + 1;
        console.log('🚀 [FORCE UPDATE] forceUpdate mudou de', prev, 'para', newValue);
        console.log('🎯 [FORCE UPDATE] INTERFACE DEVE ATUALIZAR AGORA!');
        return newValue;
      });
      
      // 🚨 FORÇAR RE-RENDER ADICIONAL PARA GARANTIR
      setTimeout(() => {
        setForceUpdate(prev => prev + 0.1);
        console.log('🚀 [FORCE UPDATE] Re-render adicional forçado!');
      }, 100);
    }
  }, [currentRoom]); // 🎯 CORREÇÃO: Depender do objeto inteiro, não de propriedades específicas

  // 🚨 REMOVIDO: Timer que causava piscar da tela

  // --- NOVO: sincronizar com hook ---
  useEffect(() => {
    if (localRoom) {
      console.log("⚡ [SYNC] Enviando sala do PvPBattle para o hook:", localRoom.id);
      setActiveRoom(localRoom);
    }
  }, [localRoom, setActiveRoom]);

  // 🎯 CARREGAR PERGUNTAS DA SALA (SINCRONIZADAS)
  useEffect(() => {
    // Só carregar perguntas se o usuário estiver autenticado
    if (!user) {
      console.log('👤 [QUESTIONS] Usuário não autenticado - pulando carregamento');
      return;
    }

    // Evitar múltiplos carregamentos se já carregamos ou estamos carregando
    if (questionsLoaded || isLoadingQuestions) {
      console.log('🔄 [QUESTIONS] Perguntas já carregadas ou carregando - pulando carregamento');
      return;
    }

    // 🛡️ PROTEÇÃO CONTRA LOOP INFINITO
    if (questions && questions.length > 0) {
      console.log('✅ [QUESTIONS] Perguntas já disponíveis no estado - pulando carregamento');
      return;
    }

    // Só carregar se temos localRoom E a sala não está em 'waiting'
    if (!localRoom) {
      console.log('🔄 [QUESTIONS] localRoom não disponível - carregando perguntas aleatórias...');
      
      // Carregar perguntas aleatórias quando não há sala
      setIsLoadingQuestions(true);
      
      const fetchRandomQuestions = async () => {
        try {
          const { data: questionsData, error } = await supabase
            .from('knowledge_items')
            .select('*')
            .limit(25);
          
          if (error) {
            console.error('❌ [QUESTIONS] Erro ao buscar perguntas:', error);
            return;
          }
          
          if (questionsData && questionsData.length > 0) {
            console.log('✅ [QUESTIONS] Perguntas aleatórias carregadas:', questionsData.length);
            
            // 🎯 FORMATAR PERGUNTAS PARA O FORMATO ESPERADO
            const formattedQuestions = questionsData.map((item: any) => {
              const wrongOptions = Array.isArray(item.wrong_options) ? item.wrong_options : [];
              const correctAnswer = item.correct_answer;
              const options = [correctAnswer, ...wrongOptions].slice(0, 4);
              
              // Embaralhar opções para cada pergunta
              const shuffledOptions = options.sort(() => Math.random() - 0.5);
              const correctIndex = shuffledOptions.findIndex(option => option === correctAnswer);
              
              return {
                id: item.id,
                question: item.question,
                options: shuffledOptions,
                correct_answer: correctIndex,
                era: item.era_id || 'Geral'
              };
            });
            
            console.log('✅ [QUESTIONS] Perguntas formatadas:', formattedQuestions.length);
            console.log('🔍 [DEBUG] Primeira pergunta formatada:', formattedQuestions[0]);
            setQuestions(formattedQuestions);
            setQuestionsLoaded(true);
          }
        } catch (error) {
          console.error('❌ [QUESTIONS] Erro ao buscar perguntas:', error);
        } finally {
          setIsLoadingQuestions(false);
        }
      };
      
      fetchRandomQuestions();
      return;
    }

    // 🛡️ GARANTIR QUE A SALA ESTÁ PRONTA (não em 'waiting')
    if (localRoom.status === 'waiting') {
      const waitingTime = Date.now() - new Date(localRoom.created_at).getTime();
      console.log('🔄 [QUESTIONS] Sala ainda em waiting - aguardando sincronização...');
      console.log('⏳ [QUESTIONS] Aguardando pergunta inicial...');
      console.log(`⏱️ [QUESTIONS] Tempo de espera: ${Math.round(waitingTime / 1000)}s`);
      
      // 🚨 TIMEOUT DE SEGURANÇA - 10 segundos (reduzido)
      if (waitingTime > 10000) {
        console.log('⚠️ [QUESTIONS] Timeout de sincronização - forçando carregamento de perguntas');
        console.log('🔄 [QUESTIONS] Carregando perguntas aleatórias como fallback...');
        // Não retornar aqui - continuar para carregar perguntas
      } else {
        return; // Ainda aguardando sincronizaçãoqu
      }
    }

    // 🛡️ GARANTIR QUE TEMOS PERGUNTAS VÁLIDAS
    if (!localRoom.questions || localRoom.questions.length === 0) {
      console.log('🔄 [QUESTIONS] Sala sem perguntas válidas - carregando perguntas aleatórias...');
      // Não retornar - continuar para carregar perguntas aleatórias
    }

    // 🛡️ VERIFICAR SE AS PERGUNTAS NÃO SÃO CORROMPIDAS
    const firstQuestion = localRoom.questions?.[0];
    if (firstQuestion && (firstQuestion.question === 'Pergunta 1' || firstQuestion.question?.includes('Pergunta'))) {
      console.log('⚠️ [QUESTIONS] Perguntas corrompidas detectadas - carregando perguntas aleatórias...');
      // Não retornar - continuar para carregar perguntas aleatórias
    }

    const loadQuestionsFromRoom = async () => {
      console.log('🔄 [QUESTIONS] Iniciando carregamento...');
      setIsLoadingQuestions(true);
      
      console.log('🔄 [QUESTIONS] localRoom:', localRoom);
      console.log('🔍 [DEBUG] localRoom.questions:', localRoom?.questions);
      console.log('🔍 [DEBUG] localRoom.questions length:', localRoom?.questions?.length);
      
      // 🎯 USAR PERGUNTAS DA SALA (QUE SÃO DO BANCO DE DADOS)
      if (localRoom?.questions && localRoom.questions.length > 0) {
        // Verificar se as perguntas não são corrompidas
        const firstQuestion = localRoom.questions[0];
        if (firstQuestion && !(firstQuestion.question === 'Pergunta 1' || firstQuestion.question?.includes('Pergunta'))) {
          console.log('✅ [QUESTIONS] Usando perguntas da sala (do banco):', localRoom.questions.length);
          console.log('✅ [QUESTIONS] Primeira pergunta da sala:', localRoom.questions[0]);
          
          // 🚨 FORÇAR 25 PERGUNTAS - REPETIR SE NECESSÁRIO
          let finalQuestions = [...localRoom.questions];
          if (finalQuestions.length < 25) {
            console.log('🚨 [FORCE] Expandindo para 25 perguntas!');
            while (finalQuestions.length < 25) {
              const randomIndex = Math.floor(Math.random() * localRoom.questions.length);
              finalQuestions.push({
                ...localRoom.questions[randomIndex],
                id: `${localRoom.questions[randomIndex].id}_${finalQuestions.length}`,
                question: `${localRoom.questions[randomIndex].question} (${Math.floor(finalQuestions.length / localRoom.questions.length) + 1})`
              });
            }
          }
          
          console.log('🚨 [FORCE] Total de perguntas finais:', finalQuestions.length);
          setQuestions(finalQuestions);
          setQuestionsLoaded(true);
          setIsLoadingQuestions(false);
          return; // 🚨 IMPORTANTE: NÃO CONTINUAR EXECUTANDO!
        } else {
          console.log('⚠️ [QUESTIONS] Perguntas da sala são corrompidas - carregando aleatórias...');
        }
      }
      
      // Se não temos sala ainda, buscar perguntas padrão
      try {
        // Buscar perguntas de todas as eras (item_type = 'qa') - IGUAL AO SISTEMA DAS ERAS
        const { data, error } = await (supabase as any)
          .from('knowledge_items')
          .select(`
            id,
            question,
            correct_answer,
            wrong_options,
            era_id,
            eras!inner(name, slug)
          `)
          .eq('item_type', 'qa')
          .not('question', 'is', null)
          .not('correct_answer', 'is', null)
          .not('wrong_options', 'is', null)
          .limit(100); // Buscar mais para ter variedade na randomização
        
        console.log('🔄 [QUESTIONS] Resultado da busca:', { data, error });
        console.log('🔄 [QUESTIONS] Data length:', data?.length);
        console.log('🔄 [QUESTIONS] Error details:', error);
        
        if (error) {
          console.error('❌ [QUESTIONS] Erro na busca:', error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          console.warn('⚠️ [QUESTIONS] Nenhuma pergunta encontrada no banco!');
          throw new Error('Nenhuma pergunta encontrada no banco de dados');
        }
        
        // Transformar dados para o formato esperado - IGUAL AO SISTEMA DAS ERAS
        console.log('🔄 [QUESTIONS] Processando perguntas...');
        const allQuestions = (data || []).map((item: any) => {
          const wrongOptions = Array.isArray(item.wrong_options) ? item.wrong_options : [];
          const correctAnswer = item.correct_answer;
          const options = [correctAnswer, ...wrongOptions].slice(0, 4);
          
          // Embaralhar opções para cada pergunta - IGUAL AO SISTEMA DAS ERAS
          const { shuffledOptions, correctIndex } = shuffleOptions(options, 0);
          
          return {
            id: item.id,
            question: item.question,
            options: shuffledOptions,
            correct_answer: correctIndex,
            era: item.eras?.name || 'Geral',
            era_slug: item.eras?.slug || 'geral'
          };
        });
        
        // 🎲 RANDOMIZAR E SELECIONAR 25 PERGUNTAS DIFERENTES
        const shuffledQuestions = allQuestions.sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffledQuestions.slice(0, 25);
        
        console.log('🔄 [QUESTIONS] Definindo perguntas no estado...');
        setQuestions(selectedQuestions);
        console.log('✅ [QUESTIONS] Perguntas PvP carregadas do knowledge_items:', selectedQuestions.length);
        console.log('✅ [QUESTIONS] Primeira pergunta do banco:', selectedQuestions[0]);
        console.log('🎲 Perguntas randomizadas para variedade a cada partida');
      } catch (err) {
        console.error('❌ Erro ao buscar perguntas PvP:', err);
        // Fallback para perguntas demo em caso de erro
        setQuestions([
          { id: '1', question: 'Qual foi a primeira civilização a desenvolver a escrita?', options: ['Egípcia', 'Suméria', 'Chinesa', 'Grega'], correct_answer: 1, era: 'demo' },
          { id: '2', question: 'Quem escreveu "Dom Casmurro"?', options: ['Machado de Assis', 'José de Alencar', 'Castro Alves', 'Graciliano Ramos'], correct_answer: 0, era: 'demo' },
          { id: '3', question: 'Qual é a capital do Canadá?', options: ['Toronto', 'Vancouver', 'Ottawa', 'Montreal'], correct_answer: 2, era: 'demo' }
        ]);
      }
      
      // Finalizar carregamento
      setIsLoadingQuestions(false);
      setQuestionsLoaded(true);
    };

    loadQuestionsFromRoom();
  }, [user, localRoom, questionsLoaded, isLoadingQuestions, localRoom?.status, localRoom?.questions]);
  
  // Removido useEffect de emergência que estava sobrescrevendo as perguntas
  
  // 🚨 VERIFICAÇÃO IMEDIATA - Se não há roomId, redirecionar
  useEffect(() => {
    if (!roomId) {
      console.log('❌ RoomId não encontrado, redirecionando para arena...');
      navigate('/arena', { replace: true });
      return;
    }
    
    // Verificar se o roomId é válido (UUID format)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(roomId)) {
      console.log('❌ RoomId inválido, redirecionando para arena...');
      navigate('/arena', { replace: true });
      return;
    }
  }, [roomId, navigate]);
  
  // 🎯 CARREGAR SALA BASEADA NO ROOM ID DA URL
  useEffect(() => {
    const loadRoomFromUrl = async () => {
      if (!roomId || currentRoom || isExiting) return;
      
      // ⏳ Aguardar autenticação antes de carregar a sala
      if (authLoading) {
        console.log('⏳ [AUTH] Aguardando autenticação...');
        return;
      }
      
      if (!user) {
        console.log('❌ [AUTH] Usuário não autenticado - redirecionando...');
        navigate('/arena', { replace: true });
        return;
      }
      
      // 🧹 LIMPAR ESTADO ANTERIOR COMPLETAMENTE
      console.log('🧹 [LOAD ROOM] Limpando estado anterior...');
      clearAllState(); // Limpar estado do hook
      setLocalRoom(null);
      setQuestions([]);
      setTimeLeft(300);
      setSelectedAnswer(null);
      // REMOVIDO: localCurrentQuestion não existe mais
      setCurrentQuestionIndex(0);
      setBattleResult(null);
      // HP removido - usando apenas scores sincronizados
        setAttackEffect(null);
        setShowAttackAnimation(false);
        setShowAnswerFeedback(false);
        setCorrectAnswerIndex(null);
      setLastAnswerData(null);
      setShowFireEffect(false);
      setShowLightningEffect(false);
      setFireParticles(false);
      setLightningParticles(false);
      setQuestionsLoaded(false);
      setIsLoadingQuestions(false);
      
      try {
        const { data, error } = await (supabase as any)
          .from('pvp_rooms')
          .select('*')
          .eq('id', roomId)
          .single();
          
        if (error) {
          console.error('❌ Erro ao carregar sala:', error);
          toast({
            title: "❌ Erro ao Carregar Sala",
            description: "Não foi possível carregar a sala PvP. Redirecionando...",
            variant: "destructive"
          });
          navigate('/arena', { replace: true });
          return;
        }
        
        if (data) {
          // 🔒 VALIDAÇÃO DE ACESSO: Verificar se o usuário é um dos jogadores da sala
          const isPlayer1InRoom = user.id === data.player1_id;
          const isPlayer2InRoom = user.id === data.player2_id;
          
          console.log('🔍 [DEBUG] Validação de acesso:');
          console.log('🔍 [DEBUG] Usuário atual:', user.id);
          console.log('🔍 [DEBUG] Player 1:', data.player1_id);
          console.log('🔍 [DEBUG] Player 2:', data.player2_id);
          console.log('🔍 [DEBUG] É Player 1?', isPlayer1InRoom);
          console.log('🔍 [DEBUG] É Player 2?', isPlayer2InRoom);
          console.log('🔍 [DEBUG] Status da sala:', data.status);
          
          // ✅ VALIDAÇÃO CORRETA: Verificar se é um dos jogadores
          if (!isPlayer1InRoom && !isPlayer2InRoom) {
            console.error('❌ Acesso não autorizado: usuário não é um dos jogadores da sala');
            
            // Mostrar notificação de erro
            toast({
              title: "❌ Acesso Negado",
              description: "Você não é um dos jogadores desta partida PvP.",
              variant: "destructive"
            });
            navigate('/arena', { replace: true });
            return;
          }

          console.log('✅ Acesso autorizado à sala PvP');
          setLocalRoom(data);
      } else {
          navigate('/arena', { replace: true });
          return;
        }
      } catch (err) {
        console.error('❌ Erro ao carregar sala:', err);
        toast({
          title: "❌ Erro de Conexão",
          description: "Erro ao conectar com o servidor. Tente novamente.",
          variant: "destructive"
        });
        navigate('/arena', { replace: true });
      }
    };
    
    loadRoomFromUrl();
  }, [roomId, currentRoom, navigate, user, authLoading, isExiting, clearAllState]);

  // 🎯 REAL-TIME SYNC - Escutar mudanças na sala
  useEffect(() => {
    if (!roomId) return;

    
    const roomChannel = (supabase as any)
      .channel(`pvp_room_${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pvp_rooms',
        filter: `id=eq.${roomId}`
      }, (payload: any) => {
        console.log('📡 [REAL-TIME] Atualização da sala recebida:', payload);
        const updatedRoom = payload.new || payload.old;
        const oldRoom = payload.old;
        
        if (payload.event === 'UPDATE' && updatedRoom && oldRoom) {
          // Verificar se houve mudança de pontuação
          const player1ScoreChanged = oldRoom.player1_score !== updatedRoom.player1_score;
          const player2ScoreChanged = oldRoom.player2_score !== updatedRoom.player2_score;
          
          if (player1ScoreChanged || player2ScoreChanged) {
            setAnimationTrigger(prev => prev + 1);
            
            // Determinar qual jogador respondeu
            // const isPlayer1 = user?.id === updatedRoom.player1_id; // REMOVIDO: já declarado no topo
            
            if ((isPlayer1 && player1ScoreChanged) || (!isPlayer1 && player2ScoreChanged)) {
              // Este jogador respondeu - mostrar animação local
              setAttackEffect(isPlayer1 ? 'player1' : 'player2');
              setShowAttackAnimation(true);
            } else {
              // Oponente respondeu - mostrar animação do oponente
              setAttackEffect(isPlayer1 ? 'player2' : 'player1');
              setShowAttackAnimation(true);
            }
          }
        }
        
        // Atualizar sala local
        if (payload.event === 'UPDATE' && payload.new) {
          setLocalRoom(payload.new);
        }
      });

    roomChannel.subscribe();

    return () => {
      roomChannel.unsubscribe();
    };
  }, [roomId, user?.id]);

  // Usar currentRoom (dados reais do Supabase) - SEMPRE
  const activeRoom = currentRoom;

  // Usar status da sala em tempo real
  const gamePhase = activeRoom?.status === 'playing' ? 'playing' : 
                   activeRoom?.status === 'finished' ? 'finished' : 'playing';

  // 🏆 CALCULAR BATTLE RESULT BASEADO NO WINNER_ID DA SALA (SINCRONIZADO)
  const calculatedBattleResult = useMemo(() => {
    if (!activeRoom?.status || activeRoom.status !== 'finished') {
      return null;
    }
    
    if (!activeRoom.winner_id) {
      return 'draw'; // Empate
    }
    
    if (activeRoom.winner_id === user?.id) {
      return 'victory'; // Este jogador venceu
    } else {
      return 'defeat'; // Este jogador perdeu
    }
  }, [activeRoom?.status, activeRoom?.winner_id, user?.id]);

  // 🎯 FUNÇÃO PARA DETERMINAR VENCEDOR (MOVIDA PARA ANTES DO USEEFFECT)
  const handleDetermineWinner = useCallback(async () => {
    if (!user) return;
    
    try {
      const currentActiveRoom = localRoom || currentRoom;
      if (currentActiveRoom) {
        // Determinar resultado sem chamar processBattleResult para evitar loop
        // const isPlayer1 = user.id === currentActiveRoom.player1_id; // REMOVIDO: já declarado no topo
        const isWinner = currentActiveRoom.winner_id === user.id;
        const isDraw = !currentActiveRoom.winner_id;
        
        if (isDraw) {
          setBattleResult('draw');
        } else if (isWinner) {
        setBattleResult('victory');
      } else {
        setBattleResult('defeat');
      }

      // 💰 PROCESSAR CRÉDITOS DA BATALHA
      if (currentActiveRoom.id && currentActiveRoom.player1_id && currentActiveRoom.player2_id) {
        console.log('💰 [CREDITS] Processando créditos da batalha...');
        processPvPBattleCredits(
          currentActiveRoom.id,
          currentActiveRoom.winner_id,
          currentActiveRoom.player1_id,
          currentActiveRoom.player2_id
        ).then(result => {
          if (result.success) {
            console.log('✅ [CREDITS] Créditos processados com sucesso:', result.results);
          } else {
            console.error('❌ [CREDITS] Erro ao processar créditos:', result.error);
          }
        }).catch(error => {
          console.error('❌ [CREDITS] Erro ao processar créditos:', error);
        });
      }

      // 🎯 INCREMENTAR CONTADOR DE PARTIDAS PvP
      try {
        // Disparar evento para incrementar contador de partidas
        window.dispatchEvent(new CustomEvent('pvp-battle-completed', { 
          detail: { 
            roomId: currentActiveRoom.id,
            winnerId: currentActiveRoom.winner_id,
            player1Id: currentActiveRoom.player1_id,
            player2Id: currentActiveRoom.player2_id
          } 
        }));
        console.log('🎯 [BATTLE COUNTER] Evento de partida finalizada disparado');
      } catch (error) {
        console.error('❌ [BATTLE COUNTER] Erro ao disparar evento:', error);
      }
      
      // 🎯 REDIRECIONAR PARA A ARENA APÓS 8 SEGUNDOS (tempo para ver a mensagem)
      console.log('🏁 Jogo finalizado! Redirecionando para a arena em 8 segundos...');
      setTimeout(() => {
        console.log('🚀 Redirecionando para a arena...');
        window.location.href = '/arena';
      }, 8000);
      }
    } catch (error) {
      console.error('Erro ao determinar vencedor:', error);
    }
  }, [user, localRoom, currentRoom]);

  // 🎯 VERIFICAR SE A PARTIDA TERMINOU
  useEffect(() => {
    const currentActiveRoom = localRoom || currentRoom;
    if (currentActiveRoom?.status === 'finished') {
      console.log('🏁 Partida terminada, processando resultado...');
      handleDetermineWinner();
      
      // 🎯 REDIRECIONAR PARA O LOBBY APÓS 3 SEGUNDOS
      console.log('🏁 Partida finalizada! Redirecionando para a arena em 3 segundos...');
      setTimeout(() => {
        console.log('🚀 Redirecionando para a arena...');
        window.location.href = '/arena';
      }, 3000);
    }
  }, [localRoom, currentRoom, handleDetermineWinner]);

  // 🎯 LISTENER PARA SINCRONIZAR ANIMAÇÕES ENTRE JOGADORES
  useEffect(() => {
    if (!roomId || !user) return;

    const movesChannel = (supabase as any)
      .channel(`pvp_moves_${roomId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'pvp_moves',
        filter: `room_id=eq.${roomId}`
      }, (payload: any) => {
        const move = payload.new;
        console.log('🎯 [ANIMATION SYNC] Movimento recebido:', move);
        
        // Se não é do usuário atual, mostrar animação
        if (move.user_id !== user.id) {
          const isCorrect = move.is_correct;
          console.log('🎯 [ANIMATION SYNC] Mostrando animação do oponente:', isCorrect ? 'CORRETA' : 'INCORRETA');
          
          if (isCorrect) {
            // Oponente acertou - mostrar animação de fogo
            setShowFireEffect(true);
            setFireParticles(true);
            console.log('🔥 [ANIMATION SYNC] Animação de fogo ativada para oponente');
          } else {
            // Oponente errou - mostrar animação de raio (usuário ganha ponto)
            setShowLightningEffect(true);
            setLightningParticles(true);
            console.log('⚡ [ANIMATION SYNC] Animação de raio ativada para usuário');
          }
          
          // Limpar animações após 2 segundos
          setTimeout(() => {
            setShowFireEffect(false);
            setShowLightningEffect(false);
            setFireParticles(false);
            setLightningParticles(false);
            console.log('🧹 [ANIMATION SYNC] Animações limpas');
          }, 2000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(movesChannel);
    };
  }, [roomId, user]);

  // 🎯 FUNÇÃO PARA QUANDO O TEMPO ACABAR
  const handleTimeUp = useCallback(async () => {
    if (!roomId) return;
    
    try {
      // Finalizar a partida no servidor
      await processBattleResult(roomId);
      console.log('🏁 Partida finalizada por tempo esgotado');
      
      // 🎯 REDIRECIONAR PARA O LOBBY APÓS 3 SEGUNDOS
      console.log('⏰ Tempo esgotado! Redirecionando para a arena em 3 segundos...');
      setTimeout(() => {
        console.log('🚀 Redirecionando para a arena...');
        window.location.href = '/arena';
      }, 3000);
    } catch (error) {
      console.error('Erro ao finalizar partida:', error);
    }
  }, [roomId, processBattleResult]);

  // ⏰ TIMER SINCRONIZADO - USAR TEMPO DO BANCO DE DADOS
  useEffect(() => {
        if (gamePhase === 'playing' && (activeRoom as any)?.started_at) {
      const timer = setInterval(() => {
        // Calcular tempo restante baseado no started_at do banco
        const startTime = new Date((activeRoom as any).started_at).getTime();
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        const remainingTime = Math.max(0, 300 - elapsedSeconds); // 5 minutos = 300 segundos
        
        console.log(`⏰ [TIMER] Tempo restante: ${remainingTime}s, Elapsed: ${elapsedSeconds}s`);
        
        // 🕐 DEBUG: Log do tempo para verificar sincronização
        console.log('🕐 [TIMER] Started at:', (activeRoom as any).started_at);
        console.log('🕐 [TIMER] Start time (ms):', startTime);
        console.log('🕐 [TIMER] Current time (ms):', currentTime);
        console.log('🕐 [TIMER] Elapsed seconds:', elapsedSeconds);
        console.log('🕐 [TIMER] Remaining time:', remainingTime);
        
        setTimeLeft(remainingTime);
        
        if (remainingTime <= 0) {
          handleTimeUp();
        }
      }, 100); // 10 FPS para melhor responsividade
      
      return () => clearInterval(timer);
    }
  }, [gamePhase, activeRoom?.status, handleTimeUp]);

  // 🎯 CALLBACKS
  const handleConfirmBattle = useCallback(async () => {
    if (!roomId) return;
    await confirmBattle(roomId);
  }, [roomId, confirmBattle]);

  const handleExitBattle = useCallback(async () => {
    if (!user) return;
    
    try {
      console.log('🚪 Saindo da batalha...');
      
      // 🚧 SINALIZAR QUE ESTÁ SAINDO (PREVENIR RECARREGAMENTO)
      setIsExiting(true);
      
      // 🧹 LIMPEZA COMPLETA DO ESTADO
      console.log('🧹 [EXIT] Limpando estado local...');
      setLocalRoom(null);
      setQuestions([]);
      setTimeLeft(300);
      setSelectedAnswer(null);
      // REMOVIDO: localCurrentQuestion não existe mais
      setCurrentQuestionIndex(0);
      setBattleResult(null);
      // HP removido - usando apenas scores sincronizados
      setAttackEffect(null);
      setShowAttackAnimation(false);
      setShowAnswerFeedback(false);
      setCorrectAnswerIndex(null);
      setLastAnswerData(null);
      setShowFireEffect(false);
      setShowLightningEffect(false);
      setFireParticles(false);
      setLightningParticles(false);
      setQuestionsLoaded(false);
      setIsLoadingQuestions(false);
      
      // 🧹 LIMPEZA DO ESTADO DO HOOK
      console.log('🧹 [EXIT] Limpando estado do hook...');
      await clearBattleState();
      clearAllState();
      
      console.log('✅ [EXIT] Estado completamente limpo - redirecionando...');
      
      // 🚀 FORÇA REDIRECIONAMENTO COM REPLACE PARA LIMPAR HISTÓRICO
      window.location.replace('/arena');
    } catch (error) {
      console.error('❌ [EXIT] Erro ao sair da batalha:', error);
      // Forçar redirecionamento mesmo com erro
      window.location.replace('/arena');
    }
  }, [user, clearBattleState, clearAllState]);

  const handleAnswerQuestion = useCallback(async (answerIndex: number) => {
    console.log('🔥 [ANSWER] handleAnswerQuestion chamado com:', answerIndex);
    console.log('🔥 [ANSWER] roomId:', roomId);
    
    if (!roomId) {
      console.log('⚠️ [ANSWER] Sem roomId - usando modo local');
      // Não retornar - permitir resposta local
    }
    
    try {
      // Validação local instantânea
      const currentActiveRoom = localRoom || currentRoom;
      const currentQuestionIndex = Math.max(0, (currentActiveRoom?.current_question || 1) - 1); // Converter para índice baseado em 0
      
      // 🎯 CORREÇÃO CRÍTICA: Usar PERGUNTAS DA SALA (25 perguntas) em vez do array local (3 perguntas)
      const currentQuestionData = currentActiveRoom?.questions?.[currentQuestionIndex] || questions[currentQuestionIndex];
      
      // 🚫 VERIFICAR SE JÁ CHEGOU NO LIMITE DE PERGUNTAS (25)
      if (currentQuestionIndex >= 24) { // Índice 24 = pergunta 25 (última pergunta)
        console.log('🏁 [ANSWER] Limite de perguntas atingido (25) - jogo finalizado');
        toast({
          title: "Jogo Finalizado!",
          description: "Você completou todas as 25 perguntas!",
          variant: "default"
        });
        return;
      }
      
      // 🚫 VERIFICAR SE O JOGO JÁ TERMINOU
      if (currentActiveRoom?.status === 'finished') {
        console.log('🏁 [ANSWER] Jogo já finalizado');
        toast({
          title: "Jogo Finalizado!",
          description: "Esta partida já foi concluída.",
          variant: "default"
        });
        return;
      }
      
      console.log('🔥 [ANSWER] currentActiveRoom:', currentActiveRoom);
      console.log('🔥 [ANSWER] currentQuestionIndex:', currentQuestionIndex);
      console.log('🔥 [ANSWER] currentQuestionData:', currentQuestionData);
      console.log('🔥 [ANSWER] questions:', questions);
      
    if (currentQuestionData) {
        const isCorrect = currentQuestionData.correct_answer === answerIndex;
      
        setLastAnswerData({ selected: answerIndex, correct: isCorrect });
        setSelectedAnswer(answerIndex);
        setShowAnswerFeedback(true);
        
        // 🎮 ANIMAÇÕES BASEADAS NA RESPOSTA
        // const isPlayer1 = user?.id === currentActiveRoom?.player1_id; // REMOVIDO: já declarado no topo
        
        if (isCorrect) {
          // Jogador acertou - animação de raio (herói)
          if (isPlayer1) {
            setShowLightningEffect(true);
            setLightningParticles(true);
            console.log('⚡ [ANIMATION] Jogador 1 acertou - animação de raio!');
    } else {
            setShowLightningEffect(true);
            setLightningParticles(true);
            console.log('⚡ [ANIMATION] Jogador 2 acertou - animação de raio!');
          }
          
          // Feedback de sucesso
          toast({
            title: "✅ Resposta Correta!",
            description: "Você ganhou 1 ponto!",
            variant: "default"
          });
        } else {
          // Jogador errou - animação de fogo (oponente ganha)
          if (isPlayer1) {
            setShowFireEffect(true);
            setFireParticles(true);
            console.log('🔥 [ANIMATION] Jogador 1 errou - oponente ganha ponto - animação de fogo!');
          } else {
            setShowFireEffect(true);
            setFireParticles(true);
            console.log('🔥 [ANIMATION] Jogador 2 errou - oponente ganha ponto - animação de fogo!');
          }
          
          // Feedback de erro
          toast({
            title: "❌ Resposta Incorreta",
            description: "O oponente ganhou 1 ponto.",
            variant: "destructive"
          });
        }
        
        // Feedback visual instantâneo
      if (isCorrect) {
          setCorrectAnswerIndex(answerIndex);
        }
        
           setTimeout(() => {
             setShowAnswerFeedback(false);
             setCorrectAnswerIndex(null);
             // Limpar animações
             setShowFireEffect(false);
             setShowLightningEffect(false);
             setFireParticles(false);
             setLightningParticles(false);
           }, 1500); // 1.5 segundos para combinar com as animações
           
           // 🧹 LIMPEZA IMEDIATA ADICIONAL - GARANTIR QUE AS ANIMAÇÕES SUMAM
           setTimeout(() => {
             setShowFireEffect(false);
             setShowLightningEffect(false);
             setFireParticles(false);
             setLightningParticles(false);
           }, 1600); // 100ms após o timeout principal
    }
    
      // Enviar resposta para o servidor
      const questionNumber = currentActiveRoom?.current_question || 1;
      const questionIndex = questionNumber - 1; // Converter para índice baseado em 0
      console.log('🚨 [ANSWER] Chamando answerQuestion com:', { roomId, questionNumber, questionIndex, answerIndex });
      console.log('🚨 [ANSWER] currentActiveRoom:', currentActiveRoom);
      console.log('🚨 [ANSWER] answerQuestion function:', typeof answerQuestion);
      
      try {
        console.log('🚨 [ANSWER] Executando answerQuestion...');
        const result = await answerQuestion(roomId, questionIndex, answerIndex, 0);
        console.log('🚨 [ANSWER] answerQuestion executada com sucesso, resultado:', result);
      } catch (error) {
        console.error('❌ [ANSWER] Erro ao executar answerQuestion:', error);
        toast({
          title: "❌ Erro ao Responder",
          description: "Não foi possível enviar sua resposta. Tente novamente.",
          variant: "destructive"
        });
      }
      
      // 🎯 SINCRONIZAÇÃO REMOVIDA - AGORA É FEITA NO HOOK usePvPSystemTemp
      // Evita conflitos e race conditions entre múltiplas atualizações
    } catch (error) {
      console.error('Erro ao responder pergunta:', error);
    }
  }, [roomId, answerQuestion, localRoom, currentRoom, questions, user?.id]);

  // 🎯 TIMER
  useEffect(() => {
    const currentActiveRoom = localRoom || currentRoom;
    const currentGamePhase = currentActiveRoom?.status === 'playing' ? 'playing' : 
                           currentActiveRoom?.status === 'finished' ? 'finished' : 'playing';
    
    if (currentGamePhase === 'playing' && currentActiveRoom) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
        handleDetermineWinner();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [localRoom, currentRoom, handleDetermineWinner]);

  // 🎯 HANDLER PARA FIM DA ANIMAÇÃO
  const handleAnimationEnd = useCallback(() => {
    setShowAttackAnimation(false);
    setAttackEffect(null);
  }, []);

  // 🎯 FUNÇÃO REMOVIDA - HP não é mais usado, apenas scores sincronizados em tempo real

  
  // 🎯 SCORES PERSISTENTES - Usar scores da sala em tempo real
  const player1ScoreFromDB = currentRoom?.player1_score || 0;
  const player2ScoreFromDB = currentRoom?.player2_score || 0;
  
  // 🎯 DETERMINAR SE O USUÁRIO É PLAYER1 OU PLAYER2 - COM VALORES SEGUROS (MOVIDO PARA O TOPO)
  const isPlayer1 = user?.id === activeRoom?.player1_id;
  const isPlayer2 = user?.id === activeRoom?.player2_id;
  
  // 🎯 DEBUG: Verificar se os pontos do adversário estão sendo exibidos corretamente
  const adversaryScore = isPlayer1 ? player2ScoreFromDB : player1ScoreFromDB;

  // 🎯 COMBATE REALISTA - Scores são atualizados automaticamente pelo hook usePvPSystemTemp
  // Não precisamos de lógica adicional aqui, pois os scores já são sincronizados em tempo real

  // Sem modo demo - apenas dados reais
  
  // 🎮 PERSONAGENS DOS JOGADORES
  const getPlayerCharacters = useCallback(() => {
    const player1CharacterId = activeRoom?.player1_character_id || 1; // Desconhecido
    const player2CharacterId = activeRoom?.player2_character_id || 2; // Eux
    
    return {
      player1: CHARACTERS[player1CharacterId as keyof typeof CHARACTERS],
      player2: CHARACTERS[player2CharacterId as keyof typeof CHARACTERS],
      player1CharacterId,
      player2CharacterId
    };
  }, [activeRoom]);

  // 🎯 VARIÁVEIS NECESSÁRIAS PARA O useEffect (MOVIDAS PARA ANTES)
  const totalQuestions = 25;
  const currentQuestionNumber = currentRoom?.current_question || 1;

  // 🚨 FORÇAR FINALIZAÇÃO QUANDO CHEGAR EM 25/25 (MOVIDO PARA ANTES DOS RETURNS)
  useEffect(() => {
    // 🚨 DETECTAR FINALIZAÇÃO DO JOGO
    if (currentQuestionNumber >= totalQuestions && currentRoom?.status === 'playing') {
      console.log('🏁 [GAME END] JOGO DEVERIA TER FINALIZADO!');
      console.log('🏁 [GAME END] current_question:', currentQuestionNumber, 'total:', totalQuestions);
      console.log('🏁 [GAME END] status:', currentRoom?.status);
      console.log('🚨 [FORCE FINISH] Forçando finalização do jogo!');
      console.log('🚨 [FORCE FINISH] current_question:', currentQuestionNumber, 'total:', totalQuestions);
      
      // 🎯 ATUALIZAR STATUS NO SUPABASE PARA "FINISHED"
      const updateRoomStatus = async () => {
        try {
          console.log('🔄 [FORCE FINISH] Atualizando status para "finished" no Supabase...');
          const { error } = await (supabase as any)
            .from('pvp_rooms')
            .update({ 
              status: 'finished',
              finished_at: new Date().toISOString()
            })
            .eq('id', currentRoom?.id);
          
          if (error) {
            console.error('❌ [FORCE FINISH] Erro ao atualizar status:', error);
          } else {
            console.log('✅ [FORCE FINISH] Status atualizado para "finished"!');
          }
        } catch (error) {
          console.error('❌ [FORCE FINISH] Erro na atualização:', error);
        }
      };
      
      updateRoomStatus();
      
      // 🎯 DETERMINAR VENCEDOR BASEADO NA PONTUAÇÃO
      const isPlayer1 = user?.id === currentRoom?.player1_id;
      const player1Score = currentRoom?.player1_score || 0;
      const player2Score = currentRoom?.player2_score || 0;
      
      console.log('🏆 [FORCE FINISH] Scores finais:', { player1Score, player2Score });
      
      // 🏆 DETERMINAR VENCEDOR E PROCESSAR CRÉDITOS
      let winnerId: string | null = null;
      
      console.log('🔍 [FORCE FINISH] Debug vencedor:', {
        player1Score,
        player2Score,
        isPlayer1,
        user_id: user?.id,
        player1_id: currentRoom.player1_id,
        player2_id: currentRoom.player2_id
      });
      
      if (player1Score > player2Score) {
        const isWinner = isPlayer1;
        const result = isWinner ? 'victory' : 'defeat';
        setBattleResult(result);
        winnerId = currentRoom.player1_id;
        console.log('🏆 [FORCE FINISH] Player 1 venceu!', { isPlayer1, isWinner, winnerId, player1Score, player2Score, battleResult: result });
      } else if (player2Score > player1Score) {
        const isWinner = !isPlayer1;
        const result = isWinner ? 'victory' : 'defeat';
        setBattleResult(result);
        winnerId = currentRoom.player2_id;
        console.log('🏆 [FORCE FINISH] Player 2 venceu!', { isPlayer1, isWinner, winnerId, player1Score, player2Score, battleResult: result });
      } else {
        setBattleResult('draw');
        winnerId = null; // Empate
        console.log('🤝 [FORCE FINISH] Empate!', { player1Score, player2Score, battleResult: 'draw' });
      }

      // 💰 PROCESSAR CRÉDITOS DA BATALHA
      if (currentRoom.id && currentRoom.player1_id && currentRoom.player2_id) {
        console.log('💰 [CREDITS] Processando créditos da batalha...');
        processPvPBattleCredits(
          currentRoom.id,
          winnerId,
          currentRoom.player1_id,
          currentRoom.player2_id
        ).then(result => {
          if (result.success) {
            console.log('✅ [CREDITS] Créditos processados com sucesso:', result.results);
            
            // 🔄 FORÇAR REFRESH DO DASHBOARD
            const userResult = result.results[isPlayer1 ? 'player1' : 'player2'];
            if (userResult.success) {
              window.dispatchEvent(new CustomEvent('pvp-transaction', { 
                detail: { 
                  type: battleResult === 'victory' ? 'winner_prize' : battleResult === 'draw' ? 'refund' : 'loss',
                  amount: battleResult === 'victory' ? 9.5 : battleResult === 'draw' ? 7 : -7,
                  newBalance: userResult.newBalance 
                } 
              }));
            }
          } else {
            console.error('❌ [CREDITS] Erro ao processar créditos:', result.error);
          }
        }).catch(error => {
          console.error('❌ [CREDITS] Erro ao processar créditos:', error);
        });
      }

      // 🎯 INCREMENTAR CONTADOR DE PARTIDAS PvP
      try {
        // Disparar evento para incrementar contador de partidas
        window.dispatchEvent(new CustomEvent('pvp-battle-completed', { 
          detail: { 
            roomId: currentRoom.id,
            winnerId: winnerId,
            player1Id: currentRoom.player1_id,
            player2Id: currentRoom.player2_id
          } 
        }));
        console.log('🎯 [BATTLE COUNTER] Evento de partida finalizada disparado');
      } catch (error) {
        console.error('❌ [BATTLE COUNTER] Erro ao disparar evento:', error);
      }
      
      // 🎯 REDIRECIONAR PARA O LOBBY APÓS 5 SEGUNDOS
      setTimeout(() => {
        console.log('🏁 [FORCE FINISH] Redirecionando para a arena...');
        navigate('/arena');
      }, 5000);
    }
  }, [currentQuestionNumber, totalQuestions, currentRoom?.status, user?.id, currentRoom?.player1_id, currentRoom?.player1_score, currentRoom?.player2_score, navigate, currentRoom?.id]);

  // Aguardar usuário carregar - AGORA DEPOIS DE TODOS OS HOOKS
  if (authLoading) {
    console.log('⏳ [AUTH] Carregando autenticação...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-white mb-2">Carregando...</h2>
          <p className="text-gray-400">Verificando autenticação...</p>
          </div>
      </div>
    );
  }

  if (!user) {
    console.log('👤 [AUTH] Usuário não autenticado - redirecionando para login');
    console.log('👤 [AUTH] authLoading:', authLoading);
    console.log('👤 [AUTH] user:', user);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-2">Acesso Negado</h2>
          <p className="text-gray-400 mb-6">Você precisa estar logado para acessar esta página.</p>
          <button
            onClick={() => navigate('/arena')}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-green-500/30"
          >
            Voltar para Arena
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ [AUTH] Usuário autenticado:', user?.id);

  // 🎯 PERSONAGENS DOS JOGADORES - APÓS AUTENTICAÇÃO
  const { player1, player2, player1CharacterId, player2CharacterId } = getPlayerCharacters();
  
  // 🎯 PERSPECTIVA INDIVIDUAL: Cada player vê seu herói como protagonista
  const currentUserCharacter = isPlayer1 ? player1 : player2; // Herói do player atual
  const opponentCharacter = isPlayer1 ? player2 : player1; // Herói do oponente

  // FALLBACK: Se nenhuma sala estiver disponível, permitir interação temporária
  const canInteract = true; // Forçar interação para garantir que funcione
  
  // 🎯 DADOS DEMO PARA TESTE (12 perguntas reais)
  // Sem modo demo - apenas dados reais
  
  // 🎯 FUNÇÃO PARA OBTER DADOS DA PERGUNTA ATUAL
  const getCurrentQuestionData = (activeRoom: any) => {
    // 🛡️ VERIFICAÇÕES ROBUSTAS ANTES DE PROCESSAR
    if (!activeRoom) {
      console.log('⚠️ [QUESTIONS] activeRoom não disponível');
      return { currentQuestionData: null, safeCurrentQuestion: 0, maxQuestions: 0 };
    }

    // 🚨 DETECTAR PERGUNTAS CORROMPIDAS E FORÇAR REGENERAÇÃO
    if (activeRoom.questions && activeRoom.questions.length > 0) {
    const firstQuestion = activeRoom.questions[0];
      if (firstQuestion.question === 'Pergunta 1' || firstQuestion.id === 1 || activeRoom.questions.length < 25) {
        console.log('🚨 [QUESTIONS] PERGUNTAS CORROMPIDAS DETECTADAS! Forçando regeneração...');
        console.log('🚨 [QUESTIONS] Sala corrompida:', activeRoom.id, 'Perguntas:', activeRoom.questions.length);
        
        // Forçar regeneração das perguntas IMEDIATAMENTE
        console.log('🔄 [QUESTIONS] Regenerando perguntas da sala...');
        
        // Usar função async para poder usar await
        (async () => {
          try {
            // Buscar perguntas do banco
            const { data: questionsData, error: questionsError } = await (supabase as any)
              .from('knowledge_items')
              .select('*, eras(*)')
              .limit(50);
            
            if (questionsData && questionsData.length > 0) {
              // Processar perguntas
              const allQuestions = questionsData.map((item: any) => {
                const wrongOptions = Array.isArray(item.wrong_options) ? item.wrong_options : [];
                const correctAnswer = item.correct_answer;
                const options = [correctAnswer, ...wrongOptions].slice(0, 4);
                
                while (options.length < 4) {
                  options.push(`Opção ${String.fromCharCode(65 + options.length)}`);
                }
                
                return {
                  id: item.id,
                  question: item.question,
                  options: options,
                  correct_answer: 0,
                  era: item.eras?.name || 'Geral'
                };
              });
              
              // Selecionar 25 perguntas
              const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
              const selectedQuestions = shuffledQuestions.slice(0, 25);
              
              console.log('🔄 [QUESTIONS] Atualizando sala com 25 perguntas válidas...');
              
              // Atualizar sala no banco
              const { error: updateError } = await (supabase as any)
                .from('pvp_rooms')
                .update({ questions: selectedQuestions })
                .eq('id', activeRoom.id);
              
              if (updateError) {
                console.error('❌ [QUESTIONS] Erro ao atualizar sala:', updateError);
      } else {
                console.log('✅ [QUESTIONS] Perguntas regeneradas com sucesso!');
                console.log('🔄 [QUESTIONS] Recarregando página...');
                // Recarregar a página para aplicar as mudanças
                window.location.reload();
              }
            }
          } catch (error) {
            console.error('❌ [QUESTIONS] Erro ao regenerar perguntas:', error);
          }
        })();
      }
    }

    // 🎯 CALCULAR ÍNDICE CORRETO DA PERGUNTA ATUAL
    const questionIndex = Math.max(0, (activeRoom.current_question || 1) - 1);

    // ✅ AS PERGUNTAS DO SUPABASE SÃO VÁLIDAS - VÊM DO MESMO BANCO DAS ERAS (knowledge_items)
    // Não precisamos mais detectar "corrupção" pois o sistema PvP carrega corretamente do knowledge_items

    // 🎯 PRIORIDADE 1: USAR PERGUNTAS DO SUPABASE (25 perguntas)
    const roomQuestions = activeRoom.questions;
    console.log('🔍 [QUESTIONS DEBUG] currentRoom?.questions:', currentRoom?.questions?.length);
    console.log('🔍 [QUESTIONS DEBUG] activeRoom.questions:', activeRoom.questions?.length);
    console.log('🔍 [QUESTIONS DEBUG] roomQuestions:', roomQuestions?.length);
    
    if (roomQuestions && roomQuestions.length > 0) {
      console.log('✅ [QUESTIONS] Usando perguntas do Supabase (knowledge_items):', roomQuestions.length);
      console.log('🔍 [QUESTIONS] Primeira pergunta:', roomQuestions[0]);
      
      const safeQuestionIndex = Math.min(questionIndex, roomQuestions.length - 1);
      const activeRoomQuestion = roomQuestions[safeQuestionIndex];
      
      if (activeRoomQuestion) {
        // Processar opções se não existirem
        let processedQuestion = { ...activeRoomQuestion };
        
        if (!processedQuestion.options || processedQuestion.options.length === 0) {
          // Se não há opções, tentar criar a partir de correct_answer e wrong_options
          if (processedQuestion.correct_answer && processedQuestion.wrong_options) {
            const wrongOptions = Array.isArray(processedQuestion.wrong_options) 
              ? processedQuestion.wrong_options 
              : [];
            const correctAnswer = processedQuestion.correct_answer;
            const options = [correctAnswer, ...wrongOptions].slice(0, 4);
            
            // Embaralhar opções
            const shuffled = [...options];
            for (let i = shuffled.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            
            const correctIndex = shuffled.findIndex(option => option === correctAnswer);
            processedQuestion.options = shuffled;
            processedQuestion.correct_answer = correctIndex;
          }
        }
        
        if (processedQuestion.options && processedQuestion.options.length > 0) {
          console.log('✅ [QUESTIONS] Usando pergunta do Supabase (25 perguntas):', processedQuestion.question);
          console.log('🔍 [OPTIONS DEBUG] Opções da pergunta:', processedQuestion.options);
          return {
            currentQuestionData: processedQuestion,
            safeCurrentQuestion: safeQuestionIndex,
            maxQuestions: roomQuestions.length
          };
        }
      }
    }
    
    // 🎯 PRIORIDADE 2: FALLBACK PARA PERGUNTAS LOCAIS (apenas se Supabase falhar)
    console.log('⚠️ [QUESTIONS] CAINDO NO FALLBACK - Perguntas locais:', questions?.length);
    if (questions && questions.length > 0) {
      const safeQuestionIndex = Math.min(questionIndex, questions.length - 1);
      const realQuestion = questions[safeQuestionIndex];
      
      if (realQuestion && realQuestion.options && realQuestion.options.length > 0) {
        console.log('⚠️ [QUESTIONS] Usando pergunta local (fallback):', realQuestion.question);
        console.log('🔍 [OPTIONS DEBUG] Opções da pergunta local:', realQuestion.options);
    return {
          currentQuestionData: realQuestion,
          safeCurrentQuestion: safeQuestionIndex,
          maxQuestions: questions.length
        };
      }
    }
    
    // 🎯 SE NENHUMA PERGUNTA VÁLIDA ENCONTRADA
    console.log('❌ [QUESTIONS] Nenhuma pergunta válida encontrada');
    return { currentQuestionData: null, safeCurrentQuestion: 0, maxQuestions: 0 };
  };
  
  // Obter dados da pergunta atual
  const { currentQuestionData, safeCurrentQuestion, maxQuestions } = getCurrentQuestionData(activeRoom);
  
  // 🔍 DEBUG: Verificar valores para diagnóstico
  console.log('🎯 [DEBUG] currentQuestionData:', currentQuestionData);
  console.log('🎯 [DEBUG] currentRoom:', currentRoom?.id, 'questions:', currentRoom?.questions?.length);
  
  // 🎯 CORREÇÃO CRÍTICA: Usar APENAS currentRoom como fonte da verdade para sincronização
  const player1Score = currentRoom?.player1_score || 0;
  const player2Score = currentRoom?.player2_score || 0;
  
  // 🎯 DEBUG: Log sempre que currentRoom mudar
  console.log('🎯 [CURRENT ROOM DEBUG] currentRoom atual:', {
    id: currentRoom?.id,
    player1_score: currentRoom?.player1_score,
    player2_score: currentRoom?.player2_score,
    current_question: currentRoom?.current_question,
    status: currentRoom?.status,
    _lastUpdate: (currentRoom as any)?._lastUpdate
  });
  
  // 🎯 FORÇAR ATUALIZAÇÃO VISUAL - Adicionar key para forçar re-render
  const scoreKey = `${player1Score}-${player2Score}-${currentRoom?.current_question || 1}`;
  
  // 🎯 VARIÁVEIS JÁ DECLARADAS NO TOPO
  
  // 🚨 FORÇAR SINCRONIZAÇÃO EM TEMPO REAL
  console.log('🔄 [REALTIME] currentQuestionNumber:', currentQuestionNumber, 'totalQuestions:', totalQuestions);
  console.log('🔄 [REALTIME] player1Score:', player1Score, 'player2Score:', player2Score);
  console.log('🔄 [REALTIME] currentRoom status:', currentRoom?.status);
  console.log('🔄 [REALTIME] forceUpdate:', forceUpdate);
  
  // 🚨 useEffect de finalização foi movido para antes dos returns condicionais
  
  // 🎯 FORÇAR RE-RENDER QUANDO DADOS MUDAM
  const forceRenderKey = `${currentRoom?.id || 'no-room'}-${currentQuestionNumber}-${totalQuestions}-${player1Score}-${player2Score}`;
  
  
  console.log('🎯 [SCORE DEBUG] Scores sendo exibidos:', {
    currentRoom: {
      player1: currentRoom?.player1_score,
      player2: currentRoom?.player2_score
    },
    localRoom: {
      player1: localRoom?.player1_score,
      player2: localRoom?.player2_score
    },
    final: {
      player1: player1Score,
      player2: player2Score
    },
    isPlayer1: isPlayer1,
    isPlayer2: isPlayer2,
    user_id: user?.id,
    room_id: currentRoom?.id,
    totalQuestions: totalQuestions,
    currentQuestionNumber: currentQuestionNumber,
    forceUpdate: forceUpdate
  });
  
  // 🎯 RENDERIZAÇÃO DO COMPONENTE
  return (
    <div key={`${forceRenderKey}-${forceUpdate}`} className="min-h-screen relative overflow-hidden">
        {/* Background Video PvP */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 scale-125"
          ref={(video) => {
            if (video) {
              video.playbackRate = 0.25;
            }
          }}
        >
          <source src="/backgroundpvp.mp4" type="video/mp4" />
        </video>
      
      {/* Overlay escuro para melhorar legibilidade */}
      <div className="absolute inset-0 bg-black/40 z-5"></div>
      
      <ParticleBackground />
      
      <div className="relative z-20">
      {/* Header com informações da partida */}
      <div className="bg-card/50 backdrop-blur-sm border-b border-card-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExitBattle}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Voltar
              </button>
              <div className="text-sm text-muted-foreground">
                Sala: {roomId?.slice(0, 8)}...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎯 Indicador de Players na Sala */}
      <div className="bg-card/30 backdrop-blur-sm border-b border-card-border">
        <div className="container mx-auto px-4 py-1">
          <div className="flex items-center justify-center space-x-6">
            {/* Seu Status */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-green-300">
                ✅ Você: {currentUserCharacter.name}
              </span>
              <span className="text-xs text-green-400">
                ({user?.id?.slice(0, 6)}...)
              </span>
          </div>
          
            {/* VS Separator */}
            <div className="text-sm font-bold text-epic">⚔️</div>
            
            {/* Oponente Status */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-xs font-semibold text-red-300">
                🎯 Oponente: {opponentCharacter.name}
              </span>
              <span className="text-xs text-red-400">
                ({isPlayer1 ? activeRoom?.player2_id?.slice(0, 6) : activeRoom?.player1_id?.slice(0, 6)}...)
              </span>
            </div>
          </div>
          
          {/* Status da Sala */}
          <div className="text-center mt-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              activeRoom?.status === 'playing' ? 'bg-green-500/20 text-green-400' :
              activeRoom?.status === 'finished' ? 'bg-blue-500/20 text-blue-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              {activeRoom?.status === 'playing' ? '⚔️ Batalha em andamento' :
               activeRoom?.status === 'finished' ? '🏁 Batalha finalizada' :
               '⚔️ Batalha em andamento'}
            </span>
        </div>

          {/* 🔄 Indicadores de Sincronização e Tempo Real */}
          <div className="flex items-center justify-center space-x-4 mt-2">
            {/* Status de Sincronização */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${activeRoom?.player1_id && activeRoom?.player2_id ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-xs font-semibold">
                {activeRoom?.player1_id && activeRoom?.player2_id ? '🔄 Sincronizado' : '⚠️ Não sincronizado'}
              </span>
                </div>
            
            {/* Status de Tempo Real */}
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${activeRoom ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className="text-xs font-semibold">
                {activeRoom ? '📡 Tempo Real Ativo' : '📡 Tempo Real Inativo'}
              </span>
                </div>
            
            {/* Status de Pergunta Atual */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-xs font-semibold">
                Pergunta {currentQuestionNumber}/{totalQuestions}
              </span>
            </div>
            
            {/* Barra de Progresso das Perguntas */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
              
            </div>

            {/* Scores centralizados */}
            <div className="flex justify-center">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-victory" key={`p1-${player1Score}-${forceUpdate}`}>{player1Score}</div>
                  <div className="text-xs text-muted-foreground">
                    {isPlayer1 ? 'Você' : 'Oponente'}
                  </div>
                  {/* 🎯 DEBUG: Log dos pontos do Player 1 */}
                  {/* Barra de Score Player 1 */}
                  <div className="w-16 h-2 bg-muted rounded-full mt-1">
                    <div 
                      className="h-2 bg-victory rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((player1Score / 25) * 100, 100)}%` }}
                    />
                  </div>
            </div>

                <div className="text-center">
                  <div className={`text-lg font-mono ${timeLeft <= 30 ? 'text-red-500 animate-pulse' : 'text-epic'}`}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                  <div className="text-xs text-muted-foreground">Tempo</div>
                  {timeLeft <= 30 && (
                    <div className="text-xs text-red-500 font-bold animate-pulse">
                      ⚠️ TEMPO ESGOTANDO!
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-battle" key={`p2-${player2Score}-${forceUpdate}`}>{player2Score}</div>
                  <div className="text-xs text-muted-foreground">
                    {isPlayer2 ? 'Você' : 'Oponente'}
                  </div>
                  {/* 🎯 DEBUG: Log dos pontos do Player 2 */}
                  {/* Barra de Score Player 2 */}
                  <div className="w-16 h-2 bg-muted rounded-full mt-1">
                    <div 
                      className="h-2 bg-battle rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((player2Score / 25) * 100, 100)}%` }}
                    />
                </div>
                </div>
              </div>
            </div>
          </div>
              </div>
              
      {/* Conteúdo principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* REMOVIDO: Barra de progresso duplicada */}


        <div>


            {/* 🎮 ARENA DE COMBATE VISUAL */}
            <div className={`${isMobile ? 'p-4 mb-4' : 'p-8 mb-8'}`}>
              <div className={`grid gap-6 items-center ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
                
                {/* 🎯 SEU HERÓI (Esquerda) */}
                <div className="text-center">
                  <div className="relative">
                    {/* REMOVIDO: Pontos duplicados - já mostrados no cabeçalho */}
                    
                    {/* Sprite do Seu Herói */}
                    <div 
                      className={`relative ${showAttackAnimation && attackEffect === (isPlayer1 ? 'player1' : 'player2') ? 'animate-pulse' : ''}`}
                      onAnimationEnd={handleAnimationEnd}
                    >
                      <img 
                        src={currentUserCharacter.sprite} 
                        alt={currentUserCharacter.name}
                        className="w-60 h-56 mx-auto mb-2 rounded-lg brightness-115"
                      />
                      {showAttackAnimation && attackEffect === (isPlayer1 ? 'player1' : 'player2') && (
                        <div className="absolute inset-0 bg-green-400/30 rounded-lg animate-pulse"></div>
                      )}
                  </div>
                    
                    <h3 className="text-green-300 font-bold">Você: {currentUserCharacter.name}</h3>
                    <p className="text-xs text-green-400">Seu Herói</p>
                </div>
            </div>

                {/* 🎯 CENTRO - VS com Glow Neon */}
                <div className="text-center -mt-8">
                  <div className="text-5xl font-bold bg-gradient-to-r from-red-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent relative drop-shadow-lg">
                    <div className="absolute inset-0 text-5xl font-bold text-red-500/20 blur-xs">
                      VS
                    </div>
                    <div className="relative z-10 font-black">
                      VS
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    Batalha Épica
                  </div>
        </div>

                {/* 🎯 OPONENTE (Direita) */}
                <div className="text-center">
                  <div className="relative">
                    {/* REMOVIDO: Pontos duplicados - já mostrados no cabeçalho */}
                    
                    {/* Sprite do Oponente */}
                    <div 
                      className={`relative ${showAttackAnimation && attackEffect === (isPlayer1 ? 'player2' : 'player1') ? 'animate-pulse' : ''}`}
                      onAnimationEnd={handleAnimationEnd}
                    >
                      <img 
                        src={opponentCharacter.sprite} 
                        alt={opponentCharacter.name}
                        className="w-60 h-56 mx-auto mb-2 rounded-lg brightness-115"
                      />
                      {showAttackAnimation && attackEffect === (isPlayer1 ? 'player2' : 'player1') && (
                        <div className="absolute inset-0 bg-red-400/30 rounded-lg animate-pulse"></div>
                      )}
                    </div>
                    
                    <h3 className="text-red-300 font-bold">Oponente: {opponentCharacter.name}</h3>
                    <p className="text-xs text-red-400">Adversário</p>
              </div>
          </div>
              </div>
            </div>

            {/* 2 CARDS SEPARADOS - 1 PARA CADA HERÓI */}
            <div className={`grid ${isMobile ? 'gap-4 mt-8' : 'gap-6 mt-16'} ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
              
              {/* CARD DO SEU HERÓI - SÓ FUNCIONA PARA O JOGADOR ATUAL */}
              <div className={`bg-gradient-to-r from-green-900/80 to-emerald-900/80 backdrop-blur-sm border border-green-500/50 rounded-lg ${isMobile ? 'p-4' : 'p-6'}`}>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-green-300 mb-2">Seu Card</h3>
                  <p className="text-sm text-green-400">{currentUserCharacter.name}</p>
                  <p className="text-xs text-green-500">ID: {user?.id?.slice(0, 8)}...</p>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-4 text-center">
                  {currentQuestionData?.question || (localRoom?.status === 'waiting' ? "⏳ Aguardando sincronização..." : "🔄 Aguardando pergunta inicial...")}
                </h2>
                
                
                
                
                
                {/* Opções de resposta - SÓ FUNCIONA PARA O JOGADOR ATUAL */}
                {!currentQuestionData ? (
                  <div className="text-center py-8">
                    <div className="text-yellow-400 text-lg">{localRoom?.status === 'waiting' ? "⏳ Aguardando sincronização..." : "🔄 Aguardando pergunta inicial..."}</div>
                    <div className="text-gray-400 text-sm mt-2">A sala está sendo configurada</div>
                    
                    {/* Botão de forçar início se demorar muito */}
                    {localRoom?.status === 'waiting' && (
                      <button 
                        onClick={async () => {
                          console.log('🔄 [FORCE] Forçando início da partida...');
                          console.log('🔄 [FORCE] localRoom.id:', localRoom?.id);
                          console.log('🔄 [FORCE] localRoom.status:', localRoom?.status);
                          
                          if (!localRoom?.id) {
                            console.error('❌ [FORCE] ID da sala não encontrado');
                            return;
                          }
                          
                          // Forçar mudança de status para 'playing'
                          try {
                            const updateData = { 
                                status: 'playing',
                                current_question: 1,
                                started_at: new Date().toISOString()
                            };
                            
                            console.log('🔄 [FORCE] Dados para atualização:', updateData);
                            
                            const { data, error } = await (supabase as any)
                              .from('pvp_rooms')
                              .update(updateData)
                              .eq('id', localRoom.id)
                              .select();
                            
                            if (error) {
                              console.error('❌ Erro ao forçar início:', error);
                              console.error('❌ Detalhes do erro:', error.message, error.details, error.hint);
                            } else {
                              console.log('✅ Status alterado para playing:', data);
                              // Forçar carregamento das perguntas
                              setQuestionsLoaded(false);
                              // Recarregar a página para sincronizar
                              setTimeout(() => {
                                window.location.reload();
                              }, 1000);
                            }
                          } catch (err) {
                            console.error('❌ Erro ao forçar início:', err);
                          }
                        }}
                        className="mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
                      >
                        ⚡ Forçar Início
                      </button>
                    )}
                  </div>
                ) : (
                <div className="grid grid-cols-1 gap-3">
                  {/* 🎯 DEBUG: Verificar estrutura da pergunta */}
                  {(() => {
                    console.log('🔍 [OPTIONS DEBUG] currentQuestionData:', currentQuestionData);
                    console.log('🔍 [OPTIONS DEBUG] currentQuestionData.options:', currentQuestionData?.options);
                    console.log('🔍 [OPTIONS DEBUG] activeRoom:', activeRoom);
                    console.log('🔍 [OPTIONS DEBUG] activeRoom.questions:', activeRoom?.questions);
                    
                    // 🎯 USAR OPÇÕES REAIS DA PERGUNTA
                    const realOptions = currentQuestionData?.options || [];
                    console.log('🔍 [OPTIONS DEBUG] realOptions:', realOptions);
                    console.log('🔍 [OPTIONS DEBUG] realOptions.length:', realOptions.length);
                    
                    // Determinar quais opções usar
                    const optionsToRender = realOptions.length > 0 ? realOptions : ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
                    
                    if (realOptions.length === 0) {
                      console.log('⚠️ [OPTIONS DEBUG] Nenhuma opção encontrada, usando fallback');
                    } else {
                      console.log('✅ [OPTIONS DEBUG] Usando opções reais:', realOptions);
                    }
                    
                    return optionsToRender.map((option: string, index: number) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = correctAnswerIndex === index;
                    const isWrong = isSelected && !isCorrect;
                    
                    return (
                    <button
                      key={index}
                      onClick={(e) => {
                        console.log('🎯 [CLICK] Iniciando clique no card:', index);
                        console.log('🎯 [CLICK] canInteract:', canInteract);
                            console.log('🎯 [CLICK] option:', option);
                        
                        if (!canInteract) {
                          console.log('🚫 [CLICK] Interação bloqueada');
                          return;
                        }
                        
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('🔥🔥🔥 BOTÃO CLICADO!', index);
                        
                        try {
                          console.log('🚀 [CLICK] Chamando handleAnswerQuestion...');
                          handleAnswerQuestion(index);
                          console.log('✅ [CLICK] handleAnswerQuestion executado');
                        } catch (error) {
                          console.error('❌ [CLICK] Erro ao executar handleAnswerQuestion:', error);
                        }
                      }}
                      disabled={!canInteract}
                      className={`p-3 rounded-lg border-2 transition-all text-left relative z-[9999] ${
                        !canInteract 
                          ? 'opacity-50 cursor-not-allowed'
                          : isCorrect
                          ? 'border-green-500 bg-green-500/10 text-green-500'
                          : isWrong
                          ? 'border-red-500 bg-red-500/10 text-red-500'
                          : isSelected
                          ? 'border-green-400 bg-green-400/10 text-green-400'
                          : 'border-green-300/20 hover:border-green-400/50 hover:bg-green-400/5'
                      } ${canInteract ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      style={{ pointerEvents: canInteract ? 'auto' : 'none', zIndex: 9999 }}
                    >
                      <div className="flex items-center">
                        <span className={`w-6 h-6 rounded-full font-bold flex items-center justify-center mr-3 text-sm ${
                          isCorrect ? 'bg-green-500 text-white' :
                          isWrong ? 'bg-red-500 text-white' :
                          isSelected ? 'bg-green-400 text-white' :
                          'bg-green-300/20 text-green-300'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-white">{option}</span>
                      </div>
                    </button>
                    );
                    });
                  })()}
                </div>
                )}

                {/* Feedback da resposta */}
                {showAnswerFeedback && lastAnswerData && (
                  <div className="mt-2 text-center text-sm">
                    {lastAnswerData.correct ? (
                      <span className="text-green-400 font-bold">✔ Resposta correta!</span>
                    ) : (
                      <span className="text-red-400 font-bold">✖ Resposta incorreta!</span>
                    )}
              </div>
                )}

              </div>

              {/* CARD DO OPONENTE - SÓ VISUALIZAÇÃO */}
              <div className={`bg-gradient-to-r from-red-900/80 to-pink-900/80 backdrop-blur-sm border border-red-500/50 rounded-lg ${isMobile ? 'p-4' : 'p-6'}`}>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-red-300 mb-2">Card do Oponente</h3>
                  <p className="text-sm text-red-400">{opponentCharacter.name}</p>
                  <p className="text-xs text-red-500">ID: {isPlayer1 ? activeRoom?.player2_id?.slice(0, 8) : activeRoom?.player1_id?.slice(0, 8)}...</p>
                  <p className="text-xs text-red-600">(Só visualização)</p>
                </div>
                
                <h2 className="text-xl font-bold text-white mb-4 text-center">
                  {currentQuestionData?.question || (localRoom?.status === 'waiting' ? "⏳ Aguardando sincronização..." : "🔄 Aguardando pergunta inicial...")}
                </h2>
                
                {/* Opções de resposta (só visualização) */}
                <div className="grid grid-cols-1 gap-3">
                  {(currentQuestionData?.options || ['Egípcia', 'Suméria', 'Chinesa', 'Grega']).map((option: string, index: number) => {
                    return (
                    <div
                      key={index}
                        className="p-3 rounded-lg border-2 border-red-300/20 bg-red-500/5"
                    >
                      <div className="flex items-center">
                          <span className="w-6 h-6 rounded-full font-bold flex items-center justify-center mr-3 text-sm bg-red-400/20 text-red-400">
                          {String.fromCharCode(65 + index)}
                        </span>
                          <span className="text-sm text-red-200">{option}</span>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Feedback da resposta */}
            {showAnswerFeedback && lastAnswerData && (
              <div className={`arena-card p-6 mb-8 text-center ${
                lastAnswerData.correct 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-red-500/50 bg-red-500/5'
              }`}>
                <div className="text-4xl mb-3">
                  {lastAnswerData.correct ? '✅' : '❌'}
            </div>
                <p className={`text-xl font-bold ${
                  lastAnswerData.correct ? 'text-green-500' : 'text-red-500'
                }`}>
                  {lastAnswerData.correct ? 'Correto! +1 Ponto' : 'Incorreto!'}
                </p>
                {lastAnswerData.correct && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Você acertou! Aguarde a próxima pergunta...
                  </p>
                )}
          </div>
        )}

            {/* 🏆 TELA DE RESULTADO FINAL */}
            {(() => {
              const shouldShow = (gamePhase === 'finished' || activeRoom?.status === 'finished') && calculatedBattleResult;
              console.log('🔍 [FINAL SCREEN] Debug:', {
                gamePhase,
                roomStatus: activeRoom?.status,
                battleResult,
                calculatedBattleResult,
                winner_id: activeRoom?.winner_id,
                user_id: user?.id,
                shouldShow
              });
              return shouldShow;
            })() && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 rounded-2xl p-8 max-w-md w-full mx-4 border border-purple-500/30">
                  <div className="text-center space-y-6">
                    {/* Ícone de resultado */}
                    <div className="text-6xl">
                      {calculatedBattleResult === 'victory' && '🏆'}
                      {calculatedBattleResult === 'defeat' && '😔'}
                      {calculatedBattleResult === 'draw' && '🤝'}
            </div>
                    
                    {/* Título */}
                    <h2 className="text-3xl font-bold text-white">
                      {calculatedBattleResult === 'victory' && '🎉 VITÓRIA!'}
                      {calculatedBattleResult === 'defeat' && '💔 DERROTA!'}
                      {calculatedBattleResult === 'draw' && '🤝 EMPATE!'}
            </h2>
                    
                    {/* Score final */}
                    <div className="bg-black/30 rounded-lg p-4 space-y-2">
                      <h3 className="text-lg font-semibold text-white">📊 Score Final</h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">
                          {isPlayer1 ? 'Você' : 'Player 1'}: {player1Score} pontos
                        </span>
                        <span className="text-red-400">
                          {isPlayer2 ? 'Você' : 'Player 2'}: {player2Score} pontos
                        </span>
                      </div>
                    </div>
                    
                    {/* Recompensas */}
                    <div className="bg-black/30 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-white mb-2">💰 Recompensas</h3>
                      {calculatedBattleResult === 'victory' && (
                        <p className="text-green-400">+9.5 créditos (Vitória)</p>
                      )}
                      {calculatedBattleResult === 'defeat' && (
                        <p className="text-red-400">-7.0 créditos (Derrota)</p>
                      )}
                      {calculatedBattleResult === 'draw' && (
                        <p className="text-yellow-400">0 créditos (Empate)</p>
                      )}
                    </div>
                    
                    {/* Botões */}
                    <div className="space-y-3">
                      <button
                onClick={() => navigate('/arena')}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-green-500/30"
              >
                🏠 Voltar à Arena
                      </button>
              
                      <button
                onClick={() => navigate('/app')}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg shadow-purple-500/30"
              >
                🎮 Menu Principal
                      </button>
                    </div>
                  </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* 🎮 Componentes de Animação */}
      <PvPAnimations
        showFireEffect={showFireEffect}
        showLightningEffect={showLightningEffect}
        onAnimationComplete={() => {
          setShowFireEffect(false);
          setShowLightningEffect(false);
        }}
      />
      
      <FireParticles active={fireParticles} />
      <LightningParticles active={lightningParticles} />
    </div>
    </div>
  );
};

export default PvPBattle;