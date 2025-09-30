-- Script para verificar a estrutura da tabela noa_conversations
-- Execute este script no SQL Editor do Supabase

-- Verificar se a tabela existe e sua estrutura
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'noa_conversations' 
ORDER BY ordinal_position;

-- Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'noa_conversations';
