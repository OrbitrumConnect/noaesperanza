-- 📊 TABELA DE LOGS DO SISTEMA
-- Para auditoria médica, compliance e debugging

-- Criar tabela de logs
CREATE TABLE IF NOT EXISTS logs_sistema (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  evento TEXT NOT NULL,
  dados JSONB DEFAULT '{}',
  nivel TEXT NOT NULL CHECK (nivel IN ('info', 'warning', 'error', 'success')),
  user_id TEXT,
  session_id TEXT,
  categoria TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs_sistema(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_logs_nivel ON logs_sistema(nivel);
CREATE INDEX IF NOT EXISTS idx_logs_categoria ON logs_sistema(categoria);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs_sistema(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_evento ON logs_sistema(evento);

-- Índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_logs_timestamp_nivel_categoria 
ON logs_sistema(timestamp DESC, nivel, categoria);

-- RLS (Row Level Security)
ALTER TABLE logs_sistema ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer usuário autenticado pode inserir logs
DROP POLICY IF EXISTS "Usuários podem inserir logs" ON logs_sistema;
CREATE POLICY "Usuários podem inserir logs"
ON logs_sistema FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política: Usuários veem apenas seus próprios logs
DROP POLICY IF EXISTS "Usuários veem seus logs" ON logs_sistema;
CREATE POLICY "Usuários veem seus logs"
ON logs_sistema FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()::text OR
  user_id = 'anonimo'
);

-- Política: Admins veem todos os logs
DROP POLICY IF EXISTS "Admins veem todos logs" ON logs_sistema;
CREATE POLICY "Admins veem todos logs"
ON logs_sistema FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM noa_admins
    WHERE user_id = auth.uid()
  )
);

-- Função para limpar logs antigos (manter últimos 90 dias)
CREATE OR REPLACE FUNCTION limpar_logs_antigos()
RETURNS void AS $$
BEGIN
  DELETE FROM logs_sistema
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para estatísticas de logs
CREATE OR REPLACE FUNCTION estatisticas_logs(periodo TEXT DEFAULT '24h')
RETURNS TABLE(
  total BIGINT,
  info BIGINT,
  warning BIGINT,
  error BIGINT,
  success BIGINT,
  eventos_criticos BIGINT
) AS $$
DECLARE
  intervalo INTERVAL;
BEGIN
  -- Converter período para intervalo
  intervalo := CASE periodo
    WHEN '24h' THEN INTERVAL '24 hours'
    WHEN '7d' THEN INTERVAL '7 days'
    WHEN '30d' THEN INTERVAL '30 days'
    ELSE INTERVAL '24 hours'
  END;

  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total,
    COUNT(*) FILTER (WHERE nivel = 'info')::BIGINT as info,
    COUNT(*) FILTER (WHERE nivel = 'warning')::BIGINT as warning,
    COUNT(*) FILTER (WHERE nivel = 'error')::BIGINT as error,
    COUNT(*) FILTER (WHERE nivel = 'success')::BIGINT as success,
    COUNT(*) FILTER (WHERE nivel = 'error')::BIGINT as eventos_criticos
  FROM logs_sistema
  WHERE timestamp >= NOW() - intervalo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View para dashboard admin
CREATE OR REPLACE VIEW logs_dashboard AS
SELECT
  DATE_TRUNC('hour', timestamp) as hora,
  nivel,
  categoria,
  COUNT(*) as quantidade
FROM logs_sistema
WHERE timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', timestamp), nivel, categoria
ORDER BY hora DESC;

-- Comentários para documentação
COMMENT ON TABLE logs_sistema IS 'Logs de sistema para auditoria médica e compliance';
COMMENT ON COLUMN logs_sistema.evento IS 'Nome do evento registrado';
COMMENT ON COLUMN logs_sistema.dados IS 'Dados adicionais do evento em formato JSON';
COMMENT ON COLUMN logs_sistema.nivel IS 'Nível de importância: info, warning, error, success';
COMMENT ON COLUMN logs_sistema.categoria IS 'Categoria do evento: avaliacao_clinica, ia_aprendizado, etc';

-- Trigger para limpeza automática (opcional - rodar mensalmente)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('limpar-logs-mensalmente', '0 0 1 * *', 'SELECT limpar_logs_antigos()');

