-- Script para corrigir as políticas RLS da tabela ai_learning
-- Execute este script no SQL Editor do Supabase

-- Remover políticas existentes que estão causando problemas
DROP POLICY IF EXISTS "Users can manage AI learning data" ON ai_learning;
DROP POLICY IF EXISTS "Users can manage AI keywords" ON ai_keywords;
DROP POLICY IF EXISTS "Users can manage AI patterns" ON ai_conversation_patterns;
DROP POLICY IF EXISTS "Allow public read access to AI learning" ON ai_learning;
DROP POLICY IF EXISTS "Allow public read access to AI keywords" ON ai_keywords;
DROP POLICY IF EXISTS "Allow public read access to AI patterns" ON ai_conversation_patterns;

-- Criar novas políticas mais permissivas para o sistema de IA
-- Permitir inserção e atualização para todos (sistema de IA precisa funcionar)
CREATE POLICY "Allow all operations on AI learning" ON ai_learning
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on AI keywords" ON ai_keywords
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on AI patterns" ON ai_conversation_patterns
  FOR ALL USING (true) WITH CHECK (true);

-- Alternativa mais segura: permitir apenas operações específicas
-- Descomente as linhas abaixo se quiser uma abordagem mais restritiva

-- CREATE POLICY "Allow insert and update on AI learning" ON ai_learning
--   FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Allow update on AI learning" ON ai_learning
--   FOR UPDATE USING (true) WITH CHECK (true);
-- 
-- CREATE POLICY "Allow select on AI learning" ON ai_learning
--   FOR SELECT USING (true);
-- 
-- CREATE POLICY "Allow insert and update on AI keywords" ON ai_keywords
--   FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Allow update on AI keywords" ON ai_keywords
--   FOR UPDATE USING (true) WITH CHECK (true);
-- 
-- CREATE POLICY "Allow select on AI keywords" ON ai_keywords
--   FOR SELECT USING (true);
-- 
-- CREATE POLICY "Allow insert and update on AI patterns" ON ai_conversation_patterns
--   FOR INSERT WITH CHECK (true);
-- 
-- CREATE POLICY "Allow update on AI patterns" ON ai_conversation_patterns
--   FOR UPDATE USING (true) WITH CHECK (true);
-- 
-- CREATE POLICY "Allow select on AI patterns" ON ai_conversation_patterns
--   FOR SELECT USING (true);

-- Verificar se as políticas foram aplicadas corretamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('ai_learning', 'ai_keywords', 'ai_conversation_patterns');
