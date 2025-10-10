-- 🚀 INTEGRAÇÃO GPT BUILDER + NOA VISION IA
-- Sistema Híbrido: AppB + NOA FINAL
-- ==============================================================================

-- ==============================================================================
-- PARTE 1: TABELAS ADICIONAIS DO GPT BUILDER
-- ==============================================================================

-- 1. Tabela de configuração da Nôa (mantém nossa config + adiciona do AppB)
CREATE TABLE IF NOT EXISTS noa_config (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Reconhecimento avançado de usuários
CREATE TABLE IF NOT EXISTS user_recognition (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    specialization VARCHAR(255),
    greeting_template TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Prompts mestres para diferentes contextos
CREATE TABLE IF NOT EXISTS master_prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    category VARCHAR(100),
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Histórico de treinamento/modificações
CREATE TABLE IF NOT EXISTS training_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documentos_mestres(id),
    action VARCHAR(50) NOT NULL,
    changes JSONB,
    performed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Conexões de conhecimento inteligentes
CREATE TABLE IF NOT EXISTS knowledge_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_concept VARCHAR(255) NOT NULL,
    to_concept VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('similar', 'related', 'contradicts', 'supports', 'depends_on')),
    strength DECIMAL(3,2) NOT NULL CHECK (strength >= 0 AND strength <= 1),
    context TEXT,
    work_id UUID REFERENCES documentos_mestres(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Análises de trabalhos científicos
CREATE TABLE IF NOT EXISTS work_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_work TEXT NOT NULL,
    analysis_result TEXT NOT NULL,
    improved_version TEXT NOT NULL,
    accuracy_score DECIMAL(5,2) DEFAULT 100.00,
    cross_references JSONB DEFAULT '[]',
    related_documents JSONB DEFAULT '[]',
    total_references INTEGER DEFAULT 0,
    analysis_status VARCHAR(20) DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Sistema de colaboração
CREATE TABLE IF NOT EXISTS collaborative_works (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('research', 'clinical', 'development', 'analysis')),
    content TEXT NOT NULL,
    participants TEXT[],
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Histórico de evolução de trabalhos colaborativos
CREATE TABLE IF NOT EXISTS work_evolution_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_id TEXT NOT NULL REFERENCES collaborative_works(id),
    previous_content TEXT,
    new_content TEXT NOT NULL,
    evolved_content TEXT NOT NULL,
    contributor TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- PARTE 2: ÍNDICES PARA PERFORMANCE
-- ==============================================================================

-- Índices para user_recognition
CREATE INDEX IF NOT EXISTS idx_user_recognition_user_id ON user_recognition(user_id);
CREATE INDEX IF NOT EXISTS idx_user_recognition_active ON user_recognition(is_active);

-- Índices para master_prompts
CREATE INDEX IF NOT EXISTS idx_master_prompts_category ON master_prompts(category);
CREATE INDEX IF NOT EXISTS idx_master_prompts_priority ON master_prompts(priority);
CREATE INDEX IF NOT EXISTS idx_master_prompts_active ON master_prompts(is_active);

-- Índices para training_history
CREATE INDEX IF NOT EXISTS idx_training_history_document ON training_history(document_id);
CREATE INDEX IF NOT EXISTS idx_training_history_action ON training_history(action);

-- Índices para knowledge_connections
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_from ON knowledge_connections(from_concept);
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_to ON knowledge_connections(to_concept);
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_strength ON knowledge_connections(strength DESC);

-- Índices para work_analyses
CREATE INDEX IF NOT EXISTS idx_work_analyses_status ON work_analyses(analysis_status);
CREATE INDEX IF NOT EXISTS idx_work_analyses_accuracy ON work_analyses(accuracy_score DESC);
CREATE INDEX IF NOT EXISTS idx_work_analyses_created_at ON work_analyses(created_at DESC);

-- Índices para collaborative_works
CREATE INDEX IF NOT EXISTS idx_collaborative_works_status ON collaborative_works(status);
CREATE INDEX IF NOT EXISTS idx_collaborative_works_type ON collaborative_works(type);
CREATE INDEX IF NOT EXISTS idx_collaborative_works_participants ON collaborative_works USING GIN(participants);

-- Índices para work_evolution_history
CREATE INDEX IF NOT EXISTS idx_work_evolution_work_id ON work_evolution_history(work_id);
CREATE INDEX IF NOT EXISTS idx_work_evolution_created_at ON work_evolution_history(created_at DESC);

-- ==============================================================================
-- PARTE 3: FUNÇÕES AVANÇADAS DE BUSCA
-- ==============================================================================

-- Função para buscar documentos por similaridade textual
CREATE OR REPLACE FUNCTION search_documents_by_text(
    search_query TEXT,
    limit_results INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    type TEXT,
    category TEXT,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dm.id,
        dm.title,
        dm.content,
        dm.type,
        dm.category,
        ts_rank(to_tsvector('portuguese', dm.title || ' ' || dm.content), plainto_tsquery('portuguese', search_query)) as similarity
    FROM documentos_mestres dm
    WHERE 
        dm.is_active = true
        AND to_tsvector('portuguese', dm.title || ' ' || dm.content) @@ plainto_tsquery('portuguese', search_query)
    ORDER BY similarity DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Função para análise cruzada de conhecimento
CREATE OR REPLACE FUNCTION analyze_work_crossreferences(
    work_content TEXT
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    related_docs JSONB;
    related_learning JSONB;
BEGIN
    -- Buscar documentos relacionados
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'title', title,
            'type', type
        )
    ) INTO related_docs
    FROM documentos_mestres
    WHERE is_active = true
    LIMIT 5;
    
    -- Buscar aprendizados relacionados
    SELECT jsonb_agg(
        jsonb_build_object(
            'keyword', keyword,
            'response', ai_response
        )
    ) INTO related_learning
    FROM ai_learning
    ORDER BY usage_count DESC
    LIMIT 5;
    
    -- Construir resultado
    result = jsonb_build_object(
        'related_documents', COALESCE(related_docs, '[]'::jsonb),
        'related_learnings', COALESCE(related_learning, '[]'::jsonb),
        'total_references', COALESCE(jsonb_array_length(related_docs), 0) + COALESCE(jsonb_array_length(related_learning), 0)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar contexto inteligente integrado
CREATE OR REPLACE FUNCTION get_integrated_context(
    user_message TEXT,
    limit_results INTEGER DEFAULT 5
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    docs JSONB;
    learning JSONB;
    prompts JSONB;
BEGIN
    -- Buscar em documentos_mestres
    SELECT jsonb_agg(
        jsonb_build_object(
            'source', 'documentos_mestres',
            'title', title,
            'content', substring(content, 1, 200),
            'type', type
        )
    ) INTO docs
    FROM documentos_mestres
    WHERE 
        is_active = true
        AND (
            to_tsvector('portuguese', title || ' ' || content) @@ plainto_tsquery('portuguese', user_message)
        )
    LIMIT limit_results;
    
    -- Buscar em ai_learning
    SELECT jsonb_agg(
        jsonb_build_object(
            'source', 'ai_learning',
            'keyword', keyword,
            'response', ai_response,
            'confidence', confidence_score
        )
    ) INTO learning
    FROM ai_learning
    WHERE 
        keyword ILIKE '%' || user_message || '%'
        OR user_message ILIKE '%' || keyword || '%'
    ORDER BY confidence_score DESC, usage_count DESC
    LIMIT limit_results;
    
    -- Buscar prompts relevantes
    SELECT jsonb_agg(
        jsonb_build_object(
            'source', 'master_prompts',
            'name', name,
            'prompt', prompt,
            'category', category
        )
    ) INTO prompts
    FROM master_prompts
    WHERE 
        is_active = true
        AND (
            name ILIKE '%' || user_message || '%'
            OR category ILIKE '%' || user_message || '%'
        )
    ORDER BY priority
    LIMIT 3;
    
    -- Combinar resultados
    result = jsonb_build_object(
        'documents', COALESCE(docs, '[]'::jsonb),
        'learnings', COALESCE(learning, '[]'::jsonb),
        'prompts', COALESCE(prompts, '[]'::jsonb),
        'total_results', 
            COALESCE(jsonb_array_length(docs), 0) + 
            COALESCE(jsonb_array_length(learning), 0) + 
            COALESCE(jsonb_array_length(prompts), 0)
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- PARTE 4: TRIGGERS
-- ==============================================================================

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_noa_config_updated_at
    BEFORE UPDATE ON noa_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_recognition_updated_at
    BEFORE UPDATE ON user_recognition
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_master_prompts_updated_at
    BEFORE UPDATE ON master_prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_knowledge_connections_updated_at
    BEFORE UPDATE ON knowledge_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_work_analyses_updated_at
    BEFORE UPDATE ON work_analyses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_collaborative_works_updated_at
    BEFORE UPDATE ON collaborative_works
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- PARTE 5: POPULAR COM DADOS INICIAIS
-- ==============================================================================

-- Configuração inicial da Nôa (híbrido)
INSERT INTO noa_config (id, config) VALUES (
    'main',
    '{
        "personality": "Sou Nôa Esperanza, assistente médica especializada desenvolvida pelo Dr. Ricardo Valença. Utilizo método IMRE e análise contextual avançada.",
        "greeting": "Olá! Eu sou Nôa Esperanza. Como posso ajudar você hoje?",
        "expertise": "Cannabis medicinal, neurologia, nefrologia, IMRE Protocol, análise contextual inteligente",
        "tone": "professional",
        "recognition": {
            "drRicardoValenca": true,
            "autoGreeting": true,
            "personalizedResponse": true,
            "contextualAnalysis": true
        },
        "features": {
            "noaVisionIA": true,
            "hybridAI": true,
            "semanticSearch": true,
            "gptBuilder": true,
            "collaboration": true
        }
    }'::JSONB
) ON CONFLICT (id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_at = NOW();

-- Reconhecimento do Dr. Ricardo
INSERT INTO user_recognition (name, role, specialization, greeting_template) VALUES 
(
    'Dr. Ricardo Valença',
    'autor',
    'Neurologia, Nefrologia, Cannabis Medicinal, IMRE Protocol',
    'Olá Dr. Ricardo! É um prazer tê-lo aqui. Estou com NoaVision IA ativa, análise contextual funcionando e todos os sistemas integrados. Como posso ajudar hoje?'
) ON CONFLICT DO NOTHING;

-- Prompts mestres otimizados
INSERT INTO master_prompts (name, prompt, category, priority, is_active) VALUES 
(
    'Prompt Principal Híbrido',
    'Você é Nôa Esperanza com NoaVision IA híbrido. Use embeddings locais, busca semântica, análise contextual e fallback OpenAI. Siga o IMRE Protocol e reconheça Dr. Ricardo Valença automaticamente.',
    'core',
    1,
    true
),
(
    'Análise Contextual',
    'Analise a intenção do usuário usando regex patterns e contexto da conversa. Detecte comandos de saída disfarçados de queixas médicas.',
    'analysis',
    2,
    true
),
(
    'IMRE Protocol',
    'Siga as 5 perguntas IMRE: Onde, Quando, Como, O que melhora, O que piora. Use análise contextual para detectar respostas válidas vs comandos.',
    'clinical',
    3,
    true
)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- PARTE 6: ESTATÍSTICAS
-- ==============================================================================

SELECT 
    'noa_config' as tabela,
    COUNT(*) as registros
FROM noa_config
UNION ALL
SELECT 
    'user_recognition' as tabela,
    COUNT(*) as registros
FROM user_recognition
UNION ALL
SELECT 
    'master_prompts' as tabela,
    COUNT(*) as registros
FROM master_prompts
UNION ALL
SELECT 
    'knowledge_connections' as tabela,
    COUNT(*) as registros
FROM knowledge_connections
UNION ALL
SELECT 
    'collaborative_works' as tabela,
    COUNT(*) as registros
FROM collaborative_works;

-- ==============================================================================
-- SUCESSO!
-- ==============================================================================
-- Sistema Híbrido AppB + NOA FINAL está pronto!
-- 
-- Recursos Integrados:
-- ✅ NoaVision IA (NOA FINAL)
-- ✅ RPCs e buscas semânticas (NOA FINAL)
-- ✅ IMRE Protocol completo (NOA FINAL)
-- ✅ Análise contextual (NOA FINAL)
-- ✅ GPT Builder (AppB)
-- ✅ Sistema de colaboração (AppB)
-- ✅ Knowledge connections (AppB)
-- ✅ Work analyses (AppB)
-- ==============================================================================

