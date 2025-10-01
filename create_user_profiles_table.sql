-- 👤 TABELA DE PERFIS DE USUÁRIOS PERSONALIZADOS
-- Sistema de reconhecimento de identidade e personalização

-- 1. TABELA DE PERFIS DE USUÁRIOS
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'clinico', 'autor', 'profissional', 'paciente')),
  access_level INTEGER DEFAULT 1 CHECK (access_level BETWEEN 1 AND 5),
  personalized_greeting TEXT,
  voice_settings JSONB DEFAULT '{
    "voice": "Microsoft Maria - Portuguese (Brazil)",
    "rate": 1.0,
    "pitch": 1.0,
    "volume": 0.8
  }',
  permissions TEXT[] DEFAULT ARRAY['read'],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HABILITAR RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. POLÍTICAS RLS
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;

-- Usuários podem ver seu próprio perfil
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins podem ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'clinico')
    )
  );

-- Admins podem atualizar todos os perfis
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles up 
      WHERE up.user_id = auth.uid() 
      AND up.role IN ('admin', 'clinico')
    )
  );

-- 4. INSERIR PERFIS PADRÃO
INSERT INTO user_profiles (name, email, role, access_level, personalized_greeting, voice_settings, permissions) VALUES
(
  'Pedro Passos',
  'phpg69@gmail.com',
  'admin',
  4,
  'Olá, Pedro! Que bom ter você aqui. Como posso ajudar hoje?',
  '{
    "voice": "Microsoft Maria - Portuguese (Brazil)",
    "rate": 0.9,
    "pitch": 1.1,
    "volume": 0.8
  }',
  ARRAY['read', 'write', 'execute', 'admin']
),
(
  'Dr. Ricardo Valença',
  'iaianoaesperanza@gmail.com',
  'clinico',
  5,
  'Olá, Dr. Ricardo! Que bom ter você aqui. Como posso ajudar hoje?',
  '{
    "voice": "Microsoft Maria - Portuguese (Brazil)",
    "rate": 0.85,
    "pitch": 1.2,
    "volume": 0.8
  }',
  ARRAY['read', 'write', 'execute', 'admin', 'clinical']
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  access_level = EXCLUDED.access_level,
  personalized_greeting = EXCLUDED.personalized_greeting,
  voice_settings = EXCLUDED.voice_settings,
  permissions = EXCLUDED.permissions,
  updated_at = NOW();

-- 5. FUNÇÃO PARA BUSCAR PERFIL POR EMAIL
CREATE OR REPLACE FUNCTION get_user_profile_by_email(email_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  email TEXT,
  role TEXT,
  access_level INTEGER,
  personalized_greeting TEXT,
  voice_settings JSONB,
  permissions TEXT[],
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.name,
    up.email,
    up.role,
    up.access_level,
    up.personalized_greeting,
    up.voice_settings,
    up.permissions,
    up.is_active
  FROM user_profiles up
  WHERE up.email = email_param
  AND up.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. FUNÇÃO PARA ATUALIZAR PERFIL
CREATE OR REPLACE FUNCTION update_user_profile(
  email_param TEXT,
  name_param TEXT DEFAULT NULL,
  role_param TEXT DEFAULT NULL,
  access_level_param INTEGER DEFAULT NULL,
  personalized_greeting_param TEXT DEFAULT NULL,
  voice_settings_param JSONB DEFAULT NULL,
  permissions_param TEXT[] DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE user_profiles 
  SET 
    name = COALESCE(name_param, name),
    role = COALESCE(role_param, role),
    access_level = COALESCE(access_level_param, access_level),
    personalized_greeting = COALESCE(personalized_greeting_param, personalized_greeting),
    voice_settings = COALESCE(voice_settings_param, voice_settings),
    permissions = COALESCE(permissions_param, permissions),
    updated_at = NOW()
  WHERE email = email_param;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_access_level ON user_profiles(access_level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles(is_active);

-- 8. COMENTÁRIOS
COMMENT ON TABLE user_profiles IS 'Perfis personalizados de usuários para reconhecimento de identidade';
COMMENT ON COLUMN user_profiles.role IS 'Papel do usuário: admin, clinico, autor, profissional, paciente';
COMMENT ON COLUMN user_profiles.access_level IS 'Nível de acesso: 1-5 (5 = máximo)';
COMMENT ON COLUMN user_profiles.personalized_greeting IS 'Saudação personalizada para o usuário';
COMMENT ON COLUMN user_profiles.voice_settings IS 'Configurações de voz personalizadas';
COMMENT ON COLUMN user_profiles.permissions IS 'Lista de permissões do usuário';

-- 9. TESTE DAS FUNÇÕES
-- SELECT * FROM get_user_profile_by_email('phpg69@gmail.com');
-- SELECT * FROM get_user_profile_by_email('iaianoaesperanza@gmail.com');
-- SELECT update_user_profile('phpg69@gmail.com', 'Pedro Passos Atualizado', 'admin', 5);
