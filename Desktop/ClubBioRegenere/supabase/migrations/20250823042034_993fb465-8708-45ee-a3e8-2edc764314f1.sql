-- 1. Primeiro, criar constraint única se não existir
ALTER TABLE public.subscribers 
ADD CONSTRAINT IF NOT EXISTS subscribers_user_id_unique UNIQUE (user_id);

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
  -- Só executa se for uma inserção de um novo usuário
  IF TG_OP = 'INSERT' THEN
    -- Verificar se o usuário é admin ou foi criado por admin
    IF NEW.email IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com') THEN
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
        
    ELSE
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
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 5. Criar trigger para executar a função quando um perfil é criado
DROP TRIGGER IF EXISTS on_profile_created_create_subscriber ON public.profiles;
CREATE TRIGGER on_profile_created_create_subscriber
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.create_vip_subscriber_for_admin_created_users();

-- 6. Dar acesso VIP retroativo para admins e criar registros básicos para outros
INSERT INTO public.subscribers (user_id, email, subscribed, subscription_tier, subscription_end)
SELECT 
  p.user_id, 
  p.email, 
  CASE WHEN p.email IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com') THEN true ELSE false END,
  CASE WHEN p.email IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com') THEN 'VIP Admin Created' ELSE 'Free' END,
  CASE WHEN p.email IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com') THEN NULL ELSE NULL END
FROM public.profiles p
WHERE NOT EXISTS (SELECT 1 FROM public.subscribers s WHERE s.user_id = p.user_id);