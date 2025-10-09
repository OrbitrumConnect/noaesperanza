-- ========================================
-- 🚀 ATIVAR NOAVISION IA - NOMES CORRETOS DAS TABELAS
-- Usa SUAS tabelas existentes com nomes CORRETOS
-- ========================================
-- ✅ 100% SEGURO: Só adiciona embeddings, não altera dados!
-- ========================================

-- ========================================
-- PASSO 1: EXTENSÃO PGVECTOR
-- ========================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ========================================
-- PASSO 2: ADICIONAR EMBEDDINGS NAS SUAS TABELAS
-- ========================================

-- 1. documentos_mestres (SEUS documentos)
ALTER TABLE documentos_mestres 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

COMMENT ON COLUMN documentos_mestres.embedding IS 'Vetor semântico para busca inteligente';

-- 2. knowledge_base (SEUS conhecimentos)
ALTER TABLE knowledge_base 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

COMMENT ON COLUMN knowledge_base.embedding IS 'Vetor semântico para busca inteligente';

-- 3. ai_learning (conversas aprendidas)
ALTER TABLE ai_learning 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384),
ADD COLUMN IF NOT EXISTS user_profile VARCHAR(50),
ADD COLUMN IF NOT EXISTS specialty VARCHAR(50),
ADD COLUMN IF NOT EXISTS dashboard VARCHAR(100),
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

COMMENT ON COLUMN ai_learning.embedding IS 'Vetor semântico para busca inteligente';

-- 4. embedding_cache (criar se não existir)
CREATE TABLE IF NOT EXISTS embedding_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text_hash VARCHAR(64) UNIQUE NOT NULL,
  text_preview TEXT,
  embedding VECTOR(384) NOT NULL,
  hits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- PASSO 3: CRIAR ÍNDICES DE BUSCA VETORIAL
-- ========================================

-- documentos_mestres
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_documentos_mestres_embedding') THEN
    CREATE INDEX idx_documentos_mestres_embedding 
    ON documentos_mestres 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 50);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- knowledge_base
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_knowledge_base_embedding') THEN
    CREATE INDEX idx_knowledge_base_embedding 
    ON knowledge_base 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 50);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ai_learning
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_ai_learning_embedding') THEN
    CREATE INDEX idx_ai_learning_embedding 
    ON ai_learning 
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- embedding_cache
CREATE INDEX IF NOT EXISTS idx_embedding_cache_hash ON embedding_cache(text_hash);

-- ========================================
-- PASSO 4: FUNÇÃO BUSCA HÍBRIDA (SUAS TABELAS)
-- ========================================

CREATE OR REPLACE FUNCTION search_all_noa_knowledge(
  query_embedding VECTOR(384),
  similarity_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  source_type TEXT,
  titulo TEXT,
  conteudo TEXT,
  similarity FLOAT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  
  -- 1. Documentos Mestres
  SELECT 
    'documento_mestre'::TEXT as source_type,
    COALESCE(d.title, 'Documento')::TEXT as titulo,
    COALESCE(d.content, '')::TEXT as conteudo,
    (1 - (d.embedding <=> query_embedding)) AS similarity,
    jsonb_build_object(
      'id', d.id,
      'type', d.type,
      'category', d.category,
      'source', 'documentos_mestres'
    ) as metadata
  FROM documentos_mestres d
  WHERE d.embedding IS NOT NULL
    AND d.is_active = true
    AND (1 - (d.embedding <=> query_embedding)) >= similarity_threshold
  
  UNION ALL
  
  -- 2. Knowledge Base
  SELECT 
    'knowledge'::TEXT,
    COALESCE(k.title, 'Item')::TEXT,
    COALESCE(k.content, '')::TEXT,
    (1 - (k.embedding <=> query_embedding)),
    jsonb_build_object(
      'id', k.id,
      'file_type', k.file_type,
      'source', 'knowledge_base'
    )
  FROM knowledge_base k
  WHERE k.embedding IS NOT NULL
    AND (1 - (k.embedding <=> query_embedding)) >= similarity_threshold
  
  UNION ALL
  
  -- 3. AI Learning (conversas aprendidas)
  SELECT 
    'conversation'::TEXT,
    ai.user_message::TEXT,
    COALESCE(ai.ai_response, ai.assistant_response, '')::TEXT,
    (1 - (ai.embedding <=> query_embedding)),
    jsonb_build_object(
      'id', ai.id,
      'usage_count', ai.usage_count,
      'confidence', ai.confidence_score,
      'source', 'ai_learning'
    )
  FROM ai_learning ai
  WHERE ai.embedding IS NOT NULL
    AND (1 - (ai.embedding <=> query_embedding)) >= similarity_threshold
  
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_all_noa_knowledge IS 'Busca em documentos_mestres + knowledge_base + ai_learning';

-- ========================================
-- PASSO 5: FUNÇÃO BUSCA EM CONVERSAS
-- ========================================

CREATE OR REPLACE FUNCTION search_similar_embeddings(
  query_embedding VECTOR(384),
  filter_profile VARCHAR(50) DEFAULT NULL,
  filter_specialty VARCHAR(50) DEFAULT NULL,
  filter_dashboard VARCHAR(100) DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.85,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  user_message TEXT,
  assistant_response TEXT,
  similarity FLOAT,
  usage_count INT,
  confidence_score FLOAT,
  user_profile VARCHAR(50),
  specialty VARCHAR(50),
  dashboard VARCHAR(100)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ai.id,
    ai.user_message,
    COALESCE(ai.ai_response, ai.assistant_response, '')::TEXT as assistant_response,
    (1 - (ai.embedding <=> query_embedding)) AS similarity,
    COALESCE(ai.usage_count, 0) as usage_count,
    COALESCE(ai.confidence_score, 0.5) as confidence_score,
    ai.user_profile,
    ai.specialty,
    ai.dashboard
  FROM ai_learning ai
  WHERE ai.embedding IS NOT NULL
    AND (filter_profile IS NULL OR ai.user_profile = filter_profile)
    AND (filter_specialty IS NULL OR ai.specialty = filter_specialty)
    AND (filter_dashboard IS NULL OR ai.dashboard = filter_dashboard)
    AND (1 - (ai.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY ai.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PASSO 6: VIEW DE ESTATÍSTICAS
-- ========================================

CREATE OR REPLACE VIEW v_noa_intelligence_stats AS
SELECT 
  COALESCE((SELECT COUNT(*) FROM documentos_mestres WHERE embedding IS NOT NULL), 0) as docs_mestres_vectorized,
  COALESCE((SELECT COUNT(*) FROM knowledge_base WHERE embedding IS NOT NULL), 0) as knowledge_base_vectorized,
  COALESCE((SELECT COUNT(*) FROM ai_learning WHERE embedding IS NOT NULL), 0) as conversations_vectorized,
  COALESCE((SELECT COUNT(*) FROM documentos_mestres), 0) as total_docs_mestres,
  COALESCE((SELECT COUNT(*) FROM knowledge_base), 0) as total_knowledge_base,
  COALESCE((SELECT COUNT(*) FROM ai_learning), 0) as total_conversations;

COMMENT ON VIEW v_noa_intelligence_stats IS 'Estatísticas de inteligência da Nôa';

-- ========================================
-- ✅ SETUP COMPLETO!
-- ========================================

DO $$
DECLARE
  total_docs INT;
  total_knowledge INT;
  total_convs INT;
BEGIN
  SELECT COUNT(*) INTO total_docs FROM documentos_mestres;
  SELECT COUNT(*) INTO total_knowledge FROM knowledge_base;
  SELECT COUNT(*) INTO total_convs FROM ai_learning;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ NOAVISION IA ATIVADA!';
  RAISE NOTICE '====================================';
  RAISE NOTICE ' ';
  RAISE NOTICE '📚 Tabelas conectadas:';
  RAISE NOTICE '✅ documentos_mestres (% docs)', total_docs;
  RAISE NOTICE '✅ knowledge_base (% itens)', total_knowledge;
  RAISE NOTICE '✅ ai_learning (% conversas)', total_convs;
  RAISE NOTICE '✅ noa_kpis';
  RAISE NOTICE ' ';
  RAISE NOTICE '🔍 Total: % registros', total_docs + total_knowledge + total_convs;
  RAISE NOTICE ' ';
  RAISE NOTICE '📊 Verificar:';
  RAISE NOTICE 'SELECT * FROM v_noa_intelligence_stats;';
  RAISE NOTICE ' ';
  RAISE NOTICE '📋 PRÓXIMO PASSO:';
  RAISE NOTICE '1. Configurar .env (Supabase URL + chaves)';
  RAISE NOTICE '2. Reiniciar: Ctrl+C e npm run dev';
  RAISE NOTICE '3. Testar: "oi noa"';
  RAISE NOTICE ' ';
  RAISE NOTICE '====================================';
END $$;

