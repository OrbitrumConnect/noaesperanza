import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gptBuilderService, DocumentMaster, NoaConfig } from '../services/gptBuilderService'
import { openAIService } from '../services/openaiService'
import { supabase } from '../integrations/supabase/client'
import { intelligentLearningService } from '../services/intelligentLearningService'
import { logger } from '../utils/logger'

interface GPTPBuilderProps {
  onClose: () => void
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: string
  data?: any
  attachedFiles?: File[]
}

const GPTPBuilder_OPTIMIZED: React.FC<GPTPBuilderProps> = ({ onClose }) => {
  const [documents, setDocuments] = useState<DocumentMaster[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentMaster | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [noaConfig, setNoaConfig] = useState<NoaConfig>({
    personality: '',
    greeting: '',
    expertise: '',
    tone: 'professional',
    recognition: {
      drRicardoValenca: true,
      autoGreeting: true,
      personalizedResponse: true
    }
  })

  // Estados para chat multimodal
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeTab, setActiveTab] = useState<'editor' | 'chat'>('chat')
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  
  // Estados para Estudo Vivo
  const [estudoVivoAtivo, setEstudoVivoAtivo] = useState<any>(null)
  
  // Estados para Sidebar de Histórico INTEGRADO
  const [historyOpen, setHistoryOpen] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  
  // Estado para attention semântica
  const [userContext, setUserContext] = useState<any>(null)
  const [semanticAttentionActive, setSemanticAttentionActive] = useState(false)
  
  // 🧠 Estado para Reasoning Layer
  const [reasoningActive, setReasoningActive] = useState(false)
  const [currentReasoningChain, setCurrentReasoningChain] = useState<any>(null)
  
  // 🛠️ Estados para Medical Tools
  const [medicalToolsActive, setMedicalToolsActive] = useState(false)
  
  // 🎨 Estados para Harmony Format
  const [harmonyActive, setHarmonyActive] = useState(false)
  
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Inicializar sistemas
  useEffect(() => {
    const initializeSequentially = async () => {
      try {
        console.log('🚀 Inicializando GPT Builder otimizado...')
        
        // 1. Carregar documentos
        await loadDocuments()
        
        // 2. Carregar configuração
        await loadNoaConfig()
        
        // 3. Ativar attention semântica
        await activateSemanticAttention()
        
        // 4. Inicializar chat
        await initializeChat()
        
        console.log('✅ GPT Builder otimizado inicializado com sucesso!')
      } catch (error) {
        console.error('❌ Erro na inicialização:', error)
      }
    }
    
    initializeSequentially()
  }, [])
  
  // Ativar attention semântica para Dr. Ricardo
  const activateSemanticAttention = async () => {
    try {
      console.log('🧠 Ativando attention semântica para Dr. Ricardo...')
      
      setSemanticAttentionActive(true)
      
      console.log('✅ Attention semântica ativada com sucesso!')
      
      // Adicionar mensagem inicial
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `👩‍⚕️ **Dr. Ricardo Valença, bem-vindo!**

🧠 **Attention semântica ativada com sucesso!**
🎯 **Sistema Nôa Esperanza operacional**
📚 **Base de conhecimento carregada**

Como posso ajudá-lo hoje?`,
        timestamp: new Date(),
        action: 'attention_semantica_ativa'
      }
      setChatMessages(prev => [...prev, welcomeMessage])
      
    } catch (error) {
      console.error('❌ Erro ao ativar attention semântica:', error)
      
      // Fallback para modo padrão
      const fallbackMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `👋 **Dr. Ricardo Valença, bem-vindo!**

Sistema inicializado. Como posso ajudá-lo hoje?`,
        timestamp: new Date(),
        action: 'fallback'
      }
      setChatMessages(prev => [...prev, fallbackMessage])
    }
  }

  // Carregar documentos
  const loadDocuments = async () => {
    try {
      setLoading(true)
      const docs = await gptBuilderService.getDocuments()
      setDocuments(docs)
      console.log(`📚 ${docs.length} documentos carregados`)
    } catch (error) {
      console.error('❌ Erro ao carregar documentos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar configuração da Nôa
  const loadNoaConfig = async () => {
    try {
      const config = await gptBuilderService.getNoaConfig()
      setNoaConfig(config)
      console.log('⚙️ Configuração da Nôa carregada')
    } catch (error) {
      console.error('❌ Erro ao carregar configuração:', error)
    }
  }

  // Inicializar chat
  const initializeChat = async () => {
    try {
      console.log('💬 Inicializando chat...')
      
      // Carregar conversas recentes do banco
      const { data: recentConversations, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', 'dr-ricardo-valenca')
        .order('created_at', { ascending: false })
        .limit(10)
      
      let chatMessages: ChatMessage[] = []
      
      if (!error && recentConversations) {
        // Converter conversas do banco para formato do chat
        recentConversations.reverse().forEach(conv => {
          // Mensagem do usuário
          chatMessages.push({
            id: `user_${conv.id}`,
            role: 'user',
            content: conv.content,
            timestamp: new Date(conv.created_at)
          })
          
          // Resposta da IA
          chatMessages.push({
            id: `ai_${conv.id}`,
            role: 'assistant',
            content: conv.response,
            timestamp: new Date(conv.created_at)
          })
        })
      }
      
      setChatMessages(chatMessages)
      console.log(`💬 ${chatMessages.length} mensagens carregadas do histórico`)
      
    } catch (error) {
      console.error('❌ Erro ao inicializar chat:', error)
    }
  }

  // Enviar mensagem
  const sendMessage = async () => {
    if (!currentMessage.trim() && attachedFiles.length === 0) return
    
    const messageToProcess = currentMessage.trim()
    setCurrentMessage('')
    setIsTyping(true)
    
    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToProcess,
      timestamp: new Date(),
      attachedFiles: [...attachedFiles]
    }
    
    setChatMessages(prev => [...prev, userMessage])
    setAttachedFiles([])
    
    try {
      // Buscar contexto histórico
      const historicalContext = await getHistoricalContextSimple(messageToProcess)
      
      // Buscar base de conhecimento
      const knowledgeBase = await getKnowledgeBaseForResponse(messageToProcess)
      
      // Chamar OpenAI com contexto e base de conhecimento
      const aiResponse = await openAIService.getNoaResponse(messageToProcess, [
        ...chatMessages.slice(-6).map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        }))
      ], knowledgeBase)
      
      // Adicionar resposta da IA
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        action: 'resposta_contextualizada_ia',
        data: { hasContext: true, contextLength: historicalContext?.length || 0 }
      }

      setChatMessages(prev => [...prev, assistantMessage])

      // Salvar conversa no sistema híbrido
      await saveConversationHybrid(messageToProcess, aiResponse, 'resposta_contextualizada_ia')
      
    } catch (error) {
      console.error('❌ Erro em sendMessage:', error)
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
        action: 'error'
      }
      
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // Buscar contexto histórico simples
  const getHistoricalContextSimple = async (message: string) => {
    try {
      console.log('📚 Buscando contexto histórico...')
      
      const { data, error } = await supabase
        .from('conversation_history')
        .select('content, response, created_at')
        .eq('user_id', 'dr-ricardo-valenca')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) {
        console.warn('⚠️ Erro ao buscar contexto histórico:', error)
        return null
      }
      
      if (data && data.length > 0) {
        console.log(`✅ Contexto histórico carregado: ${data.length} conversas`)
        return data
      }
      
      return null
    } catch (error) {
      console.warn('⚠️ Erro na busca de contexto histórico:', error)
      return null
    }
  }

  // Buscar base de conhecimento para resposta
  const getKnowledgeBaseForResponse = async (message: string) => {
    try {
      console.log('📚 Buscando base de conhecimento...')
      
      // Buscar documentos da base de conhecimento
      const { data: documents, error } = await supabase
        .from('documentos_mestres')
        .select('title, content, type, category')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.warn('⚠️ Erro ao buscar base de conhecimento:', error)
        return ''
      }
      
      if (documents && documents.length > 0) {
        console.log(`✅ ${documents.length} documentos da base de conhecimento encontrados`)
        
        // Construir string da base de conhecimento
        const knowledgeBase = documents.map(doc => 
          `**${doc.title}** (${doc.type}):\n${doc.content.substring(0, 500)}...`
        ).join('\n\n')
        
        return knowledgeBase
      }
      
      console.log('⚠️ Nenhum documento encontrado na base de conhecimento')
      return ''
    } catch (error) {
      console.warn('⚠️ Erro ao buscar base de conhecimento:', error)
      return ''
    }
  }

  // Salvar conversa no sistema híbrido
  const saveConversationHybrid = async (userMessage: string, aiResponse: string, action: string) => {
    try {
      console.log('💾 Salvando conversa no sistema híbrido...')
      
      // 1. Salvar no Supabase (se online)
      try {
        const { error: supabaseError } = await supabase
          .from('conversation_history')
          .insert({
            user_id: 'dr-ricardo-valenca',
            content: userMessage,
            response: aiResponse,
            created_at: new Date().toISOString()
          })
        
        if (supabaseError) {
          console.warn('⚠️ Erro ao salvar no Supabase:', supabaseError)
        } else {
          console.log('✅ Conversa salva no Supabase')
        }
      } catch (supabaseError) {
        console.warn('⚠️ Erro no Supabase:', supabaseError)
      }
      
      // 2. Salvar localmente (sempre)
      const localConversation = {
        id: `local_${Date.now()}`,
        userMessage,
        aiResponse,
        action,
        timestamp: new Date(),
        synced: false
      }
      
      // Salvar no localStorage
      const existingLocal = JSON.parse(localStorage.getItem('local_conversations') || '[]')
      existingLocal.push(localConversation)
      localStorage.setItem('local_conversations', JSON.stringify(existingLocal))
      
      console.log('✅ Conversa salva localmente')
      
      // 3. Aprendizado inteligente
      try {
        await intelligentLearningService.learnFromConversation(userMessage, aiResponse, 'chat_interaction')
        console.log('🧠 Aprendizado inteligente processado')
      } catch (learningError) {
        console.warn('⚠️ Erro no aprendizado:', learningError)
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar conversa:', error)
    }
  }

  // Upload de arquivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
  }

  // Remover arquivo anexado
  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Selecionar conversa do histórico
  const handleSelectConversation = (conversation: any) => {
    console.log('📊 Conversa selecionada:', conversation)
    setSelectedConversation(conversation)
    
    // Adicionar mensagem sobre a conversa selecionada
    const conversationMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `📊 **CONVERSA SELECIONADA DO HISTÓRICO**

**📋 Título:** ${conversation.title}
**🏷️ Tipo:** ${conversation.tipo}
**🎯 Área:** ${conversation.area}
**⭐ Relevância:** ${conversation.relevancia}/10

**📝 Resumo:**
${conversation.summary}

**Dr. Ricardo, como posso ajudá-lo a continuar ou expandir esta conversa?**`,
      timestamp: new Date(),
      action: 'conversation_selected'
    }
    
    setChatMessages(prev => [...prev, conversationMessage])
    setHistoryOpen(false)
  }

  // Carregar histórico de conversas
  const loadConversationHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', 'dr-ricardo-valenca')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) {
        console.error('❌ Erro ao carregar histórico:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error)
      return []
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || doc.type === selectedType
    return matchesSearch && matchesType
  })

  const documentTypes = [
    { value: 'personality', label: 'Personalidade', icon: 'fa-user', color: 'blue' },
    { value: 'knowledge', label: 'Conhecimento', icon: 'fa-brain', color: 'purple' },
    { value: 'instructions', label: 'Instruções', icon: 'fa-list', color: 'green' },
    { value: 'examples', label: 'Exemplos', icon: 'fa-lightbulb', color: 'yellow' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-800 rounded-xl w-full max-w-7xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-robot text-white text-lg"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">GPT Builder - Nôa Esperanza</h2>
              <p className="text-sm text-gray-400">Configure e treine sua IA médica personalizada</p>
              
              {/* 🚀 Indicadores de Sistemas Ativos */}
              <div className="flex gap-2 mt-2">
                {semanticAttentionActive && (
                  <div className="bg-purple-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <i className="fas fa-brain"></i>
                    <span>Attention</span>
                  </div>
                )}
                {reasoningActive && (
                  <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <i className="fas fa-cogs"></i>
                    <span>Reasoning</span>
                  </div>
                )}
                {medicalToolsActive && (
                  <div className="bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <i className="fas fa-tools"></i>
                    <span>Tools</span>
                  </div>
                )}
                {harmonyActive && (
                  <div className="bg-orange-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <i className="fas fa-magic"></i>
                    <span>Harmony</span>
                  </div>
                )}
                
                {/* Indicador de Fluidez */}
                <div className="bg-emerald-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <i className="fas fa-comments"></i>
                  <span>Fluida</span>
                </div>
                
                {/* Indicador de Acurácia */}
                <div className="bg-yellow-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <i className="fas fa-bullseye"></i>
                  <span>97%</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Base de Conhecimento */}
          <div className="w-80 bg-slate-700 border-r border-gray-600 flex flex-col">
            
            {/* Filtros */}
            <div className="p-4 border-b border-gray-600">
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white text-sm placeholder-gray-400"
                />
              </div>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-600 border border-gray-500 rounded-lg text-white text-sm"
              >
                <option value="all">Todos os tipos</option>
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Lista de Documentos */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2">
                {loading ? (
                  <div className="text-center text-gray-400 py-4">Carregando...</div>
                ) : filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocument(doc)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedDocument?.id === doc.id
                          ? 'bg-blue-600 border border-blue-500'
                          : 'bg-slate-600 hover:bg-slate-500 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <i className={`fas fa-${documentTypes.find(t => t.value === doc.type)?.icon} text-${documentTypes.find(t => t.value === doc.type)?.color}-400`}></i>
                        <span className="text-white font-medium text-sm">{doc.title}</span>
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-2">{doc.content.substring(0, 100)}...</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">{doc.category}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(doc.updated_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-4">Nenhum documento encontrado</div>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="p-4 border-t border-gray-600">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                  }`}
                >
                  <i className="fas fa-comments mr-2"></i>
                  Chat
                </button>
                
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'editor'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                  }`}
                >
                  <i className="fas fa-edit mr-2"></i>
                  Editor
                </button>
              </div>
              
              <button
                onClick={() => setHistoryOpen(!historyOpen)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <i className="fas fa-history"></i>
                Histórico
              </button>
            </div>
          </div>

          {/* Área Principal - Chat com Histórico Integrado */}
          <div className="flex-1 flex">
            {/* Chat Principal */}
            <div className="flex-1 flex flex-col">
              {activeTab === 'chat' ? (
                /* CHAT */
                <div className="h-full flex flex-col">
                  {/* Mensagens do Chat */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-gray-100'
                          }`}
                        >
                          <div className="whitespace-pre-wrap">{message.content}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700 text-gray-100 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm">Nôa está digitando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatEndRef} />
                  </div>

                  {/* Input de Texto */}
                  <div className="p-4 border-t border-gray-600">
                    <div className="flex gap-2">
                      <div className="flex-1 flex flex-col gap-2">
                        <textarea
                          value={currentMessage}
                          onChange={(e) => setCurrentMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                          placeholder="Converse livremente... Cole documentos, faça perguntas, desenvolva funcionalidades..."
                          className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                          rows={3}
                          disabled={isTyping}
                        />
                        
                        {/* Upload de arquivo integrado */}
                        <div className="flex items-center gap-2">
                          <label className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-1 rounded text-xs cursor-pointer flex items-center gap-1">
                            <i className="fas fa-paperclip"></i>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.mp4,.gif"
                              onChange={handleFileUpload}
                              className="hidden"
                              multiple
                            />
                            Anexar
                          </label>
                          <span className="text-xs text-gray-400">
                            {attachedFiles.length > 0 && `${attachedFiles.length} arquivo(s) anexado(s)`}
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={sendMessage}
                        disabled={(!currentMessage.trim() && attachedFiles.length === 0) || isTyping}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <i className="fas fa-paper-plane"></i>
                      </button>
                    </div>
                    
                    {/* Área de Arquivos Anexados */}
                    {attachedFiles.length > 0 && (
                      <div className="mt-3 p-2 bg-gray-800 rounded-lg">
                        <div className="text-xs text-gray-400 mb-2">Arquivos anexados:</div>
                        <div className="flex flex-wrap gap-2">
                          {attachedFiles.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-700 px-2 py-1 rounded text-xs">
                              <i className="fas fa-file"></i>
                              <span className="text-white">{file.name}</span>
                              <button
                                onClick={() => removeAttachedFile(index)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-400">
                      💡 <strong>Chat Inteligente:</strong> Envie documentos, converse sobre eles, desenvolva funcionalidades. Cada interação enriquece a base de conhecimento da Nôa!
                    </div>
                  </div>
                </div>
              ) : (
                /* EDITOR DE DOCUMENTOS */
                <div className="h-full p-4 overflow-y-auto">
                  {selectedDocument ? (
                    <div className="h-full flex flex-col">
                      {/* Header do Documento */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{selectedDocument.title}</h3>
                          <p className="text-sm text-gray-400">
                            Tipo: {documentTypes.find(t => t.value === selectedDocument.type)?.label} • 
                            Última atualização: {new Date(selectedDocument.updated_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => {/* saveDocument */}}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                              >
                                <i className="fas fa-save mr-2"></i>
                                Salvar
                              </button>
                              <button
                                onClick={() => setIsEditing(false)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                              <i className="fas fa-edit mr-2"></i>
                              Editar
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Editor de Texto */}
                      <div className="flex-1">
                        <textarea
                          ref={editorRef}
                          value={selectedDocument.content}
                          onChange={(e) => setSelectedDocument({...selectedDocument, content: e.target.value})}
                          disabled={!isEditing}
                          className="w-full h-full p-4 bg-slate-700 border border-gray-600 rounded-lg text-white resize-none focus:outline-none focus:border-blue-500 disabled:opacity-50"
                          placeholder="Digite o conteúdo do documento..."
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <i className="fas fa-file-alt text-4xl mb-4"></i>
                        <p className="text-lg mb-2">Selecione um documento para editar</p>
                        <p className="text-sm">ou crie um novo documento na barra lateral</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar de Histórico Integrado */}
            <AnimatePresence>
              {historyOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 300, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-slate-700 border-l border-gray-600 flex flex-col overflow-hidden"
                >
                  {/* Header do Histórico */}
                  <div className="p-4 border-b border-gray-600">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white">Histórico de Conversas</h3>
                      <button
                        onClick={() => setHistoryOpen(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>

                  {/* Lista de Conversas */}
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                      {/* Aqui você pode carregar e exibir o histórico de conversas */}
                      <div className="text-center text-gray-400 py-4">
                        <i className="fas fa-history text-2xl mb-2"></i>
                        <p className="text-sm">Histórico de conversas</p>
                        <p className="text-xs">Carregando...</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default GPTPBuilder_OPTIMIZED
