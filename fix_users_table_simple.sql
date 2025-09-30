-- =====================================================
-- CORREÇÃO SIMPLES DA TABELA USERS
-- Adiciona colunas faltantes na tabela users existente
-- =====================================================

-- 1. ADICIONAR COLUNAS FALTANTES NA TABELA USERS
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'patient';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS zip_code TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS medical_conditions TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS allergies TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_medications TEXT[];
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_provider TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS insurance_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language TEXT DEFAULT 'pt-BR';
ALTER TABLE users ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/Sao_Paulo';

-- 2. ADICIONAR CONSTRAINT PARA USER_TYPE (SE NÃO EXISTIR)
DO $$ 
BEGIN
    -- Tentar adicionar constraint, ignorar se já existir
    BEGIN
        ALTER TABLE users ADD CONSTRAINT users_user_type_check 
        CHECK (user_type IN ('patient', 'doctor', 'admin'));
    EXCEPTION
        WHEN duplicate_object THEN
            -- Constraint já existe, continuar
            NULL;
    END;
END $$;

-- 3. HABILITAR RLS SE NÃO ESTIVER HABILITADO
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS RLS SIMPLES
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Allow public read access to users" ON users;
DROP POLICY IF EXISTS "Allow anonymous user insert" ON users;

CREATE POLICY "Users can view their own profile" ON users 
FOR SELECT USING (id::uuid = auth.uid() OR user_type = 'admin');

CREATE POLICY "Users can update their own profile" ON users 
FOR UPDATE USING (id::uuid = auth.uid());

CREATE POLICY "Allow public read access to users" ON users 
FOR SELECT USING (true);

CREATE POLICY "Allow anonymous user insert" ON users 
FOR INSERT WITH CHECK (true);

-- 5. CRIAR TRIGGER PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_users_updated_at();

-- 6. INSERIR USUÁRIO DE TESTE (SE NÃO EXISTIR)
INSERT INTO users (
  id,
  email,
  name,
  user_type,
  is_active,
  email_verified
) VALUES (
  'd3c6e0b9-6418-4021-a961-7e6e7d935356',
  'teste@noaesperanza.com',
  'Usuário Teste',
  'patient',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- 7. VERIFICAR RESULTADO
SELECT 
    'users' as tabela,
    COUNT(*) as total_registros,
    string_agg(DISTINCT user_type, ', ') as tipos_usuarios
FROM users;

-- 8. MOSTRAR ESTRUTURA DA TABELA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- =====================================================
-- CORREÇÃO CONCLUÍDA!
-- =====================================================
