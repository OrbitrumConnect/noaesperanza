-- 🧠 SEMANTIC ATTENTION DATABASE - Dr. Ricardo Valença
-- Sistema de attention semântica e memória vetorial individualizada

-- Tabela para contexto semântico do usuário
CREATE TABLE IF NOT EXISTS user_semantic_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL,
  semantic_profile JSONB NOT NULL DEFAULT '{}',
  conversation_vector REAL[] DEFAULT '{}',
  attention_weights JSONB NOT NULL DEFAULT '{}',
  last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para histórico de conversas com contexto semântico
CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  semantic_features JSONB DEFAULT '{}',
  attention_scores JSONB DEFAULT '{}',
  focused_context JSONB DEFAULT '{}',
  response TEXT,
  relevance_score REAL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para memória vetorial individualizada
CREATE TABLE IF NOT EXISTS vector_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  semantic_vector REAL[] DEFAULT '{}',
  attention_weights JSONB DEFAULT '{}',
  relevance REAL DEFAULT 0.0,
  tags TEXT[] DEFAULT '{}',
  context_type VARCHAR(100) DEFAULT 'conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_semantic_context_user_id ON user_semantic_context(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at ON conversation_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vector_memory_user_id ON vector_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_vector_memory_relevance ON vector_memory(relevance DESC);

-- RLS Policies
ALTER TABLE user_semantic_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_memory ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view their own semantic context" ON user_semantic_context
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can update their own semantic context" ON user_semantic_context
  FOR UPDATE USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own semantic context" ON user_semantic_context
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view their own conversation history" ON conversation_history
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own conversation history" ON conversation_history
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can view their own vector memory" ON vector_memory
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can insert their own vector memory" ON vector_memory
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true));

-- Funções para attention semântica
CREATE OR REPLACE FUNCTION activate_semantic_attention(
  p_user_id VARCHAR(255),
  p_user_name VARCHAR(255)
) RETURNS JSONB AS $$
DECLARE
  user_context JSONB;
BEGIN
  -- Buscar ou criar contexto do usuário
  SELECT to_jsonb(usc.*) INTO user_context
  FROM user_semantic_context usc
  WHERE usc.user_id = p_user_id;
  
  IF user_context IS NULL THEN
    -- Criar novo contexto
    INSERT INTO user_semantic_context (
      user_id,
      user_name,
      semantic_profile,
      attention_weights
    ) VALUES (
      p_user_id,
      p_user_name,
      '{
        "expertise": ["medicine", "technology"],
        "interests": ["ai", "research", "innovation"],
        "communicationStyle": "collaborative",
        "preferredDepth": "comprehensive",
        "languagePatterns": [],
        "contextMemory": []
      }'::jsonb,
      '{
        "technicalTerms": 0.8,
        "medicalContext": 0.9,
        "researchFocus": 0.7,
        "personalContext": 0.6,
        "temporalRelevance": 0.5
      }'::jsonb
    );
    
    -- Buscar contexto criado
    SELECT to_jsonb(usc.*) INTO user_context
    FROM user_semantic_context usc
    WHERE usc.user_id = p_user_id;
  END IF;
  
  -- Atualizar última interação
  UPDATE user_semantic_context
  SET last_interaction = NOW(), updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Attention semântica ativada',
    'user_context', user_context
  );
END;
$$ LANGUAGE plpgsql;

-- Função para processar input com attention
CREATE OR REPLACE FUNCTION process_input_with_attention(
  p_user_id VARCHAR(255),
  p_input TEXT
) RETURNS JSONB AS $$
DECLARE
  user_context JSONB;
  semantic_features JSONB;
  attention_scores JSONB;
  focused_context JSONB;
  result JSONB;
BEGIN
  -- Buscar contexto do usuário
  SELECT to_jsonb(usc.*) INTO user_context
  FROM user_semantic_context usc
  WHERE usc.user_id = p_user_id;
  
  IF user_context IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Contexto do usuário não encontrado'
    );
  END IF;
  
  -- Extrair características semânticas (simplificado)
  SELECT jsonb_build_object(
    'technicalTerms', CASE WHEN p_input ILIKE '%método%' OR p_input ILIKE '%análise%' THEN 0.8 ELSE 0.2 END,
    'medicalContext', CASE WHEN p_input ILIKE '%paciente%' OR p_input ILIKE '%tratamento%' THEN 0.9 ELSE 0.1 END,
    'researchFocus', CASE WHEN p_input ILIKE '%pesquisa%' OR p_input ILIKE '%estudo%' THEN 0.7 ELSE 0.3 END,
    'personalContext', CASE WHEN p_input ILIKE '%eu%' OR p_input ILIKE '%minha%' THEN 0.6 ELSE 0.2 END,
    'temporalRelevance', CASE WHEN p_input ILIKE '%agora%' OR p_input ILIKE '%hoje%' THEN 0.8 ELSE 0.4 END
  ) INTO semantic_features;
  
  -- Calcular scores de attention
  SELECT jsonb_build_object(
    'technical', (semantic_features->>'technicalTerms')::REAL * (user_context->'attention_weights'->>'technicalTerms')::REAL,
    'medical', (semantic_features->>'medicalContext')::REAL * (user_context->'attention_weights'->>'medicalContext')::REAL,
    'research', (semantic_features->>'researchFocus')::REAL * (user_context->'attention_weights'->>'researchFocus')::REAL,
    'personal', (semantic_features->>'personalContext')::REAL * (user_context->'attention_weights'->>'personalContext')::REAL,
    'temporal', (semantic_features->>'temporalRelevance')::REAL * (user_context->'attention_weights'->>'temporalRelevance')::REAL
  ) INTO attention_scores;
  
  -- Gerar contexto focado
  SELECT jsonb_build_object(
    'input', p_input,
    'dominantContext', CASE 
      WHEN (attention_scores->>'technical')::REAL > 0.5 THEN 'technical'
      WHEN (attention_scores->>'medical')::REAL > 0.5 THEN 'medical'
      WHEN (attention_scores->>'research')::REAL > 0.5 THEN 'research'
      WHEN (attention_scores->>'personal')::REAL > 0.5 THEN 'personal'
      ELSE 'general'
    END,
    'attentionScores', attention_scores,
    'semanticFocus', 'análise contextualizada',
    'responseStrategy', 'resposta focada'
  ) INTO focused_context;
  
  -- Salvar no histórico
  INSERT INTO conversation_history (
    user_id,
    content,
    semantic_features,
    attention_scores,
    focused_context
  ) VALUES (
    p_user_id,
    p_input,
    semantic_features,
    attention_scores,
    focused_context
  );
  
  -- Retornar resultado
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Input processado com attention semântica',
    'semantic_features', semantic_features,
    'attention_scores', attention_scores,
    'focused_context', focused_context,
    'user_context', user_context
  );
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar memória vetorial
CREATE OR REPLACE FUNCTION update_vector_memory(
  p_user_id VARCHAR(255),
  p_content TEXT,
  p_relevance REAL DEFAULT 0.5,
  p_tags TEXT[] DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Inserir na memória vetorial
  INSERT INTO vector_memory (
    user_id,
    content,
    relevance,
    tags
  ) VALUES (
    p_user_id,
    p_content,
    p_relevance,
    p_tags
  );
  
  -- Manter apenas as 100 memórias mais relevantes
  DELETE FROM vector_memory
  WHERE user_id = p_user_id
    AND id NOT IN (
      SELECT id FROM vector_memory
      WHERE user_id = p_user_id
      ORDER BY relevance DESC
      LIMIT 100
    );
  
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Memória vetorial atualizada'
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_semantic_context_updated_at
  BEFORE UPDATE ON user_semantic_context
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais para Dr. Ricardo Valença
INSERT INTO user_semantic_context (
  user_id,
  user_name,
  semantic_profile,
  attention_weights
) VALUES (
  'dr-ricardo-valenca',
  'Dr. Ricardo Valença',
  '{
    "expertise": ["nefrologia", "neurologia", "cannabis medicinal", "tecnologia médica"],
    "interests": ["ia médica", "pesquisa clínica", "inovação tecnológica", "estudo vivo"],
    "communicationStyle": "collaborative",
    "preferredDepth": "comprehensive",
    "languagePatterns": ["técnico", "colaborativo", "inovador"],
    "contextMemory": []
  }'::jsonb,
  '{
    "technicalTerms": 0.9,
    "medicalContext": 0.95,
    "researchFocus": 0.85,
    "personalContext": 0.7,
    "temporalRelevance": 0.8
  }'::jsonb
) ON CONFLICT (user_id) DO NOTHING;

-- Comentários das tabelas
COMMENT ON TABLE user_semantic_context IS 'Contexto semântico individualizado para cada usuário';
COMMENT ON TABLE conversation_history IS 'Histórico de conversas com análise semântica';
COMMENT ON TABLE vector_memory IS 'Memória vetorial individualizada por usuário';

COMMENT ON FUNCTION activate_semantic_attention IS 'Ativa attention semântica para um usuário específico';
COMMENT ON FUNCTION process_input_with_attention IS 'Processa input do usuário com attention semântica focada';
COMMENT ON FUNCTION update_vector_memory IS 'Atualiza memória vetorial individualizada';

-- Verificação final
SELECT 'Sistema de Attention Semântica criado com sucesso!' as status;
