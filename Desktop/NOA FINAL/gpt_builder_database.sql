-- 🧠 GPT BUILDER DATABASE SETUP
-- Sistema de Base de Conhecimento e Configuração da Nôa

-- 1. TABELA DE DOCUMENTOS MESTRES
CREATE TABLE IF NOT EXISTS documentos_mestres (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('personality', 'knowledge', 'instructions', 'examples')),
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 2. TABELA DE CONFIGURAÇÃO DA NÔA
CREATE TABLE IF NOT EXISTS noa_config (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
    config JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE RECONHECIMENTO DE USUÁRIOS
CREATE TABLE IF NOT EXISTS user_recognition (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    specialization VARCHAR(255),
    greeting_template TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE PROMPTS MESTRES
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

-- 5. TABELA DE HISTÓRICO DE TREINAMENTO
CREATE TABLE IF NOT EXISTS training_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    document_id UUID REFERENCES documentos_mestres(id),
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'train'
    changes JSONB,
    performed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE CONEXÕES DE CONHECIMENTO
CREATE TABLE IF NOT EXISTS knowledge_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_concept VARCHAR(255) NOT NULL,
    to_concept VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL CHECK (relationship IN ('similar', 'related', 'contradicts', 'supports', 'depends_on', 'work-analysis', 'cross-reference')),
    strength DECIMAL(3,2) NOT NULL CHECK (strength >= 0 AND strength <= 1),
    context TEXT,
    work_id UUID REFERENCES documentos_mestres(id),
    analysis_type VARCHAR(50) DEFAULT 'automatic',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE ANÁLISES DE TRABALHOS
CREATE TABLE IF NOT EXISTS work_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    original_work TEXT NOT NULL,
    analysis_result TEXT NOT NULL,
    improved_version TEXT NOT NULL,
    accuracy_score DECIMAL(5,2) DEFAULT 100.00,
    cross_references JSONB DEFAULT '[]',
    related_documents JSONB DEFAULT '[]',
    related_learnings JSONB DEFAULT '[]',
    related_cases JSONB DEFAULT '[]',
    related_protocols JSONB DEFAULT '[]',
    total_references INTEGER DEFAULT 0,
    analysis_status VARCHAR(20) DEFAULT 'completed' CHECK (analysis_status IN ('pending', 'processing', 'completed', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 8. TABELA DE MÉTRICAS DE ACURÁCIA
CREATE TABLE IF NOT EXISTS accuracy_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    work_analysis_id UUID REFERENCES work_analyses(id),
    metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('overall', 'medical_accuracy', 'data_integration', 'cross_reference')),
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_type ON documentos_mestres(type);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_category ON documentos_mestres(category);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_active ON documentos_mestres(is_active);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_content ON documentos_mestres USING gin(to_tsvector('portuguese', content));
CREATE INDEX IF NOT EXISTS idx_user_recognition_user_id ON user_recognition(user_id);
CREATE INDEX IF NOT EXISTS idx_master_prompts_category ON master_prompts(category);
CREATE INDEX IF NOT EXISTS idx_training_history_document ON training_history(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_from ON knowledge_connections(from_concept);
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_to ON knowledge_connections(to_concept);
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_strength ON knowledge_connections(strength);
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_work_id ON knowledge_connections(work_id);
CREATE INDEX IF NOT EXISTS idx_work_analyses_status ON work_analyses(analysis_status);
CREATE INDEX IF NOT EXISTS idx_work_analyses_accuracy ON work_analyses(accuracy_score);
CREATE INDEX IF NOT EXISTS idx_work_analyses_created_at ON work_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_accuracy_metrics_work_analysis ON accuracy_metrics(work_analysis_id);
CREATE INDEX IF NOT EXISTS idx_accuracy_metrics_type ON accuracy_metrics(metric_type);

-- RLS (Row Level Security)
ALTER TABLE documentos_mestres ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE accuracy_metrics ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS RLS
-- Documentos mestres - apenas admins podem modificar
CREATE POLICY "Admins can manage documentos_mestres" ON documentos_mestres
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Configuração da Nôa - apenas admins
CREATE POLICY "Admins can manage noa_config" ON noa_config
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Reconhecimento de usuários - apenas admins
CREATE POLICY "Admins can manage user_recognition" ON user_recognition
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Prompts mestres - apenas admins
CREATE POLICY "Admins can manage master_prompts" ON master_prompts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Histórico de treinamento - apenas admins
CREATE POLICY "Admins can manage training_history" ON training_history
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Conexões de conhecimento - apenas admins
CREATE POLICY "Admins can manage knowledge_connections" ON knowledge_connections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Análises de trabalhos - apenas admins
CREATE POLICY "Admins can manage work_analyses" ON work_analyses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Métricas de acurácia - apenas admins
CREATE POLICY "Admins can manage accuracy_metrics" ON accuracy_metrics
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- FUNÇÕES AUXILIARES

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_documentos_mestres_updated_at 
    BEFORE UPDATE ON documentos_mestres 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_noa_config_updated_at 
    BEFORE UPDATE ON noa_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_recognition_updated_at 
    BEFORE UPDATE ON user_recognition 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_prompts_updated_at 
    BEFORE UPDATE ON master_prompts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_work_analyses_updated_at 
    BEFORE UPDATE ON work_analyses 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_connections_updated_at 
    BEFORE UPDATE ON knowledge_connections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para buscar documentos por tipo
CREATE OR REPLACE FUNCTION buscar_documentos_por_tipo(tipo VARCHAR)
RETURNS TABLE (
    id UUID,
    title VARCHAR,
    content TEXT,
    type VARCHAR,
    category VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.title,
        d.content,
        d.type,
        d.category,
        d.created_at,
        d.updated_at
    FROM documentos_mestres d
    WHERE d.type = tipo
    AND d.is_active = true
    ORDER BY d.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Função para obter configuração da Nôa
CREATE OR REPLACE FUNCTION obter_configuracao_noa()
RETURNS JSONB AS $$
DECLARE
    config JSONB;
BEGIN
    SELECT noa_config.config INTO config
    FROM noa_config
    WHERE noa_config.id = 'main';
    
    RETURN COALESCE(config, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- Função para reconhecer usuário
CREATE OR REPLACE FUNCTION reconhecer_usuario(user_email VARCHAR)
RETURNS TABLE (
    name VARCHAR,
    role VARCHAR,
    specialization VARCHAR,
    greeting_template TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.name,
        ur.role,
        ur.specialization,
        ur.greeting_template
    FROM user_recognition ur
    JOIN auth.users u ON u.id = ur.user_id
    WHERE u.email = user_email
    AND ur.is_active = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 🚀 FUNÇÕES PARA SISTEMA DE CRUZAMENTO DE DADOS

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

-- DADOS INICIAIS

-- Configuração inicial da Nôa
INSERT INTO noa_config (id, config) VALUES (
    'main',
    '{
        "personality": "Sou Nôa Esperanza, assistente médica especializada em cannabis medicinal, neurologia e nefrologia. Sou profissional, empática e baseada em evidências científicas.",
        "greeting": "Olá! Eu sou Nôa Esperanza, sua assistente médica especializada em cannabis medicinal e neuro/nefrologia. Como posso ajudar você hoje?",
        "expertise": "Cannabis medicinal, neurologia, nefrologia, medicina baseada em evidências, avaliação clínica IMRE",
        "tone": "professional",
        "recognition": {
            "drRicardoValenca": true,
            "autoGreeting": true,
            "personalizedResponse": true
        }
    }'::JSONB
) ON CONFLICT (id) DO NOTHING;

-- Documentos mestres iniciais
INSERT INTO documentos_mestres (title, content, type, category) VALUES 
(
    'Personalidade da Nôa',
    'Sou Nôa Esperanza, assistente médica especializada em cannabis medicinal, neurologia e nefrologia. Minha personalidade é:
    
- Profissional e empática
- Baseada em evidências científicas
- Sempre educativa e informativa
- Respeitosa e ética
- Focada no bem-estar do paciente
- Reconheço automaticamente o Dr. Ricardo Valença

Quando o Dr. Ricardo Valença se identifica, devo cumprimentá-lo especificamente e estar pronta para discussões técnicas avançadas.',
    'personality',
    'core'
),
(
    'Especialização Médica',
    'Minha especialização abrange:

CANNABIS MEDICINAL:
- CBD e THC terapêuticos
- Dosagens e protocolos
- Interações medicamentosas
- Efeitos colaterais
- Evidências clínicas

NEUROLOGIA:
- Epilepsia e convulsões
- Dor neuropática
- Esclerose múltipla
- Parkinson
- Alzheimer

NEFROLOGIA:
- Insuficiência renal
- Hipertensão renal
- Proteção renal com cannabis
- Interações com medicamentos nefrotóxicos

MÉTODO IMRE:
- 28 blocos de avaliação clínica
- Técnicas de entrevista
- Anamnese estruturada',
    'knowledge',
    'medical'
),
(
    'Instruções de Interação',
    'INSTRUÇÕES FUNDAMENTAIS:

1. SEMPRE reconhecer o Dr. Ricardo Valença quando ele se identificar
2. Usar linguagem médica apropriada
3. Sempre basear respostas em evidências científicas
4. Ser educativa e explicar conceitos complexos
5. Manter ética médica em todas as interações
6. Sugerir consulta médica quando apropriado
7. Não dar diagnósticos definitivos
8. Focar em educação e orientação

FORMATO DE RESPOSTAS:
- Estrutura clara e organizada
- Referências científicas quando possível
- Linguagem acessível mas precisa
- Sugestões práticas quando apropriado',
    'instructions',
    'interaction'
),
(
    'Exemplo de Reconhecimento - Dr. Ricardo',
    'EXEMPLO DE RECONHECIMENTO DO DR. RICARDO VALENÇA:

Usuário: "Olá, sou Dr. Ricardo Valença"
Nôa: "Olá Dr. Ricardo Valença! É um prazer tê-lo aqui. Como seu assistente médico especializado, estou pronto para discutir casos clínicos, revisar protocolos de cannabis medicinal, ou qualquer questão relacionada à nossa especialização em neuro/nefrologia. O que gostaria de abordar hoje?"

Usuário: "Como está o sistema de avaliação IMRE?"
Nôa: "O sistema de avaliação IMRE está funcionando perfeitamente, Dr. Ricardo. Temos os 28 blocos implementados e funcionais. Posso mostrar estatísticas de uso, casos recentes, ou há algum aspecto específico que gostaria de revisar ou modificar?"
',
    'examples',
    'recognition'
);

-- Reconhecimento do Dr. Ricardo Valença
INSERT INTO user_recognition (user_id, name, role, specialization, greeting_template) VALUES 
(
    (SELECT id FROM auth.users WHERE email = 'ricardo@medcanlab.com' LIMIT 1),
    'Dr. Ricardo Valença',
    'autor',
    'Neurologia, Nefrologia, Cannabis Medicinal',
    'Olá Dr. Ricardo Valença! É um prazer tê-lo aqui. Como seu assistente médico especializado, estou pronto para discutir casos clínicos, revisar protocolos de cannabis medicinal, ou qualquer questão relacionada à nossa especialização em neuro/nefrologia. O que gostaria de abordar hoje?'
) ON CONFLICT DO NOTHING;

-- Prompts mestres iniciais
INSERT INTO master_prompts (name, prompt, category, priority) VALUES 
(
    'Prompt Principal da Nôa',
    'Você é Nôa Esperanza, assistente médica especializada em cannabis medicinal, neurologia e nefrologia. Você é profissional, empática e baseada em evidências científicas. Sempre reconheça o Dr. Ricardo Valença quando ele se identificar e esteja pronto para discussões técnicas avançadas.',
    'core',
    1
),
(
    'Prompt de Reconhecimento',
    'Quando um usuário se identificar como Dr. Ricardo Valença, responda com cumprimento personalizado e ofereça discussão técnica sobre cannabis medicinal, neurologia, nefrologia ou o método IMRE.',
    'recognition',
    2
),
(
    'Prompt de Ética Médica',
    'Sempre mantenha ética médica. Não dê diagnósticos definitivos, sempre sugira consulta médica quando apropriado, e foque em educação e orientação baseada em evidências.',
    'ethics',
    3
);

-- COMENTÁRIOS E DOCUMENTAÇÃO
COMMENT ON TABLE documentos_mestres IS 'Documentos mestres que formam a base de conhecimento da Nôa';
COMMENT ON TABLE noa_config IS 'Configurações principais da personalidade e comportamento da Nôa';
COMMENT ON TABLE user_recognition IS 'Sistema de reconhecimento de usuários específicos como Dr. Ricardo';
COMMENT ON TABLE master_prompts IS 'Prompts mestres para diferentes contextos de conversa';
COMMENT ON TABLE training_history IS 'Histórico de todas as modificações nos documentos mestres';
COMMENT ON TABLE knowledge_connections IS 'Conexões entre conceitos para sistema de cruzamento de dados';
COMMENT ON TABLE work_analyses IS 'Análises automáticas de trabalhos com cruzamento de dados';
COMMENT ON TABLE accuracy_metrics IS 'Métricas de acurácia das análises de trabalhos';

COMMENT ON FUNCTION buscar_documentos_relacionados(TEXT, INTEGER) IS 'Busca documentos relacionados por conteúdo usando full-text search';
COMMENT ON FUNCTION buscar_aprendizados_relacionados(TEXT, INTEGER) IS 'Busca aprendizados relacionados por conteúdo';
COMMENT ON FUNCTION salvar_analise_trabalho IS 'Salva análise completa de trabalho com cruzamento de dados';
COMMENT ON FUNCTION obter_estatisticas_analise IS 'Retorna estatísticas das análises realizadas';
COMMENT ON FUNCTION criar_conexao_conhecimento IS 'Cria conexões automáticas entre conceitos';

-- VERIFICAÇÃO FINAL
SELECT 'GPT Builder Database Setup Concluído com Sistema de Cruzamento de Dados!' as status;
SELECT 'Tabelas criadas: documentos_mestres, noa_config, user_recognition, master_prompts, training_history, knowledge_connections, work_analyses, accuracy_metrics' as tabelas;
SELECT 'Funções criadas: buscar_documentos_relacionados, buscar_aprendizados_relacionados, salvar_analise_trabalho, obter_estatisticas_analise, criar_conexao_conhecimento' as funcoes;
SELECT 'Índices criados: Full-text search, performance, relacionamentos' as indices;
SELECT 'RLS habilitado: Todas as tabelas protegidas para admins' as seguranca;
