import { useState, useEffect } from 'react';
import { Users, Search, Crown, Zap, Clock, Target } from 'lucide-react';
import { ActionButton } from '@/components/arena/ActionButton';
import { Progress } from '@/components/ui/progress';
import { usePvPSystem } from '@/hooks/usePvPSystemTemp';
import { useAuth } from '@/hooks/useAuth';
import supabase from '@/lib/supabase';
import { PvPBattle } from './PvPBattle';
import { PvPResult } from './PvPResult';

interface PvPLobbyProps {
  onStartBattle: (roomId: string) => void;
}

export const PvPLobby = ({ onStartBattle }: PvPLobbyProps) => {
  const { user } = useAuth();
  const { allQueue, others, totalCount, isInQueue, currentRoom, loading, error, countdown, isConfirming, joinQueue, leaveQueue, clearBattleState, cleanupDuplicateQueueEntries, runMatchmaking, confirmBattle, confirmations, forceRefreshQueue } = usePvPSystem();
  
  // 🎯 LISTENER PARA NOTIFICAÇÕES DE MATCHMAKING
  useEffect(() => {
    if (!user) return;
    
    // Escutar notificações de matchmaking
    const matchmakingChannel = supabase.channel(`matchmaking_${user.id}`);
    if (matchmakingChannel) {
      matchmakingChannel.on('broadcast', { event: 'room_created' }, (payload: any) => {
        console.log('📢 [LOBBY] Notificação de sala criada recebida:', payload);
        if (payload.payload.room_id) {
          console.log('🚀 [LOBBY] Redirecionando para sala:', payload.payload.room_id);
          setTimeout(() => {
            window.location.href = `/arena/battle/${payload.payload.room_id}`;
          }, 1000);
        }
      });
      
      matchmakingChannel.subscribe();
      
      return () => {
        matchmakingChannel.unsubscribe();
      };
    }
  }, [user]);

  // 🚀 LISTENER PARA REDIRECIONAMENTO DIRETO
  useEffect(() => {
    if (!user) return;
    
    // Escutar notificações diretas de redirecionamento
    const playerChannel = supabase.channel(`player_${user.id}`);
    if (playerChannel) {
      playerChannel.on('broadcast', { event: 'redirect_to_battle' }, (payload: any) => {
        console.log('🚀 [LOBBY] Notificação de redirecionamento direto recebida:', payload);
        if (payload.payload.room_id) {
          console.log('🚀 [LOBBY] Redirecionando IMEDIATAMENTE para sala:', payload.payload.room_id);
          window.location.href = `/arena/battle/${payload.payload.room_id}`;
        }
      });
      
      playerChannel.subscribe();
      
      return () => {
        playerChannel.unsubscribe();
      };
    }
  }, [user]);

  // 🎯 LISTENER PARA EVENTO CUSTOMIZADO
  useEffect(() => {
    const handleLeaveQueue = () => {
      leaveQueue();
    };
    
    window.addEventListener('leaveQueue', handleLeaveQueue);
    return () => window.removeEventListener('leaveQueue', handleLeaveQueue);
  }, [leaveQueue]);

  // 🎯 AUTO-REDIRECIONAMENTO QUANDO AMBOS CONFIRMAM
  useEffect(() => {
    if (currentRoom && currentRoom.status === 'playing') {
      console.log('🚀 Ambos confirmaram! Redirecionando para batalha...');
      setBattlePhase('battle');
      onStartBattle(currentRoom.id);
    }
  }, [currentRoom?.status, currentRoom?.id, onStartBattle]);
  const [battlePhase, setBattlePhase] = useState<'lobby' | 'battle' | 'result'>('lobby');
  const [battleResult, setBattleResult] = useState<'victory' | 'defeat' | 'draw' | null>(null);

  // ⚡ PvP Real-time - Preço fixo para todos
  const pvpConfig = {
    name: 'Real-time',
    bet: 7,
    color: 'text-blue-500'
  };

  const handleJoinQueue = async () => {
    // Gerar character_id único para cada usuário
    const selectedCharacterId = Math.floor(Math.random() * 5) + 1; // 1-5 aleatório
    console.log('🎭 Character ID selecionado:', selectedCharacterId);
    await joinQueue('basic', pvpConfig.bet, selectedCharacterId);
  };

  const handleLeaveQueue = async () => {
    await clearBattleState();
  };

  const handleStartBattle = async (roomId: string) => {
    if (!roomId) {
      console.error('❌ Room ID não definido!');
      return;
    }
    
    console.log('🎯 Confirmando batalha com room ID:', roomId);
    
    // Apenas confirmar a batalha - NÃO iniciar ainda
    await confirmBattle(roomId);
    
    // A batalha só será iniciada quando ambos confirmarem
    // Isso será feito automaticamente pelo sistema de confirmações
  };

  const handleBattleFinished = (result: 'victory' | 'defeat' | 'draw') => {
    setBattleResult(result);
    setBattlePhase('result');
  };

  const handleRematch = () => {
    setBattlePhase('lobby');
    setBattleResult(null);
    // TODO: Implementar revanche
  };

  const handleReturnToLobby = () => {
    setBattlePhase('lobby');
    setBattleResult(null);
  };

  // Renderizar fase da batalha
  if (battlePhase === 'battle' && currentRoom) {
    return (
      <PvPBattle 
        roomId={currentRoom.id}
        onBattleFinished={handleBattleFinished}
        onExit={handleReturnToLobby}
      />
    );
  }

  // Renderizar resultado da batalha
  if (battlePhase === 'result' && battleResult && currentRoom) {
    return (
      <PvPResult 
        result={battleResult}
        roomId={currentRoom.id}
        onRematch={handleRematch}
        onReturnToLobby={handleReturnToLobby}
      />
    );
  }

  // Se já está em uma sala, mostrar status
  if (currentRoom) {
    const isPlayer1 = user?.id === currentRoom.player1_id;
    const myConfirmation = confirmations.find(c => c.user_id === user?.id);
    const opponentConfirmation = confirmations.find(c => c.user_id !== user?.id);
    
    return (
      <div className="relative arena-card p-4 text-center mb-4">
        <div className="animate-pulse mb-4">
          <Zap className="w-12 h-12 text-epic mx-auto mb-2" />
        </div>
        <h3 className="text-xl font-montserrat font-bold mb-2">
          {currentRoom.status === 'waiting' || currentRoom.status === 'confirming' ? 'Aguardando Confirmação...' : 'Batalha em Andamento!'}
        </h3>
        
        {/* Status das confirmações */}
        {(currentRoom.status === 'waiting' || currentRoom.status === 'confirming') && (
          <div className="mb-4 space-y-2">
            <div className="flex justify-center items-center space-x-4">
              <div className={`flex items-center space-x-2 ${myConfirmation?.confirmed ? 'text-victory' : 'text-muted-foreground'}`}>
                <div className={`w-3 h-3 rounded-full ${myConfirmation?.confirmed ? 'bg-victory animate-pulse' : 'bg-muted-foreground'}`}></div>
                <span className="text-sm font-semibold">Você</span>
              </div>
              <div className={`flex items-center space-x-2 ${opponentConfirmation?.confirmed ? 'text-victory' : 'text-muted-foreground'}`}>
                <div className={`w-3 h-3 rounded-full ${opponentConfirmation?.confirmed ? 'bg-victory animate-pulse' : 'bg-muted-foreground'}`}></div>
                <span className="text-sm font-semibold">Oponente</span>
              </div>
            </div>
            
            {opponentConfirmation?.confirmed && !myConfirmation?.confirmed && (
              <p className="text-victory text-sm font-semibold animate-pulse">
                🎯 Oponente confirmou! Clique em "Jogar Agora"!
              </p>
            )}
            
            {myConfirmation?.confirmed && !opponentConfirmation?.confirmed && (
              <p className="text-warning text-sm font-semibold">
                ⏳ Aguardando oponente confirmar...
              </p>
            )}
          </div>
        )}
        
        <p className="text-muted-foreground mb-4">
          {currentRoom.status === 'waiting' || currentRoom.status === 'confirming'
            ? 'Aguardando o oponente confirmar a batalha...' 
            : 'Batalha em progresso!'
          }
        </p>
        
        {(currentRoom.status === 'waiting' || currentRoom.status === 'confirming') && (
          <div className="mb-4">
            {countdown !== null ? (
              <>
                <Progress value={(countdown / 30) * 100} className="mb-2" />
                <p className="text-sm text-muted-foreground">
                  ⏰ {countdown} segundos restantes para iniciar a batalha
                </p>
              </>
            ) : (
              <>
                <Progress value={100} className="mb-2" />
                <p className="text-sm text-muted-foreground">Aguardando confirmação...</p>
              </>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <ActionButton 
            variant={opponentConfirmation?.confirmed ? "victory" : "battle"}
            onClick={() => {
              // 🛡️ PREVENIR MÚLTIPLOS CLIQUES
              if (loading || isConfirming) {
                console.log('⚠️ [BUTTON] Já está processando, ignorando clique duplicado');
                return;
              }
              
              console.log('🔍 CurrentRoom no botão:', currentRoom);
              console.log('🔍 CurrentRoom.id:', currentRoom?.id);
              if (currentRoom?.id) {
                handleStartBattle(currentRoom.id);
              } else {
                console.error('❌ Room ID não disponível - currentRoom:', currentRoom);
              }
            }}
            disabled={loading || isConfirming}
            className={`w-full ${opponentConfirmation?.confirmed && !myConfirmation?.confirmed ? 'animate-pulse' : ''}`}
          >
            {currentRoom.status === 'waiting' || currentRoom.status === 'confirming' ? '⚔️ Jogar Agora' : 'Entrar na Batalha'}
          </ActionButton>
          
          <button
            onClick={() => {
              console.log('🔄 [REFRESH] Forçando atualização...');
              forceRefreshQueue();
            }}
            className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            🔄 Atualizar Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" data-pvp-system>
      {/* Status da Fila */}
      <div className="arena-card p-3 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-montserrat font-bold flex items-center">
            <Users className="w-5 h-5 mr-2 text-epic" />
            Guerreiros Online ({totalCount})
          </h3>
          <div className="flex gap-2 flex-wrap">
            <ActionButton 
              variant="battle" 
              onClick={() => window.location.reload()}
              disabled={loading}
              className="text-sm"
            >
              Atualizar
            </ActionButton>
            <ActionButton 
              variant="victory" 
              onClick={() => runMatchmaking()}
              disabled={loading}
              className="text-sm"
            >
              🔍 Matchmaking
            </ActionButton>
            {totalCount >= 2 && (
              <ActionButton 
                variant="battle" 
                onClick={() => {
                  console.log('🎯 [BOTÃO] Forçar Match clicado!');
                  console.log('🎯 [BOTÃO] Total na fila:', totalCount);
                  runMatchmaking();
                }}
                disabled={loading}
                className="text-sm"
              >
                ⚔️ Forçar Match
              </ActionButton>
            )}
            <ActionButton 
              variant="battle" 
              onClick={() => {
                console.log('🧹 [EMERGÊNCIA] Limpando estado...');
                window.history.replaceState({}, '', '/arena');
                window.location.href = '/arena';
              }}
              className="text-sm"
            >
              🧹 Reset
            </ActionButton>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-6">
            <div className="animate-spin w-6 h-6 border-4 border-epic border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-muted-foreground text-sm">Carregando guerreiros...</p>
          </div>
        ) : totalCount === 0 ? (
          <div className="text-center py-6">
            <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhum guerreiro disponível no momento</p>
            <p className="text-xs text-muted-foreground mt-1">
              Seja o primeiro a entrar na fila!
            </p>
          </div>
        ) : totalCount === 1 && isInQueue ? (
          <div className="text-center py-6">
            <Users className="w-10 h-10 text-epic mx-auto mb-3" />
            <p className="text-epic text-sm font-semibold">Você está na fila!</p>
            <p className="text-muted-foreground text-xs mt-1">
              Aguardando adversários...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allQueue.map((player) => {
              const isMe = player.user_id === user?.id;
              return (
                <div key={player.id} className={`arena-card p-3 border ${isMe ? 'border-victory/50 bg-victory/5' : 'border-epic/20'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Crown className={`w-3 h-3 mr-2 ${isMe ? 'text-victory' : 'text-epic'}`} />
                      <span className={`font-semibold text-sm ${isMe ? 'text-victory' : ''}`}>
                        {isMe ? '🎯 Você' : `Guerreiro ${player.user_id.slice(0, 8)}`}
                      </span>
                    </div>
                    <span className={`text-xs font-semibold ${pvpConfig.color}`}>
                      {pvpConfig.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{player.bet_amount} créditos</span>
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.floor((Date.now() - new Date(player.created_at).getTime()) / 1000)}s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Configuração de Batalha */}
      <div id="pvp-config" className="arena-card p-3 mb-4">
        <h3 className="text-lg font-montserrat font-bold mb-3 flex items-center">
          <Target className="w-5 h-5 mr-2 text-epic" />
          Configurar Batalha
        </h3>

        {/* PvP Real-time - Preço Fixo */}
        <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center justify-center">
            <Crown className={`w-5 h-5 mr-2 ${pvpConfig.color}`} />
            <div className="text-center">
              <div className="font-semibold text-sm">{pvpConfig.name}</div>
              <div className="text-xs text-muted-foreground">{pvpConfig.bet} créditos por partida</div>
            </div>
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
            variant="battle" 
            onClick={handleLeaveQueue}
            disabled={loading}
            className="w-full text-lg py-3"
          >
            🧹 Limpar Estado
          </ActionButton>
          
          <ActionButton 
            variant="epic" 
            onClick={forceRefreshQueue}
            disabled={loading}
            className="w-full text-lg py-3"
          >
            🔄 Atualizar Status
          </ActionButton>
          
          <ActionButton 
            variant="battle" 
            onClick={() => {
              console.log('🧪 [DEBUG] Forçando matchmaking...');
              runMatchmaking();
            }}
            disabled={loading}
            className="w-full text-lg py-3"
          >
            🧪 Forçar Matchmaking (Debug)
          </ActionButton>
          
          <ActionButton 
            variant="battle" 
            onClick={() => {
              console.log('🧹 [CLEANUP] Limpando fila duplicada...');
              cleanupDuplicateQueueEntries();
            }}
            disabled={loading}
            className="w-full text-lg py-3 bg-red-600 hover:bg-red-700"
          >
            🧹 Limpar Fila Duplicada
          </ActionButton>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Guia Rápido PvP */}
      <div className="arena-card p-3 mb-4">
        <h3 className="text-base font-montserrat font-bold mb-3 flex items-center">
          <Target className="w-4 h-4 mr-2 text-epic" />
          🎯 Guia Rápido PvP
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center bg-epic/5 border border-epic/20 rounded-lg p-3">
            <div className="w-6 h-6 bg-epic/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-xs font-bold text-epic">1</span>
            </div>
            <p className="font-semibold">🎯 Entrar na Fila - Clique no botão</p>
          </div>
          <div className="flex items-center bg-victory/5 border border-victory/20 rounded-lg p-3">
            <div className="w-6 h-6 bg-victory/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-xs font-bold text-victory">2</span>
            </div>
            <p className="font-semibold">👀 Ver seu nome na lista de guerreiros</p>
          </div>
          <div className="flex items-center bg-warning/5 border border-warning/20 rounded-lg p-3">
            <div className="w-6 h-6 bg-warning/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-xs font-bold text-warning">3</span>
            </div>
            <p className="font-semibold">🔍 Dar Matchmaking - Sistema encontra oponente</p>
          </div>
          <div className="flex items-center bg-battle/5 border border-battle/20 rounded-lg p-3">
            <div className="w-6 h-6 bg-battle/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
              <span className="text-xs font-bold text-battle">4</span>
            </div>
            <p className="font-semibold">⚔️ Jogar Agora - Clique para confirmar batalha</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-background/50 rounded-lg border border-epic/10">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">⏰ 45 segundos por pergunta</span>
            <span className="text-muted-foreground">💰 7 créditos</span>
            <span className="text-muted-foreground">🏆 Ganhador leva tudo</span>
          </div>
        </div>
      </div>
    </div>
  );
};
