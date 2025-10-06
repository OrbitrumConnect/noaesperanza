-- Corrigir política RLS para recursos educacionais premium
-- Remover política pública atual que permite acesso a conteúdo premium
DROP POLICY IF EXISTS "public_read_resources" ON public.educational_resources;

-- Criar política para recursos gratuitos (público)
CREATE POLICY "public_read_free_resources" 
ON public.educational_resources 
FOR SELECT 
USING (is_premium = false);

-- Criar política para recursos premium (apenas assinantes)
CREATE POLICY "subscribers_read_premium_resources" 
ON public.educational_resources 
FOR SELECT 
USING (
  is_premium = true 
  AND EXISTS (
    SELECT 1 FROM public.subscribers s 
    WHERE s.user_id = auth.uid() 
    AND s.subscribed = true 
    AND (s.subscription_end IS NULL OR s.subscription_end > now())
  )
);

-- Manter política de administração para admins
-- (já existe: Admins can manage educational_resources)