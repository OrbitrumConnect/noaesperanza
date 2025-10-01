-- ============================================================================
-- SISTEMA ADMINISTRATIVO NÔA ESPERANZA
-- Comandos de voz, KPIs 360° e controle total da plataforma
-- ============================================================================

-- ============================================================================
-- 1. TABELAS
-- ============================================================================

-- Tabela de Administradores
CREATE TABLE IF NOT EXISTS noa_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  admin_name TEXT NOT NULL,
  admin_key TEXT UNIQUE NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['read', 'write', 'execute', 'delete'],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Logs de Ações Administrativas
CREATE TABLE IF NOT EXISTS admin_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES noa_admins(id),
  admin_name TEXT,
  command_text TEXT NOT NULL,
  command_type TEXT, -- 'user_management', 'imre_edit', 'stats', 'ia_training', 'config'
  parameters JSONB DEFAULT '{}',
  sql_executed TEXT,
  result_data JSONB,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de KPIs Clínicos
CREATE TABLE IF NOT EXISTS noa_kpis_clinicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_referencia DATE DEFAULT CURRENT_DATE,
  total_avaliacoes INTEGER DEFAULT 0,
  avaliacoes_completas INTEGER DEFAULT 0,
  avaliacoes_em_andamento INTEGER DEFAULT 0,
  taxa_conclusao DECIMAL(5,2),
  tempo_medio_avaliacao_minutos INTEGER,
  top_sintomas JSONB DEFAULT '[]',
  blocos_mais_respondidos JSONB DEFAULT '[]',
  satisfacao_media DECIMAL(3,2),
  cannabis_usuarios INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de KPIs Administrativos
CREATE TABLE IF NOT EXISTS noa_kpis_administrativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_referencia DATE DEFAULT CURRENT_DATE,
  total_usuarios INTEGER DEFAULT 0,
  usuarios_ativos INTEGER DEFAULT 0,
  pacientes_count INTEGER DEFAULT 0,
  profissionais_count INTEGER DEFAULT 0,
  alunos_count INTEGER DEFAULT 0,
  total_conversas INTEGER DEFAULT 0,
  mensagens_por_conversa_media DECIMAL(5,2),
  tempo_medio_sessao_minutos INTEGER,
  taxa_retencao DECIMAL(5,2),
  nfts_gerados INTEGER DEFAULT 0,
  uptime_percentual DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de KPIs Simbólicos (IA)
CREATE TABLE IF NOT EXISTS noa_kpis_simbolicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_referencia DATE DEFAULT CURRENT_DATE,
  total_aprendizados INTEGER DEFAULT 0,
  confidence_score_medio DECIMAL(3,2),
  keywords_extraidas INTEGER DEFAULT 0,
  padroes_identificados INTEGER DEFAULT 0,
  prompts_mais_usados JSONB DEFAULT '[]',
  categorias_aprendizado JSONB DEFAULT '{}',
  taxa_acerto DECIMAL(5,2),
  insights_gerados JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Conversas Admin
CREATE TABLE IF NOT EXISTS admin_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES noa_admins(id),
  session_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  noa_response TEXT NOT NULL,
  command_executed BOOLEAN DEFAULT FALSE,
  command_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. RLS POLICIES (Segurança)
-- ============================================================================

ALTER TABLE noa_admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_kpis_clinicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_kpis_administrativos ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_kpis_simbolicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_conversations ENABLE ROW LEVEL SECURITY;

-- Policies (só admins podem acessar)
CREATE POLICY IF NOT EXISTS "admins_only_noa_admins" ON noa_admins
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM noa_admins WHERE is_active = TRUE)
  );

CREATE POLICY IF NOT EXISTS "admins_only_actions_log" ON admin_actions_log
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM noa_admins WHERE is_active = TRUE)
  );

CREATE POLICY IF NOT EXISTS "admins_only_kpis_clinicos" ON noa_kpis_clinicos
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM noa_admins WHERE is_active = TRUE)
  );

CREATE POLICY IF NOT EXISTS "admins_only_kpis_admin" ON noa_kpis_administrativos
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM noa_admins WHERE is_active = TRUE)
  );

CREATE POLICY IF NOT EXISTS "admins_only_kpis_simbolicos" ON noa_kpis_simbolicos
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM noa_admins WHERE is_active = TRUE)
  );

CREATE POLICY IF NOT EXISTS "admins_only_conversations" ON admin_conversations
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM noa_admins WHERE is_active = TRUE)
  );

-- ============================================================================
-- 3. FUNÇÕES
-- ============================================================================

-- Função para validar acesso admin
CREATE OR REPLACE FUNCTION validate_admin_access(admin_key_param TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  is_valid BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM noa_admins 
    WHERE admin_key = admin_key_param 
    AND is_active = TRUE
  ) INTO is_valid;
  
  RETURN is_valid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para executar comandos admin
CREATE OR REPLACE FUNCTION execute_admin_command(
  admin_key_param TEXT,
  command_text_param TEXT,
  command_type_param TEXT,
  parameters_param JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  admin_record RECORD;
  result_data JSONB;
  action_log_id UUID;
BEGIN
  -- Valida credenciais
  IF NOT validate_admin_access(admin_key_param) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Credenciais inválidas'
    );
  END IF;
  
  -- Busca admin
  SELECT * INTO admin_record FROM noa_admins WHERE admin_key = admin_key_param;
  
  -- Executa comando
  CASE command_type_param
    WHEN 'get_stats' THEN
      result_data := jsonb_build_object(
        'clinical', (SELECT row_to_json(k.*) FROM noa_kpis_clinicos k ORDER BY data_referencia DESC LIMIT 1),
        'administrative', (SELECT row_to_json(k.*) FROM noa_kpis_administrativos k ORDER BY data_referencia DESC LIMIT 1),
        'symbolic', (SELECT row_to_json(k.*) FROM noa_kpis_simbolicos k ORDER BY data_referencia DESC LIMIT 1)
      );
    
    WHEN 'edit_imre_block' THEN
      UPDATE blocos_imre 
      SET texto = parameters_param->>'new_text',
          updated_at = NOW()
      WHERE ordem = (parameters_param->>'block_order')::INTEGER;
      
      result_data := jsonb_build_object(
        'block_order', parameters_param->>'block_order',
        'new_text', parameters_param->>'new_text',
        'updated', true
      );
    
    WHEN 'list_users' THEN
      result_data := (
        SELECT jsonb_agg(jsonb_build_object(
          'id', id,
          'name', name,
          'user_type', user_type,
          'created_at', created_at
        ))
        FROM noa_users
        LIMIT 50
      );
    
    ELSE
      result_data := jsonb_build_object('info', 'Comando não implementado');
  END CASE;
  
  -- Registra log
  INSERT INTO admin_actions_log (
    admin_id, admin_name, command_text, command_type, 
    parameters, result_data, success
  ) VALUES (
    admin_record.id, admin_record.admin_name, command_text_param,
    command_type_param, parameters_param, result_data, true
  ) RETURNING id INTO action_log_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'data', result_data,
    'action_log_id', action_log_id,
    'executed_by', admin_record.admin_name,
    'executed_at', NOW()
  );
  
EXCEPTION WHEN OTHERS THEN
  INSERT INTO admin_actions_log (
    admin_id, admin_name, command_text, command_type,
    parameters, success, error_message
  ) VALUES (
    admin_record.id, admin_record.admin_name, command_text_param,
    command_type_param, parameters_param, false, SQLERRM
  );
  
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular KPIs em tempo real
CREATE OR REPLACE FUNCTION calculate_kpis_realtime()
RETURNS JSONB AS $$
DECLARE
  kpis_clinicos JSONB;
  kpis_admin JSONB;
  kpis_simbolicos JSONB;
BEGIN
  -- KPIs Clínicos
  SELECT jsonb_build_object(
    'total_avaliacoes', COUNT(*),
    'completas', COUNT(*) FILTER (WHERE status = 'completed'),
    'em_andamento', COUNT(*) FILTER (WHERE status = 'in_progress'),
    'taxa_conclusao', ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2)
  ) INTO kpis_clinicos
  FROM clinical_evaluations;
  
  -- KPIs Administrativos
  SELECT jsonb_build_object(
    'total_usuarios', COUNT(*),
    'pacientes', COUNT(*) FILTER (WHERE user_type = 'paciente'),
    'profissionais', COUNT(*) FILTER (WHERE user_type = 'profissional'),
    'alunos', COUNT(*) FILTER (WHERE user_type = 'aluno')
  ) INTO kpis_admin
  FROM noa_users;
  
  -- KPIs Simbólicos (IA)
  SELECT jsonb_build_object(
    'total_aprendizados', COUNT(*),
    'confidence_medio', ROUND(AVG(confidence_score)::DECIMAL, 2),
    'keywords_count', COUNT(DISTINCT keywords)
  ) INTO kpis_simbolicos
  FROM ai_learning;
  
  RETURN jsonb_build_object(
    'clinical', kpis_clinicos,
    'administrative', kpis_admin,
    'symbolic', kpis_simbolicos,
    'updated_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. TRIGGERS
-- ============================================================================

CREATE TRIGGER update_noa_admins_updated_at
  BEFORE UPDATE ON noa_admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpis_clinicos_updated_at
  BEFORE UPDATE ON noa_kpis_clinicos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpis_admin_updated_at
  BEFORE UPDATE ON noa_kpis_administrativos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpis_simbolicos_updated_at
  BEFORE UPDATE ON noa_kpis_simbolicos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. DADOS INICIAIS
-- ============================================================================

-- Admins: Pedro e Ricardo
INSERT INTO noa_admins (admin_name, admin_key, permissions) VALUES
('Pedro Passos', 'admin_pedro_valenca_2025', ARRAY['read', 'write', 'execute', 'delete']),
('Ricardo Valença', 'admin_ricardo_valenca_2025', ARRAY['read', 'write', 'execute', 'delete'])
ON CONFLICT (admin_key) DO NOTHING;

-- ============================================================================
-- FIM
-- ============================================================================
