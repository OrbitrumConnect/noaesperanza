import { useState, useEffect } from 'react';
import { X, Sword, Trophy, Star } from 'lucide-react';
import { ActionButton } from '@/components/arena/ActionButton';

interface PvPCreditsNotificationProps {
  isVisible: boolean;
  onClose: () => void;
  creditsReceived: number;
  userName?: string;
}

export const PvPCreditsNotification = ({ 
  isVisible, 
  onClose, 
  creditsReceived = 21,
  userName = "Guerreiro(a)"
}: PvPCreditsNotificationProps) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
      // Auto-close após 8 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`bg-gradient-to-br from-epic/20 to-victory/20 border border-epic/30 rounded-xl p-6 max-w-md w-full backdrop-blur-sm transform transition-all duration-500 ${
        showAnimation ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-epic/20 rounded-full flex items-center justify-center">
              <Sword className="w-6 h-6 text-epic" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-epic">⚔️ PvP Liberado!</h3>
              <p className="text-sm text-muted-foreground">Créditos adicionados</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagem Principal */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="text-xl font-bold text-white mb-2">
            Olá {userName}!
          </h2>
          <p className="text-muted-foreground mb-4">
            Seus créditos de PvP já estão liberados!
          </p>
          
          {/* Créditos Recebidos */}
          <div className="bg-victory/10 border border-victory/30 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-victory" />
              <span className="text-sm font-semibold text-victory">Créditos PvP</span>
            </div>
            <div className="text-2xl font-bold text-victory">
              +{creditsReceived} créditos
            </div>
            <div className="text-xs text-muted-foreground mt-1">
                       1 partida PvP disponível
            </div>
            <div className="text-xs text-orange-400 mt-2 font-semibold">
              ⚠️ Créditos só ganham quando participa do PvP!
            </div>
          </div>
        </div>

        {/* Dica */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-400">💡 Dica</span>
          </div>
          <p className="text-sm text-gray-300">
            Para mais créditos, farme nas Eras! Cada treino pode render até 1,05 créditos.
          </p>
        </div>

        {/* Botões */}
        <div className="flex gap-3">
          <ActionButton
            variant="epic"
            onClick={() => {
              onClose();
              window.location.href = '/pvp';
            }}
            className="flex-1"
            icon={<Sword className="w-4 h-4" />}
          >
            Ir para PvP
          </ActionButton>
          <ActionButton
            variant="victory"
            onClick={() => {
              onClose();
              window.location.href = '/app';
            }}
            className="flex-1"
            icon={<Trophy className="w-4 h-4" />}
          >
            Ver Eras
          </ActionButton>
        </div>

        {/* Auto-close indicator */}
        <div className="mt-4 text-center">
          <div className="text-xs text-muted-foreground">
            Esta notificação será fechada automaticamente em alguns segundos
          </div>
        </div>
      </div>
    </div>
  );
};
