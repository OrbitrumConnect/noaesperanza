import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ConversationMessage {
  id: string;
  user_id: string;
  message_content: string;
  message_type: string;
  session_id: string;
  created_at: string;
  mood_detected?: string;
  biohacking_suggested?: string;
  frequency_suggested?: string;
  conversation_stage?: string;
  data_collected?: any;
}

export function useConversationHistory(userId?: string) {
  const [conversations, setConversations] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const loadConversations = async (sessionId?: string) => {
    if (!userId) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setConversations(data as ConversationMessage[] || []);
    } catch (error) {
      console.error('Erro ao carregar histórico de conversas:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMessage = async (
    messageContent: string,
    messageType: 'user' | 'alice',
    sessionId: string,
    additionalData?: {
      mood_detected?: string;
      biohacking_suggested?: string;
      frequency_suggested?: string;
      conversation_stage?: string;
      data_collected?: any;
    }
  ) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          message_content: messageContent,
          message_type: messageType,
          session_id: sessionId,
          ...additionalData
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Update local state
      setConversations(prev => [...prev, data as ConversationMessage]);
      
      return data;
    } catch (error) {
      console.error('Erro ao salvar mensagem:', error);
      throw error;
    }
  };

  const getSessionHistory = (sessionId: string) => {
    return conversations.filter(conv => conv.session_id === sessionId);
  };

  const getLatestSession = () => {
    if (conversations.length === 0) return null;
    return conversations[conversations.length - 1]?.session_id;
  };

  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  return {
    conversations,
    loading,
    loadConversations,
    saveMessage,
    getSessionHistory,
    getLatestSession
  };
}