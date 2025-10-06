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
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSubmit(data);
      toast({
        title: "Dados coletados com sucesso!",
        description: "Agora vamos gerar seu plano alimentar personalizado.",
      });
    } catch (error) {
      toast({
        title: "Erro ao processar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
              <Utensils className="h-6 w-6" />
              Pós-Consulta - Plano Alimentar
            </CardTitle>
            <CardDescription className="text-lg">
              {patientName && `Olá, ${patientName}! `}
              Vamos coletar informações para criar seu plano alimentar personalizado
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-4">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="self-start flex items-center gap-2 text-muted-foreground"
                >
                  ← Voltar ao Dashboard
                </Button>
              )}
              <div className="text-center">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Gerar Plano Alimentar
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