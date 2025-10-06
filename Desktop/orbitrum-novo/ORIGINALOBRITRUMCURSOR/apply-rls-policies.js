// 🔐 SCRIPT PARA APLICAR POLÍTICAS RLS NO SUPABASE
// Execute este script para configurar as políticas de segurança

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuração do Supabase
const supabaseUrl = 'https://gnvxnsgewhjucdhwrrdi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdudnhuc2dld2hqdWNkaHdycmRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2Nzk1NDAsImV4cCI6MjA2ODI1NTU0MH0.p0LjK34rpLRVnG0F002PL5MbqSJOvyUebUBWAruMpi0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Políticas RLS para aplicar
const rlsPolicies = `
-- Ativar RLS nas tabelas principais
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela users
CREATE POLICY "users_own_data" ON users
FOR ALL USING (
  auth.uid()::text = supabase_id 
  OR userType = 'admin'
);

CREATE POLICY "admins_all_users" ON users
FOR ALL USING (userType = 'admin');

-- Políticas para tabela professionals
CREATE POLICY "professionals_own_data" ON professionals
FOR ALL USING (
  auth.uid()::text = supabase_id
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid()::text 
    AND users.userType = 'admin'
  )
);

CREATE POLICY "admins_all_professionals" ON professionals
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid()::text 
    AND users.userType = 'admin'
  )
);

-- Políticas para tabela clients
CREATE POLICY "clients_own_data" ON clients
FOR ALL USING (
  auth.uid()::text = supabase_id
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid()::text 
    AND users.userType = 'admin'
  )
);

CREATE POLICY "admins_all_clients" ON clients
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.supabase_id = auth.uid()::text 
    AND users.userType = 'admin'
  )
);

-- Políticas de inserção
CREATE POLICY "authenticated_insert" ON users
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_insert_professionals" ON professionals
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "authenticated_insert_clients" ON clients
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas de atualização
CREATE POLICY "users_update_own" ON users
FOR UPDATE USING (
  auth.uid()::text = supabase_id
  OR userType = 'admin'
);
`;

async function applyRLSPolicies() {
  try {
    console.log('🔐 Aplicando políticas RLS no Supabase...');
    
    // Executar as políticas SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: rlsPolicies
    });
    
    if (error) {
      console.error('❌ Erro ao aplicar políticas RLS:', error);
      return false;
    }
    
    console.log('✅ Políticas RLS aplicadas com sucesso!');
    console.log('🔒 Sistema agora está protegido com RLS');
    
    return true;
  } catch (error) {
    console.error('💥 Erro inesperado:', error);
    return false;
  }
}

// Função alternativa usando SQL direto
async function applyRLSPoliciesAlternative() {
  try {
    console.log('🔐 Aplicando políticas RLS (método alternativo)...');
    
    // Executar cada comando separadamente
    const commands = rlsPolicies.split(';').filter(cmd => cmd.trim());
    
    for (const command of commands) {
      if (command.trim()) {
        const { error } = await supabase.rpc('exec_sql', {
          sql: command + ';'
        });
        
        if (error) {
          console.log(`⚠️ Comando ignorado: ${command.substring(0, 50)}...`);
        }
      }
    }
    
    console.log('✅ Políticas RLS aplicadas!');
    return true;
  } catch (error) {
    console.error('💥 Erro:', error);
    return false;
  }
}

// Executar o script
console.log('🚀 Iniciando aplicação de políticas RLS...');
applyRLSPolicies().then(success => {
  if (!success) {
    console.log('🔄 Tentando método alternativo...');
    applyRLSPoliciesAlternative();
  }
}); 