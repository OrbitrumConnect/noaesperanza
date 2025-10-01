-- ========================================
-- 🔧 MELHORIAS NECESSÁRIAS NO SQL
-- Para alinhar com o código atual
-- ========================================

-- ❌ PROBLEMA 1: noa_users NÃO tem coluna 'name'
-- O código espera 'name', mas a tabela não tem!
-- ========================================

-- Primeiro, verificar se noa_users é uma tabela ou view
DO $$ 
BEGIN
    -- Tentar adicionar coluna (só funciona se for tabela)
    ALTER TABLE noa_users ADD COLUMN IF NOT EXISTS name TEXT;
EXCEPTION
    WHEN wrong_object_type THEN
        -- Se for view, recriar sem a view primeiro
        RAISE NOTICE 'noa_users é uma VIEW, não uma tabela!';
END $$;

-- Atualizar nomes dos admins existentes
UPDATE noa_users nu
SET name = na.admin_name
FROM noa_admins na
WHERE nu.user_id = na.user_id 
  AND nu.permission_level = 5;

-- ========================================

-- ❌ PROBLEMA 2: noa_users NÃO tem coluna 'profile_data'
-- Para guardar dados extras (email, telefone, etc)
-- ========================================

ALTER TABLE noa_users 
ADD COLUMN IF NOT EXISTS profile_data JSONB DEFAULT '{}'::jsonb;

-- Migrar email para profile_data
UPDATE noa_users nu
SET profile_data = jsonb_build_object(
    'email', au.email,
    'created_at', nu.created_at
)
FROM auth.users au
WHERE nu.user_id = au.id;

-- ========================================

-- ✅ PROBLEMA 3: Adicionar índices para performance
-- ========================================

-- Índice para busca rápida de conversas por sessão
CREATE INDEX IF NOT EXISTS idx_noa_conversations_session 
ON noa_conversations(session_id);

-- Índice para busca de aprendizado por categoria
CREATE INDEX IF NOT EXISTS idx_ai_learning_category 
ON ai_learning(category, confidence_score DESC);

-- Índice para busca de keywords
CREATE INDEX IF NOT EXISTS idx_ai_learning_keyword 
ON ai_learning(keyword);

-- Índice para user_id em conversas
CREATE INDEX IF NOT EXISTS idx_noa_conversations_user 
ON noa_conversations(user_id, created_at DESC);

-- ========================================

-- ✅ PROBLEMA 4: Função para buscar nome do usuário
-- ========================================

CREATE OR REPLACE FUNCTION get_user_name(user_id_param UUID)
RETURNS TEXT AS $$
DECLARE
    user_name TEXT;
BEGIN
    -- Buscar nome de admin primeiro
    SELECT admin_name INTO user_name
    FROM noa_admins
    WHERE user_id = user_id_param
    LIMIT 1;
    
    IF user_name IS NOT NULL THEN
        RETURN user_name;
    END IF;
    
    -- Buscar nome de noa_users
    SELECT name INTO user_name
    FROM noa_users
    WHERE noa_users.user_id = user_id_param
    LIMIT 1;
    
    IF user_name IS NOT NULL THEN
        RETURN user_name;
    END IF;
    
    -- Fallback para email
    SELECT email INTO user_name
    FROM auth.users
    WHERE id = user_id_param;
    
    RETURN COALESCE(user_name, 'Usuário');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================

-- ✅ PROBLEMA 5: View para perfil completo do usuário
-- ========================================

CREATE OR REPLACE VIEW noa_user_profiles AS
SELECT 
    nu.id,
    nu.user_id,
    COALESCE(na.admin_name, nu.name, au.email) as name,
    au.email,
    nu.user_type,
    nu.permission_level,
    CASE 
        WHEN nu.permission_level = 5 THEN true 
        ELSE false 
    END as is_admin,
    na.admin_key,
    na.is_active as admin_active,
    nu.profile_data,
    nu.created_at,
    nu.updated_at
FROM noa_users nu
LEFT JOIN auth.users au ON au.id = nu.user_id
LEFT JOIN noa_admins na ON na.user_id = nu.user_id;

-- ========================================

-- ✅ PROBLEMA 6: Função para salvar/atualizar perfil
-- ========================================

CREATE OR REPLACE FUNCTION save_user_profile(
    user_name_param TEXT,
    profile_data_param JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    current_user_id UUID;
    profile_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário não autenticado';
    END IF;
    
    -- Inserir ou atualizar
    INSERT INTO noa_users (user_id, name, profile_data, user_type)
    VALUES (
        current_user_id,
        user_name_param,
        profile_data_param,
        COALESCE((profile_data_param->>'user_type')::TEXT, 'paciente')
    )
    ON CONFLICT (user_id) DO UPDATE
    SET name = EXCLUDED.name,
        profile_data = EXCLUDED.profile_data,
        updated_at = NOW()
    RETURNING id INTO profile_id;
    
    RETURN profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================

-- ✅ PROBLEMA 7: Trigger para auto-atualizar updated_at
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_noa_users_updated_at ON noa_users;
CREATE TRIGGER update_noa_users_updated_at
    BEFORE UPDATE ON noa_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================

-- ✅ PROBLEMA 8: Estatísticas em tempo real
-- ========================================

CREATE OR REPLACE VIEW noa_real_time_stats AS
SELECT 
    (SELECT COUNT(*) FROM noa_users) as total_usuarios,
    (SELECT COUNT(*) FROM noa_users WHERE user_type = 'paciente') as total_pacientes,
    (SELECT COUNT(*) FROM noa_users WHERE user_type = 'profissional') as total_profissionais,
    (SELECT COUNT(*) FROM noa_admins WHERE is_active = true) as admins_ativos,
    (SELECT COUNT(*) FROM noa_conversations) as total_conversas,
    (SELECT COUNT(DISTINCT session_id) FROM noa_conversations) as sessoes_unicas,
    (SELECT COUNT(*) FROM ai_learning) as aprendizados_ia,
    (SELECT AVG(confidence_score) FROM ai_learning) as confianca_media_ia,
    (SELECT COUNT(*) FROM blocos_imre WHERE ativo = true) as blocos_imre_ativos;

-- ========================================

-- ✅ PROBLEMA 9: Função para buscar contexto do usuário
-- ========================================

CREATE OR REPLACE FUNCTION get_user_context(user_id_param UUID)
RETURNS JSONB AS $$
DECLARE
    user_context JSONB;
BEGIN
    SELECT jsonb_build_object(
        'user_id', nu.user_id,
        'name', COALESCE(na.admin_name, nu.name, au.email),
        'email', au.email,
        'user_type', nu.user_type,
        'permission_level', nu.permission_level,
        'is_admin', CASE WHEN nu.permission_level = 5 THEN true ELSE false END,
        'total_conversations', (
            SELECT COUNT(*) FROM noa_conversations 
            WHERE user_id = user_id_param
        ),
        'last_conversation', (
            SELECT created_at FROM noa_conversations 
            WHERE user_id = user_id_param 
            ORDER BY created_at DESC 
            LIMIT 1
        ),
        'profile_data', nu.profile_data
    ) INTO user_context
    FROM noa_users nu
    LEFT JOIN auth.users au ON au.id = nu.user_id
    LEFT JOIN noa_admins na ON na.user_id = nu.user_id
    WHERE nu.user_id = user_id_param;
    
    RETURN user_context;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================

-- ✅ PROBLEMA 10: Limpar dados de teste/duplicados
-- ========================================

-- Remover conversas sem session_id válido
DELETE FROM noa_conversations 
WHERE session_id IS NULL OR session_id = '';

-- Remover aprendizados duplicados (manter o mais recente)
DELETE FROM ai_learning a
WHERE a.id NOT IN (
    SELECT DISTINCT ON (keyword, user_message) id
    FROM ai_learning
    ORDER BY keyword, user_message, confidence_score DESC, created_at DESC
);

-- ========================================
-- ✅ RESUMO DAS MELHORIAS:
-- ========================================
-- 
-- 1. ✅ Adiciona coluna 'name' em noa_users
-- 2. ✅ Adiciona coluna 'profile_data' em noa_users
-- 3. ✅ Cria índices para performance
-- 4. ✅ Função get_user_name() para buscar nome
-- 5. ✅ View noa_user_profiles (perfil completo)
-- 6. ✅ Função save_user_profile() para salvar
-- 7. ✅ Trigger auto-update de updated_at
-- 8. ✅ View noa_real_time_stats (estatísticas)
-- 9. ✅ Função get_user_context() (contexto completo)
-- 10. ✅ Limpeza de dados duplicados
--
-- ========================================
-- 🚀 EXECUTE ESTE SQL NO SUPABASE!
-- ========================================

