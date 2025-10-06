import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Calendar, Clock, CheckCircle, Star, Shield, Zap, Settings, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';

interface PaymentAreaProps {
  onPaymentSuccess: (type: 'advance' | 'regular') => void;
  hasAccess: boolean;
  userEmail?: string;
}

export default function PaymentArea({ onPaymentSuccess, hasAccess, userEmail }: PaymentAreaProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'advance' | 'regular' | null>(null);
  const [zapierWebhook, setZapierWebhook] = useState('');
  const { toast } = useToast();
  const { 
    subscribed, 
    subscription_tier, 
    subscription_end, 
    loading, 
    error, 
    checkSubscription, 
    createCheckout, 
    openCustomerPortal 
  } = useSubscription();

  const plans = [
    {
      id: 'premium' as const,
      title: 'Plano Premium',
      subtitle: 'Assinatura mensal completa',
      price: 99.00,
      originalPrice: null,
      discount: 0,
      features: [
        'Acesso completo a todos e-books',
        'Biblioteca completa de vídeos',
        'Chat ilimitado com Alice IA',
        'Preparação completa para consulta',
        'Planos personalizados',
        'Suporte prioritário',
        'Atualizações automáticas'
      ],
      badge: 'Recomendado',
      badgeColor: 'bg-primary'
    }
  ];

  const handleStripeCheckout = async () => {
    setIsProcessing(true);
    
    try {
      await createCheckout();
      
      toast({
        title: "Redirecionando...",
        description: "Você será redirecionado para o checkout do Stripe",
      });
    } catch (error: any) {
      toast({
        title: "Erro no Pagamento",
        description: error.message || "Houve um problema ao iniciar o checkout.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
                  Plano {subscription_tier || 'Premium'}
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
        <h2 className="text-3xl font-bold text-foreground">🚀 Desbloqueie Todo Potencial</h2>
        <p className="text-muted-foreground">
          Assine o Alice Health Premium e tenha acesso completo à plataforma de saúde personalizada
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

      {/* Zapier Integration */}
      <Card className="border-accent/20 bg-accent/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" />
            Integração Zapier (Opcional)
          </CardTitle>
          <CardDescription>
            Configure um webhook Zapier para automatizar notificações de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="zapier-webhook">URL do Webhook Zapier</Label>
            <Input
              id="zapier-webhook"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={zapierWebhook}
              onChange={(e) => setZapierWebhook(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Quando configurado, enviará dados do pagamento automaticamente para seu Zap
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Plans */}
      <div className="max-w-md mx-auto">
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
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-4xl font-bold text-primary">
                      R$ {plan.price.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-muted-foreground">/mês</span>
                  </div>
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

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleStripeCheckout}
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
                      Assinar Agora
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Pagamento seguro via Stripe • Cancele a qualquer momento
                </p>
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
            Processamento 100% seguro via Stripe
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