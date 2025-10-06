-- Script para criar o sistema de aprendizado da IA no Supabase
-- Execute este script no SQL Editor do Supabase

-- Criar tabela de aprendizado da IA
CREATE TABLE IF NOT EXISTS ai_learning (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL,
  context TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('medical', 'general', 'evaluation', 'cannabis', 'neurology', 'nephrology')),
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de palavras-chave aprendidas
CREATE TABLE IF NOT EXISTS ai_keywords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  importance_score DECIMAL(3,2) DEFAULT 0.5,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de padrões de conversa
CREATE TABLE IF NOT EXISTS ai_conversation_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_type TEXT NOT NULL,
  user_input_pattern TEXT NOT NULL,
  best_response TEXT NOT NULL,
  success_rate DECIMAL(3,2) DEFAULT 0.5,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ai_learning_keyword ON ai_learning(keyword);
CREATE INDEX IF NOT EXISTS idx_ai_learning_category ON ai_learning(category);
CREATE INDEX IF NOT EXISTS idx_ai_learning_confidence ON ai_learning(confidence_score);
CREATE INDEX IF NOT EXISTS idx_ai_learning_usage ON ai_learning(usage_count);
CREATE INDEX IF NOT EXISTS idx_ai_learning_last_used ON ai_learning(last_used);

CREATE INDEX IF NOT EXISTS idx_ai_keywords_keyword ON ai_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_ai_keywords_category ON ai_keywords(category);
CREATE INDEX IF NOT EXISTS idx_ai_keywords_importance ON ai_keywords(importance_score);

CREATE INDEX IF NOT EXISTS idx_ai_patterns_type ON ai_conversation_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_success ON ai_conversation_patterns(success_rate);

-- Habilitar RLS (Row Level Security)
ALTER TABLE ai_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_patterns ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir leitura e escrita para usuários autenticados
CREATE POLICY "Users can manage AI learning data" ON ai_learning
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage AI keywords" ON ai_keywords
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage AI patterns" ON ai_conversation_patterns
  FOR ALL USING (auth.role() = 'authenticated');

-- Políticas para permitir leitura pública (para a IA acessar)
CREATE POLICY "Allow public read access to AI learning" ON ai_learning
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to AI keywords" ON ai_keywords
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to AI patterns" ON ai_conversation_patterns
  FOR SELECT USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_ai_learning_updated_at 
  BEFORE UPDATE ON ai_learning 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_keywords_updated_at 
  BEFORE UPDATE ON ai_keywords 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_patterns_updated_at 
  BEFORE UPDATE ON ai_conversation_patterns 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar contador de uso
CREATE OR REPLACE FUNCTION increment_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.usage_count = OLD.usage_count + 1;
  NEW.last_used = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para incrementar contador de uso
CREATE TRIGGER increment_ai_learning_usage 
  BEFORE UPDATE ON ai_learning 
  FOR EACH ROW EXECUTE FUNCTION increment_usage_count();

CREATE TRIGGER increment_ai_keywords_usage 
  BEFORE UPDATE ON ai_keywords 
  FOR EACH ROW EXECUTE FUNCTION increment_usage_count();

CREATE TRIGGER increment_ai_patterns_usage 
  BEFORE UPDATE ON ai_conversation_patterns 
  FOR EACH ROW EXECUTE FUNCTION increment_usage_count();

-- Comentários para documentação
COMMENT ON TABLE ai_learning IS 'Tabela para armazenar aprendizado da IA - respostas e contextos';
COMMENT ON TABLE ai_keywords IS 'Tabela para armazenar palavras-chave aprendidas pela IA';
COMMENT ON TABLE ai_conversation_patterns IS 'Tabela para armazenar padrões de conversa aprendidos';

-- Inserir dados iniciais de exemplo
INSERT INTO ai_keywords (keyword, category, importance_score) VALUES
('dor de cabeça', 'medical', 0.9),
('cannabis medicinal', 'cannabis', 0.95),
('avaliação clínica', 'evaluation', 0.9),
('neurologia', 'neurology', 0.8),
('nefrologia', 'nephrology', 0.8),
('ansiedade', 'medical', 0.7),
('depressão', 'medical', 0.7),
('insônia', 'medical', 0.6),
('dor crônica', 'medical', 0.8),
('convulsão', 'neurology', 0.9)
ON CONFLICT (keyword) DO NOTHING;
