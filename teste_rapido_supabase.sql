-- ========================================
-- 🧪 TESTE RÁPIDO SUPABASE - NÔA ESPERANZA
-- Execute linha por linha no SQL Editor
-- ========================================

-- 1️⃣ VERIFICAR SE TABELA EXISTE
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'noa_users'
) as tabela_existe;

-- Resultado esperado: true
-- Se false, execute: noa_esperanza_system_supabase.sql

-- ========================================

-- 2️⃣ VER ESTRUTURA DA TABELA
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'noa_users'
ORDER BY ordinal_position;

-- Resultado esperado:
-- id, user_id, user_type, name, profile_data, created_at, updated_at

-- ========================================

-- 3️⃣ CONTAR USUÁRIOS
SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN user_type = 'paciente' THEN 1 END) as pacientes,
    COUNT(CASE WHEN user_type = 'profissional' THEN 1 END) as profissionais
FROM noa_users;

-- ========================================

-- 4️⃣ VER TODOS OS USUÁRIOS
SELECT 
    id,
    user_id,
    user_type,
    name,
    profile_data,
    created_at
FROM noa_users
ORDER BY created_at DESC
LIMIT 10;

-- ========================================

-- 5️⃣ VERIFICAR RLS (Row Level Security)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_ativo
FROM pg_tables 
WHERE tablename = 'noa_users';

-- Se rls_ativo = true e você não consegue ver dados:
-- DESABILITAR TEMPORARIAMENTE (APENAS TESTE LOCAL):
-- ALTER TABLE noa_users DISABLE ROW LEVEL SECURITY;

-- ========================================

-- 6️⃣ VERIFICAR USUÁRIOS AUTENTICADOS
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- ========================================

-- 7️⃣ VERIFICAR LINKAGEM (auth.users ↔ noa_users)
SELECT 
    au.id as auth_user_id,
    au.email,
    nu.id as noa_user_id,
    nu.name,
    nu.user_type
FROM auth.users au
LEFT JOIN noa_users nu ON nu.user_id = au.id
ORDER BY au.created_at DESC
LIMIT 10;

-- Se houver auth.users SEM noa_users correspondente:
-- Há usuários cadastrados mas não linkados!

-- ========================================

-- 8️⃣ INSERIR USUÁRIO DE TESTE (se necessário)
INSERT INTO noa_users (user_id, user_type, name, profile_data)
VALUES (
    gen_random_uuid(), 
    'paciente', 
    'Pedro Passos - Teste',
    '{"email": "phpg69@gmail.com", "created_at": "2025-01-01"}'::jsonb
)
RETURNING *;

-- ========================================

-- 9️⃣ LINKAR USUÁRIO AUTENTICADO EXISTENTE
-- Primeiro, pegue o user_id do auth.users (passo 6)
-- Depois execute (substitua os valores):

/*
INSERT INTO noa_users (user_id, user_type, name, profile_data)
VALUES (
    'COLE_AQUI_O_USER_ID_DO_AUTH_USERS', 
    'paciente', 
    'Seu Nome Completo',
    '{"email": "seu@email.com"}'::jsonb
)
ON CONFLICT (user_id) DO UPDATE
SET name = EXCLUDED.name,
    profile_data = EXCLUDED.profile_data;
*/

-- ========================================

-- 🔟 VERIFICAR POLÍTICAS RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'noa_users';

-- ========================================

-- 1️⃣1️⃣ LIMPAR USUÁRIOS DE TESTE (CUIDADO!)
/*
DELETE FROM noa_users 
WHERE name LIKE '%Teste%';
*/

-- ========================================

-- 1️⃣2️⃣ REATIVAR RLS (APÓS TESTES)
/*
ALTER TABLE noa_users ENABLE ROW LEVEL SECURITY;
*/

-- ========================================
-- ✅ FIM DOS TESTES
-- ========================================

-- 📊 RESUMO DO QUE VERIFICAR:
-- ✅ Tabela noa_users existe
-- ✅ Tem registros (ou consegue inserir)
-- ✅ RLS não está bloqueando (desabilite para teste)
-- ✅ Usuários do auth.users estão linkados com noa_users
-- ✅ Chave API (ANON_KEY) está correta no .env

-- 🎯 PRÓXIMO PASSO:
-- Execute testSupabase() no console do navegador

