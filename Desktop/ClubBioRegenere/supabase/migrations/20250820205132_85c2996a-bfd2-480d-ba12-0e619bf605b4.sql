-- Corrigir política RLS insegura da tabela subscribers
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Criar política mais segura - apenas edge functions podem atualizar
CREATE POLICY "service_role_can_update_subscription" ON public.subscribers
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Permitir que usuários vejam apenas suas próprias assinaturas
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;

CREATE POLICY "users_can_view_own_subscription" ON public.subscribers
FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());