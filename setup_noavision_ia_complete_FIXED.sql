-- ========================================
-- 🚀 NOAVISION IA - SETUP COMPLETO (CORRIGIDO)
-- Transformação: NoaGPT → NoaVision IA
-- Sistema Inteligente com Embeddings Locais
-- ========================================
-- Data: 09/10/2025
-- Tempo estimado: 2-3 minutos
-- Zero downtime | Zero perda de dados
-- ========================================

-- ========================================
-- PASSO 1: INSTALAR EXTENSÃO PGVECTOR
-- ========================================

-- Habilitar extensão para vetores
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
  text_preview TEXT, -- Prévia do texto (primeiros 100 chars)
  embedding VECTOR(384) NOT NULL,
  hits INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE embedding_cache IS 'Cache de embeddings para performance (evita reprocessamento)';
COMMENT ON COLUMN embedding_cache.text_hash IS 'SHA-256 do texto original';
COMMENT ON COLUMN embedding_cache.hits IS 'Número de vezes que este embedding foi reutilizado';

-- Índice para busca rápida por hash
CREATE INDEX IF NOT EXISTS idx_embedding_cache_hash ON embedding_cache(text_hash);

-- ========================================
-- PASSO 4: CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índice vetorial para busca por similaridade (IVFFlat)
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
  user_profile VARCHAR(50) DEFAULT NULL,
  specialty VARCHAR(50) DEFAULT NULL,
  dashboard VARCHAR(100) DEFAULT NULL,
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
    AND (user_profile IS NULL OR ai.user_profile = user_profile)
    AND (specialty IS NULL OR ai.specialty = specialty)
    AND (dashboard IS NULL OR ai.dashboard = dashboard)
    AND (1 - (ai.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY ai.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION search_similar_embeddings IS 'Busca semântica usando embeddings MiniLM-L6-v2';

-- ========================================
-- PASSO 6: PRODUTOS REUNI (RDC 660/2022)
-- ========================================

CREATE TABLE IF NOT EXISTS reuni_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  active_principle VARCHAR(255) NOT NULL, -- Ex: "CBD 200mg/ml + THC 3mg/ml"
  cbd_concentration DECIMAL(10,2), -- mg/ml
  thc_concentration DECIMAL(10,2), -- mg/ml
  presentation VARCHAR(100), -- "Óleo sublingual 30ml"
  manufacturer VARCHAR(255),
  anvisa_registration VARCHAR(100),
  reuni_code VARCHAR(50) UNIQUE,
  requires_special_recipe BOOLEAN DEFAULT TRUE,
  max_monthly_quantity DECIMAL(10,2), -- Quantidade máxima mensal
  unit VARCHAR(20) DEFAULT 'ml',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE reuni_products IS 'Produtos REUNI registrados (RDC 660/2022)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_reuni_products_code ON reuni_products(reuni_code);
CREATE INDEX IF NOT EXISTS idx_reuni_products_active ON reuni_products(active);

-- ========================================
-- PASSO 7: INSERIR PRODUTOS REUNI DE EXEMPLO
-- ========================================

INSERT INTO reuni_products (name, active_principle, cbd_concentration, thc_concentration, presentation, manufacturer, reuni_code)
VALUES 
  ('Canabidiol 200mg/ml + THC 3mg/ml', 'CBD 200mg/ml + THC 3mg/ml', 200.00, 3.00, 'Óleo sublingual 30ml', 'Prati-Donaduzzi', 'REUNI-CBD-001'),
  ('Canabidiol 200mg/ml (Isolado)', 'CBD 200mg/ml', 200.00, 0.00, 'Óleo sublingual 30ml', 'Verdemed', 'REUNI-CBD-002'),
  ('Canabidiol 30mg/ml + THC 2mg/ml', 'CBD 30mg/ml + THC 2mg/ml', 30.00, 2.00, 'Óleo sublingual 10ml', 'HempMeds Brasil', 'REUNI-CBD-003')
ON CONFLICT (reuni_code) DO NOTHING;

-- ========================================
-- PASSO 8: VIEWS DE MONITORAMENTO
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
-- PASSO 9: POLÍTICAS RLS
-- ========================================

-- Habilitar RLS
ALTER TABLE embedding_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE reuni_products ENABLE ROW LEVEL SECURITY;

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

-- Políticas para reuni_products (todos podem ver, apenas admin pode editar)
DROP POLICY IF EXISTS "Public read reuni_products" ON reuni_products;
CREATE POLICY "Public read reuni_products" 
  ON reuni_products FOR SELECT 
  USING (active = TRUE);

DROP POLICY IF EXISTS "Admin manage reuni_products" ON reuni_products;
CREATE POLICY "Admin manage reuni_products" 
  ON reuni_products FOR ALL 
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

-- Mensagem final
DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ NOAVISION IA INSTALADO COM SUCESSO!';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Próximos passos:';
  RAISE NOTICE '1. Execute: setup_integration_consentimento.sql';
  RAISE NOTICE '2. Reinicie o servidor frontend';
  RAISE NOTICE '3. Acesse: http://localhost:8000';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Verificações:';
  RAISE NOTICE '- SELECT * FROM v_embeddings_by_profile;';
  RAISE NOTICE '- SELECT * FROM v_embedding_cache_stats;';
  RAISE NOTICE '- SELECT * FROM reuni_products WHERE active = TRUE;';
  RAISE NOTICE '';
  RAISE NOTICE '====================================';
END $$;

