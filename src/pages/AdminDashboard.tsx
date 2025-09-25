import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface AdminDashboardProps {
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

interface SystemMetrics {
  totalUsers: number
  activeSubscriptions: number
  monthlyRevenue: number
  systemUptime: number
}

const AdminDashboard = ({ addNotification }: AdminDashboardProps) => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 2847,
    activeSubscriptions: 1456,
    monthlyRevenue: 125000,
    systemUptime: 99.9
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        monthlyRevenue: prev.monthlyRevenue + Math.floor(Math.random() * 1000)
      }))
    }, 10000)
    return () => clearInterval(interval)
  }, [])

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
                <p className="text-lg font-bold text-premium">{metrics.totalUsers.toLocaleString()}</p>
                <p className="text-green-400 text-xs">+12%</p>
              </div>
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-blue-400 text-sm"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Assinaturas Ativas</p>
                <p className="text-lg font-bold text-premium">{metrics.activeSubscriptions.toLocaleString()}</p>
                <p className="text-green-400 text-xs">87%</p>
              </div>
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-crown text-green-400 text-sm"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Receita Mensal</p>
                <p className="text-lg font-bold text-premium">R$ {(metrics.monthlyRevenue / 1000).toFixed(0)}k</p>
                <p className="text-green-400 text-xs">+28%</p>
              </div>
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-dollar-sign text-yellow-400 text-sm"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Uptime Sistema</p>
                <p className="text-lg font-bold text-premium">{metrics.systemUptime}%</p>
                <p className="text-green-400 text-xs">Estável</p>
              </div>
              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-server text-emerald-400 text-sm"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
          
          {/* User Management */}
          <div className="premium-card p-2">
            <h2 className="text-sm font-semibold text-premium mb-2">Gestão de Usuários</h2>
            <div className="space-y-1">
              
              <div className="flex items-center justify-between p-1 border border-gray-600 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-user-md text-blue-400 text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-white text-xs">Médicos Ativos</div>
                    <div className="text-xs text-gray-400">847 profissionais</div>
                  </div>
                </div>
                <button className="text-blue-400 hover:text-blue-300">
                  <i className="fas fa-chevron-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Payment Management */}
          <div className="premium-card p-2">
            <h2 className="text-sm font-semibold text-premium mb-2">Sistema de Pagamentos</h2>
            <div className="space-y-1">
              
              <div className="flex items-center justify-between p-1 border border-gray-600 rounded-lg">
                <div className="flex items-center gap-1">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-check-circle text-green-400 text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-white text-xs">Pagamentos Aprovados</div>
                    <div className="text-xs text-gray-400">R$ 15.240 hoje</div>
                  </div>
                </div>
                <span className="text-green-400 font-semibold text-xs">98.2%</span>
              </div>
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
