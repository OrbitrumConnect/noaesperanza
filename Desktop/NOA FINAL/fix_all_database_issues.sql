-- 🚨 CORREÇÃO COMPLETA DE TODOS OS PROBLEMAS DO BANCO
-- Execute no SQL Editor do Supabase

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('noa_conversations', 'ai_conversation_patterns', 'ai_learning')
ORDER BY table_name, ordinal_position;

-- 2. ADICIONAR COLUNAS AUSENTES EM noa_conversations
DO $$ 
BEGIN
    -- Adicionar coluna context se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'noa_conversations' AND column_name = 'context'
    ) THEN
        ALTER TABLE noa_conversations ADD COLUMN context TEXT;
    END IF;
    
    -- Adicionar coluna user_type se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'noa_conversations' AND column_name = 'user_type'
    ) THEN
        ALTER TABLE noa_conversations ADD COLUMN user_type TEXT DEFAULT 'paciente';
    END IF;
END $$;

-- 3. ADICIONAR COLUNAS AUSENTES EM ai_conversation_patterns
DO $$ 
BEGIN
    -- Adicionar coluna user_message se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_conversation_patterns' AND column_name = 'user_message'
    ) THEN
        ALTER TABLE ai_conversation_patterns ADD COLUMN user_message TEXT;
    END IF;
    
    -- Adicionar coluna ai_response se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_conversation_patterns' AND column_name = 'ai_response'
    ) THEN
        ALTER TABLE ai_conversation_patterns ADD COLUMN ai_response TEXT;
    END IF;
    
    -- Adicionar coluna confidence_score se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_conversation_patterns' AND column_name = 'confidence_score'
    ) THEN
        ALTER TABLE ai_conversation_patterns ADD COLUMN confidence_score NUMERIC DEFAULT 0.5;
    END IF;
END $$;

-- 4. CORRIGIR PROBLEMA DE UUID "anonymous"
-- Primeiro, verificar se existem registros com user_id inválido
SELECT 
    'ai_learning' as tabela,
    COUNT(*) as registros_problematicos
FROM ai_learning 
WHERE user_id IS NULL
UNION ALL
SELECT 
    'noa_conversations' as tabela,
    COUNT(*) as registros_problematicos
FROM noa_conversations 
WHERE user_id IS NULL
UNION ALL
SELECT 
    'ai_conversation_patterns' as tabela,
    COUNT(*) as registros_problematicos
FROM ai_conversation_patterns 
WHERE user_id IS NULL;

-- Atualizar registros com user_id NULL (apenas se existirem)
DO $$ 
BEGIN
    -- Verificar se existem registros com user_id NULL antes de atualizar
    IF EXISTS (SELECT 1 FROM ai_learning WHERE user_id IS NULL) THEN
        UPDATE ai_learning 
        SET user_id = gen_random_uuid()
        WHERE user_id IS NULL;
        RAISE NOTICE 'Atualizados registros em ai_learning com user_id NULL';
    END IF;
    
    IF EXISTS (SELECT 1 FROM noa_conversations WHERE user_id IS NULL) THEN
        UPDATE noa_conversations 
        SET user_id = gen_random_uuid()
        WHERE user_id IS NULL;
        RAISE NOTICE 'Atualizados registros em noa_conversations com user_id NULL';
    END IF;
    
    IF EXISTS (SELECT 1 FROM ai_conversation_patterns WHERE user_id IS NULL) THEN
        UPDATE ai_conversation_patterns 
        SET user_id = gen_random_uuid()
        WHERE user_id IS NULL;
        RAISE NOTICE 'Atualizados registros em ai_conversation_patterns com user_id NULL';
    END IF;
END $$;

-- 5. CORRIGIR PROBLEMA DE OPERADOR text[] ~~* unknown
-- Verificar se coluna keywords existe e é do tipo correto
DO $$ 
BEGIN
    -- Se coluna keywords não existir, criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_learning' AND column_name = 'keywords'
    ) THEN
        ALTER TABLE ai_learning ADD COLUMN keywords TEXT[];
    END IF;
    
    -- Se coluna keywords for TEXT, converter para TEXT[]
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_learning' 
        AND column_name = 'keywords' 
        AND data_type = 'text'
    ) THEN
        -- Converter TEXT para TEXT[]
        ALTER TABLE ai_learning ALTER COLUMN keywords TYPE TEXT[] USING string_to_array(keywords, ',');
    END IF;
END $$;

-- 6. CORRIGIR DUPLICATAS EM ai_learning
WITH duplicates AS (
    SELECT keyword, category, MIN(created_at) as oldest_date
    FROM ai_learning 
    GROUP BY keyword, category 
    HAVING COUNT(*) > 1
),
ids_to_delete AS (
    SELECT al.id
    FROM ai_learning al
    INNER JOIN duplicates d ON al.keyword = d.keyword AND al.category = d.category
    WHERE al.created_at != d.oldest_date
)
DELETE FROM ai_learning 
WHERE id IN (SELECT id FROM ids_to_delete);

-- 7. GARANTIR CONSTRAINTS ÚNICAS
DO $$ 
BEGIN
    -- Constraint para ai_learning
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ai_learning_keyword_category_key'
    ) THEN
        ALTER TABLE ai_learning 
        ADD CONSTRAINT ai_learning_keyword_category_key UNIQUE (keyword, category);
    END IF;
    
    -- Constraint para ai_keywords
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ai_keywords_keyword_key'
    ) THEN
        ALTER TABLE ai_keywords 
        ADD CONSTRAINT ai_keywords_keyword_key UNIQUE (keyword);
    END IF;
END $$;

-- 8. VERIFICAR ESTRUTURA FINAL
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('noa_conversations', 'ai_conversation_patterns', 'ai_learning', 'ai_keywords')
ORDER BY table_name, ordinal_position;

-- 9. VERIFICAR CONTAGENS
SELECT 
    'ai_learning' as tabela,
    COUNT(*) as total
FROM ai_learning
UNION ALL
SELECT 
    'ai_keywords' as tabela,
    COUNT(*) as total
FROM ai_keywords
UNION ALL
SELECT 
    'ai_conversation_patterns' as tabela,
    COUNT(*) as total
FROM ai_conversation_patterns
UNION ALL
SELECT 
    'noa_conversations' as tabela,
    COUNT(*) as total
FROM noa_conversations;
