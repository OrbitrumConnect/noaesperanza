// 🤖 Hook para integração com Telegram Bot
import { useState, useEffect, useCallback } from 'react';
import { 
  TELEGRAM_CONFIG, 
  sendTelegramMessage, 
  sendPaymentNotification, 
  sendPvPNotification,
  setTelegramWebhook,
  getBotInfo
} from '@/lib/telegram';

export interface TelegramState {
  isConnected: boolean;
  botInfo: any;
  error: string | null;
}

export const useTelegram = () => {
  const [telegramState, setTelegramState] = useState<TelegramState>({
    isConnected: false,
    botInfo: null,
    error: null
  });

  // 🎯 Verificar conexão com o bot
  const checkBotConnection = useCallback(async () => {
    try {
      const botInfo = await getBotInfo();
      
      if (botInfo && botInfo.ok) {
        setTelegramState(prev => ({
          ...prev,
          isConnected: true,
          botInfo: botInfo.result,
          error: null
        }));
        console.log('✅ [TELEGRAM] Bot conectado:', botInfo.result);
        return true;
      } else {
        setTelegramState(prev => ({
          ...prev,
          isConnected: false,
          error: 'Erro ao conectar com o bot'
        }));
        return false;
      }
    } catch (error) {
      console.error('❌ [TELEGRAM] Erro ao verificar conexão:', error);
      setTelegramState(prev => ({
        ...prev,
        isConnected: false,
        error: 'Erro de conexão'
      }));
      return false;
    }
  }, []);

  // 🎯 Configurar webhook
  const setupWebhook = useCallback(async () => {
    try {
      const success = await setTelegramWebhook();
      
      if (success) {
        console.log('✅ [TELEGRAM] Webhook configurado com sucesso');
        return true;
      } else {
        console.error('❌ [TELEGRAM] Erro ao configurar webhook');
        return false;
      }
    } catch (error) {
      console.error('❌ [TELEGRAM] Erro ao configurar webhook:', error);
      return false;
    }
  }, []);

  // 🎯 Enviar mensagem
  const sendMessage = useCallback(async (
    chatId: number | string,
    text: string,
    parseMode: 'HTML' | 'Markdown' = 'Markdown'
  ) => {
    try {
      return await sendTelegramMessage(chatId, text, parseMode);
    } catch (error) {
      console.error('❌ [TELEGRAM] Erro ao enviar mensagem:', error);
      return false;
    }
  }, []);

  // 🎯 Enviar notificação de pagamento
  const notifyPayment = useCallback(async (
    chatId: number | string,
    paymentData: {
      amount: number;
      method: string;
      status: 'approved' | 'rejected' | 'pending';
      userId: string;
      credits?: number;
    }
  ) => {
    try {
      return await sendPaymentNotification(chatId, paymentData);
    } catch (error) {
      console.error('❌ [TELEGRAM] Erro ao enviar notificação de pagamento:', error);
      return false;
    }
  }, []);

  // 🎯 Enviar notificação de PvP
  const notifyPvP = useCallback(async (
    chatId: number | string,
    pvpData: {
      result: 'victory' | 'defeat' | 'draw';
      score: { player: number; opponent: number };
      credits: number;
      userId: string;
    }
  ) => {
    try {
      return await sendPvPNotification(chatId, pvpData);
    } catch (error) {
      console.error('❌ [TELEGRAM] Erro ao enviar notificação PvP:', error);
      return false;
    }
  }, []);

  // 🎯 Inicializar bot
  const initializeBot = useCallback(async () => {
    try {
      setTelegramState(prev => ({ ...prev, error: null }));
      
      // Verificar conexão
      const connected = await checkBotConnection();
      
      if (connected) {
        // Configurar webhook
        await setupWebhook();
        console.log('✅ [TELEGRAM] Bot inicializado com sucesso');
      }
      
      return connected;
    } catch (error) {
      console.error('❌ [TELEGRAM] Erro ao inicializar bot:', error);
      setTelegramState(prev => ({
        ...prev,
        error: 'Erro ao inicializar bot'
      }));
      return false;
    }
  }, [checkBotConnection, setupWebhook]);

  // 🎯 Inicializar automaticamente
  useEffect(() => {
    initializeBot();
  }, [initializeBot]);

  return {
    // Estado
    telegramState,
    
    // Funções
    checkBotConnection,
    setupWebhook,
    sendMessage,
    notifyPayment,
    notifyPvP,
    initializeBot,
    
    // Configurações
    config: TELEGRAM_CONFIG
  };
};
