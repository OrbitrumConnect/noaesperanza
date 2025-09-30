-- Script para criar a tabela de conversas da NOA no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de conversas da NOA
CREATE TABLE IF NOT EXISTS noa_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  context TEXT,
  category TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_noa_conversations_user_id ON noa_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_noa_conversations_timestamp ON noa_conversations(timestamp);
CREATE INDEX IF NOT EXISTS idx_noa_conversations_category ON noa_conversations(category);
CREATE INDEX IF NOT EXISTS idx_noa_conversations_context ON noa_conversations(context);

-- Habilitar RLS (Row Level Security)
ALTER TABLE noa_conversations ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura e escrita para usuários autenticados
CREATE POLICY "Users can manage their own conversations" ON noa_conversations
  FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL);

-- Política para permitir leitura pública (para conversas anônimas)
CREATE POLICY "Allow public read access to conversations" ON noa_conversations
  FOR SELECT USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_noa_conversations_updated_at 
  BEFORE UPDATE ON noa_conversations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE noa_conversations IS 'Tabela para armazenar histórico de conversas da NOA Esperanza';
COMMENT ON COLUMN noa_conversations.user_id IS 'ID do usuário (pode ser NULL para conversas anônimas)';
COMMENT ON COLUMN noa_conversations.user_message IS 'Mensagem enviada pelo usuário';
COMMENT ON COLUMN noa_conversations.ai_response IS 'Resposta gerada pela IA';
COMMENT ON COLUMN noa_conversations.context IS 'Contexto da conversa';
COMMENT ON COLUMN noa_conversations.category IS 'Categoria da conversa';
COMMENT ON COLUMN noa_conversations.timestamp IS 'Timestamp da conversa';
