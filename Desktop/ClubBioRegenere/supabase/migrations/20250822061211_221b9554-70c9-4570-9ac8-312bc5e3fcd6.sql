-- Corrigir função restante que pode estar sem search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Corrigir função clean_duplicate_educational_plans se existir
CREATE OR REPLACE FUNCTION public.clean_duplicate_educational_plans()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Remove planos anteriores do mesmo usuário com mesmo status para evitar duplicatas
    DELETE FROM educational_plans 
    WHERE user_id = NEW.user_id 
    AND status = NEW.status 
    AND id != NEW.id
    AND created_at < NEW.created_at;
    
    RETURN NEW;
END;
$function$;

-- Corrigir função check_password_strength se existir
CREATE OR REPLACE FUNCTION public.check_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Add custom password strength checks
  RETURN 
    length(password) >= 12 AND  -- Minimum 12 characters
    password ~ '[A-Z]' AND      -- At least one uppercase letter
    password ~ '[a-z]' AND      -- At least one lowercase letter
    password ~ '[0-9]' AND      -- At least one number
    password ~ '[!@#$%^&*()]';  -- At least one special character
END;
$function$;