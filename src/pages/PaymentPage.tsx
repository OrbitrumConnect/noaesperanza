import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface PaymentMetrics {
  totalTransactions: number
  approvedPayments: number
  pendingPayments: number
  failedPayments: number
  monthlyRevenue: number
  successRate: number
}

interface PaymentTransaction {
  id: string
  amount: number
  status: 'approved' | 'pending' | 'failed'
  user: string
  date: string
  method: 'credit_card' | 'pix' | 'boleto'
}

const PaymentPage = () => {
  const [metrics, setMetrics] = useState<PaymentMetrics>({
    totalTransactions: 2847,
    approvedPayments: 1456,
    pendingPayments: 23,
    failedPayments: 3,
    monthlyRevenue: 125000,
    successRate: 98.2
  })

  const [recentTransactions, setRecentTransactions] = useState<PaymentTransaction[]>([
    {
      id: '1',
      amount: 150.00,
      status: 'approved',
      user: 'Dr. João Silva',
      date: '2025-01-24',
      method: 'credit_card'
    },
    {
      id: '2',
      amount: 299.00,
      status: 'pending',
      user: 'Maria Santos',
      date: '2025-01-24',
      method: 'pix'
    },
    {
      id: '3',
      amount: 89.90,
      status: 'approved',
      user: 'Carlos Oliveira',
      date: '2025-01-23',
      method: 'credit_card'
    },
    {
      id: '4',
      amount: 199.00,
      status: 'failed',
      user: 'Ana Costa',
      date: '2025-01-23',
      method: 'boleto'
    }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        monthlyRevenue: prev.monthlyRevenue + Math.floor(Math.random() * 1000),
        approvedPayments: prev.approvedPayments + Math.floor(Math.random() * 5)
      }))
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprovado'
      case 'pending': return 'Pendente'
      case 'failed': return 'Falhou'
      default: return status
    }
  }

  const getMethodText = (method: string) => {
    switch (method) {
      case 'credit_card': return 'Cartão de Crédito'
      case 'pix': return 'PIX'
      case 'boleto': return 'Boleto'
      default: return method
    }
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 h-full">
        
        {/* Header */}
        <div className="mb-4">
          <Link to="/admin" className="inline-block text-yellow-400 hover:text-yellow-300 mb-2">
            <i className="fas fa-arrow-left text-lg"></i> Voltar ao Admin
          </Link>
          <h1 className="text-2xl font-bold text-premium mb-1">Sistema de Pagamentos</h1>
          <p className="text-gray-300 text-sm">Gestão completa de transações e receitas</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          
          <div className="premium-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Total Transações</p>
                <p className="text-2xl font-bold text-premium">{metrics.totalTransactions.toLocaleString()}</p>
                <p className="text-green-400 text-xs">+12% este mês</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-credit-card text-blue-400 text-lg"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Receita Mensal</p>
                <p className="text-2xl font-bold text-premium">R$ {(metrics.monthlyRevenue / 1000).toFixed(0)}k</p>
                <p className="text-green-400 text-xs">+28% crescimento</p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-dollar-sign text-green-400 text-lg"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-premium">{metrics.successRate}%</p>
                <p className="text-green-400 text-xs">Excelente</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-emerald-400 text-lg"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Pagamentos Hoje</p>
                <p className="text-2xl font-bold text-premium">R$ 15.240</p>
                <p className="text-green-400 text-xs">+5% vs ontem</p>
              </div>
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-yellow-400 text-lg"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-2">
          
          <div className="premium-card p-2">
            <h3 className="text-sm font-semibold text-premium mb-2">Pagamentos Aprovados</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-check-circle text-green-400 text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{metrics.approvedPayments.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">transações</div>
                  </div>
                </div>
                <span className="text-green-400 font-semibold text-sm">98.2%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div className="bg-green-500 h-1 rounded-full" style={{width: '98.2%'}}></div>
              </div>
            </div>
          </div>

          <div className="premium-card p-2">
            <h3 className="text-sm font-semibold text-premium mb-2">Pagamentos Pendentes</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-clock text-yellow-400 text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{metrics.pendingPayments}</div>
                    <div className="text-xs text-gray-400">transações</div>
                  </div>
                </div>
                <span className="text-yellow-400 font-semibold text-sm">1.5%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div className="bg-yellow-500 h-1 rounded-full" style={{width: '1.5%'}}></div>
              </div>
            </div>
          </div>

          <div className="premium-card p-2">
            <h3 className="text-sm font-semibold text-premium mb-2">Pagamentos Falharam</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-times-circle text-red-400 text-xs"></i>
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{metrics.failedPayments}</div>
                    <div className="text-xs text-gray-400">transações</div>
                  </div>
                </div>
                <span className="text-red-400 font-semibold text-sm">0.3%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div className="bg-red-500 h-1 rounded-full" style={{width: '0.3%'}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="premium-card p-2">
          <h3 className="text-sm font-semibold text-premium mb-2">Transações Recentes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-1 text-gray-300 text-xs">ID</th>
                  <th className="text-left py-1 text-gray-300 text-xs">Usuário</th>
                  <th className="text-left py-1 text-gray-300 text-xs">Valor</th>
                  <th className="text-left py-1 text-gray-300 text-xs">Método</th>
                  <th className="text-left py-1 text-gray-300 text-xs">Status</th>
                  <th className="text-left py-1 text-gray-300 text-xs">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.slice(0, 3).map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-700">
                    <td className="py-1 text-white text-xs">#{transaction.id}</td>
                    <td className="py-1 text-white text-xs">{transaction.user}</td>
                    <td className="py-1 text-white text-xs">R$ {transaction.amount.toFixed(2)}</td>
                    <td className="py-1 text-gray-300 text-xs">{getMethodText(transaction.method)}</td>
                    <td className="py-1">
                      <span className={`px-1 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </td>
                    <td className="py-1 text-gray-300 text-xs">{transaction.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Actions */}
        <div className="premium-card mt-6">
          <h3 className="text-xl font-semibold text-premium mb-6">Ações de Pagamento</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <button className="flex flex-col items-center p-4 border border-gray-600 rounded-lg hover:bg-blue-500/10 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                <i className="fas fa-plus text-blue-400 text-xl"></i>
              </div>
              <span className="text-sm font-medium text-white">Nova Transação</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-600 rounded-lg hover:bg-green-500/10 transition-colors">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
                <i className="fas fa-download text-green-400 text-xl"></i>
              </div>
              <span className="text-sm font-medium text-white">Exportar Relatório</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-600 rounded-lg hover:bg-yellow-500/10 transition-colors">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-3">
                <i className="fas fa-cog text-yellow-400 text-xl"></i>
              </div>
              <span className="text-sm font-medium text-white">Configurações</span>
            </button>

            <button className="flex flex-col items-center p-4 border border-gray-600 rounded-lg hover:bg-purple-500/10 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                <i className="fas fa-chart-bar text-purple-400 text-xl"></i>
              </div>
              <span className="text-sm font-medium text-white">Analytics</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
