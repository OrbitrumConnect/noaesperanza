import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Users, Clock, Trophy, Zap } from 'lucide-react';
import { ActionButton } from '@/components/arena/ActionButton';
import { ParticleBackground } from '@/components/ui/particles';
import { usePvPSystem } from '@/hooks/usePvPSystemTemp';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserType } from '@/hooks/useUserType';

const PvP = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { userType } = useUserType();
  const { 
    joinQueue, 
    leaveQueue, 
    currentRoom, 
    queuePlayers, 
    loading, 
    error 
  } = usePvPSystem();

  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'premium' | 'standard'>('basic');

  const planConfig = {
    basic: { color: 'text-blue-500', name: 'Básico', credits: 7 },
    premium: { color: 'text-purple-500', name: 'Premium', credits: 15 },
    standard: { color: 'text-green-500', name: 'Padrão', credits: 10 }
  };

  const handleJoinQueue = async () => {
    const betAmount = planConfig[selectedPlan].credits;
    await joinQueue(selectedPlan, betAmount);
  };

  const handleLeaveQueue = async () => {
    await leaveQueue();
  };

  // Verificar se usuário tem acesso ao PvP
  if (userType === 'free') {
    return (
      <div className={`${isMobile ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background relative`}>
        <ParticleBackground />
        <div className={`relative z-10 max-w-6xl mx-auto ${isMobile ? 'p-3 h-full overflow-y-auto' : 'p-6'}`}>
          <div className="flex items-center justify-between mb-6">
            <ActionButton 
              variant="battle" 
              icon={<ArrowLeft />} 
              onClick={() => navigate('/app')} 
              className="text-sm"
            >
              Voltar
            </ActionButton>
            <div className="text-center">
              <h1 className="text-2xl font-montserrat font-bold text-epic">
                ⚔️ ARENA PvP
              </h1>
            </div>
            <div className="w-20"></div>
          </div>
          
          <div className="arena-card p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-epic mb-4">
              Acesso Restrito
            </h2>
            <p className="text-muted-foreground mb-6">
              O PvP está disponível apenas para usuários Premium e VIP.
            </p>
            <ActionButton
              variant="epic"
              onClick={() => navigate('/payment')}
              className="text-lg px-8 py-4"
            >
              🚀 Fazer Upgrade
            </ActionButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${isMobile ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-background relative`}>
      <ParticleBackground />
      
      <div className={`relative z-10 max-w-6xl mx-auto ${isMobile ? 'p-3 h-full overflow-y-auto' : 'p-6'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <ActionButton 
            variant="battle" 
            icon={<ArrowLeft />} 
            onClick={() => navigate('/app')} 
            className="text-sm"
          >
            Voltar
          </ActionButton>
          
          <div className="text-center">
            <h1 className="text-2xl font-montserrat font-bold text-epic">
              ⚔️ ARENA PvP
            </h1>
            <p className="text-sm text-muted-foreground">
              Batalhas Épicas de Conhecimento
            </p>
          </div>
          
          <div className="w-20"></div>
        </div>

        {/* Status da Fila */}
        <div className="arena-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-epic flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Status da Fila
            </h2>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">
                {queuePlayers?.length || 0} jogador(es) online
              </span>
            </div>
          </div>

          {/* Guerreiros na Fila */}
          <div className="space-y-3">
            {queuePlayers && queuePlayers.length > 0 ? (
              queuePlayers.map((player, index) => (
                <div key={player.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center">
                    <Crown className="w-4 h-4 text-epic mr-2" />
                    <span className="font-semibold text-sm">Guerreiro</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`text-xs font-semibold ${planConfig[player.plan_type as keyof typeof planConfig]?.color || 'text-blue-500'}`}>
                      {planConfig[player.plan_type as keyof typeof planConfig]?.name || 'Básico'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {player.bet_amount} créditos
                    </span>
                    <span className="text-xs text-green-500">
                      {Math.floor((Date.now() - new Date(player.created_at).getTime()) / 1000)}s
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum guerreiro na fila</p>
                <p className="text-sm">Seja o primeiro a entrar!</p>
              </div>
            )}
          </div>
        </div>

        {/* Configuração da Batalha */}
        <div className="arena-card p-6 mb-6">
          <h2 className="text-xl font-bold text-epic mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            Configurar Batalha
          </h2>

          {/* Tipo de Batalha */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-muted-foreground mb-3">
              Tipo de Batalha
            </label>
            <div className="grid grid-cols-3 gap-3">
              {Object.entries(planConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlan(key as any)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    selectedPlan === key
                      ? 'border-epic bg-epic/10'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className={`font-bold ${config.color}`}>
                      {config.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {config.credits} créditos
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>


          {/* Botões de Ação */}
          <div className="space-y-3">
            <ActionButton
              variant="victory"
              onClick={handleJoinQueue}
              disabled={loading}
              className="w-full text-lg py-4"
            >
              <Search className="w-5 h-5 mr-2" />
              🎯 Entrar na Fila PvP
            </ActionButton>

            <ActionButton
              variant="destructive"
              onClick={handleLeaveQueue}
              disabled={loading}
              className="w-full text-lg py-3"
            >
              🚪 Sair da Fila
            </ActionButton>
          </div>
        </div>

        {/* Como Funciona */}
        <div className="arena-card p-6">
          <h2 className="text-xl font-bold text-epic mb-4 flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Como Funciona
          </h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-epic rounded-full flex items-center justify-center text-xs font-bold text-black">1</div>
              <p>Entre na fila e aguarde um oponente disponível</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-epic rounded-full flex items-center justify-center text-xs font-bold text-black">2</div>
              <p>Quando encontrar um oponente, você terá 30 segundos para confirmar</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-epic rounded-full flex items-center justify-center text-xs font-bold text-black">3</div>
              <p>Batalha com 30 perguntas de diferentes eras</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-epic rounded-full flex items-center justify-center text-xs font-bold text-black">4</div>
              <p>Quem acertar mais perguntas ganha os créditos apostados</p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PvP;
