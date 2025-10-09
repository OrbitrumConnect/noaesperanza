-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔧 SCRIPT DE VERIFICAÇÃO E CRIAÇÃO DE TABELAS BÁSICAS
-- Nôa Esperanza - Estrutura Mínima para Funcionamento
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. VERIFICAR TABELAS EXISTENTES
-- ═══════════════════════════════════════════════════════════════════════════════

SELECT 
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. CRIAR TABELA NOA_USERS (se não existir)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.noa_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT UNIQUE,
    user_type TEXT CHECK (user_type IN ('paciente', 'medico', 'estudante', 'profissional', 'admin')),
    profile_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_noa_users_user_id ON public.noa_users(user_id);
CREATE INDEX IF NOT EXISTS idx_noa_users_email ON public.noa_users(email);
CREATE INDEX IF NOT EXISTS idx_noa_users_user_type ON public.noa_users(user_type);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. CRIAR TABELA USER_PROFILES (fallback legado)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. POLÍTICAS RLS PERMISSIVAS (DESENVOLVIMENTO)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ativar RLS
ALTER TABLE public.noa_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "noa_users_select_policy" ON public.noa_users;
DROP POLICY IF EXISTS "noa_users_insert_policy" ON public.noa_users;
DROP POLICY IF EXISTS "noa_users_update_policy" ON public.noa_users;
DROP POLICY IF EXISTS "user_profiles_select_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON public.user_profiles;

-- Criar políticas PERMISSIVAS para desenvolvimento
-- noa_users
CREATE POLICY "noa_users_select_policy" ON public.noa_users
    FOR SELECT
    USING (true); -- ⚠️ PERMISSIVO - ajustar para produção

CREATE POLICY "noa_users_insert_policy" ON public.noa_users
    FOR INSERT
    WITH CHECK (true); -- ⚠️ PERMISSIVO - ajustar para produção

CREATE POLICY "noa_users_update_policy" ON public.noa_users
    FOR UPDATE
    USING (true); -- ⚠️ PERMISSIVO - ajustar para produção

-- user_profiles
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
    FOR SELECT
    USING (true); -- ⚠️ PERMISSIVO - ajustar para produção

CREATE POLICY "user_profiles_insert_policy" ON public.user_profiles
    FOR INSERT
    WITH CHECK (true); -- ⚠️ PERMISSIVO - ajustar para produção

CREATE POLICY "user_profiles_update_policy" ON public.user_profiles
    FOR UPDATE
    USING (true); -- ⚠️ PERMISSIVO - ajustar para produção

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. CRIAR TABELA KNOWLEDGE_BASE (se não existir)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id TEXT UNIQUE,
    title TEXT NOT NULL,
    content TEXT,
    file_type TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_knowledge_base_document_id ON public.knowledge_base(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_uploaded_by ON public.knowledge_base(uploaded_by);

-- RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "knowledge_base_select_policy" ON public.knowledge_base;
CREATE POLICY "knowledge_base_select_policy" ON public.knowledge_base
    FOR SELECT
    USING (true); -- ⚠️ PERMISSIVO

DROP POLICY IF EXISTS "knowledge_base_insert_policy" ON public.knowledge_base;
CREATE POLICY "knowledge_base_insert_policy" ON public.knowledge_base
    FOR INSERT
    WITH CHECK (true); -- ⚠️ PERMISSIVO

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. CRIAR TABELA CONVERSATION_HISTORY (se não existir)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.conversation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_message TEXT,
    assistant_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON public.conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at ON public.conversation_history(created_at DESC);

-- RLS
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversation_history_select_policy" ON public.conversation_history;
CREATE POLICY "conversation_history_select_policy" ON public.conversation_history
    FOR SELECT
    USING (true); -- ⚠️ PERMISSIVO

DROP POLICY IF EXISTS "conversation_history_insert_policy" ON public.conversation_history;
CREATE POLICY "conversation_history_insert_policy" ON public.conversation_history
    FOR INSERT
    WITH CHECK (true); -- ⚠️ PERMISSIVO

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. INSERIR USUÁRIOS ADMIN (se não existirem)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Dr. Ricardo Valença
INSERT INTO public.noa_users (user_id, name, email, user_type, profile_data)
VALUES (
    'da93a357-8967-4db5-b6fd-48c83f66c384'::uuid,
    'Dr. Ricardo Valença',
    'iaianoaesperanza@gmail.com',
    'admin',
    '{"role": "admin", "specialty": "nefrologia", "accessLevel": 5}'::jsonb
)
ON CONFLICT (email) DO UPDATE
SET 
    name = EXCLUDED.name,
    user_type = EXCLUDED.user_type,
    profile_data = EXCLUDED.profile_data,
    updated_at = NOW();

-- Dr. Eduardo Faveret
INSERT INTO public.noa_users (name, email, user_type, profile_data)
VALUES (
    'Dr. Eduardo Faveret',
    'eduardoscfaveret@gmail.com',
    'admin',
    '{"role": "admin", "accessLevel": 5}'::jsonb
)
ON CONFLICT (email) DO UPDATE
SET 
    name = EXCLUDED.name,
    user_type = EXCLUDED.user_type,
    profile_data = EXCLUDED.profile_data,
    updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. VERIFICAR CRIAÇÃO
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ver tabelas criadas
SELECT 
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('noa_users', 'user_profiles', 'knowledge_base', 'conversation_history')
ORDER BY tablename;

-- Ver políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Ver usuários admin
SELECT 
    id,
    name,
    email,
    user_type,
    profile_data,
    created_at
FROM public.noa_users
WHERE user_type = 'admin';

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ SCRIPT COMPLETO
-- ═══════════════════════════════════════════════════════════════════════════════

-- INSTRUÇÕES:
-- 1. Copie este script
-- 2. Acesse Supabase Dashboard → SQL Editor
-- 3. Cole e execute
-- 4. Verifique os resultados das queries SELECT finais
-- 5. Reinicie a aplicação

-- NOTA: As políticas RLS estão PERMISSIVAS para desenvolvimento.
-- Para produção, ajuste as policies para:
--   USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id)
