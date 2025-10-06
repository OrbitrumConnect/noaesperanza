// 🏦 Hook personalizado para integração com Mercado Pago
import { useState, useEffect, useCallback } from 'react';
import { 
  MERCADOPAGO_CONFIG, 
  PaymentData, 
  MercadoPagoResponse,
  processPixPayment,
  processCardPayment,
  generateBoleto,
  checkPaymentStatus,
  formatCPF,
  validateCPF,
  formatCardNumber,
  detectCardBrand
} from '@/lib/mercadopago';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PaymentState {
  loading: boolean;
  error: string | null;
  paymentId: string | null;
  status: 'idle' | 'processing' | 'success' | 'error' | 'pending';
  qrCode?: string;
  qrCodeBase64?: string;
  boletoUrl?: string;
}

export interface CardData {
  number: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  cardholderName: string;
}

export const useMercadoPago = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentState, setPaymentState] = useState<PaymentState>({
    loading: false,
    error: null,
    paymentId: null,
    status: 'idle'
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // 🎯 Inicializar Mercado Pago SDK
  const initializeMercadoPago = useCallback(async () => {
    try {
      setPaymentState(prev => ({ ...prev, loading: true }));
      
      // Verificar se o SDK já foi carregado
      if (window.MercadoPago) {
        window.MercadoPago.setPublishableKey(MERCADOPAGO_CONFIG.publicKey);
        setIsInitialized(true);
        setPaymentState(prev => ({ ...prev, loading: false }));
        return true;
      }

      // Carregar o SDK do Mercado Pago
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      
      return new Promise<boolean>((resolve, reject) => {
        script.onload = () => {
          try {
            window.MercadoPago.setPublishableKey(MERCADOPAGO_CONFIG.publicKey);
            console.log('✅ Mercado Pago SDK carregado com sucesso');
            setIsInitialized(true);
            setPaymentState(prev => ({ ...prev, loading: false }));
            resolve(true);
          } catch (error) {
            console.error('❌ Erro ao inicializar Mercado Pago:', error);
            setPaymentState(prev => ({ ...prev, loading: false, error: 'Erro ao inicializar pagamento' }));
            reject(false);
          }
        };
        
        script.onerror = () => {
          console.error('❌ Erro ao carregar Mercado Pago SDK');
          setPaymentState(prev => ({ ...prev, loading: false, error: 'Erro ao carregar sistema de pagamento' }));
          reject(false);
        };
        
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('❌ Erro ao inicializar Mercado Pago:', error);
      setPaymentState(prev => ({ ...prev, loading: false, error: 'Erro ao inicializar pagamento' }));
      return false;
    }
  }, []);

  // 🏦 Processar pagamento PIX
  const processPix = useCallback(async (paymentData: PaymentData) => {
    try {
      setPaymentState(prev => ({ ...prev, loading: true, error: null, status: 'processing' }));
      
      console.log('🏦 [PIX] Processando pagamento PIX:', paymentData);
      
      const result = await processPixPayment(paymentData);
      
      if (result.success) {
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          status: 'pending',
          paymentId: result.paymentId,
          qrCode: result.qrCode,
          qrCodeBase64: result.qrCodeBase64
        }));
        
        toast({
          title: "PIX Gerado!",
          description: "Escaneie o QR Code ou copie o código PIX para pagar",
        });
        
        return result;
      } else {
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          status: 'error',
          error: result.error || 'Erro ao processar PIX'
        }));
        
        toast({
          title: "Erro no PIX",
          description: result.error || 'Erro ao gerar PIX',
          variant: "destructive"
        });
        
        return null;
      }
    } catch (error) {
      console.error('❌ [PIX] Erro ao processar pagamento:', error);
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        status: 'error',
        error: 'Erro interno do sistema'
      }));
      
      toast({
        title: "Erro no PIX",
        description: "Erro interno do sistema",
        variant: "destructive"
      });
      
      return null;
    }
  }, [toast]);

  // 💳 Processar pagamento com cartão
  const processCard = useCallback(async (paymentData: PaymentData, cardData: CardData) => {
    try {
      setPaymentState(prev => ({ ...prev, loading: true, error: null, status: 'processing' }));
      
      console.log('💳 [CARD] Processando pagamento com cartão:', paymentData);
      
      const result = await processCardPayment(paymentData, cardData);
      
      if (result.success) {
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          status: result.status === 'approved' ? 'success' : 'pending',
          paymentId: result.paymentId
        }));
        
        if (result.status === 'approved') {
          toast({
            title: "Pagamento Aprovado!",
            description: "Seu pagamento foi processado com sucesso",
          });
        } else {
          toast({
            title: "Pagamento Pendente",
            description: "Seu pagamento está sendo processado",
          });
        }
        
        return result;
      } else {
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          status: 'error',
          error: result.error || 'Erro ao processar cartão'
        }));
        
        toast({
          title: "Erro no Pagamento",
          description: result.error || 'Erro ao processar cartão',
          variant: "destructive"
        });
        
        return null;
      }
    } catch (error) {
      console.error('❌ [CARD] Erro ao processar pagamento:', error);
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        status: 'error',
        error: 'Erro interno do sistema'
      }));
      
      toast({
        title: "Erro no Pagamento",
        description: "Erro interno do sistema",
        variant: "destructive"
      });
      
      return null;
    }
  }, [toast]);

  // 🧾 Gerar boleto
  const processBoleto = useCallback(async (paymentData: PaymentData) => {
    try {
      setPaymentState(prev => ({ ...prev, loading: true, error: null, status: 'processing' }));
      
      console.log('🧾 [BOLETO] Gerando boleto:', paymentData);
      
      const result = await generateBoleto(paymentData);
      
      if (result.success) {
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          status: 'pending',
          paymentId: result.paymentId,
          boletoUrl: result.boletoUrl
        }));
        
        toast({
          title: "Boleto Gerado!",
          description: "Clique no link para imprimir o boleto",
        });
        
        return result;
      } else {
        setPaymentState(prev => ({
          ...prev,
          loading: false,
          status: 'error',
          error: result.error || 'Erro ao gerar boleto'
        }));
        
        toast({
          title: "Erro no Boleto",
          description: result.error || 'Erro ao gerar boleto',
          variant: "destructive"
        });
        
        return null;
      }
    } catch (error) {
      console.error('❌ [BOLETO] Erro ao gerar boleto:', error);
      setPaymentState(prev => ({
        ...prev,
        loading: false,
        status: 'error',
        error: 'Erro interno do sistema'
      }));
      
      toast({
        title: "Erro no Boleto",
        description: "Erro interno do sistema",
        variant: "destructive"
      });
      
      return null;
    }
  }, [toast]);

  // 🎯 Verificar status do pagamento
  const checkStatus = useCallback(async (paymentId: string) => {
    try {
      console.log('🎯 [STATUS] Verificando status do pagamento:', paymentId);
      
      const result = await checkPaymentStatus(paymentId);
      
      if (result.success) {
        setPaymentState(prev => ({
          ...prev,
          status: result.status === 'approved' ? 'success' : 
                 result.status === 'rejected' ? 'error' : 'pending'
        }));
        
        return result;
      } else {
        console.error('❌ [STATUS] Erro ao verificar status:', result.error);
        return null;
      }
    } catch (error) {
      console.error('❌ [STATUS] Erro ao verificar status:', error);
      return null;
    }
  }, []);

  // 🎯 Limpar estado do pagamento
  const clearPaymentState = useCallback(() => {
    setPaymentState({
      loading: false,
      error: null,
      paymentId: null,
      status: 'idle'
    });
  }, []);

  // 🎯 Criar dados de pagamento padrão
  const createPaymentData = useCallback((amount: number, description: string, paymentMethod: 'pix' | 'credit_card' | 'debit_card' | 'boleto'): PaymentData => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    return {
      amount,
      description,
      paymentMethod,
      payerEmail: user.email || '',
      payerName: user.user_metadata?.full_name || 'Usuário',
      payerDocument: user.user_metadata?.document || '00000000000',
      externalReference: `arena_${user.id}_${Date.now()}`
    };
  }, [user]);

  // 🎯 Inicializar automaticamente quando o hook é usado
  useEffect(() => {
    if (!isInitialized) {
      initializeMercadoPago();
    }
  }, [isInitialized, initializeMercadoPago]);

  return {
    // Estado
    paymentState,
    isInitialized,
    
    // Funções de pagamento
    processPix,
    processCard,
    processBoleto,
    checkStatus,
    clearPaymentState,
    createPaymentData,
    
    // Utilitários
    formatCPF,
    validateCPF,
    formatCardNumber,
    detectCardBrand,
    
    // Configurações
    config: MERCADOPAGO_CONFIG
  };
};

// Declaração global para o SDK do Mercado Pago
declare global {
  interface Window {
    MercadoPago: any;
  }
}
