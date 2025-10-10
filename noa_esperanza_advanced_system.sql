-- 🚀 NÔA ESPERANZA ADVANCED SYSTEM - SQL EVOLUTIVO COMPLETO
-- Sistema avançado com Reasoning Layer, Ferramentas Médicas e Harmony Format

-- ========================================
-- 🧠 REASONING LAYER TABLES
-- ========================================

-- Tabela para cadeias de raciocínio
CREATE TABLE IF NOT EXISTS reasoning_chains (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL DEFAULT 'dr-ricardo-valenca',
  query TEXT NOT NULL,
  effort_level VARCHAR(50) NOT NULL DEFAULT 'medium',
  steps JSONB DEFAULT '[]',
  conclusion TEXT,
  confidence REAL DEFAULT 0.0,
  tools_used TEXT[] DEFAULT '{}',
  clinical_context JSONB,
  research_context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para passos de raciocínio
CREATE TABLE IF NOT EXISTS reasoning_steps (
  id VARCHAR(255) PRIMARY KEY,
  chain_id VARCHAR(255) REFERENCES reasoning_chains(id) ON DELETE CASCADE,
  step_type VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  confidence REAL DEFAULT 0.0,
  evidence TEXT[] DEFAULT '{}',
  next_steps TEXT[] DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 🔧 MEDICAL TOOLS TABLES
-- ========================================

-- Tabela para ferramentas médicas
CREATE TABLE IF NOT EXISTS medical_tools (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tool_type VARCHAR(50) NOT NULL,
  capabilities TEXT[] DEFAULT '{}',
  parameters JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para execuções de ferramentas
CREATE TABLE IF NOT EXISTS tool_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_id VARCHAR(255) REFERENCES medical_tools(id),
  user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
  input_data JSONB NOT NULL,
  output_data JSONB,
  success BOOLEAN DEFAULT FALSE,
  execution_time INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para resultados de busca médica
CREATE TABLE IF NOT EXISTS medical_search_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query TEXT NOT NULL,
  domain VARCHAR(50) NOT NULL,
  url VARCHAR(500),
  title VARCHAR(255),
  content TEXT,
  relevance REAL DEFAULT 0.0,
  source VARCHAR(255),
  user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 🎯 HARMONY FORMAT TABLES
-- ========================================

-- Tabela para conversações Harmony
CREATE TABLE IF NOT EXISTS harmony_conversations (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL DEFAULT 'dr-ricardo-valenca',
  messages JSONB DEFAULT '[]',
  context JSONB DEFAULT '{}',
  tools JSONB DEFAULT '[]',
  session_type VARCHAR(50) DEFAULT 'general',
  reasoning_level VARCHAR(50) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para mensagens Harmony
CREATE TABLE IF NOT EXISTS harmony_messages (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) REFERENCES harmony_conversations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para chamadas de ferramentas
CREATE TABLE IF NOT EXISTS tool_calls (
  id VARCHAR(255) PRIMARY KEY,
  conversation_id VARCHAR(255) REFERENCES harmony_conversations(id) ON DELETE CASCADE,
  message_id VARCHAR(255) REFERENCES harmony_messages(id) ON DELETE CASCADE,
  tool_name VARCHAR(255) NOT NULL,
  parameters JSONB NOT NULL,
  result JSONB,
  success BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 🔄 ORCHESTRATION & INTEGRATION TABLES
-- ========================================

-- Tabela para orquestração de ferramentas
CREATE TABLE IF NOT EXISTS tool_orchestration (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
  orchestration_plan JSONB NOT NULL,
  current_step INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  results JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para configurações de API
CREATE TABLE IF NOT EXISTS api_configurations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  api_type VARCHAR(50) NOT NULL,
  configuration JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 📊 ANALYTICS & MONITORING TABLES
-- ========================================

-- Tabela para métricas de performance
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255),
  user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
  metric_type VARCHAR(50) NOT NULL,
  metric_value REAL NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para logs de sistema
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level VARCHAR(20) NOT NULL,
  component VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 🎯 ÍNDICES PARA PERFORMANCE
-- ========================================

-- Índices para reasoning_chains
CREATE INDEX IF NOT EXISTS idx_reasoning_chains_user_id ON reasoning_chains(user_id);
CREATE INDEX IF NOT EXISTS idx_reasoning_chains_effort_level ON reasoning_chains(effort_level);
CREATE INDEX IF NOT EXISTS idx_reasoning_chains_created_at ON reasoning_chains(created_at DESC);

-- Índices para reasoning_steps
CREATE INDEX IF NOT EXISTS idx_reasoning_steps_chain_id ON reasoning_steps(chain_id);
CREATE INDEX IF NOT EXISTS idx_reasoning_steps_step_type ON reasoning_steps(step_type);

-- Índices para medical_tools
CREATE INDEX IF NOT EXISTS idx_medical_tools_tool_type ON medical_tools(tool_type);
CREATE INDEX IF NOT EXISTS idx_medical_tools_is_active ON medical_tools(is_active);

-- Índices para tool_executions
CREATE INDEX IF NOT EXISTS idx_tool_executions_tool_id ON tool_executions(tool_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_user_id ON tool_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_tool_executions_created_at ON tool_executions(created_at DESC);

-- Índices para medical_search_results
CREATE INDEX IF NOT EXISTS idx_medical_search_results_query ON medical_search_results USING gin(to_tsvector('portuguese', query));
CREATE INDEX IF NOT EXISTS idx_medical_search_results_domain ON medical_search_results(domain);
CREATE INDEX IF NOT EXISTS idx_medical_search_results_created_at ON medical_search_results(created_at DESC);

-- Índices para harmony_conversations
CREATE INDEX IF NOT EXISTS idx_harmony_conversations_user_id ON harmony_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_harmony_conversations_session_type ON harmony_conversations(session_type);
CREATE INDEX IF NOT EXISTS idx_harmony_conversations_updated_at ON harmony_conversations(updated_at DESC);

-- Índices para harmony_messages
CREATE INDEX IF NOT EXISTS idx_harmony_messages_conversation_id ON harmony_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_harmony_messages_role ON harmony_messages(role);
CREATE INDEX IF NOT EXISTS idx_harmony_messages_timestamp ON harmony_messages(timestamp DESC);

-- Índices para tool_calls
CREATE INDEX IF NOT EXISTS idx_tool_calls_conversation_id ON tool_calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_tool_calls_tool_name ON tool_calls(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_calls_timestamp ON tool_calls(timestamp DESC);

-- Índices para tool_orchestration
CREATE INDEX IF NOT EXISTS idx_tool_orchestration_session_id ON tool_orchestration(session_id);
CREATE INDEX IF NOT EXISTS idx_tool_orchestration_status ON tool_orchestration(status);

-- Índices para performance_metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_type ON performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_timestamp ON performance_metrics(timestamp DESC);

-- Índices para system_logs
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_component ON system_logs(component);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);

-- ========================================
-- 🔒 RLS POLICIES
-- ========================================

-- Habilitar RLS
ALTER TABLE reasoning_chains ENABLE ROW LEVEL SECURITY;
ALTER TABLE reasoning_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_search_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE harmony_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE harmony_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_orchestration ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage their own reasoning chains" ON reasoning_chains
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own reasoning steps" ON reasoning_steps
  FOR ALL USING (chain_id IN (SELECT id FROM reasoning_chains WHERE user_id = current_setting('app.current_user_id', true)));

CREATE POLICY "Users can manage their own medical tools" ON medical_tools
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own tool executions" ON tool_executions
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own medical search results" ON medical_search_results
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own harmony conversations" ON harmony_conversations
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own harmony messages" ON harmony_messages
  FOR ALL USING (conversation_id IN (SELECT id FROM harmony_conversations WHERE user_id = current_setting('app.current_user_id', true)));

CREATE POLICY "Users can manage their own tool calls" ON tool_calls
  FOR ALL USING (conversation_id IN (SELECT id FROM harmony_conversations WHERE user_id = current_setting('app.current_user_id', true)));

CREATE POLICY "Users can manage their own tool orchestration" ON tool_orchestration
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own API configurations" ON api_configurations
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own performance metrics" ON performance_metrics
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own system logs" ON system_logs
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- ========================================
-- 🔧 FUNÇÕES AVANÇADAS
-- ========================================

-- Função para iniciar raciocínio
CREATE OR REPLACE FUNCTION start_reasoning(
  p_query TEXT,
  p_effort_level VARCHAR(50) DEFAULT 'medium',
  p_clinical_context JSONB DEFAULT NULL,
  p_research_context JSONB DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  chain_id VARCHAR(255);
  result JSONB;
BEGIN
  chain_id := 'reasoning_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 9);
  
  INSERT INTO reasoning_chains (
    id, user_id, query, effort_level, clinical_context, research_context
  ) VALUES (
    chain_id, 'dr-ricardo-valenca', p_query, p_effort_level, p_clinical_context, p_research_context
  );
  
  result := jsonb_build_object(
    'status', 'success',
    'message', 'Raciocínio iniciado',
    'chain_id', chain_id,
    'effort_level', p_effort_level
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para executar ferramenta médica
CREATE OR REPLACE FUNCTION execute_medical_tool(
  p_tool_name VARCHAR(255),
  p_input_data JSONB,
  p_user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca'
) RETURNS JSONB AS $$
DECLARE
  tool_id VARCHAR(255);
  execution_id UUID;
  result JSONB;
BEGIN
  -- Buscar ID da ferramenta
  SELECT id INTO tool_id
  FROM medical_tools
  WHERE name = p_tool_name AND is_active = TRUE;
  
  IF tool_id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Ferramenta não encontrada ou inativa'
    );
  END IF;
  
  -- Registrar execução
  INSERT INTO tool_executions (tool_id, user_id, input_data, success)
  VALUES (tool_id, p_user_id, p_input_data, FALSE)
  RETURNING id INTO execution_id;
  
  result := jsonb_build_object(
    'status', 'success',
    'message', 'Execução iniciada',
    'execution_id', execution_id,
    'tool_name', p_tool_name
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para criar conversação Harmony
CREATE OR REPLACE FUNCTION create_harmony_conversation(
  p_initial_message TEXT,
  p_session_type VARCHAR(50) DEFAULT 'general',
  p_reasoning_level VARCHAR(50) DEFAULT 'medium',
  p_context JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  conversation_id VARCHAR(255);
  result JSONB;
BEGIN
  conversation_id := 'harmony_' || extract(epoch from now())::text || '_' || substr(md5(random()::text), 1, 9);
  
  INSERT INTO harmony_conversations (
    id, user_id, session_type, reasoning_level, context
  ) VALUES (
    conversation_id, 'dr-ricardo-valenca', p_session_type, p_reasoning_level, p_context
  );
  
  result := jsonb_build_object(
    'status', 'success',
    'message', 'Conversação Harmony criada',
    'conversation_id', conversation_id,
    'session_type', p_session_type,
    'reasoning_level', p_reasoning_level
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para orquestração de ferramentas
CREATE OR REPLACE FUNCTION orchestrate_tools(
  p_session_id VARCHAR(255),
  p_orchestration_plan JSONB,
  p_user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca'
) RETURNS JSONB AS $$
DECLARE
  orchestration_id UUID;
  total_steps INTEGER;
  result JSONB;
BEGIN
  total_steps := jsonb_array_length(p_orchestration_plan->'steps');
  
  INSERT INTO tool_orchestration (
    session_id, user_id, orchestration_plan, total_steps
  ) VALUES (
    p_session_id, p_user_id, p_orchestration_plan, total_steps
  ) RETURNING id INTO orchestration_id;
  
  result := jsonb_build_object(
    'status', 'success',
    'message', 'Orquestração iniciada',
    'orchestration_id', orchestration_id,
    'total_steps', total_steps
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para métricas de performance
CREATE OR REPLACE FUNCTION record_performance_metric(
  p_metric_type VARCHAR(50),
  p_metric_value REAL,
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}',
  p_user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca'
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  INSERT INTO performance_metrics (
    session_id, user_id, metric_type, metric_value, metadata
  ) VALUES (
    p_session_id, p_user_id, p_metric_type, p_metric_value, p_metadata
  );
  
  result := jsonb_build_object(
    'status', 'success',
    'message', 'Métrica registrada',
    'metric_type', p_metric_type,
    'metric_value', p_metric_value
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 🎯 TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ========================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas necessárias
CREATE TRIGGER update_reasoning_chains_updated_at
  BEFORE UPDATE ON reasoning_chains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_harmony_conversations_updated_at
  BEFORE UPDATE ON harmony_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tool_orchestration_updated_at
  BEFORE UPDATE ON tool_orchestration
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 📊 DADOS INICIAIS
-- ========================================

-- Inserir ferramentas médicas padrão
INSERT INTO medical_tools (id, name, description, tool_type, capabilities, is_active) VALUES
('medical_browser', 'Browser Médico', 'Busca em bases médicas especializadas', 'browser', ARRAY['pubmed', 'who', 'nih', 'local'], TRUE),
('medical_python', 'Python Clínico', 'Execução de código Python para cálculos médicos', 'python', ARRAY['calculations', 'statistics', 'visualization'], TRUE),
('medical_calculator', 'Calculadora Médica', 'Cálculos médicos específicos', 'calculator', ARRAY['bmi', 'dosage', 'conversion', 'formulas'], TRUE),
('guidelines_checker', 'Verificador de Guidelines', 'Consulta de diretrizes médicas', 'guideline', ARRAY['protocols', 'recommendations', 'evidence'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- Inserir configurações de API padrão
INSERT INTO api_configurations (name, api_type, configuration, is_active) VALUES
('OpenAI GPT-4', 'openai', '{"model": "gpt-4", "temperature": 0.7, "max_tokens": 2000}', TRUE),
('Nôa Esperanza Core', 'noa_core', '{"reasoning_level": "high", "clinical_mode": true}', TRUE),
('Harmony Format', 'harmony', '{"format_version": "2.0", "tools_enabled": true}', TRUE)
ON CONFLICT DO NOTHING;

-- ========================================
-- 📋 COMENTÁRIOS DAS TABELAS
-- ========================================

COMMENT ON TABLE reasoning_chains IS 'Cadeias de raciocínio estruturado da Nôa Esperanza';
COMMENT ON TABLE reasoning_steps IS 'Passos individuais do raciocínio';
COMMENT ON TABLE medical_tools IS 'Ferramentas médicas especializadas';
COMMENT ON TABLE tool_executions IS 'Execuções de ferramentas médicas';
COMMENT ON TABLE medical_search_results IS 'Resultados de busca médica';
COMMENT ON TABLE harmony_conversations IS 'Conversações no formato Harmony';
COMMENT ON TABLE harmony_messages IS 'Mensagens estruturadas Harmony';
COMMENT ON TABLE tool_calls IS 'Chamadas de ferramentas nas conversações';
COMMENT ON TABLE tool_orchestration IS 'Orquestração inteligente de ferramentas';
COMMENT ON TABLE api_configurations IS 'Configurações de APIs integradas';
COMMENT ON TABLE performance_metrics IS 'Métricas de performance do sistema';
COMMENT ON TABLE system_logs IS 'Logs do sistema Nôa Esperanza';

-- ========================================
-- ✅ VERIFICAÇÃO FINAL
-- ========================================

SELECT 
  'Sistema Nôa Esperanza Avançado criado com sucesso!' as status,
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND (
    table_name LIKE '%reasoning%' OR 
    table_name LIKE '%harmony%' OR 
    table_name LIKE '%medical%' OR 
    table_name LIKE '%tool%'
  )) as tabelas_criadas,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%reasoning%') as funcoes_reasoning,
  (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name LIKE '%harmony%') as funcoes_harmony;
