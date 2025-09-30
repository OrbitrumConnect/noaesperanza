-- =====================================================
-- CORRIGIR WARNINGS COMUNS NO SUPABASE
-- =====================================================

-- 1. Remover políticas RLS duplicadas ou problemáticas
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    -- Lista todas as políticas problemáticas
    FOR pol IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND (policyname LIKE '%_policy' OR policyname LIKE '%Policy%')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                      pol.policyname, pol.schemaname, pol.tablename);
        RAISE NOTICE 'Removida política: %.%.%', pol.schemaname, pol.tablename, pol.policyname;
    END LOOP;
END $$;

-- 2. Recriar políticas RLS básicas e funcionais
-- Para avaliacoes_iniciais
DROP POLICY IF EXISTS "Allow all operations on avaliacoes_iniciais" ON avaliacoes_iniciais;
CREATE POLICY "Allow all operations on avaliacoes_iniciais" ON avaliacoes_iniciais
    FOR ALL USING (true) WITH CHECK (true);

-- Para users
DROP POLICY IF EXISTS "Allow all operations on users" ON users;
CREATE POLICY "Allow all operations on users" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- Para noa_conversations
DROP POLICY IF EXISTS "Allow all operations on noa_conversations" ON noa_conversations;
CREATE POLICY "Allow all operations on noa_conversations" ON noa_conversations
    FOR ALL USING (true) WITH CHECK (true);

-- Para ai_learning
DROP POLICY IF EXISTS "Allow all operations on ai_learning" ON ai_learning;
CREATE POLICY "Allow all operations on ai_learning" ON ai_learning
    FOR ALL USING (true) WITH CHECK (true);

-- 3. Remover constraints problemáticos
DO $$ 
DECLARE
    con RECORD;
BEGIN
    FOR con IN 
        SELECT tc.table_name, tc.constraint_name
        FROM information_schema.table_constraints tc
        WHERE tc.table_schema = 'public'
        AND tc.constraint_type = 'CHECK'
        AND (tc.constraint_name LIKE '%_check' OR tc.constraint_name LIKE '%Check%')
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
                          con.table_name, con.constraint_name);
            RAISE NOTICE 'Removido constraint: %.%', con.table_name, con.constraint_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover constraint %.%: %', con.table_name, con.constraint_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 4. Remover índices duplicados
DO $$ 
DECLARE
    idx RECORD;
BEGIN
    FOR idx IN 
        SELECT schemaname, tablename, indexname
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND (indexname LIKE '%_idx' OR indexname LIKE '%_index')
    LOOP
        BEGIN
            EXECUTE format('DROP INDEX IF EXISTS %I.%I', idx.schemaname, idx.indexname);
            RAISE NOTICE 'Removido índice: %.%', idx.schemaname, idx.indexname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover índice %.%: %', idx.schemaname, idx.indexname, SQLERRM;
        END;
    END LOOP;
END $$;

-- 5. Recriar índices essenciais
CREATE INDEX IF NOT EXISTS idx_avaliacoes_iniciais_user_id ON avaliacoes_iniciais(user_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_iniciais_created_at ON avaliacoes_iniciais(created_at);
CREATE INDEX IF NOT EXISTS idx_noa_conversations_user_id ON noa_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_noa_conversations_created_at ON noa_conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_learning_created_at ON ai_learning(created_at);

-- 6. Remover funções problemáticas
DO $$ 
DECLARE
    func RECORD;
BEGIN
    FOR func IN 
        SELECT routine_name
        FROM information_schema.routines 
        WHERE routine_schema = 'public'
        AND routine_type = 'FUNCTION'
        AND (routine_name LIKE '%_function' OR routine_name LIKE '%Function%')
    LOOP
        BEGIN
            EXECUTE format('DROP FUNCTION IF EXISTS %I CASCADE', func.routine_name);
            RAISE NOTICE 'Removida função: %', func.routine_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover função %: %', func.routine_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 7. Remover triggers problemáticos
DO $$ 
DECLARE
    trig RECORD;
BEGIN
    FOR trig IN 
        SELECT trigger_name, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public'
        AND (trigger_name LIKE '%_trigger' OR trigger_name LIKE '%Trigger%')
    LOOP
        BEGIN
            EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I', trig.trigger_name, trig.event_object_table);
            RAISE NOTICE 'Removido trigger: %.%', trig.event_object_table, trig.trigger_name;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Erro ao remover trigger %.%: %', trig.event_object_table, trig.trigger_name, SQLERRM;
        END;
    END LOOP;
END $$;

-- 8. Recriar triggers essenciais
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para avaliacoes_iniciais
DROP TRIGGER IF EXISTS update_avaliacoes_iniciais_updated_at ON avaliacoes_iniciais;
CREATE TRIGGER update_avaliacoes_iniciais_updated_at
    BEFORE UPDATE ON avaliacoes_iniciais
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para users
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Verificar resultado
SELECT 'Limpeza concluída!' as status;
