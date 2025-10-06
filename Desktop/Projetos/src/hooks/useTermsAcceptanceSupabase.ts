import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export const useTermsAcceptanceSupabase = () => {
  const { user } = useAuth();
  const [termsAccepted, setTermsAccepted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkTermsAcceptance();
    }
  }, [user]);

  const checkTermsAcceptance = async () => {
    if (!user) {
      setTermsAccepted(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Buscar dados do perfil do usuário
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('terms_accepted, terms_accepted_at, terms_version')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar aceite de termos:', error);
        setTermsAccepted(false);
        return;
      }

      const currentVersion = '1.0';
      
      // Verificar se o usuário já aceitou a versão atual
      if (profile.terms_accepted && profile.terms_version === currentVersion) {
        const acceptDate = new Date(profile.terms_accepted_at);
        const now = new Date();
        const daysSinceAccept = (now.getTime() - acceptDate.getTime()) / (1000 * 3600 * 24);
        
        // Termos válidos por 365 dias (1 ano)
        if (daysSinceAccept < 365) {
          setTermsAccepted(true);
        } else {
          // Termos expirados, precisa aceitar novamente
          setTermsAccepted(false);
        }
      } else {
        // Nunca aceitou ou versão diferente
        setTermsAccepted(false);
      }
    } catch (error) {
      console.error('❌ Erro ao verificar aceite de termos:', error);
      setTermsAccepted(false);
    } finally {
      setLoading(false);
    }
  };

  const acceptTerms = async () => {
    if (!user) {
      console.error('❌ Usuário não autenticado');
      return;
    }

    try {
      const currentVersion = '1.0';
      const now = new Date().toISOString();
      
      // Atualizar perfil no Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          terms_accepted: true,
          terms_accepted_at: now,
          terms_version: currentVersion,
          updated_at: now
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao aceitar termos:', error);
        throw error;
      }

      setTermsAccepted(true);
      console.log('✅ Termos aceitos e salvos no Supabase');
      
    } catch (error) {
      console.error('❌ Erro ao aceitar termos:', error);
      throw error;
    }
  };

  return {
    termsAccepted,
    loading,
    acceptTerms,
    checkTermsAcceptance
  };
};
