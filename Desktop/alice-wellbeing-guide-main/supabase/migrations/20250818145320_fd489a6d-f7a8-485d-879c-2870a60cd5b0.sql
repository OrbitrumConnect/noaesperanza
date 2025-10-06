-- Tabela de perfis de usuários (estende auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('masculino', 'feminino', 'outro')),
  height DECIMAL(5,2), -- em cm
  weight DECIMAL(5,2), -- em kg
  occupation TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  consent_data_usage BOOLEAN DEFAULT false,
  consent_treatment BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de perfis de saúde
CREATE TABLE public.health_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  medical_conditions TEXT[],
  current_medications TEXT[],
  allergies TEXT[],
  previous_surgeries TEXT[],
  family_history TEXT[],
  smoking_habits TEXT,
  alcohol_consumption TEXT,
  dietary_restrictions TEXT[],
  exercise_routine TEXT,
  sleep_hours INTEGER,
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de hábitos diários
CREATE TABLE public.daily_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  nutrition_quality INTEGER CHECK (nutrition_quality >= 1 AND nutrition_quality <= 10),
  exercise_level INTEGER CHECK (exercise_level >= 1 AND exercise_level <= 10),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 10),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  water_intake DECIMAL(4,2), -- em litros
  meal_times JSONB,
  supplements_taken TEXT[],
  symptoms TEXT[],
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de objetivos do usuário
CREATE TABLE public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  description TEXT NOT NULL,
  target_value DECIMAL(10,2),
  current_value DECIMAL(10,2),
  target_date DATE,
  priority TEXT CHECK (priority IN ('alta', 'media', 'baixa')),
  status TEXT CHECK (status IN ('ativo', 'concluido', 'pausado')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de conversas com Alice
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID,
  message_type TEXT CHECK (message_type IN ('user', 'alice')),
  message_content TEXT NOT NULL,
  topics_discussed TEXT[],
  data_collected JSONB,
  conversation_stage TEXT,
  mood_detected TEXT,
  biohacking_suggested TEXT,
  frequency_suggested TEXT,
  microverdes_suggested TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de sessões de usuário
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_type TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  topics_covered TEXT[],
  goals_discussed TEXT[],
  recommendations_given TEXT[],
  follow_up_required BOOLEAN DEFAULT false,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 10),
  notes TEXT
);

-- Tabela de planos educacionais
CREATE TABLE public.educational_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  plan_type TEXT,
  duration_days INTEGER,
  meal_plans JSONB,
  exercise_plans JSONB,
  biohacking_practices JSONB,
  microverdes_schedule JSONB,
  frequency_therapy JSONB,
  progress_markers JSONB,
  status TEXT CHECK (status IN ('ativo', 'concluido', 'pausado')) DEFAULT 'ativo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de recursos educacionais
CREATE TABLE public.educational_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_type TEXT CHECK (content_type IN ('artigo', 'video', 'audio', 'exercicio', 'receita')),
  category TEXT,
  content_url TEXT,
  description TEXT,
  tags TEXT[],
  difficulty_level TEXT CHECK (difficulty_level IN ('iniciante', 'intermediario', 'avancado')),
  estimated_duration INTEGER, -- em minutos
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de interações com recursos
CREATE TABLE public.resource_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_id UUID REFERENCES public.educational_resources(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN ('visualizado', 'concluido', 'favoritado', 'compartilhado')),
  completion_percentage DECIMAL(5,2) CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de relatórios de saúde
CREATE TABLE public.health_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  period_start DATE,
  period_end DATE,
  biomarcadores JSONB,
  isafe_score DECIMAL(5,2),
  isafe_zone TEXT,
  recommendations TEXT[],
  improvements_needed TEXT[],
  achievements TEXT[],
  next_evaluation_date DATE,
  generated_by TEXT, -- 'alice' ou 'dra_dayana'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de lembretes
CREATE TABLE public.reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_time TIMESTAMPTZ NOT NULL,
  frequency TEXT CHECK (frequency IN ('unico', 'diario', 'semanal', 'mensal')),
  is_active BOOLEAN DEFAULT true,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de analytics do usuário
CREATE TABLE public.user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  metric_unit TEXT,
  measurement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela para biomarcadores iSAFE
CREATE TABLE public.biomarcadores_isafe (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Biomarcadores Psico-Social-Emocional-Espiritual
  capacidade_funcional_1 INTEGER,
  limitacoes_aspectos_fisicos INTEGER,
  capacidade_funcional_2 INTEGER,
  nivel_dor_1 INTEGER,
  nivel_dor_2 INTEGER,
  vitalidade INTEGER,
  fadiga INTEGER,
  auto_relato_animo INTEGER,
  estresse INTEGER,
  nivel_ansiedade INTEGER,
  saude_bem_estar_mental INTEGER,
  saude_social INTEGER,
  auto_percepcao_felicidade INTEGER,
  saude_emocional INTEGER,
  nivel_sonolencia INTEGER,
  qualidade_sono INTEGER,
  disposicao_acordar INTEGER,
  saude_geral INTEGER,
  auto_percepcao_saude INTEGER,
  coeficiente_gratidao INTEGER,
  religiao_espiritualidade INTEGER,
  satisfacao_vida INTEGER,
  coeficiente_garra DECIMAL(5,3),
  
  -- Biomarcadores Físicos
  circunferencia_cintura DECIMAL(5,2),
  razao_cintura_quadril DECIMAL(4,3),
  circunferencia_pescoco DECIMAL(5,2),
  razao_cintura_estatura DECIMAL(4,3),
  imc DECIMAL(5,2),
  gordura_visceral DECIMAL(5,2),
  percentual_gordura DECIMAL(5,2),
  percentual_massa_muscular DECIMAL(5,2),
  preensao_manual_direita DECIMAL(5,2),
  preensao_manual_esquerda DECIMAL(5,2),
  vo2 DECIMAL(5,2),
  horas_sentado TIME,
  horas_tv_dia TIME,
  horas_tv_fim_semana TIME,
  escala_bristol INTEGER,
  
  -- Scores calculados
  isafe_score DECIMAL(5,2),
  isafe_zona TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biomarcadores_isafe ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - Usuários só veem seus próprios dados
CREATE POLICY "users_select_own_profile" ON public.profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_update_own_profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "users_insert_own_profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_select_own_health" ON public.health_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_manage_own_health" ON public.health_profiles FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users_select_own_habits" ON public.daily_habits FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_manage_own_habits" ON public.daily_habits FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users_select_own_goals" ON public.user_goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_manage_own_goals" ON public.user_goals FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users_select_own_conversations" ON public.conversations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_manage_own_conversations" ON public.conversations FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users_select_own_sessions" ON public.sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_manage_own_sessions" ON public.sessions FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users_select_own_plans" ON public.educational_plans FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_manage_own_plans" ON public.educational_plans FOR ALL USING (user_id = auth.uid());

-- Recursos educacionais são públicos para leitura
CREATE POLICY "public_read_resources" ON public.educational_resources FOR SELECT USING (true);

CREATE POLICY "users_select_own_interactions" ON public.resource_interactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_manage_own_interactions" ON public.resource_interactions FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users_select_own_reports" ON public.health_reports FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_manage_own_reports" ON public.health_reports FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users_select_own_reminders" ON public.reminders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_manage_own_reminders" ON public.reminders FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users_select_own_analytics" ON public.user_analytics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_manage_own_analytics" ON public.user_analytics FOR ALL USING (user_id = auth.uid());

CREATE POLICY "users_select_own_biomarcadores" ON public.biomarcadores_isafe FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "users_manage_own_biomarcadores" ON public.biomarcadores_isafe FOR ALL USING (user_id = auth.uid());

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_profiles_updated_at BEFORE UPDATE ON public.health_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_goals_updated_at BEFORE UPDATE ON public.user_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_educational_plans_updated_at BEFORE UPDATE ON public.educational_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_educational_resources_updated_at BEFORE UPDATE ON public.educational_resources FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX idx_daily_habits_user_date ON public.daily_habits(user_id, date);
CREATE INDEX idx_health_reports_user_id ON public.health_reports(user_id);
CREATE INDEX idx_biomarcadores_user_date ON public.biomarcadores_isafe(user_id, assessment_date);