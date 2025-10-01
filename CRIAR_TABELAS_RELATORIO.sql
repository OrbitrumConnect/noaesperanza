-- ========================================
-- 📊 TABELAS PARA RELATÓRIOS E AVALIAÇÕES
-- ========================================

-- 1. TABELA DE AVALIAÇÕES EM ANDAMENTO
CREATE TABLE IF NOT EXISTS avaliacoes_em_andamento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    etapa_atual INTEGER DEFAULT 0,
    context JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE RELATÓRIOS FINALIZADOS
CREATE TABLE IF NOT EXISTS relatorios_avaliacao_inicial (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    relatorio_data JSONB NOT NULL,
    status TEXT DEFAULT 'completo' CHECK (status IN ('completo', 'incompleto', 'cancelado')),
    nft_hash TEXT,
    compartilhado_com JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_avaliacoes_session ON avaliacoes_em_andamento(session_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_user ON avaliacoes_em_andamento(user_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_session ON relatorios_avaliacao_inicial(session_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_user ON relatorios_avaliacao_inicial(user_id, created_at DESC);

-- 4. RLS - DESABILITADO PARA TESTE
ALTER TABLE avaliacoes_em_andamento DISABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios_avaliacao_inicial DISABLE ROW LEVEL SECURITY;

-- 5. FUNÇÃO PARA BUSCAR RELATÓRIOS DO PACIENTE
CREATE OR REPLACE FUNCTION get_relatorios_paciente(paciente_user_id UUID)
RETURNS TABLE (
    id UUID,
    session_id TEXT,
    data_avaliacao TIMESTAMP WITH TIME ZONE,
    queixa_principal TEXT,
    status TEXT,
    completude INTEGER,
    nft_hash TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.id,
        r.session_id,
        r.created_at,
        (r.relatorio_data->'queixaPrincipal'->>'descricao')::TEXT,
        r.status,
        (r.relatorio_data->>'completude')::INTEGER,
        r.nft_hash
    FROM relatorios_avaliacao_inicial r
    WHERE r.user_id = paciente_user_id
    ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. VIEW PARA DASHBOARD ADMIN - RELATÓRIOS
CREATE OR REPLACE VIEW admin_relatorios_view AS
SELECT 
    r.id,
    r.session_id,
    COALESCE(nu.name, 'Anônimo') as paciente_nome,
    au.email as paciente_email,
    (r.relatorio_data->'queixaPrincipal'->>'descricao') as queixa_principal,
    (r.relatorio_data->>'completude')::INTEGER as completude,
    (r.relatorio_data->>'duracaoMinutos')::INTEGER as duracao_minutos,
    r.status,
    r.nft_hash,
    r.created_at as data_avaliacao
FROM relatorios_avaliacao_inicial r
LEFT JOIN noa_users nu ON nu.user_id = r.user_id
LEFT JOIN auth.users au ON au.id = r.user_id
ORDER BY r.created_at DESC;

-- 7. FUNÇÃO PARA GERAR NFT HASH
CREATE OR REPLACE FUNCTION gerar_nft_hash(session_id_param TEXT)
RETURNS TEXT AS $$
DECLARE
    nft_hash TEXT;
BEGIN
    -- Gerar hash único baseado em session_id + timestamp
    nft_hash := encode(
        digest(session_id_param || NOW()::TEXT, 'sha256'),
        'hex'
    );
    
    -- Atualizar relatório com o hash
    UPDATE relatorios_avaliacao_inicial
    SET nft_hash = nft_hash
    WHERE session_id = session_id_param;
    
    RETURN nft_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TRIGGER PARA AUTO-UPDATE
DROP TRIGGER IF EXISTS update_avaliacoes_updated_at ON avaliacoes_em_andamento;
CREATE TRIGGER update_avaliacoes_updated_at
    BEFORE UPDATE ON avaliacoes_em_andamento
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_relatorios_updated_at ON relatorios_avaliacao_inicial;
CREATE TRIGGER update_relatorios_updated_at
    BEFORE UPDATE ON relatorios_avaliacao_inicial
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ✅ PRONTO! Tabelas de relatório criadas
-- ========================================

