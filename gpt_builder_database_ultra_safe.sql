-- 🧠 GPT BUILDER DATABASE SETUP - VERSÃO ULTRA SEGURA
-- Sistema de Base de Conhecimento e Configuração da Nôa
-- Verifica se objetos já existem antes de criar (evita erros)

-- ========================================
-- PARTE 1: CRIAÇÃO DE TABELAS (SEM CONFLITOS)
-- ========================================

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

-- ========================================
-- PARTE 2: ÍNDICES (CRIADOS SEPARADAMENTE)
-- ========================================

-- Índices básicos
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_type ON documentos_mestres(type);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_category ON documentos_mestres(category);
CREATE INDEX IF NOT EXISTS idx_documentos_mestres_active ON documentos_mestres(is_active);
CREATE INDEX IF NOT EXISTS idx_user_recognition_user_id ON user_recognition(user_id);
CREATE INDEX IF NOT EXISTS idx_master_prompts_category ON master_prompts(category);
CREATE INDEX IF NOT EXISTS idx_training_history_document ON training_history(document_id);

-- Índices para cruzamento de dados
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_from ON knowledge_connections(from_concept);
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_to ON knowledge_connections(to_concept);
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_strength ON knowledge_connections(strength);
CREATE INDEX IF NOT EXISTS idx_knowledge_connections_work_id ON knowledge_connections(work_id);

-- Índices para análises de trabalhos
CREATE INDEX IF NOT EXISTS idx_work_analyses_status ON work_analyses(analysis_status);
CREATE INDEX IF NOT EXISTS idx_work_analyses_accuracy ON work_analyses(accuracy_score);
CREATE INDEX IF NOT EXISTS idx_work_analyses_created_at ON work_analyses(created_at);
CREATE INDEX IF NOT EXISTS idx_accuracy_metrics_work_analysis ON accuracy_metrics(work_analysis_id);
CREATE INDEX IF NOT EXISTS idx_accuracy_metrics_type ON accuracy_metrics(metric_type);

-- ========================================
-- PARTE 3: FUNÇÕES AUXILIARES (VERIFICA SE EXISTE)
-- ========================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- PARTE 4: TRIGGERS (VERIFICA SE EXISTE ANTES DE CRIAR)
-- ========================================

-- Trigger para documentos_mestres
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_documentos_mestres_updated_at') THEN
        CREATE TRIGGER update_documentos_mestres_updated_at 
            BEFORE UPDATE ON documentos_mestres 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Trigger para noa_config
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_noa_config_updated_at') THEN
        CREATE TRIGGER update_noa_config_updated_at 
            BEFORE UPDATE ON noa_config 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Trigger para user_recognition
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_recognition_updated_at') THEN
        CREATE TRIGGER update_user_recognition_updated_at 
            BEFORE UPDATE ON user_recognition 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Trigger para master_prompts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_master_prompts_updated_at') THEN
        CREATE TRIGGER update_master_prompts_updated_at 
            BEFORE UPDATE ON master_prompts 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Trigger para work_analyses
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_work_analyses_updated_at') THEN
        CREATE TRIGGER update_work_analyses_updated_at 
            BEFORE UPDATE ON work_analyses 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Trigger para knowledge_connections
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_knowledge_connections_updated_at') THEN
        CREATE TRIGGER update_knowledge_connections_updated_at 
            BEFORE UPDATE ON knowledge_connections 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- ========================================
-- PARTE 5: RLS (APLICADO SEPARADAMENTE)
-- ========================================

ALTER TABLE documentos_mestres ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE accuracy_metrics ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PARTE 6: POLÍTICAS RLS (VERIFICA SE EXISTE ANTES DE CRIAR)
-- ========================================

-- Política para documentos_mestres
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage documentos_mestres') THEN
        CREATE POLICY "Admins can manage documentos_mestres" ON documentos_mestres
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
    END IF;
END $$;

-- Política para noa_config
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage noa_config') THEN
        CREATE POLICY "Admins can manage noa_config" ON noa_config
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
    END IF;
END $$;

-- Política para user_recognition
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage user_recognition') THEN
        CREATE POLICY "Admins can manage user_recognition" ON user_recognition
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
    END IF;
END $$;

-- Política para master_prompts
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage master_prompts') THEN
        CREATE POLICY "Admins can manage master_prompts" ON master_prompts
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
    END IF;
END $$;

-- Política para training_history
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage training_history') THEN
        CREATE POLICY "Admins can manage training_history" ON training_history
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
    END IF;
END $$;

-- Política para knowledge_connections
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage knowledge_connections') THEN
        CREATE POLICY "Admins can manage knowledge_connections" ON knowledge_connections
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
    END IF;
END $$;

-- Política para work_analyses
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage work_analyses') THEN
        CREATE POLICY "Admins can manage work_analyses" ON work_analyses
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
    END IF;
END $$;

-- Política para accuracy_metrics
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage accuracy_metrics') THEN
        CREATE POLICY "Admins can manage accuracy_metrics" ON accuracy_metrics
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.raw_user_meta_data->>'role' = 'admin'
                )
            );
    END IF;
END $$;

-- ========================================
-- PARTE 7: DADOS INICIAIS (APLICADOS SEPARADAMENTE)
-- ========================================

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
) ON CONFLICT DO NOTHING;

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
) ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

SELECT 'GPT Builder Database Setup Ultra Seguro Concluído!' as status;
SELECT 'Tabelas verificadas e criadas sem conflitos' as tabelas;
SELECT 'Triggers verificados antes de criar' as triggers;
SELECT 'Políticas verificadas antes de criar' as politicas;
SELECT 'Dados iniciais inseridos com ON CONFLICT DO NOTHING' as dados;
