import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  popular?: boolean;
}

const tokenPackages: TokenPackage[] = [
  { id: '1', name: 'Pacote Básico', tokens: 1000, price: 5 },
  { id: '2', name: 'Pacote Popular', tokens: 5000, price: 20, popular: true },
  { id: '3', name: 'Pacote Premium', tokens: 15000, price: 50 },
  { id: '4', name: 'Pacote Empresarial', tokens: 50000, price: 150 },
];

interface TokensPurchaseTriggerProps {
  onPurchase?: (packageId: string) => void;
}

export function TokensPurchaseTrigger({ onPurchase }: TokensPurchaseTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const { toast } = useToast();

  const handlePurchase = async (pkg: TokenPackage) => {
    try {
      // Simular processo de pagamento
      toast({
        title: "Processando pagamento...",
        description: `Compra de ${pkg.tokens.toLocaleString()} tokens por R$ ${pkg.price.toFixed(2)}`
      });

      // Aqui você integraria com o sistema de pagamento real
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Compra realizada com sucesso!",
        description: `${pkg.tokens.toLocaleString()} tokens adicionados à sua conta`
      });

      onPurchase?.(pkg.id);
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erro na compra",
        description: "Falha ao processar pagamento",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="default">
        Comprar Tokens
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Comprar Tokens</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tokenPackages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedPackage?.id === pkg.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPackage(pkg)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    {pkg.popular && (
                      <Badge variant="default">Popular</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-primary">
                      {pkg.tokens.toLocaleString()} tokens
                    </div>
                    <div className="text-lg font-semibold">
                      R$ {pkg.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      R$ {(pkg.price / pkg.tokens * 1000).toFixed(2)} por 1.000 tokens
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedPackage && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => handlePurchase(selectedPackage)}>
                Comprar por R$ {selectedPackage.price.toFixed(2)}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}