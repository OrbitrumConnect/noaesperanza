// 🎯 Setup Admin - Configurar créditos do admin
// Execute esta função no console do navegador para configurar créditos do admin

import { giveAdminCredits, checkAdminCredits } from './adminCredits';
import supabase from '@/lib/supabase';

// 🎯 FUNÇÃO: Setup completo do admin
export const setupAdmin = async () => {
  try {
    console.log('👑 Iniciando setup do admin...');
    
    // 1. Obter usuário atual
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('❌ Erro ao obter usuário:', userError);
      return;
    }
    
    console.log('👤 Usuário atual:', user.email);
    
    // 2. Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileError) {
      console.error('❌ Erro ao obter perfil:', profileError);
      return;
    }
    
    console.log('👤 Perfil atual:', profile);
    
    // 3. Configurar créditos
    await giveAdminCredits(user.id);
    
    // 4. Atualizar perfil para 'paid'
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ user_type: 'paid' })
      .eq('id', user.id);
    
    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError);
      return;
    }
    
    console.log('✅ Admin configurado com sucesso!');
    console.log('💰 Créditos: 1000');
    console.log('👑 Status: paid');
    console.log('🎮 PvP: liberado');
    
    // 5. Recarregar página para aplicar mudanças
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erro no setup do admin:', error);
  }
};

// 🎯 FUNÇÃO: Verificar status do admin
export const checkAdminStatus = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('❌ Nenhum usuário logado');
      return;
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    const { data: wallet } = await supabase
      .from('user_wallet')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    console.log('👑 Status do Admin:');
    console.log('📧 Email:', user.email);
    console.log('👤 Tipo:', profile?.user_type || 'não definido');
    console.log('💰 Créditos:', wallet?.credits_balance || 0);
    console.log('🎮 PvP:', profile?.user_type === 'paid' ? 'Liberado' : 'Bloqueado');
    
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error);
  }
};

// 🎯 EXPORTAR PARA CONSOLE
if (typeof window !== 'undefined') {
  (window as any).setupAdmin = setupAdmin;
  (window as any).checkAdminStatus = checkAdminStatus;
  
  console.log('🎯 Funções disponíveis no console:');
  console.log('setupAdmin() - Configurar créditos do admin');
  console.log('checkAdminStatus() - Verificar status do admin');
}
