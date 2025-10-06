// 🏦 Webhook do Mercado Pago para Vercel
// Endpoint: /api/mercadopago/webhook

// Para Vercel, usamos a sintaxe padrão do Node.js
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendPaymentNotification } from '../../src/lib/telegram';

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Configuração do Mercado Pago
const MERCADO_PAGO_SECRET = 'a691ce204ab8cc70ee67fd781952073262102cb0b9876c90e073a862239479cf';

interface WebhookData {
  id: string;
  live_mode: boolean;
  type: string;
  date_created: string;
  application_id: string;
  user_id: string;
  version: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
}

interface PaymentData {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'in_process' | 'chargeback' | 'refunded';
  transaction_amount: number;
  description: string;
  external_reference?: string;
  payer?: {
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  payment_method_id: string;
  date_created: string;
  date_approved?: string;
}

export default async function handler(req: any, res: any) {
  // Apenas aceitar requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔔 [WEBHOOK] Recebendo notificação do Mercado Pago');
    
    // Verificar assinatura do webhook
    const signature = req.headers['x-meli-signature'] as string;
    const body = JSON.stringify(req.body);
    
    if (!signature) {
      console.error('❌ [WEBHOOK] Assinatura não encontrada');
      return res.status(401).json({ error: 'Assinatura não encontrada' });
    }

    // Verificar assinatura HMAC
    const hash = crypto
      .createHmac('sha256', MERCADO_PAGO_SECRET)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('❌ [WEBHOOK] Assinatura inválida');
      return res.status(401).json({ error: 'Assinatura inválida' });
    }

    console.log('✅ [WEBHOOK] Assinatura válida');

    const webhookData: WebhookData = req.body;
    console.log('📨 [WEBHOOK] Evento recebido:', {
      type: webhookData.type,
      action: webhookData.action,
      id: webhookData.data.id
    });

    // Processar apenas eventos de pagamento
    if (webhookData.type === 'payment') {
      await processPaymentEvent(webhookData.data.id);
    }

    return res.status(200).json({ status: 'OK' });

  } catch (error) {
    console.error('❌ [WEBHOOK] Erro ao processar webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// 🎯 Processar evento de pagamento
async function processPaymentEvent(paymentId: string) {
  try {
    console.log('💳 [PAYMENT] Processando evento de pagamento:', paymentId);

    // Buscar dados do pagamento no Mercado Pago
    const paymentData = await fetchPaymentData(paymentId);
    
    if (!paymentData) {
      console.error('❌ [PAYMENT] Dados do pagamento não encontrados');
      return;
    }

    console.log('📊 [PAYMENT] Dados do pagamento:', {
      id: paymentData.id,
      status: paymentData.status,
      amount: paymentData.transaction_amount,
      external_reference: paymentData.external_reference
    });

    // Extrair user_id do external_reference
    const externalRef = paymentData.external_reference;
    if (!externalRef || !externalRef.startsWith('arena_')) {
      console.error('❌ [PAYMENT] External reference inválido:', externalRef);
      return;
    }

    const userId = externalRef.split('_')[1];
    if (!userId) {
      console.error('❌ [PAYMENT] User ID não encontrado no external reference');
      return;
    }

    // Processar baseado no status do pagamento
    switch (paymentData.status) {
      case 'approved':
        await handleApprovedPayment(userId, paymentData);
        break;
      case 'rejected':
        await handleRejectedPayment(userId, paymentData);
        break;
      case 'cancelled':
        await handleCancelledPayment(userId, paymentData);
        break;
      case 'refunded':
        await handleRefundedPayment(userId, paymentData);
        break;
      default:
        console.log('ℹ️ [PAYMENT] Status não processado:', paymentData.status);
    }

  } catch (error) {
    console.error('❌ [PAYMENT] Erro ao processar evento de pagamento:', error);
  }
}

// 🏦 Buscar dados do pagamento no Mercado Pago
async function fetchPaymentData(paymentId: string): Promise<PaymentData | null> {
  try {
    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer APP_USR-f7d14acd-fa06-48fc-bf28-44a345b82de3`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ [API] Erro ao buscar dados do pagamento:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('❌ [API] Erro ao buscar dados do pagamento:', error);
    return null;
  }
}

// ✅ Processar pagamento aprovado
async function handleApprovedPayment(userId: string, paymentData: PaymentData) {
  try {
    console.log('✅ [APPROVED] Processando pagamento aprovado para usuário:', userId);

    // Atualizar user_type para 'paid' no Supabase
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        user_type: 'paid',
        payment_status: 'active',
        payment_date: new Date().toISOString(),
        payment_amount: paymentData.transaction_amount
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('❌ [APPROVED] Erro ao atualizar perfil:', profileError);
      return;
    }

    // Criar ou atualizar carteira do usuário com créditos iniciais
    const { error: walletError } = await supabase
      .from('user_wallet')
      .upsert({
        user_id: userId,
        credits_balance: 21, // 21 créditos iniciais para usuários PAID
        balance: 21,
        total_earned: 21,
        total_spent: 0,
        payment_credits: 21,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (walletError) {
      console.error('❌ [APPROVED] Erro ao criar/atualizar carteira:', walletError);
      return;
    }

    // Registrar transação de pagamento
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        payment_id: paymentData.id,
        amount: paymentData.transaction_amount,
        status: 'approved',
        payment_method: paymentData.payment_method_id,
        credits_given: 21,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('❌ [APPROVED] Erro ao registrar transação:', transactionError);
    }

    console.log('✅ [APPROVED] Pagamento processado com sucesso para usuário:', userId);

    // 🤖 Enviar notificação via Telegram
    try {
      await sendPaymentNotification(
        userId, // Usar userId como chatId temporariamente
        {
          amount: paymentData.transaction_amount,
          method: paymentData.payment_method_id,
          status: 'approved',
          userId: userId,
          credits: 21
        }
      );
      console.log('✅ [TELEGRAM] Notificação de pagamento enviada');
    } catch (telegramError) {
      console.error('❌ [TELEGRAM] Erro ao enviar notificação:', telegramError);
    }

  } catch (error) {
    console.error('❌ [APPROVED] Erro ao processar pagamento aprovado:', error);
  }
}

// ❌ Processar pagamento rejeitado
async function handleRejectedPayment(userId: string, paymentData: PaymentData) {
  try {
    console.log('❌ [REJECTED] Processando pagamento rejeitado para usuário:', userId);

    // Registrar transação rejeitada
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        payment_id: paymentData.id,
        amount: paymentData.transaction_amount,
        status: 'rejected',
        payment_method: paymentData.payment_method_id,
        credits_given: 0,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('❌ [REJECTED] Erro ao registrar transação rejeitada:', transactionError);
    }

    console.log('❌ [REJECTED] Pagamento rejeitado registrado para usuário:', userId);

  } catch (error) {
    console.error('❌ [REJECTED] Erro ao processar pagamento rejeitado:', error);
  }
}

// 🚫 Processar pagamento cancelado
async function handleCancelledPayment(userId: string, paymentData: PaymentData) {
  try {
    console.log('🚫 [CANCELLED] Processando pagamento cancelado para usuário:', userId);

    // Registrar transação cancelada
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        payment_id: paymentData.id,
        amount: paymentData.transaction_amount,
        status: 'cancelled',
        payment_method: paymentData.payment_method_id,
        credits_given: 0,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('❌ [CANCELLED] Erro ao registrar transação cancelada:', transactionError);
    }

    console.log('🚫 [CANCELLED] Pagamento cancelado registrado para usuário:', userId);

  } catch (error) {
    console.error('❌ [CANCELLED] Erro ao processar pagamento cancelado:', error);
  }
}

// 🔄 Processar pagamento reembolsado
async function handleRefundedPayment(userId: string, paymentData: PaymentData) {
  try {
    console.log('🔄 [REFUNDED] Processando pagamento reembolsado para usuário:', userId);

    // Atualizar user_type para 'free' no Supabase
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        user_type: 'free',
        payment_status: 'refunded'
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('❌ [REFUNDED] Erro ao atualizar perfil:', profileError);
    }

    // Registrar transação reembolsada
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: userId,
        payment_id: paymentData.id,
        amount: paymentData.transaction_amount,
        status: 'refunded',
        payment_method: paymentData.payment_method_id,
        credits_given: 0,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('❌ [REFUNDED] Erro ao registrar transação reembolsada:', transactionError);
    }

    console.log('🔄 [REFUNDED] Pagamento reembolsado processado para usuário:', userId);

  } catch (error) {
    console.error('❌ [REFUNDED] Erro ao processar pagamento reembolsado:', error);
  }
}
