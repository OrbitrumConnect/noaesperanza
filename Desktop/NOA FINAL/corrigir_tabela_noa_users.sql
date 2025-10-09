-- ═══════════════════════════════════════════════════════════════════════════════
-- 🔧 CORRIGIR TABELA NOA_USERS - ADICIONAR COLUNA EMAIL
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. ADICIONAR COLUNA EMAIL (se não existir)
-- ═══════════════════════════════════════════════════════════════════════════════

ALTER TABLE public.noa_users
ADD COLUMN IF NOT EXISTS email TEXT;

-- Adicionar constraint UNIQUE
ALTER TABLE public.noa_users
DROP CONSTRAINT IF EXISTS noa_users_email_unique;

ALTER TABLE public.noa_users
ADD CONSTRAINT noa_users_email_unique UNIQUE (email);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_noa_users_email ON public.noa_users(email);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. ATUALIZAR/INSERIR USUÁRIOS ADMIN
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
-- 3. CRIAR TABELA USER_PROFILES (se não existir)
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

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. POLÍTICAS RLS PERMISSIVAS (DESENVOLVIMENTO)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ativar RLS
ALTER TABLE public.noa_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes
DROP POLICY IF EXISTS "noa_users_select_policy" ON public.noa_users;
DROP POLICY IF EXISTS "noa_users_insert_policy" ON public.noa_users;
DROP POLICY IF EXISTS "noa_users_update_policy" ON public.noa_users;
DROP POLICY IF EXISTS "user_profiles_select_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON public.user_profiles;

-- Criar políticas PERMISSIVAS
CREATE POLICY "noa_users_select_policy" ON public.noa_users
    FOR SELECT USING (true);

CREATE POLICY "noa_users_insert_policy" ON public.noa_users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "noa_users_update_policy" ON public.noa_users
    FOR UPDATE USING (true);

CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "user_profiles_insert_policy" ON public.user_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "user_profiles_update_policy" ON public.user_profiles
    FOR UPDATE USING (true);

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

CREATE INDEX IF NOT EXISTS idx_knowledge_base_document_id ON public.knowledge_base(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_base_uploaded_by ON public.knowledge_base(uploaded_by);

ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "knowledge_base_select_policy" ON public.knowledge_base;
CREATE POLICY "knowledge_base_select_policy" ON public.knowledge_base
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "knowledge_base_insert_policy" ON public.knowledge_base;
CREATE POLICY "knowledge_base_insert_policy" ON public.knowledge_base
    FOR INSERT WITH CHECK (true);

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

CREATE INDEX IF NOT EXISTS idx_conversation_history_user_id ON public.conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created_at ON public.conversation_history(created_at DESC);

ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversation_history_select_policy" ON public.conversation_history;
CREATE POLICY "conversation_history_select_policy" ON public.conversation_history
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "conversation_history_insert_policy" ON public.conversation_history;
CREATE POLICY "conversation_history_insert_policy" ON public.conversation_history
    FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. VERIFICAR RESULTADO
-- ═══════════════════════════════════════════════════════════════════════════════

-- Ver estrutura da tabela noa_users
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'noa_users'
ORDER BY ordinal_position;

-- Ver usuários admin
SELECT 
    id,
    user_id,
    name,
    email,
    user_type,
    profile_data,
    created_at
FROM public.noa_users
WHERE user_type = 'admin';

-- ═══════════════════════════════════════════════════════════════════════════════
-- ✅ SCRIPT CORRIGIDO
-- ═══════════════════════════════════════════════════════════════════════════════
