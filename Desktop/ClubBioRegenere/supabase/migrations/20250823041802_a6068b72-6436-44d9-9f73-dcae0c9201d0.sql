-- 1. Permitir que usuários criem seus próprios planos educacionais
DROP POLICY IF EXISTS "Users can create their own educational_plans" ON public.educational_plans;
CREATE POLICY "Users can create their own educational_plans" 
ON public.educational_plans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 2. Permitir que usuários atualizem seus próprios planos
DROP POLICY IF EXISTS "Users can update their own educational_plans" ON public.educational_plans;
CREATE POLICY "Users can update their own educational_plans" 
ON public.educational_plans 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 3. Criar função para dar acesso VIP automático para usuários criados pelos admins
CREATE OR REPLACE FUNCTION public.create_vip_subscriber_for_admin_created_users()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Só executa se for uma inserção de um novo usuário
  IF TG_OP = 'INSERT' THEN
    -- Verificar se o usuário foi criado por um admin (baseado no email dos admins)
    -- Ou se o usuário é um dos emails admin
    IF NEW.email IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com') 
       OR EXISTS (
         SELECT 1 FROM auth.users 
         WHERE id = auth.uid() 
         AND email IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com')
       ) THEN
      
      -- Inserir como subscriber VIP com acesso indefinido
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
        NULL  -- Sem data de expiração
      )
      ON CONFLICT (user_id) DO UPDATE SET
        subscribed = true,
        subscription_tier = 'VIP Admin Created',
        subscription_end = NULL;
        
    END IF;
    
    -- Para outros usuários, criar um registro básico para evitar erros
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
  
  RETURN NEW;
END;
$function$;

-- 4. Criar trigger para executar a função quando um perfil é criado
DROP TRIGGER IF EXISTS on_profile_created_create_subscriber ON public.profiles;
CREATE TRIGGER on_profile_created_create_subscriber
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_vip_subscriber_for_admin_created_users();

-- 5. Dar acesso VIP retroativo para usuários já existentes criados pelos admins
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Para todos os perfis existentes, verificar se devem ter acesso VIP
  FOR profile_record IN 
    SELECT user_id, email FROM public.profiles 
    WHERE email IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com')
  LOOP
    -- Inserir ou atualizar subscriber
    INSERT INTO public.subscribers (
      user_id, 
      email, 
      subscribed, 
      subscription_tier, 
      subscription_end
    ) 
    VALUES (
      profile_record.user_id, 
      profile_record.email, 
      true, 
      'VIP Admin Created', 
      NULL
    )
    ON CONFLICT (user_id) DO UPDATE SET
      subscribed = true,
      subscription_tier = 'VIP Admin Created',
      subscription_end = NULL;
  END LOOP;
  
  -- Para outros usuários existentes, criar registro básico
  FOR profile_record IN 
    SELECT user_id, email FROM public.profiles 
    WHERE email NOT IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com')
  LOOP
    INSERT INTO public.subscribers (
      user_id, 
      email, 
      subscribed, 
      subscription_tier
    ) 
    VALUES (
      profile_record.user_id, 
      profile_record.email, 
      false, 
      'Free'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END
$$;