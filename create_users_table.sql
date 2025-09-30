-- =====================================================
-- CRIAÇÃO DA TABELA USERS PARA NOAGPT IMRE
-- Sistema de usuários compatível com o app
-- =====================================================

-- 1. CRIAR TABELA USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'doctor', 'admin')),
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

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 3. HABILITAR RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS RLS
-- Remover políticas existentes primeiro
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Doctors can view patient profiles" ON users;
DROP POLICY IF EXISTS "Admins can manage all users" ON users;

-- Políticas para usuários autenticados
CREATE POLICY "Users can view their own profile" ON users 
FOR SELECT USING (id::uuid = auth.uid());

CREATE POLICY "Users can update their own profile" ON users 
FOR UPDATE USING (id::uuid = auth.uid());

-- Políticas para médicos
CREATE POLICY "Doctors can view patient profiles" ON users 
FOR SELECT USING (
  user_type = 'patient' AND 
  EXISTS (
    SELECT 1 FROM users 
    WHERE id::uuid = auth.uid() 
    AND user_type = 'doctor'
  )
);

-- Políticas para admins
CREATE POLICY "Admins can manage all users" ON users 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id::uuid = auth.uid() 
    AND user_type = 'admin'
  )
);

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

-- 6. INSERIR USUÁRIO ADMIN PADRÃO (OPCIONAL)
INSERT INTO users (
  id,
  email,
  name,
  user_type,
  is_active,
  email_verified
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@noaesperanza.com',
  'Administrador Nôa Esperanza',
  'admin',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- 7. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE users IS 'Tabela de usuários do sistema Nôa Esperanza - pacientes, médicos e administradores';
COMMENT ON COLUMN users.user_type IS 'Tipo de usuário: patient, doctor, admin';
COMMENT ON COLUMN users.medical_conditions IS 'Array de condições médicas do paciente';
COMMENT ON COLUMN users.allergies IS 'Array de alergias do paciente';
COMMENT ON COLUMN users.current_medications IS 'Array de medicamentos atuais';

-- =====================================================
-- TABELA USERS CRIADA COM SUCESSO!
-- Compatível com o sistema Nôa Esperanza
-- =====================================================
