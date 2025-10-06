import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  total_xp: number;
  total_battles: number;
  battles_won: number;
  favorite_era: string | null;
  created_at: string;
  updated_at: string;
}

interface UserWallet {
  id: string;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

interface BattleHistory {
  id: string;
  user_id: string;
  era_name: string;
  questions_total: number;
  questions_correct: number;
  accuracy_percentage: number;
  xp_earned: number;
  money_earned: number;
  battle_duration_seconds: number;
  completed_at: string;
}

interface WalletTransaction {
  id: string;
  user_id: string;
  transaction_type: 'earned' | 'spent' | 'bonus';
  amount: number;
  description: string;
  battle_id: string | null;
  created_at: string;
}

export const useDashboard = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<UserWallet | null>(null);
  const [battleHistory, setBattleHistory] = useState<BattleHistory[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obter ID do usuário autenticado
  const getUserId = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      throw new Error('Usuário não autenticado');
    }
    
    return user.id;
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const userId = await getUserId();
      console.log('📊 [DASHBOARD] Carregando dados para usuário:', userId);

      // 1. Tentar carregar do Supabase primeiro
      try {
        // Buscar perfil
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        // Buscar carteira
        const { data: walletData, error: walletError } = await supabase
          .from('user_wallet')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (walletError && walletError.code !== 'PGRST116') {
          throw walletError;
        }

        // Buscar histórico de batalhas
        const { data: battlesData, error: battlesError } = await supabase
          .from('battle_history')
          .select('*')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(20);

        if (battlesError) {
          throw battlesError;
        }

        // Buscar transações
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (transactionsError) {
          throw transactionsError;
        }

        // Se chegou até aqui, dados do Supabase estão funcionando
        if (profileData) {
          setProfile(profileData);
          console.log('✅ Perfil carregado do Supabase');
        }
        if (walletData) {
          setWallet(walletData);
          console.log('✅ Carteira carregada do Supabase');
        }
        if (battlesData) {
          setBattleHistory(battlesData);
          console.log('✅ Histórico carregado do Supabase');
        }
        if (transactionsData) {
          setTransactions(transactionsData as WalletTransaction[]);
          console.log('✅ Transações carregadas do Supabase');
        }

        // Se não há dados no Supabase, criar dados iniciais
        if (!profileData || !walletData) {
          console.log('🆕 Criando dados iniciais no Supabase...');
          
          if (!profileData) {
            // Buscar email do usuário para usar como display_name inicial
            const { data: { user: authUser } } = await supabase.auth.getUser();
            const initialDisplayName = authUser?.email || `Guerreiro ${userId.slice(-4)}`;
            
            const { error: createProfileError } = await supabase
              .from('profiles')
              .insert({
                user_id: userId,
                display_name: initialDisplayName,
                total_xp: 0,
                total_battles: 0,
                battles_won: 0,
              });
            
            if (createProfileError) {
              console.error('Erro ao criar perfil:', createProfileError);
            }
          }

          if (!walletData) {
            const { error: createWalletError } = await supabase
              .from('user_wallet')
              .insert({
                user_id: userId,
                balance: 0,
                total_earned: 0,
                total_spent: 0,
              });
            
            if (createWalletError) {
              console.error('Erro ao criar carteira:', createWalletError);
            }
          }

          // Recarregar dados após criação
          await fetchDashboardData();
          return;
        }

        setError(null);
        setLoading(false);
        return;

      } catch (supabaseError) {
        console.log('❌ Erro no Supabase, usando dados locais:', supabaseError);
        // Fallback para localStorage será implementado aqui
      }

    } catch (err) {
      console.error('❌ Erro ao carregar dados do Supabase:', err);
      setError('Erro ao carregar dados. Verifique sua conexão.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const userId = await getUserId();
      
      // Tentar atualizar no Supabase
      try {
        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', userId)
          .select()
          .single();

        if (error) throw error;
        
        setProfile(data);
        console.log('✅ Perfil atualizado no Supabase');
        return data;
      } catch (supabaseError) {
        console.log('❌ Erro no Supabase, atualizando localmente:', supabaseError);
        
        // Fallback para localStorage
        const localProfile = JSON.parse(localStorage.getItem(`profile_${userId}`) || 'null');
        if (localProfile) {
          const updatedProfile = { ...localProfile, ...updates, updated_at: new Date().toISOString() };
          localStorage.setItem(`profile_${userId}`, JSON.stringify(updatedProfile));
          setProfile(updatedProfile);
          return updatedProfile;
        }
      }
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      throw err;
    }
  };

  const addBattleRecord = async (battleData: Omit<BattleHistory, 'id' | 'user_id' | 'completed_at'>) => {
    try {
      const userId = await getUserId();

      // Tentar salvar no Supabase
      try {
        const { data, error } = await supabase
          .from('battle_history')
          .insert({
            ...battleData,
            user_id: userId,
          })
          .select()
          .single();

        if (error) throw error;

        // Atualizar estatísticas do perfil
        if (profile) {
          const isWin = battleData.questions_correct >= battleData.questions_total * 0.7;
          await updateProfile({
            total_battles: profile.total_battles + 1,
            battles_won: profile.battles_won + (isWin ? 1 : 0),
            total_xp: profile.total_xp + battleData.xp_earned,
          });
        }

        // Atualizar carteira se houver ganhos
        if (battleData.money_earned > 0 && wallet) {
          await supabase
            .from('user_wallet')
            .update({
              balance: wallet.balance + battleData.money_earned,
              total_earned: wallet.total_earned + battleData.money_earned,
            })
            .eq('user_id', userId);

          // Adicionar transação
          await supabase
            .from('wallet_transactions')
            .insert({
              user_id: userId,
              transaction_type: 'earned',
              amount: battleData.money_earned,
              description: `Vitória na batalha: ${battleData.era_name}`,
              battle_id: data.id,
            });
        }

        await fetchDashboardData(); // Atualizar dados
        return data;
      } catch (supabaseError) {
        console.log('❌ Erro no Supabase, salvando localmente:', supabaseError);
        
        // Fallback para localStorage
        const localBattles = JSON.parse(localStorage.getItem(`battles_${userId}`) || '[]');
        const newBattle = {
          ...battleData,
          id: `battle-${Date.now()}`,
          user_id: userId,
          completed_at: new Date().toISOString()
        };
        
        localBattles.unshift(newBattle);
        localStorage.setItem(`battles_${userId}`, JSON.stringify(localBattles));
        
        // Atualizar estado local
        setBattleHistory(localBattles);
        
        return newBattle;
      }
    } catch (err) {
      console.error('Erro ao adicionar registro de batalha:', err);
      throw err;
    }
  };

  // Sincronização em tempo real com localStorage
  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      try {
        const userId = await getUserId();
        
        if (e.key === `profile_${userId}` || e.key === `wallet_${userId}` || e.key === `battles_${userId}`) {
          console.log('🔄 Dados alterados em outra aba, sincronizando...');
          fetchDashboardData();
        }
      } catch (error) {
        // Ignorar se usuário não estiver autenticado
      }
    };

    // 🔄 LISTENER PARA TRANSAÇÕES PVP
    const handlePvPTransaction = (e: CustomEvent) => {
      console.log('💰 [DASHBOARD] Transação PvP detectada:', e.detail);
      console.log('🔄 [DASHBOARD] Recarregando dados...');
      fetchDashboardData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('pvp-transaction', handlePvPTransaction as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('pvp-transaction', handlePvPTransaction as EventListener);
    };
  }, []);

  // Atualização automática periódica
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // Carregar dados na inicialização
  useEffect(() => {
    console.log('🚀 [DASHBOARD] Inicializando carregamento de dados...');
    fetchDashboardData();
  }, []);

  return {
    profile,
    wallet,
    battleHistory,
    transactions,
    loading,
    error,
    refetch: fetchDashboardData,
    updateProfile,
    addBattleRecord,
  };
};