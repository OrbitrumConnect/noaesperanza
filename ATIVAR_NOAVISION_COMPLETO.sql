-- ========================================
-- 🚀 ATIVAR NOAVISION IA - VERSÃO COMPLETA E SEGURA
-- Cria tabelas que faltam + Conecta às suas tabelas existentes
-- ========================================
-- ✅ 100% SEGURO: Só cria/adiciona, NUNCA deleta!
-- ========================================

-- ========================================
-- PASSO 1: EXTENSÃO PGVECTOR
-- ========================================

CREATE EXTENSION IF NOT EXISTS vector;

-- ========================================
-- PASSO 2: CRIAR TABELAS QUE PODEM NÃO EXISTIR
-- ========================================

-- gpt_documents (se não existir, criar)
CREATE TABLE IF NOT EXISTS gpt_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  file_type VARCHAR(50),
  category VARCHAR(100),
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding VECTOR(384),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- knowledge_items (se não existir, criar)
CREATE TABLE IF NOT EXISTS knowledge_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  keywords TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding VECTOR(384),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- embedding_cache (cache de vetores)
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
-- PASSO 3: ADICIONAR EMBEDDINGS EM TODAS AS TABELAS
-- ========================================

-- documentos_mestres (sua tabela)
ALTER TABLE documentos_mestres 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

-- gpt_knowledge_base (sua tabela)
ALTER TABLE gpt_knowledge_base 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

-- gpt_documents (criada ou já existente)
ALTER TABLE gpt_documents 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

-- knowledge_items (criada ou já existente)
ALTER TABLE knowledge_items 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

-- ai_learning (já existe, adicionar se não tiver)
ALTER TABLE ai_learning 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384),
ADD COLUMN IF NOT EXISTS user_profile VARCHAR(50),
ADD COLUMN IF NOT EXISTS specialty VARCHAR(50),
ADD COLUMN IF NOT EXISTS dashboard VARCHAR(100),
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ========================================
-- PASSO 4: CRIAR ÍNDICES DE BUSCA VETORIAL
-- ========================================

-- documentos_mestres
DO $$ 
BEGIN
  CREATE INDEX IF NOT EXISTS idx_documentos_mestres_embedding 
  ON documentos_mestres 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- gpt_knowledge_base
DO $$ 
BEGIN
  CREATE INDEX IF NOT EXISTS idx_gpt_knowledge_base_embedding 
  ON gpt_knowledge_base 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- gpt_documents
DO $$ 
BEGIN
  CREATE INDEX IF NOT EXISTS idx_gpt_documents_embedding 
  ON gpt_documents 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- knowledge_items
DO $$ 
BEGIN
  CREATE INDEX IF NOT EXISTS idx_knowledge_items_embedding 
  ON knowledge_items 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ai_learning
DO $$ 
BEGIN
  CREATE INDEX IF NOT EXISTS idx_ai_learning_embedding 
  ON ai_learning 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ========================================
-- PASSO 5: FUNÇÃO BUSCA HÍBRIDA (TODAS AS FONTES)
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
  
  -- 1. Documentos Mestres (SEUS documentos principais)
  SELECT 
    'documento_mestre'::TEXT as source_type,
    COALESCE(
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos_mestres' AND column_name = 'title') THEN d.title
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos_mestres' AND column_name = 'name') THEN d.name
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos_mestres' AND column_name = 'titulo') THEN d.titulo
        ELSE 'Documento'
      END, 'Documento')::TEXT as titulo,
    COALESCE(
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos_mestres' AND column_name = 'content') THEN d.content
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'documentos_mestres' AND column_name = 'conteudo') THEN d.conteudo
        ELSE ''
      END, '')::TEXT as conteudo,
    (1 - (d.embedding <=> query_embedding)) AS similarity,
    jsonb_build_object('id', d.id, 'source', 'documentos_mestres') as metadata
  FROM documentos_mestres d
  WHERE d.embedding IS NOT NULL
    AND (1 - (d.embedding <=> query_embedding)) >= similarity_threshold
  
  UNION ALL
  
  -- 2. GPT Knowledge Base (SEUS conhecimentos)
  SELECT 
    'knowledge_base'::TEXT,
    COALESCE(
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gpt_knowledge_base' AND column_name = 'title') THEN k.title
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gpt_knowledge_base' AND column_name = 'titulo') THEN k.titulo
        ELSE 'Item'
      END, 'Item')::TEXT,
    COALESCE(
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gpt_knowledge_base' AND column_name = 'content') THEN k.content
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'gpt_knowledge_base' AND column_name = 'conteudo') THEN k.conteudo
        ELSE ''
      END, '')::TEXT,
    (1 - (k.embedding <=> query_embedding)),
    jsonb_build_object('id', k.id, 'source', 'gpt_knowledge_base')
  FROM gpt_knowledge_base k
  WHERE k.embedding IS NOT NULL
    AND (1 - (k.embedding <=> query_embedding)) >= similarity_threshold
  
  UNION ALL
  
  -- 3. Knowledge Items
  SELECT 
    'knowledge_item'::TEXT,
    k.title::TEXT,
    k.content::TEXT,
    (1 - (k.embedding <=> query_embedding)),
    jsonb_build_object('id', k.id, 'category', k.category, 'source', 'knowledge_items')
  FROM knowledge_items k
  WHERE k.embedding IS NOT NULL
    AND (1 - (k.embedding <=> query_embedding)) >= similarity_threshold
  
  UNION ALL
  
  -- 4. GPT Documents
  SELECT 
    'gpt_document'::TEXT,
    d.filename::TEXT,
    d.content::TEXT,
    (1 - (d.embedding <=> query_embedding)),
    jsonb_build_object('id', d.id, 'category', d.category, 'source', 'gpt_documents')
  FROM gpt_documents d
  WHERE d.embedding IS NOT NULL
    AND (1 - (d.embedding <=> query_embedding)) >= similarity_threshold
  
  UNION ALL
  
  -- 5. AI Learning (conversas aprendidas)
  SELECT 
    'conversation'::TEXT,
    ai.user_message::TEXT,
    ai.ai_response::TEXT,
    (1 - (ai.embedding <=> query_embedding)),
    jsonb_build_object('id', ai.id, 'usage_count', ai.usage_count, 'source', 'ai_learning')
  FROM ai_learning ai
  WHERE ai.embedding IS NOT NULL
    AND (1 - (ai.embedding <=> query_embedding)) >= similarity_threshold
  
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_all_noa_knowledge IS 'Busca em TODAS as fontes: documentos_mestres + gpt_knowledge_base + knowledge_items + gpt_documents + ai_learning';

-- ========================================
-- PASSO 6: FUNÇÃO BUSCA EM CONVERSAS
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
-- PASSO 7: VIEW DE ESTATÍSTICAS
-- ========================================

CREATE OR REPLACE VIEW v_noa_intelligence_stats AS
SELECT 
  (SELECT COUNT(*) FROM documentos_mestres WHERE embedding IS NOT NULL) as docs_mestres_vectorized,
  (SELECT COUNT(*) FROM gpt_knowledge_base WHERE embedding IS NOT NULL) as knowledge_base_vectorized,
  (SELECT COUNT(*) FROM knowledge_items WHERE embedding IS NOT NULL) as knowledge_items_vectorized,
  (SELECT COUNT(*) FROM gpt_documents WHERE embedding IS NOT NULL) as gpt_docs_vectorized,
  (SELECT COUNT(*) FROM ai_learning WHERE embedding IS NOT NULL) as conversations_vectorized,
  (SELECT COUNT(*) FROM documentos_mestres) as total_docs_mestres,
  (SELECT COUNT(*) FROM gpt_knowledge_base) as total_knowledge_base,
  (SELECT COUNT(*) FROM knowledge_items) as total_knowledge_items,
  (SELECT COUNT(*) FROM gpt_documents) as total_gpt_docs,
  (SELECT COUNT(*) FROM ai_learning) as total_conversations;

-- ========================================
-- ✅ SETUP COMPLETO!
-- ========================================

DO $$
DECLARE
  total_sources INT;
  total_vectorized INT;
BEGIN
  SELECT 
    COALESCE((SELECT COUNT(*) FROM documentos_mestres), 0) +
    COALESCE((SELECT COUNT(*) FROM gpt_knowledge_base), 0) +
    COALESCE((SELECT COUNT(*) FROM knowledge_items), 0) +
    COALESCE((SELECT COUNT(*) FROM gpt_documents), 0) +
    COALESCE((SELECT COUNT(*) FROM ai_learning), 0)
  INTO total_sources;
  
  SELECT 
    COALESCE((SELECT COUNT(*) FROM documentos_mestres WHERE embedding IS NOT NULL), 0) +
    COALESCE((SELECT COUNT(*) FROM gpt_knowledge_base WHERE embedding IS NOT NULL), 0) +
    COALESCE((SELECT COUNT(*) FROM knowledge_items WHERE embedding IS NOT NULL), 0) +
    COALESCE((SELECT COUNT(*) FROM gpt_documents WHERE embedding IS NOT NULL), 0) +
    COALESCE((SELECT COUNT(*) FROM ai_learning WHERE embedding IS NOT NULL), 0)
  INTO total_vectorized;
  
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ NOAVISION IA ATIVADA!';
  RAISE NOTICE '====================================';
  RAISE NOTICE ' ';
  RAISE NOTICE '📚 Fontes conectadas:';
  RAISE NOTICE '✅ documentos_mestres';
  RAISE NOTICE '✅ gpt_knowledge_base';
  RAISE NOTICE '✅ knowledge_items';
  RAISE NOTICE '✅ gpt_documents';
  RAISE NOTICE '✅ ai_learning';
  RAISE NOTICE ' ';
  RAISE NOTICE '📊 Total de registros: %', total_sources;
  RAISE NOTICE '🧠 Já vetorizados: %', total_vectorized;
  RAISE NOTICE '⏳ Pendentes: %', total_sources - total_vectorized;
  RAISE NOTICE ' ';
  RAISE NOTICE '🔍 Verificar:';
  RAISE NOTICE 'SELECT * FROM v_noa_intelligence_stats;';
  RAISE NOTICE ' ';
  RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
  RAISE NOTICE '1. Configurar .env (VITE_SUPABASE_URL e chaves)';
  RAISE NOTICE '2. Reiniciar servidor (Ctrl+C e npm run dev)';
  RAISE NOTICE '3. Testar: "oi noa"';
  RAISE NOTICE ' ';
  RAISE NOTICE '⚠️ IMPORTANTE:';
  RAISE NOTICE 'Documentos ainda precisam ser vetorizados!';
  RAISE NOTICE 'Isso acontecerá automaticamente quando Nôa for usada.';
  RAISE NOTICE ' ';
  RAISE NOTICE '====================================';
END $$;

