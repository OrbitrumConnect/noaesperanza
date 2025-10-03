-- 🚀 GPT BUILDER ADVANCED DATABASE - Dr. Ricardo Valença
-- Sistema avançado para contexto ativo, módulos GPT e editor inteligente

-- Tabela para contexto ativo por sessão
CREATE TABLE IF NOT EXISTS active_contexts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doc_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  gpt_module VARCHAR(100),
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(255) NOT NULL,
  learning_data JSONB DEFAULT '{}',
  user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para módulos GPT funcionais
CREATE TABLE IF NOT EXISTS gpt_modules (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  function VARCHAR(255) NOT NULL,
  description TEXT,
  documents TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  prompt_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para sessões de GPT
CREATE TABLE IF NOT EXISTS gpt_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  active_contexts TEXT[] DEFAULT '{}',
  current_focus VARCHAR(255),
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_interactions INTEGER DEFAULT 0,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para histórico de sugestões do editor
CREATE TABLE IF NOT EXISTS editor_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id VARCHAR(255),
  suggestion_type VARCHAR(50) NOT NULL, -- complement, improvement, continuation
  original_text TEXT,
  suggested_text TEXT NOT NULL,
  confidence REAL DEFAULT 0.0,
  applied BOOLEAN DEFAULT FALSE,
  user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para configurações de exportação
CREATE TABLE IF NOT EXISTS gpt_exports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  gpt_config JSONB NOT NULL,
  exported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca'
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_active_contexts_session_id ON active_contexts(session_id);
CREATE INDEX IF NOT EXISTS idx_active_contexts_user_id ON active_contexts(user_id);
CREATE INDEX IF NOT EXISTS idx_active_contexts_last_accessed ON active_contexts(last_accessed DESC);

CREATE INDEX IF NOT EXISTS idx_gpt_modules_user_id ON gpt_modules(user_id);
CREATE INDEX IF NOT EXISTS idx_gpt_modules_is_active ON gpt_modules(is_active);
CREATE INDEX IF NOT EXISTS idx_gpt_modules_function ON gpt_modules(function);

CREATE INDEX IF NOT EXISTS idx_gpt_sessions_user_id ON gpt_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_gpt_sessions_session_start ON gpt_sessions(session_start DESC);

CREATE INDEX IF NOT EXISTS idx_editor_suggestions_document_id ON editor_suggestions(document_id);
CREATE INDEX IF NOT EXISTS idx_editor_suggestions_user_id ON editor_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_editor_suggestions_created_at ON editor_suggestions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gpt_exports_user_id ON gpt_exports(user_id);
CREATE INDEX IF NOT EXISTS idx_gpt_exports_exported_at ON gpt_exports(exported_at DESC);

-- RLS Policies
ALTER TABLE active_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpt_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpt_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE editor_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpt_exports ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can manage their own active contexts" ON active_contexts
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own GPT modules" ON gpt_modules
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own GPT sessions" ON gpt_sessions
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own editor suggestions" ON editor_suggestions
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage their own GPT exports" ON gpt_exports
  FOR ALL USING (user_id = current_setting('app.current_user_id', true));

-- Funções para contexto ativo
CREATE OR REPLACE FUNCTION set_active_context(
  p_doc_id VARCHAR(255),
  p_title VARCHAR(255),
  p_content TEXT,
  p_category VARCHAR(255),
  p_session_id VARCHAR(255)
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Inserir ou atualizar contexto ativo
  INSERT INTO active_contexts (
    doc_id, title, content, category, session_id, user_id
  ) VALUES (
    p_doc_id, p_title, p_content, p_category, p_session_id, 'dr-ricardo-valenca'
  ) ON CONFLICT (doc_id, session_id) DO UPDATE SET
    title = EXCLUDED.title,
    content = EXCLUDED.content,
    category = EXCLUDED.category,
    last_accessed = NOW();
  
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Contexto ativo definido',
    'doc_id', p_doc_id,
    'session_id', p_session_id
  );
END;
$$ LANGUAGE plpgsql;

-- Função para ativar módulo GPT
CREATE OR REPLACE FUNCTION activate_gpt_module(
  p_module_id VARCHAR(255)
) RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Desativar todos os módulos do usuário
  UPDATE gpt_modules 
  SET is_active = FALSE, last_updated = NOW()
  WHERE user_id = 'dr-ricardo-valenca';
  
  -- Ativar módulo específico
  UPDATE gpt_modules 
  SET is_active = TRUE, last_updated = NOW()
  WHERE id = p_module_id AND user_id = 'dr-ricardo-valenca';
  
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Módulo GPT ativado',
    'module_id', p_module_id
  );
END;
$$ LANGUAGE plpgsql;

-- Função para aplicar documento ao módulo
CREATE OR REPLACE FUNCTION apply_document_to_module(
  p_doc_id VARCHAR(255),
  p_module_id VARCHAR(255)
) RETURNS JSONB AS $$
DECLARE
  doc_title VARCHAR(255);
  current_docs TEXT[];
BEGIN
  -- Buscar título do documento
  SELECT title INTO doc_title
  FROM documentos_mestres
  WHERE id = p_doc_id;
  
  IF doc_title IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'error',
      'message', 'Documento não encontrado'
    );
  END IF;
  
  -- Buscar documentos atuais do módulo
  SELECT documents INTO current_docs
  FROM gpt_modules
  WHERE id = p_module_id AND user_id = 'dr-ricardo-valenca';
  
  -- Adicionar documento se não existir
  IF NOT (doc_title = ANY(current_docs)) THEN
    UPDATE gpt_modules
    SET documents = documents || ARRAY[doc_title],
        last_updated = NOW()
    WHERE id = p_module_id AND user_id = 'dr-ricardo-valenca';
  END IF;
  
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Documento aplicado ao módulo',
    'document', doc_title,
    'module_id', p_module_id
  );
END;
$$ LANGUAGE plpgsql;

-- Função para exportar GPT como JSON
CREATE OR REPLACE FUNCTION export_gpt_config(
  p_name VARCHAR(255),
  p_description TEXT
) RETURNS JSONB AS $$
DECLARE
  active_module JSONB;
  active_context JSONB;
  export_config JSONB;
BEGIN
  -- Buscar módulo ativo
  SELECT to_jsonb(gm.*) INTO active_module
  FROM gpt_modules gm
  WHERE gm.user_id = 'dr-ricardo-valenca' AND gm.is_active = TRUE;
  
  -- Buscar contexto ativo
  SELECT to_jsonb(ac.*) INTO active_context
  FROM active_contexts ac
  WHERE ac.user_id = 'dr-ricardo-valenca'
  ORDER BY ac.last_accessed DESC
  LIMIT 1;
  
  -- Construir configuração de exportação
  export_config := jsonb_build_object(
    'name', p_name,
    'description', p_description,
    'version', '2.0',
    'exported_at', NOW(),
    'gpt_module', active_module,
    'active_context', active_context,
    'base_knowledge', (
      SELECT jsonb_agg(to_jsonb(dm.*))
      FROM documentos_mestres dm
      WHERE dm.user_id = 'dr-ricardo-valenca'
    )
  );
  
  -- Salvar exportação
  INSERT INTO gpt_exports (name, description, gpt_config, user_id)
  VALUES (p_name, p_description, export_config, 'dr-ricardo-valenca');
  
  RETURN jsonb_build_object(
    'status', 'success',
    'message', 'Configuração GPT exportada',
    'export_config', export_config
  );
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_updated = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gpt_modules_updated_at
  BEFORE UPDATE ON gpt_modules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO gpt_modules (
  id, name, function, description, documents, tags, prompt_template, is_active, user_id
) VALUES (
  'module_clinico',
  'GPT Clínico',
  'Realiza triagens e escuta ativa',
  'Módulo especializado em avaliação clínica e escuta ativa',
  ARRAY['Avaliação Inicial', 'Análise Clínica', 'Curso Arte da Entrevista'],
  ARRAY['gpt', 'modulo', 'clinico', 'triagem-medica', 'escuta-ativa'],
  'Você é o GPT Clínico da Nôa Esperanza, especializado em triagens e escuta ativa...',
  TRUE,
  'dr-ricardo-valenca'
) ON CONFLICT (id) DO NOTHING;

-- Comentários das tabelas
COMMENT ON TABLE active_contexts IS 'Contexto ativo por sessão para GPT Builder avançado';
COMMENT ON TABLE gpt_modules IS 'Módulos GPT funcionais (Clínico, Pedagógico, Narrativo, Técnico)';
COMMENT ON TABLE gpt_sessions IS 'Sessões de GPT com contexto e interações';
COMMENT ON TABLE editor_suggestions IS 'Histórico de sugestões do editor inteligente';
COMMENT ON TABLE gpt_exports IS 'Configurações exportadas do GPT Builder';

-- Verificação final
SELECT 'Sistema GPT Builder Avançado criado com sucesso!' as status;
