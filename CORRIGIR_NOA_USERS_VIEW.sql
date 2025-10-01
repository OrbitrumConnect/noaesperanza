-- ========================================
-- 🔧 CORREÇÃO: noa_users é uma VIEW!
-- Precisa DROP e recriar como TABELA
-- ========================================

-- 1. VER O QUE A VIEW ATUAL FAZ
SELECT pg_get_viewdef('noa_users', true);

-- 2. SALVAR DADOS EXISTENTES (BACKUP)
CREATE TABLE IF NOT EXISTS noa_users_backup AS
SELECT * FROM noa_users;

-- 3. DROPAR A VIEW
DROP VIEW IF EXISTS noa_users CASCADE;

-- 4. CRIAR TABELA REAL com as colunas corretas
CREATE TABLE noa_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    name TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('aluno', 'profissional', 'paciente')),
    permission_level INTEGER DEFAULT 1 CHECK (permission_level BETWEEN 1 AND 5),
    profile_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RESTAURAR DADOS DO BACKUP
INSERT INTO noa_users (id, user_id, user_type, permission_level, created_at, updated_at)
SELECT id, user_id, user_type, permission_level, created_at, updated_at
FROM noa_users_backup
ON CONFLICT (user_id) DO NOTHING;

-- 6. ATUALIZAR com nomes dos admins
UPDATE noa_users nu
SET name = na.admin_name,
    profile_data = jsonb_build_object('email', au.email, 'is_admin', true)
FROM noa_admins na
JOIN auth.users au ON au.id = na.user_id
WHERE nu.user_id = na.user_id;

-- 7. ATUALIZAR com emails dos usuários normais
UPDATE noa_users nu
SET profile_data = jsonb_build_object('email', au.email)
FROM auth.users au
WHERE nu.user_id = au.id
  AND nu.name IS NULL;

-- 8. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_noa_users_user_id ON noa_users(user_id);
CREATE INDEX IF NOT EXISTS idx_noa_users_type ON noa_users(user_type);
CREATE INDEX IF NOT EXISTS idx_noa_users_permission ON noa_users(permission_level);

-- 9. RECRIAR RLS (DESATIVADO PARA TESTE)
ALTER TABLE noa_users DISABLE ROW LEVEL SECURITY;

-- 10. VERIFICAR RESULTADO
SELECT * FROM noa_users ORDER BY permission_level DESC, created_at DESC;

-- ========================================
-- ✅ PRONTO! Agora noa_users é uma TABELA
-- com as colunas 'name' e 'profile_data'
-- ========================================

