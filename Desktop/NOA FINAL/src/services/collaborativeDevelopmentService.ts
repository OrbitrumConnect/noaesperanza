/**
 * Serviço de Desenvolvimento Colaborativo - Nôa Esperanza
 * Permite que o GPT Builder crie funcionalidades junto com o usuário
 */

export interface DevelopmentTask {
  id: string
  title: string
  description: string
  type: 'component' | 'service' | 'feature' | 'page' | 'integration'
  status: 'pending' | 'in_progress' | 'completed' | 'testing'
  priority: 'low' | 'medium' | 'high' | 'critical'
  files: string[]
  dependencies: string[]
  createdAt: Date
  updatedAt: Date
  progress: number
  userInput?: string
  aiSuggestion?: string
}

export interface CodeGeneration {
  fileName: string
  content: string
  type: 'create' | 'modify' | 'delete'
  description: string
  dependencies: string[]
}

export class CollaborativeDevelopmentService {
  private currentTasks: DevelopmentTask[] = []
  private codeHistory: CodeGeneration[] = []

  /**
   * Iniciar uma nova tarefa de desenvolvimento
   */
  async startDevelopmentTask(
    userRequest: string,
    context?: string
  ): Promise<DevelopmentTask> {
    const task: DevelopmentTask = {
      id: `task_${Date.now()}`,
      title: this.extractTitle(userRequest),
      description: userRequest,
      type: this.detectTaskType(userRequest),
      status: 'pending',
      priority: this.detectPriority(userRequest),
      files: [],
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      progress: 0,
      userInput: userRequest
    }

    // Gerar sugestão da IA
    task.aiSuggestion = await this.generateAISuggestion(task, context)
    
    this.currentTasks.push(task)
    return task
  }

  /**
   * Gerar código para uma tarefa
   */
  async generateCode(task: DevelopmentTask, specifications?: string): Promise<CodeGeneration[]> {
    const generations: CodeGeneration[] = []

    switch (task.type) {
      case 'component':
        generations.push(...await this.generateComponent(task, specifications))
        break
      case 'service':
        generations.push(...await this.generateService(task, specifications))
        break
      case 'feature':
        generations.push(...await this.generateFeature(task, specifications))
        break
      case 'page':
        generations.push(...await this.generatePage(task, specifications))
        break
      case 'integration':
        generations.push(...await this.generateIntegration(task, specifications))
        break
    }

    // Atualizar tarefa
    task.files = generations.map(g => g.fileName)
    task.progress = 25
    task.status = 'in_progress'
    task.updatedAt = new Date()

    this.codeHistory.push(...generations)
    return generations
  }

  /**
   * Gerar componente React
   */
  private async generateComponent(task: DevelopmentTask, specs?: string): Promise<CodeGeneration[]> {
    const componentName = this.extractComponentName(task.title)
    const props = this.extractProps(specs || task.description)
    
    const content = `import React from 'react'

interface ${componentName}Props {
${props.map(prop => `  ${prop.name}${prop.optional ? '?' : ''}: ${prop.type}`).join('\n')}
}

const ${componentName}: React.FC<${componentName}Props> = ({ ${props.map(p => p.name).join(', ')} }) => {
  return (
    <div className="p-4 bg-slate-800 rounded-lg">
      <h2 className="text-xl font-semibold text-white mb-4">${componentName}</h2>
      ${this.generateComponentContent(task.description)}
    </div>
  )
}

export default ${componentName}`

    return [{
      fileName: `src/components/${componentName}.tsx`,
      content,
      type: 'create',
      description: `Componente ${componentName} criado baseado na solicitação: ${task.description}`,
      dependencies: ['react']
    }]
  }

  /**
   * Gerar serviço
   */
  private async generateService(task: DevelopmentTask, specs?: string): Promise<CodeGeneration[]> {
    const serviceName = this.extractServiceName(task.title)
    
    const content = `/**
 * ${serviceName} - Serviço gerado colaborativamente
 * ${task.description}
 */

export interface ${serviceName}Config {
  // Configurações do serviço
}

export class ${serviceName} {
  private config: ${serviceName}Config

  constructor(config: ${serviceName}Config) {
    this.config = config
  }

  async execute(): Promise<any> {
    // Implementação do serviço
    console.log('Executando ${serviceName}')
    
    // TODO: Implementar lógica específica baseada em: ${task.description}
    
    return {
      success: true,
      message: '${serviceName} executado com sucesso'
    }
  }
}

export const ${serviceName.toLowerCase()}Service = new ${serviceName}({})`

    return [{
      fileName: `src/services/${serviceName}.ts`,
      content,
      type: 'create',
      description: `Serviço ${serviceName} criado baseado na solicitação: ${task.description}`,
      dependencies: []
    }]
  }

  /**
   * Gerar funcionalidade completa
   */
  private async generateFeature(task: DevelopmentTask, specs?: string): Promise<CodeGeneration[]> {
    const generations: CodeGeneration[] = []
    const featureName = this.extractFeatureName(task.title)

    // Gerar componente principal
    generations.push(...await this.generateComponent({
      ...task,
      title: `${featureName} Component`,
      type: 'component'
    }, specs))

    // Gerar serviço relacionado
    generations.push(...await this.generateService({
      ...task,
      title: `${featureName} Service`,
      type: 'service'
    }, specs))

    // Gerar hook personalizado se necessário
    if (task.description.toLowerCase().includes('hook') || task.description.toLowerCase().includes('estado')) {
      const hookContent = `import { useState, useEffect } from 'react'

export const use${featureName} = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Lógica do hook
  }, [])

  return {
    data,
    loading,
    error,
    // Métodos específicos da funcionalidade
  }
}`

      generations.push({
        fileName: `src/hooks/use${featureName}.ts`,
        content: hookContent,
        type: 'create',
        description: `Hook use${featureName} criado para a funcionalidade`,
        dependencies: ['react']
      })
    }

    return generations
  }

  /**
   * Gerar página
   */
  private async generatePage(task: DevelopmentTask, specs?: string): Promise<CodeGeneration[]> {
    const pageName = this.extractPageName(task.title)
    
    const content = `import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'

const ${pageName}: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-black/40 rounded-3xl border border-white/10 shadow-xl backdrop-blur p-8">
          <h1 className="text-3xl font-bold text-white mb-6">${pageName}</h1>
          
          <div className="space-y-6">
            ${this.generatePageContent(task.description)}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ${pageName}`

    return [{
      fileName: `src/pages/${pageName}.tsx`,
      content,
      type: 'create',
      description: `Página ${pageName} criada baseada na solicitação: ${task.description}`,
      dependencies: ['react', 'react-router-dom']
    }]
  }

  /**
   * Gerar integração
   */
  private async generateIntegration(task: DevelopmentTask, specs?: string): Promise<CodeGeneration[]> {
    const integrationName = this.extractIntegrationName(task.title)
    
    const content = `/**
 * ${integrationName} - Integração gerada colaborativamente
 * ${task.description}
 */

import { supabase } from '../integrations/supabase/client'

export interface ${integrationName}Config {
  // Configurações da integração
}

export class ${integrationName} {
  private config: ${integrationName}Config

  constructor(config: ${integrationName}Config) {
    this.config = config
  }

  async connect(): Promise<boolean> {
    try {
      // Lógica de conexão
      console.log('Conectando com ${integrationName}')
      
      // TODO: Implementar conexão específica baseada em: ${task.description}
      
      return true
    } catch (error) {
      console.error('Erro ao conectar:', error)
      return false
    }
  }

  async sync(): Promise<any> {
    // Lógica de sincronização
    console.log('Sincronizando dados...')
    
    return {
      success: true,
      syncedAt: new Date().toISOString()
    }
  }
}

export const ${integrationName.toLowerCase()}Integration = new ${integrationName}({})`

    return [{
      fileName: `src/integrations/${integrationName}.ts`,
      content,
      type: 'create',
      description: `Integração ${integrationName} criada baseada na solicitação: ${task.description}`,
      dependencies: []
    }]
  }

  /**
   * Métodos auxiliares
   */
  private extractTitle(request: string): string {
    // Extrair título da solicitação
    const words = request.split(' ')
    return words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  private detectTaskType(request: string): DevelopmentTask['type'] {
    const lower = request.toLowerCase()
    if (lower.includes('componente') || lower.includes('component')) return 'component'
    if (lower.includes('serviço') || lower.includes('service')) return 'service'
    if (lower.includes('página') || lower.includes('page')) return 'page'
    if (lower.includes('integração') || lower.includes('integration')) return 'integration'
    return 'feature'
  }

  private detectPriority(request: string): DevelopmentTask['priority'] {
    const lower = request.toLowerCase()
    if (lower.includes('urgente') || lower.includes('crítico')) return 'critical'
    if (lower.includes('importante') || lower.includes('alta')) return 'high'
    if (lower.includes('média') || lower.includes('medium')) return 'medium'
    return 'low'
  }

  private async generateAISuggestion(task: DevelopmentTask, context?: string): Promise<string> {
    // Gerar sugestão da IA baseada na tarefa
    const suggestions = [
      `Vou criar um ${task.type} para "${task.title}". Posso sugerir uma implementação moderna com TypeScript e React.`,
      `Para "${task.title}", sugiro criar um ${task.type} com as melhores práticas de desenvolvimento.`,
      `Vou desenvolver um ${task.type} baseado em sua solicitação. Posso incluir funcionalidades adicionais?`,
      `Criando ${task.type} para "${task.title}". Vou implementar com foco em performance e usabilidade.`
    ]
    
    return suggestions[Math.floor(Math.random() * suggestions.length)]
  }

  private extractComponentName(title: string): string {
    return title.replace(/[^a-zA-Z0-9]/g, '') + 'Component'
  }

  private extractServiceName(title: string): string {
    return title.replace(/[^a-zA-Z0-9]/g, '') + 'Service'
  }

  private extractFeatureName(title: string): string {
    return title.replace(/[^a-zA-Z0-9]/g, '') + 'Feature'
  }

  private extractPageName(title: string): string {
    return title.replace(/[^a-zA-Z0-9]/g, '') + 'Page'
  }

  private extractIntegrationName(title: string): string {
    return title.replace(/[^a-zA-Z0-9]/g, '') + 'Integration'
  }

  private extractProps(description: string): Array<{name: string, type: string, optional: boolean}> {
    // Extrair props básicas da descrição
    const props = []
    
    if (description.toLowerCase().includes('título') || description.toLowerCase().includes('title')) {
      props.push({ name: 'title', type: 'string', optional: false })
    }
    
    if (description.toLowerCase().includes('descrição') || description.toLowerCase().includes('description')) {
      props.push({ name: 'description', type: 'string', optional: true })
    }
    
    if (description.toLowerCase().includes('onClick') || description.toLowerCase().includes('click')) {
      props.push({ name: 'onClick', type: '() => void', optional: true })
    }
    
    return props
  }

  private generateComponentContent(description: string): string {
    if (description.toLowerCase().includes('botão') || description.toLowerCase().includes('button')) {
      return `<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
        Ação
      </button>`
    }
    
    if (description.toLowerCase().includes('lista') || description.toLowerCase().includes('list')) {
      return `<ul className="space-y-2">
        <li className="text-gray-300">Item 1</li>
        <li className="text-gray-300">Item 2</li>
        <li className="text-gray-300">Item 3</li>
      </ul>`
    }
    
    return `<p className="text-gray-300">Conteúdo do componente baseado na sua solicitação.</p>`
  }

  private generatePageContent(description: string): string {
    if (description.toLowerCase().includes('dashboard')) {
      return `<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Métricas</h3>
          <p className="text-gray-400">Conteúdo do dashboard</p>
        </div>
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Gráficos</h3>
          <p className="text-gray-400">Visualizações de dados</p>
        </div>
        <div className="bg-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-2">Ações</h3>
          <p className="text-gray-400">Botões de ação</p>
        </div>
      </div>`
    }
    
    return `<div className="bg-slate-700 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Conteúdo Principal</h2>
      <p className="text-gray-300">Conteúdo da página baseado na sua solicitação.</p>
    </div>`
  }

  /**
   * Obter tarefas ativas
   */
  getActiveTasks(): DevelopmentTask[] {
    return this.currentTasks.filter(task => task.status !== 'completed')
  }

  /**
   * Obter histórico de código
   */
  getCodeHistory(): CodeGeneration[] {
    return this.codeHistory
  }

  /**
   * Atualizar progresso de uma tarefa
   */
  updateTaskProgress(taskId: string, progress: number): void {
    const task = this.currentTasks.find(t => t.id === taskId)
    if (task) {
      task.progress = Math.min(100, Math.max(0, progress))
      task.updatedAt = new Date()
      
      if (progress >= 100) {
        task.status = 'completed'
      } else if (progress > 0) {
        task.status = 'in_progress'
      }
    }
  }

  /**
   * Marcar tarefa como concluída
   */
  completeTask(taskId: string): void {
    const task = this.currentTasks.find(t => t.id === taskId)
    if (task) {
      task.status = 'completed'
      task.progress = 100
      task.updatedAt = new Date()
    }
  }
}

// Instância global
export const collaborativeDevelopmentService = new CollaborativeDevelopmentService()
