import { useState, useEffect, useCallback } from 'react';
import supabase from '@/lib/supabase';

export type UserType = 'free' | 'paid' | 'vip' | 'banned';

export const useUserType = () => {
  const [userType, setUserType] = useState<UserType>('free');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserType = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar usuário autenticado
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // Usuário não autenticado = free
        setUserType('free');
        return;
      }

      // Buscar perfil do usuário no Supabase
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('❌ Erro ao buscar tipo de usuário:', profileError);
        // Se não encontrou perfil, assumir free
        setUserType('free');
        return;
      }

      // Definir tipo de usuário baseado no perfil
      const type = profile.user_type || 'free';
      setUserType(type as UserType);

    } catch (err: any) {
      console.error('❌ Erro ao obter tipo de usuário:', err);
      setError(err.message);
      setUserType('free'); // Fallback para free
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserType();
  }, [fetchUserType]);

  // Função para atualizar tipo de usuário (admin)
  const updateUserType = useCallback(async (newType: UserType) => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ user_type: newType })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setUserType(newType);
      return { success: true };
    } catch (err: any) {
      console.error('❌ Erro ao atualizar tipo de usuário:', err);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    userType,
    loading,
    error,
    fetchUserType,
    updateUserType,
    isFree: userType === 'free',
    isPaid: userType === 'paid',
    isVIP: userType === 'vip',
    isBanned: userType === 'banned'
  };
};
