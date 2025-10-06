import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { ActionButton } from '@/components/arena/ActionButton';
import { ParticleBackground } from '@/components/ui/particles';
import { usePvPLimit } from '@/hooks/usePvPLimit';
import { useIsMobile } from '@/hooks/use-mobile';
import { getUserPlan, getPvPValues } from '@/utils/creditsIntegration';
import { usePvPSystem } from '@/hooks/usePvPSystemTemp';
import { PvPLobby } from '@/components/arena/PvPLobby';
import { useUserType } from '@/hooks/useUserType';
import { useDashboard } from '@/hooks/useDashboard';

const ArenaNew = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // 🔐 Obter tipo de usuário do Supabase
  const { userType, loading: userTypeLoading } = useUserType();
  
  // 💰 Obter dados da carteira
  const { wallet } = useDashboard();
  
  // 🎯 Usar limites baseados no tipo de usuário
  const pvpLimit = usePvPLimit(userType);
  
  // Obter valores do PvP baseados no plano do usuário
  const pvpValues = getPvPValues();
  
  const userPlan = getUserPlan();
  
  // 🎮 SISTEMA PvP PROFISSIONAL (usePvPSystem - novo)
  const pvpSystem = usePvPSystem();

  return (
    <div className={`${isMobile ? 'h-screen overflow-hidden mobile-container' : 'min-h-screen'} bg-background relative`}>
      {/* Video Background PvP */}
      <div className="absolute inset-0 z-0">
             <video
               autoPlay
               muted
               loop
               playsInline
               className="w-full h-full object-cover opacity-60"
               style={{
                 transform: 'scaleX(1.2)',
                 transformOrigin: 'center center'
               }}
               ref={(video) => {
                 if (video) {
                   video.playbackRate = 0.75;
                 }
               }}
             >
          <source src="/backloobpvp.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-background/30" />
      </div>
      
      <ParticleBackground />
      
      <div className={`relative z-10 max-w-6xl mx-auto ${isMobile ? 'p-4 h-full overflow-y-auto' : 'p-6'}`}>
        <div className="text-center mb-1">
          <ActionButton 
            variant="battle" 
            icon={<ArrowLeft />}
            onClick={() => navigate('/app')}
            className="mb-6"
          >
            Voltar ao Menu
          </ActionButton>
        </div>

        {/* Mini Card de Créditos na Arena */}
        <div className={`bg-epic/5 border border-epic/20 rounded-lg p-3 max-w-md mx-auto ${isMobile ? '' : 'scale-75 -translate-y-1/3'}`}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Créditos Disponíveis</span>
            <span className="text-epic font-bold">{wallet?.balance || 0}</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-muted-foreground">Taxa PvP</span>
            <span className="text-warning font-semibold">{pvpValues.betAmount} créditos</span>
          </div>
        </div>

        <div className={`arena-card-epic p-4 text-center ${isMobile ? 'mb-4' : 'scale-65 -translate-y-2/5'}`}>
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="text-2xl">⚔️</div>
            <div>
              <h2 className="text-lg font-montserrat font-bold text-epic">
                Arena PvP
              </h2>
              <p className="text-xs text-muted-foreground">
                Batalhas épicas de conhecimento
              </p>
            </div>
          </div>
          
          {/* Status Compacto */}
          {userType === 'free' ? (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-2 text-xs">
              <span className="text-destructive font-semibold">🔒 PvP apenas para usuários pagos</span>
            </div>
          ) : (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-2 text-xs">
              <span className="text-warning font-semibold">
                {pvpLimit.getBattlesRemaining()}/{pvpLimit.getPvPLimitInfo().dailyLimit} partidas restantes
              </span>
              <p className="text-muted-foreground mt-1">⚠️ Créditos para uso interno</p>
            </div>
          )}
        </div>

        {/* Sistema PvP Profissional */}
        <PvPLobby onStartBattle={(roomId) => {
          console.log('🎮 Iniciando batalha PvP:', roomId);
          // Navegar para a página de batalha PvP
          navigate(`/arena/battle/${roomId}`);
        }} />

      </div>
    </div>
  );
};

export default ArenaNew;