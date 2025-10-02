-- 🧹 SCRIPT DE LIMPEZA GPT BUILDER - VERSÃO SEGURA
-- Remove APENAS objetos específicos do GPT Builder (não afeta sistema principal)

-- ========================================
-- REMOVER APENAS TRIGGERS DO GPT BUILDER
-- ========================================

DROP TRIGGER IF EXISTS update_documentos_mestres_updated_at ON documentos_mestres;
DROP TRIGGER IF EXISTS update_noa_config_updated_at ON noa_config;
DROP TRIGGER IF EXISTS update_user_recognition_updated_at ON user_recognition;
DROP TRIGGER IF EXISTS update_master_prompts_updated_at ON master_prompts;
DROP TRIGGER IF EXISTS update_work_analyses_updated_at ON work_analyses;
DROP TRIGGER IF EXISTS update_knowledge_connections_updated_at ON knowledge_connections;

-- ========================================
-- REMOVER APENAS POLÍTICAS DO GPT BUILDER
-- ========================================

DROP POLICY IF EXISTS "Admins can manage documentos_mestres" ON documentos_mestres;
DROP POLICY IF EXISTS "Admins can manage noa_config" ON noa_config;
DROP POLICY IF EXISTS "Admins can manage user_recognition" ON user_recognition;
DROP POLICY IF EXISTS "Admins can manage master_prompts" ON master_prompts;
DROP POLICY IF EXISTS "Admins can manage training_history" ON training_history;
DROP POLICY IF EXISTS "Admins can manage knowledge_connections" ON knowledge_connections;
DROP POLICY IF EXISTS "Admins can manage work_analyses" ON work_analyses;
DROP POLICY IF EXISTS "Admins can manage accuracy_metrics" ON accuracy_metrics;

-- ========================================
-- REMOVER APENAS FUNÇÕES DO GPT BUILDER
-- ========================================

DROP FUNCTION IF EXISTS buscar_documentos_relacionados(TEXT, INTEGER);
DROP FUNCTION IF EXISTS buscar_aprendizados_relacionados(TEXT, INTEGER);
DROP FUNCTION IF EXISTS salvar_analise_trabalho(TEXT, TEXT, TEXT, DECIMAL, JSONB, JSONB, JSONB, JSONB, JSONB, INTEGER, UUID);
DROP FUNCTION IF EXISTS obter_estatisticas_analise();
DROP FUNCTION IF EXISTS criar_conexao_conhecimento(VARCHAR, VARCHAR, VARCHAR, DECIMAL, TEXT, UUID);

-- ========================================
-- VERIFICAÇÃO
-- ========================================

SELECT 'Limpeza SEGURA concluída! Agora execute o gpt_builder_database_ultra_safe.sql' as status;
