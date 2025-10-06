// 💰 Componente para exibir créditos PvP na carteira
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Sword,
  RefreshCw
} from 'lucide-react';
import supabase from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { PVP_CREDITS_CONFIG } from '@/utils/pvpCreditsSystem';

interface PvPTransaction {
  id: string;
  user_id: string;
  room_id: string;
  transaction_type: string;
  amount: number;
  timestamp: string;
  status: string;
}

interface PvPCreditsDisplayProps {
  className?: string;
}

export const PvPCreditsDisplay: React.FC<PvPCreditsDisplayProps> = ({ className = '' }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PvPTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalGames: 0,
    totalWins: 0,
    totalEarnings: 0,
    totalSpent: 0,
    winRate: 0
  });

  // Carregar transações PvP
  const fetchPvPTransactions = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // ✅ SISTEMA DE CRÉDITOS REATIVADO - Tipos corrigidos!
      console.log('✅ [PvP CREDITS] Sistema de transações reativado!');
      
      const { data, error } = await supabase
        .from('pvp_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(10);

      if (error) {
        console.error('❌ Erro ao carregar transações PvP:', error);
        return;
      }

      setTransactions(data || []);

      // Calcular estatísticas
      const gamesPlayed = data?.filter(t => t.transaction_type === 'entry_fee').length || 0;
      const gamesWon = data?.filter(t => t.transaction_type === 'winner_prize').length || 0;
      const totalEarnings = data?.filter(t => t.transaction_type === 'winner_prize')
        .reduce((sum, t) => sum + t.amount, 0) || 0;
      const totalSpent = Math.abs(data?.filter(t => t.transaction_type === 'entry_fee')
        .reduce((sum, t) => sum + t.amount, 0)) || 0;

      setStats({
        totalGames: gamesPlayed,
        totalWins: gamesWon,
        totalEarnings,
        totalSpent,
        winRate: gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0
      });

    } catch (error) {
      console.error('❌ Erro ao carregar transações PvP:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPvPTransactions();
  }, [user]);

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    const color = amount >= 0 ? 'text-green-600' : 'text-red-600';
    return (
      <span className={`font-bold ${color}`}>
        {sign}{amount.toFixed(1)} créditos
      </span>
    );
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'entry_fee':
        return <Sword className="w-4 h-4 text-red-500" />;
      case 'winner_prize':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'refund':
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <Coins className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'entry_fee':
        return 'Taxa de Entrada';
      case 'winner_prize':
        return 'Prêmio de Vitória';
      case 'refund':
        return 'Reembolso';
      default:
        return 'Transação';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sword className="w-5 h-5 text-epic" />
            Arena PvP - Créditos
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchPvPTransactions}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-epic">{stats.totalGames}</div>
            <div className="text-sm text-gray-600">Partidas</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.totalWins}</div>
            <div className="text-sm text-gray-600">Vitórias</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.totalEarnings.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Ganhos</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.totalSpent.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Gastos</div>
          </div>
        </div>

        {/* Taxa de vitória */}
        <div className="text-center p-3 bg-gradient-to-r from-epic/10 to-epic/5 rounded-lg">
          <div className="text-lg font-bold text-epic">
            {stats.winRate.toFixed(1)}% de vitórias
          </div>
          <div className="text-sm text-gray-600">Taxa de sucesso</div>
        </div>

        {/* Configuração atual */}
        <div className="p-3 bg-blue-50 rounded-lg">
          <div className="text-sm font-medium text-blue-800 mb-2">Configuração Atual:</div>
          <div className="text-xs text-blue-600 space-y-1">
            <div>• Taxa de entrada: {PVP_CREDITS_CONFIG.entryFee} créditos</div>
            <div>• Prêmio de vitória: {PVP_CREDITS_CONFIG.winnerPrize} créditos</div>
            <div>• Retenção da plataforma: {PVP_CREDITS_CONFIG.platformRetention} créditos</div>
          </div>
        </div>

        {/* Histórico de transações */}
        {transactions.length > 0 && (
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Últimas Transações:</div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.transaction_type)}
                    <div>
                      <div className="text-sm font-medium">
                        {getTransactionLabel(transaction.transaction_type)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {formatAmount(transaction.amount)}
                    </div>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {transactions.length === 0 && !loading && (
          <div className="text-center py-4 text-gray-500">
            <Sword className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <div className="text-sm">Nenhuma partida PvP ainda</div>
            <div className="text-xs">Jogue sua primeira partida para ver as transações aqui!</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
