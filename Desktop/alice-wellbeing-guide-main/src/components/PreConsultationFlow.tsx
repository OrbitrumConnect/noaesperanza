import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Check, Heart, Clock, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

interface PreConsultationData {
  identification: {
    name: string;
    age: number;
    email: string;
    whatsapp: string;
  };
  disposition: number;
  energyLevel: number;
  stressLevel: number;
  sleepQuality: string;
  symptomImprovement: number;
  treatmentSatisfaction: number;
  bowelMovements: string;
  appetite: string;
  hasPain: boolean;
  painLocation?: string;
  painLevel?: number;
  hasSideEffects: boolean;
  sideEffects?: string;
  concerns: string;
  goals: string;
  additionalComments: string;
}

interface PreConsultationFlowProps {
  onSubmit: (data: PreConsultationData) => void;
  onCancel?: () => void;
  patientName?: string;
}

const questions = [
  {
    id: 'identification',
    title: 'Identificação',
    description: 'Confirme seus dados pessoais'
  },
  {
    id: 'disposition',
    title: 'Como você está se sentindo?',
    description: 'Avalie seu estado geral atual (1-10)'
  },
  {
    id: 'energy-stress',
    title: 'Energia e Estresse',
    description: 'Como estão seus níveis de energia e estresse?'
  },
  {
    id: 'sleep-symptoms',
    title: 'Sono e Sintomas',
    description: 'Conte sobre sua qualidade de sono e sintomas'
  },
  {
    id: 'digestive',
    title: 'Saúde Digestiva',
    description: 'Como está sua digestão e apetite?'
  },
  {
    id: 'pain-effects',
    title: 'Dor e Efeitos Colaterais',
    description: 'Você sente alguma dor ou efeito colateral?'
  },
  {
    id: 'goals-concerns',
    title: 'Objetivos e Preocupações',
    description: 'O que você espera alcançar?'
  }
];

export default function PreConsultationFlow({ onSubmit, onCancel, patientName }: PreConsultationFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<PreConsultationData>({
    identification: {
      name: patientName || '',
      age: 0,
      email: '',
      whatsapp: ''
    },
    disposition: 5,
    energyLevel: 5,
    stressLevel: 5,
    sleepQuality: '',
    symptomImprovement: 5,
    treatmentSatisfaction: 5,
    bowelMovements: '',
    appetite: '',
    hasPain: false,
    painLocation: '',
    painLevel: 0,
    hasSideEffects: false,
    sideEffects: '',
    concerns: '',
    goals: '',
    additionalComments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const updateData = (field: keyof PreConsultationData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const updateIdentification = (field: keyof PreConsultationData['identification'], value: any) => {
    setData(prev => ({
      ...prev,
      identification: { ...prev.identification, [field]: value }
    }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSubmit(data);
      toast({
        title: "Avaliação pré-consulta enviada!",
        description: "Continue conversando comigo para completarmos sua avaliação.",
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

  const renderStepContent = () => {
    const currentQuestion = questions[currentStep];

    switch (currentQuestion.id) {
      case 'identification':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                value={data.identification.name}
                onChange={(e) => updateIdentification('name', e.target.value)}
                placeholder="Digite seu nome completo"
              />
            </div>
            <div>
              <Label htmlFor="age">Idade</Label>
              <Input
                id="age"
                type="number"
                value={data.identification.age || ''}
                onChange={(e) => updateIdentification('age', parseInt(e.target.value) || 0)}
                placeholder="Digite sua idade"
              />
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={data.identification.email}
                onChange={(e) => updateIdentification('email', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={data.identification.whatsapp}
                onChange={(e) => updateIdentification('whatsapp', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>
        );

      case 'disposition':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">Como você se sente hoje? (1-10)</Label>
              <div className="mt-4">
                <Slider
                  value={[data.disposition]}
                  onValueChange={(value) => updateData('disposition', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>1 - Muito mal</span>
                  <span className="font-semibold text-primary">{data.disposition}</span>
                  <span>10 - Excelente</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'energy-stress':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">Nível de energia (1-10)</Label>
              <div className="mt-4">
                <Slider
                  value={[data.energyLevel]}
                  onValueChange={(value) => updateData('energyLevel', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>1 - Sem energia</span>
                  <span className="font-semibold text-primary">{data.energyLevel}</span>
                  <span>10 - Muita energia</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold">Nível de estresse (1-10)</Label>
              <div className="mt-4">
                <Slider
                  value={[data.stressLevel]}
                  onValueChange={(value) => updateData('stressLevel', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>1 - Sem estresse</span>
                  <span className="font-semibold text-primary">{data.stressLevel}</span>
                  <span>10 - Muito estressado</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'sleep-symptoms':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">Como está sua qualidade de sono?</Label>
              <RadioGroup 
                value={data.sleepQuality} 
                onValueChange={(value) => updateData('sleepQuality', value)}
                className="mt-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excellent" id="sleep-excellent" />
                  <Label htmlFor="sleep-excellent">Excelente - durmo bem e acordo descansado</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="sleep-good" />
                  <Label htmlFor="sleep-good">Boa - durmo bem na maioria das noites</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regular" id="sleep-regular" />
                  <Label htmlFor="sleep-regular">Regular - às vezes tenho dificuldades</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="sleep-poor" />
                  <Label htmlFor="sleep-poor">Ruim - frequentemente tenho insônia</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-lg font-semibold">Melhora dos sintomas (1-10)</Label>
              <div className="mt-4">
                <Slider
                  value={[data.symptomImprovement]}
                  onValueChange={(value) => updateData('symptomImprovement', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>1 - Pioraram</span>
                  <span className="font-semibold text-primary">{data.symptomImprovement}</span>
                  <span>10 - Muito melhor</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'digestive':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">Como está seu intestino?</Label>
              <RadioGroup 
                value={data.bowelMovements} 
                onValueChange={(value) => updateData('bowelMovements', value)}
                className="mt-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="normal" id="bowel-normal" />
                  <Label htmlFor="bowel-normal">Normal - evacuação diária regular</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="constipated" id="bowel-constipated" />
                  <Label htmlFor="bowel-constipated">Intestino preso</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="loose" id="bowel-loose" />
                  <Label htmlFor="bowel-loose">Intestino solto</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="irregular" id="bowel-irregular" />
                  <Label htmlFor="bowel-irregular">Irregular - varia muito</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-lg font-semibold">Como está seu apetite?</Label>
              <RadioGroup 
                value={data.appetite} 
                onValueChange={(value) => updateData('appetite', value)}
                className="mt-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="appetite-good" />
                  <Label htmlFor="appetite-good">Bom - como bem e com prazer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="increased" id="appetite-increased" />
                  <Label htmlFor="appetite-increased">Aumentado - sinto mais fome</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="decreased" id="appetite-decreased" />
                  <Label htmlFor="appetite-decreased">Diminuído - pouco apetite</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="appetite-poor" />
                  <Label htmlFor="appetite-poor">Ruim - quase sem apetite</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 'pain-effects':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">Você sente alguma dor?</Label>
              <RadioGroup 
                value={data.hasPain ? 'yes' : 'no'} 
                onValueChange={(value) => updateData('hasPain', value === 'yes')}
                className="mt-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="pain-no" />
                  <Label htmlFor="pain-no">Não, estou sem dor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="pain-yes" />
                  <Label htmlFor="pain-yes">Sim, sinto dor</Label>
                </div>
              </RadioGroup>

              {data.hasPain && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <Label htmlFor="pain-location">Onde é a dor?</Label>
                    <Input
                      id="pain-location"
                      value={data.painLocation || ''}
                      onChange={(e) => updateData('painLocation', e.target.value)}
                      placeholder="Ex: cabeça, costas, estômago..."
                    />
                  </div>
                  <div>
                    <Label>Intensidade da dor (1-10)</Label>
                    <Slider
                      value={[data.painLevel || 0]}
                      onValueChange={(value) => updateData('painLevel', value[0])}
                      max={10}
                      min={1}
                      step={1}
                      className="w-full mt-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>1 - Leve</span>
                      <span className="font-semibold text-primary">{data.painLevel}</span>
                      <span>10 - Insuportável</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              <Label className="text-lg font-semibold">Você tem algum efeito colateral de tratamentos?</Label>
              <RadioGroup 
                value={data.hasSideEffects ? 'yes' : 'no'} 
                onValueChange={(value) => updateData('hasSideEffects', value === 'yes')}
                className="mt-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="effects-no" />
                  <Label htmlFor="effects-no">Não, nenhum efeito colateral</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="effects-yes" />
                  <Label htmlFor="effects-yes">Sim, tenho efeitos colaterais</Label>
                </div>
              </RadioGroup>

              {data.hasSideEffects && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4"
                >
                  <Label htmlFor="side-effects">Quais efeitos colaterais?</Label>
                  <Textarea
                    id="side-effects"
                    value={data.sideEffects || ''}
                    onChange={(e) => updateData('sideEffects', e.target.value)}
                    placeholder="Descreva os efeitos colaterais que você sente..."
                    className="mt-2"
                  />
                </motion.div>
              )}
            </div>
          </div>
        );

      case 'goals-concerns':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg font-semibold">Quais são suas principais preocupações?</Label>
              <Textarea
                value={data.concerns}
                onChange={(e) => updateData('concerns', e.target.value)}
                placeholder="Conte sobre suas principais preocupações de saúde..."
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-lg font-semibold">Quais são seus objetivos?</Label>
              <Textarea
                value={data.goals}
                onChange={(e) => updateData('goals', e.target.value)}
                placeholder="O que você espera alcançar com o tratamento?"
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-lg font-semibold">Satisfação com tratamento atual (1-10)</Label>
              <div className="mt-4">
                <Slider
                  value={[data.treatmentSatisfaction]}
                  onValueChange={(value) => updateData('treatmentSatisfaction', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>1 - Insatisfeito</span>
                  <span className="font-semibold text-primary">{data.treatmentSatisfaction}</span>
                  <span>10 - Muito satisfeito</span>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-lg font-semibold">Comentários adicionais</Label>
              <Textarea
                value={data.additionalComments}
                onChange={(e) => updateData('additionalComments', e.target.value)}
                placeholder="Algo mais que gostaria de compartilhar..."
                className="mt-2 min-h-[80px]"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-primary/20 shadow-xl">
          <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="text-2xl text-primary flex items-center justify-center gap-2">
              <Heart className="h-6 w-6" />
              Avaliação Pré-Consulta
            </CardTitle>
            <CardDescription className="text-lg">
              {patientName && `Olá, ${patientName}! `}
              Vamos coletar informações para preparar sua consulta médica
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Etapa {currentStep + 1} de {questions.length}
                </span>
                <span className="text-sm font-medium text-primary">
                  {Math.round(((currentStep + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            {/* Question Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="mb-6 border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-xl text-accent flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      {questions[currentStep].title}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {questions[currentStep].description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {renderStepContent()}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {onCancel && (
                  <Button
                    variant="outline"
                    onClick={onCancel}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    ← Voltar ao Dashboard
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
              </div>

              {currentStep === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Enviar Avaliação
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  className="flex items-center gap-2"
                >
                  Próximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export type { PreConsultationData };