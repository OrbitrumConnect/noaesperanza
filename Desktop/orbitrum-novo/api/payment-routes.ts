import express from 'express';
import { MercadoPagoService } from './mercado-pago-config';
import { PaymentProcessor } from './payment-system';
import { storage } from './storage';

const router = express.Router();

// Criar PIX via Mercado Pago
router.post('/create-pix', async (req, res) => {
  try {
    const { amount, tokens, description, userEmail, userId } = req.body;

    console.log('💰 CRIANDO PIX:', { amount, tokens, description, userEmail });

    // Validar dados
    if (!amount || !tokens || !userEmail) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios: amount, tokens, userEmail'
      });
    }

    // Validar valores permitidos
    const allowedAmounts = [3, 6, 9, 18, 32];
    if (!allowedAmounts.includes(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Valor não permitido. Use: R$ 3, 6, 9, 18 ou 32'
      });
    }

    // Criar PIX via Mercado Pago
    const mercadoPagoService = new MercadoPagoService();
    const pixData = await mercadoPagoService.createPixPayment(
          amount,
      description,
      userId || userEmail
    );

    // Salvar transação no storage
    const transaction = {
      id: pixData.id,
      userId: userId,
      userEmail: userEmail,
      amount: amount,
      tokens: tokens,
      description: description,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      pixCode: pixData.qr_code,
      pixImage: pixData.qr_code_base64
    };

    // Adicionar ao storage (verificar se existe)
    if (!storage.pixTransactions) {
      (storage as any).pixTransactions = [];
    }
    (storage as any).pixTransactions.push(transaction);

    console.log('✅ PIX CRIADO:', pixData.id);

    res.json({
      success: true,
      pix: {
        id: pixData.id,
        qrCode: pixData.qr_code,
        qrCodeImage: pixData.qr_code_base64,
        amount: amount,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
      }
    });

    } catch (error) {
    console.error('❌ ERRO AO CRIAR PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno ao gerar PIX'
    });
    }
  });

  // Verificar status do pagamento
router.post('/check-status', async (req, res) => {
  try {
    const { pixId, userEmail } = req.body;

    console.log('🔍 VERIFICANDO PIX:', pixId);

    // Buscar transação
    const transaction = storage.pixTransactions?.find(t => t.id === pixId);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    // Verificar se já foi paga
    if (transaction.status === 'paid') {
      return res.json({
        success: true,
        paid: true,
        message: 'Pagamento já confirmado'
      });
    }

    // Verificar via Mercado Pago
    const mercadoPagoService = new MercadoPagoService();
    const paymentStatus = await mercadoPagoService.checkPaymentStatus(pixId);

    if (paymentStatus.status === 'approved') {
      // Marcar como paga
      transaction.status = 'paid';
      transaction.paidAt = new Date().toISOString();

      // Creditar tokens
      const user = storage.users?.find(u => u.email === userEmail);
      if (user) {
        user.tokensComprados = (user.tokensComprados || 0) + transaction.tokens;
        user.tokens = (user.tokens || 0) + transaction.tokens;
        user.canMakePurchases = true;
        
        console.log('✅ TOKENS CREDITADOS:', {
          user: userEmail,
          tokens: transaction.tokens,
          total: user.tokens
        });
      }

      res.json({
        success: true,
        paid: true,
        message: 'Pagamento confirmado! Tokens creditados.'
      });
    } else {
      res.json({
        success: true,
        paid: false,
        message: 'Pagamento ainda pendente'
      });
    }

  } catch (error) {
    console.error('❌ ERRO AO VERIFICAR PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar pagamento'
    });
  }
});

// Webhook do Mercado Pago
router.post('/webhook/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('📡 WEBHOOK MP:', type, data?.id);

    if (type === 'payment' && data?.id) {
      // Buscar transação
      const transaction = storage.pixTransactions?.find(t => t.id === data.id);
      
      if (transaction && transaction.status !== 'paid') {
        // Verificar status
        const mercadoPagoService = new MercadoPagoService();
        const paymentStatus = await mercadoPagoService.checkPaymentStatus(data.id);

        if (paymentStatus.status === 'approved') {
          // Marcar como paga
          transaction.status = 'paid';
          transaction.paidAt = new Date().toISOString();

          // Creditar tokens
          const user = storage.users?.find(u => u.email === transaction.userEmail);
          if (user) {
            user.tokensComprados = (user.tokensComprados || 0) + transaction.tokens;
            user.tokens = (user.tokens || 0) + transaction.tokens;
            user.canMakePurchases = true;
            
            console.log('✅ WEBHOOK - TOKENS CREDITADOS:', {
              user: transaction.userEmail,
              tokens: transaction.tokens,
              total: user.tokens
            });
          }
        }
      }
    }

    res.json({ success: true });

    } catch (error) {
    console.error('❌ ERRO WEBHOOK:', error);
    res.status(500).json({ success: false });
  }
});

// Processar PIX manual (Admin)
router.post('/admin/process-pix-tokens', async (req, res) => {
  try {
    const { amount, userEmail } = req.body;

    console.log('👨‍💼 ADMIN PROCESSANDO PIX:', { amount, userEmail });

    // Validar admin
    const adminUser = storage.users?.find(u => u.email === 'passosmir4@gmail.com');
    if (!adminUser) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Calcular tokens (R$ 1,00 = 720 tokens)
    const tokens = amount * 720;

    // Buscar usuário
    const user = storage.users?.find(u => u.email === userEmail);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Creditar tokens
    user.tokensComprados = (user.tokensComprados || 0) + tokens;
    user.tokens = (user.tokens || 0) + tokens;
    user.canMakePurchases = true;

    console.log('✅ ADMIN - TOKENS CREDITADOS:', {
      user: userEmail,
      amount: amount,
      tokens: tokens,
      total: user.tokens
    });

    res.json({
      success: true,
      message: `${tokens} tokens creditados para ${userEmail}`,
      user: {
        email: user.email,
        tokens: user.tokens,
        tokensComprados: user.tokensComprados
      }
      });
      
    } catch (error) {
    console.error('❌ ERRO ADMIN PIX:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno'
    });
  }
});

export default router;