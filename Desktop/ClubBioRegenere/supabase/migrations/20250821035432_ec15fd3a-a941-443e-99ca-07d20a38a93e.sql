-- Verificar e corrigir constraint da tabela biomarcadores_isafe
-- Remove constraint problemática se existir e recria corretamente

-- Primeiro, vamos ver as constraints atuais
SELECT 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name
FROM 
    information_schema.table_constraints tc 
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
WHERE 
    tc.table_name = 'biomarcadores_isafe' 
    AND tc.table_schema = 'public';

-- Verificar se existe constraint única problemática  
DROP INDEX IF EXISTS biomarcadores_isafe_user_id_assessment_date_key;

-- Recriar constraint única corretamente
ALTER TABLE public.biomarcadores_isafe 
DROP CONSTRAINT IF EXISTS biomarcadores_isafe_user_id_assessment_date_key;

-- Adicionar constraint única correta
ALTER TABLE public.biomarcadores_isafe 
ADD CONSTRAINT biomarcadores_isafe_user_assessment_unique 
UNIQUE (user_id, assessment_date);