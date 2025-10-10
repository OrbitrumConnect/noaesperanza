-- ========================================
-- 🔐 INTEGRAÇÃO: CONSENTIMENTOS + COMPARTILHAMENTO
-- Sistema completo de consentimentos LGPD e compartilhamento
-- ========================================

-- ========================================
-- TABELA 1: CONSENTIMENTOS (LGPD)
-- ========================================

CREATE TABLE IF NOT EXISTS user_consents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL,
  granted BOOLEAN DEFAULT FALSE,
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, consent_type)
);

COMMENT ON TABLE user_consents IS 'Consentimentos LGPD do usuário';
COMMENT ON COLUMN user_consents.consent_type IS 'Tipos: lgpd, termsOfUse, dataSharing, research, emailNotifications, smsNotifications';

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_type ON user_consents(consent_type);

-- ========================================
-- TABELA 2: COMPARTILHAMENTOS
-- ========================================

CREATE TABLE IF NOT EXISTS shared_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_id UUID NOT NULL,
  report_type VARCHAR(50) DEFAULT 'clinical_assessment',
  permission_level INTEGER DEFAULT 1, -- 1=leitura, 2=comentar, 3=editar
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE shared_reports IS 'Compartilhamento de relatórios paciente → médico';
COMMENT ON COLUMN shared_reports.permission_level IS '1=leitura, 2=comentar, 3=editar';

-- Índices
CREATE INDEX IF NOT EXISTS idx_shared_reports_patient ON shared_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_doctor ON shared_reports(doctor_id);
CREATE INDEX IF NOT EXISTS idx_shared_reports_report ON shared_reports(report_id);

-- ========================================
-- TABELA 3: NOTIFICAÇÕES
-- ========================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE notifications IS 'Notificações do sistema';

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- ========================================
-- TABELA 4: PRESCRIÇÕES (COM COMPLIANCE RDC)
-- ========================================

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100),
  frequency VARCHAR(100),
  duration VARCHAR(100),
  instructions TEXT,
  diagnosis TEXT,
  cid10_code VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, dispensed, cancelled
  
  -- 🔐 COMPLIANCE RDC 660/327
  reuni_product_id UUID REFERENCES reuni_products(id),
  rdc_660_compliant BOOLEAN DEFAULT FALSE,
  rdc_327_compliant BOOLEAN DEFAULT FALSE,
  anvisa_notification_sent BOOLEAN DEFAULT FALSE,
  special_recipe_number VARCHAR(50),
  special_recipe_type VARCHAR(20), -- A, B, C
  requires_special_control BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  prescribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  dispensed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE prescriptions IS 'Prescrições médicas com compliance RDC 660/327';
COMMENT ON COLUMN prescriptions.rdc_660_compliant IS 'Validação automática RDC 660/2022';
COMMENT ON COLUMN prescriptions.rdc_327_compliant IS 'Validação automática RDC 327/2019';
COMMENT ON COLUMN prescriptions.special_recipe_number IS 'Número da receita especial (obrigatório para cannabis)';

-- Índices
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_reuni_product ON prescriptions(reuni_product_id);

-- ========================================
-- TABELA 5: SOLICITAÇÕES DE EXAMES
-- ========================================

CREATE TABLE IF NOT EXISTS exam_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_type VARCHAR(100) NOT NULL,
  exam_description TEXT,
  urgency VARCHAR(20) DEFAULT 'normal', -- routine, urgent, emergency
  clinical_indication TEXT,
  status VARCHAR(50) DEFAULT 'requested', -- requested, scheduled, completed, cancelled
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result_available BOOLEAN DEFAULT FALSE,
  result_file_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE exam_requests IS 'Solicitações de exames médicos';

-- Índices
CREATE INDEX IF NOT EXISTS idx_exam_requests_patient ON exam_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_exam_requests_doctor ON exam_requests(doctor_id);
CREATE INDEX IF NOT EXISTS idx_exam_requests_status ON exam_requests(status);

-- ========================================
-- TABELA 6: AGENDAMENTOS
-- ========================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_type VARCHAR(50) NOT NULL, -- consultation, followup, exam
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, no_show
  location VARCHAR(255),
  is_online BOOLEAN DEFAULT FALSE,
  meeting_link VARCHAR(500),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE appointments IS 'Agendamentos de consultas';

-- Índices
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- ========================================
-- TABELA 7: PRONTUÁRIOS
-- ========================================

CREATE TABLE IF NOT EXISTS medical_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id),
  record_type VARCHAR(50) NOT NULL, -- consultation, exam_result, prescription, note
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  tags VARCHAR(100)[],
  is_confidential BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE medical_records IS 'Prontuário médico do paciente';

-- Índices
CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_doctor ON medical_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_type ON medical_records(record_type);

-- ========================================
-- FUNÇÃO: VALIDAÇÃO RDC COMPLIANCE
-- ========================================

CREATE OR REPLACE FUNCTION validate_rdc_compliance()
RETURNS TRIGGER AS $$
DECLARE
  product RECORD;
BEGIN
  -- Se prescrição é de produto REUNI, validar compliance
  IF NEW.reuni_product_id IS NOT NULL THEN
    SELECT * INTO product FROM reuni_products WHERE id = NEW.reuni_product_id;
    
    IF FOUND THEN
      -- RDC 660: Produto REUNI válido
      NEW.rdc_660_compliant := TRUE;
      
      -- RDC 327: Requer receita especial
      IF product.requires_special_recipe THEN
        IF NEW.special_recipe_number IS NULL OR NEW.special_recipe_number = '' THEN
          RAISE EXCEPTION 'Produto REUNI requer número de receita especial (RDC 327/2019)';
        END IF;
        NEW.rdc_327_compliant := TRUE;
        NEW.requires_special_control := TRUE;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
DROP TRIGGER IF EXISTS validate_prescription_rdc ON prescriptions;
CREATE TRIGGER validate_prescription_rdc
  BEFORE INSERT OR UPDATE ON prescriptions
  FOR EACH ROW
  EXECUTE FUNCTION validate_rdc_compliance();

-- ========================================
-- POLÍTICAS RLS
-- ========================================

-- Habilitar RLS
ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- ========================================
-- RLS: USER_CONSENTS
-- ========================================

DROP POLICY IF EXISTS "Users manage own consents" ON user_consents;
CREATE POLICY "Users manage own consents" 
  ON user_consents FOR ALL 
  USING (user_id = auth.uid());

-- ========================================
-- RLS: SHARED_REPORTS
-- ========================================

DROP POLICY IF EXISTS "Patients manage shared reports" ON shared_reports;
CREATE POLICY "Patients manage shared reports" 
  ON shared_reports FOR ALL 
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors view shared reports" ON shared_reports;
CREATE POLICY "Doctors view shared reports" 
  ON shared_reports FOR SELECT 
  USING (doctor_id = auth.uid() AND revoked_at IS NULL);

-- ========================================
-- RLS: NOTIFICATIONS
-- ========================================

DROP POLICY IF EXISTS "Users see own notifications" ON notifications;
CREATE POLICY "Users see own notifications" 
  ON notifications FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" 
  ON notifications FOR UPDATE 
  USING (user_id = auth.uid());

-- ========================================
-- RLS: PRESCRIPTIONS
-- ========================================

DROP POLICY IF EXISTS "Patients view own prescriptions" ON prescriptions;
CREATE POLICY "Patients view own prescriptions" 
  ON prescriptions FOR SELECT 
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors manage prescriptions" ON prescriptions;
CREATE POLICY "Doctors manage prescriptions" 
  ON prescriptions FOR ALL 
  USING (
    doctor_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM noa_users 
      WHERE noa_users.user_id = auth.uid() 
      AND noa_users.user_type IN ('doctor', 'admin')
    )
  );

-- ========================================
-- RLS: EXAM_REQUESTS
-- ========================================

DROP POLICY IF EXISTS "Patients view own exam requests" ON exam_requests;
CREATE POLICY "Patients view own exam requests" 
  ON exam_requests FOR SELECT 
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors manage exam requests" ON exam_requests;
CREATE POLICY "Doctors manage exam requests" 
  ON exam_requests FOR ALL 
  USING (doctor_id = auth.uid());

-- ========================================
-- RLS: APPOINTMENTS
-- ========================================

DROP POLICY IF EXISTS "Users see own appointments" ON appointments;
CREATE POLICY "Users see own appointments" 
  ON appointments FOR SELECT 
  USING (patient_id = auth.uid() OR doctor_id = auth.uid());

DROP POLICY IF EXISTS "Doctors manage appointments" ON appointments;
CREATE POLICY "Doctors manage appointments" 
  ON appointments FOR ALL 
  USING (doctor_id = auth.uid());

-- ========================================
-- RLS: MEDICAL_RECORDS
-- ========================================

DROP POLICY IF EXISTS "Patients view own records" ON medical_records;
CREATE POLICY "Patients view own records" 
  ON medical_records FOR SELECT 
  USING (patient_id = auth.uid());

DROP POLICY IF EXISTS "Doctors manage records" ON medical_records;
CREATE POLICY "Doctors manage records" 
  ON medical_records FOR ALL 
  USING (doctor_id = auth.uid());

-- ========================================
-- TRIGGERS: TIMESTAMPS
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_consents_updated_at ON user_consents;
CREATE TRIGGER update_user_consents_updated_at
    BEFORE UPDATE ON user_consents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shared_reports_updated_at ON shared_reports;
CREATE TRIGGER update_shared_reports_updated_at
    BEFORE UPDATE ON shared_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prescriptions_updated_at ON prescriptions;
CREATE TRIGGER update_prescriptions_updated_at
    BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_exam_requests_updated_at ON exam_requests;
CREATE TRIGGER update_exam_requests_updated_at
    BEFORE UPDATE ON exam_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- ✅ SETUP COMPLETO!
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ INTEGRAÇÃO INSTALADA COM SUCESSO!';
  RAISE NOTICE '====================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Tabelas criadas:';
  RAISE NOTICE '- user_consents (consentimentos LGPD)';
  RAISE NOTICE '- shared_reports (compartilhamento)';
  RAISE NOTICE '- notifications (notificações)';
  RAISE NOTICE '- prescriptions (prescrições com RDC)';
  RAISE NOTICE '- exam_requests (solicitações de exames)';
  RAISE NOTICE '- appointments (agendamentos)';
  RAISE NOTICE '- medical_records (prontuários)';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Sistema 100% pronto!';
  RAISE NOTICE '====================================';
END $$;

