-- 🚨 CORREÇÃO DE DUPLICAÇÕES E CONSTRAINTS - EXECUTE NO SQL EDITOR
-- Limpa duplicações e cria constraints corretamente

-- ========================================
-- 1. LIMPAR DUPLICAÇÕES EXISTENTES
-- ========================================

-- Remover duplicações na tabela ai_learning
WITH duplicados AS (
  SELECT 
    keyword, 
    category, 
    MIN(created_at) as data_mais_antiga,
    COUNT(*) as total
  FROM ai_learning 
  GROUP BY keyword, category 
  HAVING COUNT(*) > 1
),
ids_para_manter AS (
  SELECT ai.id
  FROM ai_learning ai
  INNER JOIN duplicados d ON ai.keyword = d.keyword AND ai.category = d.category
  WHERE ai.created_at = d.data_mais_antiga
)
DELETE FROM ai_learning 
WHERE id NOT IN (
  SELECT id FROM ids_para_manter
);

-- Verificar se ainda há duplicações
SELECT 
  'Duplicações restantes:' as status,
  keyword, 
  category, 
  COUNT(*) as total
FROM ai_learning 
GROUP BY keyword, category 
HAVING COUNT(*) > 1;

-- ========================================
-- 2. CRIAR CONSTRAINT ÚNICA
-- ========================================

-- Remover constraint se existir
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'ai_learning_keyword_category_key' 
               AND table_name = 'ai_learning') THEN
        ALTER TABLE ai_learning DROP CONSTRAINT ai_learning_keyword_category_key;
    END IF;
END $$;

-- Criar constraint única
ALTER TABLE ai_learning ADD CONSTRAINT ai_learning_keyword_category_key UNIQUE (keyword, category);

-- ========================================
-- 3. VERIFICAÇÃO FINAL
-- ========================================

-- Verificar constraint criada
SELECT 
  'Constraint criada:' as status,
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'ai_learning' 
AND constraint_type = 'UNIQUE';

-- Verificar total de registros
SELECT 
  'Total de registros únicos:' as status,
  COUNT(*) as total
FROM ai_learning;

-- Verificar por categoria
SELECT 
  'Registros por categoria:' as status,
  category,
  COUNT(*) as total
FROM ai_learning
GROUP BY category
ORDER BY total DESC;

-- ✅ SCRIPT CONCLUÍDO
SELECT '🎉 DUPLICAÇÕES REMOVIDAS E CONSTRAINT CRIADA! 🎉' as status,
       'Agora você pode executar os scripts de dados sem erros.' as message;
