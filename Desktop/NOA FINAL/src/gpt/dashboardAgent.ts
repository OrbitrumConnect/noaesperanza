/**
 * 🗺️ DASHBOARD AGENT - Navegação Inteligente
 * 
 * Agente especializado em navegação e orientação no app
 * Conhece todas as 26 rotas, dashboards, abas e funcionalidades
 * Personaliza respostas baseado no perfil do usuário
 * 
 * @version 1.0.0
 * @date 2025-10-09
 */

import { NoaContext } from './noaVisionIA'

// ========================================
// MAPA COMPLETO DO APP
// ========================================

const APP_MAP = {
  // Home e chat
  home: {
    routes: ['/home', '/home-old', '/chat'],
    name: 'Chat Principal',
    description: 'Conversa com Nôa, reconhecimento de voz, avaliação clínica',
    features: ['Chat', 'Voz', 'Avaliação Clínica', 'ThoughtBubbles']
  },
  
  // Dashboard Paciente
  paciente: {
    route: '/app/paciente',
    name: 'Dashboard Paciente',
    description: 'Área do paciente com chat, relatórios e perfil',
    tabs: ['Perfil', 'Chat com Nôa', 'Relatórios'],
    sidebar: [
      { id: 'chat', label: 'Chat com Nôa', route: '/app/paciente?tab=chat' },
      { id: 'duvidas', label: 'Dúvidas Médicas', route: '/app/paciente?tab=chat' },
      { id: 'avaliacao', label: 'Avaliação Clínica', route: '/app/avaliacao-inicial' },
      { id: 'acompanhamento', label: 'Acompanhamento', route: '/app/paciente?tab=chat' },
      { id: 'reports', label: 'Ver Relatórios', route: '/app/paciente?tab=reports' },
      { id: 'profile', label: 'Meu Perfil', route: '/app/perfil' }
    ],
    services: [
      'Fazer avaliação clínica',
      'Ver relatórios',
      'Chat com Nôa',
      'Compartilhar dados com médico'
    ]
  },
  
  // Dashboard Médico
  medico: {
    route: '/app/medico',
    name: 'Dashboard Médico',
    description: 'Área do médico com gestão de pacientes e prescrições',
    sidebar: [
      { id: 'prescricoes', label: 'Prescrições', icon: 'fa-prescription' },
      { id: 'exames', label: 'Exames', icon: 'fa-vials' },
      { id: 'prontuarios', label: 'Prontuários', icon: 'fa-file-medical' },
      { id: 'relatorios', label: 'Relatórios', icon: 'fa-chart-bar' },
      { id: 'agenda', label: 'Agenda', icon: 'fa-calendar-alt' },
      { id: 'pacientes', label: 'Pacientes', icon: 'fa-users' }
    ],
    services: [
      'Ver pacientes compartilhados',
      'Criar prescrições REUNI',
      'Solicitar exames',
      'Ver prontuários',
      'Agendar consultas'
    ]
  },
  
  // Dashboard Profissional
  profissional: {
    route: '/app/profissional',
    name: 'Dashboard Profissional',
    description: 'Área para profissionais de saúde com educação e pesquisa',
    services: [
      'Acessar cursos',
      'Material educacional',
      'Pesquisas científicas',
      'Certificações'
    ]
  },
  
  // Dashboard Admin
  admin: {
    route: '/app/admin',
    name: 'Dashboard Admin',
    description: 'Área administrativa com GPT Builder e métricas',
    services: [
      'GPT Builder',
      'Base de Conhecimento',
      'Desenvolvimento Colaborativo',
      'Métricas do Sistema',
      'IDE Integrado'
    ]
  },
  
  // Páginas específicas do paciente
  exames: {
    route: '/app/exames',
    name: 'Meus Exames',
    description: 'Visualizar e fazer upload de exames médicos',
    for: ['paciente']
  },
  
  prescricoes: {
    route: '/app/prescricoes',
    name: 'Prescrições',
    description: 'Ver prescrições ativas e histórico',
    for: ['paciente', 'medico']
  },
  
  prontuario: {
    route: '/app/prontuario',
    name: 'Prontuário',
    description: 'Prontuário médico eletrônico',
    for: ['paciente', 'medico']
  },
  
  pagamentos: {
    route: '/app/pagamentos-paciente',
    name: 'Pagamentos',
    description: 'Gerenciar pagamentos e assinaturas',
    for: ['paciente']
  },
  
  avaliacaoInicial: {
    route: '/app/avaliacao-inicial',
    name: 'Avaliação Clínica Inicial',
    description: 'Avaliação completa com 28 blocos IMRE',
    for: ['paciente', 'medico']
  },
  
  triagem: {
    route: '/app/triagem',
    name: 'Triagem Clínica',
    description: 'Triagem rápida de sintomas',
    for: ['paciente']
  },
  
  // Educação e Pesquisa
  ensino: {
    route: '/app/ensino',
    name: 'Ensino',
    description: 'Cursos e material educacional',
    for: ['profissional', 'admin']
  },
  
  pesquisa: {
    route: '/app/pesquisa',
    name: 'Pesquisa',
    description: 'Pesquisas científicas e estudos',
    for: ['profissional', 'admin']
  },
  
  medcannLab: {
    route: '/app/medcann-lab',
    name: 'MedCann Lab',
    description: 'Laboratório de cannabis medicinal',
    for: ['profissional', 'admin', 'pesquisador']
  },
  
  // Sistema
  relatorio: {
    route: '/app/relatorio',
    name: 'Relatório Narrativo',
    description: 'Relatório detalhado da avaliação clínica',
    for: ['paciente', 'medico']
  },
  
  config: {
    route: '/app/config',
    name: 'Configurações',
    description: 'Configurações do sistema e perfil',
    for: ['all']
  },
  
  perfil: {
    route: '/app/perfil',
    name: 'Meu Perfil',
    description: 'Informações pessoais e configurações',
    for: ['all']
  }
}

// ========================================
// DASHBOARD AGENT
// ========================================

export const dashboardAgent = {
  
  /**
   * Navega usuário para destino apropriado
   */
  async navigate(message: string, context: NoaContext): Promise<string> {
    const lower = message.toLowerCase()
    
    // Detectar destino
    const destination = this.detectDestination(lower, context)
    
    if (!destination) {
      return this.showNavigationHelp(context)
    }
    
    // Gerar resposta personalizada
    return this.generateNavigationResponse(destination, context)
  },
  
  /**
   * Detecta para onde usuário quer ir
   */
  detectDestination(lower: string, context: NoaContext): any {
    // Exames
    if (lower.includes('exame') || lower.includes('resultado') || lower.includes('laboratorio')) {
      return APP_MAP.exames
    }
    
    // Prescrições
    if (lower.includes('prescricao') || lower.includes('receita') || lower.includes('medicamento')) {
      return APP_MAP.prescricoes
    }
    
    // Prontuário
    if (lower.includes('prontuario') || lower.includes('historico medico')) {
      return APP_MAP.prontuario
    }
    
    // Relatórios
    if (lower.includes('relatorio') || lower.includes('avaliacao completa')) {
      return APP_MAP.relatorio
    }
    
    // Avaliação Clínica
    if (lower.includes('avaliacao clinica') || lower.includes('avaliacao inicial')) {
      return APP_MAP.avaliacaoInicial
    }
    
    // Triagem
    if (lower.includes('triagem') || lower.includes('sintomas rapido')) {
      return APP_MAP.triagem
    }
    
    // Pagamentos
    if (lower.includes('pagamento') || lower.includes('assinatura') || lower.includes('plano')) {
      return APP_MAP.pagamentos
    }
    
    // Ensino
    if (lower.includes('curso') || lower.includes('aula') || lower.includes('aprender')) {
      return APP_MAP.ensino
    }
    
    // Pesquisa
    if (lower.includes('pesquisa') || lower.includes('estudo') || lower.includes('cientifico')) {
      return APP_MAP.pesquisa
    }
    
    // MedCann Lab
    if (lower.includes('medcann') || lower.includes('laboratorio')) {
      return APP_MAP.medcannLab
    }
    
    // Perfil
    if (lower.includes('perfil') || lower.includes('meus dados')) {
      return APP_MAP.perfil
    }
    
    // Configurações
    if (lower.includes('configuracao') || lower.includes('config') || lower.includes('ajustes')) {
      return APP_MAP.config
    }
    
    // Dashboard específico
    if (lower.includes('dashboard')) {
      if (context.userProfile === 'paciente') return APP_MAP.paciente
      if (context.userProfile === 'medico') return APP_MAP.medico
      if (context.userProfile === 'profissional') return APP_MAP.profissional
      if (context.userProfile === 'admin') return APP_MAP.admin
    }
    
    return null
  },
  
  /**
   * Gera resposta de navegação personalizada
   */
  generateNavigationResponse(destination: any, context: NoaContext): string {
    // Verificar se usuário tem permissão
    if (destination.for && !destination.for.includes('all')) {
      if (!destination.for.includes(context.userProfile)) {
        return `⚠️ Esta funcionalidade é restrita a: ${destination.for.join(', ')}.

Você está acessando como: ${context.userProfile}.

Posso ajudá-lo com outra coisa?`
      }
    }
    
    // Personalizar por perfil
    const specialtyNames: Record<string, string> = {
      rim: 'Nefrologia',
      neuro: 'Neurologia',
      cannabis: 'Cannabis Medicinal'
    }
    
    let response = `📍 **${destination.name}**\n\n`
    response += `${destination.description}\n\n`
    response += `👉 **[Acessar ${destination.name}](${destination.route})**\n\n`
    
    // Adicionar contexto de especialidade se relevante
    if (destination.route.includes('exames') && context.specialty === 'rim') {
      response += `**Exames de ${specialtyNames[context.specialty]}:**\n`
      response += `• Creatinina\n`
      response += `• Taxa de Filtração Glomerular (TFG)\n`
      response += `• Urina tipo I\n`
      response += `• Ureia\n\n`
    }
    
    if (destination.route.includes('exames') && context.specialty === 'neuro') {
      response += `**Exames de ${specialtyNames[context.specialty]}:**\n`
      response += `• Ressonância Magnética\n`
      response += `• Tomografia\n`
      response += `• Eletroencefalograma\n`
      response += `• Exames laboratoriais\n\n`
    }
    
    // Adicionar dicas
    if (destination.services) {
      response += `**O que você pode fazer aqui:**\n`
      destination.services.forEach((service: string) => {
        response += `• ${service}\n`
      })
      response += `\n`
    }
    
    response += `Precisa de ajuda com mais alguma coisa?`
    
    return response
  },
  
  /**
   * Mostra ajuda de navegação
   */
  showNavigationHelp(context: NoaContext): string {
    let help = `🗺️ **Navegação - Nôa Esperanza**\n\n`
    help += `Você está no **Dashboard ${this.getProfileName(context.userProfile)}**\n\n`
    
    if (context.userProfile === 'paciente') {
      help += `**📱 Você pode acessar:**\n\n`
      help += `**Área Principal:**\n`
      help += `• Chat com Nôa - Conversar e tirar dúvidas\n`
      help += `• Ver Relatórios - Seus relatórios clínicos\n`
      help += `• Meu Perfil - Informações pessoais\n\n`
      help += `**Funcionalidades:**\n`
      help += `• Exames - Ver resultados e histórico\n`
      help += `• Prescrições - Medicamentos ativos\n`
      help += `• Prontuário - Seu histórico médico\n`
      help += `• Avaliação Clínica - Fazer avaliação completa (28 blocos)\n`
      help += `• Triagem - Avaliação rápida de sintomas\n`
      help += `• Pagamentos - Gerenciar assinaturas\n\n`
      help += `**Diga onde quer ir:**\n`
      help += `"Ver meus exames", "Minhas prescrições", "Fazer avaliação", etc.`
    }
    
    if (context.userProfile === 'medico') {
      help += `**📱 Você pode acessar:**\n\n`
      help += `• Prescrições - Criar prescrições REUNI\n`
      help += `• Exames - Solicitar exames para pacientes\n`
      help += `• Prontuários - Ver prontuários compartilhados\n`
      help += `• Relatórios - Análises clínicas\n`
      help += `• Agenda - Gerenciar consultas\n`
      help += `• Pacientes - Lista de pacientes\n\n`
      help += `**Diga o que precisa:**\n`
      help += `"Ver pacientes", "Criar prescrição", "Agendar consulta", etc.`
    }
    
    if (context.userProfile === 'profissional') {
      help += `**📱 Você pode acessar:**\n\n`
      help += `• Ensino - Cursos e material educacional\n`
      help += `• Pesquisa - Estudos científicos\n`
      help += `• MedCann Lab - Laboratório de cannabis\n`
      help += `• Perfil - Suas informações\n\n`
      help += `**Diga o que deseja:**\n`
      help += `"Ver cursos", "Pesquisas disponíveis", "Acessar lab", etc.`
    }
    
    if (context.userProfile === 'admin') {
      help += `**📱 Você pode acessar:**\n\n`
      help += `• GPT Builder - Base de conhecimento\n`
      help += `• Métricas - Estatísticas do sistema\n`
      help += `• IDE - Desenvolvimento integrado\n`
      help += `• Usuários - Gerenciar usuários\n`
      help += `• Configurações - Sistema\n\n`
      help += `**Comandos disponíveis:**\n`
      help += `"Abrir GPT Builder", "Ver métricas", "Desenvolver", etc.`
    }
    
    return help
  },
  
  /**
   * Retorna nome do perfil em português
   */
  getProfileName(profile: string): string {
    const names: Record<string, string> = {
      paciente: 'Paciente',
      medico: 'Médico',
      profissional: 'Profissional',
      admin: 'Administrador',
      pesquisador: 'Pesquisador'
    }
    return names[profile] || 'Usuário'
  },
  
  /**
   * Explica funcionalidade específica
   */
  explainFeature(feature: string, context: NoaContext): string {
    const explanations: Record<string, string> = {
      'avaliacao-clinica': `🩺 **Avaliação Clínica Inicial - Método IMRE**

A Avaliação Clínica é um processo estruturado em **28 blocos** baseado na metodologia "Arte da Entrevista Clínica" do Dr. Ricardo Valença.

**Como funciona:**
1. Apresentação e identificação
2. Lista de sintomas principais
3. Queixa principal detalhada
4. Desenvolvimento dos sintomas
5. História patológica pregressa
6. História familiar
7. Hábitos de vida
8-28. Blocos específicos da especialidade

**Ao final:**
✅ Relatório narrativo completo
✅ NFT "Escute-se" (blockchain)
✅ Disponível no seu dashboard
✅ Opção de compartilhar com Dr. Ricardo

**Para iniciar:**
Diga: "Quero fazer avaliação clínica" ou clique no botão verde "Avaliação Clínica Inicial"`,
      
      'exames': `📋 **Meus Exames**

Aqui você pode:
• Ver resultados de todos os seus exames
• Fazer upload de novos exames (PDF, imagem)
• Acompanhar histórico
• Compartilhar com seu médico
• Ver tendências e evolução

**Especialidade ${context.specialty === 'rim' ? 'Nefrologia' : context.specialty === 'neuro' ? 'Neurologia' : 'Cannabis Medicinal'}:**
Exames mais comuns aparecem destacados.`,
      
      'prescricoes': context.userProfile === 'medico' ? 
        `💊 **Sistema de Prescrições REUNI**

Como médico, você pode:
• Criar prescrições de cannabis medicinal
• Validação automática RDC 660/327
• Produtos registrados no REUNI
• Rastreabilidade completa
• Auditoria para Anvisa

**Compliance automático:**
✅ Concentração CBD (máx 30%)
✅ Concentração THC (máx 0,2%)
✅ Receituário especial
✅ Registro no REUNI` 
        : 
        `💊 **Minhas Prescrições**

Aqui você vê:
• Medicamentos ativos
• Dosagens e horários
• Instruções de uso
• Validade da prescrição
• Histórico completo`
    }
    
    return explanations[feature] || `Explicação não disponível para "${feature}".`
  }
}

