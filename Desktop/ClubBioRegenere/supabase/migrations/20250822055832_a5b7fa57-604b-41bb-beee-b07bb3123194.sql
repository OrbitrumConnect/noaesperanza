-- Dar acesso VIP retroativo para todos os pacientes criados pela doutora
-- que ainda não têm subscriber

INSERT INTO subscribers (user_id, email, subscribed, subscription_tier, subscription_end, created_at, updated_at)
SELECT 
  p.user_id,
  p.email,
  true as subscribed,
  'Premium' as subscription_tier,
  null as subscription_end,
  now() as created_at,
  now() as updated_at
FROM profiles p
JOIN user_roles ur ON p.user_id = ur.user_id
LEFT JOIN subscribers s ON p.user_id = s.user_id
WHERE ur.role = 'patient' 
  AND s.user_id IS NULL  -- Não tem subscriber ainda
  AND p.email NOT IN ('phpg69@gmail.com', 'dayanabrazao@gmail.com'); -- Excluir admins