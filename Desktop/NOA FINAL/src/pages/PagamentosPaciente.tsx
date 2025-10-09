import { useState } from 'react'
import { Link } from 'react-router-dom'

interface Payment {
  id: string
  date: string
  description: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  method: string
}

const PagamentosPaciente = () => {
  const [payments] = useState<Payment[]>([
    {
      id: '1',
      date: '2025-01-15',
      description: 'Consulta - Dr. Carlos Silva',
      amount: 150.00,
      status: 'paid',
      method: 'PIX'
    },
    {
      id: '2',
      date: '2025-01-20',
      description: 'Exame - Tomografia',
      amount: 280.00,
      status: 'pending',
      method: 'Cartão'
    },
    {
      id: '3',
      date: '2024-12-15',
      description: 'Consulta - Retorno',
      amount: 120.00,
      status: 'overdue',
      method: 'Boleto'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'overdue': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago'
      case 'pending': return 'Pendente'
      case 'overdue': return 'Vencido'
      default: return status
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0)
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  const totalOverdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="h-full overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 h-full pb-16">
        
        {/* Header */}
        <div className="mb-4">
          <Link to="/paciente" className="inline-block text-yellow-400 hover:text-yellow-300 mb-2">
            <i className="fas fa-arrow-left text-sm"></i> Voltar
          </Link>
          <h1 className="text-xl font-bold text-premium mb-2">Meus Pagamentos</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="premium-card p-3 text-center">
            <p className="text-gray-300 text-sm">Total Pago</p>
            <p className="text-lg font-bold text-green-400">{formatCurrency(totalPaid)}</p>
          </div>
          <div className="premium-card p-3 text-center">
            <p className="text-gray-300 text-sm">Pendente</p>
            <p className="text-lg font-bold text-yellow-400">{formatCurrency(totalPending)}</p>
          </div>
          <div className="premium-card p-3 text-center">
            <p className="text-gray-300 text-sm">Vencido</p>
            <p className="text-lg font-bold text-red-400">{formatCurrency(totalOverdue)}</p>
          </div>
        </div>

        {/* Payments List */}
        <div className="premium-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-premium">Histórico de Pagamentos</h2>
            <button className="premium-button flex items-center gap-2 text-sm px-3 py-2">
              <i className="fas fa-plus text-sm"></i>
              Novo Pagamento
            </button>
          </div>
          
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="border border-gray-600 rounded-lg p-4 hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{payment.description}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {getStatusText(payment.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                      <div>
                        <span className="text-gray-400">Data:</span> {new Date(payment.date).toLocaleDateString('pt-BR')}
                      </div>
                      <div>
                        <span className="text-gray-400">Método:</span> {payment.method}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-white mb-1">
                      {formatCurrency(payment.amount)}
                    </div>
                    <div className="flex gap-2">
                      {payment.status === 'pending' && (
                        <button className="premium-button text-xs px-3 py-1">
                          <i className="fas fa-credit-card mr-1"></i>
                          Pagar
                        </button>
                      )}
                      <button className="premium-button text-xs px-3 py-1">
                        <i className="fas fa-download mr-1"></i>
                        Recibo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="premium-card p-4 mt-4">
          <h3 className="text-lg font-semibold text-premium mb-4">Métodos de Pagamento</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
              <i className="fas fa-qrcode text-green-400"></i>
              <span className="text-sm text-white">PIX</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
              <i className="fas fa-credit-card text-blue-400"></i>
              <span className="text-sm text-white">Cartão</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
              <i className="fas fa-barcode text-yellow-400"></i>
              <span className="text-sm text-white">Boleto</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg">
              <i className="fas fa-university text-purple-400"></i>
              <span className="text-sm text-white">Débito</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PagamentosPaciente
