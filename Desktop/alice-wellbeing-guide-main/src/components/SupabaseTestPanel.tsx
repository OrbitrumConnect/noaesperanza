import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { useConversationHistory } from '@/hooks/useConversationHistory';
import { useUserData } from '@/hooks/useUserData';
import { useSupabaseData } from '@/hooks/useSupabaseData';
import { Database, MessageSquare, User, Activity, CheckCircle } from 'lucide-react';

export default function SupabaseTestPanel() {
  const { userProfile, isAuthenticated, loading: authLoading } = useSupabaseAuth();
  const { conversations, saveMessage, loading: conversationLoading } = useConversationHistory(userProfile?.id);
  const { healthProfile, dailyHabits, loading: userDataLoading } = useUserData(userProfile?.id);
  const { biomarcadores, educationalPlans, loading: supabaseDataLoading } = useSupabaseData(userProfile?.id);

  const testSaveMessage = async () => {
    if (!userProfile?.id) return;
    
    const sessionId = userProfile.id + '-' + new Date().toISOString().split('T')[0];
    await saveMessage(
      'Teste de mensagem para verificar integração com Supabase',
      'user',
      sessionId
    );
  };

  if (authLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Verificando autenticação...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Status do Backend Supabase
          </CardTitle>
          <CardDescription>
            Faça login para testar a integração com o backend
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            ⚠️ Usuário não autenticado. Faça login para ver o status da integração.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Status do Backend Supabase
          </CardTitle>
          <CardDescription>
            Integração completa com autenticação e persistência de dados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status de Autenticação */}
          <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                ✅ Autenticação Conectada
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Usuário: {userProfile?.name} ({userProfile?.userType})
              </p>
            </div>
          </div>

          {/* Status das Conversas */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-blue-800 dark:text-blue-200">
                💬 Conversas da Alice
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {conversationLoading ? 'Carregando...' : `${conversations.length} mensagens salvas`}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={testSaveMessage}
              disabled={conversationLoading}
            >
              Testar Salvamento
            </Button>
          </div>

          {/* Status dos Dados do Usuário */}
          <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <User className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-purple-800 dark:text-purple-200">
                👤 Dados do Usuário
              </p>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                {userDataLoading ? 'Carregando...' : 
                  `Perfil de saúde: ${healthProfile ? '✅' : '❌'} | Hábitos: ${dailyHabits.length} registros`
                }
              </p>
            </div>
          </div>

          {/* Status dos Biomarcadores */}
          <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <Activity className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800 dark:text-orange-200">
                📊 Biomarcadores & Planos
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-400">
                {supabaseDataLoading ? 'Carregando...' : 
                  `Biomarcadores: ${biomarcadores.length} | Planos: ${educationalPlans.length}`
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Últimas Conversas */}
      {conversations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Últimas Conversas com Alice</CardTitle>
            <CardDescription>
              Mensagens salvas no Supabase (últimas 5)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {conversations.slice(-5).reverse().map((conv) => (
              <div key={conv.id} className={`p-3 rounded-lg ${
                conv.message_type === 'alice' ? 'bg-blue-50 dark:bg-blue-950' : 'bg-gray-50 dark:bg-gray-900'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium">
                    {conv.message_type === 'alice' ? '🤖 Alice' : '👤 Usuário'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(conv.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-sm">{conv.message_content.substring(0, 100)}...</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}