-- 🔧 CORREÇÃO: Constraint de tipo na tabela documentos_mestres

-- 1. VERIFICAR CONSTRAINT ATUAL (versão moderna PostgreSQL)
SELECT 
    conname,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'documentos_mestres'::regclass 
AND contype = 'c';

-- 2. REMOVER CONSTRAINT PROBLEMÁTICO
ALTER TABLE documentos_mestres DROP CONSTRAINT IF EXISTS documentos_mestres_type_check;

-- 3. RECRIAR CONSTRAINT CORRIGIDO
ALTER TABLE documentos_mestres ADD CONSTRAINT documentos_mestres_type_check 
CHECK (type IN ('personality', 'knowledge', 'instructions', 'examples'));

-- 4. VERIFICAR SE EXISTE A TABELA
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'documentos_mestres';

-- 5. VERIFICAR ESTRUTURA DA TABELA
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'documentos_mestres' 
AND table_schema = 'public';

-- 6. TESTAR INSERÇÃO SIMPLES
INSERT INTO documentos_mestres (title, content, type, category, is_active)
VALUES ('Teste Constraint', 'Conteúdo de teste', 'knowledge', 'test', true)
ON CONFLICT DO NOTHING;

-- 7. VERIFICAR SE INSERIU
SELECT id, title, type, category, created_at 
FROM documentos_mestres 
WHERE title = 'Teste Constraint';

-- 8. LIMPAR TESTE
DELETE FROM documentos_mestres WHERE title = 'Teste Constraint';
