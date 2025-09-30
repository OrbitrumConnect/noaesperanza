-- =====================================================
-- INTEGRAÇÃO COMPLETA: NoaGPT COMO CÉREBRO CENTRAL
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. CRIAR FUNÇÃO PARA NoaGPT BUSCAR CONTEXTO COMPLETO
CREATE OR REPLACE FUNCTION noa_get_complete_context(
  user_message TEXT,
  user_id_param TEXT DEFAULT NULL,
  specialty_param TEXT DEFAULT 'rim'
)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    user_context JSONB;
    similar_conversations JSONB;
    learning_data JSONB;
    default_response TEXT;
    prompt_content TEXT;
    keywords_data JSONB;
BEGIN
    -- 1. Buscar contexto do usuário
    IF user_id_param IS NOT NULL THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'user_message', user_message,
                'ai_response', ai_response,
                'timestamp', timestamp,
                'category', category
            )
        ) INTO user_context
        FROM noa_conversations 
        WHERE user_id = user_id_param 
        ORDER BY timestamp DESC 
        LIMIT 10;
        
        result := result || jsonb_build_object('user_history', COALESCE(user_context, '[]'::jsonb));
    END IF;
    
    -- 2. Buscar conversas similares
    SELECT jsonb_agg(
        jsonb_build_object(
            'user_message', user_message,
            'ai_response', ai_response,
            'confidence_score', confidence_score,
            'category', category
        )
    ) INTO similar_conversations
    FROM ai_learning 
    WHERE user_message ILIKE '%' || user_message || '%'
    OR ai_response ILIKE '%' || user_message || '%'
    ORDER BY confidence_score DESC 
    LIMIT 5;
    
    result := result || jsonb_build_object('similar_conversations', COALESCE(similar_conversations, '[]'::jsonb));
    
    -- 3. Buscar dados de aprendizado
    SELECT jsonb_agg(
        jsonb_build_object(
            'keyword', keyword,
            'category', category,
            'importance_score', importance_score,
            'usage_count', usage_count
        )
    ) INTO learning_data
    FROM ai_keywords 
    WHERE keyword = ANY(string_to_array(LOWER(user_message), ' '))
    ORDER BY importance_score DESC;
    
    result := result || jsonb_build_object('learning_keywords', COALESCE(learning_data, '[]'::jsonb));
    
    -- 4. Buscar resposta padrão
    SELECT get_default_response(user_message) INTO default_response;
    result := result || jsonb_build_object('default_response', COALESCE(default_response, ''));
    
    -- 5. Buscar prompt da especialidade
    SELECT get_prompt_by_specialty(specialty_param) INTO prompt_content;
    result := result || jsonb_build_object('specialty_prompt', COALESCE(prompt_content, ''));
    
    -- 6. Buscar palavras-chave relevantes
    SELECT jsonb_agg(
        jsonb_build_object(
            'keyword', keyword,
            'category', category,
            'importance_score', importance_score
        )
    ) INTO keywords_data
    FROM ai_keywords 
    WHERE category = specialty_param
    ORDER BY importance_score DESC 
    LIMIT 10;
    
    result := result || jsonb_build_object('specialty_keywords', COALESCE(keywords_data, '[]'::jsonb));
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 2. CRIAR FUNÇÃO PARA NoaGPT SALVAR APRENDIZADO INTELIGENTE
CREATE OR REPLACE FUNCTION noa_save_intelligent_learning(
  user_message TEXT,
  ai_response TEXT,
  context_data JSONB,
  user_id_param TEXT DEFAULT NULL,
  specialty_param TEXT DEFAULT 'rim'
)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    detected_keywords TEXT[];
    auto_category TEXT;
    confidence_score DECIMAL(3,2);
BEGIN
    -- 1. Detectar palavras-chave automaticamente
    SELECT ARRAY_AGG(DISTINCT keyword) INTO detected_keywords
    FROM ai_keywords 
    WHERE keyword = ANY(string_to_array(LOWER(user_message), ' '));
    
    -- 2. Determinar categoria automaticamente
    IF user_message ILIKE '%cannabis%' OR user_message ILIKE '%maconha%' OR user_message ILIKE '%cbd%' OR user_message ILIKE '%thc%' THEN
        auto_category := 'cannabis';
    ELSIF user_message ILIKE '%cérebro%' OR user_message ILIKE '%nervo%' OR user_message ILIKE '%convulsão%' OR user_message ILIKE '%epilepsia%' THEN
        auto_category := 'neurology';
    ELSIF user_message ILIKE '%rim%' OR user_message ILIKE '%renal%' OR user_message ILIKE '%urina%' OR user_message ILIKE '%pressão%' THEN
        auto_category := 'nephrology';
    ELSE
        auto_category := 'general';
    END IF;
    
    -- 3. Calcular confiança baseada em palavras-chave
    confidence_score := CASE 
        WHEN array_length(detected_keywords, 1) > 3 THEN 0.9
        WHEN array_length(detected_keywords, 1) > 1 THEN 0.7
        ELSE 0.5
    END;
    
    -- 4. Salvar na tabela ai_learning
    INSERT INTO ai_learning (
        keyword, context, user_message, ai_response, category, confidence_score, user_id
    ) VALUES (
        COALESCE(detected_keywords[1], 'geral'),
        user_message,
        user_message,
        ai_response,
        auto_category,
        confidence_score,
        user_id_param
    );
    
    -- 5. Salvar na tabela noa_conversations
    INSERT INTO noa_conversations (
        user_id, user_message, ai_response, context, category
    ) VALUES (
        user_id_param,
        user_message,
        ai_response,
        user_message,
        auto_category
    );
    
    -- 6. Atualizar/criar palavras-chave
    IF detected_keywords IS NOT NULL THEN
        INSERT INTO ai_keywords (keyword, category, importance_score, usage_count)
        SELECT keyword, auto_category, 0.8, 1
        FROM unnest(detected_keywords) AS keyword
        ON CONFLICT (keyword) 
        DO UPDATE SET 
            usage_count = ai_keywords.usage_count + 1,
            last_used = NOW(),
            importance_score = GREATEST(ai_keywords.importance_score, 0.8);
    END IF;
    
    -- 7. Retornar resultado
    result := jsonb_build_object(
        'success', true,
        'detected_keywords', detected_keywords,
        'auto_category', auto_category,
        'confidence_score', confidence_score,
        'learning_saved', true
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 3. CRIAR FUNÇÃO PARA NoaGPT BUSCAR RESPOSTA INTELIGENTE
CREATE OR REPLACE FUNCTION noa_get_intelligent_response(
  user_message TEXT,
  user_id_param TEXT DEFAULT NULL,
  specialty_param TEXT DEFAULT 'rim'
)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    context_data JSONB;
    best_response TEXT;
    confidence DECIMAL(3,2);
    learning_result JSONB;
BEGIN
    -- 1. Buscar contexto completo
    SELECT noa_get_complete_context(user_message, user_id_param, specialty_param) INTO context_data;
    
    -- 2. Buscar melhor resposta baseada em aprendizado
    SELECT ai_response, confidence_score INTO best_response, confidence
    FROM ai_learning 
    WHERE user_message ILIKE '%' || user_message || '%'
    AND confidence_score > 0.7
    ORDER BY confidence_score DESC, usage_count DESC
    LIMIT 1;
    
    -- 3. Se não encontrou resposta boa, usar padrão
    IF best_response IS NULL THEN
        SELECT get_default_response(user_message) INTO best_response;
        confidence := 0.5;
    END IF;
    
    -- 4. Preparar resultado
    result := jsonb_build_object(
        'response', COALESCE(best_response, 'Desculpe, não entendi. Pode reformular sua pergunta?'),
        'confidence', COALESCE(confidence, 0.5),
        'context', context_data,
        'should_learn', CASE WHEN confidence < 0.8 THEN true ELSE false END,
        'specialty', specialty_param
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 4. CRIAR FUNÇÃO PARA NoaGPT ATUALIZAR CONTEXTO DE CONVERSA
CREATE OR REPLACE FUNCTION noa_update_conversation_context(
  session_id_param TEXT,
  current_etapa_param TEXT,
  specialty_param TEXT DEFAULT 'rim',
  context_data_param JSONB DEFAULT '{}',
  user_id_param TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Inserir ou atualizar contexto
    INSERT INTO conversation_context (
        session_id, current_etapa, specialty, context_data, user_id
    ) VALUES (
        session_id_param, current_etapa_param, specialty_param, context_data_param, user_id_param
    )
    ON CONFLICT (session_id) 
    DO UPDATE SET 
        current_etapa = EXCLUDED.current_etapa,
        specialty = EXCLUDED.specialty,
        context_data = EXCLUDED.context_data,
        user_id = EXCLUDED.user_id,
        updated_at = NOW();
    
    result := jsonb_build_object(
        'success', true,
        'session_id', session_id_param,
        'current_etapa', current_etapa_param,
        'specialty', specialty_param
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 5. CRIAR FUNÇÃO PARA NoaGPT BUSCAR ESTATÍSTICAS
CREATE OR REPLACE FUNCTION noa_get_ai_statistics()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_conversations INTEGER;
    total_learning INTEGER;
    top_keywords JSONB;
    category_stats JSONB;
BEGIN
    -- Contar conversas
    SELECT COUNT(*) INTO total_conversations FROM noa_conversations;
    
    -- Contar aprendizado
    SELECT COUNT(*) INTO total_learning FROM ai_learning;
    
    -- Top palavras-chave
    SELECT jsonb_agg(
        jsonb_build_object(
            'keyword', keyword,
            'usage_count', usage_count,
            'importance_score', importance_score
        )
    ) INTO top_keywords
    FROM ai_keywords 
    ORDER BY usage_count DESC 
    LIMIT 10;
    
    -- Estatísticas por categoria
    SELECT jsonb_agg(
        jsonb_build_object(
            'category', category,
            'count', count,
            'avg_confidence', avg_confidence
        )
    ) INTO category_stats
    FROM (
        SELECT 
            category,
            COUNT(*) as count,
            AVG(confidence_score) as avg_confidence
        FROM ai_learning 
        GROUP BY category
    ) stats;
    
    result := jsonb_build_object(
        'total_conversations', total_conversations,
        'total_learning', total_learning,
        'top_keywords', COALESCE(top_keywords, '[]'::jsonb),
        'category_stats', COALESCE(category_stats, '[]'::jsonb),
        'timestamp', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON FUNCTION noa_get_complete_context(TEXT, TEXT, TEXT) IS 'NoaGPT: Busca contexto completo do usuário e sistema';
COMMENT ON FUNCTION noa_save_intelligent_learning(TEXT, TEXT, JSONB, TEXT, TEXT) IS 'NoaGPT: Salva aprendizado inteligente com detecção automática';
COMMENT ON FUNCTION noa_get_intelligent_response(TEXT, TEXT, TEXT) IS 'NoaGPT: Busca resposta inteligente baseada em aprendizado';
COMMENT ON FUNCTION noa_update_conversation_context(TEXT, TEXT, TEXT, JSONB, TEXT) IS 'NoaGPT: Atualiza contexto da conversa em andamento';
COMMENT ON FUNCTION noa_get_ai_statistics() IS 'NoaGPT: Retorna estatísticas completas da IA';

-- =====================================================
-- SCRIPT CONCLUÍDO - NoaGPT COMO CÉREBRO CENTRAL
-- =====================================================
