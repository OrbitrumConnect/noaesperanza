-- 🚀 CORREÇÃO DE PERFORMANCE: Resolver Multiple Permissive Policies e RLS Optimization

-- ==========================================
-- 1. RESOLVER: Multiple Permissive Policies em educational_plans
-- ==========================================

-- Remover policies duplicadas e criar uma única otimizada
DROP POLICY IF EXISTS "Admins can view all educational_plans" ON public.educational_plans;
DROP POLICY IF EXISTS "users_select_own_plans" ON public.educational_plans;

-- Criar policy única que combina admin e user access
CREATE POLICY "unified_select_educational_plans" 
ON public.educational_plans 
FOR SELECT 
USING (
  has_role((select auth.uid()), 'admin'::app_role) 
  OR 
  user_id = (select auth.uid())
);

-- ==========================================
-- 2. RESOLVER: Multiple Permissive Policies em daily_habits 
-- ==========================================

-- Remover policies duplicadas
DROP POLICY IF EXISTS "users_manage_own_habits" ON public.daily_habits;
DROP POLICY IF EXISTS "users_select_own_habits" ON public.daily_habits;

-- Recriar policies otimizadas e consolidadas
CREATE POLICY "unified_select_daily_habits" 
ON public.daily_habits 
FOR SELECT 
USING (user_id = (select auth.uid()));

CREATE POLICY "unified_crud_daily_habits" 
ON public.daily_habits 
FOR INSERT, UPDATE, DELETE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- ==========================================
-- 3. RESOLVER: Auth RLS Initialization Plan em plan_revisions
-- ==========================================

-- Otimizar policy que ainda usa auth.uid() direto
DROP POLICY IF EXISTS "Users can create their own plan revision requests" ON public.plan_revisions;

CREATE POLICY "Users can create their own plan revision requests" 
ON public.plan_revisions 
FOR INSERT 
WITH CHECK (
  (user_id = (select auth.uid())) 
  AND 
  (revision_type = 'patient_request'::text)
);

-- ==========================================
-- 4. OTIMIZAÇÕES ADICIONAIS PREVENTIVAS
-- ==========================================

-- Verificar e otimizar outras policies similares que podem estar causando warnings

-- Otimizar conversations policies
DROP POLICY IF EXISTS "users_manage_own_conversations" ON public.conversations;
DROP POLICY IF EXISTS "users_select_own_conversations" ON public.conversations;

CREATE POLICY "unified_select_conversations" 
ON public.conversations 
FOR SELECT 
USING (
  user_id = (select auth.uid()) 
  OR 
  has_role((select auth.uid()), 'admin'::app_role)
);

CREATE POLICY "unified_crud_conversations" 
ON public.conversations 
FOR INSERT, UPDATE, DELETE
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Otimizar health_profiles policies
DROP POLICY IF EXISTS "users_manage_own_health" ON public.health_profiles;
DROP POLICY IF EXISTS "users_select_own_health" ON public.health_profiles;

CREATE POLICY "unified_health_profiles" 
ON public.health_profiles 
FOR ALL
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Otimizar biomarcadores_isafe policies  
DROP POLICY IF EXISTS "users_manage_own_biomarcadores" ON public.biomarcadores_isafe;
DROP POLICY IF EXISTS "users_select_own_biomarcadores" ON public.biomarcadores_isafe;

CREATE POLICY "unified_biomarcadores_isafe" 
ON public.biomarcadores_isafe 
FOR ALL
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Comentário de conclusão
-- Esta migração consolida policies duplicadas e otimiza auth.uid() calls
-- Deve reduzir significativamente os warnings de performance