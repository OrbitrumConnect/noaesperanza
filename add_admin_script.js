// Script para adicionar usuário como admin
// Execute: node add_admin_script.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function addAdminUser() {
  try {
    console.log('🔍 Verificando usuário iaianoaesperanza@gmail.com...');
    
    // 1. Verificar se o usuário existe
    const { data: user, error: userError } = await supabase.auth.admin.getUserByEmail('iaianoaesperanza@gmail.com');
    
    if (userError) {
      console.error('❌ Erro ao buscar usuário:', userError);
      return;
    }
    
    if (!user.user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log('✅ Usuário encontrado:', user.user.email);
    
    // 2. Atualizar metadata para admin
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.user.id,
      {
        user_metadata: {
          ...user.user.user_metadata,
          role: 'admin'
        }
      }
    );
    
    if (updateError) {
      console.error('❌ Erro ao atualizar usuário:', updateError);
      return;
    }
    
    console.log('✅ Usuário atualizado para admin:', updateData.user.email);
    
    // 3. Criar/atualizar perfil na tabela profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.user.id,
        email: 'iaianoaesperanza@gmail.com',
        full_name: 'IA NOA Esperanza',
        role: 'admin',
        updated_at: new Date().toISOString()
      });
    
    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError);
      return;
    }
    
    console.log('✅ Perfil criado/atualizado com sucesso!');
    console.log('🎉 Usuário iaianoaesperanza@gmail.com agora é ADMIN!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

addAdminUser();
