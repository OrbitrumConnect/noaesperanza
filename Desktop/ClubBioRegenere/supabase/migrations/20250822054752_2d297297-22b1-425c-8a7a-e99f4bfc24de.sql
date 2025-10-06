-- 🚀 CORREÇÃO 1: Criar índices para Foreign Keys (Performance crítica)
-- Índice para appointments.user_id - acelera consultas por usuário
CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON public.appointments(user_id);

-- Índices adicionais para outras foreign keys importantes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_educational_plans_user_id ON public.educational_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_user_id ON public.subscribers(user_id);

-- 🚀 CORREÇÃO 2: Otimizar RLS Policies (substituir auth.uid() por subquery)
-- Política otimizada para profiles
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
CREATE POLICY "users_insert_own_profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "users_select_own_profile" ON public.profiles;
CREATE POLICY "users_select_own_profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile" 
ON public.profiles 
FOR UPDATE 
USING (user_id = (select auth.uid()));

-- Otimizar policies de appointments
DROP POLICY IF EXISTS "Users can view their own appointments" ON public.appointments;
CREATE POLICY "Users can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can create their own appointments" ON public.appointments;
CREATE POLICY "Users can create their own appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own appointments" ON public.appointments;
CREATE POLICY "Users can update their own appointments" 
ON public.appointments 
FOR UPDATE 
USING (user_id = (select auth.uid()));

-- 🚀 CORREÇÃO 3: Índices compostos para consultas complexas (Performance avançada)
-- Para buscar agendamentos por data e usuário rapidamente
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON public.appointments(user_id, appointment_date);
-- Para buscar agendamentos por status e usuário
CREATE INDEX IF NOT EXISTS idx_appointments_user_status ON public.appointments(user_id, status);

-- Para educational_plans por usuário e status
CREATE INDEX IF NOT EXISTS idx_educational_plans_user_status ON public.educational_plans(user_id, status);