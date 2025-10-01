-- ========================================
-- 🔧 TRANSFORMAR noa_users de VIEW para TABELA
-- ========================================

-- PASSO 1: Salvar dados atuais
CREATE TABLE IF NOT EXISTS noa_users_temp AS
SELECT * FROM noa_users;

-- PASSO 2: Dropar a VIEW (CASCADE remove dependências)
DROP VIEW IF EXISTS noa_users CASCADE;

-- PASSO 3: Criar TABELA REAL com estrutura completa
CREATE TABLE noa_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('aluno', 'profissional', 'paciente')),
    permission_level INTEGER DEFAULT 1 CHECK (permission_level BETWEEN 1 AND 5),
    profile_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 4: Restaurar dados
INSERT INTO noa_users (id, user_id, user_type, permission_level, created_at, updated_at)
SELECT 
    id, 
    user_id, 
    user_type, 
    permission_level, 
    created_at, 
    updated_at
FROM noa_users_temp
ON CONFLICT (user_id) DO NOTHING;

-- PASSO 5: Preencher coluna 'name' com dados de admin
UPDATE noa_users nu
SET name = na.admin_name,
    profile_data = jsonb_build_object(
        'email', au.email,
        'is_admin', true,
        'admin_key', na.admin_key
    )
FROM noa_admins na
JOIN auth.users au ON au.id = na.user_id
WHERE nu.user_id = na.user_id;

-- PASSO 6: Preencher 'name' dos usuários sem admin (usa email)
UPDATE noa_users nu
SET name = COALESCE(nu.name, SPLIT_PART(au.email, '@', 1)),
    profile_data = COALESCE(
        nu.profile_data, 
        jsonb_build_object('email', au.email)
    )
FROM auth.users au
WHERE nu.user_id = au.id
  AND nu.name IS NULL;

-- PASSO 7: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_noa_users_user_id ON noa_users(user_id);
CREATE INDEX IF NOT EXISTS idx_noa_users_type ON noa_users(user_type);
CREATE INDEX IF NOT EXISTS idx_noa_users_permission ON noa_users(permission_level);
CREATE INDEX IF NOT EXISTS idx_noa_users_name ON noa_users(name);

-- PASSO 8: Desabilitar RLS (para testes)
ALTER TABLE noa_users DISABLE ROW LEVEL SECURITY;

-- PASSO 9: Criar trigger para auto-update
DROP TRIGGER IF EXISTS update_noa_users_updated_at ON noa_users;
CREATE TRIGGER update_noa_users_updated_at
    BEFORE UPDATE ON noa_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- PASSO 10: Limpar tabela temporária
DROP TABLE IF EXISTS noa_users_temp;

-- PASSO 11: VERIFICAR RESULTADO
SELECT 
    user_id,
    name,
    user_type,
    permission_level,
    profile_data,
    created_at
FROM noa_users
ORDER BY permission_level DESC, created_at DESC;

-- ========================================
-- ✅ PRONTO! Agora noa_users é TABELA
-- com 'name' e 'profile_data'!
-- ========================================

