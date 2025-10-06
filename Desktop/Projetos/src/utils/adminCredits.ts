// 🎯 Sistema de Créditos para Admin
// Para dar créditos iniciais ao admin para testar o PvP

import { updateUserCredits } from './creditsUnified';
import { PLAN_CONFIGS } from './creditsSystem';

// 👑 CONFIGURAÇÃO DE CRÉDITOS PARA ADMIN
export const ADMIN_CREDITS_CONFIG = {
  planType: 'premium' as const,
  initialDeposit: 5.00, // R$ 5,00
  creditsBalance: 1000, // 1000 créditos para testar
  creditsInitial: 1000,
  pvpEarnings: 0,
  trainingEarnings: 0,
  labyrinthEarnings: 0,
  totalEarned: 0
};

// 🎯 FUNÇÃO: Dar créditos iniciais ao admin
export const giveAdminCredits = async (adminUserId: string) => {
  try {
    console.log('👑 Configurando créditos para admin:', adminUserId);
    
    const adminCredits = {
      userId: adminUserId,
      planType: ADMIN_CREDITS_CONFIG.planType,
      initialDeposit: ADMIN_CREDITS_CONFIG.initialDeposit,
      creditsBalance: ADMIN_CREDITS_CONFIG.creditsBalance,
      creditsInitial: ADMIN_CREDITS_CONFIG.creditsInitial,
      pvpEarnings: ADMIN_CREDITS_CONFIG.pvpEarnings,
      trainingEarnings: ADMIN_CREDITS_CONFIG.trainingEarnings,
      labyrinthEarnings: ADMIN_CREDITS_CONFIG.labyrinthEarnings,
      totalEarned: ADMIN_CREDITS_CONFIG.totalEarned,
      lastUpdated: new Date().toISOString()
    };

    await updateUserCredits(adminUserId, adminCredits);
    
    console.log('✅ Créditos do admin configurados:', adminCredits);
    return adminCredits;
    
  } catch (error) {
    console.error('❌ Erro ao configurar créditos do admin:', error);
    throw error;
  }
};

// 🎯 FUNÇÃO: Verificar se admin tem créditos suficientes
export const checkAdminCredits = async (adminUserId: string) => {
  try {
    const { getUserCredits } = await import('./creditsUnified');
    const credits = await getUserCredits(adminUserId);
    
    console.log('👑 Créditos atuais do admin:', credits);
    
    if (credits.creditsBalance < 100) {
      console.log('⚠️ Admin com poucos créditos, configurando...');
      await giveAdminCredits(adminUserId);
    }
    
    return credits;
    
  } catch (error) {
    console.error('❌ Erro ao verificar créditos do admin:', error);
    throw error;
  }
};
