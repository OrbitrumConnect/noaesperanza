-- Corrigir warnings de segurança para produção
-- 1. Corrigir search_path em funções existentes

-- Atualizar função has_role para ter search_path seguro
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Atualizar função get_user_role para ter search_path seguro  
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1
$function$;

-- Atualizar função handle_new_user para ter search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_role app_role := 'patient';
BEGIN
  -- Se é operação de UPDATE, apenas retorna o registro atualizado
  IF TG_OP = 'UPDATE' THEN
    RETURN NEW;
  END IF;
  
  -- Se é operação de INSERT, executa lógica original
  IF TG_OP = 'INSERT' THEN
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
  END IF;

  RETURN NEW;
END;
$function$;