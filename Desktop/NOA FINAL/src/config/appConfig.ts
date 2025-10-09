// Configurações da aplicação MedCanLab
// Sem dependências de dados externos ou caminhos do sistema

export const APP_CONFIG = {
  // Informações da aplicação
  app: {
    name: 'MedCanLab @ Power By Nôa Esperanza',
    version: '3.0.0',
    description: 'Assistente Médica Inteligente',
    doctor: 'Dr. Ricardo Valença',
    specialties: ['Neurologia', 'Cannabis Medicinal', 'Nefrologia']
  },

  // Configurações de voz (dados internos)
  voice: {
    defaultVoice: 'Microsoft Maria - Portuguese (Brazil)',
    language: 'pt-BR',
    rate: 0.85,
    pitch: 1.3,
    volume: 0.8
  },

  // Configurações de avaliação clínica (dados internos)
  evaluation: {
    stages: [
      'abertura',
      'cannabis_medicinal', 
      'lista_indiciaria',
      'queixa_principal',
      'desenvolvimento_localizacao',
      'desenvolvimento_inicio',
      'desenvolvimento_qualidade',
      'desenvolvimento_sintomas',
      'desenvolvimento_melhora',
      'desenvolvimento_piora',
      'historia_patologica',
      'historia_familiar_mae',
      'historia_familiar_pai',
      'habitos_vida',
      'alergias',
      'medicacoes_continuas',
      'medicacoes_eventuais',
      'fechamento'
    ],
    totalStages: 18
  },

  // Configurações de segurança (sem dependências externas)
  security: {
    requiresHTTPS: true,
    allowHTTPInDevelopment: false,
    timeout: 30000,
    retryAttempts: 3
  },

  // Configurações de UI (dados internos)
  ui: {
    chat: {
      maxMessages: 100,
      autoScroll: true,
      typingDelay: 1000
    },
    voice: {
      autoActivate: true,
      preventEcho: true,
      typingDelay: 1000
    }
  },

  // Configurações de dados (apenas internos)
  data: {
    storage: {
      userMemory: 'noa_user_memory',
      sessionId: 'noa_session_id',
      evaluationData: 'noa_evaluation_data'
    },
    supabase: {
      // Configurações do Supabase (sem caminhos externos)
      tables: {
        users: 'users',
        conversations: 'noa_conversations',
        evaluations: 'avaliacoes_iniciais',
        aiLearning: 'ai_learning_data'
      }
    }
  }
}

// Função para obter configuração específica
export const getConfig = (path: string) => {
  const keys = path.split('.')
  let current: any = APP_CONFIG
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key]
    } else {
      return undefined
    }
  }
  
  return current
}

// Função para verificar se está em produção
export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production'
}

// Função para obter URL base (sem dependências de host)
export const getBaseURL = (): string => {
  if (isProduction()) {
    return 'https://noaesperanza.vercel.app'
  }
  return window.location.origin
}
