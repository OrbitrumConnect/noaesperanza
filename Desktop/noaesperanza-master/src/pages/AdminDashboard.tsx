import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getAdminMetrics, getRecentUsers, getSystemStats, AdminMetrics } from '../services/supabaseService'

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
    aiLearningCount: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [systemStats, setSystemStats] = useState<any>({ aiStats: [], topKeywords: [] })
  const [hasLoaded, setHasLoaded] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalUsers, setTotalUsers] = useState(0)
  const usersPerPage = 10

  useEffect(() => {
    const loadDashboardData = async (showNotification = false) => {
      try {
        setLoading(true)
        
        // Carregar métricas principais
        const metricsData = await getAdminMetrics()
        setMetrics(metricsData)
        
        // Carregar usuários recentes com paginação
        const usersData = await getRecentUsers(usersPerPage)
        setRecentUsers(usersData)
        setTotalUsers(usersData.length)
        
        // Carregar estatísticas do sistema
        const statsData = await getSystemStats()
        setSystemStats(statsData)
        
        // Notificação removida para evitar spam
        setHasLoaded(true)
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error)
        if (showNotification) {
          addNotification('Erro ao carregar dados do dashboard', 'error')
        }
      } finally {
        setLoading(false)
      }
    }

    // Carregamento inicial com notificação
    loadDashboardData(true)
    
    // Atualizar dados a cada 30 segundos (sem notificação)
    const interval = setInterval(() => loadDashboardData(false), 30000)
    return () => clearInterval(interval)
  }, []) // Removido addNotification das dependências

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const totalPages = Math.ceil(totalUsers / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const currentUsers = recentUsers.slice(startIndex, endIndex)

  return (
    <div className="h-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 h-full pb-20">
        
        {/* Header */}
        <div className="mb-1">
          <Link to="/" className="inline-block text-yellow-400 hover:text-yellow-300 mb-0.5">
            <i className="fas fa-arrow-left text-xs"></i> Voltar
          </Link>
          <h1 className="text-sm font-bold text-premium mb-0.5">Dashboard Administrativo</h1>
          <p className="text-gray-300 text-xs">Gestão completa do sistema NeuroCanLab</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5 mb-1.5">
          
          <div className="premium-card p-1.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Total Usuários</p>
                <p className="text-sm font-bold text-premium">
                  {loading ? '...' : metrics.totalUsers.toLocaleString()}
                </p>
                <p className="text-green-400 text-xs">Ativos</p>
              </div>
              <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-blue-400 text-xs"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-1.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Médicos</p>
                <p className="text-sm font-bold text-premium">
                  {loading ? '...' : metrics.totalDoctors.toLocaleString()}
                </p>
                <p className="text-blue-400 text-xs">Profissionais</p>
              </div>
              <div className="w-7 h-7 bg-green-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-user-md text-green-400 text-xs"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-1.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Interações IA</p>
                <p className="text-sm font-bold text-premium">
                  {loading ? '...' : metrics.totalInteractions.toLocaleString()}
                </p>
                <p className="text-purple-400 text-xs">Aprendizado</p>
              </div>
              <div className="w-7 h-7 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-brain text-purple-400 text-xs"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-1.5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Palavras-chave</p>
                <p className="text-sm font-bold text-premium">
                  {loading ? '...' : metrics.aiLearningCount.toLocaleString()}
                </p>
                <p className="text-yellow-400 text-xs">Conhecimento</p>
              </div>
              <div className="w-7 h-7 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-key text-yellow-400 text-xs"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Management Tools */}
        <div className="flex gap-1.5 mb-1.5">
          
          {/* Recent Users */}
          <div className="flex-1 premium-card p-1">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-semibold text-premium">Usuários Recentes</h2>
              {totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center text-xs disabled:opacity-50"
                  >
                    ‹
                  </button>
                  <span className="text-xs text-gray-400">{currentPage}/{totalPages}</span>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-5 h-5 bg-gray-600 rounded flex items-center justify-center text-xs disabled:opacity-50"
                  >
                    ›
                  </button>
                </div>
              )}
            </div>
            <div className="space-y-0.5 max-h-48 overflow-y-auto">
              {loading ? (
                <div className="text-center text-gray-400 text-xs">Carregando...</div>
              ) : currentUsers.length > 0 ? (
                currentUsers.map((user, index) => (
                  <div key={user.id || index} className="flex items-center justify-between p-0.5 border border-gray-600 rounded text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-blue-400 text-xs"></i>
                      </div>
                      <div>
                        <div className="font-medium text-white text-xs truncate max-w-24">{user.name || user.email}</div>
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
          <div className="w-44 premium-card p-1.5">
            <div>
              <p className="text-gray-300 text-xs">Top Keyword</p>
              <p className="text-sm font-bold text-premium">
                {loading ? '...' : systemStats.topKeywords.length > 0 ? systemStats.topKeywords[0].keyword : 'N/A'}
              </p>
              <p className="text-purple-400 text-xs">IA Learning</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="premium-card p-1.5">
          <h2 className="text-xs font-semibold text-premium mb-1.5">Ações Administrativas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1">
            
            <Link to="/payment" className="flex flex-col items-center p-0.5 border border-gray-600 rounded-lg hover:bg-green-500/10 transition-colors">
              <div className="w-5 h-5 bg-green-500/20 rounded-lg flex items-center justify-center mb-0.5">
                <i className="fas fa-credit-card text-green-400 text-xs"></i>
              </div>
              <span className="text-xs font-medium text-white">Pagamentos</span>
            </Link>

            <button 
              onClick={() => addNotification('Usuários acessados', 'success')}
              className="flex flex-col items-center p-0.5 border border-gray-600 rounded-lg hover:bg-blue-500/10 transition-colors"
            >
              <div className="w-5 h-5 bg-blue-500/20 rounded-lg flex items-center justify-center mb-0.5">
                <i className="fas fa-users text-blue-400 text-xs"></i>
              </div>
              <span className="text-xs font-medium text-white">Usuários</span>
            </button>

            <button 
              onClick={() => addNotification('Analytics carregado', 'success')}
              className="flex flex-col items-center p-0.5 border border-gray-600 rounded-lg hover:bg-yellow-500/10 transition-colors"
            >
              <div className="w-5 h-5 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-0.5">
                <i className="fas fa-chart-line text-yellow-400 text-xs"></i>
              </div>
              <span className="text-xs font-medium text-white">Analytics</span>
            </button>

            <button 
              onClick={() => addNotification('Sistema acessado', 'success')}
              className="flex flex-col items-center p-0.5 border border-gray-600 rounded-lg hover:bg-purple-500/10 transition-colors"
            >
              <div className="w-5 h-5 bg-purple-500/20 rounded-lg flex items-center justify-center mb-0.5">
                <i className="fas fa-cogs text-purple-400 text-xs"></i>
              </div>
              <span className="text-xs font-medium text-white">Sistema</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
