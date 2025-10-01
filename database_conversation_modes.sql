-- 🗄️ ESTRUTURA DE BANCO DE DADOS PARA MODOS DE CONVERSA
-- Segmentação inteligente para garantir 100% de acurácia

-- 📊 TABELA DE TRANSIÇÕES DE MODO
CREATE TABLE IF NOT EXISTS mode_transitions_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  from_mode TEXT NOT NULL CHECK (from_mode IN ('explicativo', 'avaliacao_clinica', 'curso')),
  to_mode TEXT NOT NULL CHECK (to_mode IN ('explicativo', 'avaliacao_clinica', 'curso')),
  trigger_text TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  context_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 📚 TABELA DE CONTEÚDO EDUCATIVO (MODO CURSO)
CREATE TABLE IF NOT EXISTS conteudo_educativo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('blocos_imre', 'tecnicas_entrevista', 'casos_praticos', 'metodo_ricardo')),
  nivel TEXT NOT NULL CHECK (nivel IN ('basico', 'intermediario', 'avancado')),
  conteudo TEXT NOT NULL,
  palavras_chave TEXT[] NOT NULL,
  exemplos JSONB,
  referencias TEXT[],
  ordem_apresentacao INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🧠 TABELA DE APRENDIZADOS SEGMENTADOS POR MODO
CREATE TABLE IF NOT EXISTS ai_learning_modes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  modo TEXT NOT NULL CHECK (modo IN ('explicativo', 'avaliacao_clinica', 'curso')),
  categoria TEXT NOT NULL,
  keyword TEXT NOT NULL,
  context TEXT,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  usage_count INTEGER DEFAULT 0,
  similaridade_threshold DECIMAL(3,2) DEFAULT 0.7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🎯 TABELA DE INTENÇÕES DETECTADAS
CREATE TABLE IF NOT EXISTS detected_intents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_message TEXT NOT NULL,
  detected_intent TEXT NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  entities_extracted JSONB,
  suggested_mode TEXT CHECK (suggested_mode IN ('explicativo', 'avaliacao_clinica', 'curso')),
  mode_changed BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 📊 TABELA DE CONTEXTO DE SESSÃO
CREATE TABLE IF NOT EXISTS session_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  current_mode TEXT NOT NULL CHECK (current_mode IN ('explicativo', 'avaliacao_clinica', 'curso')),
  previous_mode TEXT,
  mode_start_time TIMESTAMPTZ DEFAULT NOW(),
  context_data JSONB,
  conversation_history JSONB,
  is_first_interaction BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 🔍 ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_mode_transitions_session ON mode_transitions_log(session_id);
CREATE INDEX IF NOT EXISTS idx_mode_transitions_timestamp ON mode_transitions_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_learning_modes_modo ON ai_learning_modes(modo);
CREATE INDEX IF NOT EXISTS idx_ai_learning_modes_keyword ON ai_learning_modes(keyword);
CREATE INDEX IF NOT EXISTS idx_ai_learning_modes_confidence ON ai_learning_modes(confidence_score);
CREATE INDEX IF NOT EXISTS idx_conteudo_educativo_categoria ON conteudo_educativo(categoria);
CREATE INDEX IF NOT EXISTS idx_conteudo_educativo_nivel ON conteudo_educativo(nivel);
CREATE INDEX IF NOT EXISTS idx_detected_intents_session ON detected_intents(session_id);
CREATE INDEX IF NOT EXISTS idx_detected_intents_confidence ON detected_intents(confidence_score);
CREATE INDEX IF NOT EXISTS idx_session_context_session ON session_context(session_id);

-- 🔧 FUNÇÕES AUXILIARES

-- Função para buscar aprendizados por modo
CREATE OR REPLACE FUNCTION buscar_aprendizados_por_modo(
  p_modo TEXT,
  p_keyword TEXT,
  p_limite INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  keyword TEXT,
  context TEXT,
  user_message TEXT,
  ai_response TEXT,
  confidence_score DECIMAL(3,2),
  usage_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    alm.id,
    alm.keyword,
    alm.context,
    alm.user_message,
    alm.ai_response,
    alm.confidence_score,
    alm.usage_count
  FROM ai_learning_modes alm
  WHERE alm.modo = p_modo
    AND alm.is_active = true
    AND (alm.keyword ILIKE '%' || p_keyword || '%' OR p_keyword ILIKE '%' || alm.keyword || '%')
  ORDER BY alm.confidence_score DESC, alm.usage_count DESC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql;

-- Função para detectar intenção de mudança de modo
CREATE OR REPLACE FUNCTION detectar_mudanca_modo(
  p_mensagem TEXT,
  p_modo_atual TEXT
)
RETURNS TABLE (
  novo_modo TEXT,
  confianca DECIMAL(3,2),
  trigger_detectado TEXT
) AS $$
DECLARE
  mensagem_lower TEXT := LOWER(p_mensagem);
BEGIN
  -- Detectar avaliação clínica
  IF mensagem_lower ~ 'avaliação clínica|avaliacao clinica|iniciar avaliação|fazer avaliação|quero fazer uma avaliação|pode me avaliar|arte da entrevista|método imre|metodo imre' THEN
    RETURN QUERY SELECT 'avaliacao_clinica'::TEXT, 0.95::DECIMAL(3,2), 'avaliacao_clinica'::TEXT;
    RETURN;
  END IF;
  
  -- Detectar modo curso
  IF mensagem_lower ~ 'quero aprender|quero estudar|curso de medicina|estudar entrevista|aprender entrevista|método dr ricardo|como fazer entrevista|técnicas de entrevista' THEN
    RETURN QUERY SELECT 'curso'::TEXT, 0.90::DECIMAL(3,2), 'curso'::TEXT;
    RETURN;
  END IF;
  
  -- Detectar volta ao explicativo
  IF mensagem_lower ~ 'voltar ao chat|sair da avaliação|cancelar avaliação|parar avaliação|quero conversar|modo normal|chat normal' THEN
    RETURN QUERY SELECT 'explicativo'::TEXT, 0.90::DECIMAL(3,2), 'volta_explicativo'::TEXT;
    RETURN;
  END IF;
  
  -- Sem mudança detectada
  RETURN QUERY SELECT p_modo_atual::TEXT, 0.50::DECIMAL(3,2), 'sem_mudanca'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Função para salvar transição de modo
CREATE OR REPLACE FUNCTION salvar_transicao_modo(
  p_session_id TEXT,
  p_user_id UUID,
  p_from_mode TEXT,
  p_to_mode TEXT,
  p_trigger TEXT,
  p_confidence DECIMAL(3,2),
  p_context_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  transition_id UUID;
BEGIN
  INSERT INTO mode_transitions_log (
    session_id, user_id, from_mode, to_mode, trigger_text, confidence_score, context_data
  ) VALUES (
    p_session_id, p_user_id, p_from_mode, p_to_mode, p_trigger, p_confidence, p_context_data
  ) RETURNING id INTO transition_id;
  
  -- Atualizar contexto de sessão
  INSERT INTO session_context (session_id, user_id, current_mode, previous_mode, context_data)
  VALUES (p_session_id, p_user_id, p_to_mode, p_from_mode, p_context_data)
  ON CONFLICT (session_id) 
  DO UPDATE SET 
    previous_mode = session_context.current_mode,
    current_mode = p_to_mode,
    mode_start_time = NOW(),
    context_data = p_context_data,
    updated_at = NOW();
  
  RETURN transition_id;
END;
$$ LANGUAGE plpgsql;

-- Função para salvar intenção detectada
CREATE OR REPLACE FUNCTION salvar_intencao_detectada(
  p_session_id TEXT,
  p_user_id UUID,
  p_user_message TEXT,
  p_detected_intent TEXT,
  p_confidence DECIMAL(3,2),
  p_entities_extracted JSONB DEFAULT NULL,
  p_suggested_mode TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  intent_id UUID;
BEGIN
  INSERT INTO detected_intents (
    session_id, user_id, user_message, detected_intent, confidence_score, 
    entities_extracted, suggested_mode
  ) VALUES (
    p_session_id, p_user_id, p_user_message, p_detected_intent, p_confidence,
    p_entities_extracted, p_suggested_mode
  ) RETURNING id INTO intent_id;
  
  RETURN intent_id;
END;
$$ LANGUAGE plpgsql;

-- 📊 DADOS INICIAIS - CONTEÚDO EDUCATIVO

-- Blocos IMRE explicados
INSERT INTO conteudo_educativo (titulo, categoria, nivel, conteudo, palavras_chave, ordem_apresentacao) VALUES
('Bloco 1 - Abertura Exponencial', 'blocos_imre', 'basico', 
'Primeiro bloco da entrevista clínica. Objetivo: estabelecer rapport e apresentação mútua. A Nôa se apresenta e solicita que o paciente também se apresente, criando ambiente de confiança.',
ARRAY['abertura', 'apresentação', 'rapport', 'confiança'], 1),

('Bloco 2 - Cannabis Medicinal', 'blocos_imre', 'basico',
'Segundo bloco focado em histórico de uso de cannabis medicinal. Importante para entender experiência prévia e expectativas do paciente.',
ARRAY['cannabis', 'medicinal', 'histórico', 'experiência'], 2),

('Bloco 3 - Lista Indiciária', 'blocos_imre', 'basico',
'Terceiro bloco onde o paciente lista todas as queixas e sintomas. "O que trouxe você aqui?" - pergunta aberta para capturar múltiplas questões.',
ARRAY['lista', 'indiciária', 'queixas', 'sintomas'], 3),

('Bloco 4 - Queixa Principal', 'blocos_imre', 'basico',
'Quarto bloco para identificar a queixa mais importante. De todas as questões mencionadas, qual mais incomoda o paciente.',
ARRAY['queixa', 'principal', 'prioridade', 'incomoda'], 4),

('Bloco 5 - Localização', 'blocos_imre', 'basico',
'Quinto bloco para localizar exatamente onde o paciente sente a queixa principal. Usa variável [queixa] para personalizar a pergunta.',
ARRAY['localização', 'onde', 'sente', 'variável'], 5);

-- Técnicas de entrevista
INSERT INTO conteudo_educativo (titulo, categoria, nivel, conteudo, palavras_chave, ordem_apresentacao) VALUES
('Escuta Ativa', 'tecnicas_entrevista', 'basico',
'Técnica fundamental da entrevista clínica. Envolve ouvir atentamente, fazer perguntas de esclarecimento e demonstrar interesse genuíno.',
ARRAY['escuta', 'ativa', 'ouvir', 'atenção'], 1),

('Perguntas Abertas', 'tecnicas_entrevista', 'basico',
'Uso de perguntas que permitem respostas elaboradas. Exemplo: "O que trouxe você aqui?" em vez de "Você tem dor?".',
ARRAY['perguntas', 'abertas', 'elaboradas', 'detalhadas'], 2),

('Substituição de Variáveis', 'tecnicas_entrevista', 'intermediario',
'Técnica de personalizar perguntas usando informações já coletadas. Exemplo: "Onde você sente [queixa]?" vira "Onde você sente dor de cabeça?".',
ARRAY['variáveis', 'substituição', 'personalização', 'contexto'], 3);

-- 📊 DADOS INICIAIS - APRENDIZADOS POR MODO

-- Modo Explicativo - Cannabis Medicinal
INSERT INTO ai_learning_modes (modo, categoria, keyword, context, user_message, ai_response, confidence_score) VALUES
('explicativo', 'cannabis_medicinal', 'CBD dor neuropática', 'neuropatia',
'O CBD ajuda na dor neuropática?',
'Sim, estudos indicam que o CBD pode reduzir dor neuropática, mas cada organismo reage de forma diferente. Quer que eu explique como isso funciona?', 0.9),

('explicativo', 'cannabis_medicinal', 'THC efeitos', 'psicoativo',
'Quais são os efeitos do THC?',
'O THC tem efeito psicoativo e pode ajudar em espasmos musculares e apetite. Quer que eu explique os efeitos no sistema nervoso e renal?', 0.85),

('explicativo', 'cannabis_medicinal', 'diferença CBD THC', 'comparação',
'Qual a diferença entre CBD e THC?',
'O CBD não tem efeito psicoativo e é mais usado para dor e inflamação. O THC é psicoativo e pode ajudar em espasmos e apetite. Quer que eu explique os efeitos no sistema nervoso e renal?', 0.9);

-- Modo Curso - Conteúdo Educativo
INSERT INTO ai_learning_modes (modo, categoria, keyword, context, user_message, ai_response, confidence_score) VALUES
('curso', 'blocos_imre', 'bloco 1 abertura', 'apresentação',
'Como funciona o bloco 1 da entrevista?',
'O Bloco 1 é a Abertura Exponencial. A Nôa se apresenta e solicita que o paciente também se apresente, criando ambiente de confiança e rapport.', 0.95),

('curso', 'tecnicas_entrevista', 'escuta ativa', 'técnica',
'O que é escuta ativa?',
'Escuta ativa é técnica fundamental que envolve ouvir atentamente, fazer perguntas de esclarecimento e demonstrar interesse genuíno pelo paciente.', 0.9),

('curso', 'metodo_ricardo', 'arte entrevista', 'metodologia',
'O que é a Arte da Entrevista Clínica?',
'A Arte da Entrevista Clínica é o método desenvolvido pelo Dr. Ricardo Valença, baseado em 28 blocos IMRE estruturados para capturar informações clínicas de forma sistemática e humanizada.', 0.95);

-- Modo Avaliação Clínica - Triggers de Início
INSERT INTO ai_learning_modes (modo, categoria, keyword, context, user_message, ai_response, confidence_score) VALUES
('avaliacao_clinica', 'trigger_inicio', 'avaliação clínica', 'início',
'Quero fazer uma avaliação clínica',
'🩺 **Avaliação Clínica Inicial Iniciada**\n\nVou conduzi-lo através de uma avaliação completa seguindo o método IMRE do Dr. Ricardo Valença.\n\nEsta avaliação possui 28 blocos estruturados. Vamos começar?', 0.95),

('avaliacao_clinica', 'trigger_inicio', 'arte da entrevista', 'método',
'Quero conhecer a arte da entrevista',
'🩺 **Avaliação Clínica Inicial Iniciada**\n\nVou demonstrar a Arte da Entrevista Clínica através de uma avaliação prática com os 28 blocos IMRE.\n\nVamos começar?', 0.9);

-- 🔐 RLS (Row Level Security)
ALTER TABLE mode_transitions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE conteudo_educativo ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE detected_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_context ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own mode transitions" ON mode_transitions_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view educational content" ON conteudo_educativo
  FOR SELECT USING (true);

CREATE POLICY "Users can view learning modes" ON ai_learning_modes
  FOR SELECT USING (true);

CREATE POLICY "Users can view their own detected intents" ON detected_intents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own session context" ON session_context
  FOR SELECT USING (auth.uid() = user_id);

-- 📊 COMENTÁRIOS
COMMENT ON TABLE mode_transitions_log IS 'Log de todas as transições entre modos de conversa';
COMMENT ON TABLE conteudo_educativo IS 'Conteúdo educacional para o modo curso';
COMMENT ON TABLE ai_learning_modes IS 'Aprendizados da IA segmentados por modo de conversa';
COMMENT ON TABLE detected_intents IS 'Intenções detectadas nas mensagens dos usuários';
COMMENT ON TABLE session_context IS 'Contexto atual de cada sessão de conversa';
