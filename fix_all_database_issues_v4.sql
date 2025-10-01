-- =====================================================
-- SCRIPT CORRIGIDO V4: Fix All Database Issues
-- =====================================================
-- Este script corrige todos os problemas identificados:
-- 1. Adiciona colunas ausentes
-- 2. Remove apenas índices específicos das nossas tabelas
-- 3. Converte tipos de dados (text[] → text)
-- 4. Remove duplicatas
-- 5. Corrige UUIDs inválidos
-- 6. Cria constraints necessárias
-- 7. Recria índices GIN apropriados
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

-- 2. REMOVER ÍNDICES ESPECÍFICOS DAS NOSSAS TABELAS
-- =====================================================

-- Remover índices específicos que podem causar conflito
DROP INDEX IF EXISTS ai_learning_keywords_gin_idx;
DROP INDEX IF EXISTS ai_conversation_patterns_keywords_gin_idx;
DROP INDEX IF EXISTS ai_keywords_keywords_gin_idx;
DROP INDEX IF EXISTS ai_learning_keywords_idx;
DROP INDEX IF EXISTS ai_conversation_patterns_keywords_idx;
DROP INDEX IF EXISTS ai_keywords_keywords_idx;

-- 3. CONVERTER TIPOS DE DADOS (text[] → text)
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

-- 4. CORRIGIR UUIDs INVÁLIDOS (USANDO UUIDs EXISTENTES)
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

-- Atualizar registros com user_id NULL usando UUIDs existentes da tabela users
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Verificar se existem registros com user_id NULL antes de atualizar
    IF EXISTS (SELECT 1 FROM ai_learning WHERE user_id IS NULL) THEN
        -- Pegar o primeiro UUID válido da tabela users
        SELECT id INTO user_uuid FROM users LIMIT 1;
        
        -- Se não houver usuários, criar um UUID padrão
        IF user_uuid IS NULL THEN
            user_uuid := gen_random_uuid();
        END IF;
        
        UPDATE ai_learning
        SET user_id = user_uuid
        WHERE user_id IS NULL;
        RAISE NOTICE 'Atualizados registros em ai_learning com user_id NULL usando UUID: %', user_uuid;
    END IF;

    IF EXISTS (SELECT 1 FROM noa_conversations WHERE user_id IS NULL) THEN
        -- Pegar o primeiro UUID válido da tabela users
        SELECT id INTO user_uuid FROM users LIMIT 1;
        
        -- Se não houver usuários, criar um UUID padrão
        IF user_uuid IS NULL THEN
            user_uuid := gen_random_uuid();
        END IF;
        
        UPDATE noa_conversations
        SET user_id = user_uuid
        WHERE user_id IS NULL;
        RAISE NOTICE 'Atualizados registros em noa_conversations com user_id NULL usando UUID: %', user_uuid;
    END IF;

    IF EXISTS (SELECT 1 FROM ai_conversation_patterns WHERE user_id IS NULL) THEN
        -- Pegar o primeiro UUID válido da tabela users
        SELECT id INTO user_uuid FROM users LIMIT 1;
        
        -- Se não houver usuários, criar um UUID padrão
        IF user_uuid IS NULL THEN
            user_uuid := gen_random_uuid();
        END IF;
        
        UPDATE ai_conversation_patterns
        SET user_id = user_uuid
        WHERE user_id IS NULL;
        RAISE NOTICE 'Atualizados registros em ai_conversation_patterns com user_id NULL usando UUID: %', user_uuid;
    END IF;
END $$;

-- 5. REMOVER DUPLICATAS EM ai_learning
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

-- 6. REMOVER DUPLICATAS EM ai_keywords
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

-- 7. CRIAR CONSTRAINTS ÚNICAS
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

-- 8. RECRIAR ÍNDICES GIN APROPRIADOS
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
        -- Criar índice GIN para busca de texto
        CREATE INDEX IF NOT EXISTS ai_learning_keywords_gin_idx 
        ON ai_learning USING gin(to_tsvector('portuguese', keywords));
        RAISE NOTICE 'Índice GIN recriado para ai_learning.keywords';
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
        -- Criar índice GIN para busca de texto
        CREATE INDEX IF NOT EXISTS ai_conversation_patterns_keywords_gin_idx 
        ON ai_conversation_patterns USING gin(to_tsvector('portuguese', keywords));
        RAISE NOTICE 'Índice GIN recriado para ai_conversation_patterns.keywords';
    END IF;
END $$;

-- 9. VERIFICAR FUNÇÕES RPC
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

-- 10. VERIFICAR TABELAS PRINCIPAIS
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

-- 11. VERIFICAR COLUNAS PRINCIPAIS
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
            WHERE table_name = 'ai_conversation_patterns' AND column_name = 'confidence_score'
        ) 
        THEN '✅ Coluna confidence_score em ai_conversation_patterns existe'
        ELSE '❌ Coluna confidence_score em ai_conversation_patterns NÃO existe'
    END as status_confidence_score;

-- 12. VERIFICAR TIPOS DE DADOS
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

-- 13. VERIFICAR CONSTRAINTS
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

-- 14. VERIFICAR DADOS
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

-- 15. VERIFICAR UUIDs VÁLIDOS
-- =====================================================

-- Verificar se todos os user_id são UUIDs válidos
SELECT 
    'ai_learning' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as uuids_validos,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as uuids_nulos
FROM ai_learning
UNION ALL
SELECT 
    'noa_conversations' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as uuids_validos,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as uuids_nulos
FROM noa_conversations
UNION ALL
SELECT 
    'ai_conversation_patterns' as tabela,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN user_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 1 END) as uuids_validos,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as uuids_nulos
FROM ai_conversation_patterns;

-- =====================================================
-- SCRIPT CONCLUÍDO
-- =====================================================
-- Este script corrigiu:
-- ✅ Colunas ausentes adicionadas
-- ✅ Apenas índices específicos das nossas tabelas removidos
-- ✅ Tipos de dados corrigidos (text[] → text)
-- ✅ UUIDs inválidos corrigidos (usando UUIDs existentes)
-- ✅ Duplicatas removidas
-- ✅ Constraints únicas criadas
-- ✅ Índices GIN recriados apropriadamente
-- ✅ Verificações de integridade realizadas
-- =====================================================
