-- =====================================================
-- CRIAR TABELA AVALIACOES_INICIAIS NO SUPABASE
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- Criar função update_updated_at_column se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar tabela de avaliações iniciais
CREATE TABLE IF NOT EXISTS avaliacoes_iniciais (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    session_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'finalizada')),
    etapa_atual TEXT DEFAULT 'abertura',
    apresentacao TEXT,
    cannabis_medicinal TEXT,
    lista_indiciaria TEXT[],
    queixa_principal TEXT,
    desenvolvimento_indiciario JSONB DEFAULT '{}',
    historia_patologica TEXT[],
    historia_familiar JSONB DEFAULT '{}',
    habitos_vida TEXT[],
    medicacoes JSONB DEFAULT '{}',
    alergias TEXT,
    relatorio_narrativo TEXT,
    concordancia_final BOOLEAN,
    autorizacao_prontuario BOOLEAN,
    data_autorizacao TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_avaliacoes_iniciais_user_id ON avaliacoes_iniciais(user_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_iniciais_session_id ON avaliacoes_iniciais(session_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_iniciais_status ON avaliacoes_iniciais(status);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_iniciais_created_at ON avaliacoes_iniciais(created_at);

-- Habilitar RLS
ALTER TABLE avaliacoes_iniciais ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver
DROP POLICY IF EXISTS "Users can manage their own evaluations" ON avaliacoes_iniciais;
DROP POLICY IF EXISTS "Allow public read access to evaluations" ON avaliacoes_iniciais;
DROP POLICY IF EXISTS "Allow anonymous evaluation insert" ON avaliacoes_iniciais;

-- Políticas RLS
CREATE POLICY "Users can manage their own evaluations" ON avaliacoes_iniciais
    FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL OR auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to evaluations" ON avaliacoes_iniciais
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous evaluation insert" ON avaliacoes_iniciais
    FOR INSERT WITH CHECK (true);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_avaliacoes_iniciais_updated_at ON avaliacoes_iniciais;
CREATE TRIGGER update_avaliacoes_iniciais_updated_at 
    BEFORE UPDATE ON avaliacoes_iniciais 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE avaliacoes_iniciais IS 'Tabela para armazenar avaliações clínicas iniciais da NOA Esperanza';
COMMENT ON COLUMN avaliacoes_iniciais.user_id IS 'ID do usuário autenticado';
COMMENT ON COLUMN avaliacoes_iniciais.session_id IS 'ID único da sessão de avaliação';
COMMENT ON COLUMN avaliacoes_iniciais.status IS 'Status da avaliação: in_progress, completed, finalizada';
COMMENT ON COLUMN avaliacoes_iniciais.etapa_atual IS 'Etapa atual da avaliação clínica';
COMMENT ON COLUMN avaliacoes_iniciais.desenvolvimento_indiciario IS 'Dados do desenvolvimento indiciário em formato JSON';
COMMENT ON COLUMN avaliacoes_iniciais.historia_familiar IS 'História familiar em formato JSON';
COMMENT ON COLUMN avaliacoes_iniciais.medicacoes IS 'Medicações em formato JSON';
