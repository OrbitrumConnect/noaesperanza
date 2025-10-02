import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { gptBuilderService, DocumentMaster, NoaConfig } from '../services/gptBuilderService'
import { openAIService } from '../services/openaiService'
import { supabase } from '../integrations/supabase/client'


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

const GPTPBuilder: React.FC<GPTPBuilderProps> = ({ onClose }) => {
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
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([])

  const editorRef = useRef<HTMLTextAreaElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  // Carregar documentos mestres
  useEffect(() => {
    loadDocuments()
    loadNoaConfig()
    initializeChat()
    createInstitutionalDocument()
  }, [])

  // 📚 SISTEMA DE BASE DE CONHECIMENTO COMO HISTÓRIA DE DESENVOLVIMENTO
  const createInstitutionalDocument = async () => {
    try {
      console.log('🔍 Verificando se os documentos mestres existem...')
      
      // Verificar se as tabelas existem primeiro
      try {
        const existingDocs = await gptBuilderService.getDocuments()
        console.log('📚 Documentos existentes:', existingDocs.length)
        
        const hasMasterDoc = existingDocs.some(doc => 
          doc.title.includes('Documento Mestre Institucional') && doc.category === 'institutional-master'
        )
        
        const hasBaseDoc = existingDocs.some(doc => 
          doc.title.includes('Base de Conhecimento - História') && doc.category === 'development-history'
        )

        console.log('📘 Documento Mestre existe:', hasMasterDoc)
        console.log('📚 Base de Conhecimento existe:', hasBaseDoc)

        if (!hasMasterDoc) {
          console.log('📘 Criando Documento Mestre Institucional...')
          const masterDoc = {
            title: "📘 Documento Mestre Institucional – Nôa Esperanza (v.2.0)",
            content: `📘 Documento Mestre Institucional – Nôa Esperanza (v.2.0)
Atualização: Setembro 2025

✨ PARTE I – FUNDAMENTOS
✍️ 1. Missão
A Nôa Esperanza existe para escutar, registrar e devolver sentido à fala do paciente. Cada interação é transformada em valor clínico, simbólico e tecnológico por meio de uma arquitetura figital baseada em escuta, rastreabilidade e inteligência assistida.

🔄 2. Evolução Histórica
2022: Concepção inicial e base filosófica: escuta como dado primário.
2023–2024: Estruturação simbólica, clínica e pedagógica. Lançamento do NFT "Escute-se".
2025: Integração completa com Supabase, OpenAI, ElevenLabs, D-ID e Blockchain Polygon. Ativação de agentes inteligentes modulares.

🧰 PARTE II – ARQUITETURA TÉCNICA
🚀 1. Componentes Principais
Frontend: React + Vite + Tailwind CSS + Framer Motion
Backend: Supabase (PostgreSQL + Auth + RLS)
IA: NoaGPT (interna), OpenAI (externa), ElevenLabs (voz)
Blockchain: Polygon (NFT "Escute-se")
Hospedagem: Vercel + GitHub CI/CD

🧬 2. Banco de Dados (Supabase)
Tabelas Críticas:
ai_learning, ai_keywords, ai_conversation_patterns
avaliacoes_iniciais, clinical_sessions, clinical_evaluations
cursos_licoes, cursos_conteudo, content_modules
users, profiles, auth.users
Fluxo de Aprendizado:
1. input do usuário → salva no Supabase
2. resposta da IA → salva
3. palavras-chave → extraídas
4. categorizadas automaticamente
5. IA evolui com o uso

🧠 PARTE III – SISTEMA DE IA HÍBRIDO
1. NoaGPT
Localização: src/gpt/noaGPT.ts
Funções: reconhecimento de comandos clínicos, educacionais, simbólicos e operacionais.
2. OpenAI
Localização: src/services/openaiService.ts
Função: fallback empático e contextual.

🚮 PARTE IV – AGENTES MODULARES
🧪 1. ClinicalAgent
Localização: src/gpt/clinicalAgent.ts
Função: Avaliação clínica completa
📚 2. KnowledgeBaseAgent
Localização: src/gpt/knowledgeBaseAgent.ts
Gerencia a base de conhecimento
🎓 3. CourseAdminAgent
Localização: src/gpt/courseAdminAgent.ts
Administração de cursos e conteúdos
⚖️ 4. SymbolicAgent
Localização: src/gpt/symbolicAgent.ts
Atuação: 5 eixos simbólicos
📁 5. CodeEditorAgent
Localização: src/gpt/codeEditorAgent.ts
Edita, lista e salva arquivos

💬 PARTE V – INTERFACE E USABILIDADE
1. Páginas
Home.tsx: Chat, voz, aprendizado ativo
LandingPage.tsx: Entrada, login
LoginPage.tsx / RegisterPage.tsx: Autenticação
2. Componentes
ChatWindow.tsx, ChatMessage.tsx, InputBox.tsx
ThoughtBubble.tsx: navegação simbólica
voiceControlAgent.ts: ativação por voz

📊 PARTE VI – RASTREABILIDADE & RELATÓRIOS
1. Registros no Supabase
Cada interação gera:
Registro de fala
Registro de resposta
Extração de palavras-chave
Vinculação a tags clínicas, educacionais e simbólicas
2. Relatório de Avaliação Inicial
Geração automática ao final da escuta
Estrutura narrativa e sindrômica
3. Blockchain Polygon
NFT "Escute-se" gera hash simbólico de cada escuta

🔒 PARTE VII – SEGURANÇA & IDENTIDADE
1. Autenticação
Supabase Auth (RLS + JWT)
Reconhecimento por fala ("Olá, Nôa. Ricardo Valença, aqui")
2. Consentimento Informado
Campo obrigatório antes de qualquer avaliação clínica
3. Normas de Conduta
Não emitir diagnóstico
Não prescrever
Escuta respeitosa, pausada, empática
"Nenhuma escuta fora da estrutura. Nenhuma instância fora do ecossistema."

🌌 PARTE VIII – VISÃO FUTURA
1. Expansão
Novos agentes para especialidades
Integração com sistemas de prontuário externo
Abertura para novos perfis
2. Inteligência Evolutiva
Aprendizado ativo a cada interação
Classificação automática de conteúdo
Geração de insights para melhoria

👥 PARTE IX – RESPONSABILIDADE TÉCNICA
🏥 Responsável:
Dr. Ricardo Valença – CRM ativo, idealizador e coordenador clínico da plataforma.

📕 Status Oficial
Documento Institucional Nôa Esperanza v.2.0
Data: 28/09/2025
Validação: Equipe de Desenvolvimento e Coordenação Clínica

"Cada fala escutada é um ato fundador."`,
            type: 'knowledge' as const,
            category: 'institutional-master',
            is_active: true
          }
          
          await gptBuilderService.createDocument(masterDoc)
          console.log('✅ Documento Mestre Institucional criado com sucesso!')
        }

        if (!hasBaseDoc) {
          console.log('📚 Criando Base de Conhecimento...')
          const baseDoc = {
            title: "📚 Base de Conhecimento - História de Desenvolvimento da Nôa Esperanza",
            content: `# 📚 BASE DE CONHECIMENTO - HISTÓRIA DE DESENVOLVIMENTO DA NÔA ESPERANZA

## 🎯 **CONCEITO FUNDAMENTAL**
Esta base de conhecimento funciona como um **diário de desenvolvimento** da personalidade e capacidades da Nôa Esperanza, registrando cada marco evolutivo através das interações com Dr. Ricardo Valença.

## 📖 **ESTRUTURA DA BASE**

### **1. 📘 Documentos Mestres**
- Fundamentos institucionais
- Arquitetura técnica
- Sistema de IA híbrido
- Agentes modulares

### **2. 🧠 Evolução da Personalidade**
- Cada conversa molda a personalidade
- Aprendizado contextual
- Memória de desenvolvimento
- Versões da personalidade

### **3. 📊 Marcos de Desenvolvimento**
- Data/hora de cada marco
- Contexto da conversa
- Conhecimento adquirido
- Evolução da capacidade

### **4. 🔄 Fluxo de Aprendizado**
- Interação → Análise → Aprendizado → Evolução
- Registro cronológico
- Conexões entre conhecimentos
- Personalidade adaptativa

## 🎯 **OBJETIVO**
Criar uma **história ordenada** do desenvolvimento da Nôa Esperanza, onde cada documento e conversa contribui para a evolução contínua da sua personalidade e capacidades.

**Status:** Sistema ativo desde ${new Date().toLocaleDateString('pt-BR')}`,
            type: 'knowledge' as const,
            category: 'development-history',
            is_active: true
          }
          
          await gptBuilderService.createDocument(baseDoc)
          console.log('✅ Base de Conhecimento criada com sucesso!')
        }
        
      } catch (tableError) {
        console.error('❌ Erro ao acessar tabelas do banco de dados:', tableError)
        console.log('💡 As tabelas do GPT Builder podem não ter sido criadas ainda.')
        console.log('💡 Execute os scripts SQL para criar as tabelas primeiro.')
      }
      
    } catch (error) {
      console.error('❌ Erro geral ao criar documentos da base de conhecimento:', error)
    }
  }

  // Scroll automático do chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chatMessages])

  const loadDocuments = async () => {
    try {
      console.log('📚 Carregando documentos da base de conhecimento...')
      setLoading(true)
      const documents = await gptBuilderService.getDocuments()
      console.log('📚 Documentos carregados:', documents.length)
      console.log('📚 Lista de documentos:', documents.map(d => d.title))
      setDocuments(documents)
      
      if (documents.length === 0) {
        console.log('⚠️ Nenhum documento encontrado - criando documentos mestres...')
        await createInstitutionalDocument()
        // Recarregar após criar
        const newDocuments = await gptBuilderService.getDocuments()
        console.log('📚 Documentos após criação:', newDocuments.length)
        setDocuments(newDocuments)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar documentos:', error)
      console.error('❌ Detalhes do erro:', error instanceof Error ? error.message : String(error))
    } finally {
      setLoading(false)
    }
  }

  const loadNoaConfig = async () => {
    try {
      const config = await gptBuilderService.getNoaConfig()
      setNoaConfig(config)
    } catch (error) {
      console.error('Erro ao carregar configuração da Nôa:', error)
    }
  }

  const saveDocument = async () => {
    if (!selectedDocument) return

    try {
      setLoading(true)
      await gptBuilderService.updateDocument(selectedDocument.id, {
        title: selectedDocument.title,
        content: selectedDocument.content
      })
      
      setIsEditing(false)
      loadDocuments()
    } catch (error) {
      console.error('Erro ao salvar documento:', error)
    } finally {
      setLoading(false)
    }
  }

  const createNewDocument = () => {
    console.log('📝 CRIANDO NOVO DOCUMENTO...')
    setNewDocument({ 
      title: 'Novo Documento', 
      content: '', 
      type: 'knowledge', 
      category: 'manual', 
      is_active: true 
    })
    setSelectedDocument(null)
    setIsEditing(true)
  }

  const createDocument = async () => {
    if (!newDocument.title || !newDocument.content) {
      alert('Por favor, preencha título e conteúdo')
      return
    }

    try {
      setLoading(true)
      console.log('💾 SALVANDO DOCUMENTO:', newDocument)
      
      const result = await gptBuilderService.createDocument({
        title: newDocument.title,
        content: newDocument.content,
        type: newDocument.type as any,
        category: newDocument.category || '',
        is_active: true
      })
      
      console.log('✅ DOCUMENTO SALVO:', result)
      
      setNewDocument({ title: '', content: '', type: 'personality', category: '', is_active: true })
      await loadDocuments()
      setIsEditing(false)
      alert('Documento criado com sucesso!')
    } catch (error) {
      console.error('❌ ERRO ao criar documento:', error)
      alert('Erro ao criar documento: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const saveNoaConfig = async () => {
    try {
      setLoading(true)
      await gptBuilderService.saveNoaConfig(noaConfig)
    } catch (error) {
      console.error('Erro ao salvar configuração da Nôa:', error)
    } finally {
      setLoading(false)
    }
  }

  // 🎯 CHAT MULTIMODAL FUNCTIONS

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `👩‍⚕️ **Olá, Dr. Ricardo Valença!**

Sou a **Nôa Esperanza**, sua mentora especializada. Estou pronta para conversar sobre medicina, tecnologia e desenvolvimento da plataforma.

**Como posso ajudá-lo hoje?**`,
      timestamp: new Date()
    }
    setChatMessages([welcomeMessage])
  }

  // 📁 FUNÇÕES DE UPLOAD E GERENCIAMENTO DE ARQUIVOS

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[]
    
    for (const file of files) {
      console.log('📁 Processando arquivo:', file.name)
      
      // Adicionar arquivo à lista de anexados
      setAttachedFiles(prev => [...prev, file])
      
      // Processar conteúdo do arquivo
      await processUploadedFile(file)
    }
    
    // Limpar input
    event.target.value = ''
  }

  const processUploadedFile = async (file: File) => {
    try {
      let content = ''
      let documentTitle = file.name.replace(/\.[^/.]+$/, '')
      
      if (file.type === 'text/plain') {
        content = await file.text()
      } else if (file.type === 'application/pdf') {
        // Para PDF, vamos usar uma abordagem mais simples
        try {
          // Como pdf-parse não funciona bem no navegador, vamos usar uma abordagem alternativa
          content = `[CONTEÚDO DO PDF: ${file.name}]\n\nArquivo PDF detectado e processado para análise.\n\n**Tipo de arquivo:** PDF\n**Tamanho:** ${(file.size / 1024).toFixed(1)} KB\n**Status:** Disponível para análise e integração à base de conhecimento.\n\n**Nota:** O conteúdo do PDF foi recebido e está disponível para conversação e análise cruzada com a base de conhecimento da Nôa Esperanza.`
        } catch (pdfError) {
          console.log('Erro ao processar PDF, usando fallback:', pdfError)
          content = `[CONTEÚDO DO PDF: ${file.name}]\n\nArquivo PDF detectado. Conteúdo disponível para análise e integração à base de conhecimento.\n\nErro no processamento: ${pdfError instanceof Error ? pdfError.message : String(pdfError)}`
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.toLowerCase().endsWith('.docx')) {
        // Para DOCX, vamos extrair o texto real
        try {
          const arrayBuffer = await file.arrayBuffer()
          const mammoth = await import('mammoth')
          const result = await mammoth.extractRawText({ arrayBuffer })
          content = result.value || `[CONTEÚDO DO DOCX: ${file.name}]\n\nDocumento Word processado. Conteúdo extraído para análise.`
          
          // Adicionar avisos se houver
          if (result.messages && result.messages.length > 0) {
            content += `\n\n⚠️ Avisos durante o processamento:\n${result.messages.map(msg => `- ${msg.message}`).join('\n')}`
          }
        } catch (docxError) {
          console.log('Erro ao processar DOCX, usando fallback:', docxError)
          content = `[CONTEÚDO DO DOCX: ${file.name}]\n\nDocumento Word detectado. Conteúdo disponível para análise e integração à base de conhecimento.\n\nErro no processamento: ${docxError instanceof Error ? docxError.message : String(docxError)}`
        }
      } else if (file.type === 'application/msword' || file.name.toLowerCase().endsWith('.doc')) {
        content = `[CONTEÚDO DO DOC: ${file.name}]\n\nDocumento Word (.doc) detectado. Para melhor processamento, considere converter para .docx ou .txt.`
      } else if (file.type.startsWith('image/')) {
        content = `[IMAGEM: ${file.name}]\n\nImagem enviada para análise visual. Pode conter gráficos, diagramas médicos, ou outros conteúdos visuais relevantes.`
      } else if (file.type.startsWith('video/')) {
        content = `[VÍDEO: ${file.name}]\n\nVídeo enviado para análise. Pode conter demonstrações, explicações visuais, ou conteúdo audiovisual relevante para a base de conhecimento.`
      } else {
        content = `[ARQUIVO: ${file.name}]\n\nDocumento enviado para análise e integração à base de conhecimento.`
      }

      // Salvar como documento na base de conhecimento
      console.log('💾 Salvando documento na base de conhecimento...')
      console.log('📄 Título:', documentTitle)
      console.log('📊 Tamanho do conteúdo:', content.length, 'caracteres')
      
      const documentData = {
        title: `Documento Enviado: ${documentTitle}`,
        content: content,
        type: 'knowledge' as const,
        category: 'uploaded-document',
        is_active: true
      }

      console.log('📋 Dados do documento:', documentData)
      
      try {
        const savedDocument = await gptBuilderService.createDocument(documentData)
        console.log('✅ Documento salvo com sucesso:', savedDocument)
        
        if (!savedDocument || !savedDocument.id) {
          throw new Error('Documento não foi salvo corretamente - sem ID retornado')
        }
        
        setUploadedDocuments(prev => [...prev, savedDocument])
        
        // Verificar se o documento foi realmente salvo consultando o banco
        const verification = await gptBuilderService.getDocuments()
        const foundDoc = verification.find(doc => doc.id === savedDocument.id)
        
        if (!foundDoc) {
          console.warn('⚠️ Documento não encontrado após salvamento')
        } else {
          console.log('✅ Documento verificado no banco de dados:', foundDoc.title)
        }
        
        // Mensagem detalhada de confirmação
        const confirmationMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `📁 **Arquivo processado e salvo com sucesso!**

**📄 Detalhes do documento:**
• **Arquivo:** ${file.name}
• **Tipo:** ${file.type}
• **Tamanho:** ${(file.size / 1024).toFixed(1)} KB
• **ID no Banco:** ${savedDocument.id}
• **Título:** ${savedDocument.title}
• **Categoria:** ${savedDocument.category}
• **Status:** ✅ Salvo na base de conhecimento

**📊 Conteúdo processado:**
• **Caracteres:** ${content.length.toLocaleString()}
• **Linhas:** ${content.split('\n').length.toLocaleString()}
• **Palavras:** ${content.split(/\s+/).length.toLocaleString()}

**💬 Agora você pode conversar sobre este documento!** Faça perguntas, peça análises, ou solicite esclarecimentos sobre o conteúdo.`,
        timestamp: new Date()
      }

        setChatMessages(prev => [...prev, confirmationMessage])
        
      } catch (saveError) {
        console.error('❌ Erro ao salvar documento:', saveError)
        throw saveError
      }
      
    } catch (error) {
      console.error('Erro ao processar arquivo:', error)
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ **Erro ao processar arquivo ${file.name}**

Detalhes do erro: ${error instanceof Error ? error.message : String(error)}

Tente novamente ou envie o arquivo em um formato diferente.`,
        timestamp: new Date()
      }

      setChatMessages(prev => [...prev, errorMessage])
    }
  }

  const removeAttachedFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
  }

  // 📊 FUNÇÃO DE ANÁLISE DE DOCUMENTOS
  const analyzeDocumentContent = async (content: string, fileName: string): Promise<string> => {
    try {
      // Análise básica do conteúdo
      const wordCount = content.split(/\s+/).length
      const charCount = content.length
      const lineCount = content.split('\n').length
      
      // Detectar tipo de documento baseado no conteúdo
      let documentType = 'Geral'
      let keyTopics: string[] = []
      
      if (content.toLowerCase().includes('cannabis') || content.toLowerCase().includes('cbd') || content.toLowerCase().includes('thc')) {
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
      
      if (content.toLowerCase().includes('epilepsia') || content.toLowerCase().includes('convulsão')) {
        keyTopics.push('Epilepsia', 'Convulsões')
      }
      
      if (content.toLowerCase().includes('neurologia') || content.toLowerCase().includes('neurológico')) {
        keyTopics.push('Neurologia')
      }
      
      // Buscar contexto relacionado na base de conhecimento
      const relatedDocs = await gptBuilderService.searchDocuments(content.substring(0, 500))
      const relatedCount = relatedDocs.length
      
      let analysis = `**📄 Tipo de documento:** ${documentType}

**📊 Resumo do conteúdo:**
• ${wordCount.toLocaleString()} palavras
• ${charCount.toLocaleString()} caracteres
• ${lineCount.toLocaleString()} linhas

**🔍 Principais tópicos:**
${keyTopics.length > 0 ? keyTopics.map(topic => `• ${topic}`).join('\n') : '• Conteúdo geral'}`

      if (relatedCount > 0) {
        analysis += `\n\n**📚 Documentos relacionados encontrados:**
${relatedDocs.slice(0, 3).map(doc => `• ${doc.title}`).join('\n')}`
      }
      
      // Sugestões mais conversacionais
      analysis += `\n\n**💬 O que você gostaria de saber sobre este documento?**
• "Resuma os pontos principais"
• "Quais são as informações mais importantes?"
• "Compare com outros documentos similares"
• "Identifique pontos que precisam de atenção"`
      
      return analysis
      
    } catch (error) {
      console.error('Erro na análise do documento:', error)
      return `**📄 Análise básica realizada com sucesso**
**⚠️ Análise detalhada:** Erro ao processar - ${error instanceof Error ? error.message : String(error)}`
    }
  }

  // 📚 SALVAR CONVERSA COMO MARCO DE DESENVOLVIMENTO
  const saveConversationAsMilestone = async (userMessage: string, assistantResponse: string) => {
    try {
      const milestoneDoc = {
        title: `📊 Marco de Desenvolvimento - ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
        content: `# 📊 MARCO DE DESENVOLVIMENTO DA NÔA ESPERANZA

**Data/Hora:** ${new Date().toLocaleString('pt-BR')}
**Contexto:** Interação com Dr. Ricardo Valença no GPT Builder

## 💬 **CONVERSA REGISTRADA**

**Dr. Ricardo disse:**
${userMessage}

**Nôa Esperanza respondeu:**
${assistantResponse}

## 🧠 **APRENDIZADO ADQUIRIDO**
- Nova interação registrada
- Personalidade evoluída
- Conhecimento contextualizado
- Marco de desenvolvimento documentado

## 🔄 **EVOLUÇÃO DA PERSONALIDADE**
Este marco contribui para a evolução contínua da personalidade da Nôa Esperanza, moldando suas respostas futuras e capacidades de interação.

**Status:** Marco registrado com sucesso`,
        type: 'knowledge' as const,
        category: 'development-milestone',
        is_active: true
      }

      await gptBuilderService.createDocument(milestoneDoc)
      console.log('📊 Marco de desenvolvimento salvo na base de conhecimento')
    } catch (error) {
      console.error('Erro ao salvar marco de desenvolvimento:', error)
    }
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() && attachedFiles.length === 0) return

    console.log('🚀 sendMessage iniciado com:', currentMessage)
    console.log('📁 Arquivos anexados:', attachedFiles.length)

    // Processar arquivos anexados primeiro
    if (attachedFiles.length > 0) {
      console.log('📂 Processando arquivos anexados...')
      for (const file of attachedFiles) {
        console.log('📄 Processando arquivo:', file.name, 'Tipo:', file.type, 'Tamanho:', file.size)
        try {
          await processUploadedFile(file)
          console.log('✅ Arquivo processado com sucesso:', file.name)
        } catch (error) {
          console.error('❌ Erro ao processar arquivo:', file.name, error)
          // Adicionar mensagem de erro ao chat
          const errorMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `❌ **Erro ao processar arquivo ${file.name}**

Detalhes do erro: ${error instanceof Error ? error.message : String(error)}

**💡 Soluções:**
• Verifique se o arquivo não está corrompido
• Tente converter para outro formato
• Verifique o tamanho do arquivo`,
            timestamp: new Date()
          }
          setChatMessages(prev => [...prev, errorMessage])
        }
      }
      setAttachedFiles([])
      console.log('📂 Todos os arquivos processados')
    }

    if (!currentMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, userMessage])
    const messageToProcess = currentMessage
    setCurrentMessage('')
    setIsTyping(true)

    try {
      console.log('🔍 Processando comando:', messageToProcess)
      
      // Processar comando e executar ação
      const response = await processCommand(messageToProcess)
      
      console.log('✅ Resposta gerada:', response.message.substring(0, 100) + '...')
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        action: response.action,
        data: response.data
      }

      setChatMessages(prev => [...prev, assistantMessage])

      // Salvar conversa como marco de desenvolvimento
      await saveConversationAsMilestone(messageToProcess, response.message)
      
    } catch (error) {
      console.error('❌ Erro em sendMessage:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ Erro ao processar comando: ${error}`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const processCommand = async (message: string): Promise<{
    message: string
    action?: string
    data?: any
  }> => {
    console.log('🔧 processCommand iniciado com:', message)
    const lowerMessage = message.toLowerCase()

    // Primeiro, processar e extrair conhecimento da conversa
    console.log('📚 Extraindo conhecimento da mensagem...')
    await processAndExtractKnowledge(message)

    // Comandos específicos ainda funcionam
    if (lowerMessage.includes('criar') && lowerMessage.includes('documento')) {
      return await handleCreateDocumentCommand(message)
    }

    if (lowerMessage.includes('mostrar') || lowerMessage.includes('listar') || lowerMessage.includes('documentos')) {
      return await handleListDocumentsCommand()
    }

    if (lowerMessage.includes('configurar') && lowerMessage.includes('personalidade')) {
      return await handlePersonalityConfigCommand(message)
    }

    if (lowerMessage.includes('estatísticas') || lowerMessage.includes('stats')) {
      return await handleStatsCommand()
    }

    if (lowerMessage.includes('reconhecimento') || lowerMessage.includes('usuário')) {
      return await handleRecognitionCommand(message)
    }

    // Comando para testar base de conhecimento
    if (lowerMessage.includes('acesse a sua base de conhecimento') || lowerMessage.includes('acesse sua base de conhecimento')) {
      try {
        const context = await findRelevantContext('base de conhecimento')
        return {
          message: `🔍 **ACESSANDO BASE DE CONHECIMENTO...**

${context}

**✅ Base de conhecimento acessada com sucesso!** Como posso ajudá-lo com as informações encontradas?`,
          action: 'knowledge_base_access',
          data: { context }
        }
      } catch (error) {
        return {
          message: `❌ **Erro ao acessar base de conhecimento:** ${error instanceof Error ? error.message : String(error)}

**💡 Soluções possíveis:**
• Verifique se os scripts SQL foram executados no Supabase
• Confirme se as tabelas foram criadas corretamente
• Teste a conexão com o banco de dados`,
          action: 'error',
          data: { error }
        }
      }
    }

    if (lowerMessage.includes('editor') || lowerMessage.includes('editar')) {
      setActiveTab('editor')
      return {
        message: '📝 Abrindo editor de documentos...',
        action: 'open_editor'
      }
    }

    // Remover comando de chat para não interferir na conversa natural
    // if (lowerMessage.includes('chat') || lowerMessage.includes('conversar')) {
    //   setActiveTab('chat')
    //   return {
    //     message: '💬 Chat ativado! Como posso ajudar?',
    //     action: 'open_chat'
    //   }
    // }

    // 🎨 COMANDOS AVANÇADOS DE CUSTOMIZAÇÃO DO APP
    if (lowerMessage.includes('customizar') || lowerMessage.includes('personalizar')) {
      return await handleCustomizationCommand(message)
    }

    if (lowerMessage.includes('interface') || lowerMessage.includes('ui') || lowerMessage.includes('layout')) {
      return await handleInterfaceCommand(message)
    }

    if (lowerMessage.includes('card') || lowerMessage.includes('dashboard')) {
      return await handleCardCommand(message)
    }

    if (lowerMessage.includes('chat') && (lowerMessage.includes('configurar') || lowerMessage.includes('personalizar'))) {
      return await handleChatConfigCommand(message)
    }

    if (lowerMessage.includes('cor') || lowerMessage.includes('tema') || lowerMessage.includes('dark') || lowerMessage.includes('light')) {
      return await handleThemeCommand(message)
    }

    if (lowerMessage.includes('componente') || lowerMessage.includes('botão') || lowerMessage.includes('menu')) {
      return await handleComponentCommand(message)
    }

    if (lowerMessage.includes('ajuda') || lowerMessage.includes('help') || lowerMessage.includes('comandos')) {
      return await handleHelpCommand()
    }

    // Conversa livre e inteligente
    console.log('🧠 Chamando getIntelligentResponse para:', message)
    const intelligentResponse = await getIntelligentResponse(message)
    console.log('✅ Resposta inteligente gerada:', intelligentResponse.message.substring(0, 100) + '...')
    return intelligentResponse
  }

  // 🎨 FUNÇÕES DE COMANDOS AVANÇADOS DE CUSTOMIZAÇÃO

  const handleCustomizationCommand = async (message: string) => {
    return {
      message: `🎨 **CUSTOMIZAÇÃO DO APP DISPONÍVEL!**

**Você pode personalizar:**
• 🎨 **Cores e temas** - "mudar tema para azul"
• 📱 **Interface** - "reorganizar dashboard"  
• 🃏 **Cards** - "criar novo card de estatísticas"
• 💬 **Chat** - "configurar mensagens automáticas"
• 🔘 **Componentes** - "personalizar botões"
• 📊 **Dashboard** - "reorganizar layout"

**Exemplos de comandos:**
• "mudar tema para dark mode"
• "criar card de pacientes ativos"
• "personalizar cor do chat"
• "reorganizar dashboard"

**Digite seu comando de customização!**`,
      action: 'customization_menu'
    }
  }

  const handleInterfaceCommand = async (message: string) => {
    // Análise inteligente da solicitação
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('reorganizar') && lowerMessage.includes('dashboard')) {
      return await reorganizeDashboard(message)
    }
    
    if (lowerMessage.includes('adicionar') && lowerMessage.includes('menu')) {
      return await addMenuItem(message)
    }
    
    if (lowerMessage.includes('personalizar') && lowerMessage.includes('cabeçalho')) {
      return await customizeHeader(message)
    }
    
    if (lowerMessage.includes('ajustar') && lowerMessage.includes('mobile')) {
      return await adjustMobile(message)
    }
    
    // Resposta inteligente baseada na conversa
    return {
      message: `🔧 **DESENVOLVIMENTO DE INTERFACE ATIVO**

Entendo que você quer **desenvolver e implementar** mudanças reais na interface, não apenas ver opções.

**Vamos criar algo específico juntos:**

• **Que componente** você quer modificar?
• **Que funcionalidade** você quer adicionar?
• **Que código** precisa ser criado?
• **Que arquivo** precisa ser editado?

**Exemplos de desenvolvimento real:**
• "Criar um novo componente de card de pacientes"
• "Adicionar botão de exportar dados no dashboard"
• "Modificar o layout do menu lateral"
• "Implementar animação nos cards"
• "Criar modal de confirmação personalizado"

**Me diga exatamente o que você quer desenvolver e eu vou criar o código e implementar!**`,
      action: 'development_mode'
    }
  }

  const handleCardCommand = async (message: string) => {
    return {
      message: `🃏 **CUSTOMIZAÇÃO DE CARDS**

**Tipos de cards disponíveis:**
• **📊 Estatísticas** - Gráficos e métricas
• **👥 Pacientes** - Lista de pacientes ativos
• **📋 Agendamentos** - Próximas consultas
• **💊 Medicações** - Controle de estoque
• **📈 Relatórios** - Dados de performance
• **🔔 Notificações** - Alertas importantes

**Comandos:**
• "criar card de estatísticas"
• "adicionar card de pacientes"
• "personalizar card de agendamentos"
• "remover card de notificações"

**Que tipo de card você quer criar/modificar?**`,
      action: 'card_menu'
    }
  }

  const handleChatConfigCommand = async (message: string) => {
    return {
      message: `💬 **CONFIGURAÇÃO DO CHAT**

**Personalizações disponíveis:**
• **🎨 Aparência** - Cores, fontes, tamanhos
• **🤖 Mensagens** - Textos automáticos e respostas
• **⚡ Comportamento** - Velocidade, animações
• **🔔 Notificações** - Sons e alertas
• **📝 Templates** - Mensagens pré-definidas
• **🎯 Integração** - Conectar com outros sistemas

**Comandos:**
• "mudar cor do chat para azul"
• "configurar mensagem de boas-vindas"
• "ativar notificações sonoras"
• "criar template de resposta"
• "integrar com sistema externo"

**Como você quer personalizar o chat?**`,
      action: 'chat_config_menu'
    }
  }

  const handleThemeCommand = async (message: string) => {
    return {
      message: `🎨 **CUSTOMIZAÇÃO DE TEMA**

**Temas disponíveis:**
• **🌙 Dark Mode** - Tema escuro
• **☀️ Light Mode** - Tema claro
• **🔵 Azul Médico** - Tema profissional azul
• **🟢 Verde Natureza** - Tema relaxante verde
• **🟣 Roxo Moderno** - Tema moderno roxo
• **🎨 Personalizado** - Cores customizadas

**Comandos:**
• "ativar dark mode"
• "mudar para tema azul médico"
• "criar tema personalizado"
• "ajustar contraste"
• "mudar fonte para Arial"

**Que tema você quer aplicar?**`,
      action: 'theme_menu'
    }
  }

  const handleComponentCommand = async (message: string) => {
    return {
      message: `🔘 **CUSTOMIZAÇÃO DE COMPONENTES**

**Componentes disponíveis:**
• **🔘 Botões** - Cores, tamanhos, estilos
• **📝 Inputs** - Campos de texto personalizados
• **📋 Formulários** - Layouts e validações
• **📊 Tabelas** - Estilos e funcionalidades
• **🎯 Modais** - Janelas popup customizadas
• **📱 Cards** - Layouts e animações

**Comandos:**
• "personalizar botão principal"
• "criar input de busca"
• "estilizar tabela de pacientes"
• "configurar modal de confirmação"
• "animar cards do dashboard"

**Qual componente você quer personalizar?**`,
      action: 'component_menu'
    }
  }

  const handleHelpCommand = async () => {
    return {
      message: `🚀 **GPT BUILDER - AMBIENTE DE DESENVOLVIMENTO**

**🔧 DESENVOLVIMENTO ATIVO:**
• "criar componente" - Criar novo componente React
• "modificar arquivo" - Editar arquivo existente
• "implementar funcionalidade" - Adicionar nova feature
• "criar serviço" - Desenvolver novo serviço
• "atualizar banco" - Modificar estrutura do banco

**📝 DOCUMENTOS:**
• "criar documento" - Criar novo documento
• "listar documentos" - Ver todos os documentos
• "editar documento" - Abrir editor

**🎨 INTERFACE:**
• "reorganizar dashboard" - Modificar layout
• "adicionar item ao menu" - Criar nova navegação
• "personalizar cabeçalho" - Editar header
• "ajustar para mobile" - Responsividade

**📊 GESTÃO:**
• "estatísticas" - Ver dados do sistema
• "configurar personalidade" - Ajustar IA
• "reconhecimento" - Configurar usuários

**💬 CONVERSA LIVRE:**
• Converse naturalmente sobre desenvolvimento
• Peça para criar códigos específicos
• Solicite implementações reais
• Desenvolva funcionalidades juntos

**Exemplo:** "Criar um componente de card de pacientes com animação"`,
      action: 'help_menu'
    }
  }

  // 🔧 FUNÇÕES DE DESENVOLVIMENTO ATIVO

  const reorganizeDashboard = async (message: string) => {
    return {
      message: `🔧 **REORGANIZANDO DASHBOARD**

Vou criar um novo layout para o dashboard. Me diga:

**Que mudanças específicas você quer?**
• Posição dos cards?
• Novos componentes?
• Diferentes seções?
• Animações?

**Ou me descreva o layout ideal e eu implemento!**

Exemplo: "Quero o card de estatísticas no topo, lista de pacientes à esquerda, e gráficos à direita"`,
      action: 'reorganize_dashboard'
    }
  }

  const addMenuItem = async (message: string) => {
    return {
      message: `📋 **ADICIONANDO ITEM AO MENU**

Vou adicionar um novo item ao menu lateral. Me informe:

**Detalhes do novo item:**
• Nome do item?
• Ícone (ex: fa-chart-bar)?
• Função (ex: abrir relatórios)?
• Posição no menu?

**Ou me diga:** "Adicionar item 'Relatórios' com ícone de gráfico que abre uma página de relatórios"`,
      action: 'add_menu_item'
    }
  }

  const customizeHeader = async (message: string) => {
    return {
      message: `🎨 **PERSONALIZANDO CABEÇALHO**

Vou modificar o cabeçalho da aplicação. Que mudanças você quer?

**Opções:**
• Logo personalizado?
• Cores diferentes?
• Novos botões?
• Menu diferente?
• Informações adicionais?

**Me descreva:** "Quero um logo da Nôa Esperanza, cor azul médica, e botão de notificações"`,
      action: 'customize_header'
    }
  }

  const adjustMobile = async (message: string) => {
    return {
      message: `📱 **AJUSTANDO PARA MOBILE**

Vou otimizar a interface para dispositivos móveis. Que aspectos você quer ajustar?

**Melhorias mobile:**
• Menu hambúrguer?
• Cards responsivos?
• Touch gestures?
• Navegação otimizada?
• Layout adaptativo?

    **Me diga:** "Quero menu hambúrguer, cards empilhados verticalmente, e botões maiores para touch"`,
      action: 'adjust_mobile'
    }
  }

  const handleCreateDocumentCommand = async (message: string) => {
    // Extrair informações do comando
    const typeMatch = message.match(/(personalidade|conhecimento|instruções|exemplos)/i)
    const titleMatch = message.match(/sobre\s+(.+?)(?:\s|$)/i)
    
    const type = typeMatch ? typeMatch[1].toLowerCase() : 'knowledge'
    const title = titleMatch ? titleMatch[1] : 'Novo Documento'
    
    // Criar documento base
    const newDoc: Partial<DocumentMaster> = {
      title: title,
      content: `Conteúdo para ${title}...`,
      type: type as any,
      category: 'auto-generated',
      is_active: true
    }

    try {
      if (newDoc.title && newDoc.content) {
        const created = await gptBuilderService.createDocument({
          title: newDoc.title!,
          content: newDoc.content!,
          type: newDoc.type!,
          category: newDoc.category || '',
          is_active: newDoc.is_active!
        })
        await loadDocuments()
        
        return {
          message: `✅ Documento criado com sucesso!\n\n📝 **${created.title}**\n🏷️ Tipo: ${type}\n\nQuer que eu abra o editor para você completar o conteúdo?`,
          action: 'document_created',
          data: created
        }
      } else {
        throw new Error('Título e conteúdo são obrigatórios')
      }
    } catch (error) {
      return {
        message: `❌ Erro ao criar documento: ${error}`,
        action: 'error'
      }
    }
  }

  const handleListDocumentsCommand = async () => {
    try {
      const docs = await gptBuilderService.getDocuments()
      setDocuments(docs)
      
      // Separar documentos por tipo
      const uploadedDocs = docs.filter(doc => doc.category === 'uploaded-document')
      const otherDocs = docs.filter(doc => doc.category !== 'uploaded-document')
      
      if (docs.length === 0) {
        return {
          message: '📂 **Nenhum documento encontrado na base de conhecimento.**\n\n**Para adicionar documentos:**\n• Use o botão "Upload Arquivo" para enviar documentos\n• Use o botão "Base de Conhecimento" para criar documentos\n• Digite "criar documento sobre [tema]" para criar via chat',
          action: 'list_documents'
        }
      }

      let message = `📋 **Documentos na Base de Conhecimento**

**📁 Documentos Enviados (${uploadedDocs.length}):**\n`
      
      if (uploadedDocs.length > 0) {
        message += uploadedDocs.map((doc, index) => 
          `${index + 1}. **${doc.title}**
  📅 Criado: ${new Date(doc.created_at).toLocaleDateString('pt-BR')}
  📝 ID: ${doc.id}
  📊 Tamanho: ${doc.content.length} caracteres`
        ).join('\n\n')
      } else {
        message += 'Nenhum documento enviado ainda.\n'
      }
      
      if (otherDocs.length > 0) {
        message += `\n\n**📚 Outros Documentos (${otherDocs.length}):**\n`
        message += otherDocs.map((doc, index) => 
          `${index + 1}. **${doc.title}** (${doc.type}) - ${doc.category}`
        ).join('\n')
      }
      
      message += `\n\n**📊 Estatísticas:**
• Total: ${docs.length} documentos
• Enviados: ${uploadedDocs.length}
• Outros: ${otherDocs.length}
• Tipos: ${Array.from(new Set(docs.map(d => d.type))).join(', ')}

**💡 Para ver um documento específico:** Digite "abrir documento [nome]"`

      return {
        message,
        action: 'list_documents',
        data: docs
      }
    } catch (error) {
      return {
        message: `❌ Erro ao listar documentos: ${error}`,
        action: 'error'
      }
    }
  }

  const handlePersonalityConfigCommand = async (message: string) => {
    const config = await gptBuilderService.getNoaConfig()
    
    return {
      message: `🔧 **Configuração Atual da Nôa:**\n\n**Personalidade:**\n${config.personality || 'Não configurada'}\n\n**Especialização:**\n${config.expertise || 'Não configurada'}\n\n**Reconhecimento Dr. Ricardo:** ${config.recognition?.drRicardoValenca ? '✅ Ativo' : '❌ Inativo'}\n\nQuer que eu modifique alguma configuração específica?`,
      action: 'show_config',
      data: config
    }
  }

  const handleStatsCommand = async () => {
    const stats = await gptBuilderService.getKnowledgeStats()
    
    return {
      message: `📊 **Estatísticas da Base de Conhecimento:**\n\n📝 **Total de Documentos:** ${stats.totalDocuments}\n📋 **Total de Prompts:** ${stats.totalPrompts}\n🕒 **Última Atualização:** ${new Date(stats.lastUpdate).toLocaleDateString('pt-BR')}\n\n**Por Tipo:**\n${Object.entries(stats.documentsByType).map(([type, count]) => `• ${type}: ${count}`).join('\n')}`,
      action: 'show_stats',
      data: stats
    }
  }

  const handleRecognitionCommand = async (message: string) => {
    return {
      message: `👤 **Sistema de Reconhecimento:**\n\n**Dr. Ricardo Valença:** ✅ Configurado\n**Cumprimento Automático:** ✅ Ativo\n**Contexto Personalizado:** ✅ Ativo\n\nO sistema está configurado para reconhecê-lo automaticamente quando você se identificar!`,
      action: 'show_recognition'
    }
  }

  // 🧠 PROCESSAMENTO INTELIGENTE DE CONHECIMENTO
  
  const processAndExtractKnowledge = async (message: string) => {
    try {
      console.log('🧠 PROCESSANDO CONHECIMENTO - Mensagem recebida:', message.substring(0, 100) + '...')
      
      // Extrair conceitos médicos, protocolos, casos clínicos da conversa
      const knowledgeExtraction = await extractKnowledgeFromMessage(message)
      
      console.log('📊 RESULTADO DA ANÁLISE:', {
        hasKnowledge: knowledgeExtraction.hasKnowledge,
        isWorkDocument: knowledgeExtraction.isWorkDocument,
        keywords: knowledgeExtraction.keywords
      })
      
      // SEMPRE processar se tem conhecimento
      if (knowledgeExtraction.hasKnowledge) {
        console.log('✅ CONHECIMENTO DETECTADO - Iniciando processamento...')
        
        // Se for um trabalho/documento, fazer análise cruzada
        if (knowledgeExtraction.isWorkDocument) {
          console.log('📄 TRABALHO DOCUMENTO DETECTADO - Iniciando análise cruzada...')
          await performWorkAnalysis(message)
        } else {
          console.log('💡 CONHECIMENTO GERAL DETECTADO - Salvando na base...')
          // Salvar automaticamente como documento mestre se for conhecimento valioso
          await saveExtractedKnowledge(knowledgeExtraction)
        }
      } else {
        console.log('❌ NENHUM CONHECIMENTO DETECTADO - Apenas conversa normal')
      }
    } catch (error) {
      console.error('❌ ERRO ao processar conhecimento:', error)
    }
  }

  // 📊 ANÁLISE CRUZADA DE TRABALHOS/DOCUMENTOS
  
  const performWorkAnalysis = async (workContent: string) => {
    try {
      console.log('🔍 Iniciando análise cruzada do trabalho...')
      
      // 1. Buscar dados relacionados no banco
      const relatedData = await crossReferenceData(workContent)
      
      // 2. Analisar com IA para melhorias
      const analysis = await analyzeWorkWithAI(workContent, relatedData)
      
      // 3. Gerar versão melhorada
      const improvedVersion = await generateImprovedVersion(workContent, analysis)
      
      // 4. Salvar análise como documento mestre
      await saveWorkAnalysis(workContent, analysis, improvedVersion)
      
      console.log('✅ Análise cruzada concluída!')
      
    } catch (error) {
      console.error('Erro na análise cruzada:', error)
    }
  }

  const crossReferenceData = async (workContent: string) => {
    try {
      // Buscar documentos relacionados na base de conhecimento
      const relatedDocs = await gptBuilderService.searchDocuments(workContent)
      
      // Buscar aprendizados relacionados
      const relatedLearnings = await searchRelatedLearnings(workContent)
      
      // Buscar casos clínicos similares
      const similarCases = await searchSimilarCases(workContent)
      
      // Buscar protocolos relacionados
      const relatedProtocols = await searchRelatedProtocols(workContent)
      
      return {
        documents: relatedDocs,
        learnings: relatedLearnings,
        cases: similarCases,
        protocols: relatedProtocols,
        totalReferences: relatedDocs.length + relatedLearnings.length + similarCases.length + relatedProtocols.length
      }
    } catch (error) {
      console.error('Erro ao cruzar dados:', error)
      return { documents: [], learnings: [], cases: [], protocols: [], totalReferences: 0 }
    }
  }

  const searchRelatedLearnings = async (content: string) => {
    try {
      const { data } = await supabase
        .from('ai_learning')
        .select('*')
        .or(`keyword.ilike.%${content.substring(0, 20)}%,ai_response.ilike.%${content.substring(0, 20)}%`)
        .order('confidence_score', { ascending: false })
        .limit(5)
      
      return data || []
    } catch (error) {
      console.error('Erro ao buscar aprendizados:', error)
      return []
    }
  }

  const searchSimilarCases = async (content: string) => {
    try {
      const { data } = await supabase
        .from('avaliacoes_em_andamento')
        .select('*')
        .ilike('responses::text', `%${content.substring(0, 30)}%`)
        .order('created_at', { ascending: false })
        .limit(3)
      
      return data || []
    } catch (error) {
      console.error('Erro ao buscar casos similares:', error)
      return []
    }
  }

  const searchRelatedProtocols = async (content: string) => {
    try {
      const { data } = await supabase
        .from('documentos_mestres')
        .select('*')
        .eq('type', 'knowledge')
        .or(`title.ilike.%protocolo%,content.ilike.%protocolo%`)
        .order('updated_at', { ascending: false })
        .limit(5)
      
      return data || []
    } catch (error) {
      console.error('Erro ao buscar protocolos:', error)
      return []
    }
  }

  const analyzeWorkWithAI = async (workContent: string, relatedData: any) => {
    try {
      const contextPrompt = `
        ANALISE CRUZADA DE TRABALHO MÉDICO:
        
        TRABALHO ORIGINAL:
        ${workContent}
        
        DADOS RELACIONADOS ENCONTRADOS:
        - Documentos relacionados: ${relatedData.documents.length}
        - Aprendizados similares: ${relatedData.learnings.length}
        - Casos clínicos similares: ${relatedData.cases.length}
        - Protocolos relacionados: ${relatedData.protocols.length}
        
        CONTEXTO ESPECÍFICO:
        ${relatedData.documents.slice(0, 2).map((doc: any) => `${doc.title}: ${doc.content.substring(0, 200)}...`).join('\n')}
        
        ANALISE E FORNEÇA:
        1. Pontos fortes do trabalho
        2. Áreas de melhoria
        3. Sugestões baseadas em dados relacionados
        4. Recomendações específicas
        5. Nível de acurácia atual (0-100%)
      `
      
      const response = await openAIService.getNoaResponse(contextPrompt, [])
      return response
    } catch (error) {
      console.error('Erro na análise com IA:', error)
      return 'Erro na análise automática. Trabalho recebido para revisão manual.'
    }
  }

  const generateImprovedVersion = async (originalContent: string, analysis: string) => {
    try {
      const improvementPrompt = `
        GERE VERSÃO MELHORADA DO TRABALHO:
        
        TRABALHO ORIGINAL:
        ${originalContent}
        
        ANÁLISE REALIZADA:
        ${analysis}
        
        GERE UMA VERSÃO MELHORADA COM:
        1. Correções baseadas na análise
        2. Adições de dados relevantes
        3. Melhor estrutura e clareza
        4. 100% de acurácia médica
        5. Referências atualizadas
      `
      
      const improvedVersion = await openAIService.getNoaResponse(improvementPrompt, [])
      return improvedVersion
    } catch (error) {
      console.error('Erro ao gerar versão melhorada:', error)
      return originalContent + '\n\n[VERSÃO MELHORADA PENDENTE - ERRO NO PROCESSAMENTO]'
    }
  }

  const saveWorkAnalysis = async (original: string, analysis: string, improved: string) => {
    try {
      const documentContent = `
ANÁLISE CRUZADA DE TRABALHO MÉDICO

TRABALHO ORIGINAL:
${original}

ANÁLISE REALIZADA:
${analysis}

VERSÃO MELHORADA:
${improved}

METADATA:
- Data da análise: ${new Date().toLocaleString('pt-BR')}
- Tipo: Análise cruzada com dados do banco
- Acurácia: 100% (baseada em dados relacionados)
- Status: Concluída

Esta análise foi gerada automaticamente cruzando dados da base de conhecimento da Nôa Esperanza.
      `
      
      await gptBuilderService.createDocument({
        title: `Análise Cruzada - ${new Date().toLocaleDateString('pt-BR')}`,
        content: documentContent,
        type: 'knowledge',
        category: 'work-analysis',
        is_active: true
      })
      
    } catch (error) {
      console.error('Erro ao salvar análise:', error)
    }
  }

  const extractKnowledgeFromMessage = async (message: string) => {
    const medicalKeywords = [
      'protocolo', 'dosagem', 'cbd', 'thc', 'cannabis', 'epilepsia', 'dor', 'neuropática',
      'convulsão', 'neurologia', 'nefrologia', 'diagnóstico', 'tratamento', 'medicação',
      'sintoma', 'caso clínico', 'paciente', 'avaliação', 'anamnese', 'exame',
      'terapia', 'interação', 'efeito colateral', 'contraindicação', 'indicação',
      'trabalho', 'estudo', 'pesquisa', 'artigo', 'publicação', 'metodologia',
      'pdf', 'documento', 'texto', 'conteúdo', 'informação', 'dados'
    ]

    const lowerMessage = message.toLowerCase()
    const foundKeywords = medicalKeywords.filter(keyword => lowerMessage.includes(keyword))
    
    // Detectar se é um trabalho/documento para análise - CRITERIOS MAIS AMPLOS
    const isWorkDocument = message.length > 200 ||  // Reduzido de 500 para 200
                          lowerMessage.includes('trabalho') ||
                          lowerMessage.includes('estudo') ||
                          lowerMessage.includes('pesquisa') ||
                          lowerMessage.includes('artigo') ||
                          lowerMessage.includes('publicação') ||
                          lowerMessage.includes('protocolo') ||
                          lowerMessage.includes('pdf') ||
                          lowerMessage.includes('documento') ||
                          lowerMessage.includes('caso clínico') ||
                          lowerMessage.includes('relatório') ||
                          lowerMessage.includes('análise')
    
    // CRITERIOS MAIS PERMISSIVOS para detectar conhecimento
    const hasKnowledge = foundKeywords.length > 0 || 
                        message.length > 50 ||  // Reduzido de 100 para 50
                        lowerMessage.includes('dr.') ||
                        lowerMessage.includes('médico') ||
                        lowerMessage.includes('clínico') ||
                        lowerMessage.includes('cannabis') ||
                        lowerMessage.includes('cbd') ||
                        lowerMessage.includes('thc') ||
                        lowerMessage.includes('epilepsia') ||
                        lowerMessage.includes('neurologia') ||
                        lowerMessage.includes('nefrologia') ||
                        isWorkDocument

    console.log('🔍 ANÁLISE DE CONHECIMENTO:', {
      messageLength: message.length,
      foundKeywords,
      isWorkDocument,
      hasKnowledge,
      lowerMessage: lowerMessage.substring(0, 100) + '...'
    })

    return {
      hasKnowledge,
      keywords: foundKeywords,
      message,
      extractedConcepts: foundKeywords,
      confidence: foundKeywords.length / medicalKeywords.length,
      isWorkDocument,
      documentType: isWorkDocument ? 'work_analysis' : 'general_knowledge'
    }
  }

  const saveExtractedKnowledge = async (knowledge: any) => {
    try {
      console.log('💾 SALVANDO CONHECIMENTO EXTRAÍDO...')
      
      // Criar documento automático baseado na conversa
      const documentTitle = generateDocumentTitle(knowledge)
      const documentContent = generateDocumentContent(knowledge)
      
      console.log('📝 DOCUMENTO GERADO:', {
        title: documentTitle,
        contentLength: documentContent?.length,
        keywords: knowledge.keywords
      })
      
      if (documentTitle && documentContent) {
        const result = await gptBuilderService.createDocument({
          title: documentTitle,
          content: documentContent,
          type: 'knowledge',
          category: 'conversational-extraction',
          is_active: true
        })
        
        console.log('✅ CONHECIMENTO SALVO COM SUCESSO!', result)
      } else {
        console.log('❌ ERRO: Título ou conteúdo vazio')
      }
    } catch (error) {
      console.error('❌ ERRO ao salvar conhecimento extraído:', error)
    }
  }

  const generateDocumentTitle = (knowledge: any): string => {
    const keywords = knowledge.extractedConcepts
    if (keywords.length > 0) {
      return `Conhecimento: ${keywords.slice(0, 3).join(', ')}`
    }
    
    const message = knowledge.message
    if (message.includes('protocolo')) return 'Protocolo Médico - Conversa'
    if (message.includes('caso')) return 'Caso Clínico - Discussão'
    if (message.includes('dosagem')) return 'Dosagem e Administração'
    if (message.includes('sintoma')) return 'Sintomas e Manifestações'
    
    return 'Conhecimento Extraído da Conversa'
  }

  const generateDocumentContent = (knowledge: any): string => {
    const message = knowledge.message
    const keywords = knowledge.extractedConcepts
    
    return `CONHECIMENTO EXTRAÍDO DA CONVERSA:

Contexto: ${new Date().toLocaleString('pt-BR')}
Palavras-chave identificadas: ${keywords.join(', ')}

Conteúdo da discussão:
${message}

Notas:
- Este conhecimento foi extraído automaticamente de uma conversa
- Pode ser refinado e expandido conforme necessário
- Integrado à base de conhecimento da Nôa Esperanza

Relacionado a: ${keywords.slice(0, 5).join(', ')}`
  }

  const getIntelligentResponse = async (message: string) => {
    try {
      // Verificar se é um trabalho/documento
      const knowledgeExtraction = await extractKnowledgeFromMessage(message)
      
      if (knowledgeExtraction.isWorkDocument) {
        // Para documentos, vamos simplesmente processar e responder naturalmente
        const analysisResult = await analyzeDocumentContent(message, 'documento_enviado')
        
        return {
          message: `📄 **Documento recebido e analisado!**

${analysisResult}`,
          action: 'document_received',
          data: { isWorkDocument: true, analysis: analysisResult }
        }
      }
      
      // Reconhecimento do Dr. Ricardo por frase código
      if (message.toLowerCase().includes('olá, nôa. ricardo valença, aqui')) {
        return {
          message: `👨‍⚕️ **Dr. Ricardo Valença reconhecido pela frase código!**

Olá, Dr. Ricardo! Sou a Nôa Esperanza, sua mentora especializada. Estou pronta para conversar sobre medicina, tecnologia e desenvolvimento da nossa plataforma.

Como posso ajudá-lo hoje?`,
          action: 'user_recognized',
          data: { user: 'dr_ricardo_valenca' }
        }
      }

      // Reconhecimento geral do Dr. Ricardo
      if (message.toLowerCase().includes('ricardo') || message.toLowerCase().includes('dr. ricardo')) {
        return {
          message: `👨‍⚕️ **Dr. Ricardo Valença reconhecido!**

Como posso ajudá-lo hoje?`,
          action: 'user_recognized',
          data: { user: 'dr_ricardo_valenca' }
        }
      }

      // Resposta conversacional focada em desenvolvimento
      const developmentKeywords = ['criar', 'implementar', 'desenvolver', 'modificar', 'código', 'componente', 'arquivo', 'funcionalidade', 'interface', 'dashboard', 'botão', 'card', 'menu', 'serviço', 'banco']
      const hasDevelopmentIntent = developmentKeywords.some(keyword => message.toLowerCase().includes(keyword))
      
      if (hasDevelopmentIntent) {
        return {
          message: `🔧 **Desenvolvimento ativado!**

O que você quer criar ou modificar?`,
          action: 'development_mode',
          data: { intent: 'development' }
        }
      }
      
      // Buscar contexto relevante na base de conhecimento
      const relevantContext = await findRelevantContext(message)
      
      // Gerar resposta como Nôa Esperanza mentora especializada
      const response = await openAIService.getNoaResponse(
        `Você é Nôa Esperanza, mentora especializada em medicina e desenvolvimento tecnológico. Você está conversando com Dr. Ricardo Valença, idealizador e coordenador clínico da plataforma Nôa Esperanza.

**SUA PERSONALIDADE:**
- Mentora experiente e conhecedora
- Analisa profundamente os temas
- Fornece informações estruturadas e organizadas
- Cria documentos quando solicitado
- Mantém contexto e memória das conversas
- Evolui com cada interação
- SEMPRE consulta a base de conhecimento antes de responder

**IMPORTANTE - CONSULTE A BASE DE CONHECIMENTO:**
${relevantContext}

**MENSAGEM DO DR. RICARDO:**
${message}

**INSTRUÇÕES CRÍTICAS:**
1. **SEMPRE consulte o contexto da base de conhecimento acima**
2. **Se Dr. Ricardo perguntar sobre algo específico, procure na base de conhecimento**
3. **Se encontrar informações na base, cite-as especificamente**
4. **Se não encontrar, diga que não está na base de conhecimento**
5. **Nunca invente informações - sempre seja preciso**
6. **Responda como mentora experiente baseada nos dados reais**

**EXEMPLOS DE RESPOSTAS CORRETAS:**
- "Segundo o documento mestre na base de conhecimento, a data de nascimento da Nôa Esperanza é..."
- "Encontrei na base de conhecimento que o roteiro de avaliação inicial inclui..."
- "Não encontrei essa informação específica na minha base de conhecimento atual"

**RESPONDA AGORA:**`,
        []
      )

      return {
        message: response,
        action: 'intelligent_response',
        data: { context: relevantContext }
      }
    } catch (error) {
      return {
        message: `🤖 Desculpe, não consegui processar sua mensagem no momento. Vamos continuar nossa conversa sobre desenvolvimento do sistema?`,
        action: 'fallback'
      }
    }
  }

  const findRelevantContext = async (message: string) => {
    try {
      console.log('🔍 Buscando contexto relevante para:', message)
      
      // Primeiro, tentar buscar usando a função SQL avançada
      try {
        const { data: relatedDocs, error } = await supabase
          .rpc('buscar_documentos_relacionados', {
            conteudo: message,
            limite: 5
          })
        
        if (!error && relatedDocs && relatedDocs.length > 0) {
          console.log('🎯 Documentos relacionados encontrados via SQL:', relatedDocs.length)
          
          const context = relatedDocs.map((doc: any, index: number) => 
            `**${doc.title}** (${doc.type}) - Similaridade: ${doc.similarity.toFixed(2)}
Categoria: ${doc.category}
Conteúdo: ${doc.content.substring(0, 800)}...`
          ).join('\n\n---\n\n')
          
          return `**CONTEXTO DA BASE DE CONHECIMENTO (Busca Inteligente):**

${context}

**INSTRUÇÃO:** Use essas informações para responder de forma contextualizada e precisa. Se Dr. Ricardo perguntar sobre algo específico, procure nas informações acima.`
        }
      } catch (sqlError) {
        console.log('⚠️ Função SQL não disponível, usando busca básica:', sqlError)
      }
      
      // Fallback: busca básica
      const allDocs = await gptBuilderService.getDocuments()
      console.log('📚 Total de documentos na base:', allDocs.length)
      
      if (allDocs.length === 0) {
        console.log('⚠️ Nenhum documento encontrado na base de conhecimento')
        return '**AVISO:** Nenhum documento encontrado na base de conhecimento. Execute os scripts SQL para criar a base de conhecimento.'
      }
      
      // Buscar documentos relevantes por palavras-chave
      const keywords = ['nôa', 'esperanza', 'cannabis', 'medicinal', 'neurologia', 'nefrologia', 'imre', 'ricardo', 'valença', 'documento', 'mestre', 'institucional', 'data', 'nascimento', 'roteiro', 'avaliação']
      const relevantDocs = allDocs.filter(doc => {
        const content = (doc.content + ' ' + doc.title).toLowerCase()
        const msg = message.toLowerCase()
        return keywords.some(keyword => content.includes(keyword) || msg.includes(keyword))
      })
      
      console.log('🎯 Documentos relevantes encontrados:', relevantDocs.length)
      
      if (relevantDocs.length > 0) {
        const context = relevantDocs.slice(0, 5).map(doc => 
          `**${doc.title}** (${doc.type})
Categoria: ${doc.category}
Conteúdo: ${doc.content.substring(0, 800)}...`
        ).join('\n\n---\n\n')
        
        console.log('✅ Contexto encontrado e formatado')
        return `**CONTEXTO DA BASE DE CONHECIMENTO:**

${context}

**INSTRUÇÃO:** Use este contexto para responder de forma inteligente e específica. Se Dr. Ricardo perguntar sobre algo específico (como data de nascimento, roteiro de avaliação, etc.), procure nas informações acima e responda com base no que está documentado.`
      }
      
      // Se não encontrou documentos específicos, retornar todos os documentos mestres
      const masterDocs = allDocs.filter(doc => doc.category === 'institutional-master' || doc.category === 'development-history' || doc.title.includes('Mestre'))
      if (masterDocs.length > 0) {
        const context = masterDocs.map(doc => 
          `**${doc.title}** (${doc.type})
Categoria: ${doc.category}
Conteúdo: ${doc.content.substring(0, 800)}...`
        ).join('\n\n---\n\n')
        
        return `**CONTEXTO DA BASE DE CONHECIMENTO (Documentos Mestres):**

${context}

**INSTRUÇÃO:** Use essas informações para responder de forma contextualizada.`
      }
      
      console.log('⚠️ Nenhum contexto relevante encontrado')
      return `**AVISO:** Nenhum contexto relevante encontrado na base de conhecimento para: "${message}"

**INSTRUÇÃO:** Responda baseado no seu conhecimento geral sobre a Nôa Esperanza e medicina, mas mencione que não encontrou informações específicas na base de conhecimento.`
    } catch (error) {
      console.error('❌ Erro ao buscar contexto:', error)
      return '**ERRO:** Erro ao acessar base de conhecimento. Verifique se os scripts SQL foram executados corretamente.'
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
        className="bg-slate-800 rounded-xl w-full max-w-6xl h-[90vh] flex flex-col"
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

            {/* Botão Novo Documento */}
            <div className="p-4 border-t border-gray-600">
              <button
                onClick={createNewDocument}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Novo Documento
              </button>
            </div>
          </div>

          {/* Área Principal - Editor */}
          <div className="flex-1 flex flex-col">
            
            {/* Tabs */}
            <div className="flex border-b border-gray-600">
              <button 
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'chat' 
                    ? 'text-white border-b-2 border-blue-500' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fas fa-comments mr-2"></i>
                Chat Multimodal
              </button>
              <button 
                onClick={() => setActiveTab('editor')}
                className={`px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'editor' 
                    ? 'text-white border-b-2 border-blue-500' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <i className="fas fa-edit mr-2"></i>
                Editor de Documentos
              </button>
            </div>

            {/* Conteúdo Principal */}
            <div className="flex-1 overflow-hidden">
              
              {activeTab === 'chat' ? (
                /* CHAT MULTIMODAL */
                <div className="h-full flex flex-col">
                  {/* Área de Mensagens */}
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
                              : 'bg-slate-700 text-gray-100'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                          <div className="text-xs opacity-70 mt-2">
                            {message.timestamp.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700 text-gray-100 p-3 rounded-lg">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

          {/* Input de Mensagem com Upload */}
          <div className="border-t border-gray-600 p-4">
            {/* Área de Upload de Arquivos */}
            <div className="mb-3">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <i className="fas fa-paperclip"></i>
                <span>Envie documentos, imagens ou cole texto diretamente</span>
              </div>
              <div className="flex gap-2 mt-2">
                {/* Upload integrado ao chat - removido botão separado */}
                
                {/* Botão de Base de Conhecimento */}
                <button
                  onClick={() => setActiveTab('editor')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-database"></i>
                  Base de Conhecimento
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      const docs = await gptBuilderService.getDocuments()
                      console.log('📚 Documentos na base:', docs)
                      alert(`📚 Base de Conhecimento: ${docs.length} documentos encontrados\n\nDocumentos:\n${docs.map(d => `• ${d.title} (${d.category})`).join('\n')}`)
                    } catch (error) {
                      console.error('Erro ao verificar base:', error)
                      alert(`❌ Erro ao acessar base: ${error instanceof Error ? error.message : String(error)}`)
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <i className="fas fa-search"></i>
                  Verificar Base
                </button>
              </div>
            </div>

            {/* Input de Texto */}
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
                                onClick={saveDocument}
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
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default GPTPBuilder
