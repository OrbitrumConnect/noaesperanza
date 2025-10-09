-- 🔧 CORREÇÃO: Busca em avaliacoes_em_andamento com caracteres especiais

-- 1. VERIFICAR SE TABELA EXISTE
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'avaliacoes_em_andamento';

-- 2. VERIFICAR ESTRUTURA DA TABELA
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'avaliacoes_em_andamento' 
AND table_schema = 'public';

-- 3. TESTAR BUSCA SIMPLES
SELECT id, created_at 
FROM avaliacoes_em_andamento 
ORDER BY created_at DESC 
LIMIT 3;

-- 4. VERIFICAR QUAIS COLUNAS EXISTEM REALMENTE
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'avaliacoes_em_andamento' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. BUSCAR POR QUALQUER COLUNA DE TEXTO DISPONÍVEL
SELECT column_name
FROM information_schema.columns 
WHERE table_name = 'avaliacoes_em_andamento' 
AND table_schema = 'public'
AND data_type IN ('text', 'character varying', 'jsonb', 'json');
