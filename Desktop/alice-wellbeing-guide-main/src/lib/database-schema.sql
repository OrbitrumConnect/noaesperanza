-- BANCO DE DADOS ALICE - CLÍNICA DE SAÚDE E BEM-ESTAR
-- Schema completo para Supabase/PostgreSQL

-- 1. TABELA DE USUÁRIOS/PACIENTES
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Dados básicos
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20),
  birth_date DATE,
  gender VARCHAR(20),
  city VARCHAR(100),
  state VARCHAR(2),
  profession VARCHAR(100),
  
  -- Dados físicos
  height DECIMAL(5,2), -- em metros
  weight DECIMAL(5,2), -- em kg
  
  -- Preferências gerais
  preferred_language VARCHAR(10) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  
  -- Consentimentos
  consent_data_usage BOOLEAN DEFAULT FALSE,
  consent_educational_content BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  last_login TIMESTAMP WITH TIME ZONE,
  total_sessions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 2. TABELA DE PERFIL DE SAÚDE
CREATE TABLE health_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Condições de saúde
  medical_conditions TEXT[], -- array de condições
  medications TEXT[], -- array de medicamentos
  allergies TEXT[], -- array de alergias
  surgeries TEXT[], -- array de cirurgias passadas
  
  -- Hábitos relacionados à saúde
  smoking BOOLEAN DEFAULT FALSE,
  alcohol_consumption VARCHAR(20), -- 'none', 'occasional', 'moderate', 'frequent'
  
  -- Restrições e preferências
  dietary_restrictions TEXT[], -- vegetariano, vegano, sem glúten, etc.
  exercise_limitations TEXT[], -- limitações físicas
  
  -- Observações médicas
  medical_notes TEXT,
  emergency_contact_name VARCHAR(100),
  emergency_contact_phone VARCHAR(20)
);

-- 3. TABELA DE OBJETIVOS
CREATE TABLE user_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Tipos de objetivos
  category VARCHAR(50) NOT NULL, -- 'weight', 'sleep', 'stress', 'nutrition', 'exercise'
  description TEXT NOT NULL,
  target_value DECIMAL(10,2), -- valor numérico quando aplicável
  target_unit VARCHAR(20), -- kg, horas, litros, etc.
  target_date DATE,
  priority INTEGER DEFAULT 1, -- 1=alta, 2=média, 3=baixa
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
  progress_percentage DECIMAL(5,2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. TABELA DE HÁBITOS DIÁRIOS
CREATE TABLE daily_habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Sono
  bedtime TIME,
  wake_time TIME,
  sleep_hours DECIMAL(3,1),
  sleep_quality INTEGER, -- 1-10
  
  -- Alimentação
  meals_count INTEGER DEFAULT 0,
  water_intake DECIMAL(4,1), -- em litros
  
  -- Atividade física
  exercise_minutes INTEGER DEFAULT 0,
  steps_count INTEGER,
  
  -- Bem-estar
  stress_level INTEGER, -- 1-10
  energy_level INTEGER, -- 1-10
  mood VARCHAR(20), -- 'great', 'good', 'neutral', 'low', 'bad'
  
  -- Observações
  notes TEXT,
  
  UNIQUE(user_id, date)
);

-- 5. TABELA DE CONVERSAS COM ALICE
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID NOT NULL, -- agrupa mensagens da mesma sessão
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Conteúdo da conversa
  user_message TEXT,
  alice_response TEXT,
  alice_emotion VARCHAR(20), -- 'neutral', 'happy', 'caring', 'encouraging'
  
  -- Contexto
  conversation_phase VARCHAR(50), -- 'introduction', 'assessment', 'planning', etc.
  detected_topics TEXT[], -- array de tópicos detectados
  user_mood VARCHAR(20), -- humor detectado do usuário
  
  -- Métricas
  response_time_ms INTEGER,
  user_satisfaction INTEGER, -- 1-5 se usuário avaliar
  
  -- Flags
  contains_health_data BOOLEAN DEFAULT FALSE,
  requires_followup BOOLEAN DEFAULT FALSE
);

-- 6. TABELA DE SESSÕES DE ATENDIMENTO
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  
  -- Informações da sessão
  session_type VARCHAR(50) DEFAULT 'conversation', -- 'conversation', 'assessment', 'followup'
  duration_minutes INTEGER,
  total_messages INTEGER DEFAULT 0,
  
  -- Resultados
  phase_completed VARCHAR(50),
  goals_defined INTEGER DEFAULT 0,
  plan_created BOOLEAN DEFAULT FALSE,
  satisfaction_rating INTEGER, -- 1-5
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'interrupted'
  completion_percentage DECIMAL(5,2) DEFAULT 0
);

-- 7. TABELA DE PLANOS EDUCATIVOS (MEV)
CREATE TABLE educational_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informações do plano
  plan_name VARCHAR(100) NOT NULL,
  plan_type VARCHAR(50) DEFAULT 'mev', -- 'mev', 'nutrition', 'exercise', 'sleep'
  description TEXT,
  
  -- Componentes do plano
  sleep_recommendations JSONB,
  nutrition_guidelines JSONB,
  exercise_plan JSONB,
  stress_management JSONB,
  hydration_goals JSONB,
  
  -- Configurações
  duration_weeks INTEGER DEFAULT 4,
  difficulty_level VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  
  -- Status
  status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 8. TABELA DE RECURSOS EDUCATIVOS
CREATE TABLE educational_resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Informações do recurso
  title VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'audio', 'video', 'article', 'exercise', 'pnl'
  subcategory VARCHAR(50), -- 'hertz_432', 'breathing', 'meditation', etc.
  description TEXT,
  
  -- Conteúdo
  content_url TEXT,
  content_text TEXT,
  duration_minutes INTEGER,
  
  -- Metadados
  difficulty_level VARCHAR(20) DEFAULT 'beginner',
  tags TEXT[],
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- 9. TABELA DE INTERAÇÕES COM RECURSOS
CREATE TABLE resource_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES educational_resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Detalhes da interação
  interaction_type VARCHAR(20) NOT NULL, -- 'view', 'complete', 'like', 'share'
  duration_minutes DECIMAL(5,2),
  completion_percentage DECIMAL(5,2) DEFAULT 0,
  
  -- Feedback
  rating INTEGER, -- 1-5
  feedback_text TEXT,
  
  -- Contexto
  accessed_from VARCHAR(50), -- 'alice_suggestion', 'user_search', 'plan_recommendation'
  device_type VARCHAR(20) -- 'mobile', 'desktop', 'tablet'
);

-- 10. TABELA DE RELATÓRIOS DE SAÚDE
CREATE TABLE health_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Período do relatório
  report_period_start DATE,
  report_period_end DATE,
  report_type VARCHAR(50) DEFAULT 'comprehensive', -- 'daily', 'weekly', 'monthly', 'comprehensive'
  
  -- Dados compilados
  sleep_summary JSONB,
  nutrition_summary JSONB,
  exercise_summary JSONB,
  wellness_summary JSONB,
  
  -- Insights e recomendações
  key_insights TEXT[],
  recommendations TEXT[],
  progress_notes TEXT,
  
  -- Configurações
  format VARCHAR(20) DEFAULT 'digital', -- 'digital', 'pdf', 'print'
  shared_with TEXT[], -- emails de profissionais que receberam
  
  -- Status
  status VARCHAR(20) DEFAULT 'generated' -- 'generated', 'reviewed', 'shared'
);

-- 11. TABELA DE LEMBRETES E NOTIFICAÇÕES
CREATE TABLE reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Configurações do lembrete
  title VARCHAR(100) NOT NULL,
  message TEXT,
  reminder_type VARCHAR(50) NOT NULL, -- 'water', 'exercise', 'meal', 'sleep', 'custom'
  
  -- Agendamento
  scheduled_time TIME,
  scheduled_days INTEGER[], -- array de dias da semana (0=domingo)
  frequency VARCHAR(20) DEFAULT 'daily', -- 'daily', 'weekly', 'custom'
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  last_sent TIMESTAMP WITH TIME ZONE,
  total_sent INTEGER DEFAULT 0,
  
  -- Preferências
  delivery_method VARCHAR(20) DEFAULT 'app', -- 'app', 'email', 'sms', 'whatsapp'
  sound_enabled BOOLEAN DEFAULT TRUE
);

-- 12. TABELA DE MÉTRICAS E ANALYTICS
CREATE TABLE user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Métricas de uso
  app_opens INTEGER DEFAULT 0,
  alice_interactions INTEGER DEFAULT 0,
  total_session_time_minutes INTEGER DEFAULT 0,
  
  -- Métricas de engajamento
  resources_accessed INTEGER DEFAULT 0,
  plans_followed INTEGER DEFAULT 0,
  goals_updated INTEGER DEFAULT 0,
  
  -- Métricas de saúde
  habits_logged INTEGER DEFAULT 0,
  sleep_score DECIMAL(3,1), -- média do período
  wellness_score DECIMAL(3,1), -- score calculado
  
  UNIQUE(user_id, date)
);

-- ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_conversations_user_session ON conversations(user_id, session_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_daily_habits_user_date ON daily_habits(user_id, date);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_educational_plans_user_id ON educational_plans(user_id);
CREATE INDEX idx_resource_interactions_user_id ON resource_interactions(user_id);
CREATE INDEX idx_health_reports_user_id ON health_reports(user_id);
CREATE INDEX idx_reminders_user_active ON reminders(user_id, is_active);
CREATE INDEX idx_user_analytics_user_date ON user_analytics(user_id, date);

-- TRIGGERS PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_profiles_updated_at BEFORE UPDATE ON health_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_educational_plans_updated_at BEFORE UPDATE ON educational_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Básica
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE educational_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Política básica: usuários só acessam seus próprios dados
CREATE POLICY "Users can only access their own data" ON users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can only access their own health profiles" ON health_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own goals" ON user_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own habits" ON daily_habits FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own conversations" ON conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own sessions" ON sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own plans" ON educational_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own interactions" ON resource_interactions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own reports" ON health_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own reminders" ON reminders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can only access their own analytics" ON user_analytics FOR ALL USING (auth.uid() = user_id);

-- Recursos educativos são públicos (apenas leitura)
CREATE POLICY "Educational resources are publicly readable" ON educational_resources FOR SELECT USING (is_active = true);