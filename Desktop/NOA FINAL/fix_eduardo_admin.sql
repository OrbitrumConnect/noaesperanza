-- ============================================
-- CORRIGIR DR. EDUARDO FAVERET COMO ADMIN
-- Erro: duplicate key value violates unique constraint "users_email_key"
-- ============================================

-- 1. Verificar o que já existe
SELECT 
    'auth.users' as tabela,
    id::text,
    email,
    raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email = 'eduardoscfaveret@gmail.com'

UNION ALL

SELECT 
    'users' as tabela,
    id::text,
    email,
    role
FROM users 
WHERE email = 'eduardoscfaveret@gmail.com'

UNION ALL

SELECT 
    'noa_users' as tabela,
    user_id::text,
    'N/A' as email,
    user_type as role
FROM noa_users 
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com')

UNION ALL

SELECT 
    'user_profiles' as tabela,
    id::text,
    email,
    role
FROM user_profiles 
WHERE email = 'eduardoscfaveret@gmail.com';

-- 2. Atualizar auth.users (se existir)
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    COALESCE(raw_user_meta_data, '{}'::jsonb),
    '{role}',
    '"admin"'::jsonb
)
WHERE email = 'eduardoscfaveret@gmail.com';

-- 3. Atualizar tabela users (usando UPDATE em vez de INSERT)
UPDATE users 
SET 
    role = 'admin',
    name = 'Dr. Eduardo de Sá Campello Faveret',
    specialty = 'neurologia',
    updated_at = NOW()
WHERE email = 'eduardoscfaveret@gmail.com';

-- 4. Atualizar noa_users (usando UPDATE em vez de INSERT)
UPDATE noa_users 
SET 
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
    updated_at = NOW()
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'eduardoscfaveret@gmail.com');

-- 5. Atualizar user_profiles (usando UPDATE em vez de INSERT)
UPDATE user_profiles 
SET 
    role = 'admin',
    access_level = 5,
    name = 'Dr. Eduardo de Sá Campello Faveret',
    personalized_greeting = 'Olá, Dr. Eduardo! Acesso administrativo liberado. Como deseja prosseguir?',
    voice_settings = jsonb_build_object(
        'voice', 'Microsoft Maria - Portuguese (Brazil)',
        'rate', 0.85,
        'pitch', 1.1,
        'volume', 0.8
    ),
    permissions = ARRAY['read', 'write', 'execute', 'admin', 'clinical', 'gpt_builder'],
    updated_at = NOW()
WHERE email = 'eduardoscfaveret@gmail.com';

-- 6. Se não existir em user_profiles, inserir
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
)
SELECT 
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
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE email = 'eduardoscfaveret@gmail.com'
);

-- 7. Verificar resultado final
SELECT 
    'RESULTADO FINAL' as status,
    u.email,
    u.raw_user_meta_data->>'role' as auth_role,
    u2.name as users_name,
    u2.role as users_role,
    nu.name as noa_name,
    nu.user_type as noa_type,
    up.name as profile_name,
    up.role as profile_role,
    up.access_level,
    up.permissions
FROM auth.users u
LEFT JOIN users u2 ON u2.email = u.email
LEFT JOIN noa_users nu ON nu.user_id = u.id
LEFT JOIN user_profiles up ON up.email = u.email
WHERE u.email = 'eduardoscfaveret@gmail.com';

-- ============================================
-- RESULTADO ESPERADO:
-- auth_role: admin
-- users_role: admin  
-- noa_type: profissional
-- profile_role: admin
-- access_level: 5
-- ============================================
