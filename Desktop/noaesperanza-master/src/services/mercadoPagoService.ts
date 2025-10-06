// Serviço para integração com Mercado Pago
export interface MercadoPagoPayment {
  id: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  amount: number
  currency: string
  description: string
  payment_method_id: string
  payer: {
    email: string
    identification: {
      type: string
      number: string
    }
  }
  external_reference: string
  created_at: string
  updated_at: string
}

export interface PaymentPreference {
  id: string
  init_point: string
  sandbox_init_point: string
  client_id: string
  collector_id: number
  items: Array<{
    id: string
    title: string
    description: string
    picture_url: string
    category_id: string
    quantity: number
    currency_id: string
    unit_price: number
  }>
  payer: {
    name: string
    surname: string
    email: string
    phone: {
      area_code: string
      number: string
    }
    identification: {
      type: string
      number: string
    }
    address: {
      street_name: string
      street_number: number
      zip_code: string
    }
  }
  back_urls: {
    success: string
    failure: string
    pending: string
  }
  auto_return: string
  payment_methods: {
    excluded_payment_methods: Array<{
      id: string
    }>
    excluded_payment_types: Array<{
      id: string
    }>
    installments: number
  }
  notification_url: string
  statement_descriptor: string
  external_reference: string
  expires: boolean
  expiration_date_from: string
  expiration_date_to: string
}

class MercadoPagoService {
  private accessToken: string
  private baseURL = 'https://api.mercadopago.com'

  constructor() {
    this.accessToken = import.meta.env.VITE_MERCADO_PAGO_KEY
    if (!this.accessToken) {
      console.error('Mercado Pago Access Token não encontrado')
    }
  }

  // Criar preferência de pagamento
  async createPaymentPreference(
    items: Array<{
      title: string
      description: string
      quantity: number
      unit_price: number
    }>,
    payer: {
      name: string
      email: string
      phone?: string
    },
    externalReference: string
  ): Promise<PaymentPreference> {
    try {
      const preference = {
        items: items.map(item => ({
          id: item.title.toLowerCase().replace(/\s+/g, '_'),
          title: item.title,
          description: item.description,
          picture_url: 'https://noa-esperanza.com/logo.png',
          category_id: 'health',
          quantity: item.quantity,
          currency_id: 'BRL',
          unit_price: item.unit_price
        })),
        payer: {
          name: payer.name,
          surname: '',
          email: payer.email,
          phone: payer.phone ? {
            area_code: '55',
            number: payer.phone.replace(/\D/g, '')
          } : undefined,
          identification: {
            type: 'CPF',
            number: '12345678901' // Será preenchido pelo usuário
          },
          address: {
            street_name: 'Rua Exemplo',
            street_number: 123,
            zip_code: '01234567'
          }
        },
        back_urls: {
          success: `${window.location.origin}/payment/success`,
          failure: `${window.location.origin}/payment/failure`,
          pending: `${window.location.origin}/payment/pending`
        },
        auto_return: 'approved',
        payment_methods: {
          excluded_payment_methods: [],
          excluded_payment_types: [],
          installments: 12
        },
        notification_url: `${window.location.origin}/api/webhook/mercadopago`,
        statement_descriptor: 'NOA ESPERANZA',
        external_reference: externalReference,
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
      }

      const response = await fetch(`${this.baseURL}/checkout/preferences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(preference)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Mercado Pago Error: ${errorData.message || 'Erro desconhecido'}`)
      }

      const data = await response.json()
      return data

    } catch (error) {
      console.error('Erro ao criar preferência de pagamento:', error)
      throw error
    }
  }

  // Obter informações de um pagamento
  async getPayment(paymentId: string): Promise<MercadoPagoPayment> {
    try {
      const response = await fetch(`${this.baseURL}/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Mercado Pago Error: ${errorData.message || 'Erro desconhecido'}`)
      }

      const data = await response.json()
      return data

    } catch (error) {
      console.error('Erro ao obter pagamento:', error)
      throw error
    }
  }

  // Criar pagamento PIX
  async createPixPayment(
    amount: number,
    description: string,
    externalReference: string,
    payerEmail: string
  ) {
    try {
      const payment = {
        transaction_amount: amount,
        description: description,
        payment_method_id: 'pix',
        payer: {
          email: payerEmail
        },
        external_reference: externalReference,
        notification_url: `${window.location.origin}/api/webhook/mercadopago`
      }

      const response = await fetch(`${this.baseURL}/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify(payment)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Mercado Pago Error: ${errorData.message || 'Erro desconhecido'}`)
      }

      const data = await response.json()
      return data

    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error)
      throw error
    }
  }

  // Verificar status de pagamento
  async checkPaymentStatus(paymentId: string): Promise<string> {
    try {
      const payment = await this.getPayment(paymentId)
      return payment.status
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error)
      throw error
    }
  }

  // Processar webhook do Mercado Pago
  async processWebhook(webhookData: any) {
    try {
      const { type, data } = webhookData
      
      if (type === 'payment') {
        const payment = await this.getPayment(data.id)
        
        // Aqui você pode atualizar o status no seu banco de dados
        return {
          paymentId: payment.id,
          status: payment.status,
          amount: payment.amount,
          externalReference: payment.external_reference
        }
      }
      
      return null
    } catch (error) {
      console.error('Erro ao processar webhook:', error)
      throw error
    }
  }

  // Criar preferência para planos específicos
  async createPlanPayment(
    plan: 'basic' | 'premium' | 'enterprise',
    userEmail: string,
    userName: string,
    externalReference: string
  ) {
    const plans = {
      basic: {
        title: 'Plano Básico - NOA Esperanza',
        description: 'Consulta Online, Suporte por Chat, Relatórios Básicos',
        price: 97
      },
      premium: {
        title: 'Plano Premium - NOA Esperanza',
        description: 'Consultas Ilimitadas, Suporte Prioritário, Relatórios Avançados, Telemedicina',
        price: 197
      },
      enterprise: {
        title: 'Plano Enterprise - NOA Esperanza',
        description: 'Tudo do Premium, Consultoria Personalizada, API Access, Suporte 24/7',
        price: 397
      }
    }

    const selectedPlan = plans[plan]

    return this.createPaymentPreference(
      [{
        title: selectedPlan.title,
        description: selectedPlan.description,
        quantity: 1,
        unit_price: selectedPlan.price
      }],
      {
        name: userName,
        email: userEmail
      },
      externalReference
    )
  }
}

export const mercadoPagoService = new MercadoPagoService()
