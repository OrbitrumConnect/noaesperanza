-- Adicionar usuário iaianoaesperanza@gmail.com como admin
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se o usuário existe
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'iaianoaesperanza@gmail.com';

-- 2. Atualizar metadata do usuário para admin
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'iaianoaesperanza@gmail.com';

-- 3. Verificar se foi atualizado
SELECT id, email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'iaianoaesperanza@gmail.com';

-- 4. Verificar estrutura da tabela profiles primeiro
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND table_schema = 'public';

-- 5. Se necessário, criar/atualizar perfil na tabela profiles
INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com'),
  (SELECT id FROM auth.users WHERE email = 'iaianoaesperanza@gmail.com'),
  'iaianoaesperanza@gmail.com',
  'IA NOA Esperanza',
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  full_name = 'IA NOA Esperanza',
  email = 'iaianoaesperanza@gmail.com',
  updated_at = NOW();

-- 6. Verificar perfil criado
SELECT * FROM public.profiles 
WHERE email = 'iaianoaesperanza@gmail.com';
