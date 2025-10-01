-- 🔧 CORREÇÃO DE FUNÇÕES RPC SUPABASE
-- Execute este script no Supabase SQL Editor

-- 1. FUNÇÃO get_imre_block
DROP FUNCTION IF EXISTS get_imre_block(INTEGER);
CREATE OR REPLACE FUNCTION get_imre_block(block_order_param INTEGER)
RETURNS TABLE (
    id INTEGER,
    ordem INTEGER,
    etapa TEXT,
    texto TEXT,
    variavel TEXT,
    tipo TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.ordem,
        b.etapa,
        b.texto,
        b.variavel,
        b.tipo
    FROM blocos_imre b
    WHERE b.ordem = block_order_param
    AND b.ativo = true
    ORDER BY b.ordem;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FUNÇÃO register_noa_conversation
DROP FUNCTION IF EXISTS register_noa_conversation(TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT);
CREATE OR REPLACE FUNCTION register_noa_conversation(
    session_id_param TEXT,
    user_message_param TEXT,
    noa_response_param TEXT,
    conversation_type_param TEXT,
    is_first_response_param BOOLEAN,
    user_type_param TEXT
) RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
BEGIN
    INSERT INTO noa_conversations (
        session_id, user_message, noa_response, 
        conversation_type, is_first_response, user_type
    ) VALUES (
        session_id_param, user_message_param, noa_response_param,
        conversation_type_param, is_first_response_param, user_type_param
    ) RETURNING id INTO conversation_id;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNÇÃO register_conversation_flow
DROP FUNCTION IF EXISTS register_conversation_flow(TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION register_conversation_flow(
    session_id_param TEXT,
    step_order_param INTEGER,
    step_type_param TEXT,
    user_message_param TEXT,
    noa_response_param TEXT,
    user_type_param TEXT
) RETURNS UUID AS $$
DECLARE
    flow_id UUID;
BEGIN
    INSERT INTO noa_conversation_flow (
        session_id, step_order, step_type, 
        user_message, noa_response, user_type
    ) VALUES (
        session_id_param, step_order_param, step_type_param,
        user_message_param, noa_response_param, user_type_param
    ) RETURNING id INTO flow_id;
    
    RETURN flow_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. FUNÇÃO set_user_type
DROP FUNCTION IF EXISTS set_user_type(TEXT);
CREATE OR REPLACE FUNCTION set_user_type(user_type_param TEXT)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
    profile_id UUID;
BEGIN
    user_id := auth.uid();
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;
    
    -- Inserir ou atualizar perfil
    INSERT INTO noa_users (user_id, user_type, permission_level)
    VALUES (user_id, user_type_param, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        user_type = user_type_param,
        updated_at = NOW()
    RETURNING id INTO profile_id;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CORRIGIR COLUNA context NA TABELA ai_conversation_patterns
ALTER TABLE ai_conversation_patterns 
ADD COLUMN IF NOT EXISTS context TEXT;

-- 6. CORRIGIR CHECK CONSTRAINT NA TABELA noa_conversation_flow
ALTER TABLE noa_conversation_flow 
DROP CONSTRAINT IF EXISTS noa_conversation_flow_step_type_check;

ALTER TABLE noa_conversation_flow 
ADD CONSTRAINT noa_conversation_flow_step_type_check 
CHECK (step_type IN ('initial_question', 'user_response', 'noa_response', 'evaluation', 'conclusion'));

-- 7. POLÍTICAS RLS PARA mode_transitions_log (se a tabela existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'mode_transitions_log' AND table_schema = 'public') THEN
        -- Políticas para mode_transitions_log
        DROP POLICY IF EXISTS "Users can view their own mode transitions" ON mode_transitions_log;
        DROP POLICY IF EXISTS "Users can insert their own mode transitions" ON mode_transitions_log;
        
        CREATE POLICY "Users can view their own mode transitions" ON mode_transitions_log
            FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
            
        CREATE POLICY "Users can insert their own mode transitions" ON mode_transitions_log
            FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
            
        RAISE NOTICE 'Políticas RLS criadas para mode_transitions_log';
    ELSE
        RAISE NOTICE 'Tabela mode_transitions_log não encontrada - execute database_conversation_modes.sql primeiro';
    END IF;
END $$;

-- 8. POLÍTICAS RLS PARA ai_conversation_patterns
DROP POLICY IF EXISTS "Anyone can view conversation patterns" ON ai_conversation_patterns;
DROP POLICY IF EXISTS "Anyone can insert conversation patterns" ON ai_conversation_patterns;
DROP POLICY IF EXISTS "Anyone can update conversation patterns" ON ai_conversation_patterns;

CREATE POLICY "Anyone can view conversation patterns" ON ai_conversation_patterns
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert conversation patterns" ON ai_conversation_patterns
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update conversation patterns" ON ai_conversation_patterns
    FOR UPDATE USING (true);

-- 9. VERIFICAR SE TABELA blocos_imre TEM DADOS
INSERT INTO blocos_imre (ordem, etapa, texto, variavel, tipo) VALUES
(1, 'Abertura Exponencial', 'Olá! Eu sou Nôa Esperanza. Por favor, apresente-se também e vamos iniciar a sua avaliação inicial para consultas com Dr. Ricardo Valença.', 'nome_paciente', 'pergunta')
ON CONFLICT (ordem) DO NOTHING;

-- 10. TESTAR FUNÇÕES
-- SELECT get_imre_block(1);
-- SELECT set_user_type('paciente');
-- SELECT register_noa_conversation('test-session', 'Teste', 'Resposta teste', 'general', false, 'paciente');

COMMENT ON FUNCTION get_imre_block(INTEGER) IS 'Busca bloco IMRE por ordem';
COMMENT ON FUNCTION register_noa_conversation(TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT) IS 'Registra conversa da Nôa';
COMMENT ON FUNCTION register_conversation_flow(TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT) IS 'Registra fluxo da conversa';
COMMENT ON FUNCTION set_user_type(TEXT) IS 'Define tipo de usuário';
