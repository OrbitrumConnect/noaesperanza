-- 🚀 CORREÇÃO DE PERFORMANCE: Resolver Multiple Permissive Policies e RLS Optimization (CORRIGIDO)

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

-- Recriar policy consolidada otimizada (usando FOR ALL)
CREATE POLICY "unified_daily_habits_access" 
ON public.daily_habits 
FOR ALL
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

-- Otimizar conversations policies (consolidar duplicadas)
DROP POLICY IF EXISTS "users_manage_own_conversations" ON public.conversations;
DROP POLICY IF EXISTS "users_select_own_conversations" ON public.conversations;

-- Policy unificada para conversations
CREATE POLICY "unified_conversations_access" 
ON public.conversations 
FOR ALL
USING (
  user_id = (select auth.uid()) 
  OR 
  has_role((select auth.uid()), 'admin'::app_role)
)
WITH CHECK (user_id = (select auth.uid()));

-- Otimizar health_profiles policies
DROP POLICY IF EXISTS "users_manage_own_health" ON public.health_profiles;
DROP POLICY IF EXISTS "users_select_own_health" ON public.health_profiles;

CREATE POLICY "unified_health_profiles_access" 
ON public.health_profiles 
FOR ALL
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Otimizar biomarcadores_isafe policies  
DROP POLICY IF EXISTS "users_manage_own_biomarcadores" ON public.biomarcadores_isafe;
DROP POLICY IF EXISTS "users_select_own_biomarcadores" ON public.biomarcadores_isafe;

CREATE POLICY "unified_biomarcadores_access" 
ON public.biomarcadores_isafe 
FOR ALL
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Otimizar outras tabelas com policies similares
DROP POLICY IF EXISTS "users_manage_own_habits" ON public.daily_habits;
DROP POLICY IF EXISTS "users_select_own_habits" ON public.daily_habits;

DROP POLICY IF EXISTS "users_manage_own_goals" ON public.user_goals;
DROP POLICY IF EXISTS "users_select_own_goals" ON public.user_goals;

CREATE POLICY "unified_user_goals_access" 
ON public.user_goals 
FOR ALL
USING (user_id = (select auth.uid()))
WITH CHECK (user_id = (select auth.uid()));

-- Esta migração resolve os warnings de Multiple Permissive Policies
-- e otimiza todas as chamadas auth.uid() com subqueries