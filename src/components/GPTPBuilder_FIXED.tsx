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

const GPTPBuilder_FIXED: React.FC<GPTPBuilderProps> = ({ onClose }) => {
  const [documents, setDocuments] = useState<DocumentMaster[]>([])
  const [selectedDocument, setSelectedDocument] = useState<DocumentMaster | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [newDocument, setNewDocument] = useState<Partial<DocumentMaster>>({
    title: '',
    content: '',
    type: 'personality',
    category: '',
    is_active: true
  })

  // Estados para configurações da Nôa
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

  const editorRef = useRef<HTMLTextAreaElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  // Carregar documentos mestres
  useEffect(() => {
    const initializeSequentially = async () => {
      try {
        console.log('🚀 Inicializando GPT Builder...')
        
        // 1. Carregar documentos mestres
        console.log('📚 Carregando documentos mestres...')
        const docs = await gptBuilderService.getDocuments()
        setDocuments(docs)
        console.log(`✅ ${docs.length} documentos carregados`)
        
        // 2. Carregar configuração da Nôa
        console.log('⚙️ Carregando configuração da Nôa...')
        const config = await gptBuilderService.getNoaConfig()
        if (config) {
          setNoaConfig(config)
          console.log('✅ Configuração da Nôa carregada')
        }
        
        // 3. Inicializar chat
        console.log('💬 Inicializando chat...')
        await initializeChat()
        
        console.log('🎉 GPT Builder inicializado com sucesso!')
        
      } catch (error) {
        console.error('❌ Erro na inicialização:', error)
        logger.error('Erro na inicialização do GPT Builder', error)
      }
    }

    initializeSequentially()
  }, [])

  // Inicializar chat com mensagem de boas-vindas
  const initializeChat = async () => {
    try {
      // Carregar conversas recentes do banco
      const { data: recentConversations, error } = await supabase
        .from('conversation_history')
        .select('*')
        .eq('user_id', 'dr-ricardo-valenca')
        .order('created_at', { ascending: false })
        .limit(5)
      
      let chatMessages: ChatMessage[] = []
      
      if (!error && recentConversations) {
        // Converter conversas do banco para formato do chat
        recentConversations.reverse().forEach(conv => {
          // Mensagem do usuário
          chatMessages.push({
            id: `${conv.id}_user`,
            role: 'user',
            content: conv.content,
            timestamp: new Date(conv.created_at)
          })
          
          // Resposta da IA
          chatMessages.push({
            id: `${conv.id}_assistant`,
            role: 'assistant',
            content: conv.response,
            timestamp: new Date(conv.created_at)
          })
        })
        
        console.log(`✅ Carregadas ${recentConversations.length} conversas do banco`)
      }
      
      // Adicionar mensagem de boas-vindas se não há conversas
      if (chatMessages.length === 0) {
        const welcomeMessage: ChatMessage = {
          id: 'welcome',
          role: 'assistant',
          content: `👋 **Olá Dr. Ricardo Valença!**

Bem-vindo ao **GPT Builder** da Nôa Esperanza! 

Aqui você pode:
• 📚 Gerenciar a base de conhecimento
• 💬 Conversar com a Nôa
• 📄 Analisar documentos
• 🧠 Treinar e evoluir a IA

**Como posso ajudar você hoje?**`,
          timestamp: new Date()
        }
        chatMessages.push(welcomeMessage)
      }
      
      setChatMessages(chatMessages)
      
    } catch (error) {
      console.error('❌ Erro ao inicializar chat:', error)
      // Mensagem de erro
      const errorMessage: ChatMessage = {
        id: 'error',
        role: 'assistant',
        content: '❌ Erro ao carregar histórico de conversas. Chat inicializado em modo básico.',
        timestamp: new Date()
      }
      setChatMessages([errorMessage])
    }
  }

  // Função principal de envio de mensagem
  const sendMessage = async () => {
    if (!currentMessage.trim() && attachedFiles.length === 0) return

    console.log('🚀 Enviando mensagem:', currentMessage)
    
    const messageToProcess = currentMessage.trim()
    setCurrentMessage('')
    setIsTyping(true)

    // Adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageToProcess,
      timestamp: new Date(),
      attachedFiles: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    }
    
    setChatMessages(prev => [...prev, userMessage])

    try {
      // Processar arquivos anexados se houver
      if (attachedFiles.length > 0) {
        await processAttachedFiles()
        setAttachedFiles([])
      }

      // Buscar contexto relevante
      const context = await getRelevantContext(messageToProcess)
      
      // Gerar resposta da IA
      const aiResponse = await generateAIResponse(messageToProcess, context)
      
      // Adicionar resposta da IA
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      }
      
      setChatMessages(prev => [...prev, assistantMessage])
      
      // Salvar conversa no banco
      await saveConversationToDatabase(messageToProcess, aiResponse)
      
      // Aprender com a interação
      await intelligentLearningService.learnFromConversation(
        messageToProcess, 
        aiResponse, 
        { 
          context: context,
          timestamp: new Date(),
          source: 'gpt_builder'
        }
      )
      
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Erro ao processar mensagem: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  // Processar arquivos anexados
  const processAttachedFiles = async () => {
    for (const file of attachedFiles) {
      try {
        let content = ''
        
        if (file.type === 'text/plain') {
          content = await file.text()
        } else if (file.type === 'application/pdf') {
          content = `[Conteúdo PDF: ${file.name}]`
        } else if (file.type.includes('image/')) {
          content = `[Imagem: ${file.name}]`
        }
        
        // Adicionar mensagem do arquivo
        const fileMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'user',
          content: `📎 **Arquivo anexado: ${file.name}**\n\n${content}`,
          timestamp: new Date(),
          attachedFiles: [file]
        }
        
        setChatMessages(prev => [...prev, fileMessage])
        
        // Analisar conteúdo
        const analysis = await analyzeDocumentContent(content, file.name)
        
        const analysisMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `📊 **Análise do documento "${file.name}":**\n\n${analysis}`,
          timestamp: new Date()
        }
        
        setChatMessages(prev => [...prev, analysisMessage])
        
      } catch (error) {
        console.error('Erro ao processar arquivo:', error)
      }
    }
  }

  // Buscar contexto relevante
  const getRelevantContext = async (message: string) => {
    try {
      // Buscar documentos relacionados
      const relatedDocs = await gptBuilderService.searchDocuments(message)
      
      // Buscar contexto de aprendizado
      const learningContext = await intelligentLearningService.getContextForBetterResponse(message)
      
      return {
        documents: relatedDocs,
        learning: learningContext
      }
    } catch (error) {
      console.error('Erro ao buscar contexto:', error)
      return { documents: [], learning: null }
    }
  }

  // Gerar resposta da IA
  const generateAIResponse = async (message: string, context: any) => {
    try {
      // Construir prompt contextualizado
      const systemPrompt = `Você é Nôa Esperanza, assistente médica especializada em neurologia, cannabis medicinal e nefrologia.

Você está conversando com Dr. Ricardo Valença no GPT Builder, onde pode:
- Gerenciar a base de conhecimento
- Analisar documentos médicos
- Desenvolver funcionalidades
- Treinar e evoluir a IA

Seja profissional, empática e focada em medicina baseada em evidências.`

      // Adicionar contexto se disponível
      let contextualMessage = message
      if (context.documents && context.documents.length > 0) {
        contextualMessage += `\n\nContexto relevante:\n${context.documents.map((doc: any) => `- ${doc.title}: ${doc.content.substring(0, 200)}...`).join('\n')}`
      }

      // Chamar OpenAI
      const response = await openAIService.getNoaResponse(contextualMessage, [
        ...chatMessages.slice(-6).map(msg => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        }))
      ])

      return response
      
    } catch (error) {
      console.error('Erro ao gerar resposta da IA:', error)
      return `Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.`
    }
  }

  // Analisar conteúdo de documento
  const analyzeDocumentContent = async (content: string, fileName: string): Promise<string> => {
    try {
      const wordCount = content.split(/\s+/).length
      const charCount = content.length
      
      // Detectar tipo de documento
      let documentType = 'Geral'
      let keyTopics: string[] = []
      
      if (content.toLowerCase().includes('cannabis') || content.toLowerCase().includes('cbd')) {
        documentType = 'Cannabis Medicinal'
        keyTopics.push('Cannabis', 'CBD', 'THC')
      }
      
      if (content.toLowerCase().includes('protocolo') || content.toLowerCase().includes('tratamento')) {
        documentType = 'Protocolo Médico'
        keyTopics.push('Protocolo', 'Tratamento')
      }
      
      if (content.toLowerCase().includes('caso') || content.toLowerCase().includes('paciente')) {
        documentType = 'Caso Clínico'
        keyTopics.push('Caso Clínico', 'Paciente')
      }
      
      return `**📄 Tipo de documento:** ${documentType}

**📊 Resumo do conteúdo:**
• ${wordCount.toLocaleString()} palavras
• ${charCount.toLocaleString()} caracteres

**🔍 Principais tópicos:**
${keyTopics.length > 0 ? keyTopics.map(topic => `• ${topic}`).join('\n') : '• Conteúdo geral'}

**💬 O que você gostaria de saber sobre este documento?**
• "Resuma os pontos principais"
• "Quais são as informações mais importantes?"
• "Compare com outros documentos similares"`
      
    } catch (error) {
      console.error('Erro na análise do documento:', error)
      return `**📄 Análise básica realizada com sucesso**
**⚠️ Análise detalhada:** Erro ao processar - ${error instanceof Error ? error.message : String(error)}`
    }
  }

  // Salvar conversa no banco de dados
  const saveConversationToDatabase = async (userMessage: string, aiResponse: string) => {
    try {
      const { error } = await supabase
        .from('conversation_history')
        .insert({
          user_id: 'dr-ricardo-valenca',
          content: userMessage,
          response: aiResponse,
          conversation_type: 'gpt_builder',
          is_first_response: false,
          created_at: new Date().toISOString()
        })

      if (error) {
        console.error('Erro ao salvar conversa:', error)
      } else {
        console.log('✅ Conversa salva no banco de dados')
      }
    } catch (error) {
      console.error('Erro ao salvar conversa:', error)
    }
  }

  // Gerenciar documentos
  const handleSaveDocument = async () => {
    if (!newDocument.title || !newDocument.content) return

    try {
      setLoading(true)
      const savedDoc = await gptBuilderService.createDocument(newDocument as DocumentMaster)
      setDocuments(prev => [...prev, savedDoc])
      setNewDocument({ title: '', content: '', type: 'personality', category: '', is_active: true })
      console.log('✅ Documento salvo com sucesso')
    } catch (error) {
      console.error('Erro ao salvar documento:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateDocument = async () => {
    if (!selectedDocument) return

    try {
      setLoading(true)
      const updatedDoc = await gptBuilderService.updateDocument(selectedDocument.id, selectedDocument)
      setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc))
      setSelectedDocument(null)
      setIsEditing(false)
      console.log('✅ Documento atualizado com sucesso')
    } catch (error) {
      console.error('Erro ao atualizar documento:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      setLoading(true)
      await gptBuilderService.deleteDocument(id)
      setDocuments(prev => prev.filter(doc => doc.id !== id))
      if (selectedDocument?.id === id) {
        setSelectedDocument(null)
        setIsEditing(false)
      }
      console.log('✅ Documento deletado com sucesso')
    } catch (error) {
      console.error('Erro ao deletar documento:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar documentos
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'all' || doc.type === selectedType
    return matchesSearch && matchesType
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">GPT Builder - Nôa Esperanza</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💬 Chat com Nôa
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'editor'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📚 Base de Conhecimento
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {activeTab === 'chat' ? (
            /* Chat Tab */
            <div className="flex-1 flex flex-col">
              {/* Chat Messages */}
              <div 
                ref={chatRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-white'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-white p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="animate-pulse">Nôa está digitando...</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Converse com a Nôa... Cole documentos, faça perguntas..."
                      className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                      rows={3}
                      disabled={isTyping}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => setAttachedFiles(Array.from(e.target.files || []))}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors"
                    >
                      📎
                    </label>
                    <button
                      onClick={sendMessage}
                      disabled={(!currentMessage.trim() && attachedFiles.length === 0) || isTyping}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
                {attachedFiles.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-400">
                      Arquivos anexados: {attachedFiles.map(f => f.name).join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Editor Tab */
            <div className="flex-1 flex">
              {/* Document List */}
              <div className="w-1/3 border-r border-gray-700 p-4">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Buscar documentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
                
                <div className="mb-4">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="all">Todos os tipos</option>
                    <option value="personality">Personalidade</option>
                    <option value="knowledge">Conhecimento</option>
                    <option value="instructions">Instruções</option>
                    <option value="examples">Exemplos</option>
                  </select>
                </div>

                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDocument(doc)
                        setIsEditing(false)
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedDocument?.id === doc.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      <div className="font-medium text-sm">{doc.title}</div>
                      <div className="text-xs opacity-70">{doc.type}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Editor */}
              <div className="flex-1 p-4">
                {selectedDocument ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-white">
                        {isEditing ? 'Editando' : 'Visualizando'}: {selectedDocument.title}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          {isEditing ? 'Cancelar' : 'Editar'}
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(selectedDocument.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Deletar
                        </button>
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={selectedDocument.title}
                          onChange={(e) => setSelectedDocument({...selectedDocument, title: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Título do documento"
                        />
                        <textarea
                          ref={editorRef}
                          value={selectedDocument.content}
                          onChange={(e) => setSelectedDocument({...selectedDocument, content: e.target.value})}
                          className="w-full h-96 px-3 py-2 bg-slate-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 resize-none"
                          placeholder="Conteúdo do documento"
                        />
                        <button
                          onClick={handleUpdateDocument}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="text-sm text-gray-400 mb-2">
                          Tipo: {selectedDocument.type} | Categoria: {selectedDocument.category}
                        </div>
                        <div className="text-white whitespace-pre-wrap">
                          {selectedDocument.content}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 mt-8">
                    Selecione um documento para visualizar ou editar
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default GPTPBuilder_FIXED
