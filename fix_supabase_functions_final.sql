-- 🔧 CORREÇÃO FINAL DO SUPABASE
-- Execute este script no SQL Editor do Supabase

-- 1. REMOVER FUNÇÕES EXISTENTES PRIMEIRO
DROP FUNCTION IF EXISTS get_imre_block(integer);
DROP FUNCTION IF EXISTS register_conversation_flow(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS register_noa_conversation(TEXT, TEXT, TEXT);

-- 2. CRIAR FUNÇÃO get_imre_block
CREATE OR REPLACE FUNCTION get_imre_block(block_number INTEGER)
RETURNS TABLE (
  block_order INTEGER,
  block_name TEXT,
  block_description TEXT,
  block_prompt TEXT,
  block_type TEXT,
  is_active BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    imre_blocks.block_order,
    imre_blocks.block_name,
    imre_blocks.block_description,
    imre_blocks.block_prompt,
    imre_blocks.block_type,
    imre_blocks.is_active
  FROM imre_blocks
  WHERE imre_blocks.block_order = block_number
  AND imre_blocks.is_active = true
  ORDER BY imre_blocks.block_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CRIAR FUNÇÃO register_conversation_flow
CREATE OR REPLACE FUNCTION register_conversation_flow(
  session_id_param TEXT,
  step_type_param TEXT,
  user_message_param TEXT,
  user_type_param TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO noa_conversation_flow (
    session_id,
    step_type,
    user_message,
    user_type,
    created_at
  ) VALUES (
    session_id_param,
    step_type_param,
    user_message_param,
    user_type_param,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CRIAR FUNÇÃO register_noa_conversation
CREATE OR REPLACE FUNCTION register_noa_conversation(
  user_message_param TEXT,
  noa_response_param TEXT,
  user_type_param TEXT
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO noa_conversations (
    user_message,
    noa_response,
    user_type,
    created_at
  ) VALUES (
    user_message_param,
    noa_response_param,
    user_type_param,
    NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CORRIGIR POLÍTICAS RLS
-- Para mode_transitions_log
DROP POLICY IF EXISTS "Users can view their own mode transitions" ON mode_transitions_log;
CREATE POLICY "Users can view their own mode transitions" ON mode_transitions_log
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own mode transitions" ON mode_transitions_log;
CREATE POLICY "Users can insert their own mode transitions" ON mode_transitions_log
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Para avaliacoes_em_andamento
DROP POLICY IF EXISTS "Users can view their own evaluations" ON avaliacoes_em_andamento;
CREATE POLICY "Users can view their own evaluations" ON avaliacoes_em_andamento
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own evaluations" ON avaliacoes_em_andamento;
CREATE POLICY "Users can insert their own evaluations" ON avaliacoes_em_andamento
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own evaluations" ON avaliacoes_em_andamento;
CREATE POLICY "Users can update their own evaluations" ON avaliacoes_em_andamento
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. VERIFICAR SE TABELA imre_blocks EXISTE
CREATE TABLE IF NOT EXISTS imre_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  block_order INTEGER NOT NULL UNIQUE,
  block_name TEXT NOT NULL,
  block_description TEXT,
  block_prompt TEXT NOT NULL,
  block_type TEXT DEFAULT 'pergunta',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INSERIR DADOS INICIAIS DO IMRE (se não existir)
INSERT INTO imre_blocks (block_order, block_name, block_description, block_prompt) VALUES
(1, 'Apresentação', 'Primeira pergunta de apresentação', 'Olá! Eu sou Nôa Esperanza. Por favor, apresente-se também e vamos iniciar a sua avaliação inicial para consultas com Dr. Ricardo Valença.'),
(2, 'Queixa Principal', 'Identificar a queixa principal', 'Qual é a sua queixa principal hoje? Descreva o que mais está te incomodando.'),
(3, 'Localização', 'Localizar o problema', 'Onde exatamente você sente esse problema? Pode me indicar a localização?'),
(4, 'Tempo de Evolução', 'Tempo que o problema existe', 'Há quanto tempo você está sentindo esse problema?'),
(5, 'Características', 'Características do problema', 'Como você descreveria esse problema? É uma dor, desconforto, ou outro tipo de sensação?')
ON CONFLICT (block_order) DO NOTHING;

-- 8. HABILITAR RLS NAS TABELAS
ALTER TABLE imre_blocks ENABLE ROW LEVEL SECURITY;

-- Política para imre_blocks (todos podem ler)
DROP POLICY IF EXISTS "Anyone can view imre blocks" ON imre_blocks;
CREATE POLICY "Anyone can view imre blocks" ON imre_blocks
  FOR SELECT USING (true);

-- 9. VERIFICAR SE TABELAS EXISTEM
CREATE TABLE IF NOT EXISTS noa_conversation_flow (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  step_type TEXT NOT NULL,
  user_message TEXT,
  user_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS noa_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_message TEXT NOT NULL,
  noa_response TEXT NOT NULL,
  user_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. HABILITAR RLS NAS NOVAS TABELAS
ALTER TABLE noa_conversation_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE noa_conversations ENABLE ROW LEVEL SECURITY;

-- Políticas para noa_conversation_flow
DROP POLICY IF EXISTS "Users can view their own conversation flow" ON noa_conversation_flow;
CREATE POLICY "Users can view their own conversation flow" ON noa_conversation_flow
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert conversation flow" ON noa_conversation_flow;
CREATE POLICY "Users can insert conversation flow" ON noa_conversation_flow
  FOR INSERT WITH CHECK (true);

-- Políticas para noa_conversations
DROP POLICY IF EXISTS "Users can view conversations" ON noa_conversations;
CREATE POLICY "Users can view conversations" ON noa_conversations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert conversations" ON noa_conversations;
CREATE POLICY "Users can insert conversations" ON noa_conversations
  FOR INSERT WITH CHECK (true);
