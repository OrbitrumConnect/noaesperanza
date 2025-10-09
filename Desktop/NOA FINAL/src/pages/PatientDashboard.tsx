import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clinicalAgentService, PatientContext, ClinicalSession } from '../services/clinicalAgentService'
import { ClinicalAssessment } from '../components/ClinicalAssessment'
import { logger } from '../utils/logger'

interface PatientDashboardProps {
  userEmail: string
  onLogout: () => void
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  action?: string
  data?: any
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ userEmail, onLogout }) => {
  // Estados principais
  const [activeTab, setActiveTab] = useState<'chat' | 'assessment' | 'profile' | 'security'>('assessment')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  // Estados de contexto do paciente
  const [patientContext, setPatientContext] = useState<PatientContext | null>(null)
  const [currentSession, setCurrentSession] = useState<ClinicalSession | null>(null)
  const [consentGiven, setConsentGiven] = useState(false)
  const [lgpdAccepted, setLgpdAccepted] = useState(false)
  
  // Estados de segurança
  const [sessionId] = useState(`patient_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [patientName, setPatientName] = useState('')
  const [nftHash, setNftHash] = useState<string | null>(null)
  const [lastAssessmentReport, setLastAssessmentReport] = useState<string | null>(null)

  // Inicializar contexto do paciente
  useEffect(() => {
    initializePatientContext()
  }, [])

  const initializePatientContext = async () => {
    try {
      // Simular dados do paciente (em produção, viriam do Supabase)
      const context: PatientContext = {
        userId: `patient_${userEmail.replace('@', '_')}`,
        userEmail,
        patientName: patientName || 'Paciente',
        consentGiven,
        nftHash,
        sessionId,
        permissions: {
          canAccessClinicalData: consentGiven && lgpdAccepted,
          canGenerateReports: consentGiven && lgpdAccepted,
          canCreateNFT: consentGiven && lgpdAccepted,
          lgpdCompliant: lgpdAccepted
        }
      }

      setPatientContext(context)
      
      // Inicializar sessão se tiver permissões
      if (context.permissions.canAccessClinicalData) {
        await initializeClinicalSession(context)
      }

      logger.info('✅ Contexto do paciente inicializado', { userId: context.userId })

      // Carregar último relatório salvo localmente (fallback)
      try {
        const saved = localStorage.getItem('kpi_last_assessment_report')
        if (saved) {
          const parsed = JSON.parse(saved)
          setLastAssessmentReport(parsed?.summary || '')
        }
        const savedNft = localStorage.getItem('kpi_last_assessment_nft')
        if (savedNft) setNftHash(savedNft)
      } catch {}
    } catch (error) {
      logger.error('❌ Erro ao inicializar contexto do paciente', error)
    }
  }

  const initializeClinicalSession = async (context: PatientContext) => {
    try {
      const session = await clinicalAgentService.initializePatientSession(context)
      setCurrentSession(session)
      
      // Mensagem de boas-vindas
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Olá! Eu sou Nôa Esperanza, sua assistente médica especializada. 

Estou aqui para conduzir sua avaliação clínica inicial de forma segura e confidencial, seguindo o método desenvolvido pelo Dr. Ricardo Valença.

🔒 **Seus dados estão protegidos** com compliance LGPD
📋 **Avaliação estruturada** para otimizar sua consulta
🤖 **IA especializada** em medicina clínica

Como posso ajudá-lo hoje?`,
        timestamp: new Date(),
        action: 'welcome_message'
      }

      setChatMessages([welcomeMessage])
      logger.info('✅ Sessão clínica inicializada', { sessionId: session.id })
    } catch (error) {
      logger.error('❌ Erro ao inicializar sessão clínica', error)
    }
  }

  const handleConsentAccept = () => {
    setConsentGiven(true)
    setLgpdAccepted(true)
    
    // Re-inicializar contexto com permissões
    setTimeout(() => {
      initializePatientContext()
    }, 500)
  }

  const sendMessage = async () => {
    if (!currentMessage.trim() || !patientContext || !currentSession) return

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
      const response = await clinicalAgentService.processPatientMessage(
        messageToProcess,
        patientContext,
        currentSession.id
      )

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        action: response.action,
        data: response.data
      }

      setChatMessages(prev => [...prev, assistantMessage])

      // Se requer consentimento, mostrar modal
      if (response.requiresConsent) {
        setConsentGiven(false)
        setLgpdAccepted(false)
      }

    } catch (error) {
      logger.error('❌ Erro ao processar mensagem', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro interno. Tente novamente.',
        timestamp: new Date(),
        action: 'error'
      }
      setChatMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleAssessmentComplete = async (report: any, nftHash: string) => {
    if (currentSession) {
      await clinicalAgentService.completeClinicalSession(currentSession.id, report, nftHash)
      setNftHash(nftHash)
      
      // Adicionar mensagem de conclusão
      const completionMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🎉 **Avaliação clínica concluída com sucesso!**

📋 Seu relatório foi gerado e está disponível para download
🔗 NFT Hash: \`${nftHash}\`
📅 Próximo passo: Agende sua consulta com Dr. Ricardo Valença

Obrigado por confiar na Nôa Esperanza para sua avaliação inicial!`,
        timestamp: new Date(),
        action: 'assessment_completed',
        data: { report, nftHash }
      }

      setChatMessages(prev => [...prev, completionMessage])
    }
  }

  // Modal de consentimento LGPD
  if (!consentGiven || !lgpdAccepted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 rounded-xl p-8 max-w-2xl w-full border border-slate-700"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-shield-alt text-white text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Consentimento LGPD</h2>
            <p className="text-gray-400">Para usar a Nôa Esperanza, precisamos do seu consentimento</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">📋 Finalidade dos Dados</h3>
              <p className="text-gray-300 text-sm">
                Coletamos seus dados para conduzir avaliação clínica inicial, 
                otimizar sua consulta médica e gerar relatórios personalizados.
              </p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">🔒 Proteção de Dados</h3>
              <p className="text-gray-300 text-sm">
                Seus dados são criptografados, armazenados com segurança e 
                utilizados exclusivamente para fins médicos autorizados.
              </p>
            </div>

            <div className="bg-slate-700 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">⏰ Retenção</h3>
              <p className="text-gray-300 text-sm">
                Mantemos seus dados por 1 ano após sua última interação, 
                conforme exigências médicas e legais.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConsentAccept}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Aceitar e Continuar
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-user-md text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard do Paciente</h1>
              <p className="text-sm text-gray-400">Nôa Esperanza - Assistente Clínica Especializada</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{userEmail}</span>
            <button
              onClick={onLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex">
            <button
              onClick={() => setActiveTab('chat')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'text-white border-b-2 border-blue-500 bg-slate-700'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <i className="fas fa-comments mr-2"></i>
              Chat com Nôa
            </button>
            <button
              onClick={() => setActiveTab('assessment')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'assessment'
                  ? 'text-white border-b-2 border-green-500 bg-slate-700'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <i className="fas fa-clipboard-list mr-2"></i>
              Avaliação Clínica Inicial
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'profile'
                  ? 'text-white border-b-2 border-purple-500 bg-slate-700'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <i className="fas fa-user mr-2"></i>
              Meu Perfil
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'text-white border-b-2 border-yellow-500 bg-slate-700'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <i className="fas fa-shield-alt mr-2"></i>
              Segurança & LGPD
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Chat Container */}
              <div className="bg-slate-800 rounded-xl border border-slate-700 h-96 overflow-y-auto p-4">
                {chatMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <div className="text-center">
                      <i className="fas fa-comments text-4xl mb-4 opacity-50"></i>
                      <p>Inicie uma conversa com Nôa Esperanza</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-slate-700 text-white px-4 py-2 rounded-lg">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="flex gap-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Digite sua mensagem para Nôa Esperanza..."
                  className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  disabled={!patientContext || !currentSession}
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || !patientContext || !currentSession}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'assessment' && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ClinicalAssessment
                onComplete={handleAssessmentComplete}
                onUpdateKPIs={() => {}} // Não usado no contexto do paciente
              />
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Meu Perfil</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                      placeholder="Digite seu nome"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={userEmail}
                      disabled
                      className="w-full bg-slate-600 border border-slate-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  {nftHash && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        NFT Hash
                      </label>
                      <input
                        type="text"
                        value={nftHash}
                        disabled
                        className="w-full bg-slate-600 border border-slate-600 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed font-mono text-sm"
                      />
                    </div>
                  )}
                  {lastAssessmentReport && (
                    <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                      <h3 className="text-green-400 text-sm font-semibold mb-2">📄 Relatório da Avaliação Clínica Inicial</h3>
                      <pre className="text-xs text-gray-200 whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">{lastAssessmentReport}</pre>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs"
                          onClick={() => {
                            const blob = new Blob([lastAssessmentReport], { type: 'text/plain;charset=utf-8' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = 'relatorio_avaliacao_inicial.txt'
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                        >
                          Baixar Relatório
                        </button>
                        {nftHash && (
                          <span className="text-xs text-green-400 font-mono">NFT: {nftHash}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4">Segurança & LGPD</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <i className="fas fa-check-circle text-green-400 text-xl"></i>
                    <div>
                      <p className="text-green-400 font-medium">Consentimento LGPD</p>
                      <p className="text-gray-400 text-sm">Você autorizou o uso de seus dados</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <i className="fas fa-shield-alt text-blue-400 text-xl"></i>
                    <div>
                      <p className="text-blue-400 font-medium">Dados Criptografados</p>
                      <p className="text-gray-400 text-sm">Seus dados estão protegidos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <i className="fas fa-clock text-purple-400 text-xl"></i>
                    <div>
                      <p className="text-purple-400 font-medium">Retenção: 1 Ano</p>
                      <p className="text-gray-400 text-sm">Dados mantidos conforme LGPD</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PatientDashboard