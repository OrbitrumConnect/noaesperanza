import React, { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import TermsConsentModal from '@/components/TermsConsentModal';
import Dashboard from '@/components/Dashboard';
import HealthLanding from '@/components/HealthLanding';
import AuthModal from '@/components/AuthModal';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';

const Index = () => {
  const { user, session, loading } = useSupabaseAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Verificar consentimentos do usuário
  useEffect(() => {
    const checkUserConsents = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('consent_data_usage, consent_treatment, full_name, email')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Erro ao verificar consentimentos:', error);
          return;
        }

        setUserProfile(profile);

        // Se não tem consentimentos, mostrar modal
        if (profile && (!profile.consent_data_usage || !profile.consent_treatment)) {
          setShowTermsModal(true);
        }
      } catch (error) {
        console.error('Erro ao verificar consentimentos:', error);
      }
    };

    if (user && !loading) {
      checkUserConsents();
    }
  }, [user, loading]);

  // Tratar retorno do pagamento MercadoPago
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    
    if (paymentStatus && user) {
      // Limpar parâmetros da URL
      setSearchParams({});
      
      switch (paymentStatus) {
        case 'success':
          toast({
            title: "🎉 Pagamento Aprovado!",
            description: "Seu acesso foi liberado com sucesso. Bem-vindo ao Clube BioRegenere!",
            duration: 6000
          });
          // Aguardar um pouco para o webhook processar e então verificar subscription
          setTimeout(() => {
            // Emitir evento customizado para forçar verificação de subscription
            window.dispatchEvent(new CustomEvent('payment-success'));
          }, 2000);
          break;
        case 'failed':
          toast({
            title: "❌ Pagamento Rejeitado",
            description: "Não foi possível processar seu pagamento. Tente novamente.",
            variant: "destructive",
            duration: 6000
          });
          break;
        case 'pending':
          toast({
            title: "⏳ Pagamento Pendente",
            description: "Seu pagamento está sendo processado. Você será notificado quando aprovado.",
            duration: 6000
          });
          break;
      }
    }
  }, [searchParams, user, setSearchParams, toast]);

  const handleTermsComplete = () => {
    setShowTermsModal(false);
    toast({
      title: "✅ Bem-vindo à plataforma!",
      description: "Agora você pode utilizar todos os recursos disponíveis."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      {user ? (
        <>
          {/* Se não mostrar modal de termos, mostrar o dashboard */}
          {!showTermsModal && <HealthLanding />}
          
          {/* Modal de Termos - aparece se usuário não consentiu */}
          <TermsConsentModal
            isOpen={showTermsModal}
            onComplete={handleTermsComplete}
            userEmail={userProfile?.email}
          />
        </>
      ) : (
        <HealthLanding />
      )}
    </div>
  );
};

export default Index;
