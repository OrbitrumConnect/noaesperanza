-- Corrigir a função clean_duplicate_educational_plans para ter search_path seguro
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