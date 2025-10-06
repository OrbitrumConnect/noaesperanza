// 🤖 Integração Telegram Bot - Arena do Conhecimento
// Token: 8490220608:AAEiyOR8gb0AlQPKaGB-8qQInsLAvFMaAJA

export const TELEGRAM_CONFIG = {
  botToken: '8490220608:AAEiyOR8gb0AlQPKaGB-8qQInsLAvFMaAJA',
  apiUrl: 'https://api.telegram.org/bot',
  webhookUrl: 'https://arenadoconhecimento.vercel.app/api/telegram/webhook',
  
  // Configurações do bot
  botName: 'Arena do Conhecimento Bot',
  botUsername: '@ArenaConhecimentoBot',
  supportChatId: '-1001234567890', // ID do grupo de suporte (será configurado)
  
  // Mensagens padrão
  messages: {
    welcome: `🏛️ *Bem-vindo à Arena do Conhecimento!*

⚔️ *Batalhas épicas de conhecimento*
📚 *4 eras históricas*
🏆 *Sistema de ranking*
💰 *Créditos e recompensas*

Use os comandos abaixo para navegar:

/start - Iniciar
/help - Ajuda
/status - Status da conta
/support - Suporte
/payment - Informações de pagamento
/arena - Acessar arena`,

    help: `🆘 *Comandos disponíveis:*

/start - Iniciar o bot
/help - Mostrar esta ajuda
/status - Ver status da sua conta
/support - Entrar em contato com suporte
/payment - Informações sobre pagamentos
/arena - Link para acessar a arena
/credits - Ver seus créditos
/pvp - Status do PvP

💡 *Dicas:*
• Use /status para ver seu progresso
• Use /support se precisar de ajuda
• Use /payment para informações sobre upgrades`,

    payment: `💳 *Informações de Pagamento*

🏦 *Métodos aceitos:*
• PIX (instantâneo)
• Cartão de crédito
• Boleto bancário

💰 *Preços:*
• Arena Premium: R$ 5,00/mês
• Promoção: 50% de desconto (primeiros 6 meses)

🎯 *Benefícios Premium:*
• Todas as 4 eras históricas
• Arena PvP completa
• Sistema de créditos
• Ranking global
• 21 créditos iniciais

🔗 *Acesse:* https://arenadoconhecimento.vercel.app/payment`,

    support: `🆘 *Suporte Arena do Conhecimento*

📧 *E-mail:* suporte@arenadoconhecimento.com
💬 *Telegram:* @ArenaConhecimentoBot
🌐 *Site:* https://arenadoconhecimento.vercel.app

⏰ *Horário de atendimento:*
Segunda a Sexta: 9h às 18h
Sábado: 9h às 12h

💡 *Para suporte mais rápido:*
• Descreva seu problema
• Inclua seu ID de usuário
• Anexe prints se necessário`
  }
};

// 🎯 Interface para dados do usuário
export interface TelegramUser {
  id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  language_code?: string;
}

// 🎯 Interface para mensagem
export interface TelegramMessage {
  message_id: number;
  from: TelegramUser;
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  date: number;
}

// 🎯 Interface para webhook
export interface TelegramWebhook {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: any;
}

// 🤖 Função para enviar mensagem
export const sendTelegramMessage = async (
  chatId: number | string,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'Markdown'
): Promise<boolean> => {
  try {
    const response = await fetch(`${TELEGRAM_CONFIG.apiUrl}${TELEGRAM_CONFIG.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      console.error('❌ [TELEGRAM] Erro ao enviar mensagem:', response.status);
      return false;
    }

    console.log('✅ [TELEGRAM] Mensagem enviada com sucesso');
    return true;
  } catch (error) {
    console.error('❌ [TELEGRAM] Erro ao enviar mensagem:', error);
    return false;
  }
};

// 🎯 Função para enviar notificação de pagamento
export const sendPaymentNotification = async (
  chatId: number | string,
  paymentData: {
    amount: number;
    method: string;
    status: 'approved' | 'rejected' | 'pending';
    userId: string;
    credits?: number;
  }
): Promise<boolean> => {
  try {
    let emoji = '💰';
    let statusText = '';
    
    switch (paymentData.status) {
      case 'approved':
        emoji = '✅';
        statusText = 'APROVADO';
        break;
      case 'rejected':
        emoji = '❌';
        statusText = 'REJEITADO';
        break;
      case 'pending':
        emoji = '⏳';
        statusText = 'PENDENTE';
        break;
    }

    const message = `${emoji} *Notificação de Pagamento*

💳 *Status:* ${statusText}
💰 *Valor:* R$ ${paymentData.amount.toFixed(2)}
🏦 *Método:* ${paymentData.method}
👤 *Usuário:* ${paymentData.userId}
${paymentData.credits ? `🎯 *Créditos:* ${paymentData.credits}` : ''}

${paymentData.status === 'approved' ? '🎉 Sua conta foi ativada com sucesso!' : ''}
${paymentData.status === 'rejected' ? '❌ Pagamento rejeitado. Tente novamente.' : ''}
${paymentData.status === 'pending' ? '⏳ Aguardando confirmação do pagamento.' : ''}

🔗 *Acesse:* https://arenadoconhecimento.vercel.app`;

    return await sendTelegramMessage(chatId, message);
  } catch (error) {
    console.error('❌ [TELEGRAM] Erro ao enviar notificação de pagamento:', error);
    return false;
  }
};

// 🎯 Função para enviar notificação de PvP
export const sendPvPNotification = async (
  chatId: number | string,
  pvpData: {
    result: 'victory' | 'defeat' | 'draw';
    score: { player: number; opponent: number };
    credits: number;
    userId: string;
  }
): Promise<boolean> => {
  try {
    let emoji = '⚔️';
    let resultText = '';
    
    switch (pvpData.result) {
      case 'victory':
        emoji = '🏆';
        resultText = 'VITÓRIA';
        break;
      case 'defeat':
        emoji = '💔';
        resultText = 'DERROTA';
        break;
      case 'draw':
        emoji = '🤝';
        resultText = 'EMPATE';
        break;
    }

    const message = `${emoji} *Resultado da Batalha PvP*

🎯 *Resultado:* ${resultText}
📊 *Score:* ${pvpData.score.player} x ${pvpData.score.opponent}
💰 *Créditos:* ${pvpData.credits > 0 ? '+' : ''}${pvpData.credits}
👤 *Usuário:* ${pvpData.userId}

${pvpData.result === 'victory' ? '🎉 Parabéns pela vitória!' : ''}
${pvpData.result === 'defeat' ? '💪 Continue treinando!' : ''}
${pvpData.result === 'draw' ? '🤝 Batalha equilibrada!' : ''}

🔗 *Acesse:* https://arenadoconhecimento.vercel.app/arena`;

    return await sendTelegramMessage(chatId, message);
  } catch (error) {
    console.error('❌ [TELEGRAM] Erro ao enviar notificação PvP:', error);
    return false;
  }
};

// 🎯 Função para processar comandos
export const processTelegramCommand = async (
  message: TelegramMessage
): Promise<boolean> => {
  try {
    const command = message.text?.split(' ')[0].toLowerCase();
    const chatId = message.chat.id;

    switch (command) {
      case '/start':
        return await sendTelegramMessage(chatId, TELEGRAM_CONFIG.messages.welcome);
      
      case '/help':
        return await sendTelegramMessage(chatId, TELEGRAM_CONFIG.messages.help);
      
      case '/payment':
        return await sendTelegramMessage(chatId, TELEGRAM_CONFIG.messages.payment);
      
      case '/support':
        return await sendTelegramMessage(chatId, TELEGRAM_CONFIG.messages.support);
      
      case '/arena':
        return await sendTelegramMessage(
          chatId, 
          '🏛️ *Arena do Conhecimento*\n\n🔗 Acesse: https://arenadoconhecimento.vercel.app/arena'
        );
      
      case '/status':
        return await sendTelegramMessage(
          chatId,
          '📊 *Status da Conta*\n\n🔍 Para ver seu status completo, acesse:\nhttps://arenadoconhecimento.vercel.app/dashboard'
        );
      
      case '/credits':
        return await sendTelegramMessage(
          chatId,
          '💰 *Seus Créditos*\n\n🔍 Para ver seu saldo, acesse:\nhttps://arenadoconhecimento.vercel.app/dashboard'
        );
      
      case '/pvp':
        return await sendTelegramMessage(
          chatId,
          '⚔️ *Arena PvP*\n\n🔗 Acesse: https://arenadoconhecimento.vercel.app/arena\n\n💡 Use o botão "🔍 Matchmaking" para encontrar oponentes!'
        );
      
      default:
        return await sendTelegramMessage(
          chatId,
          '❓ *Comando não reconhecido*\n\nUse /help para ver os comandos disponíveis.'
        );
    }
  } catch (error) {
    console.error('❌ [TELEGRAM] Erro ao processar comando:', error);
    return false;
  }
};

// 🎯 Função para configurar webhook
export const setTelegramWebhook = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${TELEGRAM_CONFIG.apiUrl}${TELEGRAM_CONFIG.botToken}/setWebhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: TELEGRAM_CONFIG.webhookUrl,
        allowed_updates: ['message', 'callback_query']
      })
    });

    if (!response.ok) {
      console.error('❌ [TELEGRAM] Erro ao configurar webhook:', response.status);
      return false;
    }

    const result = await response.json();
    console.log('✅ [TELEGRAM] Webhook configurado:', result);
    return result.ok;
  } catch (error) {
    console.error('❌ [TELEGRAM] Erro ao configurar webhook:', error);
    return false;
  }
};

// 🎯 Função para obter informações do bot
export const getBotInfo = async (): Promise<any> => {
  try {
    const response = await fetch(`${TELEGRAM_CONFIG.apiUrl}${TELEGRAM_CONFIG.botToken}/getMe`);
    
    if (!response.ok) {
      console.error('❌ [TELEGRAM] Erro ao obter informações do bot:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('❌ [TELEGRAM] Erro ao obter informações do bot:', error);
    return null;
  }
};

// 🎯 Função para formatar texto para Telegram
export const formatTelegramText = (text: string): string => {
  return text
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!');
};
