-- =====================================================
-- CORREÇÃO FINAL DA TABELA USERS
-- Script simples e direto
-- =====================================================

-- 1. ADICIONAR COLUNAS BÁSICAS PRIMEIRO
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'patient';
ALTER TABLE users ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'patient';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. ADICIONAR COLUNAS OPCIONAIS
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT;
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
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- 3. HABILITAR RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS RLS BÁSICAS
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

-- 5. CRIAR TRIGGER PARA TIMESTAMP
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

-- 6. VERIFICAR CONSTRAINT DA COLUNA ROLE
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND conname LIKE '%role%';

-- 7. INSERIR USUÁRIO DE TESTE (COM ROLE CORRETO)
INSERT INTO users (
  id,
  email,
  name,
  role,
  user_type,
  is_active,
  email_verified,
  created_at,
  updated_at
) VALUES (
  'd3c6e0b9-6418-4021-a961-7e6e7d935356',
  'teste@noaesperanza.com',
  'Usuário Teste',
  'patient',  -- <- role definido como 'patient'
  'patient',  -- <- user_type também como 'patient'
  true,
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 8. VERIFICAR RESULTADO
SELECT 
    'users' as tabela,
    COUNT(*) as total_registros
FROM users;

-- 9. MOSTRAR ESTRUTURA
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
