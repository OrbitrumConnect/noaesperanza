import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from './useSupabaseAuth';

interface SubscriptionState {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  loading: boolean;
  error: string | null;
}

export const useSubscription = () => {
  const { session, userProfile, isAdmin } = useSupabaseAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    loading: true,
    error: null,
  });

  const checkSubscription = async () => {
    // ✅ Log apenas se não estiver em loading para evitar spam
    if (!state.loading) {
      console.log('🔄 [SUBSCRIPTION] Verificando subscription...', {
        hasSession: !!session?.access_token,
        isAdmin,
        userId: session?.user?.id
      });
    }

    if (!session?.access_token) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    // Se for admin, automaticamente tem acesso premium SEMPRE
    if (isAdmin) {
      console.log('🔑 [SUBSCRIPTION] Admin detectado - acesso premium automático');
      setState({
        subscribed: true,
        subscription_tier: 'Premium Admin',
        subscription_end: null, // Admins têm acesso indefinido
        loading: false,
        error: null,
      });
      return;
    }

    // Para usuários normais, verificar na tabela subscribers do Supabase
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase
        .from('subscribers')
        .select('subscribed, subscription_tier, subscription_end')
        .eq('user_id', session.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ [SUBSCRIPTION] Erro ao verificar assinatura:', error);
        throw error;
      }

      const subscriptionData = data || { subscribed: false, subscription_tier: null, subscription_end: null };
      
      console.log('📊 [SUBSCRIPTION] Dados encontrados:', subscriptionData);
      
      setState({
        subscribed: subscriptionData.subscribed || false,
        subscription_tier: subscriptionData.subscription_tier || null,
        subscription_end: subscriptionData.subscription_end || null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('❌ [SUBSCRIPTION] Erro geral:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to check subscription',
      }));
    }
  };

  const createMercadoPagoCheckout = async (planType: 'club-digital' | 'consulta-completa') => {
    if (!session?.access_token) {
      throw new Error('Usuário não autenticado');
    }
    
    console.log('🛒 [SUBSCRIPTION] Creating MercadoPago checkout for plan:', planType);
    
    const { data, error } = await supabase.functions.invoke('create-mercadopago-checkout', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: { planType },
    });
    
    if (error) {
      console.error('❌ [SUBSCRIPTION] MercadoPago checkout error:', error);
      throw error;
    }
    
    console.log('✅ [SUBSCRIPTION] MercadoPago response:', data);
    
    if (data.checkoutUrl) {
      // Open MercadoPago checkout
      window.open(data.checkoutUrl, '_self');
    }
  };

  const openCustomerPortal = async () => {
    // Função mantida para compatibilidade, mas desabilitada já que não usa mais Stripe
    console.log('Portal do cliente não disponível - usando apenas Mercado Pago');
    throw new Error('Portal do cliente não disponível no momento');
  };

  // Verificar subscription quando session ou admin status mudar
  useEffect(() => {
    checkSubscription();
  }, [session?.access_token, isAdmin]);

  // Auto-refresh otimizado - apenas quando necessário
  useEffect(() => {
    if (!session?.access_token || isAdmin || state.subscribed) return;

    // Só fazer auto-refresh para usuários não-pagos, para detectar quando pagam
    const interval = setInterval(() => {
      console.log('🔄 [SUBSCRIPTION] Auto-refresh (usuário free) executando...');
      checkSubscription();
    }, 60000); // 60 segundos - menos frequente

    return () => clearInterval(interval);
  }, [session?.access_token, isAdmin, state.subscribed]);

  // Sincronização em tempo real com Supabase
  useEffect(() => {
    if (!session?.user?.id || isAdmin) return;

    console.log('📡 [SUBSCRIPTION] Configurando realtime para subscribers...');

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscribers',
          filter: `user_id=eq.${session.user.id}`
        },
        (payload) => {
          console.log('🔄 [SUBSCRIPTION] Mudança detectada:', payload);
          // Aguardar um pouco para garantir que o banco foi atualizado
          setTimeout(() => {
            checkSubscription();
          }, 1000);
        }
      )
      .subscribe();

    return () => {
      console.log('📡 [SUBSCRIPTION] Desconectando realtime...');
      supabase.removeChannel(channel);
    };
  }, [session?.user?.id, isAdmin]);

  // Escutar evento de pagamento bem-sucedido
  useEffect(() => {
    const handlePaymentSuccess = () => {
      console.log('💰 [SUBSCRIPTION] Pagamento detectado - verificando subscription...');
      setTimeout(() => {
        checkSubscription();
      }, 1000);
    };

    window.addEventListener('payment-success', handlePaymentSuccess);
    
    return () => {
      window.removeEventListener('payment-success', handlePaymentSuccess);
    };
  }, []);

  return {
    subscribed: state.subscribed,
    subscription_tier: state.subscription_tier,
    subscription_end: state.subscription_end,
    loading: state.loading,
    error: state.error,
    checkSubscription,
    createMercadoPagoCheckout,
    openCustomerPortal,
  };
};
};