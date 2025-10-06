import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserProfile {
  user_id: string;
  email: string;
  display_name: string;
  total_credits: number;
  total_xp: number;
  total_battles: number;
  battles_won: number;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export function useUser() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🎯 Função para buscar dados do usuário
  const fetchUserData = useCallback(async () => {
    if (!authUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        setError('Erro ao carregar dados do usuário');
        return;
      }

      setProfile(data);
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      setError('Erro desconhecido ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  // 🎯 Função para forçar refresh dos dados
  const refreshUser = useCallback(async () => {
    console.log('🔄 Forçando refresh dos dados do usuário...');
    await fetchUserData();
  }, [fetchUserData]);

  // 🎯 Carregar dados quando o usuário muda
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    user: profile,
    authUser,
    loading: authLoading || loading,
    error,
    refreshUser,
    fetchUserData
  };
}
