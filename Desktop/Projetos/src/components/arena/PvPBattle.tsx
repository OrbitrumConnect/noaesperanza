import { useState, useEffect, useCallback } from 'react';
import { Clock, Target, Zap, Shield, Trophy, ArrowLeft, Crown } from 'lucide-react';
import { ActionButton } from '@/components/arena/ActionButton';
import { Progress } from '@/components/ui/progress';
import { usePvPSystem } from '@/hooks/usePvPSystemTemp';
import { useAuth } from '@/hooks/useAuth';

interface PvPBattleProps {
  roomId: string;
  onBattleFinished: (result: 'victory' | 'defeat' | 'draw') => void;
  onExit: () => void;
}

export const PvPBattle = ({ roomId, onBattleFinished, onExit }: PvPBattleProps) => {
  const { user } = useAuth();
  const { currentRoom, answerQuestion, loading, error } = usePvPSystem();
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [battleStartTime, setBattleStartTime] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  // Timer da pergunta
  useEffect(() => {
    if (!currentRoom || currentRoom.status !== 'playing' || isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Tempo esgotado - resposta automática como errada
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRoom, isAnswered]);

  // Inicializar batalha
  useEffect(() => {
    if (currentRoom && currentRoom.status === 'playing' && !battleStartTime) {
      setBattleStartTime(Date.now());
      setTimeLeft(30);
    }
  }, [currentRoom, battleStartTime]);

  // Verificar se batalha terminou
  useEffect(() => {
    if (currentRoom && currentRoom.status === 'finished') {
      const isPlayer1 = user?.id === currentRoom.player1_id;
      const myScore = isPlayer1 ? currentRoom.player1_score : currentRoom.player2_score;
      const opponentScore = isPlayer1 ? currentRoom.player2_score : currentRoom.player1_score;
      
      let result: 'victory' | 'defeat' | 'draw' = 'draw';
      if (myScore > opponentScore) result = 'victory';
      else if (myScore < opponentScore) result = 'defeat';
      
      onBattleFinished(result);
    }
  }, [currentRoom, user, onBattleFinished]);

  const handleAnswer = useCallback(async (answerIndex: number) => {
    if (isAnswered || !currentRoom || !user) return;

    setIsAnswered(true);
    setSelectedAnswer(answerIndex);

    // Usar current_question da sala (1-25) e converter para índice (0-24)
    const questionIndex = (currentRoom.current_question || 1) - 1;
    const question = currentRoom.questions[questionIndex];
    const isCorrect = answerIndex === question.correct_answer;

    // Adicionar tempo extra se acertou
    if (isCorrect) {
      setTimeLeft(prev => prev + 3);
    }

    // Salvar resposta usando o índice correto
    await answerQuestion(roomId, questionIndex, answerIndex);

    // Mostrar explicação
    setShowExplanation(true);
    
    // Próxima pergunta após 3 segundos
    setTimeout(() => {
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
      setTimeLeft(30);
    }, 3000);
  }, [isAnswered, currentRoom, user, answerQuestion, roomId]);

  if (!currentRoom) {
    return (
      <div className="arena-card p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-epic border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando batalha...</p>
      </div>
    );
  }

  if (currentRoom.status === 'finished') {
    return (
      <div className="arena-card p-6 text-center">
        <div className="mb-4">
          <Crown className="w-12 h-12 text-victory mx-auto mb-2" />
        </div>
        <h3 className="text-xl font-montserrat font-bold mb-2">🏆 Partida Finalizada!</h3>
        <p className="text-muted-foreground mb-4">
          A partida foi concluída. Aguarde o resultado final...
        </p>
        <div className="space-y-2">
          <ActionButton 
            variant="victory" 
            onClick={() => onBattleFinished('victory')}
            className="w-full"
          >
            Ver Resultado
          </ActionButton>
          <ActionButton 
            variant="battle" 
            onClick={onExit}
            className="w-full"
          >
            Voltar ao Lobby
          </ActionButton>
        </div>
      </div>
    );
  }

  if (currentRoom.status !== 'playing') {
    return (
      <div className="arena-card p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-epic border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Aguardando início da batalha...</p>
        <p className="text-sm text-muted-foreground mt-2">Status: {currentRoom.status}</p>
      </div>
    );
  }

  const questionIndex = (currentRoom.current_question || 1) - 1;
  const question = currentRoom.questions[questionIndex];
  const isPlayer1 = user?.id === currentRoom.player1_id;
  const myScore = isPlayer1 ? currentRoom.player1_score : currentRoom.player2_score;
  const opponentScore = isPlayer1 ? currentRoom.player2_score : currentRoom.player1_score;
  const myHp = Math.max(0, 100 - (opponentScore * 10));
  const opponentHp = Math.max(0, 100 - (myScore * 10));

  return (
    <div className="min-h-screen bg-background relative">
      {/* Header da Batalha */}
      <div className="arena-card p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <ActionButton 
            variant="battle" 
            icon={<ArrowLeft />}
            onClick={onExit}
            className="text-sm"
          >
            Sair
          </ActionButton>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-epic">⚔️ Batalha PvP</h2>
            <p className="text-sm text-muted-foreground">
              Pergunta {currentRoom.current_question || 1} de {currentRoom.questions.length}
            </p>
          </div>
          
          <div className="text-right">
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-1" />
              {timeLeft}s
            </div>
          </div>
        </div>

        {/* HP dos Jogadores */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="w-4 h-4 mr-2 text-victory" />
              <span className="font-semibold">Você</span>
            </div>
            <Progress value={myHp} className="mb-1" />
            <div className="text-sm text-muted-foreground">
              {myHp}% HP • {myScore} pontos
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-4 h-4 mr-2 text-warning" />
              <span className="font-semibold">Oponente</span>
            </div>
            <Progress value={opponentHp} className="mb-1" />
            <div className="text-sm text-muted-foreground">
              {opponentHp}% HP • {opponentScore} pontos
            </div>
          </div>
        </div>
      </div>

      {/* Pergunta */}
      <div className="arena-card p-6 mb-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
          
          {showExplanation && (
            <div className="bg-epic/10 border border-epic/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-muted-foreground">
                <strong>Explicação:</strong> {question.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Opções de Resposta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((option, index) => {
            let buttonClass = "w-full p-4 text-left rounded-lg border-2 transition-all ";
            
            if (isAnswered) {
              if (index === question.correct_answer) {
                buttonClass += "border-victory bg-victory/10 text-victory";
              } else if (index === selectedAnswer && index !== question.correct_answer) {
                buttonClass += "border-destructive bg-destructive/10 text-destructive";
              } else {
                buttonClass += "border-muted-foreground/20 bg-muted/10";
              }
            } else {
              buttonClass += "border-muted-foreground/20 hover:border-epic/50 hover:bg-epic/5";
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={isAnswered}
                className={buttonClass}
              >
                <div className="flex items-center">
                  <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold mr-3">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {option}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Status da Batalha */}
      <div className="arena-card p-4 text-center">
        <div className="flex items-center justify-center space-x-4 text-sm">
          <div className="flex items-center">
            <Trophy className="w-4 h-4 mr-1 text-victory" />
            Suas Vitórias: {myScore}
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-1 text-warning" />
            Oponente: {opponentScore}
          </div>
        </div>
      </div>

      {error && (
        <div className="arena-card p-4 mt-4 bg-destructive/10 border-destructive">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}
    </div>
  );
};
