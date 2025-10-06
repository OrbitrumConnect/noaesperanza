// 🛠️ PÁGINA DE DESENVOLVIMENTO PvP
// Acesso direto para dev/admin configurar a arena

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePvPSystem } from '@/hooks/usePvPSystemTemp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Play, Settings, Users, Trophy } from 'lucide-react';

const PvPDev = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentRoom, fetchCurrentRoom } = usePvPSystem();
  
  const [roomId, setRoomId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verificar se é admin
    if (user?.email === 'phpg69@gmail.com' || user?.email === 'mariahelenaearp@gmail.com') {
      setIsAdmin(true);
    }
  }, [user]);

  const handleCreateTestRoom = async () => {
    if (!roomId) {
      alert('Digite um ID de sala');
      return;
    }
    
    // Navegar para a sala de teste
    navigate(`/arena/battle/${roomId}`);
  };

  const handleGoToLobby = () => {
    navigate('/pvp');
  };

  const handleGoToArena = () => {
    navigate('/arena');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center text-red-500">🚫 Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Esta página é apenas para administradores.</p>
            <Button onClick={() => navigate('/app')} className="mt-4">
              Voltar ao App
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/app')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao App
          </Button>
          
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-purple-500">
            🛠️ PvP Development Tools
          </h1>
          
          <div className="text-sm text-muted-foreground">
            Admin: {user?.email}
          </div>
        </div>

        {/* Cards de Acesso */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Acesso Direto à Batalha */}
          <Card className="bg-black/30 border-yellow-400/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-400">
                <Play className="w-5 h-5" />
                Acesso Direto à Batalha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roomId">ID da Sala:</Label>
                <Input
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Ex: 123e4567-e89b-12d3-a456-426614174000"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleCreateTestRoom}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                disabled={!roomId}
              >
                🎮 Entrar na Sala de Teste
              </Button>
              <p className="text-xs text-muted-foreground">
                Acessa diretamente a página de batalha PvP para configurar a arena
              </p>
            </CardContent>
          </Card>

          {/* Lobby PvP */}
          <Card className="bg-black/30 border-blue-400/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Users className="w-5 h-5" />
                Lobby PvP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Acesse o lobby onde os usuários entram na fila e configuram batalhas
              </p>
              <Button 
                onClick={handleGoToLobby}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                🏟️ Ir para Lobby PvP
              </Button>
            </CardContent>
          </Card>

          {/* Arena Principal */}
          <Card className="bg-black/30 border-purple-400/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Trophy className="w-5 h-5" />
                Arena Principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Acesse a arena principal com todos os módulos do jogo
              </p>
              <Button 
                onClick={handleGoToArena}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                ⚔️ Ir para Arena
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Informações de Desenvolvimento */}
        <Card className="mt-8 bg-black/30 border-green-400/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Settings className="w-5 h-5" />
              Informações de Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">URLs de Acesso:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <code className="bg-black/50 px-2 py-1 rounded">/pvp</code> - Lobby PvP</li>
                  <li>• <code className="bg-black/50 px-2 py-1 rounded">/arena/battle/{`{roomId}`}</code> - Batalha PvP</li>
                  <li>• <code className="bg-black/50 px-2 py-1 rounded">/arena</code> - Arena Principal</li>
                  <li>• <code className="bg-black/50 px-2 py-1 rounded">/pvp-dev</code> - Esta página (Admin)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-400 mb-2">Como Testar:</h4>
                <ol className="text-sm space-y-1">
                  <li>1. Abra 2 abas do navegador</li>
                  <li>2. Faça login com usuários diferentes</li>
                  <li>3. Vá para <code className="bg-black/50 px-2 py-1 rounded">/pvp</code></li>
                  <li>4. Entre na fila com ambos</li>
                  <li>5. Aguarde o matchmaking automático</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PvPDev;
