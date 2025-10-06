-- Corrigir o trigger handle_new_user para tratar UPDATE adequadamente
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
$function$