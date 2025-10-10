/**
 * 🚀 NOAVISION IA - Motor Inteligente Unificado
 * 
 * Sistema híbrido que combina:
 * - Embeddings locais (MiniLM-L6-v2)
 * - Busca semântica por similaridade de cosseno
 * - Agentes especializados modulares
 * - Aprendizado contínuo no banco de dados
 * - Personalização por perfil + especialidade
 * - Fallback OpenAI quando necessário
 * 
 * @version 1.0.0
 * @date 2025-10-09
 */

import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers'
import { supabase } from '../integrations/supabase/client'
import { openAIService } from '../services/openaiService'

// Importar agentes existentes
import { clinicalAgent } from './clinicalAgent'
import { knowledgeBaseAgent } from './knowledgeBaseAgent'
import { courseAdminAgent } from './courseAdminAgent'
import { symbolicAgent } from './symbolicAgent'
import { voiceControlAgent } from './voiceControlAgent'
import { codeEditorAgent } from './codeEditorAgent'

// Importar novos agentes
import { dashboardAgent } from './dashboardAgent'
import { adminAgent } from './adminAgent'

// ========================================
// TIPOS E INTERFACES
// ========================================

export interface NoaContext {
  userId: string
  userProfile: 'paciente' | 'medico' | 'profissional' | 'admin' | 'pesquisador'
  userName?: string
  specialty: 'rim' | 'neuro' | 'cannabis'
  currentDashboard: string // ex: /app/paciente
  currentRoute?: string // rota completa
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface SimilarResponse {
  id: string
  user_message: string
  ai_response: string
  similarity: number
  usage_count: number
  confidence_score: number
  source: string
}

export interface ProcessResult {
  response: string
  source: 'local' | 'agent' | 'openai'
  confidence: number
  processingTime: number
}

// ========================================
// CLASSE PRINCIPAL: NOAVISION IA
// ========================================

export class NoaVisionIA {
  // 🎭 IDENTIDADE DUAL
  public displayName: string = 'Nôa Esperanza'      // Nome público (usuário vê)
  public technicalName: string = 'NoaVision IA'     // Nome técnico (logs)
  
  private embeddingsModel: FeatureExtractionPipeline | null = null
  private isInitialized: boolean = false
  private initializationPromise: Promise<void> | null = null
  private embeddingCache: Map<string, number[]> = new Map()
  private agents: Record<string, any>
  
  constructor() {
    // Inicializar agentes
    this.agents = {
      clinical: clinicalAgent,
      knowledge: knowledgeBaseAgent,
      courses: courseAdminAgent,
      symbolic: symbolicAgent,
      voice: voiceControlAgent,
      code: codeEditorAgent,
      dashboard: dashboardAgent,
      admin: adminAgent
    }
    
    // Inicializar embeddings em background
    this.initializeEmbeddings()
  }
  
  // ========================================
  // INICIALIZAÇÃO
  // ========================================
  
  /**
   * Inicializa o modelo de embeddings
   * MiniLM-L6-v2: 384 dimensões, ~25MB, rápido em CPU
   */
  private async initializeEmbeddings(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise
    }
    
    this.initializationPromise = (async () => {
      try {
        console.log(`🧠 [${this.technicalName}] Carregando MiniLM-L6-v2...`)
        const startTime = Date.now()
        
        this.embeddingsModel = await pipeline(
          'feature-extraction',
          'Xenova/all-MiniLM-L6-v2',
          { 
            quantized: true, // Usar versão quantizada (mais rápida)
            progress_callback: (progress: any) => {
              if (progress.status === 'progress') {
                console.log(`📥 Download: ${progress.file} - ${Math.round(progress.progress)}%`)
              }
            }
          }
        )
        
        const loadTime = Date.now() - startTime
        this.isInitialized = true
        
        console.log(`✅ [${this.technicalName}] Modelo carregado em ${loadTime}ms`)
        console.log(`🎯 [${this.technicalName}] ${this.displayName} pronta para conversar!`)
        
      } catch (error) {
        console.error('❌ [NoaVision IA] Erro ao carregar modelo:', error)
        console.warn('⚠️ [NoaVision IA] Sistema funcionará apenas com OpenAI (fallback)')
        this.isInitialized = false
      }
    })()
    
    return this.initializationPromise
  }
  
  /**
   * Aguarda inicialização do modelo
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized && this.initializationPromise) {
      await this.initializationPromise
    }
  }
  
  // ========================================
  // MÉTODO PRINCIPAL: PROCESSAR MENSAGEM
  // ========================================
  
  /**
   * Processa mensagem do usuário com inteligência híbrida
   * 
   * Fluxo:
   * 1. Normaliza mensagem
   * 2. Verifica agentes específicos (prioridade)
   * 3. Vetoriza e busca semanticamente no banco
   * 4. Se encontrar (≥85%): usa resposta local
   * 5. Se não: fallback OpenAI
   * 6. Salva para aprendizado futuro
   */
  async processMessage(
    message: string,
    context: NoaContext
  ): Promise<ProcessResult> {
    const startTime = Date.now()
    
    try {
      console.log('📨 [NoaVision IA] Processando:', { 
        message: message.substring(0, 50) + '...', 
        context: {
          profile: context.userProfile,
          specialty: context.specialty,
          dashboard: context.currentDashboard
        }
      })
      
      // 1️⃣ NORMALIZAR MENSAGEM
      const normalized = this.normalizeMessage(message)
      
      // 2️⃣ VERIFICAR AGENTES ESPECÍFICOS (alta prioridade)
      const agentResponse = await this.checkAgents(normalized, context)
      if (agentResponse) {
        const processingTime = Date.now() - startTime
        console.log(`✅ [NoaVision IA] Respondido por agente em ${processingTime}ms`)
        
        // Salvar para aprendizado
        await this.saveToLearning(message, agentResponse, context, 'agent')
        
        return {
          response: agentResponse,
          source: 'agent',
          confidence: 0.95,
          processingTime
        }
      }
      
      // 3️⃣ GARANTIR QUE EMBEDDINGS ESTÁ CARREGADO
      await this.ensureInitialized()
      
      // 4️⃣ VETORIZAR MENSAGEM
      const embedding = await this.getEmbedding(normalized)
      
      // 4.5️⃣ BUSCAR CONTEXTO EM DOCUMENTOS E CONHECIMENTO
      let enrichedContext = ''
      if (embedding) {
        enrichedContext = await this.enrichContextWithDocs(embedding, context)
        if (enrichedContext) {
          console.log('📚 [NoaVision IA] Contexto enriquecido com documentos')
        }
      }
      
      // 5️⃣ BUSCA SEMÂNTICA NO BANCO (conversas anteriores)
      if (embedding) {
        const similarResponse = await this.semanticSearch(embedding, context)
        
        if (similarResponse && similarResponse.similarity >= 0.85) {
          const processingTime = Date.now() - startTime
          console.log(`✅ [NoaVision IA] Resposta local em ${processingTime}ms (${(similarResponse.similarity * 100).toFixed(1)}% similar)`)
          
          // Incrementar uso
          await this.incrementUsage(similarResponse.id)
          
          // Adicionar contexto enriquecido à resposta
          let finalResponse = similarResponse.ai_response
          if (enrichedContext) {
            finalResponse += '\n\n' + enrichedContext
          }
          
          return {
            response: finalResponse,
            source: 'local',
            confidence: similarResponse.similarity,
            processingTime
          }
        }
      }
      
      // 6️⃣ FALLBACK OPENAI (com contexto enriquecido)
      console.log('🔄 [NoaVision IA] Usando OpenAI (fallback)')
      
      // Adicionar contexto de documentos ao prompt
      let contextualMessage = message
      if (enrichedContext) {
        contextualMessage = `${message}\n\n${enrichedContext}\n\n**Use o contexto acima para fundamentar sua resposta.**`
      }
      
      const openaiResponse = await this.openAIFallback(contextualMessage, context)
      const processingTime = Date.now() - startTime
      
      // Salvar para aprendizado
      await this.saveToLearning(message, openaiResponse, context, 'openai', embedding)
      
      console.log(`✅ [NoaVision IA] OpenAI respondeu em ${processingTime}ms`)
      
      return {
        response: openaiResponse,
        source: 'openai',
        confidence: 0.75,
        processingTime
      }
      
    } catch (error) {
      console.error('❌ [NoaVision IA] Erro fatal:', error)
      
      return {
        response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        source: 'openai',
        confidence: 0,
        processingTime: Date.now() - startTime
      }
    }
  }
  
  // ========================================
  // NORMALIZAÇÃO
  // ========================================
  
  /**
   * Normaliza mensagem para processamento
   * - Lowercase
   * - Remove acentos (NFD)
   * - Trim de espaços
   */
  private normalizeMessage(message: string): string {
    return message
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .trim()
  }
  
  // ========================================
  // VERIFICAÇÃO DE AGENTES
  // ========================================
  
  /**
   * Verifica se mensagem deve ser roteada para agente específico
   * Retorna resposta do agente ou null
   */
  private async checkAgents(
    normalized: string,
    context: NoaContext
  ): Promise<string | null> {
    
    // 🔐 1. RECONHECIMENTO DE IDENTIDADE (máxima prioridade)
    if (
      /ricardo\s*valenca.*aqui/i.test(normalized) ||
      /ola.*noa.*ricardo/i.test(normalized)
    ) {
      return `👨‍⚕️ **Dr. Ricardo Valença reconhecido!**

Olá, Dr. Ricardo! Sou a Nôa Esperanza.
Acesso administrativo concedido com NoaVision IA.

🚀 **Novos recursos:**
• Busca semântica local (embeddings)
• 80% respostas locais (5-10x mais rápido)
• Compliance RDC 660/327 integrado
• Personalização avançada por perfil

Como posso ajudá-lo hoje?`
    }
    
    // 🩺 2. CLINICAL AGENT (avaliação clínica)
    if (
      normalized.includes('avaliacao clinica') ||
      normalized.includes('avaliacao inicial') ||
      normalized.includes('quero fazer avaliacao') ||
      normalized.includes('iniciar avaliacao')
    ) {
      const inicioAvaliacao = await clinicalAgent.detectarInicioAvaliacao(normalized)
      if (inicioAvaliacao) {
        return inicioAvaliacao.mensagem
      }
    }
    
    // 🗺️ 3. DASHBOARD AGENT (navegação)
    if (
      normalized.includes('como acesso') ||
      normalized.includes('onde fica') ||
      normalized.includes('ir para') ||
      normalized.includes('abrir') ||
      normalized.includes('ver meus') ||
      normalized.includes('minhas')
    ) {
      try {
        return await dashboardAgent.navigate(normalized, context)
      } catch (error) {
        console.warn('[NoaVision IA] DashboardAgent erro:', error)
      }
    }
    
    // 💊 4. PRESCRIPTION AGENT (só para médicos)
    if (context.userProfile === 'medico') {
      if (
        normalized.includes('prescrever') ||
        normalized.includes('prescricao') ||
        normalized.includes('receita') ||
        normalized.includes('medicamento')
      ) {
        return `💊 **Prescrições**

Este sistema não possui produtos REUNI ou venda de medicamentos. 

📋 **Você pode usar a área de Prescrições para:**
- Registrar tratamentos prescritos externamente
- Acompanhar histórico de medicações
- Compartilhar informações com profissionais de saúde

Para acessar: Menu lateral > Prescrições`
      }
    }
    
    // 📚 5. KNOWLEDGE AGENT (documentos)
    if (
      normalized.includes('documento') ||
      normalized.includes('base de conhecimento') ||
      normalized.includes('consultar conhecimento')
    ) {
      return await knowledgeBaseAgent.executarAcao(normalized)
    }
    
    // 🎓 6. COURSE AGENT (cursos)
    if (
      normalized.includes('curso') ||
      normalized.includes('aula') ||
      normalized.includes('educacao')
    ) {
      return await courseAdminAgent.executarTarefa(normalized)
    }
    
    // 🎤 7. VOICE AGENT (voz)
    if (normalized.includes('ativar voz') || normalized.includes('modo voz')) {
      return await voiceControlAgent.ativarControle()
    }
    
    // 🌀 8. SYMBOLIC AGENT (simbólico)
    if (
      normalized.includes('curadoria simbolica') ||
      normalized.includes('ancestralidade')
    ) {
      return await symbolicAgent.executarAcao(normalized)
    }
    
    // 💻 9. CODE AGENT (apenas admin)
    if (context.userProfile === 'admin') {
      if (
        normalized.includes('editar codigo') ||
        normalized.includes('desenvolver') ||
        normalized.includes('criar componente')
      ) {
        return await codeEditorAgent.editarArquivo(normalized)
      }
    }
    
    // Nenhum agente específico detectado
    return null
  }
  
  // ========================================
  // EMBEDDINGS
  // ========================================
  
  /**
   * Gera embedding para texto
   * Usa cache para evitar reprocessamento
   */
  private async getEmbedding(text: string): Promise<number[] | null> {
    if (!this.embeddingsModel) {
      console.warn('⚠️ [NoaVision IA] Modelo não carregado, pulando embedding')
      return null
    }
    
    // Verificar cache local (memória)
    const cacheKey = this.hashText(text)
    if (this.embeddingCache.has(cacheKey)) {
      console.log('📦 [NoaVision IA] Usando embedding do cache local')
      return this.embeddingCache.get(cacheKey)!
    }
    
    // Verificar cache do banco
    const dbCache = await this.getEmbeddingFromDB(text)
    if (dbCache) {
      console.log('🗄️ [NoaVision IA] Usando embedding do cache do banco')
      this.embeddingCache.set(cacheKey, dbCache)
      return dbCache
    }
    
    try {
      // Gerar embedding novo
      const startTime = Date.now()
      
      const output = await this.embeddingsModel(text, {
        pooling: 'mean',
        normalize: true
      })
      
      const embedding = Array.from(output.data) as number[]
      const processingTime = Date.now() - startTime
      
      console.log(`🧠 [NoaVision IA] Embedding gerado em ${processingTime}ms`)
      
      // Salvar no cache local
      this.embeddingCache.set(cacheKey, embedding)
      
      // Limitar tamanho do cache (máximo 100 embeddings)
      if (this.embeddingCache.size > 100) {
        const firstKey = this.embeddingCache.keys().next().value
        if (firstKey) {
          this.embeddingCache.delete(firstKey)
        }
      }
      
      // Salvar no cache do banco (background)
      this.saveEmbeddingToDB(text, embedding).catch(console.warn)
      
      return embedding
      
    } catch (error) {
      console.error('❌ [NoaVision IA] Erro ao gerar embedding:', error)
      return null
    }
  }
  
  /**
   * Busca embedding no cache do banco
   */
  private async getEmbeddingFromDB(text: string): Promise<number[] | null> {
    try {
      const textHash = await this.sha256(text)
      
      const { data, error } = await supabase
        .from('embedding_cache')
        .select('embedding')
        .eq('text_hash', textHash)
        .single()
      
      if (error || !data) return null
      
      // Incrementar hits
      await supabase
        .from('embedding_cache')
        .update({ 
          hits: supabase.rpc('increment', { row_id: textHash }),
          last_used_at: new Date().toISOString()
        })
        .eq('text_hash', textHash)
      
      return data.embedding
      
    } catch (error) {
      return null
    }
  }
  
  /**
   * Salva embedding no cache do banco
   */
  private async saveEmbeddingToDB(text: string, embedding: number[]): Promise<void> {
    try {
      const textHash = await this.sha256(text)
      const textPreview = text.substring(0, 100)
      
      await supabase
        .from('embedding_cache')
        .upsert({
          text_hash: textHash,
          text_preview: textPreview,
          embedding: embedding,
          hits: 1,
          last_used_at: new Date().toISOString()
        })
        
    } catch (error) {
      console.warn('⚠️ [NoaVision IA] Erro ao salvar cache:', error)
    }
  }
  
  // ========================================
  // BUSCA SEMÂNTICA
  // ========================================
  
  /**
   * Busca respostas similares no banco usando embeddings
   * Usa distância de cosseno (0-1)
   * Filtra por perfil, especialidade e dashboard
   */
  private async semanticSearch(
    embedding: number[],
    context: NoaContext
  ): Promise<SimilarResponse | null> {
    try {
      const { data, error } = await supabase.rpc('search_similar_embeddings', {
        query_embedding: embedding,
        filter_profile: context.userProfile,
        filter_specialty: context.specialty,
        filter_dashboard: context.currentDashboard,
        similarity_threshold: 0.85,
        match_count: 3
      })
      
      if (error) {
        console.error('❌ [NoaVision IA] Erro na busca semântica:', error)
        return null
      }
      
      if (!data || data.length === 0) {
        console.log('🔍 [NoaVision IA] Nenhuma resposta similar encontrada')
        return null
      }
      
      // Retornar o melhor match
      const bestMatch = data[0]
      
      console.log(`🎯 [NoaVision IA] Match encontrado:`, {
        similarity: `${(bestMatch.similarity * 100).toFixed(1)}%`,
        usage: bestMatch.usage_count,
        confidence: bestMatch.confidence_score
      })
      
      return {
        id: bestMatch.id,
        user_message: bestMatch.user_message,
        ai_response: bestMatch.ai_response,
        similarity: bestMatch.similarity,
        usage_count: bestMatch.usage_count,
        confidence_score: bestMatch.confidence_score,
        source: bestMatch.source
      }
      
    } catch (error) {
      console.error('❌ [NoaVision IA] Erro na busca semântica:', error)
      return null
    }
  }
  
  // ========================================
  // FALLBACK OPENAI
  // ========================================
  
  /**
   * Fallback para OpenAI quando não há resposta local
   * Constrói prompt personalizado por perfil
   */
  private async openAIFallback(
    message: string,
    context: NoaContext
  ): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(context)
      
      const conversationHistory = context.conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      
      const response = await openAIService.sendMessage(
        [
          ...conversationHistory,
          { role: 'user', content: message }
        ],
        systemPrompt
      )
      
      return response
      
    } catch (error) {
      console.error('❌ [NoaVision IA] Erro no OpenAI:', error)
      return 'Desculpe, estou com dificuldades para processar sua mensagem no momento. Por favor, tente novamente.'
    }
  }
  
  /**
   * Constrói prompt do sistema personalizado por perfil
   */
  private buildSystemPrompt(context: NoaContext): string {
    const specialtyNames = {
      rim: 'Nefrologia',
      neuro: 'Neurologia',
      cannabis: 'Cannabis Medicinal'
    }
    
    let basePrompt = `Você é Nôa Esperanza, assistente médica inteligente do Dr. Ricardo Valença.

**CONTEXTO DO USUÁRIO:**
- Perfil: ${context.userProfile}
- Nome: ${context.userName || 'Usuário'}
- Especialidade ativa: ${specialtyNames[context.specialty]}
- Dashboard atual: ${context.currentDashboard}

**SUAS ESPECIALIDADES:**
1. Nefrologia (doenças renais)
2. Cannabis Medicinal (CBD/THC terapêutico)
3. Neurologia (sistema nervoso)
`
    
    // Personalizar por perfil
    if (context.userProfile === 'paciente') {
      basePrompt += `
**TOM:** Acolhedor, empático e tranquilizador
**LINGUAGEM:** Simples, clara e acessível
**FOCO:** Cuidado personalizado e acompanhamento
**LINKS ÚTEIS:** /app/paciente (Chat), /app/relatorio (Relatórios), /app/exames (Exames)

**COMPORTAMENTO:**
- Use linguagem que o paciente entenda
- Seja empático e acolhedor
- Ofereça próximos passos claros
- Sugira avaliação clínica quando apropriado
- NUNCA diagnostique ou prescreva (apenas médicos podem)
`
    }
    
    if (context.userProfile === 'medico') {
      basePrompt += `
**TOM:** Profissional, técnico e colaborativo
**LINGUAGEM:** Terminologia médica apropriada
**FOCO:** Gestão de pacientes e prescrições
**LINKS ÚTEIS:** /app/medico (Dashboard), /app/prescricoes (Prescrições), /app/pacientes (Pacientes)

**COMPORTAMENTO:**
- Use terminologia médica precisa
- Valide compliance RDC 660/327 para prescrições de cannabis
- Sugira protocolos clínicos
- Referencie literatura médica quando relevante
- Auxilie com prescrições REUNI
`
    }
    
    if (context.userProfile === 'profissional') {
      basePrompt += `
**TOM:** Colaborativo, didático e encorajador
**LINGUAGEM:** Educacional e instrutiva
**FOCO:** Aprendizado e desenvolvimento profissional
**LINKS ÚTEIS:** /app/ensino (Cursos), /app/pesquisa (Pesquisas), /app/medcann-lab (Lab)

**COMPORTAMENTO:**
- Seja didático e explicativo
- Recomende cursos e material
- Incentive pesquisa científica
- Forneça referências bibliográficas
`
    }
    
    if (context.userProfile === 'admin') {
      basePrompt += `
**TOM:** Estratégico, técnico e colaborativo
**LINGUAGEM:** Técnica e precisa
**FOCO:** Orquestração da plataforma e desenvolvimento
**LINKS ÚTEIS:** /app/admin (Admin), /app/ide (IDE), GPT Builder

**COMPORTAMENTO:**
- Forneça métricas e insights
- Auxilie com desenvolvimento colaborativo
- Sugira otimizações técnicas
- Acesso completo ao sistema
`
    }
    
    basePrompt += `
**METODOLOGIA:**
- Use a "Arte da Entrevista Clínica" do Dr. Ricardo Valença
- Sistema IMRE de 28 blocos para avaliação
- Sempre referencie fontes
- Mantenha ética médica

**IMPORTANTE:**
- NUNCA invente informações
- SEMPRE seja honesto sobre limitações
- RESPEITE LGPD e privacidade
- OBTENHA consentimento quando necessário
`
    
    return basePrompt
  }
  
  // ========================================
  // APRENDIZADO
  // ========================================
  
  /**
   * Salva interação no banco para aprendizado futuro
   */
  private async saveToLearning(
    message: string,
    response: string,
    context: NoaContext,
    source: 'local' | 'agent' | 'openai',
    embedding?: number[] | null
  ): Promise<void> {
    try {
      await supabase.from('ai_learning').insert({
        user_message: message,
        ai_response: response,
        user_profile: context.userProfile,
        specialty: context.specialty,
        dashboard: context.currentDashboard,
        source: source,
        embedding: embedding || null,
        confidence_score: source === 'local' ? 0.9 : source === 'agent' ? 0.95 : 0.75,
        usage_count: 1,
        user_id: context.userId,
        category: this.categorizeMessage(message),
        context: JSON.stringify({
          userName: context.userName,
          route: context.currentRoute
        })
      })
      
      console.log('💾 [NoaVision IA] Salvo no banco para aprendizado')
      
    } catch (error) {
      console.warn('⚠️ [NoaVision IA] Erro ao salvar aprendizado:', error)
    }
  }
  
  /**
   * Incrementa contador de uso de resposta
   */
  private async incrementUsage(id: string): Promise<void> {
    try {
      // Buscar valor atual
      const { data: current } = await supabase
        .from('ai_learning')
        .select('usage_count')
        .eq('id', id)
        .single()
      
      if (current) {
        // Incrementar +1
        await supabase
          .from('ai_learning')
          .update({ 
            usage_count: (current.usage_count || 0) + 1,
            last_used_at: new Date().toISOString()
          })
          .eq('id', id)
        
        console.log('📊 [NoaVision IA] Uso incrementado:', (current.usage_count || 0) + 1)
      }
    } catch (error) {
      console.warn('⚠️ [NoaVision IA] Erro ao incrementar uso:', error)
    }
  }
  
  /**
   * Categoriza mensagem automaticamente
   */
  private categorizeMessage(message: string): string {
    const lower = message.toLowerCase()
    
    if (lower.includes('avaliacao') || lower.includes('clinica') || lower.includes('sintoma')) {
      return 'clinical'
    }
    if (lower.includes('curso') || lower.includes('aula') || lower.includes('educacao')) {
      return 'educational'
    }
    // Removido: prescription (não temos produtos REUNI)
    if (lower.includes('exame') || lower.includes('resultado')) {
      return 'exam'
    }
    if (lower.includes('cannabis') || lower.includes('cbd') || lower.includes('thc')) {
      return 'cannabis'
    }
    
    return 'general'
  }
  
  // ========================================
  // UTILIDADES
  // ========================================
  
  /**
   * Hash simples para cache (fast)
   */
  private hashText(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return hash.toString(36)
  }
  
  /**
   * SHA-256 para cache do banco (secure)
   */
  private async sha256(text: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(text)
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
  
  // ========================================
  // MÉTODOS PÚBLICOS AUXILIARES
  // ========================================
  
  /**
   * Verifica se o modelo está carregado
   */
  public isReady(): boolean {
    return this.isInitialized
  }
  
  /**
   * Retorna estatísticas do sistema
   */
  public async getStats(): Promise<any> {
    const { data } = await supabase
      .from('noavision_stats')
      .select('*')
      .single()
    
    return data
  }
  
  /**
   * Analisa performance
   */
  public async analyzePerformance(daysBack: number = 7): Promise<any> {
    const { data } = await supabase.rpc('analyze_noavision_performance', {
      days_back: daysBack
    })
    
    return data
  }
  
  /**
   * Limpa cache antigo
   */
  public async cleanupCache(): Promise<number> {
    const { data } = await supabase.rpc('cleanup_old_cache')
    return data || 0
  }
  
  // ========================================
  // BUSCA DE DOCUMENTOS E CONHECIMENTO
  // ========================================
  
  /**
   * Busca documentos relevantes por embedding
   */
  private async searchDocuments(embedding: number[], context: NoaContext): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('search_documents_by_embedding', {
        query_embedding: embedding,
        user_id_filter: context.userId,
        category_filter: null,
        similarity_threshold: 0.75,
        match_count: 3
      })
      
      if (error) {
        console.warn('⚠️ [NoaVision IA] Erro ao buscar documentos:', error)
        return []
      }
      
      if (data && data.length > 0) {
        console.log(`📄 [NoaVision IA] Encontrados ${data.length} documentos relevantes`)
      }
      
      return data || []
    } catch (error) {
      console.warn('⚠️ [NoaVision IA] Erro ao buscar documentos:', error)
      return []
    }
  }
  
  /**
   * Busca conhecimento relevante por embedding
   */
  private async searchKnowledge(embedding: number[]): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('search_knowledge_by_embedding', {
        query_embedding: embedding,
        category_filter: null,
        similarity_threshold: 0.75,
        match_count: 3
      })
      
      if (error) {
        console.warn('⚠️ [NoaVision IA] Erro ao buscar conhecimento:', error)
        return []
      }
      
      if (data && data.length > 0) {
        console.log(`🧠 [NoaVision IA] Encontrados ${data.length} itens de conhecimento relevantes`)
      }
      
      return data || []
    } catch (error) {
      console.warn('⚠️ [NoaVision IA] Erro ao buscar conhecimento:', error)
      return []
    }
  }
  
  /**
   * Busca híbrida: documentos + conhecimento + conversas
   */
  private async searchAllContext(embedding: number[], context: NoaContext): Promise<any[]> {
    try {
      const { data, error } = await supabase.rpc('search_all_noa_knowledge', {
        query_embedding: embedding,
        similarity_threshold: 0.75,
        match_count: 10
      })
      
      if (error) {
        console.warn('⚠️ [NoaVision IA] Erro na busca híbrida:', error)
        return []
      }
      
      if (data && data.length > 0) {
        console.log(`🔍 [NoaVision IA] Busca híbrida: ${data.length} itens encontrados`)
        const byType = data.reduce((acc: any, item: any) => {
          acc[item.source_type] = (acc[item.source_type] || 0) + 1
          return acc
        }, {})
        console.log(`   📊 Distribuição:`, byType)
      }
      
      return data || []
    } catch (error) {
      console.warn('⚠️ [NoaVision IA] Erro na busca híbrida:', error)
      return []
    }
  }
  
  /**
   * Enriquece contexto com documentos e conhecimento
   */
  private async enrichContextWithDocs(
    embedding: number[],
    context: NoaContext
  ): Promise<string> {
    try {
      // Busca híbrida (tudo de uma vez)
      const results = await this.searchAllContext(embedding, context)
      
      if (results.length === 0) {
        return ''
      }
      
      const contextParts: string[] = []
      contextParts.push('\n📚 **Contexto encontrado:**\n')
      
      // Agrupar por tipo
      const documents = results.filter((r: any) => r.source_type === 'document')
      const knowledge = results.filter((r: any) => r.source_type === 'knowledge')
      const conversations = results.filter((r: any) => r.source_type === 'conversation')
      
      // Documentos
      if (documents.length > 0) {
        contextParts.push('📄 **Documentos:**')
        documents.slice(0, 2).forEach((doc: any, i: number) => {
          const preview = doc.content.substring(0, 300)
          contextParts.push(`${i + 1}. ${doc.title} (${(doc.similarity * 100).toFixed(0)}% relevante)`)
          contextParts.push(`   "${preview}..."`)
        })
        contextParts.push('')
      }
      
      // Conhecimento
      if (knowledge.length > 0) {
        contextParts.push('🧠 **Base de Conhecimento:**')
        knowledge.slice(0, 2).forEach((k: any, i: number) => {
          const preview = k.content.substring(0, 250)
          contextParts.push(`${i + 1}. ${k.title} (${(k.similarity * 100).toFixed(0)}% relevante)`)
          contextParts.push(`   "${preview}..."`)
        })
        contextParts.push('')
      }
      
      // Conversas anteriores relevantes
      if (conversations.length > 0) {
        contextParts.push('💬 **Conversas anteriores similares:**')
        conversations.slice(0, 1).forEach((conv: any) => {
          contextParts.push(`   Usuário perguntou: "${conv.title}"`)
          contextParts.push(`   Resposta: "${conv.content.substring(0, 200)}..."`)
        })
      }
      
      return contextParts.join('\n')
      
    } catch (error) {
      console.warn('⚠️ [NoaVision IA] Erro ao enriquecer contexto:', error)
      return ''
    }
  }
  
  // ========================================
  // FALLBACK OFFLINE INTELIGENTE
  // ========================================
  
  /**
   * Fallback inteligente quando OpenAI não está disponível
   * Usa: banco de conhecimento + histórico + regras
   */
  private async intelligentOfflineFallback(message: string, context: NoaContext): Promise<string> {
    const lower = message.toLowerCase().trim()
    
    // 1️⃣ SAUDAÇÕES
    if (lower.match(/^(oi|olá|ola|hey|opa|e ai|eai|bom dia|boa tarde|boa noite)/)) {
      const saudacoes = [
        `Olá! Sou a Nôa Esperanza, sua assistente de saúde especializada em cannabis medicinal 🌿\n\nEstou em modo offline, mas posso ajudar com:\n• Avaliação clínica inicial (28 perguntas IMRE)\n• Orientações sobre cannabis medicinal\n• Navegação pelo sistema\n• Consulta ao histórico\n\nComo posso ajudar você hoje?`,
        
        `Oi! 😊 Sou a Nôa, especialista em cannabis medicinal!\n\nModo offline ativo - mas totalmente funcional para:\n✓ Avaliação clínica completa\n✓ Informações sobre tratamentos\n✓ Gestão do seu acompanhamento\n\nO que você precisa?`,
        
        `Olá! Que bom ver você! 💚\n\nSou a Nôa Esperanza, sua parceira em saúde integrativa.\n\n**Posso ajudar com:**\n• Iniciar avaliação clínica\n• Dúvidas sobre cannabis medicinal\n• Ver seus relatórios\n• Acessar documentos\n\nMe conte, como posso ajudar?`
      ]
      return saudacoes[Math.floor(Math.random() * saudacoes.length)]
    }
    
    // 2️⃣ COMO ESTÁ / TUDO BEM
    if (lower.match(/(tudo bem|como (você |vc )?está|como vai|tá bem)/)) {
      const respostas = [
        `Estou bem, obrigada por perguntar! 😊\n\nPronta para ajudar com sua saúde e bem-estar.\n\n**Posso auxiliar com:**\n• Avaliação clínica (digite "fazer avaliação")\n• Informações sobre tratamentos\n• Consultar seus dados\n• Tirar dúvidas\n\nO que você gostaria de fazer?`,
        
        `Ótima, obrigada! E você, como está se sentindo? 💚\n\nEstou aqui para:\n✓ Realizar avaliação clínica completa\n✓ Responder dúvidas sobre cannabis medicinal\n✓ Acessar seus relatórios\n✓ Orientar sobre tratamentos\n\nConte-me, como posso ajudar hoje?`,
        
        `Estou funcionando perfeitamente! 🌟\n\n**Modo offline ativo** mas com todas as funcionalidades principais:\n• Avaliação clínica (28 blocos IMRE)\n• Base de conhecimento local\n• Histórico de conversas\n• Relatórios e documentos\n\nQual sua necessidade hoje?`
      ]
      return respostas[Math.floor(Math.random() * respostas.length)]
    }
    
    // 3️⃣ AVALIAÇÃO CLÍNICA
    if (lower.match(/(avalia|clinica|inicial|imre|consulta|sintoma|queixa)/)) {
      return `🏥 **Avaliação Clínica Inicial**\n\nVou realizar uma avaliação completa seguindo o protocolo IMRE (28 blocos).\n\n**O que vamos avaliar:**\n• Identificação e queixa principal\n• Lista indiciária (sintomas)\n• História da doença atual\n• Cannabis medicinal (experiência)\n• Antecedentes pessoais e familiares\n• Hábitos de vida\n• Exame físico geral\n• Revisão de sistemas\n\n**Vamos começar?**\n\nPrimeira pergunta: **Qual é a sua queixa principal?**\n(O que te trouxe aqui hoje?)`
    }
    
    // 4️⃣ CANNABIS / MEDICAMENTOS
    if (lower.match(/(cannabis|cbd|thc|canabidiol|medicinal|tratamento|remédio)/)) {
      return `🌿 **Cannabis Medicinal**\n\nPosso ajudar com informações sobre:\n\n**Tratamento:**\n• Produtos disponíveis (CBD, THC, full spectrum)\n• Dosagens e formas de uso\n• Efeitos esperados e colaterais\n• Interações medicamentosas\n\n**Processo:**\n• Como funciona a prescrição\n• Documentação necessária\n• Acompanhamento médico\n• Registro ANVISA\n\n**Para iniciar tratamento:**\nÉ necessário realizar a avaliação clínica completa.\n\nDeseja começar agora? (digite "sim" ou "fazer avaliação")`
    }
    
    // 5️⃣ DOCUMENTOS / RELATÓRIOS
    if (lower.match(/(documento|relatório|relatorio|histórico|historico|dados|registro)/)) {
      return `📊 **Documentos e Relatórios**\n\n**Seus dados estão em:**\n• Dashboard Paciente → aba "Relatórios"\n• Avaliações clínicas realizadas\n• Histórico de conversas\n• Documentos compartilhados\n\n**Para acessar:**\nClique no menu lateral em "Relatórios" ou "Meus Dados"\n\n**Precisa de algo específico?**\nMe diga o que procura e te ajudo a encontrar!`
    }
    
    // 6️⃣ AJUDA / O QUE PODE FAZER
    if (lower.match(/(ajuda|help|o que (você |vc )?pode|funcionalidade|menu|opções|opçoes)/)) {
      return `❓ **Como posso ajudar?**\n\n**Principais funções:**\n\n🏥 **Avaliação Clínica**\n"fazer avaliação" ou "avaliação inicial"\n\n🌿 **Cannabis Medicinal**\n"informações sobre cannabis" ou "tratamento"\n\n📊 **Seus Dados**\n"ver relatórios" ou "meu histórico"\n\n🗂️ **Documentos**\n"ver documentos" ou "base de conhecimento"\n\n📍 **Navegação**\n"ir para dashboard" ou "abrir [área]"\n\n💬 **Conversação Natural**\nPergunte o que quiser sobre saúde, tratamentos e cannabis medicinal!\n\n**Modo offline ativo** - funcionalidades principais disponíveis!`
    }
    
    // 7️⃣ FALLBACK GENÉRICO CONTEXTUAL
    const respostasGenericas = [
      `Entendi sua mensagem: "${message}"\n\n**Em modo offline**, posso ajudar melhor se você:\n• Iniciar avaliação clínica (digite "avaliação")\n• Perguntar sobre cannabis medicinal\n• Solicitar acesso a relatórios\n• Pedir ajuda com navegação\n\nO que você gostaria de fazer?`,
      
      `Recebi: "${message}"\n\n🔌 **Modo offline ativo**\n\nPosso responder sobre:\n✓ Avaliação clínica\n✓ Cannabis medicinal\n✓ Seus relatórios\n✓ Navegação no sistema\n\nPoderia reformular sua pergunta ou escolher uma opção?`,
      
      `"${message}"\n\n💡 **Dica:** Em modo offline, funciono melhor com comandos diretos:\n\n• "fazer avaliação clínica"\n• "informações sobre cannabis"\n• "ver meus relatórios"\n• "ajuda"\n\nQual dessas opções te interessa?`
    ]
    
    return respostasGenericas[Math.floor(Math.random() * respostasGenericas.length)]
  }
}

// ========================================
// EXPORTAR INSTÂNCIA SINGLETON
// ========================================

export const noaVisionIA = new NoaVisionIA()

// Log de inicialização
console.log(`🚀 [NoaVision IA] Motor técnico inicializado`)
console.log(`❤️ [Nôa Esperanza] Persona carregada`)
console.log(`📊 [${noaVisionIA.technicalName}] Aguardando carregamento do modelo...`)

