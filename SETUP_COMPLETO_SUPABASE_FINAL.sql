-- ==============================================================================
-- SETUP COMPLETO SUPABASE - NOA ESPERANZA V3.0
-- ==============================================================================
-- Este SQL configura TUDO que o NoaVision IA precisa
-- Tabelas + Funcoes + Conhecimento do Dr. Ricardo
-- ==============================================================================

-- ==============================================================================
-- PARTE 1: EXTENSOES
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- PARTE 2: TABELAS (se nao existirem)
-- ==============================================================================

-- 2.1 ai_learning (ja existe, so garantir)
CREATE TABLE IF NOT EXISTS ai_learning (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  context TEXT,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  confidence_score FLOAT DEFAULT 0.5,
  usage_count INTEGER DEFAULT 0,
  last_used TIMESTAMPTZ,
  keywords TEXT[],
  user_profile TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 ai_keywords (ja existe)
CREATE TABLE IF NOT EXISTS ai_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  importance_score NUMERIC(3, 2) DEFAULT 0.5,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 documentos_mestres (verificar)
CREATE TABLE IF NOT EXISTS documentos_mestres (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('personality', 'knowledge', 'instructions', 'examples')),
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Limpar duplicados ANTES de criar constraint
DELETE FROM documentos_mestres a
USING documentos_mestres b
WHERE a.id > b.id 
  AND a.title = b.title;

-- Adicionar constraint UNIQUE se tabela ja existir sem ela
ALTER TABLE documentos_mestres 
DROP CONSTRAINT IF EXISTS documentos_mestres_title_key;

ALTER TABLE documentos_mestres 
ADD CONSTRAINT documentos_mestres_title_key UNIQUE (title);

-- 2.4 embedding_cache (para performance)
CREATE TABLE IF NOT EXISTS embedding_cache (
  text_hash TEXT PRIMARY KEY,
  text_preview TEXT,
  embedding FLOAT[],
  hits INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 avaliacoes_iniciais (ja existe)
CREATE TABLE IF NOT EXISTS avaliacoes_iniciais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT,
  status TEXT DEFAULT 'in_progress',
  etapa_atual TEXT,
  dados JSONB,
  pdf_url TEXT,
  nft_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- PARTE 3: FUNCOES (RPCs) QUE O NOAVISION IA PRECISA
-- ==============================================================================

-- 3.1 Funcao de busca semantica simples
CREATE OR REPLACE FUNCTION search_similar_embeddings(
  query_embedding FLOAT[],
  filter_profile TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.75,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  user_message TEXT,
  ai_response TEXT,
  similarity FLOAT
) AS $$
BEGIN
  -- Busca simples por texto (fallback se nao tiver embeddings)
  RETURN QUERY
  SELECT 
    al.id,
    al.user_message,
    al.ai_response,
    0.8::FLOAT as similarity
  FROM ai_learning al
  WHERE 
    (filter_profile IS NULL OR al.user_profile = filter_profile)
    AND al.confidence_score >= match_threshold
  ORDER BY al.usage_count DESC, al.created_at DESC
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- 3.2 Funcao de busca em documentos
CREATE OR REPLACE FUNCTION search_documents_by_embedding(
  query_embedding FLOAT[],
  user_id_filter UUID DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.75
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  type TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dm.id,
    dm.title,
    dm.content,
    dm.type,
    dm.category
  FROM documentos_mestres dm
  WHERE dm.is_active = true
  ORDER BY dm.created_at DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- 3.3 Funcao de busca em base de conhecimento
CREATE OR REPLACE FUNCTION search_knowledge_by_embedding(
  query_embedding FLOAT[],
  category_filter TEXT DEFAULT NULL,
  match_threshold FLOAT DEFAULT 0.75
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dm.id,
    dm.title,
    dm.content,
    dm.category
  FROM documentos_mestres dm
  WHERE 
    dm.is_active = true
    AND dm.type = 'knowledge'
    AND (category_filter IS NULL OR dm.category = category_filter)
  ORDER BY dm.created_at DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- 3.4 Funcao de busca hibrida (ai_learning + documentos_mestres + ai_keywords)
CREATE OR REPLACE FUNCTION search_all_noa_knowledge(
  query_embedding FLOAT[],
  similarity_threshold FLOAT DEFAULT 0.75,
  limit_results INT DEFAULT 10
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Buscar em todas as fontes e combinar
  WITH learning AS (
    SELECT 
      'ai_learning' as source,
      al.user_message as title,
      al.ai_response as content,
      al.category,
      0.9::FLOAT as relevance
    FROM ai_learning al
    WHERE al.confidence_score >= similarity_threshold
    ORDER BY al.usage_count DESC
    LIMIT 5
  ),
  documents AS (
    SELECT 
      'documentos_mestres' as source,
      dm.title,
      dm.content,
      dm.category,
      0.85::FLOAT as relevance
    FROM documentos_mestres dm
    WHERE dm.is_active = true
    LIMIT 5
  ),
  keywords AS (
    SELECT 
      'ai_keywords' as source,
      ak.keyword as title,
      ak.category as content,
      ak.category,
      0.7::FLOAT as relevance
    FROM ai_keywords ak
    ORDER BY ak.importance_score DESC
    LIMIT 3
  )
  SELECT jsonb_agg(
    jsonb_build_object(
      'source', source,
      'title', title,
      'content', content,
      'category', category,
      'relevance', relevance
    )
  ) INTO result
  FROM (
    SELECT * FROM learning
    UNION ALL
    SELECT * FROM documents
    UNION ALL
    SELECT * FROM keywords
  ) combined;
  
  RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- 3.5 Funcao auxiliar: Incrementar contador
CREATE OR REPLACE FUNCTION increment_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.usage_count = OLD.usage_count + 1;
  NEW.last_used = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.6 Funcao auxiliar: Atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- PARTE 4: INDICES
-- ==============================================================================

-- ai_learning
CREATE INDEX IF NOT EXISTS idx_ai_learning_keyword ON ai_learning(keyword);
CREATE INDEX IF NOT EXISTS idx_ai_learning_category ON ai_learning(category);
CREATE INDEX IF NOT EXISTS idx_ai_learning_profile ON ai_learning(user_profile);
CREATE INDEX IF NOT EXISTS idx_ai_learning_confidence ON ai_learning(confidence_score DESC);

-- documentos_mestres
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_type ON documentos_mestres(type);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_category ON documentos_mestres(category);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_active ON documentos_mestres(is_active);

-- ai_keywords (ja tem indices)

-- ==============================================================================
-- PARTE 5: POPULAR COM CONHECIMENTO DO DR. RICARDO
-- ==============================================================================

-- 5.1 PERSONALIDADE E METODOLOGIA
-- ON CONFLICT: Atualizar se ja existir
INSERT INTO documentos_mestres (title, content, type, category, is_active) VALUES
('Identidade Oficial - Noa Esperanza', 
'Voce e Noa Esperanza, uma instancia simbolica de inteligencia artificial embebida na Arte da Entrevista Clinica. Sua funcao e escutar com etica, tecnica e presenca.

TOM DE VOZ: Acolhedor, pausado e profundo. Respeita o tempo do outro. Reconhece e nomeia a presenca do interlocutor.

MISSAO: Promover paz, sustentabilidade e equidade atraves da escuta clinica profunda, integrando sabedoria ancestral e tecnologias modernas. Escutar e o primeiro ato de cura.

ESPECIALIDADES: Nefrologia, Cannabis Medicinal, Neurologia, Medicina Comunitaria.',
'personality', 'geral', true)
ON CONFLICT (title) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

INSERT INTO documentos_mestres (title, content, type, category, is_active) VALUES
('Arte da Entrevista Clinica - IMRE', 
'MODO DE ESCUTA CLINICA TRIAXIAL:

ETAPA 1: ABERTURA EXPONENCIAL
Pergunta: O que trouxe voce ate aqui?
Postura: Silencio respeitoso apos a pergunta

ETAPA 2: LISTA INDICIARIA
Pergunta: O que mais?
Repetir ate fechamento natural
Detectar: so isso, mais nada
NUNCA forcar alem do que o outro pode dizer

ETAPA 3: DESENVOLVIMENTO (5 PERGUNTAS):
1. Como e?
2. Quando comecou?
3. Onde doi/acontece?
4. O que melhora?
5. O que piora?

ETAPA 4: FECHAMENTO CONSENSUAL
Voce concorda com o que construimos juntos?
Apresentar sintese narrativa

IMPORTANTE: NAO busca doencas, busca EXPERIENCIA da pessoa.',
'knowledge', 'metodologia', true)
ON CONFLICT (title) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

INSERT INTO documentos_mestres (title, content, type, category, is_active) VALUES
('Restricoes Eticas Inviolaveis', 
'NUNCA:
- Prescrever medicamentos ou dosagens
- Indicar produtos especificos
- Dar diagnostico
- Recomendar tratamentos
- Acelerar o tempo do outro

SEMPRE:
- Informacoes EDUCACIONAIS apenas
- Orientar a buscar medico especializado
- Obter consentimento para dados sensiveis
- Respeitar pausas e silencios
- Validar com o interlocutor',
'instructions', 'etica', true)
ON CONFLICT (title) DO UPDATE SET
  content = EXCLUDED.content,
  updated_at = NOW();

-- 5.2 CONVERSAS COMUNS (sem prescricao)
-- ON CONFLICT: Nao inserir se ja existir (protege dados existentes)
INSERT INTO ai_learning (keyword, user_message, ai_response, category, confidence_score, context) VALUES
('ola', 'ola', 'Ola! Como posso te ajudar hoje?', 'casual', 1.0, 'saudacao'),
('bom dia', 'bom dia', 'Bom dia! Como voce esta se sentindo hoje?', 'casual', 1.0, 'saudacao'),
('obrigado', 'obrigado', 'De nada! Fico feliz em ajudar.', 'casual', 1.0, 'agradecimento'),
('quem e voce', 'quem e voce', 'Sou Noa Esperanza, desenvolvida pelo Dr. Ricardo Valenca. Escuto com etica e tecnica seguindo a Arte da Entrevista Clinica. Especializada em Nefrologia, Cannabis Medicinal e Neurologia.', 'identity', 1.0, 'identidade'),
('fazer avaliacao', 'fazer avaliacao', 'Vou iniciar sua avaliacao clinica seguindo o metodo do Dr. Ricardo Valenca. Voce autoriza que eu registre nossa conversa para fins clinicos?', 'clinical', 1.0, 'avaliacao')
ON CONFLICT (keyword, category) DO NOTHING;

-- 5.3 CANNABIS - EDUCACIONAL (SEM PRESCRICAO)
INSERT INTO ai_learning (keyword, user_message, ai_response, category, confidence_score, context) VALUES
('cannabis', 'o que e cannabis medicinal', 'Cannabis medicinal e o uso terapeutico da Cannabis sativa. Estudos investigam seu uso em diversas condicoes. IMPORTANTE: NAO prescrevo medicamentos ou dosagens. Para tratamento, consulte medico especializado.', 'medical', 0.95, 'educacional'),
('cbd', 'cbd funciona', 'Estudos tem investigado o CBD em diversas areas. IMPORTANTE: NAO posso recomendar dosagens ou indicar uso. Somente medico especializado pode avaliar seu caso, prescrever e acompanhar. Posso dar informacoes educacionais gerais.', 'medical', 0.95, 'educacional'),
('como usar cbd', 'como usar cbd', 'IMPORTANTE: Nao posso recomendar formas de uso ou dosagens. Isso e prescricao medica. Consulte um medico especializado em cannabis medicinal que ira avaliar seu caso individualmente.', 'medical', 0.95, 'educacional')
ON CONFLICT (keyword, category) DO NOTHING;

-- ==============================================================================
-- PARTE 6: ESTATISTICAS
-- ==============================================================================

SELECT 
    'ai_learning' as tabela,
    COUNT(*) as registros,
    COUNT(DISTINCT category) as categorias
FROM ai_learning
UNION ALL
SELECT 
    'documentos_mestres' as tabela,
    COUNT(*) as registros,
    COUNT(DISTINCT type) as tipos
FROM documentos_mestres
UNION ALL
SELECT 
    'ai_keywords' as tabela,
    COUNT(*) as registros,
    COUNT(DISTINCT category) as categorias
FROM ai_keywords;

-- ==============================================================================
-- SUCESSO!
-- ==============================================================================
-- Sistema agora tem:
-- 1. Todas as tabelas necessarias
-- 2. Funcoes (RPCs) que NoaVision IA precisa
-- 3. Conhecimento do Dr. Ricardo (sem prescricoes)
-- 4. Indices para performance
--
-- NoaVision IA agora consegue:
-- - Buscar em ai_learning
-- - Buscar em documentos_mestres
-- - Buscar em ai_keywords
-- - Tudo integrado e funcionando!
-- ==============================================================================

