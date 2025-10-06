// 🤖 Webhook do Telegram Bot - Arena do Conhecimento
// Endpoint: /api/telegram/webhook

import { processTelegramCommand, TELEGRAM_CONFIG } from '../../src/lib/telegram';

export default async function handler(req: any, res: any) {
  // Apenas aceitar requisições POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🤖 [TELEGRAM] Webhook recebido:', req.body);

    const update = req.body;
    
    // Verificar se é uma mensagem
    if (update.message) {
      const message = update.message;
      
      // Verificar se é um comando
      if (message.text && message.text.startsWith('/')) {
        console.log('🤖 [TELEGRAM] Processando comando:', message.text);
        await processTelegramCommand(message);
      } else if (message.text) {
        // Responder a mensagens de texto
        console.log('🤖 [TELEGRAM] Mensagem de texto recebida:', message.text);
        
        // Resposta automática para mensagens não comandos
        const response = `🤖 *Arena do Conhecimento Bot*

Olá! Use os comandos abaixo para navegar:

/start - Iniciar
/help - Ajuda
/status - Status da conta
/support - Suporte
/payment - Informações de pagamento
/arena - Acessar arena

🔗 *Site:* https://arenadoconhecimento.vercel.app`;

        await processTelegramCommand({
          ...message,
          text: response
        });
      }
    }

    // Verificar se é uma callback query (botões inline)
    if (update.callback_query) {
      console.log('🤖 [TELEGRAM] Callback query recebida:', update.callback_query);
      // Processar callback query se necessário
    }

    return res.status(200).json({ status: 'OK' });

  } catch (error) {
    console.error('❌ [TELEGRAM] Erro no webhook:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
