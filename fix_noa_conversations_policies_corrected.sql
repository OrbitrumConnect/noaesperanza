-- Script corrigido para políticas da tabela noa_conversations
-- Execute este script no SQL Editor do Supabase

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can manage their own conversations" ON noa_conversations;
DROP POLICY IF EXISTS "Allow public read access to conversations" ON noa_conversations;
DROP POLICY IF EXISTS "Allow anonymous conversation insert" ON noa_conversations;

-- Criar políticas corretas para noa_conversations
CREATE POLICY "Users can manage their own conversations" ON noa_conversations
  FOR ALL USING (
    auth.uid()::text = user_id OR 
    user_id IS NULL OR 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Allow public read access to conversations" ON noa_conversations
  FOR SELECT USING (true);

-- Política adicional para permitir inserção de conversas anônimas
CREATE POLICY "Allow anonymous conversation insert" ON noa_conversations
  FOR INSERT WITH CHECK (true);
