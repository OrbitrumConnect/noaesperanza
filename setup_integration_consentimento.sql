-- ========================================
-- SETUP COMPLETO: INTEGRAÇÃO DASHBOARDS + CONSENTIMENTO
-- Sistema de compartilhamento e permissões
-- ========================================

-- ========================================
-- 1. TABELA DE CONSENTIMENTOS
-- ========================================

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  consent_type VARCHAR(50) NOT NULL, 
  -- Tipos: lgpd, termsOfUse, dataSharing, research, emailNotifications, smsNotifications
  consent_given BOOLEAN DEFAULT FALSE,
  consent_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: usuário só pode ter um consentimento ativo de cada tipo
  UNIQUE(user_id, consent_type, revoked_date)
);

COMMENT ON TABLE user_consents IS 'Armazena todos os consentimentos dados pelo usuário (LGPD)';
COMMENT ON COLUMN user_consents.consent_type IS 'Tipo de consentimento: lgpd, termsOfUse, dataSharing, research, emailNotifications, smsNotifications';
COMMENT ON COLUMN user_consents.revoked_date IS 'Se preenchido, indica que consentimento foi revogado';

-- ========================================
-- 2. TABELA DE COMPARTILHAMENTO DE RELATÓRIOS
-- ========================================

CREATE TABLE IF NOT EXISTS shared_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_id UUID REFERENCES avaliacoes_iniciais(id) ON DELETE CASCADE NOT NULL,
  permission_level INTEGER DEFAULT 1, 
  -- 1: read only, 2: read + comment, 3: full access
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active', 
  -- active, revoked
  notes TEXT,
  doctor_notes TEXT, -- Anotações privadas do médico
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: não permitir duplicação
  UNIQUE(patient_id, doctor_id, report_id, status)
);

COMMENT ON TABLE shared_reports IS 'Controla compartilhamento de relatórios entre pacientes e médicos';
COMMENT ON COLUMN shared_reports.permission_level IS '1=leitura, 2=leitura+comentário, 3=acesso completo';

-- ========================================
-- 3. TABELA DE NOTIFICAÇÕES
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL, 
  -- report_shared, new_patient, appointment_reminder, exam_result, prescription_ready
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  link VARCHAR(500),
  metadata JSONB DEFAULT '{}',
  priority VARCHAR(20) DEFAULT 'normal', 
  -- urgent, high, normal, low
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Sistema de notificações para usuários';

-- ========================================
-- 4. TABELA DE PRESCRIÇÕES MÉDICAS
-- ========================================

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  medications JSONB NOT NULL, 
  -- [{name, dosage, frequency, duration, instructions}]
  diagnosis TEXT,
  clinical_indication TEXT,
  notes TEXT,
  patient_instructions TEXT,
  status VARCHAR(20) DEFAULT 'active', 
  -- active, completed, cancelled, expired
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Validação: medications deve ser array
  CONSTRAINT medications_is_array CHECK (jsonb_typeof(medications) = 'array')
);

COMMENT ON TABLE prescriptions IS 'Prescrições médicas digitais';
COMMENT ON COLUMN prescriptions.medications IS 'Array JSON com medicamentos: [{name, dosage, frequency, duration}]';

-- ========================================
-- 5. TABELA DE SOLICITAÇÃO DE EXAMES
-- ========================================

CREATE TABLE IF NOT EXISTS exam_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exam_type VARCHAR(100) NOT NULL,
  exam_category VARCHAR(50), 
  -- laboratorial, imagem, funcional, etc
  urgency VARCHAR(20) DEFAULT 'routine', 
  -- urgent, priority, routine
  instructions TEXT,
  clinical_indication TEXT,
  result_file_url TEXT,
  result_summary TEXT,
  result_data JSONB,
  status VARCHAR(20) DEFAULT 'pending', 
  -- pending, scheduled, in_progress, completed, cancelled
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by_doctor BOOLEAN DEFAULT FALSE,
  doctor_review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE exam_requests IS 'Solicitações de exames médicos';

-- ========================================
-- 6. TABELA DE AGENDAMENTOS
-- ========================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER DEFAULT 30, 
  -- duração em minutos
  type VARCHAR(50) DEFAULT 'consultation', 
  -- consultation, return, exam, emergency, telemedicine
  specialty VARCHAR(50),
  status VARCHAR(20) DEFAULT 'scheduled', 
  -- scheduled, confirmed, in_progress, completed, cancelled, no_show, rescheduled
  notes TEXT,
  patient_complaint TEXT,
  doctor_notes TEXT,
  prescription_id UUID REFERENCES prescriptions(id),
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: não permitir agendamentos no passado
  CONSTRAINT appointment_in_future CHECK (appointment_date > NOW() OR status != 'scheduled')
);

COMMENT ON TABLE appointments IS 'Agendamentos de consultas';

-- ========================================
-- 7. TABELA DE PRONTUÁRIO MÉDICO
-- ========================================

CREATE TABLE IF NOT EXISTS medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id),
  record_type VARCHAR(50) DEFAULT 'consultation', 
  -- consultation, exam_review, prescription, follow_up
  chief_complaint TEXT,
  history_present_illness TEXT,
  physical_examination TEXT,
  diagnosis_primary TEXT,
  diagnosis_secondary TEXT[],
  treatment_plan TEXT,
  medications_prescribed JSONB,
  exams_requested JSONB,
  follow_up_instructions TEXT,
  next_appointment_recommendation TEXT,
  clinical_evolution TEXT,
  is_confidential BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE medical_records IS 'Prontuário médico eletrônico completo';

-- ========================================
-- 8. ÍNDICES PARA PERFORMANCE
-- ========================================

-- user_consents
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_consent_type ON user_consents(consent_type);
CREATE INDEX IF NOT EXISTS idx_user_consents_active ON user_consents(user_id, consent_type) WHERE revoked_date IS NULL;

-- shared_reports
CREATE INDEX IF NOT EXISTS idx_shared_reports_patient_id ON shared_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_doctor_id ON shared_reports(doctor_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_status ON shared_reports(status);
CREATE INDEX IF NOT EXISTS idx_shared_reports_doctor_active ON shared_reports(doctor_id, status) WHERE status = 'active';

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- prescriptions
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);

-- exam_requests
CREATE INDEX IF NOT EXISTS idx_exam_requests_patient_id ON exam_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_exam_requests_doctor_id ON exam_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_exam_requests_status ON exam_requests(status);

-- appointments
CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- medical_records
CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_created_at ON medical_records(created_at DESC);

-- ========================================
-- 9. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ========================================

-- Função genérica para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
DROP TRIGGER IF EXISTS update_user_consents_updated_at ON user_consents;
CREATE TRIGGER update_user_consents_updated_at
  BEFORE UPDATE ON user_consents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shared_reports_updated_at ON shared_reports;
CREATE TRIGGER update_shared_reports_updated_at
  BEFORE UPDATE ON shared_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exam_requests_updated_at ON exam_requests;
CREATE TRIGGER update_exam_requests_updated_at
  BEFORE UPDATE ON exam_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON medical_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLICIES: user_consents
-- ========================================

CREATE POLICY "Usuários veem seus próprios consentimentos"
  ON user_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários gerenciam seus próprios consentimentos"
  ON user_consents FOR ALL
  USING (auth.uid() = user_id);

-- ========================================
-- POLICIES: shared_reports
-- ========================================

CREATE POLICY "Pacientes veem relatórios que compartilharam"
  ON shared_reports FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Médicos veem relatórios compartilhados com eles"
  ON shared_reports FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Pacientes podem compartilhar seus relatórios"
  ON shared_reports FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Pacientes podem atualizar/revogar compartilhamentos"
  ON shared_reports FOR UPDATE
  USING (auth.uid() = patient_id);

CREATE POLICY "Médicos podem adicionar notas"
  ON shared_reports FOR UPDATE
  USING (auth.uid() = doctor_id);

-- ========================================
-- POLICIES: notifications
-- ========================================

CREATE POLICY "Usuários veem suas próprias notificações"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem marcar notificações como lidas"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- ========================================
-- POLICIES: prescriptions
-- ========================================

CREATE POLICY "Pacientes veem suas prescrições"
  ON prescriptions FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Médicos veem prescrições que criaram"
  ON prescriptions FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Médicos podem criar prescrições"
  ON prescriptions FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Médicos podem atualizar suas prescrições"
  ON prescriptions FOR UPDATE
  USING (auth.uid() = doctor_id);

-- ========================================
-- POLICIES: exam_requests
-- ========================================

CREATE POLICY "Pacientes veem seus exames"
  ON exam_requests FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Médicos veem exames que solicitaram"
  ON exam_requests FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Médicos podem solicitar exames"
  ON exam_requests FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Médicos podem atualizar solicitações"
  ON exam_requests FOR UPDATE
  USING (auth.uid() = doctor_id);

-- ========================================
-- POLICIES: appointments
-- ========================================

CREATE POLICY "Pacientes veem seus agendamentos"
  ON appointments FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Médicos veem agendamentos com eles"
  ON appointments FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Pacientes e médicos podem criar agendamentos"
  ON appointments FOR INSERT
  WITH CHECK (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Ambos podem atualizar agendamentos"
  ON appointments FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

-- ========================================
-- POLICIES: medical_records
-- ========================================

CREATE POLICY "Pacientes veem seus prontuários"
  ON medical_records FOR SELECT
  USING (auth.uid() = patient_id AND is_confidential = FALSE);

CREATE POLICY "Médicos veem prontuários que criaram"
  ON medical_records FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Médicos podem criar prontuários"
  ON medical_records FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Médicos podem atualizar prontuários"
  ON medical_records FOR UPDATE
  USING (auth.uid() = doctor_id);

-- ========================================
-- 11. FUNÇÕES AUXILIARES
-- ========================================

-- Função para verificar se usuário tem consentimento
CREATE OR REPLACE FUNCTION has_consent(
  p_user_id UUID,
  p_consent_type VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
  v_consent_given BOOLEAN;
BEGIN
  SELECT consent_given INTO v_consent_given
  FROM user_consents
  WHERE user_id = p_user_id
    AND consent_type = p_consent_type
    AND revoked_date IS NULL
  ORDER BY created_at DESC
  LIMIT 1;
  
  RETURN COALESCE(v_consent_given, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar notificação
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_link VARCHAR DEFAULT NULL,
  p_priority VARCHAR DEFAULT 'normal'
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link,
    priority
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_link,
    p_priority
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 12. DADOS INICIAIS (OPCIONAL)
-- ========================================

-- Inserir tipos de consentimento padrão (referência)
-- Estes não são dados reais, apenas documentação
COMMENT ON TABLE user_consents IS 
'Tipos de consentimento suportados:
- lgpd: Consentimento LGPD (obrigatório)
- termsOfUse: Termos de Uso (obrigatório)  
- dataSharing: Compartilhar dados com médicos (opcional)
- research: Usar dados para pesquisa (opcional)
- emailNotifications: Receber emails (opcional)
- smsNotifications: Receber SMS (opcional)';

-- ========================================
-- ✅ SETUP COMPLETO!
-- ========================================

SELECT 
  '✅ Setup completo! Tabelas criadas:' as status,
  COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'user_consents',
    'shared_reports', 
    'notifications',
    'prescriptions',
    'exam_requests',
    'appointments',
    'medical_records'
  );

