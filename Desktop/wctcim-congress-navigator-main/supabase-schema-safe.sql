-- Schema seguro para o WCTCIM Congress Navigator
-- Execute este SQL no Supabase SQL Editor - não duplica dados existentes

-- Criar tabela de trabalhos científicos
CREATE TABLE IF NOT EXISTS scientific_works (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  authors JSONB NOT NULL,
  category TEXT NOT NULL,
  modality TEXT NOT NULL,
  presentation_type TEXT NOT NULL,
  abstract TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  schedule JSONB NOT NULL,
  location JSONB NOT NULL,
  media JSONB,
  status TEXT NOT NULL,
  institution TEXT NOT NULL,
  region TEXT NOT NULL,
  language TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de analytics
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  metric TEXT NOT NULL,
  value INTEGER DEFAULT 1,
  metadata JSONB,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de palestrantes
CREATE TABLE IF NOT EXISTS speakers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  institution TEXT NOT NULL,
  country TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  bio TEXT,
  photo_url TEXT,
  specializations TEXT[],
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de programação
CREATE TABLE IF NOT EXISTS schedule (
  id SERIAL PRIMARY KEY,
  day INTEGER NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  speaker_id INTEGER REFERENCES speakers(id),
  work_id TEXT REFERENCES scientific_works(id),
  room TEXT NOT NULL,
  capacity INTEGER,
  modality TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de estands/empresas
CREATE TABLE IF NOT EXISTS exhibitors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  website TEXT,
  email TEXT,
  phone TEXT,
  contact_person TEXT,
  logo_url TEXT,
  products TEXT[],
  services TEXT[],
  location JSONB,
  booth_number TEXT,
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de salas/auditórios
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  location JSONB NOT NULL,
  equipment TEXT[],
  description TEXT,
  floor INTEGER,
  building TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de usuários/participantes
CREATE TABLE IF NOT EXISTS participants (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  institution TEXT,
  country TEXT,
  registration_type TEXT,
  interests TEXT[],
  favorites JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de interações/analytics
CREATE TABLE IF NOT EXISTS interactions (
  id SERIAL PRIMARY KEY,
  participant_id INTEGER REFERENCES participants(id),
  interaction_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  target_type TEXT NOT NULL,
  duration INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_scientific_works_category ON scientific_works(category);
CREATE INDEX IF NOT EXISTS idx_scientific_works_modality ON scientific_works(modality);
CREATE INDEX IF NOT EXISTS idx_scientific_works_keywords ON scientific_works USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_analytics_metric ON analytics(metric);
CREATE INDEX IF NOT EXISTS idx_speakers_country ON speakers(country);
CREATE INDEX IF NOT EXISTS idx_speakers_institution ON speakers(institution);
CREATE INDEX IF NOT EXISTS idx_schedule_day ON schedule(day);
CREATE INDEX IF NOT EXISTS idx_schedule_room ON schedule(room);
CREATE INDEX IF NOT EXISTS idx_schedule_time ON schedule(time_start, time_end);
CREATE INDEX IF NOT EXISTS idx_exhibitors_category ON exhibitors(category);
CREATE INDEX IF NOT EXISTS idx_rooms_capacity ON rooms(capacity);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);

-- Verificar se existem dados e inserir apenas se necessário
DO $$
BEGIN
  -- Inserir dados de analytics apenas se não existirem
  IF NOT EXISTS (SELECT 1 FROM analytics WHERE metric = 'visitors' AND date = CURRENT_DATE) THEN
    INSERT INTO analytics (metric, value, date) VALUES
    ('visitors', 0, CURRENT_DATE),
    ('stand_visits', 0, CURRENT_DATE),
    ('work_views', 0, CURRENT_DATE);
  END IF;

  -- Inserir salas apenas se não existirem
  IF NOT EXISTS (SELECT 1 FROM rooms WHERE name = 'Sala 1 - Palco Principal') THEN
    INSERT INTO rooms (name, capacity, location, equipment, description, floor, building) VALUES
    ('Sala 1 - Palco Principal', 500, '{"x": 50, "y": 30, "type": "auditório"}', ARRAY['projetor', 'som', 'ar-condicionado'], 'Auditório principal do evento', 1, 'Pavilhão A'),
    ('Sala 2', 200, '{"x": 70, "y": 40, "type": "auditório"}', ARRAY['projetor', 'som'], 'Sala de apresentações', 1, 'Pavilhão A'),
    ('Sala 3', 150, '{"x": 30, "y": 70, "type": "auditório"}', ARRAY['projetor', 'som'], 'Sala de workshops', 1, 'Pavilhão A'),
    ('Área de Pôsteres', 100, '{"x": 20, "y": 60, "type": "área de pôsteres"}', ARRAY['iluminação', 'mesas'], 'Hall principal para pôsteres', 1, 'Pavilhão A');
  END IF;

  -- Inserir palestrantes apenas se não existirem
  IF NOT EXISTS (SELECT 1 FROM speakers WHERE name = 'Dr. Ana Paula Silva') THEN
    INSERT INTO speakers (name, title, institution, country, email, bio, specializations) VALUES
    ('Dr. Ana Paula Silva', 'Doutora em Medicina Integrativa', 'Universidade Federal de São Paulo', 'Brasil', 'ana.silva@unifesp.br', 'Especialista em medicina integrativa com foco em doenças crônicas', ARRAY['medicina integrativa', 'doenças crônicas', 'terapias complementares']),
    ('Prof. Carlos Mendes', 'Professor de Medicina', 'Universidade Federal de São Paulo', 'Brasil', 'carlos.mendes@unifesp.br', 'Professor e pesquisador em medicina integrativa', ARRAY['pesquisa clínica', 'medicina integrativa']),
    ('Dr. Roberto Chen', 'Especialista em MTC', 'Instituto de Medicina Tradicional Chinesa', 'Brasil', 'roberto.chen@imtc.com.br', 'Especialista em medicina tradicional chinesa e acupuntura', ARRAY['acupuntura', 'medicina tradicional chinesa', 'dor crônica']),
    ('Enf. Maria Santos', 'Enfermeira Especialista', 'Secretaria Municipal de Saúde', 'Brasil', 'maria.santos@sms.gov.br', 'Enfermeira especialista em práticas integrativas na atenção primária', ARRAY['práticas integrativas', 'atenção primária', 'yoga', 'meditação']),
    ('Psic. João Oliveira', 'Psicólogo Clínico', 'Clínica Integrativa', 'Brasil', 'joao.oliveira@clinica.com.br', 'Psicólogo especialista em mindfulness e terapia cognitivo-comportamental', ARRAY['mindfulness', 'ansiedade', 'terapia cognitivo-comportamental']),
    ('Dra. Fernanda Lima', 'Doutora em Pediatria', 'Universidade de Brasília', 'Brasil', 'fernanda.lima@unb.br', 'Pediatra especialista em medicina complementar', ARRAY['homeopatia', 'pediatria', 'medicina complementar']),
    ('Dr. Pedro Costa', 'Pesquisador', 'Universidade de Brasília', 'Brasil', 'pedro.costa@unb.br', 'Pesquisador em medicina complementar e pediatria', ARRAY['pesquisa', 'medicina complementar']),
    ('Musicoterapeuta Ana Beatriz', 'Musicoterapeuta', 'Hospital do Câncer', 'Brasil', 'ana.beatriz@hospcancer.com.br', 'Musicoterapeuta especialista em oncologia', ARRAY['musicoterapia', 'oncologia', 'quimioterapia']),
    ('Prof. Li Wei', 'Mestre em Artes Marciais', 'Centro de Artes Marciais', 'Brasil', 'li.wei@taiichi.com.br', 'Mestre em Tai Chi e especialista em bem-estar para idosos', ARRAY['tai chi', 'idosos', 'bem-estar']),
    ('Dra. Carmen Rodriguez', 'Reumatologista', 'Clínica de Reumatologia', 'Brasil', 'carmen.rodriguez@reuma.com.br', 'Reumatologista especialista em medicina integrativa', ARRAY['fibromialgia', 'acupuntura', 'fisioterapia']);
  END IF;

  -- Inserir estands apenas se não existirem
  IF NOT EXISTS (SELECT 1 FROM exhibitors WHERE name = 'Fitoterapia Brasil') THEN
    INSERT INTO exhibitors (name, description, category, website, email, contact_person, products, services, booth_number, location) VALUES
    ('Fitoterapia Brasil', 'Plantas medicinais e extratos naturais', 'Fitoterapia', 'https://fitoterapiabrasil.com', 'contato@fitoterapiabrasil.com', 'Dr. João Silva', ARRAY['extratos', 'chás', 'cápsulas'], ARRAY['consultoria', 'análise'], 'B01', '{"x": 10, "y": 20}'),
    ('Acupuncture World', 'Equipamentos e técnicas de acupuntura', 'Acupuntura', 'https://acupunctureworld.com', 'info@acupunctureworld.com', 'Prof. Chen Li', ARRAY['agulhas', 'moxas', 'equipamentos'], ARRAY['treinamento', 'consultoria'], 'B02', '{"x": 15, "y": 25}'),
    ('Homeopathy Plus', 'Medicamentos homeopáticos', 'Homeopatia', 'https://homeopathyplus.com', 'contato@homeopathyplus.com', 'Dra. Maria Santos', ARRAY['medicamentos', 'kit homeopático'], ARRAY['prescrição', 'consultoria'], 'B03', '{"x": 20, "y": 30}'),
    ('Mindfulness Tech', 'Apps de meditação e bem-estar', 'Tecnologia', 'https://mindfulnesstech.com', 'hello@mindfulnesstech.com', 'Eng. Carlos Tech', ARRAY['apps', 'dispositivos'], ARRAY['desenvolvimento', 'suporte'], 'B04', '{"x": 25, "y": 35}'),
    ('Ayurveda Center', 'Produtos e consultorias ayurvédicas', 'Ayurveda', 'https://ayurvedacenter.com', 'info@ayurvedacenter.com', 'Dr. Raj Patel', ARRAY['óleos', 'suplementos', 'cosméticos'], ARRAY['consultoria', 'tratamentos'], 'B05', '{"x": 30, "y": 40}');
  END IF;

END $$;
