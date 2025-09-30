-- =====================================================
-- NOAGPT BRAIN CENTRAL ULTIMATE - SISTEMA COMPLETO
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. CRIAR TABELA DE PROMPTS COMPLETA
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

-- 2. INSERIR PROMPT PRINCIPAL DA AVALIAÇÃO
INSERT INTO prompts (id, nome, conteudo, categoria, especialidade, prioridade) VALUES (
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
) ON CONFLICT (id) DO UPDATE SET 
  nome = EXCLUDED.nome,
  conteudo = EXCLUDED.conteudo,
  updated_at = NOW();

-- 3. INSERIR PROMPTS ESPECÍFICOS POR ESPECIALIDADE
INSERT INTO prompts (id, nome, conteudo, categoria, especialidade, prioridade) VALUES 
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
);

-- 4. INSERIR PROMPTS DE CONTEXTO E PERSONALIDADE
INSERT INTO prompts (id, nome, conteudo, categoria, especialidade, prioridade) VALUES 
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

-- 5. CRIAR TABELA DE CONTEXTO DE CONVERSAS AVANÇADA
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

-- 6. CRIAR TABELA DE RESPOSTAS PADRÃO INTELIGENTES
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

-- 7. INSERIR RESPOSTAS PADRÃO INTELIGENTES
INSERT INTO default_responses (trigger_keywords, response_text, category, specialty, priority, audio_enabled) VALUES 
(
  ARRAY['oi', 'olá', 'bom dia', 'boa tarde', 'boa noite'],
  'Olá! Eu sou a Nôa Esperanza, assistente médica do Dr. Ricardo Valença. Como posso ajudá-lo hoje? Gostaria de iniciar uma avaliação clínica inicial?',
  'saudacao',
  'geral',
  1,
  true
),
(
  ARRAY['ajuda', 'preciso de ajuda', 'não sei o que fazer'],
  'Entendo que você precisa de orientação. Posso ajudá-lo através de uma avaliação clínica inicial. Isso me permitirá entender melhor sua situação e orientá-lo adequadamente.',
  'ajuda',
  'geral',
  1,
  true
),
(
  ARRAY['cannabis', 'maconha', 'cbd', 'thc', 'maconha medicinal'],
  'Entendo seu interesse em cannabis medicinal. O Dr. Ricardo é especialista nessa área. Para uma orientação adequada, preciso primeiro entender sua situação através de uma avaliação clínica. Podemos começar?',
  'cannabis',
  'cannabis',
  2,
  true
),
(
  ARRAY['dor', 'dói', 'dolorido', 'sofrendo'],
  'Entendo que você está sentindo dor. Para ajudá-lo da melhor forma, preciso fazer algumas perguntas sobre sua condição. Vamos iniciar uma avaliação clínica?',
  'sintomas',
  'geral',
  2,
  true
),
(
  ARRAY['consulta', 'marcar', 'agendar', 'preço', 'valor'],
  'Para agendar uma consulta com o Dr. Ricardo, primeiro preciso entender sua situação através de uma avaliação clínica inicial. Isso me permitirá orientá-lo melhor sobre o processo e valores.',
  'consulta',
  'geral',
  2,
  true
);

-- 8. CRIAR TABELA DE PENSAMENTOS FLUTUANTES
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

-- 9. INSERIR PENSAMENTOS FLUTUANTES
INSERT INTO floating_thoughts (thought_id, title, description, icon, route, action, type, specialty, priority) VALUES 
(
  'curso-1',
  'AEC em Nefrologia',
  'Curso intermediário, 6h',
  '🎓',
  '/ensino',
  'Iniciar Curso',
  'curso',
  'rim',
  1
),
(
  'pdf-1',
  'Protocolo CKD',
  'Classificação por estágios renais',
  '📄',
  '/medcann-lab',
  'Baixar PDF',
  'pdf',
  'rim',
  1
),
(
  'curso-2',
  'AEC em Neurologia',
  'Curso avançado, 8h',
  '🎓',
  '/ensino',
  'Iniciar Curso',
  'curso',
  'neuro',
  1
),
(
  'pdf-2',
  'Protocolo Epilepsia',
  'Manejo de convulsões',
  '📄',
  '/medcann-lab',
  'Baixar PDF',
  'pdf',
  'neuro',
  1
),
(
  'curso-3',
  'Cannabis Medicinal',
  'Curso especializado, 10h',
  '🎓',
  '/ensino',
  'Iniciar Curso',
  'curso',
  'cannabis',
  1
),
(
  'pdf-3',
  'Protocolo CBD/THC',
  'Dosagens e indicações',
  '📄',
  '/medcann-lab',
  'Baixar PDF',
  'pdf',
  'cannabis',
  1
);

-- 10. CRIAR FUNÇÃO PARA NoaGPT BUSCAR CONTEXTO COMPLETO
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
    
    -- 4. Buscar resposta padrão
    SELECT get_default_response(user_message) INTO default_response;
    result := result || jsonb_build_object('default_response', COALESCE(default_response, ''));
    
    -- 5. Buscar prompt da especialidade
    SELECT get_prompt_by_specialty(specialty_param) INTO prompt_content;
    result := result || jsonb_build_object('specialty_prompt', COALESCE(prompt_content, ''));
    
    -- 6. Buscar palavras-chave relevantes
    SELECT jsonb_agg(
        jsonb_build_object(
            'keyword', keyword,
            'category', category,
            'importance_score', importance_score
        )
    ) INTO keywords_data
    FROM ai_keywords 
    WHERE category = specialty_param
    ORDER BY importance_score DESC 
    LIMIT 10;
    
    result := result || jsonb_build_object('specialty_keywords', COALESCE(keywords_data, '[]'::jsonb));
    
    -- 7. Buscar contexto da conversa atual
    IF session_id_param IS NOT NULL THEN
        SELECT jsonb_build_object(
            'current_etapa', current_etapa,
            'modo_avaliacao', modo_avaliacao,
            'etapa_atual', etapa_atual,
            'user_memory', user_memory,
            'context_data', context_data,
            'audio_playing', audio_playing,
            'voice_listening', voice_listening
        ) INTO conversation_context_data
        FROM conversation_context 
        WHERE session_id = session_id_param;
        
        result := result || jsonb_build_object('conversation_context', COALESCE(conversation_context_data, '{}'::jsonb));
    END IF;
    
    -- 8. Buscar pensamentos flutuantes para a especialidade
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

-- 11. CRIAR FUNÇÃO PARA NoaGPT SALVAR APRENDIZADO INTELIGENTE
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
    
    -- 7. Atualizar contexto da conversa se session_id fornecido
    IF session_id_param IS NOT NULL THEN
        INSERT INTO conversation_context (
            session_id, specialty, context_data, user_id
        ) VALUES (
            session_id_param, specialty_param, context_data, user_id_param
        )
        ON CONFLICT (session_id) 
        DO UPDATE SET 
            context_data = EXCLUDED.context_data,
            updated_at = NOW();
    END IF;
    
    -- 8. Retornar resultado
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

-- 12. CRIAR FUNÇÃO PARA NoaGPT BUSCAR RESPOSTA INTELIGENTE
CREATE OR REPLACE FUNCTION noa_get_intelligent_response(
  user_message TEXT,
  user_id_param TEXT DEFAULT NULL,
  specialty_param TEXT DEFAULT 'rim',
  session_id_param TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB := '{}';
    context_data JSONB;
    best_response TEXT;
    confidence DECIMAL(3,2);
    learning_result JSONB;
BEGIN
    -- 1. Buscar contexto completo
    SELECT noa_get_complete_context(user_message, user_id_param, specialty_param, session_id_param) INTO context_data;
    
    -- 2. Buscar melhor resposta baseada em aprendizado
    SELECT ai_response, confidence_score INTO best_response, confidence
    FROM ai_learning 
    WHERE user_message ILIKE '%' || user_message || '%'
    AND confidence_score > 0.7
    ORDER BY confidence_score DESC, usage_count DESC
    LIMIT 1;
    
    -- 3. Se não encontrou resposta boa, usar padrão
    IF best_response IS NULL THEN
        SELECT get_default_response(user_message) INTO best_response;
        confidence := 0.5;
    END IF;
    
    -- 4. Preparar resultado
    result := jsonb_build_object(
        'response', COALESCE(best_response, 'Desculpe, não entendi. Pode reformular sua pergunta?'),
        'confidence', COALESCE(confidence, 0.5),
        'context', context_data,
        'should_learn', CASE WHEN confidence < 0.8 THEN true ELSE false END,
        'specialty', specialty_param,
        'audio_enabled', true,
        'floating_thoughts', context_data->'floating_thoughts'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 13. CRIAR FUNÇÃO PARA NoaGPT ATUALIZAR CONTEXTO DE CONVERSA
CREATE OR REPLACE FUNCTION noa_update_conversation_context(
  session_id_param TEXT,
  current_etapa_param TEXT,
  specialty_param TEXT DEFAULT 'rim',
  modo_avaliacao_param BOOLEAN DEFAULT false,
  etapa_atual_param INTEGER DEFAULT 0,
  user_memory_param JSONB DEFAULT '{}',
  context_data_param JSONB DEFAULT '{}',
  audio_playing_param BOOLEAN DEFAULT false,
  voice_listening_param BOOLEAN DEFAULT false,
  user_id_param TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    -- Inserir ou atualizar contexto
    INSERT INTO conversation_context (
        session_id, current_etapa, specialty, modo_avaliacao, etapa_atual, 
        user_memory, context_data, audio_playing, voice_listening, user_id
    ) VALUES (
        session_id_param, current_etapa_param, specialty_param, modo_avaliacao_param, 
        etapa_atual_param, user_memory_param, context_data_param, audio_playing_param, 
        voice_listening_param, user_id_param
    )
    ON CONFLICT (session_id) 
    DO UPDATE SET 
        current_etapa = EXCLUDED.current_etapa,
        specialty = EXCLUDED.specialty,
        modo_avaliacao = EXCLUDED.modo_avaliacao,
        etapa_atual = EXCLUDED.etapa_atual,
        user_memory = EXCLUDED.user_memory,
        context_data = EXCLUDED.context_data,
        audio_playing = EXCLUDED.audio_playing,
        voice_listening = EXCLUDED.voice_listening,
        user_id = EXCLUDED.user_id,
        updated_at = NOW();
    
    result := jsonb_build_object(
        'success', true,
        'session_id', session_id_param,
        'current_etapa', current_etapa_param,
        'specialty', specialty_param,
        'modo_avaliacao', modo_avaliacao_param,
        'etapa_atual', etapa_atual_param
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 14. CRIAR FUNÇÃO PARA NoaGPT BUSCAR ESTATÍSTICAS
CREATE OR REPLACE FUNCTION noa_get_ai_statistics()
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    total_conversations INTEGER;
    total_learning INTEGER;
    top_keywords JSONB;
    category_stats JSONB;
    specialty_stats JSONB;
BEGIN
    -- Contar conversas
    SELECT COUNT(*) INTO total_conversations FROM noa_conversations;
    
    -- Contar aprendizado
    SELECT COUNT(*) INTO total_learning FROM ai_learning;
    
    -- Top palavras-chave
    SELECT jsonb_agg(
        jsonb_build_object(
            'keyword', keyword,
            'usage_count', usage_count,
            'importance_score', importance_score
        )
    ) INTO top_keywords
    FROM ai_keywords 
    ORDER BY usage_count DESC 
    LIMIT 10;
    
    -- Estatísticas por categoria
    SELECT jsonb_agg(
        jsonb_build_object(
            'category', category,
            'count', count,
            'avg_confidence', avg_confidence
        )
    ) INTO category_stats
    FROM (
        SELECT 
            category,
            COUNT(*) as count,
            AVG(confidence_score) as avg_confidence
        FROM ai_learning 
        GROUP BY category
    ) stats;
    
    -- Estatísticas por especialidade
    SELECT jsonb_agg(
        jsonb_build_object(
            'specialty', specialty,
            'count', count
        )
    ) INTO specialty_stats
    FROM (
        SELECT 
            specialty,
            COUNT(*) as count
        FROM conversation_context 
        GROUP BY specialty
    ) stats;
    
    result := jsonb_build_object(
        'total_conversations', total_conversations,
        'total_learning', total_learning,
        'top_keywords', COALESCE(top_keywords, '[]'::jsonb),
        'category_stats', COALESCE(category_stats, '[]'::jsonb),
        'specialty_stats', COALESCE(specialty_stats, '[]'::jsonb),
        'timestamp', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 15. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_prompts_categoria ON prompts(categoria);
CREATE INDEX IF NOT EXISTS idx_prompts_especialidade ON prompts(especialidade);
CREATE INDEX IF NOT EXISTS idx_prompts_ativo ON prompts(ativo);
CREATE INDEX IF NOT EXISTS idx_conversation_context_user_id ON conversation_context(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_context_session_id ON conversation_context(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_context_specialty ON conversation_context(specialty);
CREATE INDEX IF NOT EXISTS idx_default_responses_keywords ON default_responses USING GIN(trigger_keywords);
CREATE INDEX IF NOT EXISTS idx_default_responses_category ON default_responses(category);
CREATE INDEX IF NOT EXISTS idx_floating_thoughts_specialty ON floating_thoughts(specialty);
CREATE INDEX IF NOT EXISTS idx_floating_thoughts_active ON floating_thoughts(active);

-- 16. HABILITAR RLS
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE floating_thoughts ENABLE ROW LEVEL SECURITY;

-- 17. CRIAR POLÍTICAS RLS
CREATE POLICY "Allow all for prompts" ON prompts FOR ALL USING (true);
CREATE POLICY "Users can manage their own context" ON conversation_context FOR ALL USING (auth.uid()::text = user_id OR user_id IS NULL);
CREATE POLICY "Allow all for default responses" ON default_responses FOR ALL USING (true);
CREATE POLICY "Allow all for floating thoughts" ON floating_thoughts FOR ALL USING (true);

-- 18. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE prompts IS 'Tabela de prompts para personalizar respostas da IA por especialidade';
COMMENT ON TABLE conversation_context IS 'Contexto avançado das conversas em andamento com estados do app';
COMMENT ON TABLE default_responses IS 'Respostas padrão inteligentes baseadas em palavras-chave';
COMMENT ON TABLE floating_thoughts IS 'Pensamentos flutuantes para interface do usuário';
COMMENT ON FUNCTION noa_get_complete_context(TEXT, TEXT, TEXT, TEXT) IS 'NoaGPT: Busca contexto completo incluindo pensamentos flutuantes';
COMMENT ON FUNCTION noa_save_intelligent_learning(TEXT, TEXT, JSONB, TEXT, TEXT, TEXT) IS 'NoaGPT: Salva aprendizado inteligente com contexto de sessão';
COMMENT ON FUNCTION noa_get_intelligent_response(TEXT, TEXT, TEXT, TEXT) IS 'NoaGPT: Busca resposta inteligente com pensamentos flutuantes';
COMMENT ON FUNCTION noa_update_conversation_context(TEXT, TEXT, TEXT, BOOLEAN, INTEGER, JSONB, JSONB, BOOLEAN, BOOLEAN, TEXT) IS 'NoaGPT: Atualiza contexto completo da conversa';
COMMENT ON FUNCTION noa_get_ai_statistics() IS 'NoaGPT: Retorna estatísticas completas da IA por especialidade';

-- =====================================================
-- SCRIPT CONCLUÍDO - NoaGPT BRAIN CENTRAL ULTIMATE
-- =====================================================
