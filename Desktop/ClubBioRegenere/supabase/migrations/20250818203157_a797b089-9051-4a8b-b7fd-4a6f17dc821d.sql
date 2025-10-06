-- Habilitar tempo real para as tabelas principais
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.daily_habits REPLICA IDENTITY FULL;
ALTER TABLE public.biomarcadores_isafe REPLICA IDENTITY FULL;
ALTER TABLE public.health_profiles REPLICA IDENTITY FULL;
ALTER TABLE public.educational_plans REPLICA IDENTITY FULL;
ALTER TABLE public.user_roles REPLICA IDENTITY FULL;

-- Adicionar as tabelas à publicação realtime
-- Isso permite updates em tempo real
-- (O Supabase já tem uma publicação padrão configurada automaticamente)