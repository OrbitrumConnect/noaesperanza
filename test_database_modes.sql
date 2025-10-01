-- Teste do database_conversation_modes.sql
-- Verificar se todas as tabelas são criadas corretamente

-- Teste 1: Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'mode_transitions_log',
  'conteudo_educativo', 
  'ai_learning_modes',
  'detected_intents',
  'session_context'
);

-- Teste 2: Verificar se as colunas user_id existem
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name = 'user_id'
AND table_name IN (
  'mode_transitions_log',
  'detected_intents',
  'session_context'
);

-- Teste 3: Verificar se as funções existem
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'salvar_transicao_modo',
  'salvar_intencao_detectada'
);
