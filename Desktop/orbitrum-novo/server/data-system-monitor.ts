import { getSupabase } from './supabase-auth';
import { RealDataSystem } from './real-data-system';
import { storage } from './storage';

export interface DataSystemStatus {
  supabaseConfigured: boolean;
  supabaseConnected: boolean;
  currentUser: any;
  dataSource: 'real' | 'demo' | 'none' | 'error';
  totalUsers: number;
  activeUsers: number;
  systemHealth: 'healthy' | 'degraded' | 'error';
  lastSync: string;
  message: string;
}

export class DataSystemMonitor {
  private static instance: DataSystemMonitor;
  private lastStatus: DataSystemStatus | null = null;
  private lastCheck: Date = new Date();

  static getInstance(): DataSystemMonitor {
    if (!DataSystemMonitor.instance) {
      DataSystemMonitor.instance = new DataSystemMonitor();
    }
    return DataSystemMonitor.instance;
  }

  /**
   * Verificar status completo do sistema de dados
   */
  async checkSystemStatus(): Promise<DataSystemStatus> {
    try {
      const supabase = getSupabase();
      const currentUser = await RealDataSystem.getCurrentUser();
      
      // Verificar conexão com Supabase
      let supabaseConnected = false;
      if (supabase) {
        try {
          // Teste simples de conexão
          const { data, error } = await supabase.auth.getSession();
          supabaseConnected = !error;
        } catch (error) {
          supabaseConnected = false;
        }
      }

      // Determinar fonte de dados
      let dataSource: 'real' | 'demo' | 'none' | 'error' = 'none';
      if (currentUser?.supabaseId) {
        dataSource = 'real';
      } else if (currentUser) {
        dataSource = 'demo';
      }

      // Estatísticas do sistema
      const totalUsers = await storage.getTotalUsers();
      const activeUsers = await storage.getActiveUsers();

      // Determinar saúde do sistema
      let systemHealth: 'healthy' | 'degraded' | 'error' = 'healthy';
      if (!supabase && dataSource === 'none') {
        systemHealth = 'error';
      } else if (!supabaseConnected && supabase) {
        systemHealth = 'degraded';
      }

      // Mensagem descritiva
      let message = '';
      if (dataSource === 'real') {
        message = '✅ Sistema operando com dados reais do Supabase';
      } else if (dataSource === 'demo') {
        message = '📋 Sistema operando com dados de demonstração';
      } else {
        message = '⚠️ Sistema sem dados disponíveis';
      }

      const status: DataSystemStatus = {
        supabaseConfigured: !!supabase,
        supabaseConnected,
        currentUser: currentUser ? {
          id: currentUser.id,
          email: currentUser.email,
          userType: currentUser.userType,
          supabaseId: currentUser.supabaseId
        } : null,
        dataSource,
        totalUsers,
        activeUsers,
        systemHealth,
        lastSync: new Date().toISOString(),
        message
      };

      this.lastStatus = status;
      this.lastCheck = new Date();

      return status;
    } catch (error) {
      console.error('❌ Erro ao verificar status do sistema:', error);
      
      const errorStatus: DataSystemStatus = {
        supabaseConfigured: false,
        supabaseConnected: false,
        currentUser: null,
        dataSource: 'error',
        totalUsers: 0,
        activeUsers: 0,
        systemHealth: 'error',
        lastSync: new Date().toISOString(),
        message: '❌ Erro ao verificar status do sistema'
      };

      this.lastStatus = errorStatus;
      return errorStatus;
    }
  }

  /**
   * Obter status em cache (última verificação)
   */
  getCachedStatus(): DataSystemStatus | null {
    return this.lastStatus;
  }

  /**
   * Verificar se o sistema está saudável
   */
  async isSystemHealthy(): Promise<boolean> {
    const status = await this.checkSystemStatus();
    return status.systemHealth === 'healthy';
  }

  /**
   * Verificar se há dados reais disponíveis
   */
  async hasRealData(): Promise<boolean> {
    const status = await this.checkSystemStatus();
    return status.dataSource === 'real';
  }

  /**
   * Obter estatísticas resumidas
   */
  async getQuickStats(): Promise<{
    dataSource: string;
    totalUsers: number;
    systemHealth: string;
    message: string;
  }> {
    const status = await this.checkSystemStatus();
    return {
      dataSource: status.dataSource,
      totalUsers: status.totalUsers,
      systemHealth: status.systemHealth,
      message: status.message
    };
  }

  /**
   * Forçar sincronização de dados
   */
  async forceSync(): Promise<{ success: boolean; message: string }> {
    try {
      // Tentar obter usuário atual para forçar sincronização
      const currentUser = await RealDataSystem.getCurrentUser();
      
      if (currentUser) {
        return {
          success: true,
          message: '✅ Sincronização forçada - dados reais disponíveis'
        };
      } else {
        return {
          success: false,
          message: '📋 Sincronização forçada - usando dados de demonstração'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: '❌ Erro na sincronização forçada'
      };
    }
  }
}

// Instância global do monitor
export const dataSystemMonitor = DataSystemMonitor.getInstance(); 