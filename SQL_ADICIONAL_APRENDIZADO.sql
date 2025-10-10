-- ========================================
-- 🧠 SQL ADICIONAL: APRENDIZADO ATIVO
-- Adiciona funções para incrementar uso
-- ========================================

-- Adicionar coluna last_used_at se não existir
ALTER TABLE ai_learning 
ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

COMMENT ON COLUMN ai_learning.last_used_at IS 'Última vez que essa resposta foi usada';

-- Criar índice para ordenação
CREATE INDEX IF NOT EXISTS idx_ai_learning_last_used 
ON ai_learning(last_used_at DESC);

-- ========================================
-- FUNÇÃO: INCREMENTAR USO
-- ========================================

CREATE OR REPLACE FUNCTION increment_ai_usage(learning_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_learning
  SET 
    usage_count = usage_count + 1,
    last_used_at = NOW()
  WHERE id = learning_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_ai_usage IS 'Incrementa contador de uso e atualiza timestamp';

-- ========================================
-- VIEW: TOP RESPOSTAS MAIS USADAS
-- ========================================

CREATE OR REPLACE VIEW v_ai_top_responses AS
SELECT 
  id,
  user_message,
  ai_response,
  usage_count,
  confidence_score,
  user_profile,
  specialty,
  last_used_at,
  created_at
FROM ai_learning
WHERE embedding IS NOT NULL
ORDER BY usage_count DESC, confidence_score DESC
LIMIT 50;

COMMENT ON VIEW v_ai_top_responses IS 'Top 50 respostas mais usadas (aprendizado)';

-- ========================================
-- VIEW: ESTATÍSTICAS DE APRENDIZADO
-- ========================================

CREATE OR REPLACE VIEW v_ai_learning_stats AS
SELECT 
  COUNT(*) as total_interactions,
  COUNT(CASE WHEN embedding IS NOT NULL THEN 1 END) as with_embeddings,
  COUNT(CASE WHEN embedding IS NULL THEN 1 END) as without_embeddings,
  AVG(confidence_score) as avg_confidence,
  AVG(usage_count) as avg_usage,
  MAX(usage_count) as max_usage,
  COUNT(DISTINCT user_profile) as unique_profiles,
  COUNT(DISTINCT specialty) as unique_specialties,
  SUM(usage_count) as total_reuses
FROM ai_learning;

COMMENT ON VIEW v_ai_learning_stats IS 'Estatísticas gerais do aprendizado da IA';

-- ========================================
-- ✅ APRENDIZADO ATIVO CONFIGURADO!
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ APRENDIZADO ATIVO INSTALADO!';
  RAISE NOTICE '====================================';
  RAISE NOTICE ' ';
  RAISE NOTICE '🧠 Funções criadas:';
  RAISE NOTICE '- increment_ai_usage(learning_id)';
  RAISE NOTICE ' ';
  RAISE NOTICE '📊 Views criadas:';
  RAISE NOTICE '- v_ai_top_responses (top 50)';
  RAISE NOTICE '- v_ai_learning_stats (estatísticas)';
  RAISE NOTICE ' ';
  RAISE NOTICE '🔍 Testar:';
  RAISE NOTICE '- SELECT * FROM v_ai_learning_stats;';
  RAISE NOTICE '- SELECT * FROM v_ai_top_responses;';
  RAISE NOTICE ' ';
  RAISE NOTICE '====================================';
END $$;

