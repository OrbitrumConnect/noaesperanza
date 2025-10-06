import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PaymentArea from '@/components/PaymentArea';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export default function Payment() {
  const navigate = useNavigate();
  const { user } = useSupabaseAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Estrutura Oficial dos Acessos</h1>
            <p className="text-muted-foreground">Clube BioRegenere com a Dra. Dayana Brazão</p>
          </div>
        </div>

        {/* Payment Content */}
        <PaymentArea 
          onPaymentSuccess={() => {
            console.log('Payment successful');
          }}
          hasAccess={false}
          userEmail={user?.email}
        />
      </div>
    </div>
  );
}