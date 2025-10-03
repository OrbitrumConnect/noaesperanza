-- 🔧 CORREÇÃO DE PERMISSÕES - CONVERSATION_HISTORY
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe e criar se necessário
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  relevance_score FLOAT DEFAULT 0.95,
  focused_context TEXT,
  semantic_features JSONB,
  attention_scores JSONB
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;

-- 3. REMOVER políticas antigas que possam estar causando conflito
DROP POLICY IF EXISTS "Permitir inserção para todos" ON conversation_history;
DROP POLICY IF EXISTS "Permitir leitura para todos" ON conversation_history;
DROP POLICY IF EXISTS "Permitir atualização para todos" ON conversation_history;
DROP POLICY IF EXISTS "Permitir exclusão para todos" ON conversation_history;
DROP POLICY IF EXISTS "conversation_history_insert_policy" ON conversation_history;
DROP POLICY IF EXISTS "conversation_history_select_policy" ON conversation_history;
DROP POLICY IF EXISTS "conversation_history_update_policy" ON conversation_history;
DROP POLICY IF EXISTS "conversation_history_delete_policy" ON conversation_history;

-- 4. CRIAR políticas permissivas para acesso público
-- (Para desenvolvimento - ajustar para produção)

-- Política de INSERT - Permite que qualquer um insira
CREATE POLICY "Allow public insert on conversation_history"
ON conversation_history
FOR INSERT
TO public
WITH CHECK (true);

-- Política de SELECT - Permite que qualquer um leia
CREATE POLICY "Allow public select on conversation_history"
ON conversation_history
FOR SELECT
TO public
USING (true);

-- Política de UPDATE - Permite que qualquer um atualize
CREATE POLICY "Allow public update on conversation_history"
ON conversation_history
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Política de DELETE - Permite que qualquer um delete
CREATE POLICY "Allow public delete on conversation_history"
ON conversation_history
FOR DELETE
TO public
USING (true);

-- 5. Garantir que a coluna user_id aceita texto
ALTER TABLE conversation_history
ALTER COLUMN user_id TYPE TEXT;

-- 6. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id 
ON conversation_history(user_id);

CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at 
ON conversation_history(created_at DESC);

-- 7. Verificar as políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'conversation_history';

-- ✅ Feito! As permissões agora estão configuradas corretamente

