import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Clock, CheckCircle, Star, Shield, Settings, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';

interface PaymentAreaProps {
  onPaymentSuccess: (type: 'advance' | 'regular') => void;
  hasAccess: boolean;
  userEmail?: string;
}

export default function PaymentArea({ onPaymentSuccess, hasAccess, userEmail }: PaymentAreaProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'advance' | 'regular' | null>(null);
  const { toast } = useToast();
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end, 
    loading, 
    error, 
    checkSubscription,
    createMercadoPagoCheckout,
    openCustomerPortal 
  } = useSubscription();

  const plans = [
    {
      id: 'club-digital' as const,
      title: 'Clube Digital',
      subtitle: 'Sem consulta - Acesso imediato',
      price: 297.00,
      originalPrice: 297.00,
      discount: 297.00,
      discountPrice: 297.00,
      features: [
        '✅ Acesso imediato à área de membros',
        '✅ Check-up de saúde funcional e integrativa',
        '✅ Biblioteca de conteúdos exclusivos',
        '✅ Vídeos educativos',
        '✅ E-books especializados', 
        '✅ Prescrição MEV (Mudanças no Estilo de Vida)',
        '✅ Acesso à IA Alice para dúvidas',
        '✅ Plano alimentar personalizado',
        '❌ Sem laudo técnico (bioimpedância, neurometria)',
        '✅ Pode migrar para plano com consulta'
      ],
      badge: 'Cupom Especial',
      badgeColor: 'bg-secondary'
    },
    {
      id: 'consulta-completa' as const,
      title: 'Acesso Completo + Consulta',
      subtitle: 'Presencial ou Online',
      price: 800.00,
      originalPrice: 800.00,
      discount: 620.00,
      discountPrice: 620.00,
      features: [
        '✅ Consulta individual com Dra. Dayana',
        '✅ Exame de Neurometria (Presencial)',
        '✅ Análise por Biorressonância',
        '✅ Acesso total à área de membros (pós-consulta)',
        '✅ Formulário completo de anamnese com laudo',
        '✅ Plano alimentar 100% personalizado + Biohacking',
        '✅ Prescrição de estilo de vida (MEV)',
        '✅ Biblioteca completa (vídeos, e-books, guias)',
        '✅ Acesso à IA Alice para dúvidas',
        '✅ Acompanhamento profissional'
      ],
      badge: 'Mais Completo',
      badgeColor: 'bg-primary'
    }
  ];


  const testMercadoPagoToken = async () => {
    try {
      const response = await supabase.functions.invoke('test-mercadopago-token');
      console.log('🧪 MERCADO PAGO TOKEN TEST:', response);
      
      if (response.data?.success) {
        toast({
          title: "✅ Token Test Result",
          description: `Token exists: ${response.data.mercadoPagoTokenExists}, Length: ${response.data.mercadoPagoTokenLength}`,
        });
      } else {
        toast({
          title: "❌ Token Test Failed", 
          description: response.data?.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "❌ Test Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleManageSubscription = async () => {
    try {
      await openCustomerPortal();
      
      toast({
        title: "Portal do Cliente",
        description: "Abrindo portal para gerenciar sua assinatura",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível abrir o portal do cliente.",
        variant: "destructive",
      });
    }
  };

  if (hasAccess || subscribed) {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success/20 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">✅ Assinatura Ativa!</h2>
          <p className="text-muted-foreground">
            Você tem acesso completo a toda plataforma Alice Health
          </p>
        </div>

        <Card className="border-success/20 bg-success/5">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Plano {subscription_tier || 'Ativo'}
                </h3>
                <p className="text-muted-foreground">
                  {subscription_end && (
                    <>Renova em: {new Date(subscription_end).toLocaleDateString('pt-BR')}</>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={checkSubscription}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={handleManageSubscription}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Gerenciar
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-success text-white">E-books Completos</Badge>
              <Badge className="bg-success text-white">Vídeos HD</Badge>
              <Badge className="bg-success text-white">Chat IA Ilimitado</Badge>
              <Badge className="bg-success text-white">Planos Personalizados</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">🚀 Escolha Seu Plano</h2>
        <p className="text-muted-foreground">
          Estrutura oficial dos acessos - Clube BioRegenere com a Dra. Dayana Brazão
        </p>
      </div>

      {/* Subscription Status */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">
              Erro ao verificar assinatura: {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={checkSubscription}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      )}

        {/* Payment Plans */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative border-primary shadow-lg hover:shadow-xl transition-all duration-300">
                {plan.badge && (
                  <Badge className={`absolute -top-2 left-1/2 transform -translate-x-1/2 ${plan.badgeColor} text-white px-4 py-1`}>
                    {plan.badge}
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">{plan.title}</CardTitle>
                  <CardDescription className="text-base">{plan.subtitle}</CardDescription>
                  
                  <div className="space-y-2">
                    {plan.discountPrice && plan.discountPrice !== plan.price ? (
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-lg font-medium text-muted-foreground line-through">
                            De R$ {plan.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-4xl font-bold text-success">
                            R$ {plan.discountPrice.toFixed(2).replace('.', ',')}
                          </span>
                          {plan.id === 'club-digital' && <span className="text-muted-foreground">/mês</span>}
                        </div>
                        {plan.id === 'consulta-completa' && (
                          <div className="text-xs text-muted-foreground text-center">
                            R$ 800 presencial • R$ 620 online
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-4xl font-bold text-primary">
                          R$ {plan.price.toFixed(2).replace('.', ',')}
                        </span>
                        {plan.id === 'club-digital' && <span className="text-muted-foreground">/mês</span>}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                   <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white border-0"
                      size="lg"
                      onClick={() => createMercadoPagoCheckout(plan.id)}
                      disabled={isProcessing || loading}
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                          Redirecionando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Pagar com PIX/Boleto (MP)
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    {plan.id === 'club-digital' ? 
                      'Pagamento seguro via Mercado Pago • Cancele a qualquer momento' :
                      'Pagamento único • Agendamento após confirmação'
                    }
                  </p>
                  
                  {plan.id === 'club-digital' && (
                    <div className="mt-4 p-3 bg-accent/10 rounded-lg">
                      <p className="text-xs text-center text-muted-foreground">
                        💡 <strong>Gerenciamento humano:</strong> A IA Alice foi treinada pela Dra. Dayana, mas pode ter erros por ser uma Inteligência Artificial.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

      {/* Benefits Section */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center p-4">
          <Shield className="h-8 w-8 text-primary mx-auto mb-2" />
          <h4 className="font-semibold mb-1">Pagamento Seguro</h4>
          <p className="text-sm text-muted-foreground">
            Processamento 100% seguro via Mercado Pago
          </p>
        </Card>
        
        <Card className="text-center p-4">
          <Star className="h-8 w-8 text-primary mx-auto mb-2" />
          <h4 className="font-semibold mb-1">Acesso Imediato</h4>
          <p className="text-sm text-muted-foreground">
            Liberação instantânea do conteúdo
          </p>
        </Card>
        
        <Card className="text-center p-4">
          <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
          <h4 className="font-semibold mb-1">Prepare-se Melhor</h4>
          <p className="text-sm text-muted-foreground">
            Chegue preparado(a) na consulta
          </p>
        </Card>
      </div>
    </div>
  );
}