import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Specialty } from '../App'
import GPTPBuilder from '../components/GPTPBuilder'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import { sharingService, Doctor } from '../services/sharingService' // 🔗 Sistema de compartilhamento
import { consentService } from '../services/consentService' // 🔐 Consentimentos
import { supabase } from '../integrations/supabase/client' // 💾 Supabase

type NotificationType = 'info' | 'success' | 'warning' | 'error'

interface DashboardPacienteProps {
  currentSpecialty: Specialty
  addNotification: (message: string, type?: NotificationType) => void
}

const specialtyCopy: Record<Specialty, { title: string; description: string; accent: string }> = {
  rim: {
    title: 'Programa de Cuidado Renal',
    description: 'A Nôa acompanha a jornada nefrológica com monitoramento de exames, medicações e educação contínua.',
    accent: 'from-emerald-400 to-green-600'
  },
  neuro: {
    title: 'Programa de Neurologia Integrada',
    description: 'Assistência inteligente para acompanhamento de sintomas neurológicos, planos terapêuticos e suporte familiar.',
    accent: 'from-sky-400 to-blue-600'
  },
  cannabis: {
    title: 'Programa de Cannabis Medicinal',
    description: 'Orientações personalizadas sobre titulação, adesão terapêutica e telemonitoramento com equipe especializada.',
    accent: 'from-lime-400 to-emerald-500'
  }
}

const DashboardPaciente = ({ currentSpecialty, addNotification }: DashboardPacienteProps) => {
  const { user, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'chat' | 'reports'>('profile')
  const [clinicalReport, setClinicalReport] = useState<any>(null)
  const [nftHash, setNftHash] = useState<string>('')
  const [sharingModal, setSharingModal] = useState(false) // 🔗 Modal de compartilhamento
  const [doctors, setDoctors] = useState<Doctor[]>([]) // 👨‍⚕️ Lista de médicos
  const [isSharing, setIsSharing] = useState(false) // Loading state
  
  const profile = useMemo(() => specialtyCopy[currentSpecialty], [currentSpecialty])

  const builderUserId = user?.id || 'noa-paciente-guest'
  const builderUserName = userProfile?.name || user?.email || 'Paciente Nôa'

  useEffect(() => {
    // Carregar último relatório do Supabase primeiro, depois localStorage
    const loadReport = async () => {
      try {
        // 1. Tentar buscar do Supabase
        if (user?.id) {
          const { data, error } = await supabase
            .from('avaliacoes_iniciais')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (data && !error) {
            const reportData = typeof data.dados === 'string' ? JSON.parse(data.dados) : data.dados
            setClinicalReport({
              ...reportData,
              pdfUrl: data.pdf_url,
              assessmentId: data.id
            })
            setNftHash(data.nft_hash || '')
            console.log('✅ Relatório carregado do Supabase')
            return
          }
        }

        // 2. Fallback: localStorage
        const lastReport = localStorage.getItem('last_clinical_report')
        if (lastReport) {
          const parsedReport = JSON.parse(lastReport)
          setClinicalReport(parsedReport)
          setNftHash(parsedReport.nftHash || '')
          console.log('✅ Relatório carregado do localStorage')
        }
      } catch (error) {
        console.warn('⚠️ Erro ao carregar relatório:', error)
      }
    }

    loadReport()
  }, [user, addNotification])

  const downloadReport = () => {
    if (!clinicalReport) return
    
    // Se tem pdfUrl do Supabase, usa ele
    if (clinicalReport.pdfUrl) {
      window.open(clinicalReport.pdfUrl, '_blank')
      addNotification('Abrindo relatório em nova aba...', 'info')
      return
    }
    
    // Fallback: gerar do summary
    const reportText = clinicalReport.summary || 'Relatório não disponível'
    const blob = new Blob([reportText], { type: 'text/plain; charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_clinico_noa_${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    addNotification('Relatório baixado com sucesso!', 'success')
  }

  // 🔗 FUNÇÃO DE COMPARTILHAR RELATÓRIO
  const handleOpenSharingModal = async () => {
    if (!user) {
      addNotification('Você precisa estar logado para compartilhar', 'error')
      return
    }

    // Verificar consentimento
    const hasConsent = await consentService.hasConsent(user.id, 'dataSharing')
    if (!hasConsent) {
      addNotification('Você precisa autorizar compartilhamento nas configurações', 'warning')
      return
    }

    // Buscar médicos disponíveis
    const availableDoctors = await sharingService.getAvailableDoctors(currentSpecialty)
    setDoctors(availableDoctors)
    setSharingModal(true)
  }

  // 🔗 FUNÇÃO DE COMPARTILHAR COM MÉDICO
  const handleShareWithDoctor = async (doctorId: string) => {
    if (!user || !clinicalReport) return
    
    setIsSharing(true)
    
    const result = await sharingService.shareReportWithDoctor(
      user.id,
      doctorId,
      clinicalReport.id,
      1 // read permission
    )
    
    setIsSharing(false)
    
    if (result.success) {
      addNotification('Relatório compartilhado com sucesso!', 'success')
      setSharingModal(false)
    } else {
      addNotification(result.error || 'Erro ao compartilhar relatório', 'error')
    }
  }

  // Itens da sidebar para pacientes
  const sidebarItems = [
    {
      id: 'chat',
      label: 'Chat com Nôa',
      icon: 'fa-comments',
      color: 'emerald',
      action: () => setActiveTab('chat')
    },
    {
      id: 'duvidas',
      label: 'Dúvidas Médicas',
      icon: 'fa-comment-medical',
      color: 'emerald',
      action: () => setActiveTab('chat')
    },
    {
      id: 'avaliacao',
      label: 'Avaliação Clínica',
      icon: 'fa-file-medical',
      color: 'blue',
      action: () => setActiveTab('chat')
    },
    {
      id: 'acompanhamento',
      label: 'Acompanhamento',
      icon: 'fa-calendar-check',
      color: 'purple',
      action: () => setActiveTab('chat')
    },
    {
      id: 'reports',
      label: 'Ver Relatórios',
      icon: 'fa-file-alt',
      color: 'purple',
      action: () => setActiveTab('reports')
    },
    {
      id: 'profile',
      label: 'Meu Perfil',
      icon: 'fa-user',
      color: 'blue',
      action: () => setActiveTab('profile')
    }
  ]

  return (
    <div className="h-full overflow-hidden">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-3 mb-1">
        <div className="premium-card p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Link to="/" className="text-emerald-300 hover:text-emerald-200">
                <i className="fas fa-arrow-left text-sm"></i>
              </Link>
              <div className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${profile.accent} bg-opacity-20 flex items-center justify-center`}>
                  <i className="fas fa-user-md text-xs text-emerald-400"></i>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-premium">Dashboard Paciente</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="h-full flex">
        {/* Sidebar Fixa - Lateral Esquerda */}
        <div className="w-80 flex-shrink-0 bg-white/10 backdrop-blur-sm border-r border-white/20 p-4 fixed left-0 top-[7vh] h-[79.5vh] overflow-y-auto z-20">
          <Sidebar 
            title="Acesso Rápido" 
            items={sidebarItems}
            className="h-full"
          />
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 ml-80 pl-2 pr-4 py-2 h-full overflow-y-auto">
          <div className="w-full">
            {/* Conteúdo das Tabs */}
            <div className="bg-black/40 rounded-3xl border border-white/10 shadow-xl backdrop-blur overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-white/10">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'profile'
                      ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className="fas fa-user mr-2"></i>
                  Meu Perfil
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className="fas fa-comments mr-2"></i>
                  Chat com Nôa
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'reports'
                      ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className="fas fa-file-alt mr-2"></i>
                  Relatórios
                </button>
              </div>

              {/* Conteúdo das Tabs */}
              <div className="p-6">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-r from-emerald-400 to-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <i className="fas fa-user text-white text-2xl"></i>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">{builderUserName}</h2>
                      <p className="text-gray-400">Paciente Nôa Esperanza</p>
                    </div>

                    {clinicalReport && (
                      <div className="bg-slate-800/50 rounded-xl p-6 border border-emerald-400/20">
                        <h3 className="text-lg font-semibold text-emerald-400 mb-4">
                          <i className="fas fa-file-medical mr-2"></i>
                          Último Relatório Clínico
                        </h3>
                        <div className="prose prose-invert max-w-none">
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {clinicalReport.summary?.substring(0, 300)}...
                          </p>
                        </div>
                        {nftHash && (
                          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
                            <p className="text-xs text-gray-400">NFT Hash:</p>
                            <p className="text-emerald-400 font-mono text-xs break-all">{nftHash}</p>
                          </div>
                        )}
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={downloadReport}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <i className="fas fa-download mr-2"></i>
                            Baixar Relatório
                          </button>
                          <button
                            onClick={handleOpenSharingModal}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            <i className="fas fa-share-alt mr-2"></i>
                            Compartilhar com Médico
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          <i className="fas fa-chart-line mr-2 text-blue-400"></i>
                          Progresso
                        </h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Avaliações Realizadas</span>
                            <span className="text-white">{clinicalReport ? '1' : '0'}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Última Atualização</span>
                            <span className="text-white">{clinicalReport ? new Date().toLocaleDateString('pt-BR') : 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-800/50 rounded-xl p-6 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-3">
                          <i className="fas fa-calendar mr-2 text-green-400"></i>
                          Próximos Passos
                        </h3>
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-400">• Agendar consulta com Dr. Ricardo</p>
                          <p className="text-gray-400">• Revisar relatório clínico</p>
                          <p className="text-gray-400">• Preparar exames necessários</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'chat' && (
                  <div>
                    {/* Chat Container */}
                    <div className="bg-slate-900/50 rounded-xl p-3 border border-emerald-500/20 shadow-2xl">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-emerald-500/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg">
                            <i className="fas fa-robot text-white text-lg"></i>
                          </div>
                          <div>
                            <h3 className="text-white font-semibold">Nôa Esperanza</h3>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <p className="text-emerald-400 text-xs">Online • Pronta para ajudar</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          <i className="fas fa-shield-alt text-emerald-400 mr-1"></i>
                          Seguro
                        </div>
                      </div>
                      
                      <div className="h-[360px] overflow-hidden rounded-lg bg-slate-950/30">
                        <GPTPBuilder 
                          embedded 
                          userId={builderUserId}
                          userName={builderUserName}
                          userType="paciente"
                        />
                      </div>
                      
                      <div className="mt-3 pt-2 border-t border-emerald-500/20">
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <i className="fas fa-lock text-emerald-400"></i>
                            <span>Criptografado</span>
                          </div>
                          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                          <div className="flex items-center gap-1">
                            <i className="fas fa-user-shield text-emerald-400"></i>
                            <span>Dados Protegidos</span>
                          </div>
                          <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                          <div className="flex items-center gap-1">
                            <i className="fas fa-hospital text-emerald-400"></i>
                            <span>LGPD Compliance</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">Relatórios Clínicos</h2>
                    
                    {clinicalReport ? (
                      <div className="bg-slate-800/50 rounded-xl p-6 border border-emerald-400/20">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-emerald-400">
                            <i className="fas fa-file-medical mr-2"></i>
                            Relatório de Avaliação Clínica
                          </h3>
                          <span className="text-xs text-gray-400">
                            {new Date().toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        
                        <div className="prose prose-invert max-w-none mb-6">
                          <pre className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed">
                            {clinicalReport.summary}
                          </pre>
                        </div>

                        {nftHash && (
                          <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">NFT Hash (Certificação):</p>
                            <p className="text-emerald-400 font-mono text-xs break-all">{nftHash}</p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={downloadReport}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                          >
                            <i className="fas fa-download mr-2"></i>
                            Baixar Relatório
                          </button>
                          <button
                            onClick={handleOpenSharingModal}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                          >
                            <i className="fas fa-share-alt mr-2"></i>
                            Compartilhar com Médico
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <i className="fas fa-file-medical text-6xl text-gray-600 mb-4"></i>
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">Nenhum relatório disponível</h3>
                        <p className="text-gray-500 mb-6">Converse com a Nôa para gerar relatórios clínicos personalizados.</p>
                        <button
                          onClick={() => setActiveTab('chat')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        >
                          <i className="fas fa-comments mr-2"></i>
                          Chat com Nôa
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🔗 MODAL DE COMPARTILHAMENTO */}
      {sharingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-xl p-6 max-w-md w-full mx-4 border border-emerald-500/20 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                <i className="fas fa-share-alt mr-2 text-emerald-400"></i>
                Compartilhar Relatório
              </h3>
              <button
                onClick={() => setSharingModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            
            <p className="text-gray-400 mb-4">
              Selecione o médico com quem deseja compartilhar seu relatório clínico:
            </p>
            
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              {doctors.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-user-md text-4xl text-gray-600 mb-2"></i>
                  <p className="text-gray-400">Nenhum médico disponível</p>
                </div>
              ) : (
                doctors.map(doctor => (
                  <button
                    key={doctor.id}
                    onClick={() => handleShareWithDoctor(doctor.id)}
                    disabled={isSharing}
                    className="w-full p-4 bg-slate-800/50 hover:bg-slate-700 rounded-lg text-left transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <i className="fas fa-user-md text-white text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-white">{doctor.name}</div>
                        <div className="text-sm text-gray-400">
                          {doctor.specialty} • CRM: {doctor.crm}
                        </div>
                      </div>
                      <i className="fas fa-arrow-right text-emerald-400"></i>
                    </div>
                  </button>
                ))
              )}
            </div>
            
            <button
              onClick={() => setSharingModal(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPaciente