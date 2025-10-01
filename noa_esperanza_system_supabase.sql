-- =====================================================
-- SISTEMA NÔA ESPERANZA - CONFIGURAÇÃO SUPABASE
-- Dr. Ricardo Valença - Implementação do Agent/Chat
-- =====================================================

-- 1. TABELA DE USUÁRIOS E TIPOS - ARTE DA ENTREVISTA CLÍNICA
-- =====================================================
CREATE TABLE IF NOT EXISTS noa_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    user_type TEXT NOT NULL CHECK (user_type IN ('aluno', 'profissional', 'paciente')),
    permission_level INTEGER DEFAULT 1 CHECK (permission_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE BLOCOS IMRE (SISTEMA CANÔNICO DE AVALIAÇÃO)
-- =====================================================
CREATE TABLE IF NOT EXISTS blocos_imre (
    id SERIAL PRIMARY KEY,
    ordem INTEGER NOT NULL UNIQUE,
    etapa TEXT NOT NULL,
    texto TEXT NOT NULL,
    variavel TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('sistema', 'pergunta', 'loop')),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE PROMPTS (SISTEMA DE INTELIGÊNCIA)
-- =====================================================
CREATE TABLE IF NOT EXISTS prompts (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    categoria TEXT DEFAULT 'general',
    especialidade TEXT DEFAULT 'geral',
    ativo BOOLEAN DEFAULT true,
    prioridade INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE CONVERSAS DO SISTEMA NÔA ESPERANZA
-- =====================================================
CREATE TABLE IF NOT EXISTS noa_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    user_message TEXT NOT NULL,
    noa_response TEXT NOT NULL,
    conversation_type TEXT DEFAULT 'general' CHECK (conversation_type IN ('general', 'clinical_evaluation', 'presentation', 'user_type_selection', 'menu_options')),
    is_first_response BOOLEAN DEFAULT FALSE,
    user_type TEXT CHECK (user_type IN ('aluno', 'profissional', 'paciente')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA DE APRENDIZADO DE IA
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_learning (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    keyword TEXT NOT NULL,
    context TEXT,
    user_message TEXT NOT NULL,
    ai_response TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    usage_count INTEGER DEFAULT 1,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA DE PALAVRAS-CHAVE IA
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_keywords (
    keyword TEXT PRIMARY KEY,
    category TEXT DEFAULT 'general',
    importance_score DECIMAL(3,2) DEFAULT 0.5,
    usage_count INTEGER DEFAULT 1,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA DE PADRÕES DE CONVERSA
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_conversation_patterns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pattern_type TEXT NOT NULL,
    user_input_pattern TEXT NOT NULL,
    expected_response TEXT NOT NULL,
    context TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    usage_count INTEGER DEFAULT 1,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA NFT INCENTIVADOR MÍNIMO DO RELATO ESPONTÂNEO
-- =====================================================
CREATE TABLE IF NOT EXISTS noa_nft_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    evaluation_id UUID NOT NULL,
    nft_hash TEXT UNIQUE NOT NULL,
    nft_metadata JSONB NOT NULL,
    report_content TEXT NOT NULL,
    user_consent BOOLEAN DEFAULT FALSE,
    nft_minted BOOLEAN DEFAULT FALSE,
    mint_transaction_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. TABELA DE FLUXO DE CONVERSAS
-- =====================================================
CREATE TABLE IF NOT EXISTS noa_conversation_flow (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    step_number INTEGER NOT NULL,
    step_type TEXT NOT NULL CHECK (step_type IN ('initial_question', 'user_response', 'noa_presentation', 'user_type_selection', 'menu_options', 'clinical_evaluation', 'nft_explanation', 'nft_consent', 'follow_up')),
    message_content TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'noa')),
    user_type TEXT CHECK (user_type IN ('aluno', 'profissional', 'paciente')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABELA DE CONFIGURAÇÕES DO SISTEMA
-- =====================================================
CREATE TABLE IF NOT EXISTS noa_system_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. INSERIR BLOCOS IMRE CANÔNICOS (28 BLOCOS)
-- =====================================================
INSERT INTO blocos_imre (ordem, etapa, texto, variavel, tipo) VALUES
(1, 'abertura', 'Olá! Eu sou Nôa Esperanza. Por favor, apresente-se também e vamos iniciar a sua avaliação inicial para consultas com Dr. Ricardo Valença.', 'abertura', 'sistema'),
(2, 'motivo_detalhado', 'O que trouxe você à nossa avaliação hoje?', 'motivo_detalhado', 'pergunta'),
(3, 'motivo_detalhado_extra', 'O que mais?', 'motivo_extra', 'loop'),
(4, 'queixa_principal', 'Qual dessas questões mais o(a) incomoda?', 'queixa_principal', 'pergunta'),
(5, 'localizacao', 'Onde você sente [queixa]?', 'localizacao', 'pergunta'),
(6, 'tempo_evolucao', 'Quando essa [queixa] começou?', 'tempo_evolucao', 'pergunta'),
(7, 'caracteristicas', 'Como é a [queixa]?', 'caracteristicas', 'pergunta'),
(8, 'sintomas_associados', 'O que mais você sente quando está com a [queixa]?', 'sintomas_associados', 'loop'),
(9, 'fatores_melhora', 'O que parece melhorar a [queixa]?', 'fatores_melhora', 'pergunta'),
(10, 'fatores_piora', 'O que parece piorar a [queixa]?', 'fatores_piora', 'pergunta'),
(11, 'historia_medica', 'Quais as questões de saúde que você já viveu?', 'historia_medica', 'loop'),
(12, 'historia_medica_extra', 'O que mais?', 'historia_medica_extra', 'loop'),
(13, 'familia_mae', 'Quais as questões de saúde da parte de sua mãe?', 'familia_mae', 'loop'),
(14, 'familia_mae_extra', 'O que mais?', 'familia_mae_extra', 'loop'),
(15, 'familia_pai', 'E por parte de seu pai?', 'familia_pai', 'loop'),
(16, 'familia_pai_extra', 'O que mais?', 'familia_pai_extra', 'loop'),
(17, 'habitos', 'Que outros hábitos você acha importante mencionar?', 'habitos', 'loop'),
(18, 'habitos_extra', 'O que mais?', 'habitos_extra', 'loop'),
(19, 'alergias', 'Você tem alguma alergia (clima, medicação, poeira...)?', 'alergias', 'pergunta'),
(20, 'medicacao_regular', 'Quais as medicações que você utiliza regularmente?', 'medicacao_regular', 'pergunta'),
(21, 'medicacao_esporadica', 'E as que você usa de vez em quando? Por quê?', 'medicacao_esporadica', 'pergunta'),
(22, 'fechamento_revisao', 'Vamos revisar a sua história para garantir que não perdemos nada importante.', 'revisao_resumo', 'sistema'),
(23, 'feedback_usuario', 'O que posso melhorar no meu entendimento?', 'feedback_usuario', 'pergunta'),
(24, 'validacao_final', 'Você concorda com o meu entendimento?', 'validacao', 'pergunta'),
(25, 'adicionar_info_final', 'Há mais algo que gostaria de adicionar?', 'adicoes_finais', 'pergunta'),
(26, 'hipoteses_sindromicas', 'Com base em tudo que conversamos, posso formular algumas hipóteses sobre sua condição...', 'hipoteses', 'sistema'),
(27, 'recomendacao_final', 'Recomendo a marcação de uma consulta com o Dr. Ricardo Valença para uma avaliação mais detalhada.', 'recomendacao', 'sistema'),
(28, 'encerramento', 'Obrigado por compartilhar sua história conosco. Sua avaliação inicial foi concluída com sucesso.', 'encerramento', 'sistema')
ON CONFLICT (ordem) DO UPDATE SET
  etapa = EXCLUDED.etapa,
  texto = EXCLUDED.texto,
  variavel = EXCLUDED.variavel,
  tipo = EXCLUDED.tipo,
  updated_at = NOW();

-- 12. INSERIR PROMPTS PRINCIPAIS DA NÔA ESPERANZA
-- =====================================================
INSERT INTO prompts (id, nome, conteudo, categoria, especialidade, prioridade) VALUES 
(
  'avaliacao_inicial_noa',
  'Fluxo Avaliação Dr. Ricardo',
  $$Você é a assistente virtual **Nôa Esperanza**, responsável por conduzir pacientes em uma avaliação clínica inicial baseada no método do Dr. Ricardo Valença.

🎯 Seu objetivo:
- Acolher o paciente de forma natural e empática.
- Afunilar a conversa até iniciar a **avaliação inicial estruturada**.
- Conduzir a avaliação seguindo **exatamente os blocos cadastrados no banco** (id, texto, variavel).
- Não alterar o conteúdo das perguntas originais.
- Dar **transições suaves e feedbacks curtos** para manter a naturalidade.
- Ao final, oferecer a geração do relatório resumido.

🔄 Modelos de Entrada:
1. **Acolhimento livre**: se o paciente disser "oi", "olá", "preciso de ajuda".
   → Responder acolhendo e sugerir iniciar a avaliação.
2. **Sintoma direto**: se o paciente já trouxer uma queixa de saúde.
   → Reconhecer e sugerir que a avaliação completa vai ajudar o Dr. Ricardo.
3. **Interesse em cannabis/tratamento**: se o paciente perguntar sobre cannabis, consulta, preço, tratamento.
   → Responder que pode explicar depois, mas primeiro precisa entender melhor a situação via avaliação.

📋 Regras do fluxo:
- Sempre seguir a ordem: `inicio → motivo_detalhado → queixa_principal → localizacao → tempo_evolucao → caracteristicas → fatores_modificadores → sintomas_associados → historia_medica → cannabis_medicinal → impacto_vida → expectativas → duvidas_finais → finalizacao → historicoDoenca → familiaMae → familiaPai → habitos → alergias → medicacaoRegular → medicacaoEsporadica → fechamento → validacao → final`.
- Use **confirmações** após respostas complexas (ex: "Entendi, você disse que a dor começou há 3 meses. Correto?").
- Nunca pule etapas.
- Se o paciente não entender, explique de forma simples, mas retorne ao fluxo.
- No final, lembre o paciente que pode agendar consulta pelo site oficial do Dr. Ricardo.

✅ Resultado esperado:
Um diálogo natural, onde qualquer entrada do paciente é afunilada para dentro do fluxo clínico pré-definido, sem modificar os textos originais, mas mantendo o tom humano e acolhedor.$$,
  'avaliacao_clinica',
  'geral',
  1
),
(
  'prompt_neurologia',
  'Especialista em Neurologia',
  $$Você é a Nôa Esperanza, especialista em **Neurologia** do Dr. Ricardo Valença.

🧠 Suas especialidades:
- Epilepsia e convulsões
- Doenças neurodegenerativas
- Cefaleias e enxaquecas
- Distúrbios do movimento
- Neuropatias
- Esclerose múltipla
- AVC e sequelas
- Demências

🎯 Foque em:
- Sintomas neurológicos específicos
- História familiar de doenças neurológicas
- Medicamentos neurológicos
- Exames neurológicos realizados
- Impacto na cognição e movimento

Sempre mantenha o tom empático e técnico quando necessário.$$,
  'neurologia',
  'neuro',
  2
),
(
  'prompt_cannabis',
  'Especialista em Cannabis Medicinal',
  $$Você é a Nôa Esperanza, especialista em **Cannabis Medicinal** do Dr. Ricardo Valença.

🌿 Suas especialidades:
- CBD e THC terapêuticos
- Dosagens e protocolos
- Interações medicamentosas
- Efeitos colaterais
- Legislação brasileira
- Importação e prescrição
- Cultivo medicinal
- Óleos, cápsulas e outros formatos

🎯 Foque em:
- Experiência prévia com cannabis
- Expectativas do tratamento
- Preocupações e dúvidas
- Medicamentos em uso
- Condições que podem se beneficiar
- Histórico de uso recreativo

Sempre esclareça dúvidas sobre legalidade e eficácia.$$,
  'cannabis',
  'cannabis',
  2
),
(
  'prompt_nefrologia',
  'Especialista em Nefrologia',
  $$Você é a Nôa Esperanza, especialista em **Nefrologia** do Dr. Ricardo Valença.

🫘 Suas especialidades:
- Doença renal crônica
- Hipertensão arterial
- Diabetes e nefropatia
- Insuficiência renal
- Transplante renal
- Diálise
- Cálculos renais
- Infecções urinárias

🎯 Foque em:
- Função renal e exames
- Pressão arterial
- Diabetes e controle glicêmico
- Medicamentos nefrotóxicos
- Ingestão hídrica
- Sintomas urinários
- História familiar renal

Sempre avalie função renal e risco cardiovascular.$$,
  'nefrologia',
  'rim',
  2
),
(
  'personalidade_noa',
  'Personalidade da Nôa',
  $$Você é a **Nôa Esperanza**, assistente médica virtual do Dr. Ricardo Valença.

🎭 Sua personalidade:
- **Empática e acolhedora**: Sempre demonstre cuidado genuíno
- **Profissional e técnica**: Use conhecimento médico quando necessário
- **Paciente e atenciosa**: Ouça completamente antes de responder
- **Encorajadora**: Motive o paciente a compartilhar informações
- **Respeitosa**: Mantenha sempre o respeito e dignidade

🗣️ Seu tom de voz:
- Calmo e sereno
- Profissional mas humano
- Encorajador sem ser invasivo
- Claro e objetivo
- Sempre positivo e esperançoso

🎯 Sua missão:
Ajudar o Dr. Ricardo Valença a entender melhor cada paciente através de uma avaliação clínica inicial completa e empática.$$,
  'personalidade',
  'geral',
  1
)
ON CONFLICT (id) DO UPDATE SET 
  nome = EXCLUDED.nome,
  conteudo = EXCLUDED.conteudo,
  updated_at = NOW();

-- 13. INSERIR CONFIGURAÇÕES INICIAIS
-- =====================================================
INSERT INTO noa_system_config (config_key, config_value, description) VALUES
('initial_question', 'O que trouxe você aqui?', 'Pergunta inicial obrigatória do sistema'),
('noa_presentation', 'Olá! Eu sou Nôa Esperanza, assistente médica especializada em neurologia, cannabis medicinal e nefrologia. Como posso ajudar você hoje? Me diga onde posso resolver isso?!', 'Apresentação padrão da Nôa'),
('user_type_menu', 'Para melhor atendê-lo, preciso saber qual é o seu perfil: ALUNO, PROFISSIONAL ou PACIENTE', 'Menu de seleção de tipo de usuário'),
('nft_explanation', 'NFT INCENTIVADOR MÍNIMO DO RELATO ESPONTÂNEO - Você está prestes a iniciar sua Avaliação Clínica Inicial. Ao final, será gerado um relatório único ligado a um NFT como incentivo do seu relato espontâneo.', 'Explicação do sistema NFT'),
('system_version', '1.0.0', 'Versão atual do sistema Nôa Esperanza'),
('dr_ricardo_contact', 'Dr. Ricardo Valença - Especialista em Neurologia, Cannabis Medicinal e Nefrologia', 'Informações de contato do Dr. Ricardo')
ON CONFLICT (config_key) DO UPDATE SET 
  config_value = EXCLUDED.config_value,
  description = EXCLUDED.description,
  updated_at = NOW();

-- 5. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE noa_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocos_imre ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_nft_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_conversation_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_system_config ENABLE ROW LEVEL SECURITY;

-- Políticas para noa_users
DROP POLICY IF EXISTS "Users can view their own profile" ON noa_users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON noa_users;
DROP POLICY IF EXISTS "Users can update their own profile" ON noa_users;

CREATE POLICY "Users can view their own profile" ON noa_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON noa_users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON noa_users
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para blocos_imre (leitura pública)
DROP POLICY IF EXISTS "Anyone can view IMRE blocks" ON blocos_imre;
CREATE POLICY "Anyone can view IMRE blocks" ON blocos_imre
    FOR SELECT USING (true);

-- Políticas para prompts (leitura pública)
DROP POLICY IF EXISTS "Anyone can view prompts" ON prompts;
CREATE POLICY "Anyone can view prompts" ON prompts
    FOR SELECT USING (true);

-- Políticas para ai_learning
DROP POLICY IF EXISTS "Users can view their own AI learning" ON ai_learning;
DROP POLICY IF EXISTS "Users can insert AI learning" ON ai_learning;
DROP POLICY IF EXISTS "Users can update their own AI learning" ON ai_learning;

CREATE POLICY "Users can view their own AI learning" ON ai_learning
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert AI learning" ON ai_learning
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own AI learning" ON ai_learning
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

-- Políticas para ai_keywords (leitura pública)
DROP POLICY IF EXISTS "Anyone can view AI keywords" ON ai_keywords;
DROP POLICY IF EXISTS "Anyone can insert AI keywords" ON ai_keywords;
DROP POLICY IF EXISTS "Anyone can update AI keywords" ON ai_keywords;

CREATE POLICY "Anyone can view AI keywords" ON ai_keywords
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert AI keywords" ON ai_keywords
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update AI keywords" ON ai_keywords
    FOR UPDATE USING (true);

-- Políticas para ai_conversation_patterns (leitura pública)
DROP POLICY IF EXISTS "Anyone can view conversation patterns" ON ai_conversation_patterns;
DROP POLICY IF EXISTS "Anyone can insert conversation patterns" ON ai_conversation_patterns;
DROP POLICY IF EXISTS "Anyone can update conversation patterns" ON ai_conversation_patterns;

CREATE POLICY "Anyone can view conversation patterns" ON ai_conversation_patterns
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert conversation patterns" ON ai_conversation_patterns
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update conversation patterns" ON ai_conversation_patterns
    FOR UPDATE USING (true);

-- Políticas para noa_conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON noa_conversations;
DROP POLICY IF EXISTS "Users can insert their own conversations" ON noa_conversations;
DROP POLICY IF EXISTS "Users can update their own conversations" ON noa_conversations;

CREATE POLICY "Users can view their own conversations" ON noa_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations" ON noa_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" ON noa_conversations
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para noa_nft_reports
DROP POLICY IF EXISTS "Users can view their own NFT reports" ON noa_nft_reports;
DROP POLICY IF EXISTS "Users can insert their own NFT reports" ON noa_nft_reports;
DROP POLICY IF EXISTS "Users can update their own NFT reports" ON noa_nft_reports;

CREATE POLICY "Users can view their own NFT reports" ON noa_nft_reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NFT reports" ON noa_nft_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NFT reports" ON noa_nft_reports
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para noa_conversation_flow
DROP POLICY IF EXISTS "Users can view their own conversation flow" ON noa_conversation_flow;
DROP POLICY IF EXISTS "Users can insert conversation flow" ON noa_conversation_flow;

CREATE POLICY "Users can view their own conversation flow" ON noa_conversation_flow
    FOR SELECT USING (true); -- Permitir visualização para análise

CREATE POLICY "Users can insert conversation flow" ON noa_conversation_flow
    FOR INSERT WITH CHECK (true);

-- Políticas para noa_system_config (apenas leitura para usuários)
DROP POLICY IF EXISTS "Users can view system config" ON noa_system_config;
CREATE POLICY "Users can view system config" ON noa_system_config
    FOR SELECT USING (true);

-- 6. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_noa_conversations_user_id ON noa_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_noa_conversations_session_id ON noa_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_noa_conversations_created_at ON noa_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_noa_conversation_flow_session_id ON noa_conversation_flow(session_id);
CREATE INDEX IF NOT EXISTS idx_noa_conversation_flow_step_number ON noa_conversation_flow(step_number);

-- 7. FUNÇÕES AUXILIARES
-- =====================================================

-- Função para obter configuração do sistema
DROP FUNCTION IF EXISTS get_noa_config(TEXT);
CREATE OR REPLACE FUNCTION get_noa_config(config_key_param TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT config_value FROM noa_system_config WHERE config_key = config_key_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter bloco IMRE por ordem
DROP FUNCTION IF EXISTS get_imre_block(INTEGER);
CREATE OR REPLACE FUNCTION get_imre_block(block_order_param INTEGER)
RETURNS TABLE (
    id INTEGER,
    ordem INTEGER,
    etapa TEXT,
    texto TEXT,
    variavel TEXT,
    tipo TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT b.id, b.ordem, b.etapa, b.texto, b.variavel, b.tipo
    FROM blocos_imre b
    WHERE b.ordem = block_order_param AND b.ativo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter prompt por ID
DROP FUNCTION IF EXISTS get_prompt(TEXT);
CREATE OR REPLACE FUNCTION get_prompt(prompt_id_param TEXT)
RETURNS TABLE (
    id TEXT,
    nome TEXT,
    conteudo TEXT,
    categoria TEXT,
    especialidade TEXT,
    prioridade INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.nome, p.conteudo, p.categoria, p.especialidade, p.prioridade
    FROM prompts p
    WHERE p.id = prompt_id_param AND p.ativo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter prompts por categoria
DROP FUNCTION IF EXISTS get_prompts_by_category(TEXT);
CREATE OR REPLACE FUNCTION get_prompts_by_category(category_param TEXT)
RETURNS TABLE (
    id TEXT,
    nome TEXT,
    conteudo TEXT,
    categoria TEXT,
    especialidade TEXT,
    prioridade INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.nome, p.conteudo, p.categoria, p.especialidade, p.prioridade
    FROM prompts p
    WHERE p.categoria = category_param AND p.ativo = true
    ORDER BY p.prioridade ASC, p.nome ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para salvar aprendizado de IA
DROP FUNCTION IF EXISTS save_ai_learning(TEXT, TEXT, TEXT, TEXT, TEXT, DECIMAL, UUID);
CREATE OR REPLACE FUNCTION save_ai_learning(
    keyword_param TEXT,
    context_param TEXT,
    user_message_param TEXT,
    ai_response_param TEXT,
    category_param TEXT DEFAULT 'general',
    confidence_score_param DECIMAL DEFAULT 0.5,
    user_id_param UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    learning_id UUID;
BEGIN
    INSERT INTO ai_learning (
        keyword, context, user_message, ai_response, 
        category, confidence_score, user_id
    ) VALUES (
        keyword_param, context_param, user_message_param, ai_response_param,
        category_param, confidence_score_param, user_id_param
    ) RETURNING id INTO learning_id;
    
    RETURN learning_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar ou atualizar tipo de usuário
DROP FUNCTION IF EXISTS set_user_type(TEXT);
CREATE OR REPLACE FUNCTION set_user_type(
    user_type_param TEXT
)
RETURNS UUID AS $$
DECLARE
    user_profile_id UUID;
BEGIN
    INSERT INTO noa_users (user_id, user_type)
    VALUES (auth.uid(), user_type_param)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        user_type = user_type_param,
        updated_at = NOW()
    RETURNING id INTO user_profile_id;
    
    RETURN user_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter tipo de usuário
DROP FUNCTION IF EXISTS get_user_type();
CREATE OR REPLACE FUNCTION get_user_type()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT user_type FROM noa_users WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar conversa
DROP FUNCTION IF EXISTS register_noa_conversation(TEXT, TEXT, TEXT, TEXT, BOOLEAN, TEXT);
CREATE OR REPLACE FUNCTION register_noa_conversation(
    session_id_param TEXT,
    user_message_param TEXT,
    noa_response_param TEXT,
    conversation_type_param TEXT DEFAULT 'general',
    is_first_response_param BOOLEAN DEFAULT FALSE,
    user_type_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    conversation_id UUID;
BEGIN
    INSERT INTO noa_conversations (
        user_id,
        session_id,
        user_message,
        noa_response,
        conversation_type,
        is_first_response,
        user_type
    ) VALUES (
        auth.uid(),
        session_id_param,
        user_message_param,
        noa_response_param,
        conversation_type_param,
        is_first_response_param,
        user_type_param
    ) RETURNING id INTO conversation_id;
    
    RETURN conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar fluxo de conversa
DROP FUNCTION IF EXISTS register_conversation_flow(TEXT, INTEGER, TEXT, TEXT, TEXT, TEXT);
CREATE OR REPLACE FUNCTION register_conversation_flow(
    session_id_param TEXT,
    step_number_param INTEGER,
    step_type_param TEXT,
    message_content_param TEXT,
    sender_param TEXT,
    user_type_param TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    flow_id UUID;
BEGIN
    INSERT INTO noa_conversation_flow (
        session_id,
        step_number,
        step_type,
        message_content,
        sender,
        user_type
    ) VALUES (
        session_id_param,
        step_number_param,
        step_type_param,
        message_content_param,
        sender_param,
        user_type_param
    ) RETURNING id INTO flow_id;
    
    RETURN flow_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar NFT Report
DROP FUNCTION IF EXISTS create_nft_report(TEXT, UUID, TEXT, JSONB, TEXT, BOOLEAN);
CREATE OR REPLACE FUNCTION create_nft_report(
    session_id_param TEXT,
    evaluation_id_param UUID,
    nft_hash_param TEXT,
    nft_metadata_param JSONB,
    report_content_param TEXT,
    user_consent_param BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
    nft_report_id UUID;
BEGIN
    INSERT INTO noa_nft_reports (
        user_id,
        session_id,
        evaluation_id,
        nft_hash,
        nft_metadata,
        report_content,
        user_consent
    ) VALUES (
        auth.uid(),
        session_id_param,
        evaluation_id_param,
        nft_hash_param,
        nft_metadata_param,
        report_content_param,
        user_consent_param
    ) RETURNING id INTO nft_report_id;
    
    RETURN nft_report_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para atualizar status do NFT
DROP FUNCTION IF EXISTS update_nft_status(UUID, BOOLEAN, TEXT);
CREATE OR REPLACE FUNCTION update_nft_status(
    nft_report_id_param UUID,
    nft_minted_param BOOLEAN,
    mint_transaction_hash_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE noa_nft_reports 
    SET 
        nft_minted = nft_minted_param,
        mint_transaction_hash = mint_transaction_hash_param,
        updated_at = NOW()
    WHERE id = nft_report_id_param AND user_id = auth.uid();
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_blocos_imre_updated_at ON blocos_imre;
CREATE TRIGGER update_blocos_imre_updated_at
    BEFORE UPDATE ON blocos_imre
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prompts_updated_at ON prompts;
CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_noa_users_updated_at ON noa_users;
CREATE TRIGGER update_noa_users_updated_at
    BEFORE UPDATE ON noa_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_noa_conversations_updated_at ON noa_conversations;
CREATE TRIGGER update_noa_conversations_updated_at
    BEFORE UPDATE ON noa_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_noa_nft_reports_updated_at ON noa_nft_reports;
CREATE TRIGGER update_noa_nft_reports_updated_at
    BEFORE UPDATE ON noa_nft_reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_noa_system_config_updated_at ON noa_system_config;
CREATE TRIGGER update_noa_system_config_updated_at
    BEFORE UPDATE ON noa_system_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. VIEWS PARA ANÁLISE
-- =====================================================

-- View para estatísticas de conversas
CREATE OR REPLACE VIEW noa_conversation_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_conversations,
    COUNT(CASE WHEN conversation_type = 'presentation' THEN 1 END) as presentations,
    COUNT(CASE WHEN conversation_type = 'clinical_evaluation' THEN 1 END) as clinical_evaluations,
    COUNT(CASE WHEN conversation_type = 'user_type_selection' THEN 1 END) as user_type_selections
FROM noa_conversations
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View para fluxo de conversas por sessão
CREATE OR REPLACE VIEW noa_session_flow AS
SELECT 
    session_id,
    step_number,
    step_type,
    sender,
    message_content,
    user_type,
    created_at
FROM noa_conversation_flow
ORDER BY session_id, step_number;

-- View para usuários e seus tipos
CREATE OR REPLACE VIEW noa_user_profiles AS
SELECT 
    u.id,
    u.user_id,
    u.user_type,
    u.permission_level,
    u.created_at,
    u.updated_at,
    COUNT(c.id) as total_conversations,
    COUNT(n.id) as total_nft_reports
FROM noa_users u
LEFT JOIN noa_conversations c ON u.user_id = c.user_id
LEFT JOIN noa_nft_reports n ON u.user_id = n.user_id
GROUP BY u.id, u.user_id, u.user_type, u.permission_level, u.created_at, u.updated_at;

-- View para relatórios NFT
CREATE OR REPLACE VIEW noa_nft_summary AS
SELECT 
    n.id,
    n.user_id,
    n.session_id,
    n.evaluation_id,
    n.nft_hash,
    n.user_consent,
    n.nft_minted,
    n.mint_transaction_hash,
    n.created_at,
    u.user_type
FROM noa_nft_reports n
LEFT JOIN noa_users u ON n.user_id = u.user_id
ORDER BY n.created_at DESC;

-- View para blocos IMRE ativos
CREATE OR REPLACE VIEW noa_imre_blocks_active AS
SELECT 
    id,
    ordem,
    etapa,
    texto,
    variavel,
    tipo,
    created_at,
    updated_at
FROM blocos_imre
WHERE ativo = true
ORDER BY ordem ASC;

-- View para prompts por especialidade
CREATE OR REPLACE VIEW noa_prompts_by_specialty AS
SELECT 
    id,
    nome,
    categoria,
    especialidade,
    prioridade,
    ativo,
    created_at,
    updated_at
FROM prompts
WHERE ativo = true
ORDER BY especialidade ASC, prioridade ASC, nome ASC;

-- View para aprendizado de IA
CREATE OR REPLACE VIEW noa_ai_learning_summary AS
SELECT 
    category,
    COUNT(*) as total_entries,
    AVG(confidence_score) as avg_confidence,
    MAX(last_used) as last_used,
    COUNT(DISTINCT user_id) as unique_users
FROM ai_learning
GROUP BY category
ORDER BY total_entries DESC;

-- =====================================================
-- FIM DA CONFIGURAÇÃO DO SISTEMA NÔA ESPERANZA
-- =====================================================

-- INSTRUÇÕES DE USO:
-- 1. Execute este SQL no Supabase SQL Editor
-- 2. Verifique se as tabelas foram criadas corretamente
-- 3. Teste as funções com dados de exemplo
-- 4. Configure as variáveis de ambiente no frontend
-- 5. Implemente a integração no código React

-- EXEMPLO DE USO DAS FUNÇÕES:
-- SELECT get_noa_config('initial_question');
-- SELECT set_user_type('paciente');
-- SELECT get_user_type();
-- SELECT get_imre_block(1);
-- SELECT get_prompt('avaliacao_inicial_noa');
-- SELECT get_prompts_by_category('neurologia');
-- SELECT save_ai_learning('dor', 'sintoma', 'Tenho dor de cabeça', 'Entendo, pode me falar mais sobre essa dor?', 'neurologia', 0.8, auth.uid());
-- SELECT register_noa_conversation('session123', 'Olá', 'Olá! Eu sou Nôa Esperanza...', 'presentation', true, 'paciente');
-- SELECT register_conversation_flow('session123', 1, 'initial_question', 'O que trouxe você aqui?', 'noa', 'paciente');
-- SELECT create_nft_report('session123', 'eval-uuid', 'nft-hash-123', '{"title": "Avaliação Clínica"}', 'Relatório da avaliação...', true);
-- SELECT update_nft_status('nft-report-uuid', true, 'tx-hash-123');

-- ============================================================================
-- SISTEMA ADMINISTRATIVO - Comandos de Voz e KPIs 360°
-- ============================================================================

-- Tabela de Administradores
CREATE TABLE IF NOT EXISTS noa_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  admin_name TEXT NOT NULL,
  admin_key TEXT UNIQUE NOT NULL,
  permissions TEXT[] DEFAULT ARRAY['read', 'write', 'execute', 'delete'],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Logs de Ações Admin
CREATE TABLE IF NOT EXISTS admin_actions_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES noa_admins(id),
  admin_name TEXT,
  command_text TEXT NOT NULL,
  command_type TEXT,
  parameters JSONB DEFAULT '{}',
  result_data JSONB,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de KPIs Clínicos
CREATE TABLE IF NOT EXISTS noa_kpis_clinicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_referencia DATE DEFAULT CURRENT_DATE,
  total_avaliacoes INTEGER DEFAULT 0,
  avaliacoes_completas INTEGER DEFAULT 0,
  taxa_conclusao DECIMAL(5,2),
  top_sintomas JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de KPIs Administrativos
CREATE TABLE IF NOT EXISTS noa_kpis_administrativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_referencia DATE DEFAULT CURRENT_DATE,
  total_usuarios INTEGER DEFAULT 0,
  pacientes_count INTEGER DEFAULT 0,
  total_conversas INTEGER DEFAULT 0,
  nfts_gerados INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de KPIs Simbólicos (IA)
CREATE TABLE IF NOT EXISTS noa_kpis_simbolicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_referencia DATE DEFAULT CURRENT_DATE,
  total_aprendizados INTEGER DEFAULT 0,
  confidence_score_medio DECIMAL(3,2),
  keywords_extraidas INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Função: Validar Admin
CREATE OR REPLACE FUNCTION validate_admin_access(admin_key_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM noa_admins 
    WHERE admin_key = admin_key_param AND is_active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Executar Comando Admin
CREATE OR REPLACE FUNCTION execute_admin_command(
  admin_key_param TEXT,
  command_text_param TEXT,
  command_type_param TEXT,
  parameters_param JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
DECLARE
  admin_record RECORD;
  result_data JSONB;
BEGIN
  IF NOT validate_admin_access(admin_key_param) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Acesso negado');
  END IF;
  
  SELECT * INTO admin_record FROM noa_admins WHERE admin_key = admin_key_param;
  
  CASE command_type_param
    WHEN 'get_stats' THEN
      result_data := jsonb_build_object('info', 'Estatísticas calculadas');
    WHEN 'list_users' THEN
      result_data := (SELECT jsonb_agg(row_to_json(u.*)) FROM noa_users u LIMIT 50);
    ELSE
      result_data := jsonb_build_object('info', 'Comando processado');
  END CASE;
  
  INSERT INTO admin_actions_log (admin_id, admin_name, command_text, command_type, parameters, result_data, success)
  VALUES (admin_record.id, admin_record.admin_name, command_text_param, command_type_param, parameters_param, result_data, true);
  
  RETURN jsonb_build_object('success', true, 'data', result_data, 'executed_by', admin_record.admin_name);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dados Iniciais: Pedro e Ricardo
INSERT INTO noa_admins (admin_name, admin_key, permissions) VALUES
('Pedro Passos', 'admin_pedro_valenca_2025', ARRAY['read', 'write', 'execute', 'delete']),
('Ricardo Valença', 'admin_ricardo_valenca_2025', ARRAY['read', 'write', 'execute', 'delete'])
ON CONFLICT (admin_key) DO NOTHING;
