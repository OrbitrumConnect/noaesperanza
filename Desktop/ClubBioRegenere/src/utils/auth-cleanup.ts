/**
 * Utilitários para limpeza do estado de autenticação
 * Resolve problemas de "limbo" onde usuários ficam presos entre login/logout
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Limpa completamente o estado de autenticação
 * Remove todos os tokens e dados relacionados do localStorage/sessionStorage
 */
export const cleanupAuthState = () => {
  console.log('🧹 Limpando estado de autenticação...');
  
  // Lista de chaves comuns do Supabase que precisam ser removidas
  const supabaseKeys = [
    'supabase.auth.token',
    'sb-jpgmzygxmsiscrmpskgf-auth-token',
    'sb-jpgmzygxmsiscrmpskgf-auth-token-code-verifier'
  ];
  
  // Remover chaves específicas do localStorage
  supabaseKeys.forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Remover todas as chaves que começam com 'supabase.auth.' ou 'sb-'
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Limpar também do sessionStorage se existir
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
  
  // Remover dados do usuário armazenados localmente
  localStorage.removeItem('user');
  
  console.log('✅ Estado de autenticação limpo');
};

/**
 * Força logout global e limpa estado
 */
export const forceGlobalSignout = async () => {
  try {
    console.log('🔐 Forçando logout global...');
    
    // Limpar estado primeiro
    cleanupAuthState();
    
    // Tentar logout via Supabase (pode falhar, mas ignoramos o erro)
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.log('⚠️ Logout via Supabase falhou (ignorando):', err);
    }
    
    // Força reload da página para limpar completamente o estado
    window.location.href = '/';
    
  } catch (error) {
    console.error('Erro no logout forçado:', error);
    // Mesmo com erro, limpa o estado e recarrega
    cleanupAuthState();
    window.location.href = '/';
  }
};

/**
 * Prepara estado limpo antes de novo login
 */
export const prepareForLogin = async () => {
  console.log('🚀 Preparando para novo login...');
  
  // Limpar estado existente
  cleanupAuthState();
  
  // Tentar logout silencioso
  try {
    await supabase.auth.signOut({ scope: 'global' });
  } catch (err) {
    // Ignorar erros de logout se já não houver sessão
    console.log('⚠️ Logout preparatório falhou (normal se não havia sessão)');
  }
  
  console.log('✅ Pronto para novo login');
};

/**
 * Verifica se o usuário está em estado de limbo
 * (tem tokens mas estão inválidos)
 */
export const isInAuthLimbo = async (): Promise<boolean> => {
  try {
    // Verificar se há tokens no localStorage
    const hasTokens = Object.keys(localStorage).some(key => 
      key.includes('supabase.auth') || key.includes('sb-')
    );
    
    if (!hasTokens) return false;
    
    // Tentar obter usuário atual
    const { data: { user }, error } = await supabase.auth.getUser();
    
    // Se há tokens mas getUser falha, usuário está em limbo
    if (error && hasTokens) {
      console.log('🚨 Detectado estado de limbo:', error.message);
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.log('Erro ao verificar limbo:', error);
    return true; // Assumir limbo em caso de erro
  }
};

/**
 * Auto-repara estado de limbo se detectado
 */
export const autoRepairAuthLimbo = async () => {
  const inLimbo = await isInAuthLimbo();
  
  if (inLimbo) {
    console.log('🔧 Auto-reparando estado de limbo...');
    await forceGlobalSignout();
    return true; // Indica que foi necessário reparar
  }
  
  return false; // Nenhum reparo necessário
};