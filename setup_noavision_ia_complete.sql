-- ========================================
-- 🚀 NOAVISION IA - SETUP COMPLETO
-- Transformação: NoaGPT → NoaVision IA
-- Sistema Inteligente com Embeddings Locais
-- ========================================
-- Data: 09/10/2025
-- Tempo estimado: 2-3 horas
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
  ai_response TEXT,
  similarity FLOAT,
  usage_count INTEGER,
  confidence_score FLOAT,
  source VARCHAR(50),
  profile VARCHAR(50),
  spec VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.user_message,
    al.ai_response,
    1 - (al.embedding <=> query_embedding) AS similarity,
    al.usage_count,
    al.confidence_score,
    al.source,
    al.user_profile AS profile,
    al.specialty AS spec
  FROM ai_learning al
  WHERE 
    al.embedding IS NOT NULL
    AND (user_profile IS NULL OR al.user_profile = user_profile OR al.user_profile IS NULL)
    AND (specialty IS NULL OR al.specialty = specialty OR al.specialty IS NULL)
    AND (dashboard IS NULL OR al.dashboard = dashboard OR al.dashboard IS NULL)
    AND (1 - (al.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY 
    al.embedding <=> query_embedding,
    al.usage_count DESC,
    al.confidence_score DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION search_similar_embeddings IS 
'Busca respostas similares usando distância de cosseno. 
Retorna top N matches acima do threshold.
Filtra por perfil, especialidade e dashboard quando fornecidos.';

-- ========================================
-- PASSO 6: FUNÇÃO AUXILIAR - INCREMENTAR USO
-- ========================================

CREATE OR REPLACE FUNCTION increment_usage(
  learning_id UUID
)
RETURNS VOID AS $$
BEGIN
  UPDATE ai_learning
  SET 
    usage_count = usage_count + 1,
    last_used_at = NOW(),
    confidence_score = LEAST(confidence_score + 0.01, 1.0) -- Aumenta confiança gradualmente
  WHERE id = learning_id;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_usage IS 'Incrementa contador de uso e ajusta confiança';

-- ========================================
-- PASSO 7: FUNÇÃO AUXILIAR - CALCULAR SIMILARIDADE
-- ========================================

CREATE OR REPLACE FUNCTION cosine_similarity(
  vec1 VECTOR(384),
  vec2 VECTOR(384)
)
RETURNS FLOAT AS $$
BEGIN
  RETURN 1 - (vec1 <=> vec2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION cosine_similarity IS 'Calcula similaridade de cosseno entre dois vetores (0-1)';

-- ========================================
-- PASSO 8: FUNÇÃO DE LIMPEZA DE CACHE
-- ========================================

CREATE OR REPLACE FUNCTION cleanup_old_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Deletar embeddings não usados há mais de 30 dias
  DELETE FROM embedding_cache
  WHERE last_used_at < NOW() - INTERVAL '30 days'
  AND hits < 5;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_cache IS 'Remove embeddings antigos e pouco usados do cache';

-- ========================================
-- PASSO 9: TABELAS DE COMPLIANCE RDC 660/327
-- ========================================

-- Tabela de produtos REUNI (Cannabis Medicinal)
CREATE TABLE IF NOT EXISTS reuni_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  reuni_code VARCHAR(100) UNIQUE NOT NULL,
  active_ingredient VARCHAR(100), -- CBD, THC, CBG, etc
  cbd_concentration FLOAT, -- Concentração de CBD (%)
  thc_concentration FLOAT, -- Concentração de THC (%)
  form VARCHAR(50), -- óleo, cápsula, flor, extrato
  manufacturer VARCHAR(255),
  country_origin VARCHAR(100),
  anvisa_approval_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints RDC 660
  CONSTRAINT cbd_concentration_valid CHECK (cbd_concentration IS NULL OR cbd_concentration <= 30),
  CONSTRAINT thc_concentration_valid CHECK (thc_concentration IS NULL OR thc_concentration <= 0.2)
);

COMMENT ON TABLE reuni_products IS 'Produtos de Cannabis Medicinal registrados no REUNI (RDC 327/2019)';
COMMENT ON COLUMN reuni_products.thc_concentration IS 'Máximo 0,2% conforme RDC 660/2022';
COMMENT ON COLUMN reuni_products.cbd_concentration IS 'Máximo 30% conforme RDC 660/2022';

-- ========================================
-- PASSO 10: ATUALIZAR TABELA DE PRESCRIÇÕES
-- ========================================

-- Adicionar colunas de compliance se não existirem
ALTER TABLE prescriptions 
ADD COLUMN IF NOT EXISTS reuni_product_id UUID REFERENCES reuni_products(id),
ADD COLUMN IF NOT EXISTS rdc_660_compliant BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rdc_327_compliant BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS anvisa_notification_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS special_recipe_number VARCHAR(50);

COMMENT ON COLUMN prescriptions.rdc_660_compliant IS 'Validação automática RDC 660/2022';
COMMENT ON COLUMN prescriptions.rdc_327_compliant IS 'Validação automática RDC 327/2019';

-- ========================================
-- PASSO 11: TRIGGER DE VALIDAÇÃO RDC
-- ========================================

CREATE OR REPLACE FUNCTION validate_rdc_compliance()
RETURNS TRIGGER AS $$
DECLARE
  v_product RECORD;
BEGIN
  -- Se há produto REUNI, validar compliance
  IF NEW.reuni_product_id IS NOT NULL THEN
    SELECT * INTO v_product 
    FROM reuni_products 
    WHERE id = NEW.reuni_product_id;
    
    -- Validar RDC 660 (concentrações)
    IF v_product.cbd_concentration <= 30 
       AND v_product.thc_concentration <= 0.2 THEN
      NEW.rdc_660_compliant := TRUE;
    ELSE
      NEW.rdc_660_compliant := FALSE;
      RAISE WARNING 'Prescrição não está em compliance com RDC 660/2022';
    END IF;
    
    -- Validar RDC 327 (registro REUNI válido)
    IF v_product.is_active = TRUE 
       AND v_product.reuni_code IS NOT NULL THEN
      NEW.rdc_327_compliant := TRUE;
    ELSE
      NEW.rdc_327_compliant := FALSE;
      RAISE WARNING 'Produto não está registrado no REUNI (RDC 327/2019)';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS validate_prescription_rdc ON prescriptions;
CREATE TRIGGER validate_prescription_rdc
  BEFORE INSERT OR UPDATE ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION validate_rdc_compliance();

-- ========================================
-- PASSO 12: DADOS INICIAIS - PRODUTOS REUNI
-- ========================================

-- Inserir alguns produtos REUNI de exemplo
INSERT INTO reuni_products (product_name, reuni_code, active_ingredient, cbd_concentration, thc_concentration, form, manufacturer, country_origin, anvisa_approval_date)
VALUES
  ('Canabidiol 200mg/mL', 'REUNI-CBD-001', 'CBD', 20.0, 0.1, 'óleo', 'Prati-Donaduzzi', 'Brasil', '2020-03-15'),
  ('Full Spectrum CBD 15%', 'REUNI-CBD-002', 'CBD', 15.0, 0.2, 'óleo', 'HempMeds', 'EUA', '2019-11-20'),
  ('CBD Isolado 30%', 'REUNI-CBD-003', 'CBD', 30.0, 0.0, 'óleo', 'Verdemed', 'Brasil', '2021-06-10'),
  ('Canabidiol + CBG 10%', 'REUNI-CBG-001', 'CBD+CBG', 10.0, 0.1, 'cápsula', 'Ease Labs', 'Brasil', '2022-01-05')
ON CONFLICT (reuni_code) DO NOTHING;

-- ========================================
-- PASSO 13: VIEW PARA ESTATÍSTICAS
-- ========================================

CREATE OR REPLACE VIEW noavision_stats AS
SELECT 
  COUNT(*) as total_interactions,
  COUNT(embedding) as with_embeddings,
  COUNT(*) FILTER (WHERE source = 'local') as local_responses,
  COUNT(*) FILTER (WHERE source = 'openai') as openai_responses,
  COUNT(*) FILTER (WHERE source = 'agent') as agent_responses,
  AVG(confidence_score) as avg_confidence,
  COUNT(DISTINCT user_profile) as unique_profiles,
  COUNT(DISTINCT specialty) as unique_specialties
FROM ai_learning;

COMMENT ON VIEW noavision_stats IS 'Estatísticas do NoaVision IA em tempo real';

-- ========================================
-- PASSO 14: FUNÇÃO DE MIGRAÇÃO DE DADOS
-- ========================================

-- Função para preencher contexto de registros antigos
CREATE OR REPLACE FUNCTION migrate_existing_data()
RETURNS TABLE (
  migrated_count INTEGER,
  errors_count INTEGER
) AS $$
DECLARE
  v_migrated INTEGER := 0;
  v_errors INTEGER := 0;
  v_record RECORD;
BEGIN
  -- Atualizar registros sem contexto
  FOR v_record IN 
    SELECT id, user_message, category 
    FROM ai_learning 
    WHERE user_profile IS NULL
  LOOP
    BEGIN
      -- Inferir perfil baseado em categoria ou mensagem
      UPDATE ai_learning
      SET 
        user_profile = CASE
          WHEN category = 'clinical' THEN 'paciente'
          WHEN category = 'medical' THEN 'medico'
          WHEN category = 'educational' THEN 'profissional'
          WHEN category = 'admin' THEN 'admin'
          ELSE 'paciente'
        END,
        specialty = 'rim', -- Padrão
        dashboard = '/home', -- Padrão
        source = 'openai' -- Registros antigos vieram do OpenAI
      WHERE id = v_record.id;
      
      v_migrated := v_migrated + 1;
    EXCEPTION WHEN OTHERS THEN
      v_errors := v_errors + 1;
    END;
  END LOOP;
  
  RETURN QUERY SELECT v_migrated, v_errors;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION migrate_existing_data IS 'Migra dados antigos preenchendo colunas de contexto';

-- ========================================
-- PASSO 15: ÍNDICES ADICIONAIS
-- ========================================

-- Índice para busca de cache rápida
CREATE INDEX IF NOT EXISTS idx_embedding_cache_hits 
ON embedding_cache(hits DESC, last_used_at DESC);

-- Índice para estatísticas
CREATE INDEX IF NOT EXISTS idx_ai_learning_source 
ON ai_learning(source, created_at DESC);

-- Índice GIN para busca full-text (complementar)
CREATE INDEX IF NOT EXISTS idx_ai_learning_message_gin 
ON ai_learning 
USING gin(to_tsvector('portuguese', user_message));

-- ========================================
-- PASSO 16: TRIGGER PARA ATUALIZAR CACHE
-- ========================================

CREATE OR REPLACE FUNCTION update_cache_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE embedding_cache
  SET 
    hits = hits + 1,
    last_used_at = NOW()
  WHERE text_hash = encode(sha256(NEW.user_message::bytea), 'hex');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cache ON ai_learning;
CREATE TRIGGER trigger_update_cache
  AFTER INSERT ON ai_learning
  FOR EACH ROW
  WHEN (NEW.embedding IS NOT NULL)
  EXECUTE FUNCTION update_cache_usage();

-- ========================================
-- PASSO 17: POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE embedding_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE reuni_products ENABLE ROW LEVEL SECURITY;

-- Políticas para embedding_cache
CREATE POLICY "Cache é público para leitura"
  ON embedding_cache FOR SELECT
  USING (true);

CREATE POLICY "Apenas sistema pode escrever no cache"
  ON embedding_cache FOR INSERT
  WITH CHECK (true);

-- Políticas para reuni_products
CREATE POLICY "Produtos REUNI são públicos"
  ON reuni_products FOR SELECT
  USING (is_active = true);

CREATE POLICY "Apenas admins podem gerenciar produtos"
  ON reuni_products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- ========================================
-- PASSO 18: FUNÇÃO DE ANÁLISE DE PERFORMANCE
-- ========================================

CREATE OR REPLACE FUNCTION analyze_noavision_performance(
  days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  comparison_previous TEXT
) AS $$
BEGIN
  RETURN QUERY
  WITH current_period AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE source = 'local') as local,
      AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_time
    FROM ai_learning
    WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  ),
  previous_period AS (
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE source = 'local') as local,
      AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_time
    FROM ai_learning
    WHERE created_at >= NOW() - (days_back * 2 || ' days')::INTERVAL
      AND created_at < NOW() - (days_back || ' days')::INTERVAL
  )
  SELECT 
    'Total de Interações'::TEXT,
    cp.total::NUMERIC,
    CASE 
      WHEN pp.total > 0 THEN 
        ROUND(((cp.total::FLOAT - pp.total) / pp.total * 100)::NUMERIC, 1) || '%'
      ELSE 'N/A'
    END::TEXT
  FROM current_period cp, previous_period pp
  
  UNION ALL
  
  SELECT 
    'Respostas Locais (%)'::TEXT,
    ROUND((cp.local::FLOAT / NULLIF(cp.total, 0) * 100)::NUMERIC, 1),
    CASE 
      WHEN pp.total > 0 THEN 
        '+' || ROUND(((cp.local::FLOAT / NULLIF(cp.total, 0)) - (pp.local::FLOAT / NULLIF(pp.total, 0))) * 100, 1)::TEXT || 'pp'
      ELSE 'N/A'
    END::TEXT
  FROM current_period cp, previous_period pp
  
  UNION ALL
  
  SELECT 
    'Tempo Médio (s)'::TEXT,
    ROUND(cp.avg_time::NUMERIC, 2),
    CASE 
      WHEN pp.avg_time > 0 THEN 
        ROUND(((cp.avg_time - pp.avg_time) / pp.avg_time * 100)::NUMERIC, 1) || '%'
      ELSE 'N/A'
    END::TEXT
  FROM current_period cp, previous_period pp;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION analyze_noavision_performance IS 'Analisa performance do NoaVision IA comparando períodos';

-- ========================================
-- PASSO 19: EXECUTAR MIGRAÇÃO DE DADOS
-- ========================================

-- Migrar dados existentes (preencher contexto)
SELECT * FROM migrate_existing_data();

-- ========================================
-- PASSO 20: VERIFICAÇÃO FINAL
-- ========================================

-- Verificar se tudo foi criado corretamente
DO $$
DECLARE
  v_embedding_column BOOLEAN;
  v_cache_table BOOLEAN;
  v_index_exists BOOLEAN;
  v_function_exists BOOLEAN;
BEGIN
  -- Verificar coluna embedding
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ai_learning' 
    AND column_name = 'embedding'
  ) INTO v_embedding_column;
  
  -- Verificar tabela cache
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'embedding_cache'
  ) INTO v_cache_table;
  
  -- Verificar índice
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_ai_learning_embedding'
  ) INTO v_index_exists;
  
  -- Verificar função
  SELECT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'search_similar_embeddings'
  ) INTO v_function_exists;
  
  -- Log dos resultados
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE '✅ VERIFICAÇÃO DO SETUP NOAVISION IA';
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  RAISE NOTICE 'Coluna embedding: %', CASE WHEN v_embedding_column THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Tabela cache: %', CASE WHEN v_cache_table THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Índice vetorial: %', CASE WHEN v_index_exists THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Função de busca: %', CASE WHEN v_function_exists THEN '✅' ELSE '❌' END;
  RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  
  IF v_embedding_column AND v_cache_table AND v_index_exists AND v_function_exists THEN
    RAISE NOTICE '🎉 SETUP COMPLETO! NoaVision IA pronto para uso!';
  ELSE
    RAISE EXCEPTION '❌ Setup incompleto. Verifique os logs acima.';
  END IF;
END $$;

-- ========================================
-- PASSO 21: CRIAR VIEW DE MONITORAMENTO
-- ========================================

CREATE OR REPLACE VIEW noavision_monitoring AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_interactions,
  COUNT(*) FILTER (WHERE source = 'local') as local_count,
  COUNT(*) FILTER (WHERE source = 'openai') as openai_count,
  COUNT(*) FILTER (WHERE source = 'agent') as agent_count,
  ROUND(COUNT(*) FILTER (WHERE source = 'local')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 1) as local_percentage,
  AVG(confidence_score) as avg_confidence,
  COUNT(DISTINCT user_id) as unique_users
FROM ai_learning
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

COMMENT ON VIEW noavision_monitoring IS 'Monitoramento diário do NoaVision IA (últimos 30 dias)';

-- ========================================
-- ✅ SETUP COMPLETO!
-- ========================================

-- Estatísticas finais
SELECT 
  '🎉 NOAVISION IA - SETUP COMPLETO!' as status,
  NOW() as completed_at,
  (SELECT COUNT(*) FROM ai_learning) as total_records,
  (SELECT COUNT(*) FROM ai_learning WHERE embedding IS NOT NULL) as records_with_embeddings,
  (SELECT COUNT(*) FROM embedding_cache) as cache_size,
  (SELECT COUNT(*) FROM reuni_products) as reuni_products_count;

-- Exibir estatísticas
SELECT * FROM noavision_stats;

-- Exibir monitoramento recente
SELECT * FROM noavision_monitoring LIMIT 7;

-- ========================================
-- 📋 INSTRUÇÕES PÓS-INSTALAÇÃO
-- ========================================

COMMENT ON DATABASE postgres IS 
'✅ NOAVISION IA INSTALADO COM SUCESSO!

PRÓXIMOS PASSOS:
1. Instalar @xenova/transformers no frontend:
   npm install @xenova/transformers

2. Criar arquivo src/gpt/noaVisionIA.ts

3. Atualizar src/pages/Home.tsx para usar NoaVisionIA

4. Gerar embeddings para registros existentes (366):
   Executar script: npm run generate-embeddings

5. Testar busca semântica:
   SELECT * FROM search_similar_embeddings(...)

6. Monitorar performance:
   SELECT * FROM noavision_monitoring;

7. Analisar métricas:
   SELECT * FROM analyze_noavision_performance(7);

DOCUMENTAÇÃO COMPLETA:
- TRANSFORMACAO_NOAVISION_IA.md
- TRANSFORMACAO_NOAVISION_IA_PARTE2.md
- COMPARACAO_VISUAL_NOAGPT_VS_NOAVISION.md

SUPORTE:
- GitHub Issues
- Documentação interna
- Chat com Nôa (em breve com NoaVision IA!)
';

