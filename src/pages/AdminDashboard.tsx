import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAdminMetrics, getRecentUsers, getSystemStats, AdminMetrics } from '../services/supabaseService'
import AILearningDashboard from '../components/AILearningDashboard'
import DocumentUploadModal from '../components/DocumentUploadModal'
import ManualTrainingModal from '../components/ManualTrainingModal'
import GPTPBuilder from '../components/GPTPBuilder'
import Sidebar from '../components/Sidebar'

interface AdminDashboardProps {
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const AdminDashboard = ({ addNotification }: AdminDashboardProps) => {
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    systemUptime: 99.9,
    totalDoctors: 0,
    totalPatients: 0,
    totalInteractions: 0,
    aiLearningCount: 0,
    totalAvaliacoes: 0,
    avaliacoesCompletas: 0,
    avaliacoesEmAndamento: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [systemStats, setSystemStats] = useState<any>({ aiStats: [], topKeywords: [] })
  const [showAILearningDashboard, setShowAILearningDashboard] = useState(false)
  const [showDocumentUpload, setShowDocumentUpload] = useState(false)
  const [showManualTraining, setShowManualTraining] = useState(false)
  const [showGPTPBuilder, setShowGPTPBuilder] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  // Itens do sidebar administrativo
  const adminSidebarItems = [
    {
      id: 'payments',
      label: 'Gestão de Pagamentos',
      icon: 'fa-credit-card',
      color: 'green',
      route: '/payment'
    },
    {
      id: 'users',
      label: 'Gestão de Usuários',
      icon: 'fa-users',
      color: 'blue',
      action: () => addNotification('Funcionalidade em desenvolvimento', 'info')
    },
    {
      id: 'analytics',
      label: 'Analytics & Relatórios',
      icon: 'fa-chart-line',
      color: 'yellow',
      action: () => addNotification('Funcionalidade em desenvolvimento', 'info')
    },
    {
      id: 'gpt-builder',
      label: 'GPT Builder - Base de Conhecimento',
      icon: 'fa-robot',
      color: 'purple',
      action: () => setShowGPTPBuilder(true)
    },
    {
      id: 'ai-learning',
      label: 'IA Learning Dashboard',
      icon: 'fa-brain',
      color: 'blue',
      action: () => setShowAILearningDashboard(true)
    },
    {
      id: 'document-upload',
      label: 'Upload de Documentos',
      icon: 'fa-upload',
      color: 'orange',
      action: () => setShowDocumentUpload(true)
    },
    {
      id: 'manual-training',
      label: 'Treinamento Manual da IA',
      icon: 'fa-edit',
      color: 'red',
      action: () => setShowManualTraining(true)
    },
    {
      id: 'system-settings',
      label: 'Configurações do Sistema',
      icon: 'fa-cog',
      color: 'gray',
      action: () => addNotification('Funcionalidade em desenvolvimento', 'info')
    },
    {
      id: 'backup-restore',
      label: 'Backup & Restore',
      icon: 'fa-database',
      color: 'indigo',
      action: () => addNotification('Funcionalidade em desenvolvimento', 'info')
    }
  ]

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // Carregar métricas principais
        const metricsData = await getAdminMetrics()
        setMetrics(metricsData)
        
        // Carregar usuários recentes
        const usersData = await getRecentUsers(5)
        setRecentUsers(usersData)
        
        // Carregar estatísticas do sistema
        const statsData = await getSystemStats()
        setSystemStats(statsData)
        
        addNotification('Dashboard carregado com dados reais', 'success')
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        addNotification('Erro ao carregar dados do dashboard', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
    
    // Atualizar dados a cada 30 segundos
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [addNotification])

  return (
    <div className="h-full overflow-hidden">
      <div className="flex h-full gap-4 p-4">
        
        {/* Sidebar com Ações Administrativas */}
        <div className="w-80 flex-shrink-0 hidden lg:block">
          <Sidebar 
            title="Ações Administrativas" 
            items={adminSidebarItems}
            className="h-full"
          />
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-6 h-full">
            
            {/* Header */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <Link to="/" className="inline-block text-yellow-400 hover:text-yellow-300">
                  <i className="fas fa-arrow-left text-sm"></i> Voltar
                </Link>
                {/* Botão para mostrar sidebar em mobile */}
                <button 
                  onClick={() => setShowMobileSidebar(true)}
                  className="lg:hidden text-yellow-400 hover:text-yellow-300 p-2"
                >
                  <i className="fas fa-bars text-lg"></i>
                </button>
              </div>
              <h1 className="text-lg font-bold text-premium mb-1">Dashboard Administrativo</h1>
              <p className="text-gray-300 text-xs">Gestão completa do sistema NeuroCanLab</p>
            </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
          
          <div className="premium-card p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Total Usuários</p>
                <p className="text-lg font-bold text-premium">
                  {loading ? '...' : metrics.totalUsers.toLocaleString()}
                </p>
                <p className="text-green-400 text-xs">Ativos</p>
              </div>
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-blue-400 text-sm"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Médicos</p>
                <p className="text-lg font-bold text-premium">
                  {loading ? '...' : metrics.totalDoctors.toLocaleString()}
                </p>
                <p className="text-blue-400 text-xs">Profissionais</p>
              </div>
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-user-md text-green-400 text-sm"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Interações IA</p>
                <p className="text-lg font-bold text-premium">
                  {loading ? '...' : metrics.totalInteractions.toLocaleString()}
                </p>
                <p className="text-purple-400 text-xs">Aprendizado</p>
              </div>
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-brain text-purple-400 text-sm"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Avaliações Clínicas</p>
                <p className="text-lg font-bold text-premium">
                  {loading ? '...' : metrics.totalAvaliacoes.toLocaleString()}
                </p>
                <p className="text-green-400 text-xs">{metrics.avaliacoesCompletas} completas</p>
              </div>
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-stethoscope text-green-400 text-sm"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
          
          {/* Recent Users */}
          <div className="premium-card p-2">
            <h2 className="text-sm font-semibold text-premium mb-2">Usuários Recentes</h2>
            <div className="space-y-1">
              {loading ? (
                <div className="text-center text-gray-400 text-xs">Carregando...</div>
              ) : recentUsers.length > 0 ? (
                recentUsers.map((user, index) => (
                  <div key={user.id || index} className="flex items-center justify-between p-1 border border-gray-600 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-blue-400 text-xs"></i>
                      </div>
                      <div>
                        <div className="font-medium text-white text-xs">{user.name || user.email}</div>
                        <div className="text-xs text-gray-400">{user.role || 'Usuário'}</div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 text-xs">Nenhum usuário encontrado</div>
              )}
            </div>
          </div>

          {/* AI Statistics */}
          <div className="premium-card p-2">
            <h2 className="text-sm font-semibold text-premium mb-2">Estatísticas da IA</h2>
            <div className="space-y-1">
              {loading ? (
                <div className="text-center text-gray-400 text-xs">Carregando...</div>
              ) : systemStats.topKeywords.length > 0 ? (
                systemStats.topKeywords.slice(0, 3).map((keyword: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-1 border border-gray-600 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <i className="fas fa-key text-purple-400 text-xs"></i>
                      </div>
                      <div>
                        <div className="font-medium text-white text-xs">{keyword.keyword}</div>
                        <div className="text-xs text-gray-400">{keyword.category}</div>
                      </div>
                    </div>
                    <span className="text-purple-400 font-semibold text-xs">{keyword.usage_count}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 text-xs">Nenhuma palavra-chave encontrada</div>
              )}
            </div>
          </div>
        </div>

          </div>
        </div>
      </div>

      {/* Sidebar Mobile Overlay */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowMobileSidebar(false)}
          ></div>
          
          {/* Sidebar Mobile */}
          <div className="absolute left-0 top-0 h-full w-80 bg-slate-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-premium text-lg font-semibold">Ações Administrativas</h3>
              <button 
                onClick={() => setShowMobileSidebar(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fas fa-times text-lg"></i>
              </button>
            </div>
            
            <Sidebar 
              title="" 
              items={adminSidebarItems}
              className="h-full"
            />
          </div>
        </div>
      )}

      {/* Modais de IA */}
      {showGPTPBuilder && (
        <GPTPBuilder onClose={() => setShowGPTPBuilder(false)} />
      )}

      {showAILearningDashboard && (
        <AILearningDashboard onClose={() => setShowAILearningDashboard(false)} />
      )}

      {showDocumentUpload && (
        <DocumentUploadModal onClose={() => setShowDocumentUpload(false)} />
      )}

      {showManualTraining && (
        <ManualTrainingModal onClose={() => setShowManualTraining(false)} />
      )}
    </div>
  )
}

export default AdminDashboard
