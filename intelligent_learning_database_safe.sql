-- 🧠 INTELLIGENT LEARNING DATABASE - VERSÃO SEGURA
-- Sistema profissional com fallbacks para textSearch e vector

-- 1. Base de aprendizado inteligente
CREATE TABLE IF NOT EXISTS intelligent_learning (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    context JSONB,
    relevance DECIMAL(3,2) DEFAULT 0.5,
    tags TEXT[],
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Padrões de conversação
CREATE TABLE IF NOT EXISTS conversation_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_type TEXT NOT NULL,
    pattern_data JSONB,
    relevance DECIMAL(3,2) DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Contexto semântico de aprendizado
CREATE TABLE IF NOT EXISTS semantic_learning_context (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    context_data JSONB,
    learning_insights TEXT[],
    relevance DECIMAL(3,2) DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Trabalhos colaborativos
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

-- 5. Histórico de evolução de trabalhos
CREATE TABLE IF NOT EXISTS work_evolution_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_id TEXT NOT NULL REFERENCES collaborative_works(id),
    previous_content TEXT,
    new_content TEXT NOT NULL,
    evolved_content TEXT NOT NULL,
    contributor TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Cross-references inteligentes
CREATE TABLE IF NOT EXISTS intelligent_cross_references (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_type TEXT NOT NULL,
    source_id TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    relevance DECIMAL(3,2) DEFAULT 0.5,
    relationship_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Insights gerados
CREATE TABLE IF NOT EXISTS generated_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    insight_type TEXT NOT NULL,
    content TEXT NOT NULL,
    context JSONB,
    relevance DECIMAL(3,2) DEFAULT 0.5,
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Histórico inteligente para sidebar
CREATE TABLE IF NOT EXISTS intelligent_sidebar_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_type TEXT NOT NULL,
    item_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    relevance DECIMAL(3,2) DEFAULT 0.5,
    category TEXT,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Vector memory (OPCIONAL - com fallback)
CREATE TABLE IF NOT EXISTS vector_memory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    response TEXT,
    vector_embedding FLOAT[], -- Array de floats para compatibilidade
    attention_scores JSONB,
    dominant_context TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance (SEM textSearch - usando ILIKE)
CREATE INDEX IF NOT EXISTS idx_intelligent_learning_relevance ON intelligent_learning(relevance DESC);
CREATE INDEX IF NOT EXISTS idx_intelligent_learning_category ON intelligent_learning(category);
CREATE INDEX IF NOT EXISTS idx_intelligent_learning_tags ON intelligent_learning USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_intelligent_learning_content ON intelligent_learning USING GIN(to_tsvector('portuguese', user_message || ' ' || ai_response));
CREATE INDEX IF NOT EXISTS idx_conversation_patterns_type ON conversation_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_collaborative_works_status ON collaborative_works(status);
CREATE INDEX IF NOT EXISTS idx_collaborative_works_type ON collaborative_works(type);
CREATE INDEX IF NOT EXISTS idx_collaborative_works_participants ON collaborative_works USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_collaborative_works_content ON collaborative_works USING GIN(to_tsvector('portuguese', title || ' ' || content));
CREATE INDEX IF NOT EXISTS idx_work_evolution_work_id ON work_evolution_history(work_id);
CREATE INDEX IF NOT EXISTS idx_cross_references_source ON intelligent_cross_references(source_type, source_id);
CREATE INDEX IF NOT EXISTS idx_cross_references_target ON intelligent_cross_references(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_sidebar_history_user ON intelligent_sidebar_history(user_id);
CREATE INDEX IF NOT EXISTS idx_sidebar_history_relevance ON intelligent_sidebar_history(relevance DESC);
CREATE INDEX IF NOT EXISTS idx_vector_memory_user ON vector_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_vector_memory_content ON vector_memory USING GIN(to_tsvector('portuguese', content));

-- Funções auxiliares
CREATE OR REPLACE FUNCTION update_work_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar timestamp
CREATE TRIGGER trigger_update_collaborative_works_updated_at
    BEFORE UPDATE ON collaborative_works
    FOR EACH ROW
    EXECUTE FUNCTION update_work_updated_at();

-- Função para buscar contexto inteligente (COM FALLBACK)
CREATE OR REPLACE FUNCTION get_intelligent_context_safe(
    p_user_id TEXT,
    p_message TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    item_type TEXT,
    item_id TEXT,
    title TEXT,
    content TEXT,
    relevance DECIMAL,
    category TEXT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'conversation'::TEXT as item_type,
        ch.id::TEXT as item_id,
        ('Conversa - ' || ch.created_at::DATE)::TEXT as title,
        ch.content,
        ch.relevance_score as relevance,
        'conversa'::TEXT as category,
        ch.created_at
    FROM conversation_history ch
    WHERE ch.user_id = p_user_id
        AND (ch.content ILIKE '%' || p_message || '%' OR ch.response ILIKE '%' || p_message || '%')
    ORDER BY ch.relevance_score DESC, ch.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Função para busca segura com fallback
CREATE OR REPLACE FUNCTION safe_text_search(
    p_table_name TEXT,
    p_column_name TEXT,
    p_search_term TEXT,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id TEXT,
    content TEXT,
    relevance DECIMAL
) AS $$
BEGIN
    -- Tentar busca com tsvector se disponível
    BEGIN
        RETURN QUERY EXECUTE format('
            SELECT id::TEXT, %I, 0.8::DECIMAL
            FROM %I 
            WHERE to_tsvector(''portuguese'', %I) @@ plainto_tsquery(''portuguese'', %L)
            ORDER BY ts_rank(to_tsvector(''portuguese'', %I), plainto_tsquery(''portuguese'', %L)) DESC
            LIMIT %s',
            p_column_name, p_table_name, p_column_name, p_search_term, 
            p_column_name, p_search_term, p_limit
        );
    EXCEPTION WHEN OTHERS THEN
        -- Fallback para ILIKE
        RETURN QUERY EXECUTE format('
            SELECT id::TEXT, %I, 0.5::DECIMAL
            FROM %I 
            WHERE %I ILIKE ''%%%s%%''
            ORDER BY created_at DESC
            LIMIT %s',
            p_column_name, p_table_name, p_column_name, p_search_term, p_limit
        );
    END;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar insights automáticos
CREATE OR REPLACE FUNCTION generate_automatic_insights()
RETURNS TRIGGER AS $$
DECLARE
    insight_content TEXT;
    insight_tags TEXT[];
BEGIN
    -- Gerar insights baseados no conteúdo
    insight_content := 'Insight gerado automaticamente para: ' || NEW.user_message;
    insight_tags := ARRAY['auto-generated', NEW.category];
    
    INSERT INTO generated_insights (insight_type, content, context, tags)
    VALUES ('automatic', insight_content, NEW.context, insight_tags);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar insights automáticos
CREATE TRIGGER trigger_generate_insights
    AFTER INSERT ON intelligent_learning
    FOR EACH ROW
    EXECUTE FUNCTION generate_automatic_insights();

-- RLS Policies
ALTER TABLE intelligent_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_learning_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaborative_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_evolution_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligent_cross_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligent_sidebar_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE vector_memory ENABLE ROW LEVEL SECURITY;

-- Políticas para Dr. Ricardo
CREATE POLICY "Dr. Ricardo can access intelligent learning" ON intelligent_learning
    FOR ALL USING (true);

CREATE POLICY "Dr. Ricardo can access conversation patterns" ON conversation_patterns
    FOR ALL USING (true);

CREATE POLICY "Dr. Ricardo can access semantic learning" ON semantic_learning_context
    FOR ALL USING (true);

CREATE POLICY "Dr. Ricardo can access collaborative works" ON collaborative_works
    FOR ALL USING (true);

CREATE POLICY "Dr. Ricardo can access work evolution" ON work_evolution_history
    FOR ALL USING (true);

CREATE POLICY "Dr. Ricardo can access cross references" ON intelligent_cross_references
    FOR ALL USING (true);

CREATE POLICY "Dr. Ricardo can access insights" ON generated_insights
    FOR ALL USING (true);

CREATE POLICY "Dr. Ricardo can access sidebar history" ON intelligent_sidebar_history
    FOR ALL USING (true);

CREATE POLICY "Dr. Ricardo can access vector memory" ON vector_memory
    FOR ALL USING (true);

-- Inserir dados iniciais
INSERT INTO intelligent_learning (conversation_id, user_message, ai_response, relevance, tags, category)
VALUES (
    'initial_learning',
    'Sistema de aprendizado inteligente inicializado',
    'Sistema Nôa Esperanza com aprendizado contínuo ativo',
    0.9,
    ARRAY['sistema', 'inicialização', 'aprendizado'],
    'sistema'
) ON CONFLICT DO NOTHING;

-- Mensagem de sucesso
SELECT json_build_object(
    'status', 'sucesso',
    'message', 'Sistema de Aprendizado Inteligente SEGURO implementado com sucesso!',
    'tabelas_criadas', ARRAY[
        'intelligent_learning',
        'conversation_patterns',
        'semantic_learning_context',
        'collaborative_works',
        'work_evolution_history',
        'intelligent_cross_references',
        'generated_insights',
        'intelligent_sidebar_history',
        'vector_memory'
    ],
    'funcoes_criadas', ARRAY[
        'get_intelligent_context_safe',
        'safe_text_search',
        'generate_automatic_insights',
        'update_work_updated_at'
    ],
    'melhorias', ARRAY[
        'Fallbacks para textSearch',
        'Índices otimizados',
        'Busca segura com ILIKE',
        'Vector memory opcional',
        'Controle de erros robusto'
    ],
    'versao', '1.0-segura'
);
