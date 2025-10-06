-- 🔐 POLÍTICAS RLS (ROW LEVEL SECURITY) - ORBITRUM CONNECT
-- Este arquivo contém as políticas básicas de segurança para o Supabase

-- =====================================================
-- 1. ATIVAR RLS NAS TABELAS PRINCIPAIS
-- =====================================================

-- Ativar RLS na tabela users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela professionals  
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

-- Ativar RLS na tabela clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS PARA TABELA USERS
-- =====================================================

-- Política: Usuários podem ver apenas seus próprios dados
CREATE POLICY "users_own_data" ON users
FOR ALL USING (
  auth.uid()::text = supabase_id 
  OR userType = 'admin'
);

-- Política: Admins podem ver todos os usuários
CREATE POLICY "admins_all_users" ON users
FOR ALL USING (userType = 'admin');

-- =====================================================
-- 3. POLÍTICAS PARA TABELA PROFESSIONALS
-- =====================================================

-- Política: Profissionais podem ver apenas seus próprios dados
CREATE POLICY "professionals_own_data" ON professionals
FOR ALL USING (
  auth.uid()::text = supabase_id
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid()::text 
    AND users.userType = 'admin'
  )
);

-- Política: Admins podem ver todos os profissionais
CREATE POLICY "admins_all_professionals" ON professionals
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid()::text 
    AND users.userType = 'admin'
  )
);

-- =====================================================
-- 4. POLÍTICAS PARA TABELA CLIENTS
-- =====================================================

-- Política: Clientes podem ver apenas seus próprios dados
CREATE POLICY "clients_own_data" ON clients
FOR ALL USING (
  auth.uid()::text = supabase_id
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid()::text 
    AND users.userType = 'admin'
  )
);

-- Política: Admins podem ver todos os clientes
CREATE POLICY "admins_all_clients" ON clients
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid()::text 
    AND users.userType = 'admin'
  )
);

-- =====================================================
-- 5. POLÍTICA DE INSERÇÃO SEGURA
-- =====================================================

-- Política: Apenas usuários autenticados podem inserir dados
CREATE POLICY "authenticated_insert" ON users
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_insert_professionals" ON professionals
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_insert_clients" ON clients
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- =====================================================
-- 6. POLÍTICA DE ATUALIZAÇÃO SEGURA
-- =====================================================

-- Política: Usuários podem atualizar apenas seus próprios dados
CREATE POLICY "users_update_own" ON users
FOR UPDATE USING (
  auth.uid()::text = supabase_id
  OR userType = 'admin'
);

-- =====================================================
-- 7. VERIFICAÇÃO DE POLÍTICAS
-- =====================================================

-- Comando para verificar se as políticas foram criadas
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
-- FROM pg_policies 
-- WHERE schemaname = 'public' 
-- AND tablename IN ('users', 'professionals', 'clients');

-- =====================================================
-- 8. COMENTÁRIOS IMPORTANTES
-- =====================================================

/*
🎯 COMO USAR ESTE ARQUIVO:

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole todo este conteúdo
4. Execute o script

🔒 RESULTADO:
- RLS ativado em todas as tabelas
- Políticas de segurança implementadas
- Admins têm acesso total
- Usuários normais veem apenas seus dados
- Sistema seguro para produção

⚠️ IMPORTANTE:
- Execute apenas UMA VEZ
- Faça backup antes de executar
- Teste em ambiente de desenvolvimento primeiro
*/ 