import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, CheckCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubscriptionUpgradeProps {
  title: string;
  description: string;
  features?: string[];
  onUpgrade: () => void;
  onClose?: () => void;
}

export default function SubscriptionUpgrade({ 
  title, 
  description, 
  features = [],
  onUpgrade,
  onClose 
}: SubscriptionUpgradeProps) {
  const defaultFeatures = [
    'Acesso completo à biblioteca de E-books',
    'Vídeos educativos MEV exclusivos',
    'Chat ilimitado com Alice IA',
    'Planos personalizados da Dra. Dayana',
    'Análise de pratos com IA',
    'Frequências terapêuticas',
    'Suporte prioritário'
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Crown className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground mb-2">
              {title}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {description}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Features List */}
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Recursos Premium:
              </h4>
              <div className="space-y-1">
                {displayFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-card/50 rounded-lg p-4 border border-primary/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">R$ 297,00</div>
                <div className="text-sm text-muted-foreground">por mês</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Cancele quando quiser
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold py-3 shadow-lg"
                size="lg"
              >
                <CreditCard className="w-5 h-5 mr-2" />
                Assinar Premium
              </Button>
              
              {onClose && (
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                  size="sm"
                >
                  Voltar
                </Button>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="text-center pt-2">
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Seguro e Confiável</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>Cancele quando quiser</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}