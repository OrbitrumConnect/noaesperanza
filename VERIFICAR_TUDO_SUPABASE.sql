-- ========================================
-- 🔍 VERIFICAÇÃO COMPLETA - SUPABASE
-- Execute no SQL Editor para ver todo o status
-- ========================================

-- 1️⃣ VERIFICAR SEU USUÁRIO (Pedro Passos)
-- ========================================
SELECT 
    'MEU USUÁRIO' as tipo,
    u.id as user_id,
    u.email,
    u.created_at as cadastrado_em,
    nu.user_type as tipo_usuario,
    nu.permission_level as nivel_permissao,
    na.admin_name as nome_admin,
    na.is_active as admin_ativo
FROM auth.users u
LEFT JOIN noa_users nu ON nu.user_id = u.id
LEFT JOIN noa_admins na ON na.user_id = u.id
WHERE u.email = 'phpg69@gmail.com';

-- Resultado esperado:
-- ✅ user_type: profissional
-- ✅ permission_level: 5
-- ✅ admin_name: Pedro Passos
-- ✅ admin_ativo: true

-- ========================================

-- 2️⃣ VERIFICAR TODAS AS TABELAS NECESSÁRIAS
-- ========================================
SELECT 
    table_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables t WHERE t.table_name = tables.table_name) 
        THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status
FROM (
    VALUES 
        ('noa_users'),
        ('noa_admins'),
        ('noa_conversations'),
        ('noa_conversation_flow'),
        ('blocos_imre'),
        ('ai_learning'),
        ('ai_keywords'),
        ('ai_conversation_patterns'),
        ('admin_actions_log'),
        ('admin_conversations'),
        ('noa_kpis_clinicos'),
        ('noa_kpis_administrativos'),
        ('noa_kpis_simbolicos')
) as tables(table_name);

-- ========================================

-- 3️⃣ VERIFICAR FUNÇÕES ESSENCIAIS
-- ========================================
SELECT 
    proname as funcao,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ EXISTE'
        ELSE '❌ NÃO EXISTE'
    END as status,
    COUNT(*) as versoes
FROM pg_proc
WHERE proname IN (
    'register_noa_conversation',
    'save_ai_learning',
    'register_conversation_flow',
    'validate_admin_access',
    'execute_admin_command',
    'get_user_type',
    'set_user_type'
)
GROUP BY proname
ORDER BY proname;

-- ========================================

-- 4️⃣ VERIFICAR RLS (Row Level Security)
-- ========================================
SELECT 
    tablename as tabela,
    CASE 
        WHEN rowsecurity = true THEN '🔒 ATIVO'
        ELSE '🔓 DESATIVADO'
    END as rls_status
FROM pg_tables 
WHERE tablename IN (
    'noa_users',
    'noa_admins',
    'noa_conversations',
    'blocos_imre',
    'ai_learning'
)
ORDER BY tablename;

-- Deve estar DESATIVADO para testes locais

-- ========================================

-- 5️⃣ VERIFICAR BLOCOS IMRE (28 blocos canônicos)
-- ========================================
SELECT 
    COUNT(*) as total_blocos,
    COUNT(CASE WHEN ativo = true THEN 1 END) as blocos_ativos,
    MIN(ordem) as primeira_ordem,
    MAX(ordem) as ultima_ordem
FROM blocos_imre;

-- Resultado esperado:
-- total_blocos: 28
-- blocos_ativos: 28
-- primeira_ordem: 1
-- ultima_ordem: 28

-- ========================================

-- 6️⃣ VER PRIMEIROS 3 BLOCOS IMRE
-- ========================================
SELECT 
    ordem,
    etapa,
    LEFT(texto, 50) as inicio_texto,
    tipo
FROM blocos_imre
ORDER BY ordem
LIMIT 3;

-- Deve mostrar:
-- 1. abertura
-- 2. motivo_detalhado (O que trouxe você...)
-- 3. motivo_detalhado_extra

-- ========================================

-- 7️⃣ VERIFICAR CONVERSAS SALVAS
-- ========================================
SELECT 
    COUNT(*) as total_conversas,
    COUNT(DISTINCT session_id) as sessoes_unicas,
    MAX(created_at) as ultima_conversa
FROM noa_conversations;

-- ========================================

-- 8️⃣ VERIFICAR APRENDIZADO DA IA
-- ========================================
SELECT 
    COUNT(*) as total_aprendizados,
    COUNT(DISTINCT category) as categorias,
    AVG(confidence_score) as confianca_media
FROM ai_learning;

-- ========================================

-- 9️⃣ VERIFICAR ADMINS CADASTRADOS
-- ========================================
SELECT 
    admin_name,
    admin_key,
    permissions,
    is_active,
    created_at
FROM noa_admins
ORDER BY created_at;

-- Deve mostrar:
-- ✅ Pedro Passos
-- ✅ admin_pedro_valenca_2025
-- ✅ is_active: true

-- ========================================

-- 🔟 VERIFICAR POLÍTICAS RLS DE noa_users
-- ========================================
SELECT 
    policyname as politica,
    cmd as comando,
    qual as condicao
FROM pg_policies 
WHERE tablename = 'noa_users';

-- ========================================

-- 1️⃣1️⃣ RESUMO GERAL DO SISTEMA
-- ========================================
SELECT 
    (SELECT COUNT(*) FROM noa_users) as total_usuarios,
    (SELECT COUNT(*) FROM noa_admins WHERE is_active = true) as admins_ativos,
    (SELECT COUNT(*) FROM blocos_imre WHERE ativo = true) as blocos_imre_ativos,
    (SELECT COUNT(*) FROM noa_conversations) as conversas_totais,
    (SELECT COUNT(*) FROM ai_learning) as aprendizados_ia;

-- ========================================
-- ✅ CHECKLIST DO QUE DEVE APARECER:
-- ========================================
-- 
-- 1. Seu usuário linkado (phpg69@gmail.com)
-- 2. Todas as tabelas existem
-- 3. Todas as funções existem
-- 4. RLS desativado (para teste)
-- 5. 28 blocos IMRE ativos
-- 6. Você como admin ativo
-- 7. Conversas sendo salvas
-- 8. IA aprendendo
--
-- ========================================

