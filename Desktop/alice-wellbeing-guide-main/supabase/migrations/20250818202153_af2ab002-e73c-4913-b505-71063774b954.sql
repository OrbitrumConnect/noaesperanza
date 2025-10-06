-- Criar perfil para o usuário admin que está faltando
INSERT INTO public.profiles (user_id, email, full_name, name)
VALUES (
  'd11d49f5-eb96-4c6e-98e9-e22ae4426554',
  'phpg69@gmail.com',
  'Administrador',
  'Admin'
)
ON CONFLICT (user_id) DO NOTHING;

-- Verificar se existem outros usuários sem perfil
INSERT INTO public.profiles (user_id, email, full_name, name)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'full_name', au.email),
  COALESCE(au.raw_user_meta_data ->> 'name', au.email)
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;