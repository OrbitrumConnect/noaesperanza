-- 🚀 FUNÇÕES AVANÇADAS PARA SISTEMA DE CRUZAMENTO DE DADOS
-- Execute APÓS o script principal para evitar deadlocks

-- ========================================
-- FUNÇÕES DE BUSCA INTELIGENTE
-- ========================================

-- Função para buscar documentos relacionados por conteúdo
CREATE OR REPLACE FUNCTION buscar_documentos_relacionados(conteudo TEXT, limite INTEGER DEFAULT 5)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    content TEXT,
    type VARCHAR,
    category VARCHAR,
    similarity DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.title,
        d.content,
        d.type,
        d.category,
        ts_rank(to_tsvector('portuguese', d.content), plainto_tsquery('portuguese', conteudo)) as similarity
    FROM documentos_mestres d
    WHERE d.is_active = true
    AND to_tsvector('portuguese', d.content) @@ plainto_tsquery('portuguese', conteudo)
    ORDER BY similarity DESC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar aprendizados relacionados
CREATE OR REPLACE FUNCTION buscar_aprendizados_relacionados(conteudo TEXT, limite INTEGER DEFAULT 5)
RETURNS TABLE (
    keyword VARCHAR,
    context TEXT,
    user_message TEXT,
    ai_response TEXT,
    confidence_score DECIMAL,
    similarity DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        al.keyword,
        al.context,
        al.user_message,
        al.ai_response,
        al.confidence_score,
        ts_rank(to_tsvector('portuguese', al.user_message || ' ' || al.ai_response), plainto_tsquery('portuguese', conteudo)) as similarity
    FROM ai_learning al
    WHERE to_tsvector('portuguese', al.user_message || ' ' || al.ai_response) @@ plainto_tsquery('portuguese', conteudo)
    ORDER BY similarity DESC, al.confidence_score DESC
    LIMIT limite;
END;
$$ LANGUAGE plpgsql;

-- Função para salvar análise de trabalho
CREATE OR REPLACE FUNCTION salvar_analise_trabalho(
    trabalho_original TEXT,
    resultado_analise TEXT,
    versao_melhorada TEXT,
    score_acuracia DECIMAL,
    referencias_cruzadas JSONB,
    documentos_relacionados JSONB,
    aprendizados_relacionados JSONB,
    casos_relacionados JSONB,
    protocolos_relacionados JSONB,
    total_referencias INTEGER,
    usuario_id UUID
) RETURNS UUID AS $$
DECLARE
    analise_id UUID;
BEGIN
    INSERT INTO work_analyses (
        original_work,
        analysis_result,
        improved_version,
        accuracy_score,
        cross_references,
        related_documents,
        related_learnings,
        related_cases,
        related_protocols,
        total_references,
        created_by
    ) VALUES (
        trabalho_original,
        resultado_analise,
        versao_melhorada,
        score_acuracia,
        referencias_cruzadas,
        documentos_relacionados,
        aprendizados_relacionados,
        casos_relacionados,
        protocolos_relacionados,
        total_referencias,
        usuario_id
    ) RETURNING id INTO analise_id;
    
    RETURN analise_id;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de análise
CREATE OR REPLACE FUNCTION obter_estatisticas_analise()
RETURNS TABLE (
    total_analises BIGINT,
    media_acuracia DECIMAL,
    total_referencias BIGINT,
    analises_hoje BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_analises,
        AVG(accuracy_score) as media_acuracia,
        SUM(total_references) as total_referencias,
        COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as analises_hoje
    FROM work_analyses
    WHERE analysis_status = 'completed';
END;
$$ LANGUAGE plpgsql;

-- Função para criar conexões de conhecimento automáticas
CREATE OR REPLACE FUNCTION criar_conexao_conhecimento(
    conceito_origem VARCHAR,
    conceito_destino VARCHAR,
    tipo_relacao VARCHAR,
    forca_relacao DECIMAL,
    contexto TEXT,
    id_trabalho UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    conexao_id UUID;
BEGIN
    INSERT INTO knowledge_connections (
        from_concept,
        to_concept,
        relationship,
        strength,
        context,
        work_id
    ) VALUES (
        conceito_origem,
        conceito_destino,
        tipo_relacao,
        forca_relacao,
        contexto,
        id_trabalho
    ) RETURNING id INTO conexao_id;
    
    RETURN conexao_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- ÍNDICES AVANÇADOS (CRIADOS SEPARADAMENTE)
-- ========================================

-- Índice full-text search para documentos
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_content ON documentos_mestres 
USING gin(to_tsvector('portuguese', content));

-- Índice full-text search para ai_learning (se existir)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_learning') THEN
        CREATE INDEX IF NOT EXISTS idx_ai_learning_content ON ai_learning 
        USING gin(to_tsvector('portuguese', user_message || ' ' || ai_response));
    END IF;
END $$;

-- ========================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ========================================

COMMENT ON FUNCTION buscar_documentos_relacionados(TEXT, INTEGER) IS 'Busca documentos relacionados por conteúdo usando full-text search';
COMMENT ON FUNCTION buscar_aprendizados_relacionados(TEXT, INTEGER) IS 'Busca aprendizados relacionados por conteúdo';
COMMENT ON FUNCTION salvar_analise_trabalho IS 'Salva análise completa de trabalho com cruzamento de dados';
COMMENT ON FUNCTION obter_estatisticas_analise IS 'Retorna estatísticas das análises realizadas';
COMMENT ON FUNCTION criar_conexao_conhecimento IS 'Cria conexões automáticas entre conceitos';

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

SELECT 'Funções Avançadas do GPT Builder Criadas com Sucesso!' as status;
SELECT 'Funções disponíveis: buscar_documentos_relacionados, buscar_aprendizados_relacionados, salvar_analise_trabalho, obter_estatisticas_analise, criar_conexao_conhecimento' as funcoes;
SELECT 'Índices full-text search criados para performance otimizada' as indices;
