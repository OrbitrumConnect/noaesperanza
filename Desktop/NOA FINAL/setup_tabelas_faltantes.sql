-- ========================================
-- 📊 TABELAS FALTANTES - GPT BUILDER E CONHECIMENTO
-- Criar todas as tabelas que a Nôa precisa
-- ========================================

-- ========================================
-- TABELA: GPT_DOCUMENTS (Base de conhecimento)
-- ========================================

CREATE TABLE IF NOT EXISTS gpt_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  file_type VARCHAR(50),
  category VARCHAR(100),
  keywords TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding VECTOR(384), -- Para busca semântica
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE gpt_documents IS 'Documentos carregados no GPT Builder';

CREATE INDEX IF NOT EXISTS idx_gpt_documents_user ON gpt_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_gpt_documents_category ON gpt_documents(category);
CREATE INDEX IF NOT EXISTS idx_gpt_documents_embedding 
ON gpt_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50)
WHERE embedding IS NOT NULL;

-- ========================================
-- TABELA: KNOWLEDGE_ITEMS (Itens de conhecimento)
-- ========================================

CREATE TABLE IF NOT EXISTS knowledge_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  keywords TEXT[],
  difficulty_level VARCHAR(20), -- beginner, intermediate, advanced
  specialty VARCHAR(50), -- rim, neuro, cannabis, general
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding VECTOR(384),
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE knowledge_items IS 'Base de conhecimento estruturada';

CREATE INDEX IF NOT EXISTS idx_knowledge_items_category ON knowledge_items(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_specialty ON knowledge_items(specialty);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_embedding 
ON knowledge_items USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50)
WHERE embedding IS NOT NULL;

-- ========================================
-- TABELA: CONVERSATION_HISTORY (Histórico de conversas)
-- ========================================

CREATE TABLE IF NOT EXISTS conversation_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  sentiment VARCHAR(20), -- positive, neutral, negative
  embedding VECTOR(384),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE conversation_history IS 'Histórico completo de conversas';

CREATE INDEX IF NOT EXISTS idx_conversation_history_user ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_history_created ON conversation_history(created_at DESC);

-- ========================================
-- TABELA: CONVERSATION_PATTERNS (Padrões de conversa)
-- ========================================

CREATE TABLE IF NOT EXISTS conversation_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_type VARCHAR(50) NOT NULL,
  pattern_data JSONB NOT NULL,
  frequency INTEGER DEFAULT 1,
  confidence DECIMAL(3,2) DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE conversation_patterns IS 'Padrões detectados em conversas';

CREATE INDEX IF NOT EXISTS idx_conversation_patterns_type ON conversation_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_conversation_patterns_frequency ON conversation_patterns(frequency DESC);

-- ========================================
-- TABELA: INTELLIGENT_LEARNING (Aprendizado inteligente)
-- ========================================

CREATE TABLE IF NOT EXISTS intelligent_learning (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  input_text TEXT NOT NULL,
  output_text TEXT NOT NULL,
  context JSONB DEFAULT '{}'::jsonb,
  user_feedback INTEGER, -- -1, 0, 1 (ruim, neutro, bom)
  auto_confidence DECIMAL(3,2),
  embedding VECTOR(384),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE intelligent_learning IS 'Aprendizado inteligente da IA';

CREATE INDEX IF NOT EXISTS idx_intelligent_learning_embedding 
ON intelligent_learning USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50)
WHERE embedding IS NOT NULL;

-- ========================================
-- TABELA: SEMANTIC_LEARNING_CONTEXT (Contexto semântico)
-- ========================================

CREATE TABLE IF NOT EXISTS semantic_learning_context (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  context_type VARCHAR(50),
  context_data JSONB NOT NULL,
  relevance_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE semantic_learning_context IS 'Contexto semântico para aprendizado';

CREATE INDEX IF NOT EXISTS idx_semantic_learning_user ON semantic_learning_context(user_id);
CREATE INDEX IF NOT EXISTS idx_semantic_learning_type ON semantic_learning_context(context_type);

-- ========================================
-- RLS POLICIES
-- ========================================

ALTER TABLE gpt_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE intelligent_learning ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_learning_context ENABLE ROW LEVEL SECURITY;

-- GPT_DOCUMENTS
DROP POLICY IF EXISTS "Users see own documents" ON gpt_documents;
CREATE POLICY "Users see own documents" 
  ON gpt_documents FOR SELECT 
  USING (user_id = auth.uid() OR user_id IS NULL);

DROP POLICY IF EXISTS "Users manage own documents" ON gpt_documents;
CREATE POLICY "Users manage own documents" 
  ON gpt_documents FOR ALL 
  USING (user_id = auth.uid());

-- KNOWLEDGE_ITEMS (público para leitura)
DROP POLICY IF EXISTS "Public read knowledge" ON knowledge_items;
CREATE POLICY "Public read knowledge" 
  ON knowledge_items FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "Admin manage knowledge" ON knowledge_items;
CREATE POLICY "Admin manage knowledge" 
  ON knowledge_items FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM noa_users 
      WHERE noa_users.user_id = auth.uid() 
      AND noa_users.user_type = 'admin'
    )
  );

-- CONVERSATION_HISTORY
DROP POLICY IF EXISTS "Users see own conversations" ON conversation_history;
CREATE POLICY "Users see own conversations" 
  ON conversation_history FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users manage own conversations" ON conversation_history;
CREATE POLICY "Users manage own conversations" 
  ON conversation_history FOR ALL 
  USING (user_id = auth.uid());

-- CONVERSATION_PATTERNS (admin only)
DROP POLICY IF EXISTS "Admin access patterns" ON conversation_patterns;
CREATE POLICY "Admin access patterns" 
  ON conversation_patterns FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM noa_users 
      WHERE noa_users.user_id = auth.uid() 
      AND noa_users.user_type = 'admin'
    )
  );

-- INTELLIGENT_LEARNING (todos podem ver, sistema escreve)
DROP POLICY IF EXISTS "Public read intelligent learning" ON intelligent_learning;
CREATE POLICY "Public read intelligent learning" 
  ON intelligent_learning FOR SELECT 
  USING (true);

DROP POLICY IF EXISTS "System write intelligent learning" ON intelligent_learning;
CREATE POLICY "System write intelligent learning" 
  ON intelligent_learning FOR INSERT 
  WITH CHECK (true);

-- SEMANTIC_LEARNING_CONTEXT
DROP POLICY IF EXISTS "Users see own context" ON semantic_learning_context;
CREATE POLICY "Users see own context" 
  ON semantic_learning_context FOR SELECT 
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System write context" ON semantic_learning_context;
CREATE POLICY "System write context" 
  ON semantic_learning_context FOR INSERT 
  WITH CHECK (true);

-- ========================================
-- TRIGGERS
-- ========================================

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_gpt_documents_timestamp ON gpt_documents;
CREATE TRIGGER update_gpt_documents_timestamp
    BEFORE UPDATE ON gpt_documents
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS update_knowledge_items_timestamp ON knowledge_items;
CREATE TRIGGER update_knowledge_items_timestamp
    BEFORE UPDATE ON knowledge_items
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- ========================================
-- ✅ SETUP COMPLETO!
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '====================================';
  RAISE NOTICE '✅ TABELAS FALTANTES CRIADAS!';
  RAISE NOTICE '====================================';
  RAISE NOTICE ' ';
  RAISE NOTICE '📚 Tabelas criadas:';
  RAISE NOTICE '- gpt_documents (documentos)';
  RAISE NOTICE '- knowledge_items (conhecimento)';
  RAISE NOTICE '- conversation_history (histórico)';
  RAISE NOTICE '- conversation_patterns (padrões)';
  RAISE NOTICE '- intelligent_learning (aprendizado)';
  RAISE NOTICE '- semantic_learning_context (contexto)';
  RAISE NOTICE ' ';
  RAISE NOTICE '🔍 Verificar:';
  RAISE NOTICE '- SELECT * FROM gpt_documents;';
  RAISE NOTICE '- SELECT * FROM knowledge_items;';
  RAISE NOTICE ' ';
  RAISE NOTICE '====================================';
END $$;

