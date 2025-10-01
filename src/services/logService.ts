/**
 * 📊 LOG SERVICE - SISTEMA DE AUDITORIA COMPLETO
 * 
 * Registra TODOS os eventos importantes para:
 * - Compliance médico
 * - Auditoria clínica
 * - Debug e otimização
 * - Análise de performance
 * 
 * 100% INVISÍVEL para o usuário final!
 */

import { supabase } from '../integrations/supabase/client';

export type LogNivel = 'info' | 'warning' | 'error' | 'success';

export interface LogEvento {
  timestamp: string;
  evento: string;
  dados: any;
  nivel: LogNivel;
  user_id?: string;
  session_id?: string;
  categoria?: string;
}

export class LogService {
  private static instance: LogService;
  private localLogs: LogEvento[] = [];
  private maxLocalLogs = 1000; // Limite de logs em memória

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): LogService {
    if (!LogService.instance) {
      LogService.instance = new LogService();
    }
    return LogService.instance;
  }

  /**
   * 📝 Log principal - registra qualquer evento
   */
  async log(
    evento: string,
    dados: any = {},
    nivel: LogNivel = 'info'
  ): Promise<void> {
    const logEntry: LogEvento = {
      timestamp: new Date().toISOString(),
      evento,
      dados,
      nivel,
      user_id: dados.userId || dados.user_id || 'anonimo',
      session_id: dados.sessionId || dados.session_id || 'n/a',
      categoria: dados.categoria || this.detectarCategoria(evento)
    };

    // 1. Console para desenvolvimento (com cores!)
    this.logConsole(logEntry);

    // 2. Memória local (para consultas rápidas)
    this.salvarLocal(logEntry);

    // 3. Supabase (para persistência e auditoria)
    await this.salvarSupabase(logEntry);
  }

  /**
   * 🎯 Logs específicos para blocos IMRE
   */
  async logBlocoImre(dados: {
    bloco: number;
    pergunta: string;
    resposta: string;
    tempo_resposta?: string;
    userId?: string;
    sessionId?: string;
  }): Promise<void> {
    await this.log('bloco_imre_respondido', {
      ...dados,
      categoria: 'avaliacao_clinica'
    }, 'info');
  }

  /**
   * 🏁 Log de conclusão de avaliação
   */
  async logAvaliacaoConcluida(dados: {
    userId: string;
    sessionId: string;
    tempo_total: string;
    blocos_completos: number;
    nft_gerado?: string;
  }): Promise<void> {
    await this.log('avaliacao_concluida', {
      ...dados,
      categoria: 'avaliacao_clinica'
    }, 'success');
  }

  /**
   * 🧠 Log de decisões da IA
   */
  async logDecisaoIA(dados: {
    pergunta: string;
    fonte: 'banco' | 'openai' | 'noagpt';
    confianca: number;
    tempo: number;
    userId?: string;
  }): Promise<void> {
    await this.log('decisao_ia', {
      ...dados,
      categoria: 'ia_aprendizado'
    }, 'info');
  }

  /**
   * ❌ Log de erros
   */
  async logErro(
    contexto: string,
    erro: any,
    dados: any = {}
  ): Promise<void> {
    await this.log(`erro_${contexto}`, {
      mensagem: erro.message || String(erro),
      stack: erro.stack,
      ...dados,
      categoria: 'erro'
    }, 'error');
  }

  /**
   * 🔍 Buscar logs (para dashboard admin)
   */
  async buscarLogs(filtros: {
    limite?: number;
    nivel?: LogNivel;
    categoria?: string;
    userId?: string;
    dataInicio?: Date;
    dataFim?: Date;
  } = {}): Promise<LogEvento[]> {
    try {
      let query = supabase
        .from('logs_sistema')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(filtros.limite || 100);

      if (filtros.nivel) {
        query = query.eq('nivel', filtros.nivel);
      }

      if (filtros.categoria) {
        query = query.eq('categoria', filtros.categoria);
      }

      if (filtros.userId) {
        query = query.eq('user_id', filtros.userId);
      }

      if (filtros.dataInicio) {
        query = query.gte('timestamp', filtros.dataInicio.toISOString());
      }

      if (filtros.dataFim) {
        query = query.lte('timestamp', filtros.dataFim.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('❌ Erro ao buscar logs:', error);
      return this.localLogs.slice(0, filtros.limite || 100);
    }
  }

  /**
   * 📊 Estatísticas de logs (para dashboard)
   */
  async estatisticas(periodo: '24h' | '7d' | '30d' = '24h'): Promise<{
    total: number;
    por_nivel: Record<LogNivel, number>;
    por_categoria: Record<string, number>;
    eventos_criticos: number;
  }> {
    const horasAtras = {
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30
    }[periodo];

    const dataInicio = new Date();
    dataInicio.setHours(dataInicio.getHours() - horasAtras);

    const logs = await this.buscarLogs({ 
      dataInicio, 
      limite: 10000 
    });

    const stats = {
      total: logs.length,
      por_nivel: {
        info: 0,
        warning: 0,
        error: 0,
        success: 0
      } as Record<LogNivel, number>,
      por_categoria: {} as Record<string, number>,
      eventos_criticos: 0
    };

    logs.forEach(log => {
      stats.por_nivel[log.nivel]++;
      
      const cat = log.categoria || 'outros';
      stats.por_categoria[cat] = (stats.por_categoria[cat] || 0) + 1;

      if (log.nivel === 'error') {
        stats.eventos_criticos++;
      }
    });

    return stats;
  }

  /**
   * 🎨 Console colorido para desenvolvimento
   */
  private logConsole(log: LogEvento): void {
    const cores: Record<LogNivel, string> = {
      info: '🔵',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    const emoji = cores[log.nivel] || '📝';
    const timestamp = new Date(log.timestamp).toLocaleTimeString('pt-BR');

    console.log(
      `${emoji} [${timestamp}] ${log.evento.toUpperCase()}`,
      log.dados
    );
  }

  /**
   * 💾 Salvar em memória local (rápido!)
   */
  private salvarLocal(log: LogEvento): void {
    this.localLogs.unshift(log);

    // Limita tamanho da memória
    if (this.localLogs.length > this.maxLocalLogs) {
      this.localLogs = this.localLogs.slice(0, this.maxLocalLogs);
    }
  }

  /**
   * 🗄️ Salvar no Supabase (persistente!)
   */
  private async salvarSupabase(log: LogEvento): Promise<void> {
    try {
      const { error } = await supabase
        .from('logs_sistema')
        .insert({
          timestamp: log.timestamp,
          evento: log.evento,
          dados: log.dados,
          nivel: log.nivel,
          user_id: log.user_id,
          session_id: log.session_id,
          categoria: log.categoria
        });

      if (error) {
        console.warn('⚠️ Erro ao salvar log no Supabase:', error);
        // Não lançar erro - logs não devem quebrar a aplicação
      }
    } catch (error) {
      console.warn('⚠️ Falha ao salvar log:', error);
    }
  }

  /**
   * 🔍 Detectar categoria automaticamente
   */
  private detectarCategoria(evento: string): string {
    if (evento.includes('bloco_imre') || evento.includes('avaliacao')) {
      return 'avaliacao_clinica';
    }
    if (evento.includes('ia') || evento.includes('decisao')) {
      return 'ia_aprendizado';
    }
    if (evento.includes('admin')) {
      return 'administracao';
    }
    if (evento.includes('erro')) {
      return 'erro';
    }
    if (evento.includes('usuario') || evento.includes('perfil')) {
      return 'usuario';
    }
    return 'geral';
  }
}

// Export singleton instance
export const logService = LogService.getInstance();

// Export helper functions
export const log = (evento: string, dados?: any, nivel?: LogNivel) => 
  logService.log(evento, dados, nivel);

export const logBlocoImre = (dados: any) => 
  logService.logBlocoImre(dados);

export const logAvaliacaoConcluida = (dados: any) => 
  logService.logAvaliacaoConcluida(dados);

export const logDecisaoIA = (dados: any) => 
  logService.logDecisaoIA(dados);

export const logErro = (contexto: string, erro: any, dados?: any) => 
  logService.logErro(contexto, erro, dados);

