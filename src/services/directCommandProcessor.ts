// 🎮 SERVIÇO DE PROCESSAMENTO DE COMANDOS DIRETOS
// Executa comandos automaticamente sem necessidade de ativação prévia

import { supabase } from '../integrations/supabase/client'
import { aiSmartLearningService } from './aiSmartLearningService'
import { avaliacaoClinicaService } from './avaliacaoClinicaService'
import { noaSystemService } from './noaSystemService'
import { DirectCommand, UserProfile } from './identityRecognitionService'

export interface CommandResult {
  success: boolean
  message: string
  data?: any
  action?: string
  shouldShowInChat: boolean
  shouldExecuteAction: boolean
}

export class DirectCommandProcessor {
  
  // ⚡ EXECUTAR COMANDO DIRETO
  async executeDirectCommand(command: DirectCommand, user: UserProfile): Promise<CommandResult> {
    console.log('🎮 Executando comando direto:', command.type, 'para usuário:', user.name)

    try {
      switch (command.type) {
        case 'review_imre':
          return await this.reviewImre(command.parameters, user)
        
        case 'show_learnings':
          return await this.showLearnings(command.parameters, user)
        
        case 'continue_session':
          return await this.continueSession(command.parameters, user)
        
        case 'show_logs':
          return await this.showLogs(command.parameters, user)
        
        case 'generate_report':
          return await this.generateReport(command.parameters, user)
        
        default:
          return {
            success: false,
            message: 'Comando não reconhecido. Você pode repetir de outra forma ou escolher uma das opções abaixo.',
            shouldShowInChat: true,
            shouldExecuteAction: false
          }
      }
    } catch (error: any) {
      console.error('❌ Erro ao executar comando direto:', error)
      return {
        success: false,
        message: `Erro ao executar comando: ${error.message}`,
        shouldShowInChat: true,
        shouldExecuteAction: false
      }
    }
  }

  // 🩺 REVISAR IMRE DO PACIENTE
  private async reviewImre(parameters: any, user: UserProfile): Promise<CommandResult> {
    const { patientName } = parameters
    
    if (!patientName) {
      return {
        success: false,
        message: 'Por favor, especifique o nome do paciente. Exemplo: "Quero revisar o IMRE do paciente João Silva"',
        shouldShowInChat: true,
        shouldExecuteAction: false
      }
    }

    try {
      // Buscar avaliações do paciente
      const { data: evaluations, error } = await supabase
        .from('avaliacoes_em_andamento')
        .select('*')
        .ilike('responses->>nome_paciente', `%${patientName}%`)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        throw new Error(error.message)
      }

      if (!evaluations || evaluations.length === 0) {
        return {
          success: true,
          message: `Não encontrei avaliações para o paciente "${patientName}". Quer que eu busque por outro nome ou crie uma nova avaliação?`,
          shouldShowInChat: true,
          shouldExecuteAction: false
        }
      }

      const latestEvaluation = evaluations[0]
      const progress = latestEvaluation.current_block || 0
      const totalBlocks = latestEvaluation.total_blocks || 28

      return {
        success: true,
        message: `📋 **IMRE do Paciente: ${patientName}**

📊 **Progresso:** ${progress}/${totalBlocks} blocos
📅 **Última atualização:** ${new Date(latestEvaluation.updated_at).toLocaleDateString('pt-BR')}
📝 **Status:** ${latestEvaluation.status}

Quer que eu continue a avaliação ou mostre os detalhes de algum bloco específico?`,
        data: latestEvaluation,
        action: 'show_imre_details',
        shouldShowInChat: true,
        shouldExecuteAction: true
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erro ao buscar IMRE do paciente: ${error.message}`,
        shouldShowInChat: true,
        shouldExecuteAction: false
      }
    }
  }

  // 🧠 MOSTRAR APRENDIZADOS SALVOS
  private async showLearnings(parameters: any, user: UserProfile): Promise<CommandResult> {
    const { topic } = parameters
    
    try {
      // Buscar aprendizados relacionados ao tópico
      const aprendizados = await aiSmartLearningService.buscarAprendizadosSimilares(
        topic || 'geral',
        undefined,
        10
      )

      if (!aprendizados || aprendizados.length === 0) {
        return {
          success: true,
          message: `Não encontrei aprendizados específicos sobre "${topic}". Quer que eu busque por outro tópico ou mostre todos os aprendizados disponíveis?`,
          shouldShowInChat: true,
          shouldExecuteAction: false
        }
      }

      const topAprendizados = aprendizados.slice(0, 5)
      const learningList = topAprendizados.map((aprendizado, index) => 
        `${index + 1}. **${aprendizado.keyword}** (${aprendizado.category})
   - Pergunta: ${aprendizado.user_message}
   - Resposta: ${aprendizado.ai_response.substring(0, 100)}...`
      ).join('\n\n')

      return {
        success: true,
        message: `🧠 **Aprendizados sobre "${topic}":**

${learningList}

**Total encontrado:** ${aprendizados.length} aprendizados
**Confiança média:** ${(aprendizados.reduce((acc, a) => acc + a.confidence_score, 0) / aprendizados.length * 100).toFixed(1)}%

Quer que eu mostre mais detalhes de algum aprendizado específico?`,
        data: aprendizados,
        action: 'show_learning_details',
        shouldShowInChat: true,
        shouldExecuteAction: true
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erro ao buscar aprendizados: ${error.message}`,
        shouldShowInChat: true,
        shouldExecuteAction: false
      }
    }
  }

  // 🔄 CONTINUAR SESSÃO ANTERIOR
  private async continueSession(parameters: any, user: UserProfile): Promise<CommandResult> {
    try {
      // Buscar sessões recentes do usuário
      const { data: sessions, error } = await supabase
        .from('noa_conversations')
        .select('session_id, created_at, conversation_type')
        .eq('user_type', user.role)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        throw new Error(error.message)
      }

      if (!sessions || sessions.length === 0) {
        return {
          success: true,
          message: 'Não encontrei sessões anteriores. Vamos começar uma nova conversa!',
          shouldShowInChat: true,
          shouldExecuteAction: false
        }
      }

      const latestSession = sessions[0]
      const sessionDate = new Date(latestSession.created_at).toLocaleDateString('pt-BR')

      return {
        success: true,
        message: `🔄 **Sessão Encontrada!**

📅 **Data:** ${sessionDate}
🎯 **Tipo:** ${latestSession.conversation_type}
🆔 **ID da Sessão:** ${latestSession.session_id}

Quer que eu continue esta sessão ou prefere começar uma nova?`,
        data: latestSession,
        action: 'continue_session',
        shouldShowInChat: true,
        shouldExecuteAction: true
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erro ao buscar sessões: ${error.message}`,
        shouldShowInChat: true,
        shouldExecuteAction: false
      }
    }
  }

  // 📊 MOSTRAR LOGS DA IA
  private async showLogs(parameters: any, user: UserProfile): Promise<CommandResult> {
    const { timeframe } = parameters
    
    try {
      // Buscar logs recentes
      const { data: logs, error } = await supabase
        .from('ai_learning')
        .select('*')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        throw new Error(error.message)
      }

      if (!logs || logs.length === 0) {
        return {
          success: true,
          message: 'Não encontrei logs de atividade nas últimas 24 horas.',
          shouldShowInChat: true,
          shouldExecuteAction: false
        }
      }

      const logSummary = logs.slice(0, 5).map((log, index) => 
        `${index + 1}. **${log.keyword}** (${log.category})
   - Uso: ${log.usage_count}x
   - Confiança: ${(log.confidence_score * 100).toFixed(1)}%`
      ).join('\n\n')

      return {
        success: true,
        message: `📊 **Logs da IA - Últimas 24h:**

${logSummary}

**Total de atividades:** ${logs.length}
**Período:** Últimas 24 horas

Quer que eu mostre mais detalhes ou exporte um relatório completo?`,
        data: logs,
        action: 'show_log_details',
        shouldShowInChat: true,
        shouldExecuteAction: true
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erro ao buscar logs: ${error.message}`,
        shouldShowInChat: true,
        shouldExecuteAction: false
      }
    }
  }

  // 📋 GERAR RELATÓRIO FINAL
  private async generateReport(parameters: any, user: UserProfile): Promise<CommandResult> {
    try {
      // Buscar dados para o relatório
      const { data: conversations, error: convError } = await supabase
        .from('noa_conversations')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      if (convError) {
        throw new Error(convError.message)
      }

      const { data: evaluations, error: evalError } = await supabase
        .from('avaliacoes_em_andamento')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      if (evalError) {
        throw new Error(evalError.message)
      }

      const totalConversations = conversations?.length || 0
      const totalEvaluations = evaluations?.length || 0
      const completedEvaluations = evaluations?.filter(e => e.status === 'concluida').length || 0

      return {
        success: true,
        message: `📋 **Relatório Semanal - Nôa Esperanza**

📊 **ESTATÍSTICAS GERAIS:**
• Total de conversas: ${totalConversations}
• Avaliações iniciadas: ${totalEvaluations}
• Avaliações concluídas: ${completedEvaluations}
• Taxa de conclusão: ${totalEvaluations > 0 ? ((completedEvaluations / totalEvaluations) * 100).toFixed(1) : 0}%

📅 **Período:** Últimos 7 dias
👤 **Gerado por:** ${user.name}
🕒 **Data:** ${new Date().toLocaleDateString('pt-BR')}

Quer que eu exporte este relatório em PDF ou mostre mais detalhes?`,
        data: { conversations, evaluations },
        action: 'export_report',
        shouldShowInChat: true,
        shouldExecuteAction: true
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erro ao gerar relatório: ${error.message}`,
        shouldShowInChat: true,
        shouldExecuteAction: false
      }
    }
  }
}

// Instância global do processador
export const directCommandProcessor = new DirectCommandProcessor()
