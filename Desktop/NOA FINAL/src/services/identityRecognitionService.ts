// 🧠 SERVIÇO DE RECONHECIMENTO DE IDENTIDADE PERSONALIZADO
// Sistema inteligente para reconhecer usuários e ativar modos personalizados

import { supabase } from '../integrations/supabase/client'

export interface UserProfile {
  id: string
  name: string
  email: string
  role: 'admin' | 'clinico' | 'autor' | 'profissional' | 'paciente'
  accessLevel: number // 1-5
  personalizedGreeting: string
  voiceSettings: {
    voice: string
    rate: number
    pitch: number
    volume: number
  }
  permissions: string[]
  isActive: boolean
}

export interface IdentityResult {
  recognized: boolean
  user?: UserProfile
  confidence: number
  greeting: string
  shouldActivateAdminMode: boolean
  availableCommands: string[]
}

export interface DirectCommand {
  type: 'review_imre' | 'show_learnings' | 'continue_session' | 'show_logs' | 'generate_report' | 'unknown'
  parameters: any
  rawCommand: string
  confidence: number
}

export class IdentityRecognitionService {
  private recognizedUsers: Map<string, UserProfile> = new Map()
  private currentUser: UserProfile | null = null

  // 🎯 DETECTAR IDENTIDADE NA MENSAGEM
  async detectIdentity(message: string): Promise<IdentityResult> {
    const lowerMessage = message.toLowerCase().trim()
    
    // Padrões de reconhecimento para Pedro
    const pedroPatterns = [
      /olá,?\s*nôa[.,]?\s*pedro\s*passos/i,
      /nôa,?\s*estou\s*aqui[.,]?\s*pedro/i,
      /oi\s*nôa[.,]?\s*pedro\s*aqui/i,
      /pedro\s*passos[.,]?\s*aqui/i,
      /olá\s*pedro\s*passos/i
    ]

    // Padrões de reconhecimento para Ricardo
    const ricardoPatterns = [
      /olá,?\s*nôa[.,]?\s*ricardo\s*valença/i,
      /nôa,?\s*estou\s*aqui[.,]?\s*ricardo/i,
      /oi\s*nôa[.,]?\s*ricardo\s*aqui/i,
      /ricardo\s*valença[.,]?\s*aqui/i,
      /dr\.?\s*ricardo\s*valença/i,
      /olá\s*ricardo\s*valença/i
    ]

    // Padrões de reconhecimento para Eduardo Faveret
    const eduardoPatterns = [
      /olá,?\s*nôa[.,]?\s*eduardo\s*faveret,?\s*aqui/i,
      /oi\s*nôa[.,]?\s*eduardo\s*faveret/i,
      /olá,?\s*nôa\.?\s*eduardo\s*faveret,?\s*aqui/i,
      /dr\.?\s*eduardo\s*faveret/i,
      /eduardo\s*faveret[.,]?\s*aqui/i,
      /eduardo\s*de\s*sá\s*campello\s*faveret/i,
      /dr\.?\s*eduardo\s*de\s*sá\s*campello\s*faveret/i
    ]

    // Verificar Pedro
    for (const pattern of pedroPatterns) {
      if (pattern.test(message)) {
        const user = await this.getUserProfile('phpg69@gmail.com')
        if (user) {
          return {
            recognized: true,
            user,
            confidence: 0.95,
            greeting: "Olá, Pedro! Que bom ter você aqui. Como posso ajudar hoje?",
            shouldActivateAdminMode: true,
            availableCommands: this.getAvailableCommands(user.role)
          }
        }
      }
    }

    // Verificar Ricardo
    for (const pattern of ricardoPatterns) {
      if (pattern.test(message)) {
        const user = await this.getUserProfile('iaianoaesperanza@gmail.com')
        if (user) {
          return {
            recognized: true,
            user,
            confidence: 0.98,
            greeting: "Olá, Dr. Ricardo! Que bom ter você aqui. Como posso ajudar hoje?",
            shouldActivateAdminMode: true,
            availableCommands: this.getAvailableCommands(user.role)
          }
        }
      }
    }

    // Verificar Eduardo Faveret
    for (const pattern of eduardoPatterns) {
      if (pattern.test(message)) {
        // Tentar primeiro o email original, depois o novo
        let user = await this.getUserProfile('eduardo.faveret@noaesperanza.app')
        if (!user) {
          user = await this.getUserProfile('eduardoscfaveret@gmail.com')
        }
        if (user) {
          return {
            recognized: true,
            user: { ...user, name: 'Dr. Eduardo de Sá Campello Faveret' },
            confidence: 0.97,
            greeting: "Olá, Dr. Eduardo! Acesso administrativo liberado. Como deseja prosseguir?",
            shouldActivateAdminMode: true,
            availableCommands: this.getAvailableCommands('admin')
          }
        }
      }
    }

    // Fallback - não reconhecido
    return {
      recognized: false,
      confidence: 0,
      greeting: "Olá! Como posso ajudar hoje?",
      shouldActivateAdminMode: false,
      availableCommands: []
    }
  }

  // 🎮 DETECTAR COMANDOS DIRETOS
  async detectDirectCommand(message: string, user?: UserProfile): Promise<DirectCommand> {
    const lowerMessage = message.toLowerCase().trim()
    
    // Comandos para revisar IMRE
    if (lowerMessage.includes('revisar imre') || lowerMessage.includes('ver imre') || 
        lowerMessage.includes('imre do paciente')) {
      const patientMatch = message.match(/paciente\s+([A-Za-zÀ-ú\s]+)/i)
      return {
        type: 'review_imre',
        parameters: { patientName: patientMatch ? patientMatch[1].trim() : null },
        rawCommand: message,
        confidence: 0.9
      }
    }

    // Comandos para mostrar aprendizados
    if (lowerMessage.includes('mostrar aprendizados') || lowerMessage.includes('mostre aprendizados') ||
        lowerMessage.includes('aprendizados salvos') || lowerMessage.includes('buscar sobre')) {
      const topicMatch = message.match(/sobre\s+([A-Za-zÀ-ú\s]+)/i)
      return {
        type: 'show_learnings',
        parameters: { topic: topicMatch ? topicMatch[1].trim() : 'geral' },
        rawCommand: message,
        confidence: 0.9
      }
    }

    // Comandos para continuar sessão
    if (lowerMessage.includes('continuar sessão') || lowerMessage.includes('retomar sessão') ||
        lowerMessage.includes('sessão de ontem') || lowerMessage.includes('continuar de onde')) {
      return {
        type: 'continue_session',
        parameters: {},
        rawCommand: message,
        confidence: 0.85
      }
    }

    // Comandos para mostrar logs
    if (lowerMessage.includes('mostrar logs') || lowerMessage.includes('mostre logs') ||
        lowerMessage.includes('logs da ia') || lowerMessage.includes('últimas 24h')) {
      return {
        type: 'show_logs',
        parameters: { timeframe: '24h' },
        rawCommand: message,
        confidence: 0.9
      }
    }

    // Comandos para gerar relatório
    if (lowerMessage.includes('gerar relatório') || lowerMessage.includes('relatório final') ||
        lowerMessage.includes('relatório da consulta')) {
      return {
        type: 'generate_report',
        parameters: {},
        rawCommand: message,
        confidence: 0.9
      }
    }

    return {
      type: 'unknown',
      parameters: {},
      rawCommand: message,
      confidence: 0
    }
  }

  // 👤 OBTER PERFIL DO USUÁRIO
  private async getUserProfile(email: string): Promise<UserProfile | null> {
    try {
      // Buscar no banco de dados
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (error || !data) {
        // Se não encontrar, criar perfil padrão
        return this.createDefaultProfile(email)
      }

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        accessLevel: data.access_level,
        personalizedGreeting: data.personalized_greeting,
        voiceSettings: data.voice_settings,
        permissions: data.permissions,
        isActive: data.is_active
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      return this.createDefaultProfile(email)
    }
  }

  // 🎨 CRIAR PERFIL PADRÃO
  private createDefaultProfile(email: string): UserProfile {
    if (email === 'phpg69@gmail.com') {
      return {
        id: 'pedro-passos',
        name: 'Pedro Passos',
        email: 'phpg69@gmail.com',
        role: 'admin',
        accessLevel: 4,
        personalizedGreeting: 'Olá, Pedro! Que bom ter você aqui. Como posso ajudar hoje?',
        voiceSettings: {
          voice: 'Microsoft Maria - Portuguese (Brazil)',
          rate: 0.9,
          pitch: 1.1,
          volume: 0.8
        },
        permissions: ['read', 'write', 'execute', 'admin'],
        isActive: true
      }
    }

    if (email === 'iaianoaesperanza@gmail.com') {
      return {
        id: 'ricardo-valenca',
        name: 'Dr. Ricardo Valença',
        email: 'iaianoaesperanza@gmail.com',
        role: 'admin',
        accessLevel: 5,
        personalizedGreeting: 'Olá, Dr. Ricardo! Que bom ter você aqui. Como posso ajudar hoje?',
        voiceSettings: {
          voice: 'Microsoft Maria - Portuguese (Brazil)',
          rate: 0.85,
          pitch: 1.2,
          volume: 0.8
        },
        permissions: ['read', 'write', 'execute', 'admin', 'clinical'],
        isActive: true
      }
    }

    if (email === 'eduardo.faveret@noaesperanza.app' || email === 'eduardoscfaveret@gmail.com') {
      return {
        id: 'eduardo-faveret',
        name: 'Dr. Eduardo de Sá Campello Faveret',
        email: email,
        role: 'admin',
        accessLevel: 5,
        personalizedGreeting: 'Olá, Dr. Eduardo! Acesso administrativo liberado. Como deseja prosseguir?',
        voiceSettings: {
          voice: 'Microsoft Maria - Portuguese (Brazil)',
          rate: 0.85,
          pitch: 1.1,
          volume: 0.8
        },
        permissions: ['read', 'write', 'execute', 'admin', 'clinical', 'gpt_builder'],
        isActive: true
      }
    }

    return {
      id: 'unknown',
      name: 'Usuário',
      email: email,
      role: 'paciente',
      accessLevel: 1,
      personalizedGreeting: 'Olá! Como posso ajudar hoje?',
      voiceSettings: {
        voice: 'Microsoft Maria - Portuguese (Brazil)',
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8
      },
      permissions: ['read'],
      isActive: true
    }
  }

  // 🎮 OBTER COMANDOS DISPONÍVEIS
  private getAvailableCommands(role: string): string[] {
    const baseCommands = [
      'Quero revisar o IMRE do paciente X',
      'Me mostre os aprendizados salvos sobre [tópico]',
      'Continue a sessão de ontem',
      'Mostre os logs da IA das últimas 24h',
      'Gerar relatório final da consulta'
    ]

    if (role === 'admin' || role === 'clinico') {
      return [
        ...baseCommands,
        'Listar todos os usuários',
        'Adicionar novo usuário',
        'Treinar IA com novos dados',
        'Editar blocos IMRE',
        'Ver estatísticas da plataforma'
      ]
    }

    return baseCommands
  }

  // 🔄 DEFINIR USUÁRIO ATUAL
  setCurrentUser(user: UserProfile | null): void {
    this.currentUser = user
    if (user) {
      this.recognizedUsers.set(user.email, user)
    }
  }

  // 👤 OBTER USUÁRIO ATUAL
  getCurrentUser(): UserProfile | null {
    return this.currentUser
  }

  // 🎯 VERIFICAR SE USUÁRIO ESTÁ RECONHECIDO
  isUserRecognized(): boolean {
    return this.currentUser !== null
  }

  // 🎨 OBTER CONFIGURAÇÕES DE VOZ PERSONALIZADAS
  getPersonalizedVoiceSettings(): any {
    if (!this.currentUser) {
      return {
        voice: 'Microsoft Maria - Portuguese (Brazil)',
        rate: 1.0,
        pitch: 1.0,
        volume: 0.8
      }
    }

    return this.currentUser.voiceSettings
  }
}

// Instância global do serviço
export const identityRecognitionService = new IdentityRecognitionService()
