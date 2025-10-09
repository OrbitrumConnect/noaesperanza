-- ========================================
-- 🚀 NOAVISION IA - SETUP SIMPLES
-- Apenas Embeddings + Cache (SEM produtos REUNI)
-- ========================================
-- Data: 09/10/2025
-- Tempo estimado: 1-2 minutos
-- Zero downtime | Zero perda de dados
-- ========================================

-- ========================================
-- PASSO 1: INSTALAR EXTENSÃO PGVECTOR
-- ========================================

CREATE EXTENSION IF NOT EXISTS vector;

COMMENT ON EXTENSION vector IS 'Suporte para vetores de alta dimensão (embeddings)';

-- ========================================
-- PASSO 2: MODIFICAR TABELA ai_learning
-- ========================================

-- Adicionar coluna de embedding (384 dimensões - MiniLM-L6-v2)
ALTER TABLE ai_learning 
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

-- Adicionar colunas de contexto
ALTER TABLE ai_learning 
ADD COLUMN IF NOT EXISTS user_profile VARCHAR(50),
ADD COLUMN IF NOT EXISTS specialty VARCHAR(50),
ADD COLUMN IF NOT EXISTS dashboard VARCHAR(100),
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'openai';

-- Comentários explicativos
COMMENT ON COLUMN ai_learning.embedding IS 'Vetor de 384 dimensões gerado por MiniLM-L6-v2';
COMMENT ON COLUMN ai_learning.user_profile IS 'Perfil: paciente, medico, profissional, admin, pesquisador';
COMMENT ON COLUMN ai_learning.specialty IS 'Especialidade: rim, neuro, cannabis';
COMMENT ON COLUMN ai_learning.dashboard IS 'Dashboard atual: /home, /app/paciente, etc';
COMMENT ON COLUMN ai_learning.source IS 'Origem: local, openai, agent';

-- ========================================
-- PASSO 3: CRIAR TABELA DE CACHE DE EMBEDDINGS
-- ========================================

CREATE TABLE IF NOT EXISTS embedding_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text_hash VARCHAR(64) UNIQUE NOT NULL,
  text_preview TEXT,
  embedding VECTOR(384) NOT NULL,
  hits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE embedding_cache IS 'Cache de embeddings para performance';
COMMENT ON COLUMN embedding_cache.text_hash IS 'SHA-256 do texto original';
COMMENT ON COLUMN embedding_cache.hits IS 'Número de vezes reutilizado';

-- Índice para busca rápida por hash
CREATE INDEX IF NOT EXISTS idx_embedding_cache_hash ON embedding_cache(text_hash);

-- ========================================
-- PASSO 4: CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índice vetorial para busca por similaridade
CREATE INDEX IF NOT EXISTS idx_ai_learning_embedding 
ON ai_learning 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Índices compostos para filtragem
CREATE INDEX IF NOT EXISTS idx_ai_learning_profile_specialty 
ON ai_learning(user_profile, specialty) 
WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_learning_dashboard 
ON ai_learning(dashboard) 
WHERE embedding IS NOT NULL;

-- Índice para ordenação por uso
CREATE INDEX IF NOT EXISTS idx_ai_learning_usage 
ON ai_learning(usage_count DESC, confidence_score DESC);

-- ========================================
-- PASSO 5: FUNÇÃO DE BUSCA SEMÂNTICA
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
    ai.assistant_response,
    1 - (ai.embedding <=> query_embedding) AS similarity,
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

COMMENT ON FUNCTION search_similar_embeddings IS 'Busca semântica usando embeddings MiniLM-L6-v2';

-- ========================================
-- PASSO 6: VIEWS DE MONITORAMENTO
-- ========================================

-- View de embeddings por perfil
CREATE OR REPLACE VIEW v_embeddings_by_profile AS
SELECT 
  user_profile,
  specialty,
  COUNT(*) as total_embeddings,
  AVG(confidence_score) as avg_confidence,
  AVG(usage_count) as avg_usage
FROM ai_learning
WHERE embedding IS NOT NULL
GROUP BY user_profile, specialty
ORDER BY total_embeddings DESC;

-- View de cache hits
CREATE OR REPLACE VIEW v_embedding_cache_stats AS
SELECT 
  COUNT(*) as total_cached,
  SUM(hits) as total_hits,
  AVG(hits) as avg_hits_per_embedding,
  MAX(hits) as max_hits,
  MAX(last_used_at) as last_cache_hit
FROM embedding_cache;

-- ========================================
-- PASSO 7: POLÍTICAS RLS
-- ========================================

-- Habilitar RLS
ALTER TABLE embedding_cache ENABLE ROW LEVEL SECURITY;

-- Políticas para embedding_cache (apenas admin)
DROP POLICY IF EXISTS "Admin full access embedding_cache" ON embedding_cache;
CREATE POLICY "Admin full access embedding_cache" 
  ON embedding_cache FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM noa_users 
      WHERE noa_users.user_id = auth.uid() 
      AND noa_users.user_type = 'admin'
    )
  );

-- ========================================
-- ✅ SETUP COMPLETO!
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ NOAVISION IA INSTALADO COM SUCESSO!';
  RAISE NOTICE '====================================';
  RAISE NOTICE ' ';
  RAISE NOTICE '📊 Próximos passos:';
  RAISE NOTICE '1. Execute: setup_integration_SIMPLES.sql';
  RAISE NOTICE '2. Reinicie o servidor frontend';
  RAISE NOTICE '3. Acesse: http://localhost:8000';
  RAISE NOTICE ' ';
  RAISE NOTICE '🔍 Verificações:';
  RAISE NOTICE '- SELECT * FROM v_embeddings_by_profile;';
  RAISE NOTICE '- SELECT * FROM v_embedding_cache_stats;';
  RAISE NOTICE ' ';
  RAISE NOTICE '====================================';
END $$;

