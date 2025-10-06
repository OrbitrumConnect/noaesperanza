-- ============================================
-- 🏥 NOA ESPERANZA - TABELAS FALTANTES
-- ============================================
-- Execute este script no SQL Editor do Supabase
-- (Você já tem: clinical_evaluations, ai_learning, ai_keywords, ai_conversation_patterns)

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

-- ============================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS nas novas tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

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

-- ============================================
-- 🔄 TRIGGERS PARA UPDATED_AT
-- ============================================

-- Função para atualizar updated_at automaticamente (se não existir)
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

-- ============================================
-- ✅ SETUP COMPLETO!
-- ============================================

-- Comentários para documentação
COMMENT ON TABLE users IS 'Tabela de usuários do sistema NOA Esperanza';
COMMENT ON TABLE patients IS 'Tabela de pacientes com dados médicos';
COMMENT ON TABLE doctors IS 'Tabela de médicos e suas especialidades';
COMMENT ON TABLE appointments IS 'Tabela de consultas agendadas';
COMMENT ON TABLE payments IS 'Tabela de pagamentos e assinaturas';

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '🎉 TABELAS FALTANTES CRIADAS COM SUCESSO!';
  RAISE NOTICE '✅ users - Tabela de usuários';
  RAISE NOTICE '✅ patients - Tabela de pacientes';
  RAISE NOTICE '✅ doctors - Tabela de médicos';
  RAISE NOTICE '✅ appointments - Tabela de consultas';
  RAISE NOTICE '✅ payments - Tabela de pagamentos';
  RAISE NOTICE '✅ Índices de performance configurados';
  RAISE NOTICE '✅ RLS (Row Level Security) ativado';
  RAISE NOTICE '✅ Triggers de updated_at configurados';
  RAISE NOTICE '🚀 Admin Dashboard agora funcionará!';
END $$;
