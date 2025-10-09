-- ========================================
-- 🚀 ATIVAR NOAVISION IA - SUAS TABELAS EXISTENTES
-- Conecta NoaVision IA aos seus documentos e conhecimento
-- ========================================
-- ⚠️ SEGURO: Só adiciona colunas, NÃO deleta nada!
-- ========================================

-- ========================================
-- PASSO 1: EXTENSÃO PGVECTOR
-- ========================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ========================================
-- PASSO 2: ADICIONAR EMBEDDINGS EM TODAS AS TABELAS
-- ========================================

-- 1. documentos_mestres
ALTER TABLE documentos_mestres 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

COMMENT ON COLUMN documentos_mestres.embedding IS 'Embedding para busca semântica';

-- 2. gpt_documents
ALTER TABLE gpt_documents 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

COMMENT ON COLUMN gpt_documents.embedding IS 'Embedding para busca semântica';

-- 3. gpt_knowledge_base
ALTER TABLE gpt_knowledge_base 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

COMMENT ON COLUMN gpt_knowledge_base.embedding IS 'Embedding para busca semântica';

-- 4. knowledge_items
ALTER TABLE knowledge_items 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

COMMENT ON COLUMN knowledge_items.embedding IS 'Embedding para busca semântica';

-- 5. ai_learning (já deve ter, mas garantir)
ALTER TABLE ai_learning 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384),
ADD COLUMN IF NOT EXISTS user_profile VARCHAR(50),
ADD COLUMN IF NOT EXISTS specialty VARCHAR(50),
ADD COLUMN IF NOT EXISTS dashboard VARCHAR(100),
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ========================================
-- PASSO 3: CRIAR ÍNDICES DE BUSCA VETORIAL
-- ========================================

-- documentos_mestres
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_embedding 
ON documentos_mestres 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50)
WHERE embedding IS NOT NULL;

-- gpt_documents
CREATE INDEX IF NOT EXISTS idx_gpt_documents_embedding 
ON gpt_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50)
WHERE embedding IS NOT NULL;

-- gpt_knowledge_base
CREATE INDEX IF NOT EXISTS idx_gpt_knowledge_base_embedding 
ON gpt_knowledge_base 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50)
WHERE embedding IS NOT NULL;

-- knowledge_items
CREATE INDEX IF NOT EXISTS idx_knowledge_items_embedding 
ON knowledge_items 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50)
WHERE embedding IS NOT NULL;

-- ai_learning
CREATE INDEX IF NOT EXISTS idx_ai_learning_embedding 
ON ai_learning 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100)
WHERE embedding IS NOT NULL;

-- ========================================
-- PASSO 4: FUNÇÃO BUSCA EM DOCUMENTOS MESTRES
-- ========================================

CREATE OR REPLACE FUNCTION search_documentos_mestres(
  query_embedding VECTOR(384),
  similarity_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  conteudo TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    COALESCE(d.title, d.name, d.titulo, 'Documento')::TEXT as titulo,
    COALESCE(d.content, d.conteudo, '')::TEXT as conteudo,
    (1 - (d.embedding <=> query_embedding)) AS similarity
  FROM documentos_mestres d
  WHERE d.embedding IS NOT NULL
    AND (1 - (d.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PASSO 5: FUNÇÃO BUSCA EM GPT_DOCUMENTS
-- ========================================

CREATE OR REPLACE FUNCTION search_gpt_documents(
  query_embedding VECTOR(384),
  similarity_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  filename TEXT,
  content TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.filename,
    d.content,
    (1 - (d.embedding <=> query_embedding)) AS similarity
  FROM gpt_documents d
  WHERE d.embedding IS NOT NULL
    AND (1 - (d.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PASSO 6: FUNÇÃO BUSCA EM KNOWLEDGE_BASE
-- ========================================

CREATE OR REPLACE FUNCTION search_knowledge_base(
  query_embedding VECTOR(384),
  similarity_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  titulo TEXT,
  conteudo TEXT,
  categoria TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    k.id,
    COALESCE(k.title, k.titulo, 'Item')::TEXT as titulo,
    COALESCE(k.content, k.conteudo, '')::TEXT as conteudo,
    COALESCE(k.category, k.categoria, 'geral')::TEXT as categoria,
    (1 - (k.embedding <=> query_embedding)) AS similarity
  FROM gpt_knowledge_base k
  WHERE k.embedding IS NOT NULL
    AND (1 - (k.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY k.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- PASSO 7: FUNÇÃO BUSCA HÍBRIDA (TUDO)
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
  
  -- Documentos Mestres
  SELECT 
    'documento_mestre'::TEXT as source_type,
    COALESCE(d.title, d.name, d.titulo, 'Documento')::TEXT as titulo,
    COALESCE(d.content, d.conteudo, '')::TEXT as conteudo,
    (1 - (d.embedding <=> query_embedding)) AS similarity,
    jsonb_build_object('id', d.id, 'created_at', d.created_at) as metadata
  FROM documentos_mestres d
  WHERE d.embedding IS NOT NULL
    AND (1 - (d.embedding <=> query_embedding)) >= similarity_threshold
  
  UNION ALL
  
  -- GPT Documents
  SELECT 
    'gpt_document'::TEXT,
    d.filename::TEXT,
    d.content::TEXT,
    (1 - (d.embedding <=> query_embedding)),
    jsonb_build_object('id', d.id, 'category', d.category)
  FROM gpt_documents d
  WHERE d.embedding IS NOT NULL
    AND (1 - (d.embedding <=> query_embedding)) >= similarity_threshold
  
  UNION ALL
  
  -- Knowledge Base
  SELECT 
    'knowledge'::TEXT,
    COALESCE(k.title, k.titulo, 'Item')::TEXT,
    COALESCE(k.content, k.conteudo, '')::TEXT,
    (1 - (k.embedding <=> query_embedding)),
    jsonb_build_object('id', k.id, 'category', COALESCE(k.category, k.categoria))
  FROM gpt_knowledge_base k
  WHERE k.embedding IS NOT NULL
    AND (1 - (k.embedding <=> query_embedding)) >= similarity_threshold
  
  UNION ALL
  
  -- Knowledge Items
  SELECT 
    'knowledge_item'::TEXT,
    k.title::TEXT,
    k.content::TEXT,
    (1 - (k.embedding <=> query_embedding)),
    jsonb_build_object('id', k.id, 'category', k.category)
  FROM knowledge_items k
  WHERE k.embedding IS NOT NULL
    AND (1 - (k.embedding <=> query_embedding)) >= similarity_threshold
  
  UNION ALL
  
  -- AI Learning (conversas aprendidas)
  SELECT 
    'conversation'::TEXT,
    ai.user_message::TEXT,
    ai.ai_response::TEXT,
    (1 - (ai.embedding <=> query_embedding)),
    jsonb_build_object('id', ai.id, 'usage_count', ai.usage_count)
  FROM ai_learning ai
  WHERE ai.embedding IS NOT NULL
    AND (1 - (ai.embedding <=> query_embedding)) >= similarity_threshold
  
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_all_noa_knowledge IS 'Busca híbrida em TODAS as fontes de conhecimento';

-- ========================================
-- PASSO 8: FUNÇÃO BUSCA EM CONVERSAS (compatível)
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
    ai.ai_response::TEXT as assistant_response,
    (1 - (ai.embedding <=> query_embedding)) AS similarity,
    ai.usage_count,
    ai.confidence_score,
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
-- PASSO 9: VIEW DE ESTATÍSTICAS
-- ========================================

CREATE OR REPLACE VIEW v_noa_intelligence_stats AS
SELECT 
  (SELECT COUNT(*) FROM documentos_mestres WHERE embedding IS NOT NULL) as docs_mestres_vectorized,
  (SELECT COUNT(*) FROM gpt_documents WHERE embedding IS NOT NULL) as gpt_docs_vectorized,
  (SELECT COUNT(*) FROM gpt_knowledge_base WHERE embedding IS NOT NULL) as knowledge_base_vectorized,
  (SELECT COUNT(*) FROM knowledge_items WHERE embedding IS NOT NULL) as knowledge_items_vectorized,
  (SELECT COUNT(*) FROM ai_learning WHERE embedding IS NOT NULL) as conversations_vectorized,
  (SELECT COUNT(*) FROM documentos_mestres) as total_docs_mestres,
  (SELECT COUNT(*) FROM gpt_documents) as total_gpt_docs,
  (SELECT COUNT(*) FROM gpt_knowledge_base) as total_knowledge_base,
  (SELECT COUNT(*) FROM knowledge_items) as total_knowledge_items,
  (SELECT COUNT(*) FROM ai_learning) as total_conversations;

COMMENT ON VIEW v_noa_intelligence_stats IS 'Estatísticas de inteligência da Nôa';

-- ========================================
-- ✅ SETUP COMPLETO!
-- ========================================

DO $$
DECLARE
  total_sources INT;
BEGIN
  SELECT 
    (SELECT COUNT(*) FROM documentos_mestres) +
    (SELECT COUNT(*) FROM gpt_documents) +
    (SELECT COUNT(*) FROM gpt_knowledge_base) +
    (SELECT COUNT(*) FROM knowledge_items) +
    (SELECT COUNT(*) FROM ai_learning)
  INTO total_sources;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ NOAVISION IA CONECTADA!';
  RAISE NOTICE '====================================';
  RAISE NOTICE ' ';
  RAISE NOTICE '📚 Fontes de conhecimento conectadas:';
  RAISE NOTICE '- documentos_mestres';
  RAISE NOTICE '- gpt_documents';
  RAISE NOTICE '- gpt_knowledge_base';
  RAISE NOTICE '- knowledge_items';
  RAISE NOTICE '- ai_learning';
  RAISE NOTICE '- noa_kpis';
  RAISE NOTICE ' ';
  RAISE NOTICE '📊 Total de dados: % registros', total_sources;
  RAISE NOTICE ' ';
  RAISE NOTICE '🔍 Verificar:';
  RAISE NOTICE '- SELECT * FROM v_noa_intelligence_stats;';
  RAISE NOTICE ' ';
  RAISE NOTICE '⚠️ PRÓXIMO PASSO:';
  RAISE NOTICE '1. Configurar .env com Supabase';
  RAISE NOTICE '2. Reiniciar servidor';
  RAISE NOTICE '3. Testar: "oi noa"';
  RAISE NOTICE ' ';
  RAISE NOTICE '====================================';
END $$;

