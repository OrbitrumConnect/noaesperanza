import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Utensils, Clock, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DietaryData {
  wantsIntermittentFasting: boolean;
  fastingPreference?: string;
  dislikedFoods: string[];
  allergies: string[];
  dietaryRestrictions: string[];
  mealPreferences: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
    snacks: string[];
  };
  cookingTime: string;
  budget: string;
  waterIntake: number;
  supplementsUsed: string[];
  eatingOutFrequency: string;
  goals: string[];
  additionalNotes: string;
  planosPersonalizados?: any; // Dados dos planos gerados pela Dra. Dayana
  planId?: string; // ID do plano salvo no banco
}

interface PostConsultationFlowProps {
  onSubmit: (data: DietaryData) => void;
  onCancel?: () => void;
  patientName?: string;
}

export default function PostConsultationFlow({ onSubmit, onCancel, patientName }: PostConsultationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<DietaryData>({
    wantsIntermittentFasting: false,
    dislikedFoods: [],
    allergies: [],
    dietaryRestrictions: [],
    mealPreferences: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    cookingTime: '',
    budget: '',
    waterIntake: 2,
    supplementsUsed: [],
    eatingOutFrequency: '',
    goals: [],
    additionalNotes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatingPlans, setGeneratingPlans] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setGeneratingPlans(true);
    
    try {
      // Buscar dados do usuário para gerar planos personalizados
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!currentUser.id) {
        throw new Error('Usuário não identificado');
      }

      // Verificar se já existe um plano criado nos últimos 7 dias
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: existingPlans, error: checkError } = await supabase
        .from('educational_plans')
        .select('created_at, plan_name')
        .eq('user_id', currentUser.id)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (checkError) {
        console.error('Erro ao verificar planos existentes:', checkError);
      }

      if (existingPlans && existingPlans.length > 0) {
        const lastPlan = existingPlans[0];
        const daysSinceLastPlan = Math.ceil(
          (new Date().getTime() - new Date(lastPlan.created_at).getTime()) / (1000 * 3600 * 24)
        );
        
        toast({
          title: "Plano já existe! 📋",
          description: `Você criou um plano há ${daysSinceLastPlan} dia(s). Aguarde completar 7 dias para renovar.`,
          variant: "destructive",
        });
        
        setIsSubmitting(false);
        setGeneratingPlans(false);
        return;
      }

      toast({
        title: "Gerando seus planos personalizados...",
        description: "A Dra. Dayana está criando seu protocolo único baseado na anamnese completa.",
      });

      // Chamar a função para gerar planos da Dra. Dayana usando Supabase
      const { data: planosData, error } = await supabase.functions.invoke('generate-dayana-plans', {
        body: { user_id: currentUser.id }
      });

      if (error) {
        throw new Error('Falha ao gerar planos personalizados: ' + error.message);
      }
      
      toast({
        title: "Planos gerados com sucesso! 🎉",
        description: "Seus planos alimentar e de mudança de estilo de vida estão prontos!",
      });

      // Passar os dados coletados e os planos gerados
      onSubmit({
        ...data,
        planosPersonalizados: planosData.planos_gerados,
        planId: planosData.plan_id
      });

    } catch (error) {
      console.error('Erro ao gerar planos:', error);
      toast({
        title: "Erro ao gerar planos",
        description: "Houve um problema. Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setGeneratingPlans(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
              <Utensils className="h-6 w-6" />
              Pós-Consulta - Planos Personalizados
            </CardTitle>
            <CardDescription className="text-lg text-center">
              {patientName && `Olá, ${patientName}! `}
              Com base na anamnese completa que fizemos, agora vou gerar seus planos personalizados da Dra. Dayana: 
              <br />
              <strong className="text-primary">🥗 Plano Alimentar Funcional (7 dias)</strong> + <strong className="text-accent">🌟 Plano MEV de Mudança de Vida</strong>
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">Sem glúten, sem lactose, sem açúcar + Biohacking + Frequências quânticas</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="self-start flex items-center gap-2 text-muted-foreground"
                >
                  ← Voltar ao Dashboard
                </Button>
              )}
              
              <div className="text-center space-y-4">
                <div className="bg-card/50 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-primary mb-2">O que você receberá:</h3>
                  <ul className="text-sm text-muted-foreground space-y-2 text-left">
                    <li>• 📋 Plano alimentar de 7 dias com 4 opções por refeição</li>
                    <li>• 🧬 Receitas funcionais sem glúten, lactose e açúcar</li>
                    <li>• 🎵 Frequências quânticas personalizadas para cada dia</li>
                    <li>• 💪 Dicas de biohacking integradas</li>
                    <li>• 🌱 Protocolo de microverdes e brotos</li>
                    <li>• 🛒 Lista de compras organizada</li>
                    <li>• 🌟 Plano de mudança de estilo de vida (MEV)</li>
                    <li>• 📖 Orientações para os próximos 21 dias</li>
                  </ul>
                </div>
                
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || generatingPlans}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-lg px-8 py-6"
                >
                  {generatingPlans ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Gerando Planos Personalizados da Dra. Dayana...
                    </>
                  ) : isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5" />
                      Gerar Meus Planos Personalizados
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export type { DietaryData };