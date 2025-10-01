-- 🚨 CORREÇÃO DE DUPLICATAS NA TABELA ai_keywords
-- Execute no SQL Editor do Supabase

-- 1. Verificar duplicatas existentes
SELECT keyword, COUNT(*) as count
FROM ai_keywords 
GROUP BY keyword 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 2. Remover duplicatas mantendo apenas a mais recente
WITH duplicates AS (
  SELECT keyword, 
         MIN(created_at) as oldest_date,
         MAX(created_at) as newest_date
  FROM ai_keywords 
  GROUP BY keyword 
  HAVING COUNT(*) > 1
),
ids_to_keep AS (
  SELECT ak.id
  FROM ai_keywords ak
  INNER JOIN duplicates d ON ak.keyword = d.keyword
  WHERE ak.created_at = d.newest_date
),
ids_to_delete AS (
  SELECT ak.id
  FROM ai_keywords ak
  INNER JOIN duplicates d ON ak.keyword = d.keyword
  WHERE ak.created_at != d.newest_date
)
DELETE FROM ai_keywords 
WHERE id IN (SELECT id FROM ids_to_delete);

-- 3. Verificar se ainda há duplicatas
SELECT keyword, COUNT(*) as count
FROM ai_keywords 
GROUP BY keyword 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 4. Garantir que a constraint única está funcionando
-- (Se não existir, criar)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ai_keywords_keyword_key'
    ) THEN
        ALTER TABLE ai_keywords 
        ADD CONSTRAINT ai_keywords_keyword_key UNIQUE (keyword);
    END IF;
END $$;

-- 5. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ai_keywords'
ORDER BY ordinal_position;
