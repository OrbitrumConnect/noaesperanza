-- 1. Criar constraint única usando método compatível
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscribers_user_id_unique' 
        AND table_name = 'subscribers'
    ) THEN
        ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_user_id_unique UNIQUE (user_id);
    END IF;
END $$;

-- 2. Permitir que usuários criem seus próprios planos educacionais
DROP POLICY IF EXISTS "Users can create their own educational_plans" ON public.educational_plans;
CREATE POLICY "Users can create their own educational_plans" 
ON public.educational_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Permitir que usuários atualizem seus próprios planos
DROP POLICY IF EXISTS "Users can update their own educational_plans" ON public.educational_plans;
CREATE POLICY "Users can update their own educational_plans" 
ON public.educational_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Criar função para dar acesso VIP automático para usuários criados pelos admins
CREATE OR REPLACE FUNCTION public.create_vip_subscriber_for_admin_created_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.email IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com') THEN
      INSERT INTO public.subscribers (
        user_id, 
        email, 
        subscribed, 
        subscription_tier, 
        subscription_end
      ) 
      VALUES (
        NEW.user_id, 
        NEW.email, 
        true, 
        'VIP Admin Created', 
        NULL::timestamp with time zone
      )
      ON CONFLICT (user_id) DO UPDATE SET
        subscribed = true,
        subscription_tier = 'VIP Admin Created',
        subscription_end = NULL;
    ELSE
      INSERT INTO public.subscribers (
        user_id, 
        email, 
        subscribed, 
        subscription_tier
      ) 
      VALUES (
        NEW.user_id, 
        NEW.email, 
        false, 
        'Free'
      )
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 5. Criar trigger
DROP TRIGGER IF EXISTS on_profile_created_create_subscriber ON public.profiles;
CREATE TRIGGER on_profile_created_create_subscriber
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_vip_subscriber_for_admin_created_users();

-- 6. Criar subscribers para usuários existentes - admins primeiro
INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier, subscription_end)
SELECT 
  p.user_id, 
  p.email, 
  true,
  'VIP Admin Created',
  NULL::timestamp with time zone
FROM public.profiles p
WHERE p.email IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com')
AND NOT EXISTS (SELECT 1 FROM public.subscribers s WHERE s.user_id = p.user_id);

-- 7. Criar subscribers para outros usuários existentes
INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier)
SELECT 
  p.user_id, 
  p.email, 
  false,
  'Free'
FROM public.profiles p
WHERE p.email NOT IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com')
AND NOT EXISTS (SELECT 1 FROM public.subscribers s WHERE s.user_id = p.user_id);