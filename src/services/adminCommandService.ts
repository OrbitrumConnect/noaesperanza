import { supabase } from '../integrations/supabase/client'

// 👑 SERVIÇO DE COMANDOS ADMINISTRATIVOS
// Sistema de controle da plataforma por voz/texto no chat

export interface AdminCommand {
  type: 'get_stats' | 'edit_imre_block' | 'list_users' | 'add_user' | 'train_ia' | 'get_config' | 'unknown'
  parameters: any
  rawCommand: string
}

export interface AdminResponse {
  success: boolean
  message: string
  data?: any
  error?: string
  actionLogId?: string
  executedBy?: string
}

export class AdminCommandService {
  private adminKey: string | null = null
  private isAdminMode: boolean = false

  // 🔐 ATIVAR MODO ADMIN
  async activateAdminMode(password: string): Promise<boolean> {
    try {
      const normalizedPassword = password.toLowerCase().trim()
      
      // Valida credenciais (aceita frases parciais)
      const isPedro = normalizedPassword.includes('admin pedro') || 
                      normalizedPassword.includes('pedro admin') ||
                      normalizedPassword.includes('modo admin pedro')
      
      const isRicardo = normalizedPassword.includes('admin ricardo') || 
                       normalizedPassword.includes('ricardo admin') ||
                       normalizedPassword.includes('modo admin ricardo')
      
      if (isPedro || isRicardo) {
        // Define chave baseado no nome
        if (isPedro) {
          this.adminKey = 'admin_pedro_valenca_2025'
          console.log('🔑 Tentando autenticar Pedro...')
        } else if (isRicardo) {
          this.adminKey = 'admin_ricardo_valenca_2025'
          console.log('🔑 Tentando autenticar Ricardo...')
        }
        
        // Valida no banco
        const { data, error } = await supabase.rpc('validate_admin_access', {
          admin_key_param: this.adminKey
        })
        
        if (error) {
          console.error('❌ Erro ao validar admin:', error)
          return false
        }
        
        if (!data) {
          console.error('❌ Admin key não encontrada no banco')
          return false
        }
        
        this.isAdminMode = true
        console.log('✅ Modo admin ativado com sucesso!')
        return true
      }
      
      console.log('❌ Comando admin não reconhecido:', normalizedPassword)
      return false
    } catch (error) {
      console.error('❌ Erro ao ativar modo admin:', error)
      return false
    }
  }

  // 🔍 DETECTAR COMANDO ADMIN
  detectAdminCommand(message: string): AdminCommand {
    const lower = message.toLowerCase()

    // VER ESTATÍSTICAS
    if (lower.includes('estatística') || lower.includes('estatistica') || 
        lower.includes('ver stats') || lower.includes('mostrar kpis') ||
        lower.includes('análise') || lower.includes('analise')) {
      return {
        type: 'get_stats',
        parameters: {},
        rawCommand: message
      }
    }

    // EDITAR BLOCO IMRE
    if (lower.includes('editar bloco')) {
      const match = message.match(/bloco\s+(\d+)/i)
      const blockNumber = match ? parseInt(match[1]) : null
      
      return {
        type: 'edit_imre_block',
        parameters: { blockNumber },
        rawCommand: message
      }
    }

    // LISTAR USUÁRIOS
    if (lower.includes('listar usuário') || lower.includes('listar usuario') ||
        lower.includes('ver usuários') || lower.includes('ver usuarios') ||
        lower.includes('mostrar usuários')) {
      return {
        type: 'list_users',
        parameters: {},
        rawCommand: message
      }
    }

    // ADICIONAR USUÁRIO
    if (lower.includes('adicionar usuário') || lower.includes('adicionar usuario') ||
        lower.includes('criar usuário') || lower.includes('criar usuario')) {
      // Extrai nome do usuário
      const match = message.match(/usuário\s+([A-Za-zÀ-ú\s]+)(?:\s+como)?/i)
      const userName = match ? match[1].trim() : null
      
      // Extrai tipo
      let userType = 'paciente'
      if (lower.includes('profissional')) userType = 'profissional'
      if (lower.includes('aluno')) userType = 'aluno'
      
      return {
        type: 'add_user',
        parameters: { userName, userType },
        rawCommand: message
      }
    }

    // TREINAR IA
    if (lower.includes('treinar ia') || lower.includes('treinar inteligência') ||
        lower.includes('aprender') || lower.includes('processar dados')) {
      return {
        type: 'train_ia',
        parameters: {},
        rawCommand: message
      }
    }

    return {
      type: 'unknown',
      parameters: {},
      rawCommand: message
    }
  }

  // ⚡ EXECUTAR COMANDO
  async executeCommand(command: AdminCommand): Promise<AdminResponse> {
    if (!this.isAdminMode || !this.adminKey) {
      return {
        success: false,
        message: '🔒 Modo admin não ativado. Diga: "admin pedro valenca" para ativar.',
        error: 'Not in admin mode'
      }
    }

    try {
      const { data, error } = await supabase.rpc('execute_admin_command', {
        admin_key_param: this.adminKey,
        command_text_param: command.rawCommand,
        command_type_param: command.type,
        parameters_param: command.parameters
      })

      if (error) {
        return {
          success: false,
          message: `❌ Erro ao executar comando: ${error.message}`,
          error: error.message
        }
      }

      return {
        success: data.success,
        message: this.formatResponse(command.type, data.data),
        data: data.data,
        actionLogId: data.action_log_id,
        executedBy: data.executed_by
      }
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Erro: ${error.message}`,
        error: error.message
      }
    }
  }

  // 📝 FORMATAR RESPOSTA
  private formatResponse(commandType: string, data: any): string {
    switch (commandType) {
      case 'get_stats':
        return `📊 **ESTATÍSTICAS DA PLATAFORMA**

🏥 **CLÍNICO:**
• Avaliações: ${data.clinical?.total_avaliacoes || 0}
• Completas: ${data.clinical?.avaliacoes_completas || 0}
• Taxa: ${data.clinical?.taxa_conclusao || 0}%

📈 **ADMINISTRATIVO:**
• Usuários: ${data.administrative?.total_usuarios || 0}
• Pacientes: ${data.administrative?.pacientes_count || 0}
• Conversas: ${data.administrative?.total_conversas || 0}

🧠 **SIMBÓLICO (IA):**
• Aprendizados: ${data.symbolic?.total_aprendizados || 0}
• Confidence: ${data.symbolic?.confidence_score_medio || 0}
• Keywords: ${data.symbolic?.keywords_extraidas || 0}`

      case 'edit_imre_block':
        return `✅ **BLOCO ${data.block_order} ATUALIZADO!**

Novo texto: "${data.new_text}"

Salvo no banco de dados.
Próximas avaliações usarão este texto.`

      case 'list_users':
        const users = data || []
        return `👥 **USUÁRIOS DA PLATAFORMA** (${users.length})

${users.slice(0, 10).map((u: any, i: number) => 
  `${i + 1}. ${u.name || 'Sem nome'} (${u.user_type || 'indefinido'})`
).join('\n')}

${users.length > 10 ? `\n... e mais ${users.length - 10} usuários` : ''}`

      default:
        return `✅ Comando executado com sucesso!`
    }
  }

  // ❓ É ADMIN?
  isAdmin(): boolean {
    return this.isAdminMode
  }

  // 🚪 DESATIVAR MODO ADMIN
  deactivateAdminMode(): void {
    this.isAdminMode = false
    this.adminKey = null
    console.log('🚪 Modo admin desativado')
  }
}

// Instância global
export const adminCommandService = new AdminCommandService()
