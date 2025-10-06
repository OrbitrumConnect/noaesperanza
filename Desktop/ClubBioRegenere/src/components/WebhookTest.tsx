import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Zap, TestTube, CheckCircle, AlertTriangle, Database } from 'lucide-react';

export default function WebhookTest() {
  const { user } = useSupabaseAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState({
    userId: user?.id || '',
    email: user?.email || '',
    planType: 'club-digital',
    paymentStatus: 'approved'
  });

  const simulatePayment = async () => {
    setIsLoading(true);
    try {
      // Simular dados de pagamento do MercadoPago
      const mockPayment = {
        id: Math.random().toString(36).substr(2, 9),
        status: testData.paymentStatus,
        external_reference: `${testData.userId}-${testData.planType}`,
        payer: {
          email: testData.email
        },
        transaction_amount: testData.planType === 'club-digital' ? 297 : 620,
        payment_method: {
          type: 'credit_card'
        },
        created_at: new Date().toISOString()
      };

      console.log('🧪 Simulando pagamento:', mockPayment);

      // Chamar webhook diretamente
      const response = await fetch('/api/webhook-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'payment',
          data: {
            id: mockPayment.id
          }
        })
      });

      if (response.ok) {
        toast({
          title: "✅ Pagamento Simulado",
          description: `Status: ${testData.paymentStatus}. Verifique o banco de dados.`,
        });
      } else {
        throw new Error('Erro na simulação');
      }

    } catch (error) {
      console.error('Erro ao simular pagamento:', error);
      toast({
        title: "❌ Erro na Simulação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDatabaseUpdate = async () => {
    setIsLoading(true);
    try {
      // Atualizar diretamente no banco
      const { data, error } = await supabase
        .from('subscribers')
        .upsert({
          user_id: testData.userId,
          email: testData.email,
          subscribed: true,
          subscription_tier: testData.planType === 'club-digital' ? 'Clube Digital' : 'Consulta Completa',
          subscription_end: testData.planType === 'club-digital' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "✅ Banco Atualizado",
        description: "Subscription atualizada diretamente no banco.",
      });

    } catch (error) {
      console.error('Erro ao atualizar banco:', error);
      toast({
        title: "❌ Erro no Banco",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkSubscription = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .eq('user_id', testData.userId)
        .single();

      if (error) throw error;

      toast({
        title: "📊 Dados da Subscription",
        description: `Status: ${data.subscribed ? 'Ativa' : 'Inativa'}, Tier: ${data.subscription_tier}`,
      });

      console.log('📊 Dados da subscription:', data);

    } catch (error) {
      console.error('Erro ao verificar subscription:', error);
      toast({
        title: "❌ Erro na Verificação",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetSubscription = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({
          subscribed: false,
          subscription_tier: 'Free',
          subscription_end: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', testData.userId);

      if (error) throw error;

      toast({
        title: "🔄 Subscription Resetada",
        description: "Status voltou para Free.",
      });

    } catch (error) {
      console.error('Erro ao resetar subscription:', error);
      toast({
        title: "❌ Erro no Reset",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <TestTube className="w-5 h-5" />
          Teste de Webhook e Pagamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dados de Teste */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={testData.userId}
              onChange={(e) => setTestData(prev => ({ ...prev, userId: e.target.value }))}
              placeholder="ID do usuário"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={testData.email}
              onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Email do usuário"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="planType">Tipo de Plano</Label>
            <Select 
              value={testData.planType} 
              onValueChange={(value) => setTestData(prev => ({ ...prev, planType: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="club-digital">Clube Digital</SelectItem>
                <SelectItem value="consulta-completa">Consulta Completa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="paymentStatus">Status do Pagamento</Label>
            <Select 
              value={testData.paymentStatus} 
              onValueChange={(value) => setTestData(prev => ({ ...prev, paymentStatus: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="approved">Aprovado</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="rejected">Rejeitado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Botões de Teste */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={simulatePayment}
            disabled={isLoading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <Zap className="w-4 h-4 mr-2" />
            Simular Webhook
          </Button>
          
          <Button 
            onClick={testDatabaseUpdate}
            disabled={isLoading}
            variant="outline"
          >
            <Database className="w-4 h-4 mr-2" />
            Atualizar Banco
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={checkSubscription}
            disabled={isLoading}
            variant="outline"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Verificar Status
          </Button>
          
          <Button 
            onClick={resetSubscription}
            disabled={isLoading}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Resetar para Free
          </Button>
        </div>

        {/* Informações */}
        <div className="text-xs text-orange-700 bg-orange-100 p-3 rounded-lg">
          <p><strong>Como usar:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-2">
            <li>Preencha os dados do usuário</li>
            <li>Escolha o tipo de plano e status</li>
            <li>Clique em "Simular Webhook" para testar o fluxo completo</li>
            <li>Use "Atualizar Banco" para forçar a atualização</li>
            <li>Verifique o status com "Verificar Status"</li>
            <li>Use "Resetar" para voltar ao estado free</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
