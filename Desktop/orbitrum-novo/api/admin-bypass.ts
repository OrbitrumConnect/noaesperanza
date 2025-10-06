// Sistema de Bypass Administrativo - IDÊNTICO AO REPLIT
// Arquivo: server/admin-bypass.ts

interface User {
  email?: string;
  id?: string;
  userType?: string;
}

// Função de verificação admin - IDÊNTICA AO REPLIT
export function isAdminMaster(user: User): boolean {
  return user?.email === 'passossmir4@gmail.com' || 
         user?.email === 'passosmir4@gmail.com';
}

// Bypass de funcionalidades - IDÊNTICO AO REPLIT
export function adminBypass(user: User) {
  if (!isAdminMaster(user)) return null;
  
  return {
    canPlay: true,
    unlimitedGames: true,
    canPurchase: true,
    bypassDocumentVerification: true,
    canUseTeams: true,
    unlimitedSearches: true,
    isAdminMode: true,
    adminLevel: 'master'
  };
}

// Chave de emergência - IDÊNTICA AO REPLIT
export const ADMIN_EMERGENCY_KEY = 'orbitrum2025admin';

// Verificação de chave admin
export function verifyAdminKey(adminKey: string): boolean {
  return adminKey === ADMIN_EMERGENCY_KEY;
}

// Função para verificar se usuário tem acesso admin
export function hasAdminAccess(user: User): boolean {
  return isAdminMaster(user);
}

// Função para obter nível de admin
export function getAdminLevel(user: User): 'master' | 'none' {
  return isAdminMaster(user) ? 'master' : 'none';
}