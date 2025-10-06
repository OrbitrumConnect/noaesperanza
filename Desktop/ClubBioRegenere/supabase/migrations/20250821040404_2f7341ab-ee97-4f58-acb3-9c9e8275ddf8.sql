-- Ajustar políticas RLS dos educational_plans
-- Remover política que permite usuários editarem seus próprios planos
DROP POLICY IF EXISTS "users_manage_own_plans" ON educational_plans;

-- Manter apenas visualização para usuários
-- A política users_select_own_plans já existe e permite visualização

-- Garantir que apenas admins podem criar/editar/deletar planos
-- A política "Admins can create educational_plans for any user" já existe

-- Adicionar política para admins editarem todos os planos
CREATE POLICY "Admins can update all educational_plans" 
ON educational_plans 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Adicionar política para admins deletarem todos os planos  
CREATE POLICY "Admins can delete all educational_plans" 
ON educational_plans 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));