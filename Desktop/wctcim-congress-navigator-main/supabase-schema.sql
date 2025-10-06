-- Schema para o WCTCIM Congress Navigator
-- Execute este SQL no Supabase SQL Editor

-- Criar tabela de trabalhos científicos
CREATE TABLE IF NOT EXISTS scientific_works (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  authors JSONB NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('científico', 'relato_experiencia', 'relato_caso')),
  modality TEXT NOT NULL CHECK (modality IN ('oral', 'pôster', 'vídeo')),
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(metric, date)
);

-- Criar índices para otimização
CREATE INDEX IF NOT EXISTS idx_scientific_works_category ON scientific_works(category);
CREATE INDEX IF NOT EXISTS idx_scientific_works_modality ON scientific_works(modality);
CREATE INDEX IF NOT EXISTS idx_scientific_works_schedule_day ON scientific_works ((schedule->>'day'));
CREATE INDEX IF NOT EXISTS idx_scientific_works_keywords ON scientific_works USING GIN (keywords);
CREATE INDEX IF NOT EXISTS idx_scientific_works_schedule ON scientific_works USING GIN (schedule);
CREATE INDEX IF NOT EXISTS idx_scientific_works_location ON scientific_works USING GIN (location);
CREATE INDEX IF NOT EXISTS idx_analytics_metric_date ON analytics(metric, date);

-- Inserir dados de exemplo
INSERT INTO scientific_works (id, title, authors, category, modality, presentation_type, abstract, keywords, schedule, location, media, status, institution, region, language) VALUES
('SW001', 'Avanços na Medicina Integrativa para Doenças Crônicas', 
 '[{"name": "Dr. Ana Paula Silva", "institution": "Universidade Federal de São Paulo", "email": "ana.silva@unifesp.br", "country": "Brasil"}, {"name": "Prof. Carlos Mendes", "institution": "Universidade Federal de São Paulo", "email": "carlos.mendes@unifesp.br", "country": "Brasil"}]',
 'científico', 'oral', 'pesquisa',
 'Este trabalho explora as últimas inovações e a eficácia da medicina integrativa no manejo de doenças crônicas, com foco em abordagens personalizadas e baseadas em evidências. Serão apresentados estudos de caso e resultados de ensaios clínicos recentes.',
 '["medicina integrativa", "doenças crônicas", "terapias complementares", "evidências científicas"]',
 '{"day": 1, "time": "09:00 - 09:45", "room": "Sala 1", "duration": 45}',
 '{"type": "auditório", "name": "Palco Principal", "coordinates": {"x": 50, "y": 30}}',
 '{"pdf": "/public/trabalhos/SW001.pdf", "video": null, "podcast": null}',
 'Aprovado', 'Universidade Federal de São Paulo', 'Sudeste', 'Português'),

('SW002', 'Eficácia da Acupuntura no Tratamento da Dor Crônica',
 '[{"name": "Dr. Roberto Chen", "institution": "Instituto de Medicina Tradicional Chinesa", "email": "roberto.chen@imtc.com.br", "country": "Brasil"}]',
 'científico', 'pôster', 'pesquisa',
 'Estudo randomizado controlado avaliando a eficácia da acupuntura no tratamento da dor crônica lombar em 120 pacientes. Resultados mostram redução significativa da intensidade da dor e melhora na qualidade de vida.',
 '["acupuntura", "dor crônica", "medicina tradicional chinesa", "ensaios clínicos"]',
 '{"day": 1, "time": "14:00 - 14:30", "room": "Área de Pôsteres", "duration": 30}',
 '{"type": "área de pôsteres", "name": "Hall Principal", "coordinates": {"x": 20, "y": 60}}',
 '{"pdf": "/public/trabalhos/SW002.pdf", "video": null, "podcast": null}',
 'Aprovado', 'Instituto de Medicina Tradicional Chinesa', 'Sudeste', 'Português'),

('SW003', 'Relato de Experiência: Integração de Práticas Integrativas em UBS',
 '[{"name": "Enf. Maria Santos", "institution": "Secretaria Municipal de Saúde", "email": "maria.santos@sms.gov.br", "country": "Brasil"}]',
 'relato_experiencia', 'vídeo', 'relato',
 'Relato da implementação de práticas integrativas em Unidade Básica de Saúde, incluindo yoga, meditação e fitoterapia. Impacto na satisfação dos usuários e redução de custos com medicamentos.',
 '["práticas integrativas", "atenção primária", "yoga", "meditação", "fitoterapia"]',
 '{"day": 2, "time": "10:30 - 11:00", "room": "Sala 2", "duration": 30}',
 '{"type": "auditório", "name": "Sala 2", "coordinates": {"x": 70, "y": 40}}',
 '{"pdf": "/public/trabalhos/SW003.pdf", "video": "https://youtube.com/watch?v=exemplo", "podcast": null}',
 'Aprovado', 'Secretaria Municipal de Saúde', 'Nordeste', 'Português'),

('SW004', 'Case Report: Tratamento de Ansiedade com Mindfulness',
 '[{"name": "Psic. João Oliveira", "institution": "Clínica Integrativa", "email": "joao.oliveira@clinica.com.br", "country": "Brasil"}]',
 'relato_caso', 'oral', 'case',
 'Relato de caso de paciente com transtorno de ansiedade generalizada tratado com programa de mindfulness de 8 semanas. Redução de 70% nos sintomas de ansiedade e melhora significativa no funcionamento social.',
 '["mindfulness", "ansiedade", "terapia cognitivo-comportamental", "caso clínico"]',
 '{"day": 2, "time": "15:00 - 15:30", "room": "Sala 3", "duration": 30}',
 '{"type": "auditório", "name": "Sala 3", "coordinates": {"x": 30, "y": 70}}',
 '{"pdf": "/public/trabalhos/SW004.pdf", "video": null, "podcast": null}',
 'Aprovado', 'Clínica Integrativa', 'Sul', 'Português'),

('SW005', 'Revisão Sistemática: Eficácia da Homeopatia em Pediatria',
 '[{"name": "Dra. Fernanda Lima", "institution": "Universidade de Brasília", "email": "fernanda.lima@unb.br", "country": "Brasil"}, {"name": "Dr. Pedro Costa", "institution": "Universidade de Brasília", "email": "pedro.costa@unb.br", "country": "Brasil"}]',
 'científico', 'oral', 'revisao',
 'Revisão sistemática de 45 estudos sobre a eficácia da homeopatia em condições pediátricas comuns. Análise crítica da qualidade metodológica e evidências de eficácia para diferentes condições.',
 '["homeopatia", "pediatria", "revisão sistemática", "medicina complementar"]',
 '{"day": 3, "time": "09:30 - 10:15", "room": "Sala 1", "duration": 45}',
 '{"type": "auditório", "name": "Palco Principal", "coordinates": {"x": 50, "y": 30}}',
 '{"pdf": "/public/trabalhos/SW005.pdf", "video": null, "podcast": null}',
 'Aprovado', 'Universidade de Brasília', 'Centro-Oeste', 'Português'),

('SW006', 'Estudo Piloto: Musicoterapia em Pacientes Oncológicos',
 '[{"name": "Musicoterapeuta Ana Beatriz", "institution": "Hospital do Câncer", "email": "ana.beatriz@hospcancer.com.br", "country": "Brasil"}]',
 'científico', 'pôster', 'pesquisa',
 'Estudo piloto com 30 pacientes oncológicos submetidos a sessões de musicoterapia durante o tratamento quimioterápico. Avaliação de ansiedade, depressão e qualidade de vida antes e após intervenção.',
 '["musicoterapia", "oncologia", "quimioterapia", "qualidade de vida"]',
 '{"day": 3, "time": "11:00 - 11:30", "room": "Área de Pôsteres", "duration": 30}',
 '{"type": "área de pôsteres", "name": "Hall Principal", "coordinates": {"x": 20, "y": 60}}',
 '{"pdf": "/public/trabalhos/SW006.pdf", "video": null, "podcast": null}',
 'Aprovado', 'Hospital do Câncer', 'Sudeste', 'Português'),

('SW007', 'Relato de Experiência: Programa de Tai Chi para Idosos',
 '[{"name": "Prof. Li Wei", "institution": "Centro de Artes Marciais", "email": "li.wei@taiichi.com.br", "country": "Brasil"}]',
 'relato_experiencia', 'vídeo', 'relato',
 'Implementação de programa de Tai Chi para 50 idosos em centro comunitário. Melhora no equilíbrio, força muscular e bem-estar psicológico após 12 semanas de prática regular.',
 '["tai chi", "idosos", "equilíbrio", "bem-estar", "artes marciais"]',
 '{"day": 4, "time": "14:30 - 15:00", "room": "Sala 2", "duration": 30}',
 '{"type": "auditório", "name": "Sala 2", "coordinates": {"x": 70, "y": 40}}',
 '{"pdf": "/public/trabalhos/SW007.pdf", "video": "https://youtube.com/watch?v=tai-chi-exemplo", "podcast": null}',
 'Aprovado', 'Centro de Artes Marciais', 'Sudeste', 'Português'),

('SW008', 'Case Report: Tratamento Integrativo de Fibromialgia',
 '[{"name": "Dra. Carmen Rodriguez", "institution": "Clínica de Reumatologia", "email": "carmen.rodriguez@reuma.com.br", "country": "Brasil"}]',
 'relato_caso', 'oral', 'case',
 'Relato de caso de paciente com fibromialgia tratada com abordagem integrativa incluindo acupuntura, fisioterapia e mudanças no estilo de vida. Redução de 60% na intensidade da dor e melhora na funcionalidade.',
 '["fibromialgia", "acupuntura", "fisioterapia", "medicina integrativa"]',
 '{"day": 4, "time": "16:00 - 16:30", "room": "Sala 3", "duration": 30}',
 '{"type": "auditório", "name": "Sala 3", "coordinates": {"x": 30, "y": 70}}',
 '{"pdf": "/public/trabalhos/SW008.pdf", "video": null, "podcast": null}',
 'Aprovado', 'Clínica de Reumatologia', 'Sul', 'Português');

-- Inserir dados iniciais de analytics
INSERT INTO analytics (metric, value, date) VALUES
('visitors', 0, CURRENT_DATE),
('stand_visits', 0, CURRENT_DATE),
('work_views', 0, CURRENT_DATE);
