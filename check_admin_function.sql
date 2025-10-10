-- 🔍 VERIFICAR FUNÇÃO ADMIN E ESTATÍSTICAS
-- Execute no SQL Editor do Supabase

-- 1. Verificar se a função execute_admin_command existe
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%admin%' 
   OR routine_name LIKE '%stats%'
   OR routine_name LIKE '%execute%';

-- 2. Verificar funções RPC disponíveis
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
  AND routine_schema = 'public'
ORDER BY routine_name;

-- 3. Verificar contagem real dos aprendizados
SELECT 
    COUNT(*) as total_ai_learning
FROM ai_learning;

-- 4. Verificar contagem por categoria
SELECT 
    category,
    COUNT(*) as count
FROM ai_learning 
GROUP BY category
ORDER BY count DESC;

-- 5. Verificar registros mais recentes
SELECT 
    id,
    keyword,
    category,
    confidence_score,
    created_at
FROM ai_learning 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. Verificar se há dados na tabela ai_keywords
SELECT 
    COUNT(*) as total_keywords
FROM ai_keywords;

-- 7. Verificar se há dados na tabela ai_conversation_patterns
SELECT 
    COUNT(*) as total_patterns
FROM ai_conversation_patterns;
