-- Corrigir VIP: Apenas Khaleo Brazao deve ter Premium (quem realmente pagou)
-- Remover VIP dos outros pacientes que não pagaram

UPDATE subscribers 
SET 
  subscribed = false,
  subscription_tier = null,
  subscription_end = null,
  updated_at = now()
WHERE email IN (
  'jevyarok@gmail.com',      -- joao vidal
  'passosmir4@gmail.com',    -- pedroteste1  
  'pontes.cristiano@hotmail.com' -- Test
);

-- Manter apenas Khaleo Brazao como VIP (quem pagou)
UPDATE subscribers 
SET 
  subscribed = true,
  subscription_tier = 'Premium',
  subscription_end = null,
  updated_at = now()
WHERE email = 'khaleobrazao07@gmail.com';