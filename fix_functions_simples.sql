-- 🔧 CORREÇÃO SIMPLES: Executar passo a passo

-- PASSO 1: Remover função register_noa_conversation
DROP FUNCTION IF EXISTS register_noa_conversation CASCADE;

-- PASSO 2: Remover função save_ai_learning  
DROP FUNCTION IF EXISTS save_ai_learning CASCADE;

-- PASSO 3: Criar tabela noa_conversations se não existir
CREATE TABLE IF NOT EXISTS noa_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  user_type TEXT DEFAULT 'paciente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 4: Criar função register_noa_conversation
CREATE FUNCTION register_noa_conversation(
  session_id_param TEXT,
  user_id_param TEXT,
  user_message_param TEXT,
  ai_response_param TEXT,
  user_type_param TEXT DEFAULT 'paciente'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO noa_conversations (
    session_id,
    user_id,
    user_message,
    ai_response,
    user_type,
    created_at
  ) VALUES (
    session_id_param,
    user_id_param,
    user_message_param,
    ai_response_param,
    user_type_param,
    NOW()
  );
  
  RETURN json_build_object(
    'success', true,
    'message', 'Conversa registrada com sucesso'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- PASSO 5: Criar função save_ai_learning
CREATE FUNCTION save_ai_learning(
  keyword_param TEXT,
  context_param TEXT,
  user_message_param TEXT,
  ai_response_param TEXT,
  category_param TEXT,
  confidence_score_param NUMERIC,
  user_id_param TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO ai_learning (
    keyword,
    context,
    user_message,
    ai_response,
    category,
    confidence_score,
    user_id,
    created_at,
    updated_at
  ) VALUES (
    keyword_param,
    context_param,
    user_message_param,
    ai_response_param,
    category_param,
    confidence_score_param,
    user_id_param,
    NOW(),
    NOW()
  )
  ON CONFLICT (keyword, category) 
  DO UPDATE SET
    context = EXCLUDED.context,
    user_message = EXCLUDED.user_message,
    ai_response = EXCLUDED.ai_response,
    confidence_score = EXCLUDED.confidence_score,
    user_id = EXCLUDED.user_id,
    updated_at = NOW(),
    usage_count = ai_learning.usage_count + 1;
  
  RETURN json_build_object(
    'success', true,
    'message', 'Aprendizado salvo/atualizado com sucesso'
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- PASSO 6: Criar índices
CREATE INDEX IF NOT EXISTS idx_noa_conversations_user_id ON noa_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_noa_conversations_session_id ON noa_conversations(session_id);

-- PASSO 7: Habilitar RLS
ALTER TABLE noa_conversations ENABLE ROW LEVEL SECURITY;

-- PASSO 8: Criar políticas RLS
DROP POLICY IF EXISTS "Users can view their own conversations" ON noa_conversations;
CREATE POLICY "Users can view their own conversations" 
ON noa_conversations FOR SELECT 
USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "Users can insert their own conversations" ON noa_conversations;
CREATE POLICY "Users can insert their own conversations" 
ON noa_conversations FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

-- PASSO 9: Criar trigger updated_at
DROP TRIGGER IF EXISTS update_noa_conversations_updated_at ON noa_conversations;
CREATE TRIGGER update_noa_conversations_updated_at
  BEFORE UPDATE ON noa_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ✅ SUCESSO: Funções criadas com sucesso!
