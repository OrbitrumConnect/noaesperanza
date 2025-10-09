-- ============================================
-- ADICIONAR DR. EDUARDO FAVERET COMO ADMIN
-- Email: eduardoscfaveret@gmail.com
-- ============================================

-- 1. Verificar se o usuário já existe no auth.users
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'eduardoscfaveret@gmail.com';

-- 2. Atualizar metadata do usuário para admin (se já existir)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
)
WHERE email = 'eduardoscfaveret@gmail.com';

-- 3. Inserir/Atualizar na tabela users (compatibilidade)
INSERT INTO users (
    id,
    email,
    name,
    role,
    specialty,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com'),
    'eduardoscfaveret@gmail.com',
    'Dr. Eduardo de Sá Campello Faveret',
    'admin',
    'neurologia',
    NOW(),
    NOW()
) ON CONFLICT (id) 
DO UPDATE SET
    role = 'admin',
    name = 'Dr. Eduardo de Sá Campello Faveret',
    updated_at = NOW();

-- 4. Inserir/Atualizar na tabela noa_users (nova estrutura)
INSERT INTO noa_users (
    user_id,
    user_type,
    name,
    profile_data,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com'),
    'profissional',
    'Dr. Eduardo de Sá Campello Faveret',
    jsonb_build_object(
        'email', 'eduardoscfaveret@gmail.com',
        'role', 'admin',
        'specialty', 'neurologia',
        'access_level', 5,
        'permissions', '["read", "write", "execute", "admin", "clinical", "gpt_builder"]',
        'created_at', NOW()::text
    ),
    NOW(),
    NOW()
) ON CONFLICT (user_id) 
DO UPDATE SET
    user_type = 'profissional',
    name = 'Dr. Eduardo de Sá Campello Faveret',
    profile_data = jsonb_build_object(
        'email', 'eduardoscfaveret@gmail.com',
        'role', 'admin',
        'specialty', 'neurologia',
        'access_level', 5,
        'permissions', '["read", "write", "execute", "admin", "clinical", "gpt_builder"]',
        'updated_at', NOW()::text
    ),
    updated_at = NOW();

-- 5. Inserir/Atualizar na tabela user_profiles (sistema de reconhecimento)
INSERT INTO user_profiles (
    email,
    name,
    role,
    access_level,
    personalized_greeting,
    voice_settings,
    permissions,
    is_active,
    created_at,
    updated_at
) VALUES (
    'eduardoscfaveret@gmail.com',
    'Dr. Eduardo de Sá Campello Faveret',
    'admin',
    5,
    'Olá, Dr. Eduardo! Acesso administrativo liberado. Como deseja prosseguir?',
    jsonb_build_object(
        'voice', 'Microsoft Maria - Portuguese (Brazil)',
        'rate', 0.85,
        'pitch', 1.1,
        'volume', 0.8
    ),
    ARRAY['read', 'write', 'execute', 'admin', 'clinical', 'gpt_builder'],
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) 
DO UPDATE SET
    role = 'admin',
    access_level = 5,
    permissions = ARRAY['read', 'write', 'execute', 'admin', 'clinical', 'gpt_builder'],
    updated_at = NOW();

-- 6. Verificar se foi inserido corretamente
SELECT 
    u.email,
    u.name,
    u.role,
    nu.user_type,
    nu.name as noa_name,
    up.access_level,
    up.permissions
FROM auth.users u
LEFT JOIN users u2 ON u2.id = u.id
LEFT JOIN noa_users nu ON nu.user_id = u.id
LEFT JOIN user_profiles up ON up.email = u.email
WHERE u.email = 'eduardoscfaveret@gmail.com';

-- ============================================
-- RESULTADO ESPERADO:
-- email: eduardoscfaveret@gmail.com
-- name: Dr. Eduardo de Sá Campello Faveret
-- role: admin
-- access_level: 5
-- permissions: [read, write, execute, admin, clinical, gpt_builder]
-- ============================================
