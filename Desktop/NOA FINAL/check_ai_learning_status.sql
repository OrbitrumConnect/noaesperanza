-- 🔍 VERIFICAR STATUS DOS APRENDIZADOS DA IA
-- Execute no SQL Editor do Supabase

-- 1. Contar registros em cada tabela
SELECT 
    'ai_learning' as tabela,
    COUNT(*) as total_registros
FROM ai_learning
UNION ALL
SELECT 
    'ai_keywords' as tabela,
    COUNT(*) as total_registros
FROM ai_keywords
UNION ALL
SELECT 
    'ai_conversation_patterns' as tabela,
    COUNT(*) as total_registros
FROM ai_conversation_patterns;

-- 2. Verificar registros recentes (últimos 7 dias)
SELECT 
    'ai_learning' as tabela,
    COUNT(*) as registros_7_dias
FROM ai_learning 
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
    'ai_keywords' as tabela,
    COUNT(*) as registros_7_dias
FROM ai_keywords 
WHERE created_at >= NOW() - INTERVAL '7 days'
UNION ALL
SELECT 
    'ai_conversation_patterns' as tabela,
    COUNT(*) as registros_7_dias
FROM ai_conversation_patterns 
WHERE created_at >= NOW() - INTERVAL '7 days';

-- 3. Verificar categorias de aprendizado
SELECT 
    category,
    COUNT(*) as total,
    MAX(created_at) as ultimo_registro
FROM ai_learning 
GROUP BY category
ORDER BY total DESC;

-- 4. Verificar palavras-chave mais usadas
SELECT 
    keyword,
    category,
    usage_count,
    importance_score,
    last_used
FROM ai_keywords 
ORDER BY usage_count DESC, importance_score DESC
LIMIT 20;

-- 5. Verificar padrões de conversa
SELECT 
    pattern_type,
    COUNT(*) as total,
    MAX(created_at) as ultimo_registro
FROM ai_conversation_patterns 
GROUP BY pattern_type
ORDER BY total DESC;

-- 6. Verificar se há erros de constraint
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename IN ('ai_learning', 'ai_keywords', 'ai_conversation_patterns')
ORDER BY tablename, attname;
