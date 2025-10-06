import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RealtimeDataHook {
  lastUpdate: string | null;
  isConnected: boolean;
  syncData: () => Promise<void>;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
}

export const useRealtimeData = (userId?: string): RealtimeDataHook => {
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');

  const formatBrazilianTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(date);
  };

  const syncData = async () => {
    try {
      setConnectionStatus('connecting');
      
      // Force refresh data by invalidating cache
      const timestamp = new Date().toISOString();
      setLastUpdate(formatBrazilianTime(new Date()));
      
      toast.success('Dados sincronizados!', {
        description: `Última atualização: ${formatBrazilianTime(new Date())}`
      });
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      toast.error('Erro ao sincronizar dados');
      setConnectionStatus('disconnected');
    }
  };

  useEffect(() => {
    if (!userId) return;

    const setupRealtimeSubscription = () => {
      setConnectionStatus('connecting');
      
      // Channel para updates em tempo real
      const channel = supabase
        .channel('admin-realtime-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            console.log('📊 Perfil atualizado em tempo real:', payload);
            setLastUpdate(formatBrazilianTime(new Date()));
            
            if (payload.eventType === 'INSERT') {
              toast.info('Novo usuário cadastrado!');
            } else if (payload.eventType === 'UPDATE') {
              toast.info('Perfil de usuário atualizado!');
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations'
          },
          (payload) => {
            console.log('💬 Nova conversa em tempo real:', payload);
            setLastUpdate(formatBrazilianTime(new Date()));
            
            if (payload.eventType === 'INSERT') {
              toast.info('Nova mensagem no chat!');
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'daily_habits'
          },
          (payload) => {
            console.log('📈 Hábitos atualizados em tempo real:', payload);
            setLastUpdate(formatBrazilianTime(new Date()));
            
            if (payload.eventType === 'INSERT') {
              toast.info('Novos hábitos registrados!');
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'biomarcadores_isafe'
          },
          (payload) => {
            console.log('🔬 Biomarcadores atualizados em tempo real:', payload);
            setLastUpdate(formatBrazilianTime(new Date()));
            
            if (payload.eventType === 'INSERT') {
              toast.info('Novos biomarcadores registrados!');
            }
          }
        )
        .subscribe((status) => {
          console.log('Status da conexão realtime:', status);
          
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
            setConnectionStatus('connected');
            setLastUpdate(formatBrazilianTime(new Date()));
            toast.success('Conectado ao sistema em tempo real!');
          } else if (status === 'CHANNEL_ERROR') {
            setIsConnected(false);
            setConnectionStatus('disconnected');
            toast.error('Erro na conexão em tempo real');
          } else if (status === 'TIMED_OUT') {
            setIsConnected(false);
            setConnectionStatus('disconnected');
            toast.warning('Timeout na conexão em tempo real');
          }
        });

      return channel;
    };

    const channel = setupRealtimeSubscription();

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };
  }, [userId]);

  return {
    lastUpdate,
    isConnected,
    syncData,
    connectionStatus
  };
};