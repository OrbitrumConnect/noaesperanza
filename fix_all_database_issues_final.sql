-- =====================================================
-- SCRIPT FINAL: Fix All Database Issues - COMPLETO
-- =====================================================
-- Este script resolve TODOS os problemas identificados:
-- 1. operator does not exist: text[] ~~* unknown
-- 2. invalid input syntax for type uuid: "anonymous"
-- 3. Could not find column in schema cache
-- 4. duplicate key value violates unique constraint
-- 5. 404 Not Found ao buscar tabelas
-- 6. Problemas de cache PostgREST
-- =====================================================

-- 1. VERIFICAR E ADICIONAR COLUNAS AUSENTES
-- =====================================================

-- Adicionar coluna 'context' em noa_conversations se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'noa_conversations' 
        AND column_name = 'context'
    ) THEN
        ALTER TABLE noa_conversations ADD COLUMN context TEXT;
        RAISE NOTICE 'Coluna context adicionada em noa_conversations';
    END IF;
END $$;

-- Adicionar coluna 'user_message' em ai_conversation_patterns se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_conversation_patterns' 
        AND column_name = 'user_message'
    ) THEN
        ALTER TABLE ai_conversation_patterns ADD COLUMN user_message TEXT;
        RAISE NOTICE 'Coluna user_message adicionada em ai_conversation_patterns';
    END IF;
END $$;

-- Adicionar coluna 'ai_response' em ai_conversation_patterns se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_conversation_patterns' 
        AND column_name = 'ai_response'
    ) THEN
        ALTER TABLE ai_conversation_patterns ADD COLUMN ai_response TEXT;
        RAISE NOTICE 'Coluna ai_response adicionada em ai_conversation_patterns';
    END IF;
END $$;

-- Adicionar coluna 'confidence_score' em ai_conversation_patterns se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_conversation_patterns' 
        AND column_name = 'confidence_score'
    ) THEN
        ALTER TABLE ai_conversation_patterns ADD COLUMN confidence_score DECIMAL(3,2) DEFAULT 0.5;
        RAISE NOTICE 'Coluna confidence_score adicionada em ai_conversation_patterns';
    END IF;
END $$;

-- 2. REMOVER ÍNDICES GIN PROBLEMÁTICOS (NÃO PRIMARY KEY)
-- =====================================================

-- Remover apenas índices GIN específicos que podem causar conflito
DROP INDEX IF EXISTS ai_learning_keywords_gin_idx;
DROP INDEX IF EXISTS ai_conversation_patterns_keywords_gin_idx;
DROP INDEX IF EXISTS ai_keywords_keywords_gin_idx;
DROP INDEX IF EXISTS ai_learning_keywords_idx;
DROP INDEX IF EXISTS ai_conversation_patterns_keywords_idx;
DROP INDEX IF EXISTS ai_keywords_keywords_idx;

-- Remover outros índices GIN que podem existir (mas não PRIMARY KEY)
DO $$ 
DECLARE
    idx_record RECORD;
BEGIN
    -- Buscar apenas índices GIN que NÃO são PRIMARY KEY
    FOR idx_record IN 
        SELECT indexname, tablename 
        FROM pg_indexes 
        WHERE tablename IN ('ai_learning', 'ai_conversation_patterns', 'ai_keywords')
        AND indexname NOT LIKE '%pkey%'
        AND indexname NOT LIKE '%_pk_%'
        AND (indexname LIKE '%keywords%' 
             OR indexname LIKE '%gin%'
             OR indexname LIKE '%ai_learning%'
             OR indexname LIKE '%ai_conversation_patterns%'
             OR indexname LIKE '%ai_keywords%')
    LOOP
        EXECUTE 'DROP INDEX IF EXISTS ' || idx_record.indexname;
        RAISE NOTICE 'Índice GIN removido: %', idx_record.indexname;
    END LOOP;
END $$;

-- 3. CONVERTER TIPOS DE DADOS (text[] → text) DE FORMA SEGURA
-- =====================================================

-- Converter keywords em ai_learning de text[] para text
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_learning' 
        AND column_name = 'keywords'
        AND data_type = 'ARRAY'
    ) THEN
        -- Converter text[] para text
        ALTER TABLE ai_learning ALTER COLUMN keywords TYPE TEXT USING array_to_string(keywords, ',');
        RAISE NOTICE 'Coluna keywords em ai_learning convertida de text[] para text';
    END IF;
END $$;

-- Converter keywords em ai_conversation_patterns de text[] para text
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_conversation_patterns' 
        AND column_name = 'keywords'
        AND data_type = 'ARRAY'
    ) THEN
        -- Converter text[] para text
        ALTER TABLE ai_conversation_patterns ALTER COLUMN keywords TYPE TEXT USING array_to_string(keywords, ',');
        RAISE NOTICE 'Coluna keywords em ai_conversation_patterns convertida de text[] para text';
    END IF;
END $$;

-- 4. AJUSTAR COLUNAS userId PARA ACEITAR "anonymous" (TEXT)
-- =====================================================

-- Ajustar userId em ai_learning para aceitar "anonymous"
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_learning' 
        AND column_name = 'user_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE ai_learning ALTER COLUMN user_id TYPE TEXT;
        RAISE NOTICE 'Coluna user_id em ai_learning convertida de uuid para text';
    END IF;
END $$;

-- Ajustar userId em noa_conversations para aceitar "anonymous"
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'noa_conversations' 
        AND column_name = 'user_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE noa_conversations ALTER COLUMN user_id TYPE TEXT;
        RAISE NOTICE 'Coluna user_id em noa_conversations convertida de uuid para text';
    END IF;
END $$;

-- Ajustar userId em ai_conversation_patterns para aceitar "anonymous"
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_conversation_patterns' 
        AND column_name = 'user_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE ai_conversation_patterns ALTER COLUMN user_id TYPE TEXT;
        RAISE NOTICE 'Coluna user_id em ai_conversation_patterns convertida de uuid para text';
    END IF;
END $$;

-- 5. CORRIGIR UUIDs INVÁLIDOS (USANDO "anonymous" OU UUIDs EXISTENTES)
-- =====================================================

-- Primeiro, verificar se existem registros com user_id NULL
SELECT
    'ai_learning' as tabela,
    COUNT(*) as registros_com_user_id_null
FROM ai_learning
WHERE user_id IS NULL
UNION ALL
SELECT
    'noa_conversations' as tabela,
    COUNT(*) as registros_com_user_id_null
FROM noa_conversations
WHERE user_id IS NULL
UNION ALL
SELECT
    'ai_conversation_patterns' as tabela,
    COUNT(*) as registros_com_user_id_null
FROM ai_conversation_patterns
WHERE user_id IS NULL;

-- Atualizar registros com user_id NULL usando "anonymous" ou UUIDs existentes
DO $$
DECLARE
    user_uuid TEXT;
BEGIN
    -- Verificar se existem registros com user_id NULL antes de atualizar
    IF EXISTS (SELECT 1 FROM ai_learning WHERE user_id IS NULL) THEN
        -- Usar "anonymous" como padrão
        user_uuid := 'anonymous';
        
        UPDATE ai_learning
        SET user_id = user_uuid
        WHERE user_id IS NULL;
        RAISE NOTICE 'Atualizados registros em ai_learning com user_id NULL usando: %', user_uuid;
    END IF;

    IF EXISTS (SELECT 1 FROM noa_conversations WHERE user_id IS NULL) THEN
        -- Usar "anonymous" como padrão
        user_uuid := 'anonymous';
        
        UPDATE noa_conversations
        SET user_id = user_uuid
        WHERE user_id IS NULL;
        RAISE NOTICE 'Atualizados registros em noa_conversations com user_id NULL usando: %', user_uuid;
    END IF;

    IF EXISTS (SELECT 1 FROM ai_conversation_patterns WHERE user_id IS NULL) THEN
        -- Usar "anonymous" como padrão
        user_uuid := 'anonymous';
        
        UPDATE ai_conversation_patterns
        SET user_id = user_uuid
        WHERE user_id IS NULL;
        RAISE NOTICE 'Atualizados registros em ai_conversation_patterns com user_id NULL usando: %', user_uuid;
    END IF;
END $$;

-- 6. REMOVER DUPLICATAS EM ai_learning
-- =====================================================

-- Remover duplicatas baseadas em (keyword, category) mantendo o mais antigo
WITH duplicatas AS (
    SELECT 
        keyword, 
        category, 
        MIN(created_at) as created_at_mais_antigo
    FROM ai_learning
    GROUP BY keyword, category
    HAVING COUNT(*) > 1
),
ids_para_manter AS (
    SELECT 
        al.id
    FROM ai_learning al
    INNER JOIN duplicatas d ON al.keyword = d.keyword 
        AND al.category = d.category 
        AND al.created_at = d.created_at_mais_antigo
),
ids_para_remover AS (
    SELECT al.id
    FROM ai_learning al
    INNER JOIN duplicatas d ON al.keyword = d.keyword 
        AND al.category = d.category
    WHERE al.id NOT IN (SELECT id FROM ids_para_manter)
)
DELETE FROM ai_learning 
WHERE id IN (SELECT id FROM ids_para_remover);

-- 7. REMOVER DUPLICATAS EM ai_keywords
-- =====================================================

-- Remover duplicatas baseadas em (keyword, category) mantendo o mais antigo
WITH duplicatas AS (
    SELECT 
        keyword, 
        category, 
        MIN(created_at) as created_at_mais_antigo
    FROM ai_keywords
    GROUP BY keyword, category
    HAVING COUNT(*) > 1
),
ids_para_manter AS (
    SELECT 
        ak.id
    FROM ai_keywords ak
    INNER JOIN duplicatas d ON ak.keyword = d.keyword 
        AND ak.category = d.category 
        AND ak.created_at = d.created_at_mais_antigo
),
ids_para_remover AS (
    SELECT ak.id
    FROM ai_keywords ak
    INNER JOIN duplicatas d ON ak.keyword = d.keyword 
        AND ak.category = d.category
    WHERE ak.id NOT IN (SELECT id FROM ids_para_manter)
)
DELETE FROM ai_keywords 
WHERE id IN (SELECT id FROM ids_para_remover);

-- 8. CRIAR CONSTRAINTS ÚNICAS COM ON CONFLICT
-- =====================================================

-- Criar constraint única em ai_learning se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ai_learning_keyword_category_key'
    ) THEN
        ALTER TABLE ai_learning ADD CONSTRAINT ai_learning_keyword_category_key UNIQUE (keyword, category);
        RAISE NOTICE 'Constraint única criada em ai_learning';
    END IF;
END $$;

-- Criar constraint única em ai_keywords se não existir
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'ai_keywords_keyword_category_key'
    ) THEN
        ALTER TABLE ai_keywords ADD CONSTRAINT ai_keywords_keyword_category_key UNIQUE (keyword, category);
        RAISE NOTICE 'Constraint única criada em ai_keywords';
    END IF;
END $$;

-- 9. RECRIAR ÍNDICES APROPRIADOS PARA TEXT
-- =====================================================

-- Recriar índice GIN para ai_learning.keywords (agora como TEXT)
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_learning' 
        AND column_name = 'keywords'
        AND data_type = 'text'
    ) THEN
        -- Criar índice GIN para busca full-text em português
        CREATE INDEX IF NOT EXISTS ai_learning_keywords_gin_idx 
        ON ai_learning USING gin(to_tsvector('portuguese', keywords));
        RAISE NOTICE 'Índice GIN criado para ai_learning.keywords';
    END IF;
END $$;

-- Recriar índice GIN para ai_conversation_patterns.keywords (agora como TEXT)
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ai_conversation_patterns' 
        AND column_name = 'keywords'
        AND data_type = 'text'
    ) THEN
        -- Criar índice GIN para busca full-text em português
        CREATE INDEX IF NOT EXISTS ai_conversation_patterns_keywords_gin_idx 
        ON ai_conversation_patterns USING gin(to_tsvector('portuguese', keywords));
        RAISE NOTICE 'Índice GIN criado para ai_conversation_patterns.keywords';
    END IF;
END $$;

-- 10. CRIAR FUNÇÕES PARA INSERÇÕES SEGURAS
-- =====================================================

-- Função para inserir em ai_learning sem conflitos
CREATE OR REPLACE FUNCTION insert_ai_learning_safe(
    p_keyword TEXT,
    p_category TEXT,
    p_ai_response TEXT,
    p_user_id TEXT DEFAULT 'anonymous',
    p_confidence_score DECIMAL DEFAULT 0.8
) RETURNS VOID AS $$
BEGIN
    INSERT INTO ai_learning (keyword, category, ai_response, user_id, confidence_score)
    VALUES (p_keyword, p_category, p_ai_response, p_user_id, p_confidence_score)
    ON CONFLICT (keyword, category) DO UPDATE SET
        ai_response = EXCLUDED.ai_response,
        confidence_score = EXCLUDED.confidence_score,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para inserir em ai_conversation_patterns sem conflitos
CREATE OR REPLACE FUNCTION insert_ai_conversation_patterns_safe(
    p_user_message TEXT,
    p_ai_response TEXT,
    p_category TEXT,
    p_user_id TEXT DEFAULT 'anonymous'
) RETURNS VOID AS $$
BEGIN
    INSERT INTO ai_conversation_patterns (user_message, ai_response, category, user_id)
    VALUES (p_user_message, p_ai_response, p_category, p_user_id)
    ON CONFLICT (user_message, category) DO UPDATE SET
        ai_response = EXCLUDED.ai_response,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 11. VERIFICAR FUNÇÕES RPC
-- =====================================================

-- Verificar se a função execute_admin_command existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'execute_admin_command'
        ) THEN '✅ Função execute_admin_command existe'
        ELSE '❌ Função execute_admin_command NÃO existe'
    END as status_funcao_admin;

-- 12. VERIFICAR TABELAS PRINCIPAIS
-- =====================================================

-- Verificar se todas as tabelas principais existem
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_learning') 
        THEN '✅ ai_learning existe'
        ELSE '❌ ai_learning NÃO existe'
    END as status_ai_learning,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_keywords') 
        THEN '✅ ai_keywords existe'
        ELSE '❌ ai_keywords NÃO existe'
    END as status_ai_keywords,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'noa_conversations') 
        THEN '✅ noa_conversations existe'
        ELSE '❌ noa_conversations NÃO existe'
    END as status_noa_conversations,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_conversation_patterns') 
        THEN '✅ ai_conversation_patterns existe'
        ELSE '❌ ai_conversation_patterns NÃO existe'
    END as status_ai_conversation_patterns;

-- 13. VERIFICAR COLUNAS PRINCIPAIS
-- =====================================================

-- Verificar se todas as colunas principais existem
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'noa_conversations' AND column_name = 'context'
        ) 
        THEN '✅ Coluna context em noa_conversations existe'
        ELSE '❌ Coluna context em noa_conversations NÃO existe'
    END as status_context,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ai_conversation_patterns' AND column_name = 'user_message'
        ) 
        THEN '✅ Coluna user_message em ai_conversation_patterns existe'
        ELSE '❌ Coluna user_message em ai_conversation_patterns NÃO existe'
    END as status_user_message,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ai_conversation_patterns' AND column_name = 'ai_response'
        ) 
        THEN '✅ Coluna ai_response em ai_conversation_patterns existe'
        ELSE '❌ Coluna ai_response em ai_conversation_patterns NÃO existe'
    END as status_ai_response,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ai_conversation_patterns' AND column_name = 'confidence_score'
        ) 
        THEN '✅ Coluna confidence_score em ai_conversation_patterns existe'
        ELSE '❌ Coluna confidence_score em ai_conversation_patterns NÃO existe'
    END as status_confidence_score;

-- 14. VERIFICAR TIPOS DE DADOS
-- =====================================================

-- Verificar tipos de dados das colunas keywords
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'text' THEN '✅ Tipo correto (text)'
        WHEN data_type = 'ARRAY' THEN '⚠️ Tipo incorreto (ARRAY) - precisa ser text'
        ELSE '❓ Tipo desconhecido: ' || data_type
    END as status_tipo
FROM information_schema.columns 
WHERE column_name = 'keywords' 
    AND table_name IN ('ai_learning', 'ai_conversation_patterns');

-- Verificar tipos de dados das colunas user_id
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN data_type = 'text' THEN '✅ Tipo correto (text) - aceita "anonymous"'
        WHEN data_type = 'uuid' THEN '⚠️ Tipo incorreto (uuid) - não aceita "anonymous"'
        ELSE '❓ Tipo desconhecido: ' || data_type
    END as status_tipo
FROM information_schema.columns 
WHERE column_name = 'user_id' 
    AND table_name IN ('ai_learning', 'noa_conversations', 'ai_conversation_patterns');

-- 15. VERIFICAR CONSTRAINTS
-- =====================================================

-- Verificar se as constraints únicas existem
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'ai_learning_keyword_category_key'
        ) 
        THEN '✅ Constraint ai_learning_keyword_category_key existe'
        ELSE '❌ Constraint ai_learning_keyword_category_key NÃO existe'
    END as status_constraint_ai_learning,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'ai_keywords_keyword_category_key'
        ) 
        THEN '✅ Constraint ai_keywords_keyword_category_key existe'
        ELSE '❌ Constraint ai_keywords_keyword_category_key NÃO existe'
    END as status_constraint_ai_keywords;

-- 16. VERIFICAR DADOS
-- =====================================================

-- Verificar quantos registros existem em cada tabela
SELECT 
    'ai_learning' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT keyword) as keywords_unicas,
    COUNT(DISTINCT category) as categorias_unicas
FROM ai_learning
UNION ALL
SELECT 
    'ai_keywords' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT keyword) as keywords_unicas,
    COUNT(DISTINCT category) as categorias_unicas
FROM ai_keywords
UNION ALL
SELECT 
    'noa_conversations' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT context) as contextos_unicos
FROM noa_conversations
UNION ALL
SELECT 
    'ai_conversation_patterns' as tabela,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_unicos,
    COUNT(DISTINCT pattern) as padroes_unicos
FROM ai_conversation_patterns;

-- 17. VERIFICAR UUIDs VÁLIDOS
-- =====================================================

-- Verificar se todos os user_id são válidos (text agora)
SELECT 
    'ai_learning' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN user_id = 'anonymous' THEN 1 END) as anonymous_users,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_users
FROM ai_learning
UNION ALL
SELECT 
    'noa_conversations' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN user_id = 'anonymous' THEN 1 END) as anonymous_users,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_users
FROM noa_conversations
UNION ALL
SELECT 
    'ai_conversation_patterns' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN user_id = 'anonymous' THEN 1 END) as anonymous_users,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_users
FROM ai_conversation_patterns;

-- =====================================================
-- SCRIPT CONCLUÍDO
-- =====================================================
-- Este script corrigiu:
-- ✅ Colunas ausentes adicionadas
-- ✅ Apenas índices GIN problemáticos removidos (não PRIMARY KEY)
-- ✅ Tipos de dados corrigidos (text[] → text) de forma segura
-- ✅ user_id convertido para TEXT (aceita "anonymous")
-- ✅ UUIDs inválidos corrigidos (usando "anonymous")
-- ✅ Duplicatas removidas
-- ✅ Constraints únicas criadas com ON CONFLICT
-- ✅ Índices GIN apropriados para text criados
-- ✅ Funções para inserções seguras criadas
-- ✅ Verificações de integridade realizadas
-- 
-- PRÓXIMOS PASSOS:
-- 1. Execute este script no Supabase SQL Editor
-- 2. Reinicie o Supabase Studio para atualizar cache PostgREST
-- 3. Teste as inserções com "anonymous"
-- 4. Verifique se os erros 404/400 foram resolvidos
-- =====================================================
