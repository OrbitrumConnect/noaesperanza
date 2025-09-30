-- CORRIGIR POLÍTICAS RLS - APENAS USUÁRIOS AUTENTICADOS
-- Remover TODAS as políticas permissivas de desenvolvimento

DROP POLICY IF EXISTS "Permitir inserção para desenvolvimento" ON avaliacoes_iniciais;
DROP POLICY IF EXISTS "Permitir leitura para desenvolvimento" ON avaliacoes_iniciais;
DROP POLICY IF EXISTS "Permitir atualização para desenvolvimento" ON avaliacoes_iniciais;

-- Remover também as políticas antigas que podem estar duplicadas
DROP POLICY IF EXISTS "Permitir inserção para usuários autenticados" ON avaliacoes_iniciais;
DROP POLICY IF EXISTS "Permitir leitura para usuários autenticados" ON avaliacoes_iniciais;
DROP POLICY IF EXISTS "Permitir atualização para usuários autenticados" ON avaliacoes_iniciais;

-- Criar políticas SEGURAS - APENAS para usuários autenticados
CREATE POLICY "Permitir inserção para usuários autenticados" ON avaliacoes_iniciais
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir leitura para usuários autenticados" ON avaliacoes_iniciais
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir atualização para usuários autenticados" ON avaliacoes_iniciais
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Garantir que RLS está habilitado
ALTER TABLE avaliacoes_iniciais ENABLE ROW LEVEL SECURITY;

-- Verificar políticas ativas (deve mostrar APENAS as 3 políticas seguras)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'avaliacoes_iniciais'
ORDER BY policyname;
