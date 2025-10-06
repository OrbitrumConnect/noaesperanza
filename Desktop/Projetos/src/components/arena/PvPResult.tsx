import { Trophy, Target, RefreshCw, Home, Coins } from 'lucide-react';
import { ActionButton } from '@/components/arena/ActionButton';
import { usePvPSystem } from '@/hooks/usePvPSystemTemp';
import { useAuth } from '@/hooks/useAuth';

interface PvPResultProps {
  result: 'victory' | 'defeat' | 'draw';
  roomId: string;
  onRematch: () => void;
  onReturnToLobby: () => void;
}

export const PvPResult = ({ result, roomId, onRematch, onReturnToLobby }: PvPResultProps) => {
  const { user } = useAuth();
  const { currentRoom } = usePvPSystem();

  const getResultConfig = () => {
    switch (result) {
      case 'victory':
        return {
          icon: '🏆',
          title: 'Vitória!',
          message: 'Parabéns! Você venceu a batalha!',
          color: 'text-victory',
          bgColor: 'bg-victory/10',
          borderColor: 'border-victory/30',
          credits: '+2.5 créditos'
        };
      case 'defeat':
        return {
          icon: '💀',
          title: 'Derrota',
          message: 'Não foi desta vez, mas continue treinando!',
          color: 'text-destructive',
          bgColor: 'bg-destructive/10',
          borderColor: 'border-destructive/30',
          credits: '-7 créditos'
        };
      case 'draw':
        return {
          icon: '🤝',
          title: 'Empate',
          message: 'Batalha equilibrada! Ambos perderam os créditos.',
          color: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/30',
          credits: '-7 créditos'
        };
    }
  };

  const config = getResultConfig();
  const isPlayer1 = user?.id === currentRoom?.player1_id;
  const myScore = isPlayer1 ? currentRoom?.player1_score : currentRoom?.player2_score;
  const opponentScore = isPlayer1 ? currentRoom?.player2_score : currentRoom?.player1_score;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="arena-card p-8 max-w-md w-full text-center">
        {/* Resultado Principal */}
        <div className={`${config.bgColor} ${config.borderColor} border-2 rounded-lg p-6 mb-6`}>
          <div className="text-6xl mb-4">{config.icon}</div>
          <h2 className={`text-2xl font-bold ${config.color} mb-2`}>
            {config.title}
          </h2>
          <p className="text-muted-foreground mb-4">
            {config.message}
          </p>
          
          {/* Créditos */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Coins className="w-5 h-5 text-epic" />
            <span className="font-semibold text-epic">{config.credits}</span>
          </div>
        </div>

        {/* Estatísticas da Batalha */}
        <div className="arena-card p-4 mb-6">
          <h3 className="font-semibold mb-4">Estatísticas da Batalha</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Trophy className="w-4 h-4 mr-2 text-victory" />
                <span className="font-semibold">Você</span>
              </div>
              <div className="text-2xl font-bold text-victory">{myScore || 0}</div>
              <div className="text-sm text-muted-foreground">pontos</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Target className="w-4 h-4 mr-2 text-warning" />
                <span className="font-semibold">Oponente</span>
              </div>
              <div className="text-2xl font-bold text-warning">{opponentScore || 0}</div>
              <div className="text-sm text-muted-foreground">pontos</div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="text-sm text-muted-foreground space-y-1">
            <div>• 30 perguntas de múltiplas eras</div>
            <div>• Tempo por pergunta: 30 segundos</div>
            <div>• Bônus por acerto: +3 segundos</div>
            <div>• Aposta: 7 créditos</div>
          </div>
        </div>

        {/* Explicação do Sistema */}
        <div className="arena-card p-4 mb-6">
          <h3 className="font-semibold mb-3">Como Funciona o PvP</h3>
          <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-start">
              <div className="w-2 h-2 bg-epic rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Você aposta 7 créditos para entrar na batalha</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-epic rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Quem acerta mais perguntas ganha 2.5 créditos</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-epic rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>O perdedor perde 7 créditos (sistema equilibrado)</p>
            </div>
            <div className="flex items-start">
              <div className="w-2 h-2 bg-epic rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <p>Empate: ambos perdem (plataforma fica com tudo)</p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3">
          <ActionButton 
            variant="victory" 
            icon={<RefreshCw />}
            onClick={onRematch}
            className="w-full"
          >
            Revanche
          </ActionButton>
          
          <ActionButton 
            variant="battle" 
            icon={<Home />}
            onClick={onReturnToLobby}
            className="w-full"
          >
            Voltar ao Lobby
          </ActionButton>
        </div>
      </div>
    </div>
  );
};
