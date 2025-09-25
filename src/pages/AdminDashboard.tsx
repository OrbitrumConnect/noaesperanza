import { useState, useEffect } from 'react'
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
      <div className="max-w-7xl mx-auto px-6 h-full">
        
        {/* Header */}
        <div className="mb-2">
          <Link to="/" className="inline-block text-yellow-400 hover:text-yellow-300 mb-1">
            <i className="fas fa-arrow-left text-sm"></i> Voltar
          </Link>
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
                <p className="text-gray-300 text-xs">Palavras-chave</p>
                <p className="text-lg font-bold text-premium">
                  {loading ? '...' : metrics.aiLearningCount.toLocaleString()}
                </p>
                <p className="text-yellow-400 text-xs">Conhecimento</p>
              </div>
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-key text-yellow-400 text-sm"></i>
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

        {/* Quick Actions */}
        <div className="premium-card p-2">
          <h2 className="text-sm font-semibold text-premium mb-2">Ações Administrativas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1">
            
            <Link to="/payment" className="flex flex-col items-center p-1 border border-gray-600 rounded-lg hover:bg-green-500/10 transition-colors">
              <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center mb-1">
                <i className="fas fa-credit-card text-green-400 text-xs"></i>
              </div>
              <span className="text-xs font-medium text-white">Pagamentos</span>
            </Link>

            <button className="flex flex-col items-center p-1 border border-gray-600 rounded-lg hover:bg-blue-500/10 transition-colors">
              <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center mb-1">
                <i className="fas fa-users text-blue-400 text-xs"></i>
              </div>
              <span className="text-xs font-medium text-white">Usuários</span>
            </button>

            <button className="flex flex-col items-center p-1 border border-gray-600 rounded-lg hover:bg-yellow-500/10 transition-colors">
              <div className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-1">
                <i className="fas fa-chart-line text-yellow-400 text-xs"></i>
              </div>
              <span className="text-xs font-medium text-white">Analytics</span>
            </button>

            <button className="flex flex-col items-center p-1 border border-gray-600 rounded-lg hover:bg-purple-500/10 transition-colors">
              <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center mb-1">
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
