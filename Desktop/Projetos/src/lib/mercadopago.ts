// 🏦 Integração Mercado Pago - PIX e Pagamentos Online
// Chaves fornecidas pelo usuário

export const MERCADOPAGO_CONFIG = {
  // Chave de acesso público (frontend)
  publicKey: 'APP_USR-6870480098957355-091412-70a11f7b1b56153064349b86644e9bdb-2573867170',
  
  // Chave de acesso privada (backend - deve ser usada apenas no servidor)
  accessToken: 'APP_USR-f7d14acd-fa06-48fc-bf28-44a345b82de3',
  
  // Configurações do ambiente
  environment: 'production', // 'sandbox' para testes, 'production' para produção
  
  // URLs de retorno
  successUrl: 'https://arenadoconhecimento.vercel.app/payment/success',
  failureUrl: 'https://arenadoconhecimento.vercel.app/payment/failure',
  pendingUrl: 'https://arenadoconhecimento.vercel.app/payment/pending',
  
  // Webhook configuration
  webhookUrl: 'https://arenadoconhecimento.vercel.app/api/mercadopago/webhook',
  webhookSecret: 'a691ce204ab8cc70ee67fd781952073262102cb0b9876c90e073a862239479cf',
  
  // Eventos do webhook
  webhookEvents: [
    'payment',
    'payment.created',
    'payment.updated',
    'payment.approved',
    'payment.rejected',
    'payment.cancelled',
    'payment.pending',
    'payment.in_process',
    'payment.chargeback',
    'payment.refunded'
  ]
};

// 🎯 Tipos de pagamento suportados
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'boleto';

// 🏦 Configuração de PIX
export const PIX_CONFIG = {
  // Tempo de expiração do PIX (em minutos)
  expirationTime: 30,
  
  // Instruções para o usuário
  instructions: {
    title: 'PIX Instantâneo',
    description: 'Pagamento processado instantaneamente',
    steps: [
      '1. Escaneie o QR Code ou copie o código PIX',
      '2. Abra seu app bancário',
      '3. Escolha PIX e cole o código',
      '4. Confirme o pagamento',
      '5. Aguarde a confirmação automática'
    ]
  }
};

// 💳 Configuração de cartão de crédito
export const CREDIT_CARD_CONFIG = {
  // Bandeiras aceitas
  acceptedBrands: ['visa', 'mastercard', 'amex', 'elo'],
  
  // Parcelamento
  installments: {
    min: 1,
    max: 12,
    default: 1
  }
};

// 🧾 Configuração de boleto
export const BOLETO_CONFIG = {
  // Dias para vencimento
  expirationDays: 3,
  
  // Instruções
  instructions: 'Boleto válido por 3 dias úteis. Após o vencimento, será necessário gerar um novo boleto.'
};

// 💰 Configuração de preços e produtos
export const PRODUCTS_CONFIG = {
  premium: {
    id: 'arena_premium_monthly',
    name: 'Arena Premium - Mensal',
    description: 'Acesso completo a todas as eras históricas e PvP',
    price: 5.00,
    currency: 'BRL',
    category: 'subscription'
  },
  
  premium_promo: {
    id: 'arena_premium_promo',
    name: 'Arena Premium - Promoção 50%',
    description: 'Acesso completo com 50% de desconto',
    price: 2.50,
    currency: 'BRL',
    category: 'subscription'
  }
};

// 🎯 Interface para dados do pagamento
export interface PaymentData {
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  payerEmail: string;
  payerName: string;
  payerDocument: string;
  externalReference?: string;
}

// 🏦 Interface para resposta do Mercado Pago
export interface MercadoPagoResponse {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  payment_method_id: string;
  transaction_amount: number;
  description: string;
  external_reference?: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
      ticket_url?: string;
    };
  };
  payer?: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
}

// 🎯 Função para inicializar Mercado Pago SDK
export const initializeMercadoPago = async (): Promise<boolean> => {
  try {
    // Verificar se o SDK já foi carregado
    if (window.MercadoPago) {
      return true;
    }

    // Carregar o SDK do Mercado Pago
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    
    return new Promise((resolve, reject) => {
      script.onload = () => {
        // Inicializar Mercado Pago
        window.MercadoPago.setPublishableKey(MERCADOPAGO_CONFIG.publicKey);
        console.log('✅ Mercado Pago SDK carregado com sucesso');
        resolve(true);
      };
      
      script.onerror = () => {
        console.error('❌ Erro ao carregar Mercado Pago SDK');
        reject(false);
      };
      
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar Mercado Pago:', error);
    return false;
  }
};

// 🏦 Função para criar preferência de pagamento
export const createPaymentPreference = async (paymentData: PaymentData): Promise<MercadoPagoResponse | null> => {
  try {
    console.log('🏦 [MERCADOPAGO] Criando preferência de pagamento:', paymentData);

    // Preparar dados para a API do Mercado Pago
    const preferenceData = {
      items: [
        {
          id: paymentData.externalReference || 'arena_premium',
          title: paymentData.description,
          quantity: 1,
          unit_price: paymentData.amount,
          currency_id: 'BRL'
        }
      ],
      payer: {
        name: paymentData.payerName,
        email: paymentData.payerEmail,
        identification: {
          type: 'CPF',
          number: paymentData.payerDocument.replace(/\D/g, '')
        }
      },
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 1
      },
      back_urls: {
        success: MERCADOPAGO_CONFIG.successUrl,
        failure: MERCADOPAGO_CONFIG.failureUrl,
        pending: MERCADOPAGO_CONFIG.pendingUrl
      },
      auto_return: 'approved',
      external_reference: paymentData.externalReference,
      notification_url: `${window.location.origin}/api/mercadopago/webhook`
    };

    // Fazer requisição para criar preferência
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_CONFIG.accessToken}`
      },
      body: JSON.stringify(preferenceData)
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Mercado Pago: ${response.status}`);
    }

    const preference = await response.json();
    console.log('✅ [MERCADOPAGO] Preferência criada:', preference);

    return preference;
  } catch (error) {
    console.error('❌ [MERCADOPAGO] Erro ao criar preferência:', error);
    return null;
  }
};

// 🏦 Função para processar pagamento PIX
export const processPixPayment = async (paymentData: PaymentData): Promise<{
  success: boolean;
  qrCode?: string;
  qrCodeBase64?: string;
  paymentId?: string;
  error?: string;
}> => {
  try {
    console.log('🏦 [PIX] Processando pagamento PIX:', paymentData);

    // Criar preferência de pagamento
    const preference = await createPaymentPreference(paymentData);
    
    if (!preference) {
      return {
        success: false,
        error: 'Erro ao criar preferência de pagamento'
      };
    }

    // Buscar dados do PIX
    const pixResponse = await fetch(`https://api.mercadopago.com/v1/payments/${preference.id}`, {
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_CONFIG.accessToken}`
      }
    });

    if (!pixResponse.ok) {
      throw new Error(`Erro ao buscar dados do PIX: ${pixResponse.status}`);
    }

    const pixData = await pixResponse.json();
    
    return {
      success: true,
      qrCode: pixData.point_of_interaction?.transaction_data?.qr_code,
      qrCodeBase64: pixData.point_of_interaction?.transaction_data?.qr_code_base64,
      paymentId: pixData.id
    };
  } catch (error) {
    console.error('❌ [PIX] Erro ao processar pagamento:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

// 💳 Função para processar pagamento com cartão
export const processCardPayment = async (paymentData: PaymentData, cardData: {
  number: string;
  expirationMonth: string;
  expirationYear: string;
  securityCode: string;
  cardholderName: string;
}): Promise<{
  success: boolean;
  paymentId?: string;
  status?: string;
  error?: string;
}> => {
  try {
    console.log('💳 [CARD] Processando pagamento com cartão:', paymentData);

    // Preparar dados do cartão
    const cardPaymentData = {
      transaction_amount: paymentData.amount,
      description: paymentData.description,
      payment_method_id: 'master', // Será detectado automaticamente
      payer: {
        email: paymentData.payerEmail,
        identification: {
          type: 'CPF',
          number: paymentData.payerDocument.replace(/\D/g, '')
        }
      },
      card: {
        card_number: cardData.number.replace(/\D/g, ''),
        expiration_month: cardData.expirationMonth,
        expiration_year: cardData.expirationYear,
        security_code: cardData.securityCode,
        cardholder: {
          name: cardData.cardholderName
        }
      }
    };

    // Processar pagamento
    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MERCADOPAGO_CONFIG.accessToken}`
      },
      body: JSON.stringify(cardPaymentData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erro no pagamento: ${response.status}`);
    }

    const paymentResult = await response.json();
    console.log('✅ [CARD] Pagamento processado:', paymentResult);

    return {
      success: paymentResult.status === 'approved',
      paymentId: paymentResult.id,
      status: paymentResult.status
    };
  } catch (error) {
    console.error('❌ [CARD] Erro ao processar pagamento:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

// 🧾 Função para gerar boleto
export const generateBoleto = async (paymentData: PaymentData): Promise<{
  success: boolean;
  boletoUrl?: string;
  paymentId?: string;
  error?: string;
}> => {
  try {
    console.log('🧾 [BOLETO] Gerando boleto:', paymentData);

    // Criar preferência de pagamento
    const preference = await createPaymentPreference(paymentData);
    
    if (!preference) {
      return {
        success: false,
        error: 'Erro ao criar preferência de pagamento'
      };
    }

    // Buscar dados do boleto
    const boletoResponse = await fetch(`https://api.mercadopago.com/v1/payments/${preference.id}`, {
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_CONFIG.accessToken}`
      }
    });

    if (!boletoResponse.ok) {
      throw new Error(`Erro ao gerar boleto: ${boletoResponse.status}`);
    }

    const boletoData = await boletoResponse.json();
    
    return {
      success: true,
      boletoUrl: boletoData.point_of_interaction?.transaction_data?.ticket_url,
      paymentId: boletoData.id
    };
  } catch (error) {
    console.error('❌ [BOLETO] Erro ao gerar boleto:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

// 🎯 Função para verificar status do pagamento
export const checkPaymentStatus = async (paymentId: string): Promise<{
  success: boolean;
  status?: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MERCADOPAGO_CONFIG.accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao verificar status: ${response.status}`);
    }

    const paymentData = await response.json();
    
    return {
      success: true,
      status: paymentData.status
    };
  } catch (error) {
    console.error('❌ [STATUS] Erro ao verificar status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
};

// 🎯 Função para formatar CPF
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// 🎯 Função para validar CPF
export const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  
  // Validar dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  
  if (parseInt(cleaned[9]) !== digit1) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  
  return parseInt(cleaned[10]) === digit2;
};

// 🎯 Função para formatar número do cartão
export const formatCardNumber = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
};

// 🎯 Função para detectar bandeira do cartão
export const detectCardBrand = (number: string): string => {
  const cleaned = number.replace(/\D/g, '');
  
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6/.test(cleaned)) return 'elo';
  
  return 'unknown';
};

// Declaração global para o SDK do Mercado Pago
declare global {
  interface Window {
    MercadoPago: any;
  }
}
