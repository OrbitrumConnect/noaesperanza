import { Link } from 'react-router-dom'
import { useState } from 'react'

interface CheckoutPageProps {
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const CheckoutPage = ({ addNotification }: CheckoutPageProps) => {
  const [selectedPlan, setSelectedPlan] = useState('basic')
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [isProcessing, setIsProcessing] = useState(false)

  const plans = {
    basic: {
      name: 'Plano Básico',
      price: 97,
      features: ['Consulta Online', 'Suporte por Chat', 'Relatórios Básicos'],
      color: 'blue'
    },
    premium: {
      name: 'Plano Premium',
      price: 197,
      features: ['Consultas Ilimitadas', 'Suporte Prioritário', 'Relatórios Avançados', 'Telemedicina'],
      color: 'green'
    },
    enterprise: {
      name: 'Plano Enterprise',
      price: 397,
      features: ['Tudo do Premium', 'Consultoria Personalizada', 'API Access', 'Suporte 24/7'],
      color: 'purple'
    }
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    // Simular processamento do Mercado Pago
    setTimeout(() => {
      setIsProcessing(false)
      addNotification('Pagamento processado com sucesso! Redirecionando...', 'success')
      
      // Aqui seria a integração real com o Mercado Pago
      // window.location.href = 'https://mercadopago.com/checkout/...'
    }, 2000)
  }

  const currentPlan = plans[selectedPlan as keyof typeof plans]

  return (
    <div className="h-full overflow-hidden">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-3 mb-2">
        <div className="premium-card p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-yellow-400 hover:text-yellow-300">
                <i className="fas fa-arrow-left text-sm"></i>
              </Link>
              <div>
                <h1 className="text-base font-bold text-premium">Checkout - Mercado Pago</h1>
                <p className="text-gray-400 text-xs">Finalize seu pagamento de forma segura</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center">
                <i className="fas fa-shield-alt text-green-400 text-xs"></i>
              </div>
              <span className="text-xs text-green-400 font-medium">100% Seguro</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 h-full">
          {/* Seleção de Plano */}
          <div className="lg:col-span-2 space-y-2">
            <div className="premium-card p-2">
              <h2 className="text-sm font-semibold text-premium mb-2">Escolha seu Plano</h2>
              
              <div className="space-y-1">
                {Object.entries(plans).map(([key, plan]) => (
                  <div
                    key={key}
                    className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPlan === key 
                        ? `border-${plan.color}-500 bg-${plan.color}-500/10` 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedPlan(key)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white text-sm">{plan.name}</h3>
                        <p className="text-gray-400 text-xs">R$ {plan.price}/mês</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full border-2 ${
                        selectedPlan === key 
                          ? `border-${plan.color}-500 bg-${plan.color}-500` 
                          : 'border-gray-400'
                      }`}>
                        {selectedPlan === key && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-1">
                      <ul className="space-y-0.5">
                        {plan.features.slice(0, 2).map((feature, index) => (
                          <li key={index} className="flex items-center gap-1 text-xs text-gray-300">
                            <i className="fas fa-check text-green-400 text-xs"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Método de Pagamento */}
            <div className="premium-card p-2">
              <h2 className="text-sm font-semibold text-premium mb-2">Método de Pagamento</h2>
              
              <div className="space-y-1">
                <div
                  className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'pix' 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setPaymentMethod('pix')}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-qrcode text-green-400 text-xs"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">PIX</h3>
                      <p className="text-gray-400 text-xs">Aprovação instantânea</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      paymentMethod === 'pix' 
                        ? 'border-green-500 bg-green-500' 
                        : 'border-gray-400'
                    }`}>
                      {paymentMethod === 'pix' && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-2 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'card' 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <i className="fas fa-credit-card text-blue-400 text-xs"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">Cartão de Crédito</h3>
                      <p className="text-gray-400 text-xs">Visa, Mastercard, Elo</p>
                    </div>
                    <div className={`w-3 h-3 rounded-full border-2 ${
                      paymentMethod === 'card' 
                        ? 'border-blue-500 bg-blue-500' 
                        : 'border-gray-400'
                    }`}>
                      {paymentMethod === 'card' && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-2 space-y-2">
            <div className="premium-card p-2">
              <h2 className="text-sm font-semibold text-premium mb-2">Resumo do Pedido</h2>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-white text-sm">{currentPlan.name}</h3>
                    <p className="text-gray-400 text-xs">Plano mensal</p>
                  </div>
                  <span className="text-base font-bold text-premium">R$ {currentPlan.price}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Subtotal:</span>
                    <span className="text-white">R$ {currentPlan.price}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Desconto:</span>
                    <span className="text-green-400">-R$ 0</span>
                  </div>
                  <div className="border-t border-gray-600 pt-1">
                    <div className="flex justify-between">
                      <span className="font-semibold text-white text-sm">Total:</span>
                      <span className="text-lg font-bold text-premium">R$ {currentPlan.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Pagamento */}
            <div className="premium-card p-2">
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full py-2 rounded-lg font-semibold text-white transition-all text-sm ${
                  isProcessing 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-105'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processando...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <i className="fas fa-lock text-xs"></i>
                    Pagar com Mercado Pago
                  </div>
                )}
              </button>
              
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-400">
                  <i className="fas fa-shield-alt text-green-400 mr-1"></i>
                  Pagamento 100% seguro
                </p>
              </div>
            </div>

            {/* Informações de Segurança */}
            <div className="premium-card p-2">
              <h3 className="text-xs font-semibold text-premium mb-1">Por que escolher o Mercado Pago?</h3>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <i className="fas fa-check-circle text-green-400 text-xs"></i>
                  <span>Pagamento instantâneo</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <i className="fas fa-check-circle text-green-400 text-xs"></i>
                  <span>Proteção contra fraudes</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-300">
                  <i className="fas fa-check-circle text-green-400 text-xs"></i>
                  <span>Suporte 24/7</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
