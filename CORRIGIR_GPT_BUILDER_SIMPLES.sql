-- 🔧 CORREÇÃO SIMPLES E SEGURA DO GPT BUILDER

-- 1. VERIFICAR SE A TABELA documentos_mestres EXISTE
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'documentos_mestres';

-- 2. SE NÃO EXISTIR, CRIAR A TABELA BÁSICA
CREATE TABLE IF NOT EXISTS documentos_mestres (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'knowledge',
    category VARCHAR(100) DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. REMOVER CONSTRAINT PROBLEMÁTICO SE EXISTIR
ALTER TABLE documentos_mestres DROP CONSTRAINT IF EXISTS documentos_mestres_type_check;

-- 4. CRIAR CONSTRAINT CORRIGIDO
ALTER TABLE documentos_mestres ADD CONSTRAINT documentos_mestres_type_check 
CHECK (type IN ('personality', 'knowledge', 'instructions', 'examples'));

-- 5. TESTAR INSERÇÃO SIMPLES
INSERT INTO documentos_mestres (title, content, type, category, is_active)
VALUES ('Teste GPT Builder', 'Conteúdo de teste para verificar funcionamento', 'knowledge', 'test', true)
ON CONFLICT DO NOTHING;

-- 6. VERIFICAR SE FUNCIONOU
SELECT id, title, type, category, created_at 
FROM documentos_mestres 
WHERE title = 'Teste GPT Builder';

-- 7. LIMPAR TESTE
DELETE FROM documentos_mestres WHERE title = 'Teste GPT Builder';

-- 8. VERIFICAR TABELA avaliacoes_em_andamento
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'avaliacoes_em_andamento';

-- 9. SE EXISTIR, VERIFICAR ESTRUTURA
SELECT column_name, data_type
FROM information_schema.columns 
WHERE table_name = 'avaliacoes_em_andamento' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 10. CRIAR TABELA SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS avaliacoes_em_andamento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    responses JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'em_andamento',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. HABILITAR RLS
ALTER TABLE documentos_mestres ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_em_andamento ENABLE ROW LEVEL SECURITY;

-- 12. CRIAR POLÍTICAS RLS BÁSICAS
DROP POLICY IF EXISTS "documentos_mestres_policy" ON documentos_mestres;
CREATE POLICY "documentos_mestres_policy" ON documentos_mestres
FOR ALL USING (true);

DROP POLICY IF EXISTS "avaliacoes_em_andamento_policy" ON avaliacoes_em_andamento;
CREATE POLICY "avaliacoes_em_andamento_policy" ON avaliacoes_em_andamento
FOR ALL USING (true);

-- 13. COMENTÁRIO FINAL
SELECT 'GPT Builder corrigido com sucesso!' as status;
