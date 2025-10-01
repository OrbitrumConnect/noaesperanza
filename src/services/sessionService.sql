-- 🔄 TABELA DE SESSÕES EM ANDAMENTO
-- Para retomada de avaliações clínicas, cursos e consultas

-- Criar tabela
CREATE TABLE IF NOT EXISTS sessoes_em_andamento (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  etapa_atual INTEGER NOT NULL DEFAULT 0,
  total_blocos INTEGER NOT NULL DEFAULT 28,
  respostas JSONB DEFAULT '[]',
  variaveis_capturadas JSONB DEFAULT '{}',
  iniciado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW(),
  tipo TEXT NOT NULL DEFAULT 'avaliacao_clinica' CHECK (tipo IN ('avaliacao_clinica', 'curso', 'consulta')),
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'pausada', 'concluida', 'abandonada')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sessoes_user_id ON sessoes_em_andamento(user_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_session_id ON sessoes_em_andamento(session_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_status ON sessoes_em_andamento(status);
CREATE INDEX IF NOT EXISTS idx_sessoes_tipo ON sessoes_em_andamento(tipo);
CREATE INDEX IF NOT EXISTS idx_sessoes_atualizado_em ON sessoes_em_andamento(atualizado_em DESC);

-- Índice composto para query principal (buscar sessão incompleta)
CREATE INDEX IF NOT EXISTS idx_sessoes_user_status_atualizado 
ON sessoes_em_andamento(user_id, status, atualizado_em DESC);

-- RLS (Row Level Security)
ALTER TABLE sessoes_em_andamento ENABLE ROW LEVEL SECURITY;

-- Política: Usuários veem apenas suas próprias sessões
DROP POLICY IF EXISTS "Usuários veem suas sessões" ON sessoes_em_andamento;
CREATE POLICY "Usuários veem suas sessões"
ON sessoes_em_andamento FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Política: Usuários podem criar suas sessões
DROP POLICY IF EXISTS "Usuários criam sessões" ON sessoes_em_andamento;
CREATE POLICY "Usuários criam sessões"
ON sessoes_em_andamento FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Política: Usuários podem atualizar suas sessões
DROP POLICY IF EXISTS "Usuários atualizam sessões" ON sessoes_em_andamento;
CREATE POLICY "Usuários atualizam sessões"
ON sessoes_em_andamento FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Política: Usuários podem deletar suas sessões
DROP POLICY IF EXISTS "Usuários deletam sessões" ON sessoes_em_andamento;
CREATE POLICY "Usuários deletam sessões"
ON sessoes_em_andamento FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Política: Admins veem todas as sessões
DROP POLICY IF EXISTS "Admins veem todas sessões" ON sessoes_em_andamento;
CREATE POLICY "Admins veem todas sessões"
ON sessoes_em_andamento FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM noa_admins
    WHERE user_id = auth.uid()
  )
);

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_sessoes_em_andamento_updated_at ON sessoes_em_andamento;
CREATE TRIGGER update_sessoes_em_andamento_updated_at
  BEFORE UPDATE ON sessoes_em_andamento
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Função para buscar sessão incompleta mais recente
CREATE OR REPLACE FUNCTION buscar_sessao_incompleta(user_id_param UUID)
RETURNS TABLE(
  session_id TEXT,
  etapa_atual INTEGER,
  total_blocos INTEGER,
  respostas JSONB,
  variaveis_capturadas JSONB,
  iniciado_em TIMESTAMPTZ,
  atualizado_em TIMESTAMPTZ,
  tipo TEXT,
  status TEXT,
  progresso_percentual NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.session_id,
    s.etapa_atual,
    s.total_blocos,
    s.respostas,
    s.variaveis_capturadas,
    s.iniciado_em,
    s.atualizado_em,
    s.tipo,
    s.status,
    ROUND((s.etapa_atual::NUMERIC / s.total_blocos::NUMERIC) * 100, 2) as progresso_percentual
  FROM sessoes_em_andamento s
  WHERE s.user_id = user_id_param
    AND s.status = 'em_andamento'
  ORDER BY s.atualizado_em DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para estatísticas de sessões
CREATE OR REPLACE FUNCTION estatisticas_sessoes(periodo TEXT DEFAULT '7d')
RETURNS TABLE(
  total_sessoes BIGINT,
  em_andamento BIGINT,
  concluidas BIGINT,
  abandonadas BIGINT,
  taxa_conclusao NUMERIC,
  tempo_medio_minutos NUMERIC
) AS $$
DECLARE
  intervalo INTERVAL;
BEGIN
  intervalo := CASE periodo
    WHEN '24h' THEN INTERVAL '24 hours'
    WHEN '7d' THEN INTERVAL '7 days'
    WHEN '30d' THEN INTERVAL '30 days'
    ELSE INTERVAL '7 days'
  END;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_sessoes,
    COUNT(*) FILTER (WHERE status = 'em_andamento')::BIGINT as em_andamento,
    COUNT(*) FILTER (WHERE status = 'concluida')::BIGINT as concluidas,
    COUNT(*) FILTER (WHERE status = 'abandonada')::BIGINT as abandonadas,
    CASE 
      WHEN COUNT(*) > 0 
      THEN ROUND((COUNT(*) FILTER (WHERE status = 'concluida')::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
      ELSE 0
    END as taxa_conclusao,
    ROUND(AVG(EXTRACT(EPOCH FROM (atualizado_em - iniciado_em)) / 60)::NUMERIC, 2) as tempo_medio_minutos
  FROM sessoes_em_andamento
  WHERE iniciado_em >= NOW() - intervalo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para limpar sessões antigas (mais de 30 dias)
CREATE OR REPLACE FUNCTION limpar_sessoes_antigas()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM sessoes_em_andamento
    WHERE atualizado_em < NOW() - INTERVAL '30 days'
      AND status IN ('concluida', 'abandonada')
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para dashboard de sessões
CREATE OR REPLACE VIEW sessoes_dashboard AS
SELECT
  DATE_TRUNC('day', iniciado_em) as dia,
  tipo,
  status,
  COUNT(*) as quantidade,
  ROUND(AVG(etapa_atual::NUMERIC / total_blocos::NUMERIC * 100), 2) as progresso_medio
FROM sessoes_em_andamento
WHERE iniciado_em >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', iniciado_em), tipo, status
ORDER BY dia DESC;

-- Comentários para documentação
COMMENT ON TABLE sessoes_em_andamento IS 'Sessões em andamento para retomada de avaliações, cursos e consultas';
COMMENT ON COLUMN sessoes_em_andamento.session_id IS 'ID único da sessão (gerado pelo frontend)';
COMMENT ON COLUMN sessoes_em_andamento.etapa_atual IS 'Número do bloco/etapa atual (0-28)';
COMMENT ON COLUMN sessoes_em_andamento.total_blocos IS 'Total de blocos da avaliação (padrão: 28)';
COMMENT ON COLUMN sessoes_em_andamento.respostas IS 'Array JSON com todas as respostas do usuário';
COMMENT ON COLUMN sessoes_em_andamento.variaveis_capturadas IS 'Variáveis extraídas (queixa, nome, sintomas, etc)';
COMMENT ON COLUMN sessoes_em_andamento.tipo IS 'Tipo: avaliacao_clinica, curso ou consulta';
COMMENT ON COLUMN sessoes_em_andamento.status IS 'Status: em_andamento, pausada, concluida, abandonada';

