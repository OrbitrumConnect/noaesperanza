import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Coffee, Utensils, Moon, Target, Thermometer, 
  Lightbulb, Leaf, Music, Edit, Share, Download, 
  Clock, TrendingUp, Apple, Droplets, Timer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PlanEditModal from './PlanEditModal';

interface PersonalizedPlanData {
  id: string;
  user_id: string;
  plan_name: string;
  isafe_score: number;
  isafe_zone: string;
  objectives: string[];
  alerts: string[];
  meal_plans: {
    breakfast: { name: string; description: string; color: string };
    lunch: { name: string; description: string; color: string };
    snack: { name: string; description: string; color: string };
    dinner: { name: string; description: string; color: string };
  };
  biohacking: {
    morning: string;
    afternoon: string; 
    evening: string;
  };
  microgreens: {
    type: string[];
    usage: string;
    benefits: string;
  };
  frequencies: {
    morning: { hz: string; purpose: string };
    evening: { hz: string; purpose: string };
  };
  created_at: string;
  updated_at: string;
}

interface PersonalizedPlanProps {
  userId: string;
  isPatientView?: boolean;
  onEditPlan?: (planData: PersonalizedPlanData) => void;
}

export default function PersonalizedPlan({ userId, isPatientView = true, onEditPlan }: PersonalizedPlanProps) {
  const [planData, setPlanData] = useState<PersonalizedPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (userId && userId.trim() !== '') {
      loadPersonalizedPlan();
    }
  }, [userId]);

  const loadPersonalizedPlan = async () => {
    try {
      setLoading(true);
      
      // Verificar se userId é válido
      if (!userId || userId.trim() === '') {
        console.error('UserID inválido:', userId);
        return;
      }
      
      // Buscar plano personalizado do usuário
      const { data: planData, error } = await supabase
        .from('educational_plans')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ativo')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao carregar plano:', error);
        return;
      }

      if (planData) {
        // Transformar dados do banco para o formato da interface
        const transformedPlan: PersonalizedPlanData = {
          id: planData.id,
          user_id: planData.user_id,
          plan_name: planData.plan_name,
          isafe_score: 0, // Will be calculated from biomarkers
          isafe_zone: 'Atenção',
          objectives: ['Melhorar qualidade do sono', 'Reduzir ansiedade', 'Aumentar energia'],
          alerts: ['Privação de sono', 'Alto nível de estresse'],
          meal_plans: (typeof planData.meal_plans === 'object' && planData.meal_plans !== null) ? 
            planData.meal_plans as any : {
              breakfast: { 
                name: 'Café da Manhã', 
                description: 'Smoothie verde com espinafre, banana e microverdes',
                color: 'green'
              },
              lunch: { 
                name: 'Almoço', 
                description: 'Quinoa com legumes grelhados e azeite de oliva extra virgem',
                color: 'blue'
              },
              snack: { 
                name: 'Lanches', 
                description: 'Castanhas do Brasil (3 unidades) e chá verde',
                color: 'purple'
              },
              dinner: { 
                name: 'Jantar', 
                description: 'Salmão grelhado com aspargos e batata doce',
                color: 'orange'
              }
            },
          biohacking: (typeof planData.biohacking_practices === 'object' && planData.biohacking_practices !== null) ?
            planData.biohacking_practices as any : {
              morning: 'Banho de sol matinal (15min)',
              afternoon: 'Água com limão em jejum',
              evening: 'Respiração 4-7-8 antes de dormir'
            },
          microgreens: (typeof planData.microverdes_schedule === 'object' && planData.microverdes_schedule !== null) ?
            planData.microverdes_schedule as any : {
              type: ['Brócolis', 'Rúcula', 'Alfafa'],
              usage: 'Adicionar nas saladas e smoothies',
              benefits: 'Rico em enzimas e antioxidantes'
            },
          frequencies: (typeof planData.frequency_therapy === 'object' && planData.frequency_therapy !== null) ?
            planData.frequency_therapy as any : {
              morning: { hz: '528Hz', purpose: 'Frequência do Amor (manhã)' },
              evening: { hz: '741Hz', purpose: 'Clareza Mental (tarde)' }
            },
          created_at: planData.created_at,
          updated_at: planData.updated_at
        };
        
        setPlanData(transformedPlan);
      } else {
        // Criar plano padrão se não existir
        await createDefaultPlan();
      }
    } catch (error) {
      console.error('Erro ao carregar plano personalizado:', error);
      toast({
        title: "Erro ao carregar plano",
        description: "Não foi possível carregar seu plano personalizado.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPlan = async () => {
    try {
      const defaultPlan = {
        user_id: userId,
        plan_name: 'Plano de Bem-estar Inicial',
        plan_type: 'MEV',
        duration_days: 30,
        meal_plans: {
          breakfast: { 
            name: 'Café da Manhã', 
            description: 'Smoothie verde com espinafre, banana e microverdes',
            color: 'green'
          },
          lunch: { 
            name: 'Almoço', 
            description: 'Quinoa com legumes grelhados e azeite de oliva extra virgem',
            color: 'blue'
          },
          snack: { 
            name: 'Lanches', 
            description: 'Castanhas do Brasil (3 unidades) e chá verde',
            color: 'purple'
          },
          dinner: { 
            name: 'Jantar', 
            description: 'Salmão grelhado com aspargos e batata doce',
            color: 'orange'
          }
        },
        biohacking_practices: {
          morning: 'Banho de sol matinal (15min)',
          afternoon: 'Água com limão em jejum',
          evening: 'Respiração 4-7-8 antes de dormir'
        },
        microverdes_schedule: {
          type: ['Brócolis', 'Rúcula', 'Alfafa'],
          usage: 'Adicionar nas saladas e smoothies',
          benefits: 'Rico em enzimas e antioxidantes'
        },
        frequency_therapy: {
          morning: { hz: '528Hz', purpose: 'Frequência do Amor (manhã)' },
          evening: { hz: '741Hz', purpose: 'Clareza Mental (tarde)' }
        },
        status: 'ativo'
      };

      const { data, error } = await supabase
        .from('educational_plans')
        .insert(defaultPlan)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar plano padrão:', error);
        return;
      }

      // Recarregar após criação
      await loadPersonalizedPlan();
    } catch (error) {
      console.error('Erro ao criar plano padrão:', error);
    }
  };

  const handleEditPlan = () => {
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    // Recarregar plano após edição
    loadPersonalizedPlan();
  };

  const downloadPlan = () => {
    if (!planData) return;

    const planText = `
PLANO PERSONALIZADO - ${planData.plan_name}
Score iSAFE: ${planData.isafe_score}/10 (${planData.isafe_zone})

OBJETIVOS:
${planData.objectives.map(obj => `• ${obj}`).join('\n')}

ALERTAS:
${planData.alerts.map(alert => `⚠️ ${alert}`).join('\n')}

REFEIÇÕES:
🌅 ${planData.meal_plans.breakfast.name}: ${planData.meal_plans.breakfast.description}
🍽️ ${planData.meal_plans.lunch.name}: ${planData.meal_plans.lunch.description}
🥗 ${planData.meal_plans.snack.name}: ${planData.meal_plans.snack.description}
🌙 ${planData.meal_plans.dinner.name}: ${planData.meal_plans.dinner.description}

BIOHACKING:
• Manhã: ${planData.biohacking.morning}
• Tarde: ${planData.biohacking.afternoon}
• Noite: ${planData.biohacking.evening}

MICROVERDES:
• Tipos: ${planData.microgreens.type.join(', ')}
• Uso: ${planData.microgreens.usage}
• Benefícios: ${planData.microgreens.benefits}

FREQUÊNCIAS:
🎵 ${planData.frequencies.morning.hz} - ${planData.frequencies.morning.purpose}
🎵 ${planData.frequencies.evening.hz} - ${planData.frequencies.evening.purpose}

Gerado em: ${new Date().toLocaleDateString('pt-BR')}
    `;

    const blob = new Blob([planText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plano-personalizado-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Plano baixado!",
      description: "Seu plano personalizado foi salvo em arquivo."
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-muted rounded animate-pulse" />
          <div className="h-32 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <Card className="border-primary/20">
        <CardContent className="text-center py-8">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            Plano Personalizado em Preparação
          </h3>
          <p className="text-sm text-muted-foreground">
            Complete sua anamnese com Alice para receber seu plano MEV personalizado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Score iSAFE */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-6 border border-primary/20"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">{planData.plan_name}</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Score iSAFE:</span>
                <Badge variant="outline" className="text-base font-bold">
                  {planData.isafe_score}/10
                </Badge>
                <Badge 
                  variant={planData.isafe_zone === 'Atenção' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {planData.isafe_zone}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!isPatientView && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleEditPlan}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Editar Plano
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadPlan}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Gerar PDF
            </Button>
          </div>
        </div>

        {/* Alertas */}
        {planData.alerts.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {planData.alerts.map((alert, index) => (
              <Badge key={index} variant="destructive" className="text-xs">
                {alert}
              </Badge>
            ))}
          </div>
        )}

        {/* Objetivos */}
        <div className="mt-4">
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Objetivos:</h4>
          <div className="flex flex-wrap gap-2">
            {planData.objectives.map((objective, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Target className="w-3 h-3 mr-1" />
                {objective}
              </Badge>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tabs com Conteúdo do Plano */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="meals">Refeições</TabsTrigger>
          <TabsTrigger value="biohacking">Biohacking</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Score e Progresso */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Progresso do Plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Score iSAFE Atual</span>
                    <span className="font-semibold">{planData.isafe_score}/10</span>
                  </div>
                  <Progress value={planData.isafe_score * 10} className="h-2" />
                </div>
                <div className="text-xs text-muted-foreground">
                  Meta: Atingir zona verde (8+) em 30 dias
                </div>
              </CardContent>
            </Card>

            {/* Resumo Rápido */}
            <Card className="border-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-secondary" />
                  Resumo Diário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Coffee className="w-4 h-4 text-green-600" />
                  <span>Manhã: Smoothie + Sol</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Utensils className="w-4 h-4 text-blue-600" />
                  <span>Almoço: Quinoa + Microverdes</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Moon className="w-4 h-4 text-purple-600" />
                  <span>Noite: Respiração + 741Hz</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="meals" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(planData.meal_plans).map(([mealType, meal]) => (
              <Card key={mealType} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {mealType === 'breakfast' && <Coffee className="w-5 h-5 text-green-600" />}
                    {mealType === 'lunch' && <Utensils className="w-5 h-5 text-blue-600" />}
                    {mealType === 'snack' && <Apple className="w-5 h-5 text-purple-600" />}
                    {mealType === 'dinner' && <Moon className="w-5 h-5 text-orange-600" />}
                    {meal.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{meal.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="biohacking" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {Object.entries(planData.biohacking).map(([period, practice]) => (
              <Card key={period} className="border-accent/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-accent" />
                    {period === 'morning' && 'Manhã'}
                    {period === 'afternoon' && 'Tarde'}
                    {period === 'evening' && 'Noite'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{practice}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="extras" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Microverdes */}
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Microverdes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Tipos:</p>
                  <div className="flex flex-wrap gap-1">
                    {planData.microgreens.type.map((type, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Como usar:</p>
                  <p className="text-xs text-muted-foreground">{planData.microgreens.usage}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Benefícios:</p>
                  <p className="text-xs text-muted-foreground">{planData.microgreens.benefits}</p>
                </div>
              </CardContent>
            </Card>

            {/* Frequências */}
            <Card className="border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5 text-purple-600" />
                  Frequências
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Manhã</span>
                    <Badge variant="outline" className="text-xs">
                      {planData.frequencies.morning.hz}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {planData.frequencies.morning.purpose}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Noite</span>
                    <Badge variant="outline" className="text-xs">
                      {planData.frequencies.evening.hz}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {planData.frequencies.evening.purpose}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      <PlanEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        planData={planData}
        onSave={handleSaveEdit}
      />
    </div>
  );
}