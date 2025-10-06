import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import supabase from '@/lib/supabase';
import { TrendingUp, Users, Trophy, DollarSign } from 'lucide-react';

interface ChartData {
  dia: string;
  usuarios_ativos: number;
  usuarios_pagos: number;
  usuarios_vip: number;
  usuarios_free: number;
}

interface PvPData {
  dia: string;
  partidas_total: number;
  partidas_concluidas: number;
  total_apostado: number;
}

interface EconomyData {
  dia: string;
  total_apostado: number;
  total_pago: number;
  receita_plataforma: number;
}

interface EraData {
  favorite_era: string;
  total_usuarios: number;
  xp_medio: number;
  win_rate_medio: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const AdminCharts: React.FC = () => {
  const [usersData, setUsersData] = useState<ChartData[]>([]);
  const [pvpData, setPvpData] = useState<PvPData[]>([]);
  const [economyData, setEconomyData] = useState<EconomyData[]>([]);
  const [eraData, setEraData] = useState<EraData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);

      // Buscar dados de usuários ativos
      const { data: users } = await supabase
        .from('active_users_daily')
        .select('*')
        .order('dia', { ascending: false })
        .limit(30);

      // Buscar dados de PvP
      const { data: pvp } = await supabase
        .from('pvp_stats_daily')
        .select('*')
        .order('dia', { ascending: false })
        .limit(30);

      // Buscar dados de economia
      const { data: economy } = await supabase
        .from('economia_stats_daily')
        .select('*')
        .order('dia', { ascending: false })
        .limit(30);

      // Buscar dados de eras
      const { data: eras } = await supabase
        .from('era_stats')
        .select('*');

      setUsersData(users || []);
      setPvpData(pvp || []);
      setEconomyData(economy || []);
      setEraData(eras || []);

    } catch (error) {
      console.error('Erro ao buscar dados dos gráficos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const formatEraName = (era: string) => {
    return era.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-epic border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando gráficos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Gráfico de Usuários Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Usuários Ativos por Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usersData.slice().reverse()}>
              <XAxis 
                dataKey="dia" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => `Data: ${formatDate(value)}`}
                formatter={(value, name) => [
                  value, 
                  name === 'usuarios_ativos' ? 'Total' :
                  name === 'usuarios_pagos' ? 'Pagos' :
                  name === 'usuarios_vip' ? 'VIP' : 'Free'
                ]}
              />
              <Bar dataKey="usuarios_ativos" fill="#3b82f6" name="Total" />
              <Bar dataKey="usuarios_pagos" fill="#10b981" name="Pagos" />
              <Bar dataKey="usuarios_vip" fill="#8b5cf6" name="VIP" />
              <Bar dataKey="usuarios_free" fill="#6b7280" name="Free" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Partidas PvP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Partidas PvP por Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={pvpData.slice().reverse()}>
              <XAxis 
                dataKey="dia" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => `Data: ${formatDate(value)}`}
                formatter={(value, name) => [
                  value, 
                  name === 'partidas_total' ? 'Total' :
                  name === 'partidas_concluidas' ? 'Concluídas' : 'Apostado'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="partidas_total" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Total"
              />
              <Line 
                type="monotone" 
                dataKey="partidas_concluidas" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Concluídas"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Economia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            Economia da Plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={economyData.slice().reverse()}>
              <XAxis 
                dataKey="dia" 
                tickFormatter={formatDate}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                labelFormatter={(value) => `Data: ${formatDate(value)}`}
                formatter={(value, name) => [
                  `R$ ${value}`, 
                  name === 'total_apostado' ? 'Apostado' :
                  name === 'total_pago' ? 'Pago' : 'Receita'
                ]}
              />
              <Bar dataKey="total_apostado" fill="#f59e0b" name="Apostado" />
              <Bar dataKey="total_pago" fill="#ef4444" name="Pago" />
              <Bar dataKey="receita_plataforma" fill="#10b981" name="Receita" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Distribuição por Era */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Distribuição por Era
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={eraData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ favorite_era, total_usuarios }) => 
                    `${formatEraName(favorite_era)}: ${total_usuarios}`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_usuarios"
                >
                  {eraData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} usuários`, 'Total']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Win Rate por Era
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={eraData}>
                <XAxis 
                  dataKey="favorite_era" 
                  tickFormatter={formatEraName}
                  fontSize={10}
                />
                <YAxis fontSize={12} />
                <Tooltip 
                  labelFormatter={(value) => `Era: ${formatEraName(value)}`}
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Win Rate']}
                />
                <Bar dataKey="win_rate_medio" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Métricas */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Resumo de Métricas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="text-2xl font-bold text-blue-500">
                {usersData.reduce((sum, day) => sum + day.usuarios_ativos, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Usuários (30d)</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="text-2xl font-bold text-green-500">
                {pvpData.reduce((sum, day) => sum + day.partidas_total, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Partidas (30d)</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="text-2xl font-bold text-yellow-500">
                R$ {economyData.reduce((sum, day) => sum + day.receita_plataforma, 0).toFixed(0)}
              </div>
              <div className="text-sm text-muted-foreground">Receita Total (30d)</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="text-2xl font-bold text-purple-500">
                {eraData.length}
              </div>
              <div className="text-sm text-muted-foreground">Eras Ativas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
