-- Verificar se o enum já existe, se não, criar
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'patient');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Criar tabela de roles de usuário
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'patient',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário tem role específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para obter role do usuário atual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- Atualizar tabela profiles existente para incluir email se não tiver
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Função para criar role automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role app_role := 'patient';
BEGIN
  -- Se é um dos emails de admin, definir como admin
  IF NEW.email IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com') THEN
    user_role := 'admin';
  END IF;

  -- Verificar se já existe perfil para este usuário
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
    -- Inserir perfil
    INSERT INTO public.profiles (user_id, email, full_name, name)
    VALUES (
      NEW.id, 
      NEW.email, 
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
      COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email)
    );
  END IF;

  -- Inserir role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Policies RLS para user_roles
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Políticas adicionais para profiles - permitir que admins vejam todos os perfis
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Inserir roles para os usuários existentes do Supabase
INSERT INTO public.user_roles (user_id, role)
SELECT 
  id,
  CASE 
    WHEN email IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com') THEN 'admin'::app_role
    ELSE 'patient'::app_role
  END as role
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_roles)
ON CONFLICT (user_id, role) DO NOTHING;

-- Atualizar perfis existentes com dados do auth.users se necessário
UPDATE public.profiles 
SET 
  email = auth_users.email,
  full_name = COALESCE(auth_users.raw_user_meta_data ->> 'full_name', auth_users.email),
  name = COALESCE(auth_users.raw_user_meta_data ->> 'name', auth_users.email)
FROM auth.users as auth_users
WHERE profiles.user_id = auth_users.id 
  AND (profiles.email IS NULL OR profiles.full_name IS NULL);