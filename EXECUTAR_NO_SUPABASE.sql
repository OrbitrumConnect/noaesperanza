-- =====================================================
-- CORREÇÃO RÁPIDA - CRIAR FUNÇÕES FALTANTES
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. DESABILITAR RLS (se ainda não fez)
ALTER TABLE IF EXISTS noa_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS noa_conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_learning DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS noa_conversation_flow DISABLE ROW LEVEL SECURITY;

-- 2. CRIAR FUNÇÃO: register_noa_conversation
DROP FUNCTION IF EXISTS register_noa_conversation(TEXT, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION register_noa_conversation(
    user_message_param TEXT,
    noa_response_param TEXT,
    conversation_type_param TEXT DEFAULT 'general',
    user_type_param TEXT DEFAULT 'unknown'
)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
    current_session_id TEXT;
BEGIN
    -- Gera session_id se não existir
    current_session_id := COALESCE(
        current_setting('app.session_id', true),
        gen_random_uuid()::TEXT
    );
    
    INSERT INTO noa_conversations (
        user_id,
        session_id,
        user_message,
        noa_response,
        conversation_type,
        user_type
    ) VALUES (
        auth.uid(),
        current_session_id,
        user_message_param,
        noa_response_param,
        conversation_type_param,
        user_type_param
    ) RETURNING id INTO conversation_id;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CRIAR FUNÇÃO: save_ai_learning
DROP FUNCTION IF EXISTS save_ai_learning(TEXT, TEXT, TEXT, TEXT, TEXT, DECIMAL, UUID);
CREATE OR REPLACE FUNCTION save_ai_learning(
    keyword_param TEXT,
    context_param TEXT,
    user_message_param TEXT,
    ai_response_param TEXT,
    category_param TEXT DEFAULT 'general',
    confidence_score_param DECIMAL DEFAULT 0.5,
    user_id_param UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    learning_id UUID;
BEGIN
    INSERT INTO ai_learning (
        keyword, context, user_message, ai_response, 
        category, confidence_score, user_id
    ) VALUES (
        keyword_param, context_param, user_message_param, ai_response_param,
        category_param, confidence_score_param, user_id_param
    ) RETURNING id INTO learning_id;
    
    RETURN learning_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CRIAR FUNÇÃO: register_conversation_flow
DROP FUNCTION IF EXISTS register_conversation_flow(TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION register_conversation_flow(
    session_id_param TEXT,
    step_number_param INTEGER,
    step_type_param TEXT,
    message_content_param TEXT,
    sender_param TEXT,
    user_type_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    flow_id UUID;
BEGIN
    INSERT INTO noa_conversation_flow (
        session_id,
        step_number,
        step_type,
        message_content,
        sender,
        user_type
    ) VALUES (
        session_id_param,
        step_number_param,
        step_type_param,
        message_content_param,
        sender_param,
        user_type_param
    ) RETURNING id INTO flow_id;
    
    RETURN flow_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. VERIFICAR SE FUNCIONOU
SELECT 
    'register_noa_conversation' as funcao,
    COUNT(*) as existe
FROM pg_proc
WHERE proname = 'register_noa_conversation'

UNION ALL

SELECT 
    'save_ai_learning' as funcao,
    COUNT(*) as existe
FROM pg_proc
WHERE proname = 'save_ai_learning'

UNION ALL

SELECT 
    'register_conversation_flow' as funcao,
    COUNT(*) as existe
FROM pg_proc
WHERE proname = 'register_conversation_flow';

-- Resultado esperado: todas com existe = 1

-- =====================================================
-- PRONTO! Agora atualize a página do app (F5)
-- =====================================================

