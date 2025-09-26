-- ============================================
-- 🏥 NOA ESPERANZA - SETUP COMPLETO DO BANCO
-- ============================================
-- Execute este script no SQL Editor do Supabase

-- 1. CRIAR TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
  specialty TEXT CHECK (specialty IN ('rim', 'neuro', 'cannabis')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR TABELA DE PACIENTES
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  cpf TEXT UNIQUE,
  phone TEXT,
  birth_date DATE,
  address TEXT,
  emergency_contact TEXT,
  medical_history JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA DE MÉDICOS
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  crm TEXT UNIQUE NOT NULL,
  specialty TEXT NOT NULL CHECK (specialty IN ('rim', 'neuro', 'cannabis')),
  phone TEXT,
  consultation_price DECIMAL(10,2),
  available_hours JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA DE CONSULTAS
CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  prescription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR TABELA DE PAGAMENTOS
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method TEXT CHECK (payment_method IN ('pix', 'credit_card')),
  mercado_pago_id TEXT,
  plan TEXT CHECK (plan IN ('basic', 'premium', 'enterprise')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR TABELA DE AVALIAÇÕES CLÍNICAS
CREATE TABLE IF NOT EXISTS clinical_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed')),
  etapa_atual TEXT NOT NULL,
  dados JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CRIAR TABELA DE APRENDIZADO DA IA
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

-- 8. CRIAR TABELA DE PALAVRAS-CHAVE DA IA
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

-- 9. CRIAR TABELA DE PADRÕES DE CONVERSA
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

-- ============================================
-- 🔧 ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Índices para patients
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);

-- Índices para doctors
CREATE INDEX IF NOT EXISTS idx_doctors_user_id ON doctors(user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_crm ON doctors(crm);
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);

-- Índices para appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- Índices para payments
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Índices para clinical_evaluations
CREATE INDEX IF NOT EXISTS idx_clinical_evaluations_user_id ON clinical_evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_clinical_evaluations_session_id ON clinical_evaluations(session_id);
CREATE INDEX IF NOT EXISTS idx_clinical_evaluations_status ON clinical_evaluations(status);
CREATE INDEX IF NOT EXISTS idx_clinical_evaluations_created_at ON clinical_evaluations(created_at);

-- Índices para ai_learning
CREATE INDEX IF NOT EXISTS idx_ai_learning_keyword ON ai_learning(keyword);
CREATE INDEX IF NOT EXISTS idx_ai_learning_category ON ai_learning(category);
CREATE INDEX IF NOT EXISTS idx_ai_learning_confidence ON ai_learning(confidence_score);
CREATE INDEX IF NOT EXISTS idx_ai_learning_usage ON ai_learning(usage_count);
CREATE INDEX IF NOT EXISTS idx_ai_learning_last_used ON ai_learning(last_used);

-- Índices para ai_keywords
CREATE INDEX IF NOT EXISTS idx_ai_keywords_keyword ON ai_keywords(keyword);
CREATE INDEX IF NOT EXISTS idx_ai_keywords_category ON ai_keywords(category);
CREATE INDEX IF NOT EXISTS idx_ai_keywords_importance ON ai_keywords(importance_score);

-- Índices para ai_conversation_patterns
CREATE INDEX IF NOT EXISTS idx_ai_patterns_type ON ai_conversation_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_success ON ai_conversation_patterns(success_rate);

-- ============================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_patterns ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para patients
CREATE POLICY "Users can manage their own patient data" ON patients
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Políticas para doctors
CREATE POLICY "Users can manage their own doctor data" ON doctors
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Políticas para appointments
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR SELECT USING (
    auth.uid()::text IN (
      SELECT user_id::text FROM patients WHERE id = patient_id
      UNION
      SELECT user_id::text FROM doctors WHERE id = doctor_id
    )
  );

-- Políticas para payments
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Políticas para clinical_evaluations
CREATE POLICY "Users can manage their own clinical evaluations" ON clinical_evaluations
  FOR ALL USING (auth.uid()::text = user_id::text OR user_id IS NULL);

-- Políticas para AI learning (público para leitura)
CREATE POLICY "Allow public read access to AI learning" ON ai_learning
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert AI learning" ON ai_learning
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Políticas para AI keywords (público para leitura)
CREATE POLICY "Allow public read access to AI keywords" ON ai_keywords
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage AI keywords" ON ai_keywords
  FOR ALL WITH CHECK (auth.role() = 'authenticated');

-- Políticas para AI patterns (público para leitura)
CREATE POLICY "Allow public read access to AI patterns" ON ai_conversation_patterns
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage AI patterns" ON ai_conversation_patterns
  FOR ALL WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 🔄 FUNÇÕES E TRIGGERS
-- ============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at 
  BEFORE UPDATE ON patients 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at 
  BEFORE UPDATE ON doctors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at 
  BEFORE UPDATE ON appointments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
  BEFORE UPDATE ON payments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clinical_evaluations_updated_at 
  BEFORE UPDATE ON clinical_evaluations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_learning_updated_at 
  BEFORE UPDATE ON ai_learning 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_keywords_updated_at 
  BEFORE UPDATE ON ai_keywords 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_patterns_updated_at 
  BEFORE UPDATE ON ai_conversation_patterns 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 📊 DADOS INICIAIS
-- ============================================

-- Inserir palavras-chave iniciais da IA
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
('convulsão', 'neurology', 0.9),
('epilepsia', 'neurology', 0.9),
('CBD', 'cannabis', 0.8),
('THC', 'cannabis', 0.8),
('hipertensão', 'medical', 0.7),
('diabetes', 'medical', 0.7)
ON CONFLICT (keyword) DO NOTHING;

-- ============================================
-- ✅ SETUP COMPLETO!
-- ============================================

-- Comentários para documentação
COMMENT ON TABLE users IS 'Tabela de usuários do sistema NOA Esperanza';
COMMENT ON TABLE patients IS 'Tabela de pacientes com dados médicos';
COMMENT ON TABLE doctors IS 'Tabela de médicos e suas especialidades';
COMMENT ON TABLE appointments IS 'Tabela de consultas agendadas';
COMMENT ON TABLE payments IS 'Tabela de pagamentos e assinaturas';
COMMENT ON TABLE clinical_evaluations IS 'Tabela de avaliações clínicas da NOA';
COMMENT ON TABLE ai_learning IS 'Tabela de aprendizado da IA';
COMMENT ON TABLE ai_keywords IS 'Tabela de palavras-chave aprendidas pela IA';
COMMENT ON TABLE ai_conversation_patterns IS 'Tabela de padrões de conversa aprendidos';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '🎉 SETUP COMPLETO DO BANCO NOA ESPERANZA!';
  RAISE NOTICE '✅ Todas as tabelas foram criadas';
  RAISE NOTICE '✅ Índices de performance configurados';
  RAISE NOTICE '✅ RLS (Row Level Security) ativado';
  RAISE NOTICE '✅ Triggers de updated_at configurados';
  RAISE NOTICE '✅ Dados iniciais inseridos';
  RAISE NOTICE '🚀 Sistema pronto para uso!';
END $$;
