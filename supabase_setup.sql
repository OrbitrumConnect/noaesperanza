-- Script para criar a tabela de avaliações clínicas no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de avaliações clínicas
CREATE TABLE IF NOT EXISTS clinical_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
  etapa_atual TEXT NOT NULL,
  dados JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_clinical_evaluations_user_id ON clinical_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_clinical_evaluations_session_id ON clinical_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_clinical_evaluations_status ON clinical_evaluations(status);
CREATE INDEX IF NOT EXISTS idx_clinical_evaluations_created_at ON clinical_evaluations(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE clinical_evaluations ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura e escrita para usuários autenticados
CREATE POLICY "Users can manage their own clinical evaluations" ON clinical_evaluations
  FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL);

-- Política para permitir leitura pública (para avaliações anônimas)
CREATE POLICY "Allow public read access to clinical evaluations" ON clinical_evaluations
  FOR SELECT USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_clinical_evaluations_updated_at 
  BEFORE UPDATE ON clinical_evaluations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE clinical_evaluations IS 'Tabela para armazenar avaliações clínicas da NOA Esperanza';
COMMENT ON COLUMN clinical_evaluations.user_id IS 'ID do usuário (pode ser NULL para avaliações anônimas)';
COMMENT ON COLUMN clinical_evaluations.session_id IS 'ID único da sessão de avaliação';
COMMENT ON COLUMN clinical_evaluations.status IS 'Status da avaliação: in_progress ou completed';
COMMENT ON COLUMN clinical_evaluations.etapa_atual IS 'Etapa atual da avaliação clínica';
COMMENT ON COLUMN clinical_evaluations.dados IS 'Dados da avaliação em formato JSON';
