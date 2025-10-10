-- ========================================
-- 📚 CONTEXTUALIZAÇÃO COM DOCUMENTOS
-- NoaVision IA: Busca em documentos e conhecimento
-- ========================================

-- ========================================
-- PASSO 1: ADICIONAR EMBEDDINGS AOS DOCUMENTOS
-- ========================================

-- Adicionar coluna embedding em gpt_documents
ALTER TABLE gpt_documents 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

COMMENT ON COLUMN gpt_documents.embedding IS 'Embedding do conteúdo do documento (384 dimensões)';

-- Adicionar coluna de fragmentos (para documentos grandes)
ALTER TABLE gpt_documents
ADD COLUMN IF NOT EXISTS content_chunks TEXT[];

COMMENT ON COLUMN gpt_documents.content_chunks IS 'Documento dividido em chunks para melhor busca';

-- Adicionar embedding em knowledge_items
ALTER TABLE knowledge_items 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

COMMENT ON COLUMN knowledge_items.embedding IS 'Embedding do conteúdo do conhecimento';

-- ========================================
-- PASSO 2: ÍNDICES PARA BUSCA VETORIAL
-- ========================================

-- Índice para documentos
CREATE INDEX IF NOT EXISTS idx_gpt_documents_embedding 
ON gpt_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);

-- Índice para conhecimento
CREATE INDEX IF NOT EXISTS idx_knowledge_items_embedding 
ON knowledge_items 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 50);

-- Índice para categorias de documentos
CREATE INDEX IF NOT EXISTS idx_gpt_documents_category 
ON gpt_documents(category) 
WHERE embedding IS NOT NULL;

-- ========================================
-- PASSO 3: FUNÇÃO BUSCA EM DOCUMENTOS
-- ========================================

CREATE OR REPLACE FUNCTION search_documents_by_embedding(
  query_embedding VECTOR(384),
  user_id_filter UUID DEFAULT NULL,
  category_filter TEXT DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  filename TEXT,
  content TEXT,
  category TEXT,
  similarity FLOAT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.filename,
    d.content,
    d.category,
    1 - (d.embedding <=> query_embedding) AS similarity,
    d.created_at
  FROM gpt_documents d
  WHERE d.embedding IS NOT NULL
    AND (user_id_filter IS NULL OR d.user_id = user_id_filter)
    AND (category_filter IS NULL OR d.category = category_filter)
    AND (1 - (d.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_documents_by_embedding IS 'Busca documentos por similaridade semântica';

-- ========================================
-- PASSO 4: FUNÇÃO BUSCA EM CONHECIMENTO
-- ========================================

CREATE OR REPLACE FUNCTION search_knowledge_by_embedding(
  query_embedding VECTOR(384),
  category_filter TEXT DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  keywords TEXT[],
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    k.id,
    k.title,
    k.content,
    k.category,
    k.keywords,
    1 - (k.embedding <=> query_embedding) AS similarity
  FROM knowledge_items k
  WHERE k.embedding IS NOT NULL
    AND (category_filter IS NULL OR k.category = category_filter)
    AND (1 - (k.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY k.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_knowledge_by_embedding IS 'Busca conhecimento por similaridade semântica';

-- ========================================
-- PASSO 5: FUNÇÃO BUSCA HÍBRIDA (tudo)
-- ========================================

CREATE OR REPLACE FUNCTION search_all_context(
  query_embedding VECTOR(384),
  user_id_filter UUID DEFAULT NULL,
  similarity_threshold FLOAT DEFAULT 0.75
)
RETURNS TABLE (
  source_type TEXT,
  content TEXT,
  title TEXT,
  similarity FLOAT,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  -- Documentos
  SELECT 
    'document'::TEXT as source_type,
    d.content,
    d.filename as title,
    1 - (d.embedding <=> query_embedding) AS similarity,
    jsonb_build_object(
      'id', d.id,
      'category', d.category,
      'created_at', d.created_at
    ) as metadata
  FROM gpt_documents d
  WHERE d.embedding IS NOT NULL
    AND (user_id_filter IS NULL OR d.user_id = user_id_filter)
    AND (1 - (d.embedding <=> query_embedding)) >= similarity_threshold
  
  UNION ALL
  
  -- Conhecimento
  SELECT 
    'knowledge'::TEXT as source_type,
    k.content,
    k.title,
    1 - (k.embedding <=> query_embedding) AS similarity,
    jsonb_build_object(
      'id', k.id,
      'category', k.category,
      'keywords', k.keywords
    ) as metadata
  FROM knowledge_items k
  WHERE k.embedding IS NOT NULL
    AND (1 - (k.embedding <=> query_embedding)) >= similarity_threshold
  
  UNION ALL
  
  -- Conversas aprendidas
  SELECT 
    'conversation'::TEXT as source_type,
    ai.ai_response as content,
    ai.user_message as title,
    1 - (ai.embedding <=> query_embedding) AS similarity,
    jsonb_build_object(
      'id', ai.id,
      'usage_count', ai.usage_count,
      'confidence', ai.confidence_score
    ) as metadata
  FROM ai_learning ai
  WHERE ai.embedding IS NOT NULL
    AND (user_id_filter IS NULL OR ai.user_id = user_id_filter)
    AND (1 - (ai.embedding <=> query_embedding)) >= similarity_threshold
  
  ORDER BY similarity DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_all_context IS 'Busca híbrida: documentos + conhecimento + conversas';

-- ========================================
-- PASSO 6: VIEW DE ESTATÍSTICAS
-- ========================================

CREATE OR REPLACE VIEW v_document_stats AS
SELECT 
  COUNT(*) as total_documents,
  COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as vectorized,
  COUNT(CASE WHEN embedding IS NULL THEN 1 END) as not_vectorized,
  COUNT(DISTINCT category) as categories,
  COUNT(DISTINCT user_id) as users,
  SUM(LENGTH(content)) as total_content_size
FROM gpt_documents;

COMMENT ON VIEW v_document_stats IS 'Estatísticas dos documentos';

CREATE OR REPLACE VIEW v_knowledge_stats AS
SELECT 
  COUNT(*) as total_items,
  COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as vectorized,
  COUNT(CASE WHEN embedding IS NULL THEN 1 END) as not_vectorized,
  COUNT(DISTINCT category) as categories
FROM knowledge_items;

COMMENT ON VIEW v_knowledge_stats IS 'Estatísticas do conhecimento';

-- ========================================
-- PASSO 7: TRIGGER PARA AUTO-VETORIZAR (futuro)
-- ========================================

-- Placeholder para futuro: quando documento for inserido, 
-- disparar job para vetorizar automaticamente

CREATE TABLE IF NOT EXISTS vectorization_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES gpt_documents(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, error
  attempts INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

COMMENT ON TABLE vectorization_queue IS 'Fila para vetorização automática de documentos';

CREATE INDEX IF NOT EXISTS idx_vectorization_queue_status 
ON vectorization_queue(status, created_at);

-- ========================================
-- ✅ SETUP COMPLETO!
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ CONTEXTUALIZAÇÃO INSTALADA!';
  RAISE NOTICE '====================================';
  RAISE NOTICE ' ';
  RAISE NOTICE '📚 Tabelas atualizadas:';
  RAISE NOTICE '- gpt_documents (+ embedding)';
  RAISE NOTICE '- knowledge_items (+ embedding)';
  RAISE NOTICE ' ';
  RAISE NOTICE '🔍 Funções criadas:';
  RAISE NOTICE '- search_documents_by_embedding()';
  RAISE NOTICE '- search_knowledge_by_embedding()';
  RAISE NOTICE '- search_all_context() (híbrida)';
  RAISE NOTICE ' ';
  RAISE NOTICE '📊 Views criadas:';
  RAISE NOTICE '- v_document_stats';
  RAISE NOTICE '- v_knowledge_stats';
  RAISE NOTICE ' ';
  RAISE NOTICE '🧪 Testar:';
  RAISE NOTICE '- SELECT * FROM v_document_stats;';
  RAISE NOTICE '- SELECT * FROM v_knowledge_stats;';
  RAISE NOTICE ' ';
  RAISE NOTICE '====================================';
END $$;

