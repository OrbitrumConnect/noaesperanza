import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Database, User, Shield, AlertTriangle } from 'lucide-react';
import WebhookTest from './WebhookTest';

export default function SubscriptionDebug() {
  const { user, session, userProfile, isAdmin } = useSupabaseAuth();
  const { subscribed, subscription_tier, subscription_end, loading, error } = useSubscription();
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDebugData = async () => {
    setIsLoading(true);
    try {
      // Verificar dados do usuário
      const userData = {
        user: user ? {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        } : null,
        session: session ? {
          access_token: session.access_token ? 'Presente' : 'Ausente',
          refresh_token: session.refresh_token ? 'Presente' : 'Ausente',
          expires_at: session.expires_at
        } : null,
        userProfile: userProfile ? {
          id: userProfile.id,
          name: userProfile.name,
          userType: userProfile.userType,
          email: userProfile.email
        } : null,
        isAdmin
      };

      // Verificar dados da subscription no banco
      let subscriptionData = null;
      if (user?.id) {
        const { data, error } = await supabase
          .from('subscribers')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        subscriptionData = { data, error };
      }

      // Verificar localStorage
      const localStorageData = {
        user: localStorage.getItem('user'),
        supabaseAuth: Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('sb-'))
      };

      setDebugData({
        userData,
        subscriptionData,
        localStorageData,
        hookData: {
          subscribed,
          subscription_tier,
          subscription_end,
          loading,
          error
        }
      });
    } catch (error) {
      console.error('Erro ao buscar debug data:', error);
      setDebugData({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, [user, session, subscribed]);

  const refreshData = () => {
    fetchDebugData();
  };

  if (!user) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            Debug: Usuário não autenticado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">Faça login para ver os dados de debug da subscription.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Database className="w-5 h-5" />
          Debug Subscription
          <Button 
            size="sm" 
            variant="outline" 
            onClick={refreshData}
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Geral */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800">Status Geral</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Usuário:</span>
                <Badge variant={user ? "default" : "destructive"}>
                  {user ? "Logado" : "Não logado"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Admin:</span>
                <Badge variant={isAdmin ? "default" : "secondary"}>
                  {isAdmin ? "Sim" : "Não"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Subscription:</span>
                <Badge variant={subscribed ? "default" : "destructive"}>
                  {subscribed ? "Ativa" : "Inativa"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Loading:</span>
                <Badge variant={loading ? "default" : "secondary"}>
                  {loading ? "Sim" : "Não"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800">Dados da Subscription</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Tier:</span>
                <span className="font-mono">{subscription_tier || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Expira:</span>
                <span className="font-mono">
                  {subscription_end ? new Date(subscription_end).toLocaleDateString() : 'Nunca'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Error:</span>
                <span className="font-mono text-red-600">
                  {error || 'Nenhum'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dados Detalhados */}
        {debugData && (
          <div className="space-y-4">
            <details className="border rounded-lg p-3">
              <summary className="font-semibold cursor-pointer text-blue-800">
                Dados do Usuário
              </summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(debugData.userData, null, 2)}
              </pre>
            </details>

            <details className="border rounded-lg p-3">
              <summary className="font-semibold cursor-pointer text-blue-800">
                Dados do Banco (Subscribers)
              </summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(debugData.subscriptionData, null, 2)}
              </pre>
            </details>

            <details className="border rounded-lg p-3">
              <summary className="font-semibold cursor-pointer text-blue-800">
                LocalStorage
              </summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(debugData.localStorageData, null, 2)}
              </pre>
            </details>

            <details className="border rounded-lg p-3">
              <summary className="font-semibold cursor-pointer text-blue-800">
                Hook useSubscription
              </summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify(debugData.hookData, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Ações de Debug */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              console.log('=== DEBUG SUBSCRIPTION ===');
              console.log('User:', user);
              console.log('Session:', session);
              console.log('UserProfile:', userProfile);
              console.log('Subscription Hook:', { subscribed, subscription_tier, subscription_end, loading, error });
              console.log('LocalStorage:', Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('sb-')));
              console.log('========================');
            }}
          >
            Log no Console
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Limpar Cache
          </Button>
        </div>

        {/* Teste de Webhook */}
        <div className="mt-6">
          <WebhookTest />
        </div>
      </CardContent>
    </Card>
  );
}
