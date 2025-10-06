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
      <div className="max-w-6xl mx-auto px-4 h-full pb-16">
        
        {/* Header */}
        <div className="mb-0.5">
          <Link to="/admin" className="inline-block text-yellow-400 hover:text-yellow-300 mb-0.5">
            <i className="fas fa-arrow-left text-xs"></i> Voltar ao Admin
          </Link>
          <h1 className="text-xs font-bold text-premium mb-0.5">Sistema de Pagamentos</h1>
          <p className="text-gray-300 text-xs">Gestão de transações</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 mb-1">
          
          <div className="premium-card p-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Total Transações</p>
                <p className="text-xs font-bold text-premium">{metrics.totalTransactions.toLocaleString()}</p>
                <p className="text-green-400 text-xs">+12%</p>
              </div>
              <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-credit-card text-blue-400 text-xs"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Receita Mensal</p>
                <p className="text-xs font-bold text-premium">R$ {(metrics.monthlyRevenue / 1000).toFixed(0)}k</p>
                <p className="text-green-400 text-xs">+28%</p>
              </div>
              <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-dollar-sign text-green-400 text-xs"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Taxa de Sucesso</p>
                <p className="text-xs font-bold text-premium">{metrics.successRate}%</p>
                <p className="text-green-400 text-xs">Excelente</p>
              </div>
              <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-check-circle text-emerald-400 text-xs"></i>
              </div>
            </div>
          </div>

          <div className="premium-card p-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs">Pagamentos Hoje</p>
                <p className="text-xs font-bold text-premium">R$ 15.240</p>
                <p className="text-green-400 text-xs">+5%</p>
              </div>
              <div className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-chart-line text-yellow-400 text-xs"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Overview */}
        <div className="grid grid-cols-3 gap-0.5 mb-0.5">
          
          <div className="premium-card p-0.5">
            <div className="text-center">
              <div className="w-4 h-4 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-0.5">
                <i className="fas fa-check-circle text-green-400 text-xs"></i>
              </div>
              <h3 className="text-xs font-semibold text-premium mb-0.5">Aprovados</h3>
              <div className="text-xs font-bold text-white">{metrics.approvedPayments.toLocaleString()}</div>
              <div className="text-xs text-green-400 font-semibold">98.2%</div>
            </div>
          </div>

          <div className="premium-card p-0.5">
            <div className="text-center">
              <div className="w-4 h-4 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-0.5">
                <i className="fas fa-clock text-yellow-400 text-xs"></i>
              </div>
              <h3 className="text-xs font-semibold text-premium mb-0.5">Pendentes</h3>
              <div className="text-xs font-bold text-white">{metrics.pendingPayments}</div>
              <div className="text-xs text-yellow-400 font-semibold">1.5%</div>
            </div>
          </div>

          <div className="premium-card p-0.5">
            <div className="text-center">
              <div className="w-4 h-4 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-0.5">
                <i className="fas fa-times-circle text-red-400 text-xs"></i>
              </div>
              <h3 className="text-xs font-semibold text-premium mb-0.5">Falharam</h3>
              <div className="text-xs font-bold text-white">{metrics.failedPayments}</div>
              <div className="text-xs text-red-400 font-semibold">0.3%</div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="premium-card p-0.5">
          <h3 className="text-xs font-semibold text-premium mb-0.5">Transações Recentes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-0.5 text-gray-300 text-xs">ID</th>
                  <th className="text-left py-0.5 text-gray-300 text-xs">Usuário</th>
                  <th className="text-left py-0.5 text-gray-300 text-xs">Valor</th>
                  <th className="text-left py-0.5 text-gray-300 text-xs">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.slice(0, 2).map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-700">
                    <td className="py-0.5 text-white text-xs">#{transaction.id}</td>
                    <td className="py-0.5 text-white text-xs">{transaction.user}</td>
                    <td className="py-0.5 text-white text-xs">R$ {transaction.amount.toFixed(2)}</td>
                    <td className="py-0.5">
                      <span className={`px-1 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusText(transaction.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Actions */}
        <div className="premium-card mt-1">
          <h3 className="text-xs font-semibold text-premium mb-1">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-1">
            
            <button className="flex items-center justify-center p-1 border border-gray-600 rounded-lg hover:bg-blue-500/10 transition-colors">
              <div className="w-5 h-5 bg-blue-500/20 rounded-lg flex items-center justify-center mr-1">
                <i className="fas fa-plus text-blue-400 text-xs"></i>
              </div>
              <span className="text-xs font-medium text-white">Nova</span>
            </button>

            <button className="flex items-center justify-center p-1 border border-gray-600 rounded-lg hover:bg-green-500/10 transition-colors">
              <div className="w-5 h-5 bg-green-500/20 rounded-lg flex items-center justify-center mr-1">
                <i className="fas fa-download text-green-400 text-xs"></i>
              </div>
              <span className="text-xs font-medium text-white">Exportar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentPage
