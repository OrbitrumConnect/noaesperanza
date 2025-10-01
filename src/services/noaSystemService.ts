import { supabase } from '../integrations/supabase/client'

// 🎯 SERVIÇO COMPLETO DE INTEGRAÇÃO COM O SISTEMA NÔA ESPERANZA
// Integra todas as funções SQL do banco unificado

export interface NoaConfig {
  config_key: string
  config_value: string
  description?: string
}

export interface ImreBlock {
  id: number
  block_order: number
  block_name: string
  block_description: string
  block_prompt: string
  block_type: string
  is_active: boolean
}

export interface Prompt {
  id: string
  prompt_text: string
  category: string
  specialty: string
  usage_count: number
  is_active: boolean
}

export interface UserType {
  user_type: 'aluno' | 'profissional' | 'paciente'
  permission_level: number
}

export interface NftReport {
  id: string
  user_id: string
  session_id: string
  report_title: string
  report_content: string
  nft_hash: string
  nft_metadata: any
  status: 'pending' | 'generated' | 'minted'
  created_at: string
}

export interface ConversationFlow {
  id: string
  session_id: string
  step_type: string
  step_data: any
  step_order: number
  created_at: string
}

export class NoaSystemService {
  
  // 🔧 CONFIGURAÇÕES DO SISTEMA
  async getNoaConfig(configKey: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('get_noa_config', { 
        config_key: configKey 
      })
      
      if (error) {
        console.error('❌ Erro ao buscar configuração:', error)
        return null
      }
      
      console.log('✅ Configuração obtida:', configKey, data)
      return data
    } catch (error) {
      console.error('❌ Erro ao buscar configuração:', error)
      return null
    }
  }

  // 📋 BLOCOS IMRE
  async getImreBlock(blockOrder: number): Promise<ImreBlock | null> {
    try {
      const { data, error } = await supabase.rpc('get_imre_block', { 
        block_order: blockOrder 
      })
      
      if (error) {
        console.error('❌ Erro ao buscar bloco IMRE:', error)
        return null
      }
      
      console.log('✅ Bloco IMRE obtido:', blockOrder, data)
      return data
    } catch (error) {
      console.error('❌ Erro ao buscar bloco IMRE:', error)
      return null
    }
  }

  // 🧠 PROMPTS
  async getPrompt(promptId: string): Promise<Prompt | null> {
    try {
      const { data, error } = await supabase.rpc('get_prompt', { 
        prompt_id: promptId 
      })
      
      if (error) {
        console.error('❌ Erro ao buscar prompt:', error)
        return null
      }
      
      console.log('✅ Prompt obtido:', promptId, data)
      return data
    } catch (error) {
      console.error('❌ Erro ao buscar prompt:', error)
      return null
    }
  }

  async getPromptsByCategory(category: string): Promise<Prompt[]> {
    try {
      const { data, error } = await supabase.rpc('get_prompts_by_category', { 
        category_param: category 
      })
      
      if (error) {
        console.error('❌ Erro ao buscar prompts por categoria:', error)
        return []
      }
      
      console.log('✅ Prompts por categoria obtidos:', category, data)
      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar prompts por categoria:', error)
      return []
    }
  }

  // 👤 TIPOS DE USUÁRIO
  async setUserType(userType: 'aluno' | 'profissional' | 'paciente'): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('set_user_type', { 
        user_type: userType 
      })
      
      if (error) {
        console.error('❌ Erro ao definir tipo de usuário:', error)
        return false
      }
      
      console.log('✅ Tipo de usuário definido:', userType, data)
      return true
    } catch (error) {
      console.error('❌ Erro ao definir tipo de usuário:', error)
      return false
    }
  }

  // 👤 PERFIL DO USUÁRIO (Nome e dados)
  async saveUserProfile(name: string, additionalData?: any): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Se não autenticado, salva no localStorage
        localStorage.setItem('noa_user_name', name)
        if (additionalData) {
          localStorage.setItem('noa_user_profile', JSON.stringify(additionalData))
        }
        console.log('✅ Perfil salvo no localStorage:', name)
        return true
      }
      
      // Se autenticado, salva no banco
      const { error } = await supabase
        .from('noa_users')
        .upsert({
          user_id: user.id,
          name: name,
          profile_data: additionalData || {},
          updated_at: new Date().toISOString()
        })
      
      if (error) {
        console.error('❌ Erro ao salvar perfil:', error)
        return false
      }
      
      console.log('✅ Perfil salvo no banco:', name)
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar perfil:', error)
      return false
    }
  }

  async getUserProfile(): Promise<{ name?: string, user_type?: string, permission_level?: number } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Se não autenticado, busca do localStorage
        const name = localStorage.getItem('noa_user_name')
        const profileData = localStorage.getItem('noa_user_profile')
        
        if (name) {
          return {
            name: name
          }
        }
        return null
      }
      
      // Se autenticado, busca do banco
      const { data, error } = await supabase
        .from('noa_users')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      
      if (error) {
        console.error('❌ Erro ao buscar perfil:', error)
        return null
      }
      
      if (data) {
        console.log('✅ Perfil obtido de noa_users:', data)
        
        // Se for admin (permission_level = 5), buscar nome na tabela noa_admins
        let userName = user.email?.split('@')[0] || 'Usuário'
        
        if (data.permission_level === 5) {
          const { data: adminData } = await supabase
            .from('noa_admins')
            .select('admin_name')
            .eq('user_id', user.id)
            .maybeSingle()
          
          if (adminData?.admin_name) {
            userName = adminData.admin_name
            console.log('✅ Nome admin obtido:', userName)
          }
        }
        
        return {
          name: userName,
          user_type: data.user_type,
          permission_level: data.permission_level
        }
      }
      
      return null
    } catch (error) {
      console.error('❌ Erro ao buscar perfil:', error)
      return null
    }
  }

  async getUserType(): Promise<UserType | null> {
    try {
      const { data, error } = await supabase.rpc('get_user_type')
      
      if (error) {
        console.error('❌ Erro ao obter tipo de usuário:', error)
        return null
      }
      
      console.log('✅ Tipo de usuário obtido:', data)
      return data
    } catch (error) {
      console.error('❌ Erro ao obter tipo de usuário:', error)
      return null
    }
  }

  // 🧠 APRENDIZADO DA IA
  async saveAILearning(
    userMessage: string,
    aiResponse: string,
    category: string,
    confidenceScore: number = 0.8,
    keywords: string[] = []
  ): Promise<boolean> {
    try {
      // Extrai a primeira palavra-chave ou usa a categoria
      const keyword = keywords.length > 0 ? keywords[0] : category
      const context = keywords.length > 1 ? keywords.slice(1).join(', ') : category
      
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase.rpc('save_ai_learning', {
        keyword_param: keyword,
        context_param: context,
        user_message_param: userMessage,
        ai_response_param: aiResponse,
        category_param: category,
        confidence_score_param: confidenceScore,
        user_id_param: user?.id || null
      })
      
      if (error) {
        console.error('❌ Erro ao salvar aprendizado da IA:', error)
        return false
      }
      
      console.log('✅ Aprendizado da IA salvo:', data)
      return true
    } catch (error) {
      console.error('❌ Erro ao salvar aprendizado da IA:', error)
      return false
    }
  }

  // 💬 CONVERSAS
  async registerNoaConversation(
    userMessage: string,
    aiResponse: string,
    conversationType: string = 'general',
    userType: string = 'unknown'
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('register_noa_conversation', {
        user_message_param: userMessage,
        ai_response_param: aiResponse,
        conversation_type_param: conversationType,
        user_type_param: userType
      })
      
      if (error) {
        console.error('❌ Erro ao registrar conversa:', error)
        return false
      }
      
      console.log('✅ Conversa registrada:', data)
      return true
    } catch (error) {
      console.error('❌ Erro ao registrar conversa:', error)
      return false
    }
  }

  async registerConversationFlow(
    sessionId: string,
    stepType: string,
    stepData: any,
    stepOrder: number
  ): Promise<boolean> {
    try {
      // Extrai message_content do stepData ou usa string vazia
      const messageContent = typeof stepData === 'string' ? stepData : 
                            stepData?.message || stepData?.content || JSON.stringify(stepData)
      
      // Define sender baseado no tipo de step
      const sender = stepType.includes('noa') || stepType.includes('response') ? 'noa' : 'user'
      
      const { data, error } = await supabase.rpc('register_conversation_flow', {
        session_id_param: sessionId,
        step_number_param: stepOrder,
        step_type_param: stepType,
        message_content_param: messageContent,
        sender_param: sender,
        user_type_param: null
      })
      
      if (error) {
        console.error('❌ Erro ao registrar fluxo da conversa:', error)
        return false
      }
      
      console.log('✅ Fluxo da conversa registrado:', data)
      return true
    } catch (error) {
      console.error('❌ Erro ao registrar fluxo da conversa:', error)
      return false
    }
  }

  // 🪙 SISTEMA NFT
  async createNftReport(
    sessionId: string,
    reportTitle: string,
    reportContent: string,
    nftMetadata: any = {}
  ): Promise<NftReport | null> {
    try {
      const { data, error } = await supabase.rpc('create_nft_report', {
        session_id_param: sessionId,
        report_title_param: reportTitle,
        report_content_param: reportContent,
        nft_metadata_param: nftMetadata
      })
      
      if (error) {
        console.error('❌ Erro ao criar relatório NFT:', error)
        return null
      }
      
      console.log('✅ Relatório NFT criado:', data)
      return data
    } catch (error) {
      console.error('❌ Erro ao criar relatório NFT:', error)
      return null
    }
  }

  async updateNftStatus(
    reportId: string,
    status: 'pending' | 'generated' | 'minted',
    nftHash?: string
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('update_nft_status', {
        report_id_param: reportId,
        status_param: status,
        nft_hash_param: nftHash
      })
      
      if (error) {
        console.error('❌ Erro ao atualizar status NFT:', error)
        return false
      }
      
      console.log('✅ Status NFT atualizado:', data)
      return true
    } catch (error) {
      console.error('❌ Erro ao atualizar status NFT:', error)
      return false
    }
  }

  // 📊 DADOS ANALÍTICOS
  async getConversationStats(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('noa_conversation_stats')
        .select('*')
        .maybeSingle()
      
      if (error) {
        console.error('❌ Erro ao buscar estatísticas:', error)
        return null
      }
      
      console.log('✅ Estatísticas obtidas:', data)
      return data
    } catch (error) {
      console.error('❌ Erro ao buscar estatísticas:', error)
      return null
    }
  }


  async getNftSummary(): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('noa_nft_summary')
        .select('*')
        .maybeSingle()
      
      if (error) {
        console.error('❌ Erro ao buscar resumo NFT:', error)
        return null
      }
      
      console.log('✅ Resumo NFT obtido:', data)
      return data
    } catch (error) {
      console.error('❌ Erro ao buscar resumo NFT:', error)
      return null
    }
  }

  // 🔄 MÉTODOS DE CONVENIÊNCIA
  async initializeUserSession(userType: 'aluno' | 'profissional' | 'paciente'): Promise<boolean> {
    try {
      // Define o tipo de usuário
      const userTypeSet = await this.setUserType(userType)
      
      // Registra o início da sessão
      const sessionId = crypto.randomUUID()
      const flowRegistered = await this.registerConversationFlow(
        sessionId,
        'session_start',
        { user_type: userType, timestamp: new Date().toISOString() },
        0
      )
      
      console.log('✅ Sessão do usuário inicializada:', { userType, sessionId })
      return userTypeSet && flowRegistered
    } catch (error) {
      console.error('❌ Erro ao inicializar sessão do usuário:', error)
      return false
    }
  }

  async completeClinicalEvaluation(
    sessionId: string,
    evaluationData: any
  ): Promise<NftReport | null> {
    try {
      // Cria o relatório NFT
      const nftReport = await this.createNftReport(
        sessionId,
        'Avaliação Clínica Inicial - IMRE',
        JSON.stringify(evaluationData),
        {
          type: 'clinical_evaluation',
          method: 'IMRE',
          blocks_completed: evaluationData.blocks_completed || 28,
          timestamp: new Date().toISOString()
        }
      )
      
      if (nftReport) {
        // Atualiza o status para gerado
        await this.updateNftStatus(nftReport.id, 'generated')
        
        // Registra a conclusão no fluxo
        await this.registerConversationFlow(
          sessionId,
          'evaluation_completed',
          { nft_report_id: nftReport.id, evaluation_data: evaluationData },
          999
        )
      }
      
      console.log('✅ Avaliação clínica concluída:', nftReport)
      return nftReport
    } catch (error) {
      console.error('❌ Erro ao concluir avaliação clínica:', error)
      return null
    }
  }
}

// Instância global do serviço
export const noaSystemService = new NoaSystemService()
