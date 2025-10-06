import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Coffee, Utensils, Moon, Target, Thermometer, 
  Lightbulb, Leaf, Music, Edit, Share, Download, 
  Clock, TrendingUp, Apple, Droplets, Timer, Send, Plus, Save, X, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import InfoTooltip from './InfoTooltip';
import { useSubscription } from '@/hooks/useSubscription';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

interface PersonalizedPlanData {
  id: string;
  user_id: string;
  plan_name: string;
  wellness_score: number;
  wellness_zone: string;
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
  startInEditMode?: boolean;
}

// Funções auxiliares para transformar dados
function transformMealPlans(mealPlans: any) {
  console.log('🍽️ TRANSFORM MEAL_PLANS INPUT:', JSON.stringify(mealPlans));
  
  // Se é null ou undefined, usar padrão
  if (!mealPlans) {
    console.log('🍽️ NULL/UNDEFINED - usando padrão');
    return getDefaultMealPlans();
  }
  
  // Se já está no formato MEV padrão (breakfast, lunch, etc.)
  if (mealPlans.breakfast || mealPlans.lunch || mealPlans.dinner || mealPlans.snack) {
    console.log('🍽️ FORMATO MEV detectado');
    return mealPlans;
  }
  
  // Se é formato Dayana - SEMPRE verificar se dias está vazio
  if (mealPlans.dias !== undefined) {
    console.log('🍽️ FORMATO DAYANA detectado, dias:', mealPlans.dias);
    
    if (!Array.isArray(mealPlans.dias) || mealPlans.dias.length === 0) {
      console.log('🍽️ DIAS VAZIO - usando padrão MEV');
      return getDefaultMealPlans();
    }
    
    // Se tem dados nos dias, transformar
    console.log('🍽️ FORMATO DAYANA COM DADOS - transformando');
    const firstDay = mealPlans.dias[0];
    const result: any = {};

    if (firstDay?.refeicoes) {
      Object.entries(firstDay.refeicoes).forEach(([mealType, options]: [string, any]) => {
        if (Array.isArray(options) && options.length > 0) {
          const firstOption = options[0];
          result[mealType === 'cafe_manha' ? 'breakfast' : 
                  mealType === 'almoco' ? 'lunch' : 
                  mealType === 'lanche_tarde' ? 'snack' : 
                  mealType === 'jantar' ? 'dinner' : mealType] = {
            name: getMealName(mealType),
            description: firstOption.nome || 'Opção personalizada',
            color: getMealColor(mealType)
          };
        }
      });
    }

    return Object.keys(result).length > 0 ? result : getDefaultMealPlans();
  }
  
  // Fallback final
  console.log('🍽️ FALLBACK - usando padrão');
  return getDefaultMealPlans();
}

function getDefaultMealPlans() {
  return {
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
  };
}

function transformBiohacking(biohackingData: any) {
  console.log('⚡ TRANSFORM BIOHACKING INPUT:', biohackingData);
  
  // Se é null ou undefined
  if (!biohackingData) {
    console.log('⚡ NULL/UNDEFINED - usando padrão');
    return getDefaultBiohacking();
  }
  
  // Se já está no formato MEV padrão (morning, afternoon, evening)
  if (biohackingData.morning || biohackingData.afternoon || biohackingData.evening) {
    console.log('⚡ FORMATO MEV detectado');
    return biohackingData;
  }
  
  // Se é formato Dayana com dias[] vazios
  if (biohackingData.dias) {
    if (!Array.isArray(biohackingData.dias) || biohackingData.dias.length === 0) {
      console.log('⚡ FORMATO DAYANA VAZIO - usando padrão MEV');
      return getDefaultBiohacking();
    }
    
    // Transformar formato Dayana com dados para MEV
    console.log('⚡ FORMATO DAYANA COM DADOS - transformando');
    const firstDay = biohackingData.dias[0];
    return {
      morning: firstDay.biohacking || 'Prática matinal personalizada',
      afternoon: firstDay.como_aplicar || 'Prática da tarde personalizada',
      evening: firstDay.frequencia || 'Prática noturna personalizada'
    };
  }
  
  // Fallback final
  console.log('⚡ FALLBACK - usando padrão');
  return getDefaultBiohacking();
}

function getDefaultBiohacking() {
  return {
    morning: 'Banho de sol matinal (15min)',
    afternoon: 'Água com limão em jejum',
    evening: 'Respiração 4-7-8 antes de dormir'
  };
}

function transformMicrogreens(microverdesData: any) {
  console.log('🌱 TRANSFORM MICROGREENS INPUT:', microverdesData);
  
  if (!microverdesData) {
    return getDefaultMicrogreens();
  }
  
  if (microverdesData.type && microverdesData.usage) {
    return microverdesData;
  }
  
  return getDefaultMicrogreens();
}

function getDefaultMicrogreens() {
  return {
    type: ['Brócolis', 'Rúcula', 'Alfafa'],
    usage: 'Adicionar nas saladas e smoothies',
    benefits: 'Rico em enzimas e antioxidantes'
  };
}

function transformFrequencies(frequencyData: any) {
  console.log('🎵 TRANSFORM FREQUENCIES INPUT:', frequencyData);
  
  if (!frequencyData) {
    return getDefaultFrequencies();
  }
  
  if (frequencyData.morning && frequencyData.evening) {
    return frequencyData;
  }
  
  return getDefaultFrequencies();
}

function getDefaultFrequencies() {
  return {
    morning: { hz: '528Hz', purpose: 'Frequência do Amor (manhã)' },
    evening: { hz: '741Hz', purpose: 'Clareza Mental (tarde)' }
  };
}

function getMealName(mealType: string): string {
  const names: { [key: string]: string } = {
    cafe_manha: 'Café da Manhã',
    almoco: 'Almoço',
    lanche_tarde: 'Lanche da Tarde',
    jantar: 'Jantar',
    ceia: 'Ceia'
  };
  return names[mealType] || mealType;
}

function getMealColor(mealType: string): string {
  const colors: { [key: string]: string } = {
    cafe_manha: 'green',
    almoco: 'blue',
    lanche_tarde: 'purple',
    jantar: 'orange',
    ceia: 'pink'
  };
  return colors[mealType] || 'gray';
}

export default function PersonalizedPlan({ userId, isPatientView = true, onEditPlan, startInEditMode = false }: PersonalizedPlanProps) {
  const [planData, setPlanData] = useState<PersonalizedPlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [editedPlan, setEditedPlan] = useState<PersonalizedPlanData | null>(null);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();
  
  // ✅ Verificar subscription antes de carregar plano
  const { subscribed, loading: subscriptionLoading } = useSubscription();
  const { isAdmin } = useSupabaseAuth();

  // ✅ Renderizar tela de bloqueio para usuários sem subscription
  if (!subscriptionLoading && !subscribed && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full p-8 mb-6">
          <Heart className="w-16 h-16 text-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Plano Personalizado Premium
        </h2>
        
        <p className="text-gray-600 mb-6 max-w-md">
          Acesse seu plano personalizado de bem-estar com dicas exclusivas, 
          receitas e práticas de biohacking personalizadas.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            size="lg"
            onClick={() => window.dispatchEvent(new CustomEvent('show-payment-modal'))}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            <Crown className="w-5 h-5 mr-2" />
            Assinar Agora
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  // DEBUG: Log inicial apenas uma vez
  useEffect(() => {
    console.log('🔍 PersonalizedPlan montado:', {
      userId,
      isPatientView,
      timestamp: new Date().toISOString()
    });
  }, []);

  useEffect(() => {
    // ✅ Só carregar plano se tiver acesso (subscribed ou admin)
    if (userId && userId.trim() !== '' && !subscriptionLoading) {
      if (subscribed || isAdmin) {
        console.log('✅ [PLAN] Usuário tem acesso - carregando plano');
        loadPersonalizedPlan();
      } else {
        console.log('❌ [PLAN] Usuário sem subscription - bloqueando acesso');
        setLoading(false);
        setPlanData(null);
      }
    }
  }, [userId, subscribed, isAdmin, subscriptionLoading]);

  // Ativar edição quando startInEditMode mudar
  useEffect(() => {
    if (startInEditMode && planData) {
      setIsEditing(true);
      setEditedPlan(planData);
    }
  }, [startInEditMode, planData]);

  const loadPersonalizedPlan = async () => {
    try {
      setLoading(true);
      
      // Verificar se userId é válido
      if (!userId || userId.trim() === '') {
        console.error('UserID inválido:', userId);
        return;
      }
      
      console.log(`🔍 Carregando plano para usuário: ${userId} (Admin view: ${!isPatientView})`);
      
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
        console.log('✅ Plano encontrado:', planData);
        
        // Transformar dados do banco para o formato da interface
        const transformedPlan: PersonalizedPlanData = {
          id: planData.id,
          user_id: planData.user_id,
          plan_name: planData.plan_name,
          wellness_score: 7, // Score de bem-estar baseado nos hábitos
          wellness_zone: 'Progresso',
          objectives: ['Melhorar qualidade do sono', 'Reduzir ansiedade', 'Aumentar energia'],
          alerts: ['Manter consistência nos hábitos', 'Hidratação adequada'],
          meal_plans: transformMealPlans(planData.meal_plans),
          biohacking: transformBiohacking(planData.biohacking_practices),
          microgreens: transformMicrogreens(planData.microverdes_schedule),
          frequencies: transformFrequencies(planData.frequency_therapy),
          created_at: planData.created_at,
          updated_at: planData.updated_at
        };
        
        console.log('📋 Plano transformado:', transformedPlan);
        setPlanData(transformedPlan);
      } else {
        console.log('❌ Nenhum plano encontrado');
        
        // Para admin, mostrar dados padrão em vez de criar novo plano
        if (!isPatientView) {
          console.log('👑 ADMIN SEM PLANO - Mostrando interface padrão editável');
          
          const defaultPlan: PersonalizedPlanData = {
            id: 'temp-admin-plan',
            user_id: userId,
            plan_name: 'Plano Administrativo',
            wellness_score: 8,
            wellness_zone: 'Excelente',
            objectives: ['Gerenciar pacientes', 'Acompanhar progressos', 'Personalizar tratamentos'],
            alerts: ['Sistema funcionando normalmente'],
            meal_plans: getDefaultMealPlans(),
            biohacking: getDefaultBiohacking(),
            microgreens: getDefaultMicrogreens(),
            frequencies: getDefaultFrequencies(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setPlanData(defaultPlan);
        } else {
          // Para paciente, criar plano padrão
          await createDefaultPlan();
        }
      }
    } catch (error) {
      console.error('Erro ao carregar plano personalizado:', error);
      
      // MESMO COM ERRO, nunca deixar o app quebrado
      const emergencyPlan: PersonalizedPlanData = {
        id: 'emergency-plan',
        user_id: userId,
        plan_name: 'Plano de Emergência',
        wellness_score: 5,
        wellness_zone: 'Atenção',
        objectives: ['Recuperar funcionalidade', 'Contactar suporte'],
        alerts: ['Sistema temporariamente indisponível'],
        meal_plans: getDefaultMealPlans(),
        biohacking: getDefaultBiohacking(),
        microgreens: getDefaultMicrogreens(), 
        frequencies: getDefaultFrequencies(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setPlanData(emergencyPlan);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPlan = async () => {
    try {
      const defaultPlan = {
        user_id: userId,
        plan_name: `Plano de Bem-estar - ${userId?.substring(0, 8)}`,
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

      console.log('Criando plano padrão para usuário:', userId);

      const { data, error } = await supabase
        .from('educational_plans')
        .insert(defaultPlan)
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar plano padrão:', error);
        toast({
          title: "Erro ao criar plano",
          description: `Não foi possível criar o plano: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('Plano padrão criado com sucesso:', data);
      
      toast({
        title: "✅ Plano criado!",
        description: "Plano padrão criado. Agora você pode editá-lo.",
        variant: "default"
      });

      // Recarregar após criação
      await loadPersonalizedPlan();
    } catch (error) {
      console.error('Erro ao criar plano padrão:', error);
      toast({
        title: "Erro ao criar plano",
        description: "Ocorreu um erro inesperado ao criar o plano.",
        variant: "destructive"
      });
    }
  };

  const startEditing = () => {
    console.log('🎯 INICIANDO EDIÇÃO INLINE');
    setIsEditing(true);
    setEditedPlan(planData);
  };

  const cancelEditing = () => {
    console.log('❌ CANCELANDO EDIÇÃO');
    setIsEditing(false);
    setEditedPlan(null);
  };

  const saveChanges = async () => {
    if (!editedPlan) return;
    
    try {
      setSaving(true);
      console.log('💾 SALVANDO ALTERAÇÕES:', editedPlan);
      
      const updateData = {
        plan_name: editedPlan.plan_name,
        meal_plans: editedPlan.meal_plans,
        biohacking_practices: editedPlan.biohacking,
        microverdes_schedule: editedPlan.microgreens,
        frequency_therapy: editedPlan.frequencies,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('educational_plans')
        .update(updateData)
        .eq('id', editedPlan.id)
        .select();

      if (error) {
        console.error('Erro ao salvar plano:', error);
        toast({
          title: "Erro ao salvar",
          description: `Não foi possível salvar as alterações: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Plano salvo com sucesso:', data);

      toast({
        title: "✅ Plano atualizado!",
        description: "Todas as alterações foram salvas com sucesso.",
        variant: "default"
      });
      
      setPlanData(editedPlan);
      setIsEditing(false);
      setEditedPlan(null);
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro inesperado ao salvar o plano.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateEditedPlan = (field: string, value: any) => {
    if (!editedPlan) return;
    setEditedPlan(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateMealPlan = (mealType: string, field: string, value: string) => {
    setEditedPlan(prev => prev ? {
      ...prev,
      meal_plans: {
        ...prev.meal_plans,
        [mealType]: {
          ...prev.meal_plans[mealType],
          [field]: value
        }
      }
    } : null);
  };

  const updateBiohacking = (period: string, value: string) => {
    setEditedPlan(prev => prev ? {
      ...prev,
      biohacking: {
        ...prev.biohacking,
        [period]: value
      }
    } : null);
  };

  const updateMicrogreens = (field: string, value: any) => {
    setEditedPlan(prev => prev ? {
      ...prev,
      microgreens: {
        ...prev.microgreens,
        [field]: value
      }
    } : null);
  };

  const updateFrequency = (period: string, field: string, value: string) => {
    setEditedPlan(prev => prev ? {
      ...prev,
      frequencies: {
        ...prev.frequencies,
        [period]: {
          ...prev.frequencies[period],
          [field]: value
        }
      }
    } : null);
  };

  const refreshPlan = async () => {
    setRefreshing(true);
    await loadPersonalizedPlan();
    setRefreshing(false);
    
    toast({
      title: "✅ Plano atualizado!",
      description: "Dados mais recentes carregados.",
      variant: "default"
    });
  };

  const downloadPlan = () => {
    if (!planData) return;
    
    const planText = `
PLANO PERSONALIZADO - ${planData.plan_name}
Score de Bem-estar: ${planData.wellness_score}/10 (${planData.wellness_zone})

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
            {isPatientView ? 'Plano Personalizado em Preparação' : 'Nenhum Plano Encontrado'}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isPatientView 
              ? 'Complete sua anamnese com Alice para receber seu plano MEV personalizado.'
              : 'Este paciente ainda não possui um plano educacional. Como administrador, você pode criar um agora.'
            }
          </p>
          {!isPatientView && (
            <Button 
              onClick={createDefaultPlan}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Plano Padrão
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Score de Bem-estar */}
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
                <span className="text-sm text-muted-foreground">Score de Bem-estar:</span>
                <Badge variant="outline" className="text-base font-bold">
                  {planData.wellness_score}/10
                </Badge>
                <Badge 
                  variant={planData.wellness_zone === 'Atenção' ? 'destructive' : 'secondary'}
                  className="text-xs"
                >
                  {planData.wellness_zone}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={refreshPlan}
              disabled={refreshing}
              className="flex items-center gap-2 opacity-70 hover:opacity-100"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </Button>
            
            {!isPatientView && (
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={startEditing}
                    className="flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Editar Plano
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={saveChanges}
                      disabled={saving}
                      className="flex items-center gap-2 bg-green-50 hover:bg-green-100"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Salvando...' : 'Salvar'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={cancelEditing}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </Button>
                  </>
                )}
                <InfoTooltip 
                  title="Edição Inline"
                  content="Clique em 'Editar Plano' para editar diretamente no card. Suas alterações serão salvas automaticamente."
                  variant="info"
                />
              </div>
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
          {/* Plano Completo - Formato Administrativo */}
          {!isPatientView && planData ? (
            <div className="space-y-6">
              {/* Card Principal do Plano Personalizado */}
              <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Heart className="w-6 h-6 text-primary" />
                    ✅ ADMIN VIEW - Plano Personalizado Detalhado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Refeições Detalhadas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Café da Manhã */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-green-600 flex items-center gap-2">
                        🌅 Café da Manhã
                      </h4>
                      {isEditing ? (
                        <Textarea
                          value={editedPlan?.meal_plans?.breakfast?.description || ''}
                          onChange={(e) => updateMealPlan('breakfast', 'description', e.target.value)}
                          className="text-sm bg-green-50 border-green-200 focus:border-green-400"
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                          {planData.meal_plans?.breakfast?.description || 'Smoothie verde com espinafre, banana e microverdes'}
                        </p>
                      )}
                    </div>

                    {/* Almoço */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-blue-600 flex items-center gap-2">
                        🍽️ Almoço
                      </h4>
                      {isEditing ? (
                        <Textarea
                          value={editedPlan?.meal_plans?.lunch?.description || ''}
                          onChange={(e) => updateMealPlan('lunch', 'description', e.target.value)}
                          className="text-sm bg-blue-50 border-blue-200 focus:border-blue-400"
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm bg-blue-50 p-3 rounded-lg border border-blue-200">
                          {planData.meal_plans?.lunch?.description || 'Quinoa com legumes grelhados e azeite de oliva'}
                        </p>
                      )}
                    </div>

                    {/* Jantar */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-orange-600 flex items-center gap-2">
                        🌙 Jantar
                      </h4>
                      {isEditing ? (
                        <Textarea
                          value={editedPlan?.meal_plans?.dinner?.description || ''}
                          onChange={(e) => updateMealPlan('dinner', 'description', e.target.value)}
                          className="text-sm bg-orange-50 border-orange-200 focus:border-orange-400"
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm bg-orange-50 p-3 rounded-lg border border-orange-200">
                          {planData.meal_plans?.dinner?.description || 'Salmão grelhado com aspargos e batata doce'}
                        </p>
                      )}
                    </div>

                    {/* Lanches */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-purple-600 flex items-center gap-2">
                        🥜 Lanches
                      </h4>
                      {isEditing ? (
                        <Textarea
                          value={editedPlan?.meal_plans?.snack?.description || ''}
                          onChange={(e) => updateMealPlan('snack', 'description', e.target.value)}
                          className="text-sm bg-purple-50 border-purple-200 focus:border-purple-400"
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm bg-purple-50 p-3 rounded-lg border border-purple-200">
                          {planData.meal_plans?.snack?.description || 'Castanhas do Brasil (3 unidades) e chá verde'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Biohacking */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-primary flex items-center gap-2">
                      ⚡ Biohacking
                    </h4>
                    <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                      <div className="flex flex-wrap gap-3">
                        {isEditing ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
                            <Input
                              value={editedPlan?.biohacking?.morning || ''}
                              onChange={(e) => updateBiohacking('morning', e.target.value)}
                              placeholder="Prática matinal"
                              className="text-xs"
                            />
                            <Input
                              value={editedPlan?.biohacking?.afternoon || ''}
                              onChange={(e) => updateBiohacking('afternoon', e.target.value)}
                              placeholder="Prática da tarde"
                              className="text-xs"
                            />
                            <Input
                              value={editedPlan?.biohacking?.evening || ''}
                              onChange={(e) => updateBiohacking('evening', e.target.value)}
                              placeholder="Prática noturna"
                              className="text-xs"
                            />
                          </div>
                        ) : (
                          <>
                            <Badge variant="outline" className="bg-primary/10">
                              {planData.biohacking?.morning || 'Banho de sol matinal'}
                            </Badge>
                            <Badge variant="outline" className="bg-primary/10">
                              {planData.biohacking?.afternoon || 'Água com limão'}
                            </Badge>
                            <Badge variant="outline" className="bg-primary/10">
                              {planData.biohacking?.evening || 'Respiração 4-7-8'}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Microverdes */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-600 flex items-center gap-2">
                      🌱 Microverdes
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      {isEditing ? (
                        <Input
                          value={editedPlan?.microgreens?.type?.join(', ') || ''}
                          onChange={(e) => updateMicrogreens('type', e.target.value.split(', ').filter(Boolean))}
                          placeholder="Ex: Brócolis, Rúcula, Alfafa"
                          className="text-sm bg-white"
                        />
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {planData.microgreens?.type?.map((type: string, index: number) => (
                            <Badge key={index} variant="outline" className="bg-green-100 border-green-300">
                              {type}
                            </Badge>
                          )) || (
                            <>
                              <Badge variant="outline" className="bg-green-100 border-green-300">Brócolis</Badge>
                              <Badge variant="outline" className="bg-green-100 border-green-300">Rúcula</Badge>
                              <Badge variant="outline" className="bg-green-100 border-green-300">Alfafa</Badge>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Frequências */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-purple-600 flex items-center gap-2">
                      🎵 Frequências
                    </h4>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Manhã:</label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={editedPlan?.frequencies?.morning?.hz || ''}
                                onChange={(e) => updateFrequency('morning', 'hz', e.target.value)}
                                placeholder="528Hz"
                                className="text-xs"
                              />
                              <Input
                                value={editedPlan?.frequencies?.morning?.purpose || ''}
                                onChange={(e) => updateFrequency('morning', 'purpose', e.target.value)}
                                placeholder="Propósito"
                                className="text-xs"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-medium">Tarde:</label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={editedPlan?.frequencies?.evening?.hz || ''}
                                onChange={(e) => updateFrequency('evening', 'hz', e.target.value)}
                                placeholder="741Hz"
                                className="text-xs"
                              />
                              <Input
                                value={editedPlan?.frequencies?.evening?.purpose || ''}
                                onChange={(e) => updateFrequency('evening', 'purpose', e.target.value)}
                                placeholder="Propósito"
                                className="text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          <Badge variant="outline" className="bg-purple-100 border-purple-300">
                            {planData.frequencies?.morning?.hz || '528Hz'} - {planData.frequencies?.morning?.purpose || 'Manhã'}
                          </Badge>
                          <Badge variant="outline" className="bg-purple-100 border-purple-300">
                            {planData.frequencies?.evening?.hz || '741Hz'} - {planData.frequencies?.evening?.purpose || 'Tarde'}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botões de Ação - Administrativo */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    {!isEditing ? (
                      <>
                        <Button 
                          onClick={startEditing}
                          className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary"
                        >
                          <Edit className="w-4 h-4" />
                          Editar Plano
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" />
                          Enviar ao Paciente
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={downloadPlan}
                          className="flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Gerar PDF
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={saveChanges}
                          disabled={saving}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                          {saving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={cancelEditing}
                          className="flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Versão Original para Pacientes */
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
                      <span>Score de Bem-estar</span>
                      <span className="font-semibold">{planData.wellness_score}/10</span>
                    </div>
                    <Progress value={planData.wellness_score * 10} className="h-2" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Meta: Atingir zona excelente (8+) em 30 dias
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
                    <span>Manhã: {planData.biohacking.morning}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Utensils className="w-4 h-4 text-blue-600" />
                    <span>Tarde: {planData.biohacking.afternoon}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Moon className="w-4 h-4 text-purple-600" />
                    <span>Noite: {planData.biohacking.evening}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
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
                <div>
                  <p className="text-sm font-medium mb-1">Manhã:</p>
                  <Badge variant="outline" className="text-xs">
                    {planData.frequencies.morning.hz}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {planData.frequencies.morning.purpose}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Noite:</p>
                  <Badge variant="outline" className="text-xs">
                    {planData.frequencies.evening.hz}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {planData.frequencies.evening.purpose}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}