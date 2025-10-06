-- Schema simplificado para o WCTCIM Congress Navigator
-- Execute este SQL no Supabase SQL Editor

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

-- Criar índices básicos
CREATE INDEX IF NOT EXISTS idx_scientific_works_category ON scientific_works(category);
CREATE INDEX IF NOT EXISTS idx_scientific_works_modality ON scientific_works(modality);
CREATE INDEX IF NOT EXISTS idx_scientific_works_keywords ON scientific_works USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_analytics_metric ON analytics(metric);

-- Inserir dados de exemplo (apenas se não existirem)
INSERT INTO scientific_works (id, title, authors, category, modality, presentation_type, abstract, keywords, schedule, location, media, status, institution, region, language) 
SELECT * FROM (VALUES
('SW001', 'Avanços na Medicina Integrativa para Doenças Crônicas', 
 '[{"name": "Dr. Ana Paula Silva", "institution": "Universidade Federal de São Paulo", "email": "ana.silva@unifesp.br", "country": "Brasil"}, {"name": "Prof. Carlos Mendes", "institution": "Universidade Federal de São Paulo", "email": "carlos.mendes@unifesp.br", "country": "Brasil"}]',
 'científico', 'oral', 'pesquisa',
 'Este trabalho explora as últimas inovações e a eficácia da medicina integrativa no manejo de doenças crônicas, com foco em abordagens personalizadas e baseadas em evidências. Serão apresentados estudos de caso e resultados de ensaios clínicos recentes.',
 ARRAY['medicina integrativa', 'doenças crônicas', 'terapias complementares', 'evidências científicas'],
 '{"day": 1, "time": "09:00 - 09:45", "room": "Sala 1", "duration": 45}',
 '{"type": "auditório", "name": "Palco Principal", "coordinates": {"x": 50, "y": 30}}',
 '{"pdf": "/public/trabalhos/SW001.pdf", "video": null, "podcast": null}',
 'Aprovado', 'Universidade Federal de São Paulo', 'Sudeste', 'Português'),

('SW002', 'Eficácia da Acupuntura no Tratamento da Dor Crônica',
 '[{"name": "Dr. Roberto Chen", "institution": "Instituto de Medicina Tradicional Chinesa", "email": "roberto.chen@imtc.com.br", "country": "Brasil"}]',
 'científico', 'pôster', 'pesquisa',
 'Estudo randomizado controlado avaliando a eficácia da acupuntura no tratamento da dor crônica lombar em 120 pacientes. Resultados mostram redução significativa da intensidade da dor e melhora na qualidade de vida.',
 ARRAY['acupuntura', 'dor crônica', 'medicina tradicional chinesa', 'ensaios clínicos'],
 '{"day": 1, "time": "14:00 - 14:30", "room": "Área de Pôsteres", "duration": 30}',
 '{"type": "área de pôsteres", "name": "Hall Principal", "coordinates": {"x": 20, "y": 60}}',
 '{"pdf": "/public/trabalhos/SW002.pdf", "video": null, "podcast": null}',
 'Aprovado', 'Instituto de Medicina Tradicional Chinesa', 'Sudeste', 'Português'),

('SW003', 'Relato de Experiência: Integração de Práticas Integrativas em UBS',
 '[{"name": "Enf. Maria Santos", "institution": "Secretaria Municipal de Saúde", "email": "maria.santos@sms.gov.br", "country": "Brasil"}]',
 'relato_experiencia', 'vídeo', 'relato',
 'Relato da implementação de práticas integrativas em Unidade Básica de Saúde, incluindo yoga, meditação e fitoterapia. Impacto na satisfação dos usuários e redução de custos com medicamentos.',
 ARRAY['práticas integrativas', 'atenção primária', 'yoga', 'meditação', 'fitoterapia'],
 '{"day": 2, "time": "10:30 - 11:00", "room": "Sala 2", "duration": 30}',
 '{"type": "auditório", "name": "Sala 2", "coordinates": {"x": 70, "y": 40}}',
 '{"pdf": "/public/trabalhos/SW003.pdf", "video": "https://youtube.com/watch?v=exemplo", "podcast": null}',
 'Aprovado', 'Secretaria Municipal de Saúde', 'Nordeste', 'Português'),

('SW004', 'Case Report: Tratamento de Ansiedade com Mindfulness',
 '[{"name": "Psic. João Oliveira", "institution": "Clínica Integrativa", "email": "joao.oliveira@clinica.com.br", "country": "Brasil"}]',
 'relato_caso', 'oral', 'case',
 'Relato de caso de paciente com transtorno de ansiedade generalizada tratado com programa de mindfulness de 8 semanas. Redução de 70% nos sintomas de ansiedade e melhora significativa no funcionamento social.',
 ARRAY['mindfulness', 'ansiedade', 'terapia cognitivo-comportamental', 'caso clínico'],
 '{"day": 2, "time": "15:00 - 15:30", "room": "Sala 3", "duration": 30}',
 '{"type": "auditório", "name": "Sala 3", "coordinates": {"x": 30, "y": 70}}',
 '{"pdf": "/public/trabalhos/SW004.pdf", "video": null, "podcast": null}',
 'Aprovado', 'Clínica Integrativa', 'Sul', 'Português'),

('SW005', 'Revisão Sistemática: Eficácia da Homeopatia em Pediatria',
 '[{"name": "Dra. Fernanda Lima", "institution": "Universidade de Brasília", "email": "fernanda.lima@unb.br", "country": "Brasil"}, {"name": "Dr. Pedro Costa", "institution": "Universidade de Brasília", "email": "pedro.costa@unb.br", "country": "Brasil"}]',
 'científico', 'oral', 'revisao',
 'Revisão sistemática de 45 estudos sobre a eficácia da homeopatia em condições pediátricas comuns. Análise crítica da qualidade metodológica e evidências de eficácia para diferentes condições.',
 ARRAY['homeopatia', 'pediatria', 'revisão sistemática', 'medicina complementar'],
 '{"day": 3, "time": "09:30 - 10:15", "room": "Sala 1", "duration": 45}',
 '{"type": "auditório", "name": "Palco Principal", "coordinates": {"x": 50, "y": 30}}',
 '{"pdf": "/public/trabalhos/SW005.pdf", "video": null, "podcast": null}',
 'Aprovado', 'Universidade de Brasília', 'Centro-Oeste', 'Português'),

('SW006', 'Estudo Piloto: Musicoterapia em Pacientes Oncológicos',
 '[{"name": "Musicoterapeuta Ana Beatriz", "institution": "Hospital do Câncer", "email": "ana.beatriz@hospcancer.com.br", "country": "Brasil"}]',
 'científico', 'pôster', 'pesquisa',
 'Estudo piloto com 30 pacientes oncológicos submetidos a sessões de musicoterapia durante o tratamento quimioterápico. Avaliação de ansiedade, depressão e qualidade de vida antes e após intervenção.',
 ARRAY['musicoterapia', 'oncologia', 'quimioterapia', 'qualidade de vida'],
 '{"day": 3, "time": "11:00 - 11:30", "room": "Área de Pôsteres", "duration": 30}',
 '{"type": "área de pôsteres", "name": "Hall Principal", "coordinates": {"x": 20, "y": 60}}',
 '{"pdf": "/public/trabalhos/SW006.pdf", "video": null, "podcast": null}',
 'Aprovado', 'Hospital do Câncer', 'Sudeste', 'Português'),

('SW007', 'Relato de Experiência: Programa de Tai Chi para Idosos',
 '[{"name": "Prof. Li Wei", "institution": "Centro de Artes Marciais", "email": "li.wei@taiichi.com.br", "country": "Brasil"}]',
 'relato_experiencia', 'vídeo', 'relato',
 'Implementação de programa de Tai Chi para 50 idosos em centro comunitário. Melhora no equilíbrio, força muscular e bem-estar psicológico após 12 semanas de prática regular.',
 ARRAY['tai chi', 'idosos', 'equilíbrio', 'bem-estar', 'artes marciais'],
 '{"day": 4, "time": "14:30 - 15:00", "room": "Sala 2", "duration": 30}',
 '{"type": "auditório", "name": "Sala 2", "coordinates": {"x": 70, "y": 40}}',
 '{"pdf": "/public/trabalhos/SW007.pdf", "video": "https://youtube.com/watch?v=tai-chi-exemplo", "podcast": null}',
 'Aprovado', 'Centro de Artes Marciais', 'Sudeste', 'Português'),

('SW008', 'Case Report: Tratamento Integrativo de Fibromialgia',
 '[{"name": "Dra. Carmen Rodriguez", "institution": "Clínica de Reumatologia", "email": "carmen.rodriguez@reuma.com.br", "country": "Brasil"}]',
 'relato_caso', 'oral', 'case',
 'Relato de caso de paciente com fibromialgia tratada com abordagem integrativa incluindo acupuntura, fisioterapia e mudanças no estilo de vida. Redução de 60% na intensidade da dor e melhora na funcionalidade.',
 ARRAY['fibromialgia', 'acupuntura', 'fisioterapia', 'medicina integrativa'],
 '{"day": 4, "time": "16:00 - 16:30", "room": "Sala 3", "duration": 30}',
 '{"type": "auditório", "name": "Sala 3", "coordinates": {"x": 30, "y": 70}}',
 '{"pdf": "/public/trabalhos/SW008.pdf", "video": null, "podcast": null}',
 'Aprovado', 'Clínica de Reumatologia', 'Sul', 'Português')
) AS new_data (id, title, authors, category, modality, presentation_type, abstract, keywords, schedule, location, media, status, institution, region, language)
WHERE NOT EXISTS (SELECT 1 FROM scientific_works WHERE scientific_works.id = new_data.id);

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
  interaction_type TEXT NOT NULL, -- 'work_view', 'speaker_view', 'exhibitor_view', 'room_visit'
  target_id TEXT NOT NULL, -- ID do item visualizado
  target_type TEXT NOT NULL, -- 'work', 'speaker', 'exhibitor', 'room'
  duration INTEGER, -- tempo em segundos
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para as novas tabelas
CREATE INDEX IF NOT EXISTS idx_speakers_country ON speakers(country);
CREATE INDEX IF NOT EXISTS idx_speakers_institution ON speakers(institution);
CREATE INDEX IF NOT EXISTS idx_schedule_day ON schedule(day);
CREATE INDEX IF NOT EXISTS idx_schedule_room ON schedule(room);
CREATE INDEX IF NOT EXISTS idx_schedule_time ON schedule(time_start, time_end);
CREATE INDEX IF NOT EXISTS idx_exhibitors_category ON exhibitors(category);
CREATE INDEX IF NOT EXISTS idx_rooms_capacity ON rooms(capacity);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created_at ON interactions(created_at);

-- Inserir dados iniciais de analytics (apenas se não existirem)
INSERT INTO analytics (metric, value, date) 
SELECT * FROM (VALUES
('visitors', 0, CURRENT_DATE),
('stand_visits', 0, CURRENT_DATE),
('work_views', 0, CURRENT_DATE)
) AS new_analytics (metric, value, date)
WHERE NOT EXISTS (SELECT 1 FROM analytics WHERE analytics.metric = new_analytics.metric AND analytics.date = new_analytics.date);

-- Inserir salas/auditórios (apenas se não existirem)
INSERT INTO rooms (name, capacity, location, equipment, description, floor, building) 
SELECT * FROM (VALUES
('Sala 1 - Palco Principal', 500, '{"x": 50, "y": 30, "type": "auditório"}', ARRAY['projetor', 'som', 'ar-condicionado'], 'Auditório principal do evento', 1, 'Pavilhão A'),
('Sala 2', 200, '{"x": 70, "y": 40, "type": "auditório"}', ARRAY['projetor', 'som'], 'Sala de apresentações', 1, 'Pavilhão A'),
('Sala 3', 150, '{"x": 30, "y": 70, "type": "auditório"}', ARRAY['projetor', 'som'], 'Sala de workshops', 1, 'Pavilhão A'),
('Área de Pôsteres', 100, '{"x": 20, "y": 60, "type": "área de pôsteres"}', ARRAY['iluminação', 'mesas'], 'Hall principal para pôsteres', 1, 'Pavilhão A')
) AS new_rooms (name, capacity, location, equipment, description, floor, building)
WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE rooms.name = new_rooms.name);

-- Inserir palestrantes baseados nos trabalhos científicos
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

-- Inserir programação baseada nos trabalhos científicos
INSERT INTO schedule (day, time_start, time_end, title, description, speaker_id, work_id, room, capacity, modality, category) VALUES
(1, '09:00', '09:45', 'Avanços na Medicina Integrativa para Doenças Crônicas', 'Apresentação sobre inovações em medicina integrativa', 1, 'SW001', 'Sala 1 - Palco Principal', 500, 'oral', 'científico'),
(1, '14:00', '14:30', 'Eficácia da Acupuntura no Tratamento da Dor Crônica', 'Apresentação de pôster sobre acupuntura', 3, 'SW002', 'Área de Pôsteres', 100, 'pôster', 'científico'),
(2, '10:30', '11:00', 'Relato de Experiência: Integração de Práticas Integrativas em UBS', 'Relato de experiência com vídeo', 4, 'SW003', 'Sala 2', 200, 'vídeo', 'relato_experiencia'),
(2, '15:00', '15:30', 'Case Report: Tratamento de Ansiedade com Mindfulness', 'Apresentação de caso clínico', 5, 'SW004', 'Sala 3', 150, 'oral', 'relato_caso'),
(3, '09:30', '10:15', 'Revisão Sistemática: Eficácia da Homeopatia em Pediatria', 'Revisão sistemática sobre homeopatia', 6, 'SW005', 'Sala 1 - Palco Principal', 500, 'oral', 'científico'),
(3, '11:00', '11:30', 'Estudo Piloto: Musicoterapia em Pacientes Oncológicos', 'Apresentação de pôster sobre musicoterapia', 8, 'SW006', 'Área de Pôsteres', 100, 'pôster', 'científico'),
(4, '14:30', '15:00', 'Relato de Experiência: Programa de Tai Chi para Idosos', 'Relato de experiência com vídeo', 9, 'SW007', 'Sala 2', 200, 'vídeo', 'relato_experiencia'),
(4, '16:00', '16:30', 'Case Report: Tratamento Integrativo de Fibromialgia', 'Apresentação de caso clínico', 10, 'SW008', 'Sala 3', 150, 'oral', 'relato_caso');

-- Inserir estands/empresas
INSERT INTO exhibitors (name, description, category, website, email, contact_person, products, services, booth_number, location) VALUES
('Fitoterapia Brasil', 'Plantas medicinais e extratos naturais', 'Fitoterapia', 'https://fitoterapiabrasil.com', 'contato@fitoterapiabrasil.com', 'Dr. João Silva', ARRAY['extratos', 'chás', 'cápsulas'], ARRAY['consultoria', 'análise'], 'B01', '{"x": 10, "y": 20}'),
('Acupuncture World', 'Equipamentos e técnicas de acupuntura', 'Acupuntura', 'https://acupunctureworld.com', 'info@acupunctureworld.com', 'Prof. Chen Li', ARRAY['agulhas', 'moxas', 'equipamentos'], ARRAY['treinamento', 'consultoria'], 'B02', '{"x": 15, "y": 25}'),
('Homeopathy Plus', 'Medicamentos homeopáticos', 'Homeopatia', 'https://homeopathyplus.com', 'contato@homeopathyplus.com', 'Dra. Maria Santos', ARRAY['medicamentos', 'kit homeopático'], ARRAY['prescrição', 'consultoria'], 'B03', '{"x": 20, "y": 30}'),
('Mindfulness Tech', 'Apps de meditação e bem-estar', 'Tecnologia', 'https://mindfulnesstech.com', 'hello@mindfulnesstech.com', 'Eng. Carlos Tech', ARRAY['apps', 'dispositivos'], ARRAY['desenvolvimento', 'suporte'], 'B04', '{"x": 25, "y": 35}'),
('Ayurveda Center', 'Produtos e consultorias ayurvédicas', 'Ayurveda', 'https://ayurvedacenter.com', 'info@ayurvedacenter.com', 'Dr. Raj Patel', ARRAY['óleos', 'suplementos', 'cosméticos'], ARRAY['consultoria', 'tratamentos'], 'B05', '{"x": 30, "y": 40}');
