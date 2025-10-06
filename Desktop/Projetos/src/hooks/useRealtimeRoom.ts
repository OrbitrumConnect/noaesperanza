import { useState, useEffect, useCallback, useRef } from 'react';
import supabase from '@/lib/supabase';

export interface RoomData {
  id: string;
  player1_id: string;
  player2_id: string;
  status: string;
  current_question: number;
  player1_score: number;
  player2_score: number;
  questions?: any[];
  created_at: string;
}

export const useRealtimeRoom = (roomId: string | undefined) => {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  // 🧹 Limpar subscription anterior
  const cleanupChannel = useCallback(() => {
    if (channelRef.current) {
      console.log('🧹 [REALTIME] Limpando subscription anterior');
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
  }, []);

  // 📡 Configurar real-time para a sala
  const setupRealtime = useCallback(async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      setError(null);

      // Limpar subscription anterior
      cleanupChannel();

      console.log('🔄 [REALTIME] Configurando real-time para sala:', roomId);

      // Buscar dados iniciais da sala
      const { data: initialData, error: fetchError } = await (supabase as any)
        .from('pvp_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (fetchError) {
        console.error('❌ [REALTIME] Erro ao buscar sala inicial:', fetchError);
        setError('Sala não encontrada');
        return;
      }

      if (initialData) {
        setRoomData(initialData);
        console.log('✅ [REALTIME] Dados iniciais carregados:', initialData);
      }

      // Configurar subscription real-time
      const channel = (supabase as any)
        .channel(`pvp_room_${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'pvp_rooms',
            filter: `id=eq.${roomId}`
          },
          (payload: any) => {
            console.log('📡 [REALTIME] Atualização recebida:', payload.event, payload);
            
            const updatedRoom = payload.new || payload.old;
            if (updatedRoom) {
              setRoomData(updatedRoom);
              console.log('📡 [REALTIME] Sala atualizada:', updatedRoom);
            }
          }
        )
        .subscribe((status: string) => {
          console.log('📡 [REALTIME] Status da subscription:', status);
          if (status === 'SUBSCRIBED') {
            setLoading(false);
          }
        });

      channelRef.current = channel;

    } catch (err) {
      console.error('❌ [REALTIME] Erro ao configurar real-time:', err);
      setError('Erro ao conectar com a sala');
      setLoading(false);
    }
  }, [roomId, cleanupChannel]);

  // 🔄 Recarregar dados da sala
  const refreshRoom = useCallback(async () => {
    if (!roomId) return;

    try {
      const { data, error } = await (supabase as any)
        .from('pvp_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) {
        console.error('❌ [REALTIME] Erro ao recarregar sala:', error);
        return;
      }

      if (data) {
        setRoomData(data);
        console.log('✅ [REALTIME] Sala recarregada:', data);
      }
    } catch (err) {
      console.error('❌ [REALTIME] Erro ao recarregar sala:', err);
    }
  }, [roomId]);

  // 🎯 Setup inicial
  useEffect(() => {
    setupRealtime();

    // Cleanup ao desmontar
    return () => {
      cleanupChannel();
    };
  }, [setupRealtime, cleanupChannel]);

  // 🧹 Cleanup quando roomId muda
  useEffect(() => {
    return () => {
      cleanupChannel();
    };
  }, [roomId, cleanupChannel]);

  return {
    roomData,
    loading,
    error,
    refreshRoom,
    cleanupChannel
  };
};
