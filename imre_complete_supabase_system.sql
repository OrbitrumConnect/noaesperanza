-- =====================================================
-- SISTEMA COMPLETO IMRE - INCENTIVADOR MÍNIMO DO RELATO ESPONTÂNEO
-- Nôa Esperanza - Dr. Ricardo Valença
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. CRIAR TABELA DE BLOCOS IMRE (ESTRUTURA CANÔNICA)
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

-- 2. INSERIR OS 28 BLOCOS IMRE CANÔNICOS
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

-- 3. CRIAR TABELA DE CONTEXTO DE CONVERSAS IMRE
CREATE TABLE IF NOT EXISTS conversa_imre (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  bloco_atual INTEGER REFERENCES blocos_imre(ordem),
  respostas JSONB DEFAULT '{}',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
  modo_avaliacao BOOLEAN DEFAULT false,
  user_memory JSONB DEFAULT '{}',
  context_data JSONB DEFAULT '{}',
  audio_playing BOOLEAN DEFAULT false,
  voice_listening BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA DE AVALIAÇÕES INICIAIS (COMPATÍVEL COM CÓDIGO EXISTENTE)
CREATE TABLE IF NOT EXISTS avaliacoes_iniciais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'finalizada')),
  etapa_atual TEXT DEFAULT 'abertura',
  apresentacao TEXT,
  cannabis_medicinal TEXT,
  lista_indiciaria TEXT[],
  queixa_principal TEXT,
  desenvolvimento_indiciario JSONB DEFAULT '{}',
  historia_patologica TEXT[],
  historia_familiar JSONB DEFAULT '{}',
  habitos_vida TEXT[],
  medicacoes JSONB DEFAULT '{}',
  alergias TEXT,
  relatorio_narrativo TEXT,
  concordancia_final BOOLEAN,
  autorizacao_prontuario BOOLEAN,
  data_autorizacao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR TABELA DE CONVERSAS NOA (COMPATÍVEL COM CÓDIGO EXISTENTE)
CREATE TABLE IF NOT EXISTS noa_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  context TEXT,
  category TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CRIAR TABELA DE APRENDIZADO IA (COMPATÍVEL COM CÓDIGO EXISTENTE)
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
  user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CRIAR TABELA DE PALAVRAS-CHAVE IA (COMPATÍVEL COM CÓDIGO EXISTENTE)
CREATE TABLE IF NOT EXISTS ai_keywords (
  keyword TEXT PRIMARY KEY,
  category TEXT DEFAULT 'general',
  importance_score DECIMAL(3,2) DEFAULT 0.5,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CRIAR TABELA DE PADRÕES DE CONVERSA IA (COMPATÍVEL COM CÓDIGO EXISTENTE)
CREATE TABLE IF NOT EXISTS ai_conversation_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_type TEXT NOT NULL,
  pattern_data JSONB NOT NULL,
  success_rate DECIMAL(3,2) DEFAULT 0.5,
  usage_count INTEGER DEFAULT 1,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. CRIAR TABELA DE PROMPTS (COMPATÍVEL COM NOAGPT BRAIN CENTRAL)
CREATE TABLE IF NOT EXISTS prompts (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  conteudo TEXT NOT NULL,
  categoria TEXT DEFAULT 'general',
  especialidade TEXT DEFAULT 'rim',
  ativo BOOLEAN DEFAULT true,
  prioridade INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CRIAR TABELA DE CONTEXTO DE CONVERSAS (COMPATÍVEL COM NOAGPT BRAIN CENTRAL)
CREATE TABLE IF NOT EXISTS conversation_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  session_id TEXT NOT NULL,
  current_etapa TEXT,
  specialty TEXT DEFAULT 'rim',
  modo_avaliacao BOOLEAN DEFAULT false,
  etapa_atual INTEGER DEFAULT 0,
  user_memory JSONB DEFAULT '{}',
  context_data JSONB DEFAULT '{}',
  audio_playing BOOLEAN DEFAULT false,
  voice_listening BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. CRIAR TABELA DE RESPOSTAS PADRÃO (COMPATÍVEL COM NOAGPT BRAIN CENTRAL)
CREATE TABLE IF NOT EXISTS default_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trigger_keywords TEXT[] NOT NULL,
  response_text TEXT NOT NULL,
  category TEXT NOT NULL,
  specialty TEXT DEFAULT 'geral',
  priority INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  audio_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. CRIAR TABELA DE PENSAMENTOS FLUTUANTES (COMPATÍVEL COM NOAGPT BRAIN CENTRAL)
CREATE TABLE IF NOT EXISTS floating_thoughts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  thought_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  route TEXT,
  action TEXT,
  type TEXT NOT NULL,
  specialty TEXT DEFAULT 'geral',
  priority INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. CRIAR FUNÇÃO PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 14. CRIAR TRIGGERS PARA ATUALIZAR TIMESTAMP
CREATE TRIGGER update_blocos_imre_updated_at
    BEFORE UPDATE ON blocos_imre
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversa_imre_updated_at
    BEFORE UPDATE ON conversa_imre
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avaliacoes_iniciais_updated_at
    BEFORE UPDATE ON avaliacoes_iniciais
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prompts_updated_at
    BEFORE UPDATE ON prompts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_context_updated_at
    BEFORE UPDATE ON conversation_context
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. CRIAR FUNÇÃO PARA AVANÇAR BLOCO IMRE
CREATE OR REPLACE FUNCTION avancar_bloco_imre(
  user_uuid TEXT,
  session_id_param TEXT,
  resposta TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  atual INTEGER;
  proximo INTEGER;
  tipo_atual TEXT;
  saida JSONB;
  bloco_atual_data RECORD;
BEGIN
  -- Pega o bloco atual
  SELECT bloco_atual INTO atual 
  FROM conversa_imre 
  WHERE user_id = user_uuid AND session_id = session_id_param;

  -- Se não encontrou, inicia do bloco 1
  IF atual IS NULL THEN
    INSERT INTO conversa_imre (user_id, session_id, bloco_atual, status)
    VALUES (user_uuid, session_id_param, 1, 'in_progress');
    atual := 1;
  END IF;

  -- Pega dados do bloco atual
  SELECT * INTO bloco_atual_data 
  FROM blocos_imre 
  WHERE ordem = atual;

  -- Se tem resposta, salva
  IF resposta IS NOT NULL AND bloco_atual_data.variavel IS NOT NULL THEN
    UPDATE conversa_imre
    SET respostas = respostas || jsonb_build_object(bloco_atual_data.variavel, resposta),
        updated_at = NOW()
    WHERE user_id = user_uuid AND session_id = session_id_param;
  END IF;

  -- Define próximo bloco
  IF bloco_atual_data.tipo = 'loop' AND resposta IS NOT NULL AND resposta <> '' AND resposta NOT ILIKE '%não%' AND resposta NOT ILIKE '%nada%' THEN
    proximo := atual; -- repete a mesma etapa ("O que mais?")
  ELSE
    SELECT ordem INTO proximo 
    FROM blocos_imre 
    WHERE ordem > atual AND ativo = true
    ORDER BY ordem 
    LIMIT 1;
  END IF;

  -- Se chegou ao fim, marca como completo
  IF proximo IS NULL THEN
    UPDATE conversa_imre 
    SET status = 'completed', updated_at = NOW()
    WHERE user_id = user_uuid AND session_id = session_id_param;
    
    -- Retorna finalização
    RETURN jsonb_build_object(
      'bloco_id', null,
      'texto', 'Avaliação IMRE concluída com sucesso!',
      'variavel', 'encerramento',
      'tipo', 'sistema',
      'status', 'completed'
    );
  END IF;

  -- Atualiza bloco atual
  UPDATE conversa_imre 
  SET bloco_atual = proximo, updated_at = NOW()
  WHERE user_id = user_uuid AND session_id = session_id_param;

  -- Pega dados do próximo bloco
  SELECT * INTO bloco_atual_data 
  FROM blocos_imre 
  WHERE ordem = proximo;

  -- Retorna próximo bloco
  RETURN jsonb_build_object(
    'bloco_id', proximo,
    'texto', bloco_atual_data.texto,
    'variavel', bloco_atual_data.variavel,
    'tipo', bloco_atual_data.tipo,
    'status', 'in_progress'
  );
END;
$$ LANGUAGE plpgsql;

-- 16. CRIAR FUNÇÃO PARA GERAR RELATÓRIO IMRE
CREATE OR REPLACE FUNCTION gerar_relatorio_imre(user_uuid TEXT, session_id_param TEXT)
RETURNS TEXT AS $$
DECLARE
  dados JSONB;
  saida TEXT;
  bloco_atual_data RECORD;
BEGIN
  -- Pega as respostas
  SELECT respostas INTO dados 
  FROM conversa_imre 
  WHERE user_id = user_uuid AND session_id = session_id_param;

  saida := '📋 RELATÓRIO DE AVALIAÇÃO CLÍNICA INICIAL - MÉTODO IMRE' || E'\n';
  saida := saida || 'Dr. Ricardo Valença - Nôa Esperanza' || E'\n';
  saida := saida || 'Data: ' || TO_CHAR(NOW(), 'DD/MM/YYYY HH24:MI') || E'\n\n';

  -- Adiciona cada resposta
  FOR campo, valor IN SELECT * FROM jsonb_each_text(dados)
  LOOP
    -- Pega o texto do bloco correspondente
    SELECT texto INTO bloco_atual_data.texto 
    FROM blocos_imre 
    WHERE variavel = campo;
    
    saida := saida || '• ' || COALESCE(bloco_atual_data.texto, campo) || E'\n';
    saida := saida || '  Resposta: ' || valor || E'\n\n';
  END LOOP;

  saida := saida || E'\n' || '---' || E'\n';
  saida := saida || 'Relatório gerado automaticamente pelo sistema IMRE' || E'\n';
  saida := saida || 'Método: Incentivador Mínimo do Relato Espontâneo' || E'\n';
  saida := saida || 'Desenvolvido por: Dr. Ricardo Valença';

  RETURN saida;
END;
$$ LANGUAGE plpgsql;

-- 17. CRIAR FUNÇÃO PARA NOAGPT BUSCAR CONTEXTO COMPLETO
CREATE OR REPLACE FUNCTION noa_get_complete_context(
  user_message TEXT,
  user_id_param TEXT DEFAULT NULL,
  specialty_param TEXT DEFAULT 'rim',
  session_id_param TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    user_context JSONB;
    similar_conversations JSONB;
    learning_data JSONB;
    default_response TEXT;
    prompt_content TEXT;
    keywords_data JSONB;
    conversation_context_data JSONB;
    floating_thoughts_data JSONB;
    imre_context JSONB;
BEGIN
    -- 1. Buscar contexto do usuário
    IF user_id_param IS NOT NULL THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'user_message', user_message,
                'ai_response', ai_response,
                'timestamp', timestamp,
                'category', category
            )
        ) INTO user_context
        FROM noa_conversations 
        WHERE user_id = user_id_param 
        ORDER BY timestamp DESC 
        LIMIT 10;
        
        result := result || jsonb_build_object('user_history', COALESCE(user_context, '[]'::jsonb));
    END IF;
    
    -- 2. Buscar conversas similares
    SELECT jsonb_agg(
        jsonb_build_object(
            'user_message', user_message,
            'ai_response', ai_response,
            'confidence_score', confidence_score,
            'category', category
        )
    ) INTO similar_conversations
    FROM ai_learning 
    WHERE user_message ILIKE '%' || user_message || '%'
    OR ai_response ILIKE '%' || user_message || '%'
    ORDER BY confidence_score DESC 
    LIMIT 5;
    
    result := result || jsonb_build_object('similar_conversations', COALESCE(similar_conversations, '[]'::jsonb));
    
    -- 3. Buscar dados de aprendizado
    SELECT jsonb_agg(
        jsonb_build_object(
            'keyword', keyword,
            'category', category,
            'importance_score', importance_score,
            'usage_count', usage_count
        )
    ) INTO learning_data
    FROM ai_keywords 
    WHERE keyword = ANY(string_to_array(LOWER(user_message), ' '))
    ORDER BY importance_score DESC;
    
    result := result || jsonb_build_object('learning_keywords', COALESCE(learning_data, '[]'::jsonb));
    
    -- 4. Buscar contexto IMRE se session_id fornecido
    IF session_id_param IS NOT NULL THEN
        SELECT jsonb_build_object(
            'bloco_atual', bloco_atual,
            'status', status,
            'respostas', respostas,
            'modo_avaliacao', modo_avaliacao
        ) INTO imre_context
        FROM conversa_imre 
        WHERE session_id = session_id_param;
        
        result := result || jsonb_build_object('imre_context', COALESCE(imre_context, '{}'::jsonb));
    END IF;
    
    -- 5. Buscar pensamentos flutuantes para a especialidade
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', thought_id,
            'title', title,
            'description', description,
            'icon', icon,
            'route', route,
            'action', action,
            'type', type
        )
    ) INTO floating_thoughts_data
    FROM floating_thoughts 
    WHERE (specialty = specialty_param OR specialty = 'geral')
    AND active = true
    ORDER BY priority DESC 
    LIMIT 4;
    
    result := result || jsonb_build_object('floating_thoughts', COALESCE(floating_thoughts_data, '[]'::jsonb));
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 18. CRIAR FUNÇÃO PARA NOAGPT SALVAR APRENDIZADO INTELIGENTE
CREATE OR REPLACE FUNCTION noa_save_intelligent_learning(
  user_message TEXT,
  ai_response TEXT,
  context_data JSONB,
  user_id_param TEXT DEFAULT NULL,
  specialty_param TEXT DEFAULT 'rim',
  session_id_param TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    detected_keywords TEXT[];
    auto_category TEXT;
    confidence_score DECIMAL(3,2);
BEGIN
    -- 1. Detectar palavras-chave automaticamente
    SELECT ARRAY_AGG(DISTINCT keyword) INTO detected_keywords
    FROM ai_keywords 
    WHERE keyword = ANY(string_to_array(LOWER(user_message), ' '));
    
    -- 2. Determinar categoria automaticamente
    IF user_message ILIKE '%cannabis%' OR user_message ILIKE '%maconha%' OR user_message ILIKE '%cbd%' OR user_message ILIKE '%thc%' THEN
        auto_category := 'cannabis';
    ELSIF user_message ILIKE '%cérebro%' OR user_message ILIKE '%nervo%' OR user_message ILIKE '%convulsão%' OR user_message ILIKE '%epilepsia%' THEN
        auto_category := 'neurology';
    ELSIF user_message ILIKE '%rim%' OR user_message ILIKE '%renal%' OR user_message ILIKE '%urina%' OR user_message ILIKE '%pressão%' THEN
        auto_category := 'nephrology';
    ELSE
        auto_category := 'general';
    END IF;
    
    -- 3. Calcular confiança baseada em palavras-chave
    confidence_score := CASE 
        WHEN array_length(detected_keywords, 1) > 3 THEN 0.9
        WHEN array_length(detected_keywords, 1) > 1 THEN 0.7
        ELSE 0.5
    END;
    
    -- 4. Salvar na tabela ai_learning
    INSERT INTO ai_learning (
        keyword, context, user_message, ai_response, category, confidence_score, user_id
    ) VALUES (
        COALESCE(detected_keywords[1], 'geral'),
        user_message,
        user_message,
        ai_response,
        auto_category,
        confidence_score,
        user_id_param
    );
    
    -- 5. Salvar na tabela noa_conversations
    INSERT INTO noa_conversations (
        user_id, user_message, ai_response, context, category
    ) VALUES (
        user_id_param,
        user_message,
        ai_response,
        user_message,
        auto_category
    );
    
    -- 6. Atualizar/criar palavras-chave
    IF detected_keywords IS NOT NULL THEN
        INSERT INTO ai_keywords (keyword, category, importance_score, usage_count)
        SELECT keyword, auto_category, 0.8, 1
        FROM unnest(detected_keywords) AS keyword
        ON CONFLICT (keyword) 
        DO UPDATE SET 
            usage_count = ai_keywords.usage_count + 1,
            last_used = NOW(),
            importance_score = GREATEST(ai_keywords.importance_score, 0.8);
    END IF;
    
    -- 7. Retornar resultado
    result := jsonb_build_object(
        'success', true,
        'detected_keywords', detected_keywords,
        'auto_category', auto_category,
        'confidence_score', confidence_score,
        'learning_saved', true
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 19. INSERIR PROMPTS INICIAIS
INSERT INTO prompts (id, nome, conteudo, categoria, especialidade, prioridade) VALUES
(
  'imre_metodo',
  'Método IMRE - Incentivador Mínimo do Relato Espontâneo',
  $$Você é a Nôa Esperanza, assistente médica do Dr. Ricardo Valença, especializada no método IMRE - Incentivador Mínimo do Relato Espontâneo.

🎯 O IMRE é uma técnica de escuta clínica ativa e graduada, voltada à condução cuidadosa do relato do paciente com o mínimo de interferência possível, incentivando que a narrativa surja de forma espontânea, livre e estruturante.

📋 Suas diretrizes:
- Use as perguntas exatas dos blocos IMRE cadastrados no banco
- Mantenha transições naturais e empáticas
- Para blocos tipo "loop", repita "O que mais?" até saturação
- Para blocos tipo "sistema", execute automaticamente
- Nunca altere o conteúdo das perguntas originais
- Mantenha o tom acolhedor e profissional

🔄 Fluxo IMRE:
1. Acolhimento e apresentação
2. Motivo detalhado (com loops)
3. Queixa principal
4. Desenvolvimento indiciário
5. História médica e familiar
6. Hábitos e medicações
7. Revisão e validação
8. Hipóteses e recomendações

Sempre consulte o banco para obter o próximo bloco da avaliação.$$,
  'imre',
  'geral',
  1
),
(
  'personalidade_noa',
  'Personalidade da Nôa',
  $$Você é a **Nôa Esperanza**, assistente médica virtual do Dr. Ricardo Valença.

👩‍⚕️ Sua personalidade:
- Empática e acolhedora
- Profissional e técnica quando necessário
- Paciente e atenciosa
- Humana, não robótica
- Confiável e segura

🗣️ Seu tom de voz:
- Calmo e sereno
- Acolhedor e compreensivo
- Claro e objetivo
- Motivador quando apropriado
- Respeitoso sempre

🎯 Seus valores:
- Cuidado centrado no paciente
- Medicina baseada em evidências
- Acolhimento humanizado
- Sigilo e confidencialidade
- Excelência no atendimento

Nunca seja robótica ou fria. Sempre mantenha a humanidade.$$,
  'personalidade',
  'geral',
  1
),
(
  'normas_conduta',
  'Normas de Conduta Médica',
  $$⚠️ **NORMAS DE CONDUTA - NÔA ESPERANZA**

🚫 **NUNCA FAÇA:**
- Diagnósticos específicos
- Prescrições de medicamentos
- Interpretação de exames
- Recomendações de tratamento
- Substituir consulta médica presencial

✅ **SEMPRE FAÇA:**
- Acolher e ouvir o paciente
- Coletar informações clínicas
- Orientar sobre quando procurar médico
- Explicar sobre cannabis medicinal
- Encaminhar para Dr. Ricardo quando apropriado

🎯 **SEU PAPEL:**
- Assistente de triagem
- Coletor de informações
- Orientador sobre cannabis
- Facilitador da consulta médica
- Suporte ao Dr. Ricardo

Lembre-se: Você é uma assistente, não substitui o médico.$$,
  'normas',
  'geral',
  1
);

-- 20. INSERIR RESPOSTAS PADRÃO INTELIGENTES
INSERT INTO default_responses (trigger_keywords, response_text, category, specialty, priority, audio_enabled) VALUES 
(
  ARRAY['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite'],
  'Olá! Eu sou a Nôa Esperanza, assistente médica do Dr. Ricardo Valença. Como posso ajudá-lo hoje? Gostaria de iniciar uma avaliação clínica inicial usando o método IMRE?',
  'saudacao',
  'geral',
  1,
  true
),
(
  ARRAY['avaliacao', 'avaliação', 'imre', 'consulta'],
  'Perfeito! Vou iniciar sua avaliação clínica inicial usando o método IMRE - Incentivador Mínimo do Relato Espontâneo. Este método foi desenvolvido pelo Dr. Ricardo Valença para uma escuta clínica mais eficaz.',
  'avaliacao',
  'geral',
  1,
  true
),
(
  ARRAY['cannabis', 'maconha', 'cbd', 'thc', 'maconha medicinal'],
  'Entendo seu interesse em cannabis medicinal. O Dr. Ricardo é especialista nessa área. Durante nossa avaliação IMRE, abordaremos esse tópico de forma natural e estruturada.',
  'cannabis',
  'cannabis',
  2,
  true
);

-- 21. INSERIR PENSAMENTOS FLUTUANTES
INSERT INTO floating_thoughts (thought_id, title, description, icon, route, action, type, specialty, priority) VALUES 
(
  'imre-info',
  'Método IMRE',
  'Incentivador Mínimo do Relato Espontâneo',
  '🧠',
  '/ensino',
  'Saiba Mais',
  'info',
  'geral',
  1
),
(
  'curso-imre',
  'Curso IMRE',
  'Arte da Entrevista Clínica',
  '🎓',
  '/ensino',
  'Iniciar Curso',
  'curso',
  'geral',
  1
),
(
  'dr-ricardo',
  'Dr. Ricardo',
  'Especialista em Neurologia e Cannabis',
  '👨‍⚕️',
  '/dashboard',
  'Ver Perfil',
  'perfil',
  'geral',
  1
);

-- 22. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_blocos_imre_ordem ON blocos_imre(ordem);
CREATE INDEX IF NOT EXISTS idx_blocos_imre_tipo ON blocos_imre(tipo);
CREATE INDEX IF NOT EXISTS idx_conversa_imre_user_id ON conversa_imre(user_id);
CREATE INDEX IF NOT EXISTS idx_conversa_imre_session_id ON conversa_imre(session_id);
CREATE INDEX IF NOT EXISTS idx_conversa_imre_bloco_atual ON conversa_imre(bloco_atual);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_iniciais_user_id ON avaliacoes_iniciais(user_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_iniciais_session_id ON avaliacoes_iniciais(session_id);
CREATE INDEX IF NOT EXISTS idx_noa_conversations_user_id ON noa_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_noa_conversations_timestamp ON noa_conversations(timestamp);
CREATE INDEX IF NOT EXISTS idx_ai_learning_keyword ON ai_learning(keyword);
CREATE INDEX IF NOT EXISTS idx_ai_learning_category ON ai_learning(category);
CREATE INDEX IF NOT EXISTS idx_ai_keywords_category ON ai_keywords(category);
CREATE INDEX IF NOT EXISTS idx_prompts_categoria ON prompts(categoria);
CREATE INDEX IF NOT EXISTS idx_prompts_especialidade ON prompts(especialidade);
CREATE INDEX IF NOT EXISTS idx_default_responses_keywords ON default_responses USING GIN(trigger_keywords);
CREATE INDEX IF NOT EXISTS idx_floating_thoughts_specialty ON floating_thoughts(specialty);

-- 23. HABILITAR RLS
ALTER TABLE blocos_imre ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversa_imre ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes_iniciais ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversation_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE floating_thoughts ENABLE ROW LEVEL SECURITY;

-- 24. CRIAR POLÍTICAS RLS
CREATE POLICY "Allow all for blocos_imre" ON blocos_imre FOR ALL USING (true);
CREATE POLICY "Users can manage their own conversa_imre" ON conversa_imre FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL);
CREATE POLICY "Users can manage their own avaliacoes_iniciais" ON avaliacoes_iniciais FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL);
CREATE POLICY "Allow public read access to avaliacoes_iniciais" ON avaliacoes_iniciais FOR SELECT USING (true);
CREATE POLICY "Allow anonymous evaluation insert" ON avaliacoes_iniciais FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can manage their own noa_conversations" ON noa_conversations FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL);
CREATE POLICY "Allow public read access to noa_conversations" ON noa_conversations FOR SELECT USING (true);
CREATE POLICY "Allow anonymous conversation insert" ON noa_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all for ai_learning" ON ai_learning FOR ALL USING (true);
CREATE POLICY "Allow all for ai_keywords" ON ai_keywords FOR ALL USING (true);
CREATE POLICY "Allow all for ai_conversation_patterns" ON ai_conversation_patterns FOR ALL USING (true);
CREATE POLICY "Allow all for prompts" ON prompts FOR ALL USING (true);
CREATE POLICY "Users can manage their own context" ON conversation_context FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL);
CREATE POLICY "Allow all for default responses" ON default_responses FOR ALL USING (true);
CREATE POLICY "Allow all for floating thoughts" ON floating_thoughts FOR ALL USING (true);

-- 25. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE blocos_imre IS 'Blocos conversacionais do método IMRE - Incentivador Mínimo do Relato Espontâneo. Desenvolvido pelo Dr. Ricardo Valença para escuta clínica ativa e graduada.';
COMMENT ON TABLE conversa_imre IS 'Contexto das conversas IMRE em andamento com controle de fluxo por blocos.';
COMMENT ON TABLE avaliacoes_iniciais IS 'Avaliações clínicas iniciais compatíveis com o código existente.';
COMMENT ON TABLE noa_conversations IS 'Histórico de conversas da NOA Esperanza para aprendizado e contexto.';
COMMENT ON TABLE ai_learning IS 'Sistema de aprendizado da IA baseado em interações.';
COMMENT ON TABLE ai_keywords IS 'Palavras-chave para detecção automática de contexto.';
COMMENT ON TABLE prompts IS 'Prompts da IA organizados por especialidade e categoria.';
COMMENT ON TABLE conversation_context IS 'Contexto avançado das conversas com estados do app.';
COMMENT ON TABLE default_responses IS 'Respostas padrão inteligentes baseadas em palavras-chave.';
COMMENT ON TABLE floating_thoughts IS 'Pensamentos flutuantes para interface do usuário.';

COMMENT ON FUNCTION avancar_bloco_imre(TEXT, TEXT, TEXT) IS 'Avança para o próximo bloco IMRE baseado na lógica do método.';
COMMENT ON FUNCTION gerar_relatorio_imre(TEXT, TEXT) IS 'Gera relatório completo da avaliação IMRE.';
COMMENT ON FUNCTION noa_get_complete_context(TEXT, TEXT, TEXT, TEXT) IS 'NoaGPT: Busca contexto completo incluindo dados IMRE.';
COMMENT ON FUNCTION noa_save_intelligent_learning(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) IS 'NoaGPT: Salva aprendizado inteligente com contexto IMRE.';

-- =====================================================
-- SCRIPT CONCLUÍDO - SISTEMA IMRE COMPLETO
-- =====================================================
