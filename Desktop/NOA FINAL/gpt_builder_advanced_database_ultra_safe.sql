-- 🚀 GPT BUILDER ADVANCED DATABASE - VERSÃO ULTRA-SEGURA
-- Sistema avançado que NÃO afeta tabelas existentes

-- Verificar se as tabelas já existem antes de criar
DO $$ 
BEGIN
    -- Tabela para contexto ativo por sessão
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'active_contexts') THEN
        CREATE TABLE active_contexts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            doc_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            category VARCHAR(100) NOT NULL,
            tags TEXT[] DEFAULT '{}',
            gpt_module VARCHAR(100),
            last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            session_id VARCHAR(255) NOT NULL,
            learning_data JSONB DEFAULT '{}',
            user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela active_contexts criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela active_contexts já existe - pulando criação.';
    END IF;

    -- Tabela para módulos GPT funcionais
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gpt_modules') THEN
        CREATE TABLE gpt_modules (
            id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            function VARCHAR(255) NOT NULL,
            description TEXT,
            documents TEXT[] DEFAULT '{}',
            tags TEXT[] DEFAULT '{}',
            prompt_template TEXT NOT NULL,
            is_active BOOLEAN DEFAULT FALSE,
            user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela gpt_modules criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela gpt_modules já existe - pulando criação.';
    END IF;

    -- Tabela para sessões de GPT
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gpt_sessions') THEN
        CREATE TABLE gpt_sessions (
            id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            active_contexts TEXT[] DEFAULT '{}',
            current_focus VARCHAR(255),
            session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            total_interactions INTEGER DEFAULT 0,
            last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela gpt_sessions criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela gpt_sessions já existe - pulando criação.';
    END IF;

    -- Tabela para histórico de sugestões do editor
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'editor_suggestions') THEN
        CREATE TABLE editor_suggestions (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            document_id VARCHAR(255),
            suggestion_type VARCHAR(50) NOT NULL,
            original_text TEXT,
            suggested_text TEXT NOT NULL,
            confidence REAL DEFAULT 0.0,
            applied BOOLEAN DEFAULT FALSE,
            user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela editor_suggestions criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela editor_suggestions já existe - pulando criação.';
    END IF;

    -- Tabela para configurações de exportação
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gpt_exports') THEN
        CREATE TABLE gpt_exports (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            gpt_config JSONB NOT NULL,
            exported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id VARCHAR(255) DEFAULT 'dr-ricardo-valenca'
        );
        
        RAISE NOTICE 'Tabela gpt_exports criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela gpt_exports já existe - pulando criação.';
    END IF;

END $$;

-- Criar índices apenas se não existirem
DO $$
BEGIN
    -- Índices para active_contexts
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_active_contexts_session_id') THEN
        CREATE INDEX idx_active_contexts_session_id ON active_contexts(session_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_active_contexts_user_id') THEN
        CREATE INDEX idx_active_contexts_user_id ON active_contexts(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_active_contexts_last_accessed') THEN
        CREATE INDEX idx_active_contexts_last_accessed ON active_contexts(last_accessed DESC);
    END IF;

    -- Índices para gpt_modules
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gpt_modules_user_id') THEN
        CREATE INDEX idx_gpt_modules_user_id ON gpt_modules(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_gpt_modules_is_active') THEN
        CREATE INDEX idx_gpt_modules_is_active ON gpt_modules(is_active);
    END IF;

    -- Índices para editor_suggestions
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_editor_suggestions_user_id') THEN
        CREATE INDEX idx_editor_suggestions_user_id ON editor_suggestions(user_id);
    END IF;

    RAISE NOTICE 'Índices criados/verificados com sucesso!';
END $$;

-- Habilitar RLS apenas se não estiver habilitado
DO $$
BEGIN
    -- Active contexts
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'active_contexts' AND rowsecurity = true) THEN
        ALTER TABLE active_contexts ENABLE ROW LEVEL SECURITY;
    END IF;

    -- GPT modules
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'gpt_modules' AND rowsecurity = true) THEN
        ALTER TABLE gpt_modules ENABLE ROW LEVEL SECURITY;
    END IF;

    -- GPT sessions
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'gpt_sessions' AND rowsecurity = true) THEN
        ALTER TABLE gpt_sessions ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Editor suggestions
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'editor_suggestions' AND rowsecurity = true) THEN
        ALTER TABLE editor_suggestions ENABLE ROW LEVEL SECURITY;
    END IF;

    -- GPT exports
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'gpt_exports' AND rowsecurity = true) THEN
        ALTER TABLE gpt_exports ENABLE ROW LEVEL SECURITY;
    END IF;

    RAISE NOTICE 'RLS habilitado com sucesso!';
END $$;

-- Criar políticas apenas se não existirem
DO $$
BEGIN
    -- Política para active_contexts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'active_contexts' AND policyname = 'Users can manage their own active contexts') THEN
        CREATE POLICY "Users can manage their own active contexts" ON active_contexts
            FOR ALL USING (user_id = current_setting('app.current_user_id', true));
    END IF;

    -- Política para gpt_modules
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gpt_modules' AND policyname = 'Users can manage their own GPT modules') THEN
        CREATE POLICY "Users can manage their own GPT modules" ON gpt_modules
            FOR ALL USING (user_id = current_setting('app.current_user_id', true));
    END IF;

    -- Política para gpt_sessions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gpt_sessions' AND policyname = 'Users can manage their own GPT sessions') THEN
        CREATE POLICY "Users can manage their own GPT sessions" ON gpt_sessions
            FOR ALL USING (user_id = current_setting('app.current_user_id', true));
    END IF;

    -- Política para editor_suggestions
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'editor_suggestions' AND policyname = 'Users can manage their own editor suggestions') THEN
        CREATE POLICY "Users can manage their own editor suggestions" ON editor_suggestions
            FOR ALL USING (user_id = current_setting('app.current_user_id', true));
    END IF;

    -- Política para gpt_exports
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'gpt_exports' AND policyname = 'Users can manage their own GPT exports') THEN
        CREATE POLICY "Users can manage their own GPT exports" ON gpt_exports
            FOR ALL USING (user_id = current_setting('app.current_user_id', true));
    END IF;

    RAISE NOTICE 'Políticas RLS criadas com sucesso!';
END $$;

-- Criar funções apenas se não existirem
DO $$
BEGIN
    -- Função set_active_context
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'set_active_context') THEN
        CREATE OR REPLACE FUNCTION set_active_context(
            p_doc_id VARCHAR(255),
            p_title VARCHAR(255),
            p_content TEXT,
            p_category VARCHAR(255),
            p_session_id VARCHAR(255)
        ) RETURNS JSONB AS $func$
        DECLARE
            result JSONB;
        BEGIN
            INSERT INTO active_contexts (
                doc_id, title, content, category, session_id, user_id
            ) VALUES (
                p_doc_id, p_title, p_content, p_category, p_session_id, 'dr-ricardo-valenca'
            ) ON CONFLICT (doc_id, session_id) DO UPDATE SET
                title = EXCLUDED.title,
                content = EXCLUDED.content,
                category = EXCLUDED.category,
                last_accessed = NOW();
            
            RETURN jsonb_build_object(
                'status', 'success',
                'message', 'Contexto ativo definido',
                'doc_id', p_doc_id,
                'session_id', p_session_id
            );
        END;
        $func$ LANGUAGE plpgsql;
        
        RAISE NOTICE 'Função set_active_context criada com sucesso!';
    ELSE
        RAISE NOTICE 'Função set_active_context já existe - pulando criação.';
    END IF;

    -- Função activate_gpt_module
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'activate_gpt_module') THEN
        CREATE OR REPLACE FUNCTION activate_gpt_module(
            p_module_id VARCHAR(255)
        ) RETURNS JSONB AS $func$
        DECLARE
            result JSONB;
        BEGIN
            UPDATE gpt_modules 
            SET is_active = FALSE, last_updated = NOW()
            WHERE user_id = 'dr-ricardo-valenca';
            
            UPDATE gpt_modules 
            SET is_active = TRUE, last_updated = NOW()
            WHERE id = p_module_id AND user_id = 'dr-ricardo-valenca';
            
            RETURN jsonb_build_object(
                'status', 'success',
                'message', 'Módulo GPT ativado',
                'module_id', p_module_id
            );
        END;
        $func$ LANGUAGE plpgsql;
        
        RAISE NOTICE 'Função activate_gpt_module criada com sucesso!';
    ELSE
        RAISE NOTICE 'Função activate_gpt_module já existe - pulando criação.';
    END IF;

    -- Função export_gpt_config
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'export_gpt_config') THEN
        CREATE OR REPLACE FUNCTION export_gpt_config(
            p_name VARCHAR(255),
            p_description TEXT
        ) RETURNS JSONB AS $func$
        DECLARE
            active_module JSONB;
            export_config JSONB;
        BEGIN
            SELECT to_jsonb(gm.*) INTO active_module
            FROM gpt_modules gm
            WHERE gm.user_id = 'dr-ricardo-valenca' AND gm.is_active = TRUE;
            
            export_config := jsonb_build_object(
                'name', p_name,
                'description', p_description,
                'version', '2.0',
                'exported_at', NOW(),
                'gpt_module', active_module,
                'base_knowledge', (
                    SELECT jsonb_agg(to_jsonb(dm.*))
                    FROM documentos_mestres dm
                    WHERE dm.user_id = 'dr-ricardo-valenca'
                )
            );
            
            INSERT INTO gpt_exports (name, description, gpt_config, user_id)
            VALUES (p_name, p_description, export_config, 'dr-ricardo-valenca');
            
            RETURN jsonb_build_object(
                'status', 'success',
                'message', 'Configuração GPT exportada',
                'export_config', export_config
            );
        END;
        $func$ LANGUAGE plpgsql;
        
        RAISE NOTICE 'Função export_gpt_config criada com sucesso!';
    ELSE
        RAISE NOTICE 'Função export_gpt_config já existe - pulando criação.';
    END IF;

END $$;

-- Inserir módulo padrão apenas se não existir
INSERT INTO gpt_modules (
    id, name, function, description, documents, tags, prompt_template, is_active, user_id
) VALUES (
    'module_clinico',
    'GPT Clínico',
    'Realiza triagens e escuta ativa',
    'Módulo especializado em avaliação clínica e escuta ativa',
    ARRAY['Avaliação Inicial', 'Análise Clínica', 'Curso Arte da Entrevista'],
    ARRAY['gpt', 'modulo', 'clinico', 'triagem-medica', 'escuta-ativa'],
    'Você é o GPT Clínico da Nôa Esperanza, especializado em triagens e escuta ativa. Mantenha o tom empático e baseado em evidências.',
    TRUE,
    'dr-ricardo-valenca'
) ON CONFLICT (id) DO NOTHING;

-- Verificação final
SELECT 
    'Sistema GPT Builder Avançado criado com segurança!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%gpt%' OR table_name LIKE '%active%') as tabelas_criadas;
