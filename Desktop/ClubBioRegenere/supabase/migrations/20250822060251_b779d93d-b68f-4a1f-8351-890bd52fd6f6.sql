-- Corrigir lógica: Pacientes criados pela doutora devem ter VIP automático
-- VIP = acesso total à plataforma (decisão da doutora)
-- Premium = apenas para quem paga via Mercado Pago

-- Dar VIP para todos os pacientes criados pela doutora (exceto Khaleo que já tem Premium)
UPDATE subscribers 
SET 
  subscribed = true,
  subscription_tier = 'VIP Doutora',
  subscription_end = null,
  updated_at = now()
WHERE email IN (
  'jevyarok@gmail.com',      -- joao vidal
  'passosmir4@gmail.com',    -- pedroteste1  
  'pontes.cristiano@hotmail.com' -- Test
);

-- Manter Khaleo Brazao como Premium (quem realmente pagou)
UPDATE subscribers 
SET 
  subscription_tier = 'Premium Pago'
WHERE email = 'khaleobrazao07@gmail.com';