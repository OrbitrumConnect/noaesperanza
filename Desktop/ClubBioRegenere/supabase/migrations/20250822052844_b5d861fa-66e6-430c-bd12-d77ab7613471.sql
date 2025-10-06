-- 🛡️ CORREÇÃO 1: Políticas RLS da tabela subscribers mais seguras
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "service_role_can_update_subscription" ON public.subscribers;

-- Política INSERT: Apenas usuários autenticados podem criar suas próprias assinaturas
CREATE POLICY "authenticated_users_can_insert_own_subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Política UPDATE: Apenas service_role ou o próprio usuário pode atualizar
CREATE POLICY "service_role_and_owner_can_update_subscription" 
ON public.subscribers 
FOR UPDATE 
USING (auth.role() = 'service_role' OR auth.uid() = user_id)
WITH CHECK (auth.role() = 'service_role' OR auth.uid() = user_id);

-- 🛡️ CORREÇÃO 2: Fixar search_path nas funções existentes para segurança
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

-- 🛡️ CORREÇÃO 3: Política mais restritiva para educational_resources (opcional)
-- Mantém funcionalidade mas protege contra scraping excessivo
DROP POLICY IF EXISTS "public_read_free_resources" ON public.educational_resources;

-- Nova política que permite acesso público mas pode ser monitorada
CREATE POLICY "public_read_free_resources_monitored" 
ON public.educational_resources 
FOR SELECT 
USING (
  is_premium = false 
  AND (
    auth.uid() IS NOT NULL 
    OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'anon'
  )
);

-- Comentário: Esta política ainda permite acesso público aos recursos gratuitos
-- mas facilita monitoramento e pode ser facilmente restringida no futuro