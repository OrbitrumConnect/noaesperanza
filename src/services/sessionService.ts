/**
 * 🔄 SESSION SERVICE - RETOMADA DE SESSÃO
 * 
 * Permite que o paciente continue a avaliação clínica de onde parou.
 * 
 * Funcionalidades:
 * - Salva progresso automaticamente a cada bloco
 * - Detecta sessões incompletas ao fazer login
 * - Pergunta se deseja continuar
 * - Restaura estado completo da avaliação
 * 
 * 100% INVISÍVEL até aparecer a mensagem de retomada!
 */

import { supabase } from '../integrations/supabase/client';
import { logService } from './logService';

export interface SessionData {
  session_id: string;
  user_id: string;
  etapa_atual: number;
  total_blocos: number;
  respostas: any[];
  variaveis_capturadas: Record<string, any>;
  iniciado_em: string;
  atualizado_em: string;
  tipo: 'avaliacao_clinica' | 'curso' | 'consulta';
  status: 'em_andamento' | 'pausada' | 'concluida' | 'abandonada';
}

export class SessionService {
  private static instance: SessionService;

  private constructor() {
    // Singleton pattern
  }

  static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  /**
   * 💾 SALVAR PROGRESSO (automático a cada bloco)
   */
  async salvarProgresso(dados: {
    sessionId: string;
    userId: string;
    etapaAtual: number;
    totalBlocos: number;
    respostas: any[];
    variaveisCapturadas: Record<string, any>;
    tipo?: string;
  }): Promise<void> {
    try {
      const sessionData = {
        session_id: dados.sessionId,
        user_id: dados.userId,
        etapa_atual: dados.etapaAtual,
        total_blocos: dados.totalBlocos,
        respostas: dados.respostas,
        variaveis_capturadas: dados.variaveisCapturadas,
        atualizado_em: new Date().toISOString(),
        tipo: dados.tipo || 'avaliacao_clinica',
        status: 'em_andamento'
      };

      // Upsert: atualiza se existe, cria se não existe
      const { error } = await supabase
        .from('sessoes_em_andamento')
        .upsert(sessionData, {
          onConflict: 'session_id'
        });

      if (error) throw error;

      // Log silencioso
      await logService.log('sessao_salva', {
        sessionId: dados.sessionId,
        etapa: dados.etapaAtual,
        total: dados.totalBlocos,
        userId: dados.userId
      }, 'info');

      console.log('💾 Progresso salvo:', {
        etapa: dados.etapaAtual,
        total: dados.totalBlocos
      });

    } catch (error) {
      console.error('❌ Erro ao salvar progresso:', error);
      await logService.logErro('salvar_sessao', error, {
        sessionId: dados.sessionId
      });
    }
  }

  /**
   * 🔍 BUSCAR SESSÃO INCOMPLETA
   */
  async buscarSessaoIncompleta(userId: string): Promise<SessionData | null> {
    try {
      const { data, error } = await supabase
        .from('sessoes_em_andamento')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'em_andamento')
        .order('atualizado_em', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        await logService.log('sessao_encontrada', {
          sessionId: data.session_id,
          etapa: data.etapa_atual,
          userId
        }, 'info');
      }

      return data as SessionData | null;

    } catch (error) {
      console.error('❌ Erro ao buscar sessão:', error);
      await logService.logErro('buscar_sessao', error, { userId });
      return null;
    }
  }

  /**
   * 📋 GERAR MENSAGEM DE RETOMADA
   */
  gerarMensagemRetomada(sessao: SessionData): {
    texto: string;
    botoes: string[];
    dados: SessionData;
  } {
    const progresso = Math.round((sessao.etapa_atual / sessao.total_blocos) * 100);
    const tempo = this.calcularTempoDecorrido(sessao.atualizado_em);

    const texto = `🔄 **Você tem uma avaliação em andamento!**

📊 **Progresso:** ${sessao.etapa_atual}/${sessao.total_blocos} blocos (${progresso}%)
⏰ **Última atualização:** ${tempo}
🎯 **Tipo:** ${this.getTipoDescricao(sessao.tipo)}

Deseja continuar de onde parou?`;

    return {
      texto,
      botoes: ['✅ Continuar', '🔄 Começar de Novo', '❌ Cancelar'],
      dados: sessao
    };
  }

  /**
   * ♻️ RETOMAR SESSÃO
   */
  async retomarSessao(sessionId: string): Promise<SessionData | null> {
    try {
      const { data, error } = await supabase
        .from('sessoes_em_andamento')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (error) throw error;

      await logService.log('sessao_retomada', {
        sessionId,
        etapa: data.etapa_atual
      }, 'success');

      console.log('♻️ Sessão retomada:', {
        sessionId,
        etapa: data.etapa_atual,
        total: data.total_blocos
      });

      return data as SessionData;

    } catch (error) {
      console.error('❌ Erro ao retomar sessão:', error);
      await logService.logErro('retomar_sessao', error, { sessionId });
      return null;
    }
  }

  /**
   * 🗑️ DESCARTAR SESSÃO (começar de novo)
   */
  async descartarSessao(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sessoes_em_andamento')
        .update({
          status: 'abandonada',
          atualizado_em: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (error) throw error;

      await logService.log('sessao_abandonada', {
        sessionId
      }, 'warning');

      console.log('🗑️ Sessão descartada:', sessionId);

    } catch (error) {
      console.error('❌ Erro ao descartar sessão:', error);
      await logService.logErro('descartar_sessao', error, { sessionId });
    }
  }

  /**
   * ✅ MARCAR SESSÃO COMO CONCLUÍDA
   */
  async concluirSessao(sessionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sessoes_em_andamento')
        .update({
          status: 'concluida',
          atualizado_em: new Date().toISOString()
        })
        .eq('session_id', sessionId);

      if (error) throw error;

      await logService.log('sessao_concluida', {
        sessionId
      }, 'success');

      console.log('✅ Sessão concluída:', sessionId);

    } catch (error) {
      console.error('❌ Erro ao concluir sessão:', error);
      await logService.logErro('concluir_sessao', error, { sessionId });
    }
  }

  /**
   * 📊 LISTAR SESSÕES DO USUÁRIO
   */
  async listarSessoes(userId: string, limite: number = 10): Promise<SessionData[]> {
    try {
      const { data, error } = await supabase
        .from('sessoes_em_andamento')
        .select('*')
        .eq('user_id', userId)
        .order('atualizado_em', { ascending: false })
        .limit(limite);

      if (error) throw error;

      return (data as SessionData[]) || [];

    } catch (error) {
      console.error('❌ Erro ao listar sessões:', error);
      await logService.logErro('listar_sessoes', error, { userId });
      return [];
    }
  }

  /**
   * 🧹 LIMPAR SESSÕES ANTIGAS (mais de 30 dias)
   */
  async limparSessoesAntigas(): Promise<number> {
    try {
      const dataLimite = new Date();
      dataLimite.setDate(dataLimite.getDate() - 30);

      const { data, error } = await supabase
        .from('sessoes_em_andamento')
        .delete()
        .lt('atualizado_em', dataLimite.toISOString())
        .select();

      if (error) throw error;

      const quantidade = data?.length || 0;

      await logService.log('sessoes_limpas', {
        quantidade,
        dataLimite: dataLimite.toISOString()
      }, 'info');

      console.log(`🧹 ${quantidade} sessões antigas limpas`);

      return quantidade;

    } catch (error) {
      console.error('❌ Erro ao limpar sessões:', error);
      await logService.logErro('limpar_sessoes', error);
      return 0;
    }
  }

  /**
   * ⏰ CALCULAR TEMPO DECORRIDO
   */
  private calcularTempoDecorrido(timestamp: string): string {
    const agora = new Date();
    const anterior = new Date(timestamp);
    const diff = agora.getTime() - anterior.getTime();

    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (dias > 0) return `há ${dias} dia${dias > 1 ? 's' : ''}`;
    if (horas > 0) return `há ${horas} hora${horas > 1 ? 's' : ''}`;
    if (minutos > 0) return `há ${minutos} minuto${minutos > 1 ? 's' : ''}`;
    return 'agora mesmo';
  }

  /**
   * 📝 DESCRIÇÃO DO TIPO DE SESSÃO
   */
  private getTipoDescricao(tipo: string): string {
    const tipos: Record<string, string> = {
      'avaliacao_clinica': 'Avaliação Clínica Inicial (28 blocos IMRE)',
      'curso': 'Curso Arte da Entrevista Clínica',
      'consulta': 'Consulta com Dr. Ricardo'
    };
    return tipos[tipo] || tipo;
  }
}

// Export singleton instance
export const sessionService = SessionService.getInstance();

// Export helper functions
export const salvarProgresso = (dados: any) => 
  sessionService.salvarProgresso(dados);

export const buscarSessaoIncompleta = (userId: string) => 
  sessionService.buscarSessaoIncompleta(userId);

export const retomarSessao = (sessionId: string) => 
  sessionService.retomarSessao(sessionId);

export const descartarSessao = (sessionId: string) => 
  sessionService.descartarSessao(sessionId);

export const concluirSessao = (sessionId: string) => 
  sessionService.concluirSessao(sessionId);

