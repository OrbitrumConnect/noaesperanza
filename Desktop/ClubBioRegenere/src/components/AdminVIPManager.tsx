import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Crown, UserPlus, Users, Shield, AlertTriangle } from 'lucide-react';

interface VIPUser {
  id: string;
  email: string;
  name: string;
  subscription_tier: string;
  subscription_end: string | null;
  created_at: string;
}

export default function AdminVIPManager() {
  const { user, isAdmin } = useSupabaseAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [vipUsers, setVipUsers] = useState<VIPUser[]>([]);
  const [newVIP, setNewVIP] = useState({
    email: '',
    name: '',
    subscription_tier: 'Clube Digital',
    subscription_end: '30' // dias
  });

  // Verificar se é admin
  if (!isAdmin) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            Acesso Negado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-orange-700">Apenas administradores podem gerenciar usuários VIP.</p>
        </CardContent>
      </Card>
    );
  }

  const loadVIPUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select(`
          user_id,
          email,
          subscription_tier,
          subscription_end,
          created_at,
          profiles!inner(name)
        `)
        .eq('subscribed', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers = data?.map(user => ({
        id: user.user_id,
        email: user.email,
        name: user.profiles?.name || user.email,
        subscription_tier: user.subscription_tier,
        subscription_end: user.subscription_end,
        created_at: user.created_at
      })) || [];

      setVipUsers(formattedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários VIP:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível carregar os usuários VIP.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addVIPUser = async () => {
    if (!newVIP.email.trim()) {
      toast({
        title: "❌ Email obrigatório",
        description: "Por favor, informe o email do usuário.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Primeiro, buscar o usuário pelo email
      const { data: userData, error: userError } = await supabase
        .from('auth.users')
        .select('id, email')
        .eq('email', newVIP.email)
        .single();

      if (userError || !userData) {
        toast({
          title: "❌ Usuário não encontrado",
          description: "O email informado não está cadastrado na plataforma.",
          variant: "destructive"
        });
        return;
      }

      // Calcular data de expiração
      const subscriptionEnd = newVIP.subscription_tier === 'Clube Digital' 
        ? new Date(Date.now() + parseInt(newVIP.subscription_end) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Criar/atualizar subscription
      const { error: subscriptionError } = await supabase
        .from('subscribers')
        .upsert({
          user_id: userData.id,
          email: userData.email,
          subscribed: true,
          subscription_tier: newVIP.subscription_tier,
          subscription_end: subscriptionEnd,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (subscriptionError) throw subscriptionError;

      // Atualizar nome do perfil se fornecido
      if (newVIP.name.trim()) {
        await supabase
          .from('profiles')
          .update({ name: newVIP.name })
          .eq('user_id', userData.id);
      }

      toast({
        title: "✅ Usuário VIP adicionado",
        description: `${newVIP.email} agora tem acesso premium.`,
      });

      // Limpar formulário e recarregar lista
      setNewVIP({
        email: '',
        name: '',
        subscription_tier: 'Clube Digital',
        subscription_end: '30'
      });
      
      loadVIPUsers();

    } catch (error) {
      console.error('Erro ao adicionar usuário VIP:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível adicionar o usuário VIP.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeVIPAccess = async (userId: string, email: string) => {
    if (!confirm(`Tem certeza que deseja remover o acesso VIP de ${email}?`)) {
      return;
    }

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
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "✅ Acesso VIP removido",
        description: `${email} voltou ao plano gratuito.`,
      });

      loadVIPUsers();

    } catch (error) {
      console.error('Erro ao remover acesso VIP:', error);
      toast({
        title: "❌ Erro",
        description: "Não foi possível remover o acesso VIP.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVIPUsers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Adicionar Novo VIP */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <UserPlus className="w-5 h-5" />
            Adicionar Usuário VIP
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do Usuário *</Label>
              <Input
                id="email"
                type="email"
                value={newVIP.email}
                onChange={(e) => setNewVIP(prev => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@exemplo.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">Nome (opcional)</Label>
              <Input
                id="name"
                value={newVIP.name}
                onChange={(e) => setNewVIP(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome completo"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tier">Tipo de Plano</Label>
              <Select 
                value={newVIP.subscription_tier} 
                onValueChange={(value) => setNewVIP(prev => ({ ...prev, subscription_tier: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clube Digital">Clube Digital</SelectItem>
                  <SelectItem value="Consulta Completa">Consulta Completa</SelectItem>
                  <SelectItem value="Premium Admin">Premium Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newVIP.subscription_tier === 'Clube Digital' && (
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (dias)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newVIP.subscription_end}
                  onChange={(e) => setNewVIP(prev => ({ ...prev, subscription_end: e.target.value }))}
                  placeholder="30"
                />
              </div>
            )}
          </div>

          <Button 
            onClick={addVIPUser}
            disabled={isLoading || !newVIP.email.trim()}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            Adicionar VIP
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Usuários VIP */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Users className="w-5 h-5" />
            Usuários VIP ({vipUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-blue-700">Carregando usuários VIP...</p>
            </div>
          ) : vipUsers.length === 0 ? (
            <p className="text-blue-700 text-center py-4">Nenhum usuário VIP encontrado.</p>
          ) : (
            <div className="space-y-3">
              {vipUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium">{user.name}</span>
                      <span className="text-sm text-gray-500">({user.email})</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                        {user.subscription_tier}
                      </span>
                      {user.subscription_end && (
                        <span className="ml-2 text-gray-500">
                          Expira: {new Date(user.subscription_end).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeVIPAccess(user.id, user.email)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Remover VIP
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
