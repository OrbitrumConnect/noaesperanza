-- Corrigir políticas RLS para permitir que admins vejam conversas de todos os usuários
CREATE POLICY "Admins can view all conversations" ON public.conversations
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Corrigir política para admins verem educational_plans de todos
CREATE POLICY "Admins can view all educational_plans" ON public.educational_plans
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir que admins insiram educational_plans para qualquer usuário  
CREATE POLICY "Admins can create educational_plans for any user" ON public.educational_plans
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));