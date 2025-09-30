-- =====================================================
-- VERIFICAÇÃO E CORREÇÃO DAS TABELAS NOAGPT IMRE
-- Script para verificar e corrigir tabelas existentes
-- =====================================================

-- 1. VERIFICAR TABELAS EXISTENTES
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'usuarios', 'user_profiles', 'profiles')
ORDER BY table_name;

-- 2. VERIFICAR ESTRUTURA DA TABELA USERS (SE EXISTIR)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE NOTICE 'Tabela users existe - verificando estrutura...';
        
        -- Verificar se tem as colunas necessárias
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'user_type') THEN
            RAISE NOTICE 'Adicionando coluna user_type...';
            ALTER TABLE users ADD COLUMN user_type TEXT DEFAULT 'patient';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name') THEN
            RAISE NOTICE 'Adicionando coluna name...';
            ALTER TABLE users ADD COLUMN name TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email') THEN
            RAISE NOTICE 'Adicionando coluna email...';
            ALTER TABLE users ADD COLUMN email TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
            RAISE NOTICE 'Adicionando coluna created_at...';
            ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
            RAISE NOTICE 'Adicionando coluna updated_at...';
            ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_active') THEN
            RAISE NOTICE 'Adicionando coluna is_active...';
            ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
            RAISE NOTICE 'Adicionando coluna email_verified...';
            ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
        END IF;
        
    ELSE
        RAISE NOTICE 'Tabela users não existe - criando...';
    END IF;
END $$;

-- 3. CRIAR TABELA USERS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  name TEXT,
  user_type TEXT DEFAULT 'patient' CHECK (user_type IN ('patient', 'doctor', 'admin')),
  avatar_url TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  medical_conditions TEXT[],
  allergies TEXT[],
  current_medications TEXT[],
  insurance_provider TEXT,
  insurance_number TEXT,
  preferred_language TEXT DEFAULT 'pt-BR',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. VERIFICAR E RENOMEAR TABELA USUARIOS (SE EXISTIR)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios') THEN
        RAISE NOTICE 'Tabela usuarios existe - verificando se pode ser renomeada...';
        
        -- Verificar se a tabela usuarios tem dados
        IF EXISTS (SELECT 1 FROM usuarios LIMIT 1) THEN
            RAISE NOTICE 'Tabela usuarios tem dados - mantendo ambas as tabelas';
        ELSE
            RAISE NOTICE 'Tabela usuarios está vazia - pode ser removida se necessário';
        END IF;
    END IF;
END $$;

-- 5. HABILITAR RLS NA TABELA USERS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR POLÍTICAS RLS PARA USERS
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

-- 7. CRIAR TRIGGER PARA ATUALIZAR TIMESTAMP
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

-- 8. INSERIR USUÁRIO DE TESTE (SE NÃO EXISTIR)
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

-- 9. VERIFICAR DADOS FINAIS
SELECT 
    'users' as tabela,
    COUNT(*) as total_registros
FROM users
UNION ALL
SELECT 
    'usuarios' as tabela,
    COUNT(*) as total_registros
FROM usuarios
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios');

-- 10. COMENTÁRIOS
COMMENT ON TABLE users IS 'Tabela principal de usuários do sistema Nôa Esperanza';
COMMENT ON TABLE usuarios IS 'Tabela alternativa de usuários (se existir)';

-- =====================================================
-- VERIFICAÇÃO E CORREÇÃO CONCLUÍDA!
-- =====================================================
