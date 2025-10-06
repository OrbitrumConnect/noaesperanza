import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Utensils, Download, Send, BookOpen, Video, ChefHat, Heart, Star, Leaf } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import type { DietaryData } from './PostConsultationFlow';

interface UserData {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  mainObjective?: string;
  activityLevel?: string;
  stressLevel?: number;
  sleepHours?: number;
}

interface MealDetails {
  name: string;
  ingredients: string[];
  preparation: string;
  function: string;
  reason: string;
  positivePhrase: string;
  draTip: string;
  quantumFrequency: string;
  biohacking: string;
  microgreens: string;
  calories: number;
}

interface DayPlan {
  day: number;
  dayName: string;
  meals: {
    breakfast: MealDetails[];
    lunch: MealDetails[];
    afternoonSnack: MealDetails[];
    dinner: MealDetails[];
    supper: MealDetails[];
  };
  lifestyle: string;
  hydration: string;
  supplements: string[];
}

interface MealPlanGeneratorProps {
  userData: UserData;
  dietaryData: DietaryData;
  conversationSummary: string;
  onSendToDoctor: (plan: DayPlan[]) => void;
  onViewContent: (type: 'ebook' | 'video', category: string) => void;
  onBack: () => void;
}

export default function MealPlanGenerator({ 
  userData, 
  dietaryData, 
  conversationSummary,
  onSendToDoctor,
  onViewContent,
  onBack 
}: MealPlanGeneratorProps) {
  const [mealPlan, setMealPlan] = useState<DayPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [activeDay, setActiveDay] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    generateMealPlan();
  }, []);

  const generateMealPlan = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const plan = generateWeeklyPlan();
    setMealPlan(plan);
    setIsGenerating(false);
    
    toast({
      title: "Plano gerado com sucesso!",
      description: "Seu plano alimentar funcional de 7 dias está pronto para revisão médica.",
    });
  };

  const generateWeeklyPlan = (): DayPlan[] => {
    const days = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    
    return days.map((day, index) => ({
      day: index + 1,
      dayName: day,
      meals: generateDayMeals(index),
      lifestyle: generateLifestyleTip(index),
      hydration: `2 litros de água alcalina por dia (pode adicionar rodelas de limão e folhas de hortelã para potencializar)`,
      supplements: dietaryData.supplementsUsed
    }));
  };

  const generateDayMeals = (dayIndex: number) => {
    const isVegan = dietaryData.dietaryRestrictions.includes('Vegano');
    const isVegetarian = dietaryData.dietaryRestrictions.includes('Vegetariano');
    const isLowCarb = dietaryData.dietaryRestrictions.includes('Low carb');
    const hasFasting = dietaryData.wantsIntermittentFasting;

    // Café da Manhã
    const breakfastOptions = [
      {
        name: 'Panqueca funcional de banana com aveia e chia',
        ingredients: ['1 banana madura amassada', '2 colheres de sopa de aveia sem glúten', '1 colher de chá de chia', '1 ovo caipira'],
        preparation: 'Misture todos os ingredientes e grelhe em frigideira untada com óleo de coco.',
        function: 'Fornecer energia limpa e saciedade, ativar metabolismo, iniciar o dia com nutrientes anti-inflamatórios.',
        reason: 'Ingredientes ricos em magnésio, triptofano e fibras para regular o intestino e equilibrar o sistema nervoso.',
        positivePhrase: 'Hoje eu escolho ser leve, em todos os sentidos.',
        draTip: 'Você pode substituir a banana por maçã cozida com canela se desejar variar a textura e sabor.',
        quantumFrequency: 'Frequência 528Hz - Cura celular e equilíbrio emocional (ouça por 15 minutos ao acordar)',
        biohacking: 'Tomar um copo de água com 1 colher de sopa de vinagre de maçã orgânico ao acordar.',
        microgreens: 'Adicione brotos de girassol ou trevo - fontes ricas em enzimas e clorofila.',
        calories: 320
      },
      {
        name: 'Smoothie verde com couve, pepino e maçã verde',
        ingredients: ['2 folhas de couve', '1/2 pepino', '1 maçã verde', 'folhas de hortelã', '200ml água de coco'],
        preparation: 'Bata todos os ingredientes no liquidificador até ficar homogêneo.',
        function: 'Alcalinizar o organismo, fornecer clorofila e antioxidantes para começar o dia detoxificando.',
        reason: 'Combinação alcalinizante que ativa enzimas digestivas e fornece energia sustentada.',
        positivePhrase: 'Meu corpo recebe cada nutriente com gratidão e vitalidade.',
        draTip: 'Adicione 1 colher de chá de spirulina para potencializar os benefícios detox.',
        quantumFrequency: 'Frequência 417Hz - Limpeza de energia negativa e renovação celular',
        biohacking: 'Tome sol por 10 minutos no início da manhã sem protetor solar.',
        microgreens: 'Use brotos de trevo ou alfafa no smoothie.',
        calories: 180
      }
    ];

    // Almoço
    const lunchOptions = [
      {
        name: 'Bowl de quinoa com legumes grelhados e grão-de-bico',
        ingredients: ['1 xícara de quinoa cozida', 'abobrinha grelhada', 'berinjela grelhada', 'cenoura grelhada', '1/2 xícara grão-de-bico'],
        preparation: 'Cozinhe a quinoa, grelhe os legumes com cúrcuma e azeite, misture com grão-de-bico e finalize com limão.',
        function: 'Oferecer proteínas vegetais, fibras e antioxidantes para melhorar funcionamento intestinal.',
        reason: 'Rico em fitoquímicos, magnésio e ferro - nutrientes essenciais para energia e foco.',
        positivePhrase: 'Quando cuido do meu corpo, cuido da minha vida.',
        draTip: 'Pode substituir a quinoa por amaranto ou arroz integral. Use sempre azeite extravirgem como finalização.',
        quantumFrequency: 'Frequência 963Hz - Conexão com o Eu Superior',
        biohacking: 'Ande 10 minutos após o almoço para otimizar a digestão e baixar a glicemia.',
        microgreens: 'Salpique brotos de rúcula ou beterraba sobre o bowl.',
        calories: 480
      }
    ];

    // Lanche da Tarde
    const snackOptions = [
      {
        name: 'Creme de abacate com cacau e colágeno vegano',
        ingredients: ['1/2 abacate maduro', '1 colher de sopa de cacau puro', '1 scoop de colágeno vegano', '1 colher de café de Stevia'],
        preparation: 'Bata tudo no mixer e leve à geladeira por 20 min.',
        function: 'Estabilizar a glicemia, modular o apetite e evitar picos de cortisol à tarde.',
        reason: 'Combate compulsão alimentar e ansiedade, promove saciedade com boas gorduras.',
        positivePhrase: 'Me alimento com consciência e respeito meu tempo de cura.',
        draTip: 'Prepare com antecedência. Pode substituir por mousse de maracujá com leite de coco.',
        quantumFrequency: 'Frequência 396Hz - Liberação de Medos e Traumas',
        biohacking: 'Caminhada descalça no chão (earthing) por 10 minutos.',
        microgreens: 'Incorpore brotos de alfafa para dar textura e aumentar enzimas.',
        calories: 250
      }
    ];

    // Jantar
    const dinnerOptions = [
      {
        name: 'Sopa cremosa de cenoura com cúrcuma e leite de coco',
        ingredients: ['3 cenouras grandes', '1 cebola', '1 colher de chá de cúrcuma', '1/2 xícara leite de coco', 'salsinha'],
        preparation: 'Cozinhe cenoura, cebola e cúrcuma em caldo de legumes. Bata tudo com leite de coco.',
        function: 'Desintoxicar o organismo, promover saciedade leve para o período noturno.',
        reason: 'Combinação leve e rica em minerais, ideal para não sobrecarregar o fígado à noite.',
        positivePhrase: 'Sou grata por cuidar de mim com carinho e constância.',
        draTip: 'Evite alimentos crus à noite para facilitar a digestão.',
        quantumFrequency: 'Frequência 741Hz - Purificação do corpo e da mente',
        biohacking: 'Tomar chá de camomila com gotinhas de própolis 30 minutos antes de dormir.',
        microgreens: 'Finalize com brotos de agrião ou mostarda - digestivos e ricos em vitamina K.',
        calories: 320
      }
    ];

    // Ceia
    const supperOptions = [
      {
        name: 'Leite dourado com cúrcuma e canela',
        ingredients: ['1 xícara de leite vegetal', '1/2 colher de cúrcuma', 'pitada de pimenta preta', '1 colher de chá de canela'],
        preparation: 'Aqueça o leite vegetal, adicione os temperos e consuma morno.',
        function: 'Relaxar o sistema nervoso, induzir ao sono e regenerar tecidos durante o descanso.',
        reason: 'Rico em triptofano, magnésio e antioxidantes - combinação perfeita para uma noite restauradora.',
        positivePhrase: 'O descanso também faz parte da minha cura.',
        draTip: 'Evite telas pelo menos 1h antes de dormir. Respire profundamente por 5 minutos antes de deitar.',
        quantumFrequency: 'Frequência 432Hz - Paz Interior e Equilíbrio',
        biohacking: 'Banho morno com 2 gotas de óleo essencial de lavanda nos pulsos e pés.',
        microgreens: 'Não inserir nesta refeição.',
        calories: 120
      }
    ];

    const breakfast = hasFasting && (dayIndex % 2 === 0) ? 
      [{
        name: 'Jejum Intermitente',
        ingredients: ['Chá verde', 'Água'],
        preparation: 'Período de jejum conforme protocolo escolhido.',
        function: 'Ativar autofagia, melhorar sensibilidade insulínica e promover regeneração celular.',
        reason: 'O jejum intermitente otimiza o metabolismo e promove limpeza celular.',
        positivePhrase: 'Meu corpo se regenera e se fortalece durante o jejum.',
        draTip: 'Mantenha-se bem hidratado durante o período de jejum.',
        quantumFrequency: 'Frequência 528Hz - Regeneração celular',
        biohacking: 'Medite por 10 minutos para potencializar os benefícios do jejum.',
        microgreens: 'Não aplicável durante jejum.',
        calories: 0
      }] : [breakfastOptions[dayIndex % breakfastOptions.length]];

    return {
      breakfast: breakfast,
      lunch: [lunchOptions[0]],
      afternoonSnack: [snackOptions[0]], 
      dinner: [dinnerOptions[0]],
      supper: [supperOptions[0]]
    };
  };

  const generateLifestyleTip = (dayIndex: number): string => {
    const tips = [
      'Despertar Consciente: Acordar 20 minutos mais cedo para se alongar na luz do dia',
      'Hidratação Matinal: Beber 1 copo de água morna com limão ao acordar',
      'Gratidão Diária: Criar um diário da gratidão com 3 coisas boas por dia',
      'Sono Regulado: Estabelecer horário fixo para dormir (antes das 23h)',
      'Alimentação Consciente: Comer sem TV, em ambiente calmo',
      'Movimento Natural: Caminhar na natureza por 30 minutos',
      'Respiração Consciente: 5 minutos de respiração profunda antes das refeições'
    ];
    return tips[dayIndex];
  };

  const handleSendToDoctor = () => {
    onSendToDoctor(mealPlan);
    toast({
      title: "Plano enviado!",
      description: "Seu plano foi enviado para revisão da Dra. Dayana. Ela entrará em contato em breve.",
    });
  };

  const downloadPlan = () => {
    const planText = generateFullPlanText();
    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plano-alimentar-${userData.name?.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateFullPlanText = (): string => {
    return `
PLANO ALIMENTAR FUNCIONAL - 7 DIAS
Paciente: ${userData.name || 'Paciente'}
Idade: ${userData.age || 'Não informado'} anos | Início do tratamento: ${new Date().toLocaleDateString('pt-BR')}
Elaborado por: Dra. Dayana Brazão Hanemann

INTRODUÇÃO
Olá, ${userData.name || 'querido(a) paciente'}! Seja muito bem-vindo(a) a esta jornada de transformação.
Este plano foi elaborado com todo cuidado, alinhado com os princípios da nutrição ortomolecular,
da alimentação funcional e do estilo de vida consciente.

OBJETIVO PRINCIPAL: ${userData.mainObjective || 'Bem-estar geral'}

${mealPlan.map((day, index) => `
═══════════════════════════════════════════════════════════════
                           DIA ${day.day} - ${day.dayName.toUpperCase()}
═══════════════════════════════════════════════════════════════

🌅 CAFÉ DA MANHÃ
${day.meals.breakfast.map(meal => `
   ${meal.name}
   
   Ingredientes: ${meal.ingredients.join(', ')}
   Preparo: ${meal.preparation}
   
   ✨ Função: ${meal.function}
   💭 Frase Positiva: "${meal.positivePhrase}"
   👩‍⚕️ Dica da Dra. Dayana: ${meal.draTip}
   🎵 Frequência Quântica: ${meal.quantumFrequency}
   🧬 Biohacking: ${meal.biohacking}
   🌱 Microverdes: ${meal.microgreens}
   📊 Calorias: ${meal.calories}
`).join('\n')}

🍽️ ALMOÇO
${day.meals.lunch.map(meal => `
   ${meal.name}
   
   Ingredientes: ${meal.ingredients.join(', ')}
   Preparo: ${meal.preparation}
   
   ✨ Função: ${meal.function}
   💭 Frase Positiva: "${meal.positivePhrase}"
   👩‍⚕️ Dica da Dra. Dayane: ${meal.draTip}
   🎵 Frequência Quântica: ${meal.quantumFrequency}
   🧬 Biohacking: ${meal.biohacking}
   🌱 Microverdes: ${meal.microgreens}
   📊 Calorias: ${meal.calories}
`).join('\n')}

🥗 LANCHE DA TARDE
${day.meals.afternoonSnack.map(meal => `
   ${meal.name}
   
   Ingredientes: ${meal.ingredients.join(', ')}
   Preparo: ${meal.preparation}
   
   ✨ Função: ${meal.function}
   💭 Frase Positiva: "${meal.positivePhrase}"
   👩‍⚕️ Dica da Dra. Dayane: ${meal.draTip}
   🎵 Frequência Quântica: ${meal.quantumFrequency}
   🧬 Biohacking: ${meal.biohacking}
   🌱 Microverdes: ${meal.microgreens}
   📊 Calorias: ${meal.calories}
`).join('\n')}

🌙 JANTAR
${day.meals.dinner.map(meal => `
   ${meal.name}
   
   Ingredientes: ${meal.ingredients.join(', ')}
   Preparo: ${meal.preparation}
   
   ✨ Função: ${meal.function}
   💭 Frase Positiva: "${meal.positivePhrase}"
   👩‍⚕️ Dica da Dra. Dayane: ${meal.draTip}
   🎵 Frequência Quântica: ${meal.quantumFrequency}
   🧬 Biohacking: ${meal.biohacking}
   🌱 Microverdes: ${meal.microgreens}
   📊 Calorias: ${meal.calories}
`).join('\n')}

🛏️ CEIA
${day.meals.supper.map(meal => `
   ${meal.name}
   
   Ingredientes: ${meal.ingredients.join(', ')}
   Preparo: ${meal.preparation}
   
   ✨ Função: ${meal.function}
   💭 Frase Positiva: "${meal.positivePhrase}"
   👩‍⚕️ Dica da Dra. Dayane: ${meal.draTip}
   🎵 Frequência Quântica: ${meal.quantumFrequency}
   🧬 Biohacking: ${meal.biohacking}
   🌱 Microverdes: ${meal.microgreens}
   📊 Calorias: ${meal.calories}
`).join('\n')}

💧 HIDRATAÇÃO: ${day.hydration}
🌿 ESTILO DE VIDA: ${day.lifestyle}
${day.supplements.length > 0 ? `💊 SUPLEMENTOS: ${day.supplements.join(', ')}` : ''}

`).join('\n')}

⚠️ IMPORTANTE: Este plano é educativo e preliminar. 
Deve ser revisado e aprovado pela Dra. Dayana antes da implementação.

"Seu corpo é seu templo. Alimente-se com fé, mova-se com intenção e descanse com gratidão."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👩‍⚕️ Dra. Dayana Hanemann
Referência internacional em Ozonioterapia e terapias integrativas
Instagram: @dra.dayanahanemann
WhatsApp: +55 21 99693-6317
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center">
        <Card className="w-full max-w-md text-center border-primary/20">
          <CardContent className="p-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mx-auto mb-6"
            >
              <ChefHat className="h-16 w-16 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-primary mb-4">Gerando seu plano alimentar funcional...</h2>
            <p className="text-muted-foreground mb-4">
              Nossa IA está criando um plano personalizado seguindo os princípios da Dra. Dayana, 
              com frequências quânticas, biohacking e microverdes.
            </p>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 3 }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="border-primary/20">
          <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-accent/10">
            <CardTitle className="text-3xl text-primary flex items-center justify-center gap-2">
              <Leaf className="h-8 w-8" />
              Plano Alimentar Funcional - 7 Dias
            </CardTitle>
            <CardDescription className="text-lg">
              Baseado nos princípios da Dra. Dayana Brazão Hanemann
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <Heart className="h-6 w-6 text-primary mx-auto mb-2" />
                <p className="font-semibold">Paciente: {userData.name}</p>
                <p className="text-sm text-muted-foreground">Idade: {userData.age} anos</p>
              </div>
              <div className="text-center p-4 bg-accent/5 rounded-lg">
                <Star className="h-6 w-6 text-accent mx-auto mb-2" />
                <p className="font-semibold">Objetivo Principal</p>
                <p className="text-sm text-muted-foreground">{userData.mainObjective}</p>
              </div>
              <div className="text-center p-4 bg-success/5 rounded-lg">
                <Utensils className="h-6 w-6 text-success mx-auto mb-2" />
                <p className="font-semibold">Plano Personalizado</p>
                <p className="text-sm text-muted-foreground">7 dias completos</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={handleSendToDoctor} className="bg-gradient-to-r from-primary to-accent">
                <Send className="h-4 w-4 mr-2" />
                Enviar para Dra. Dayana
              </Button>
              <Button variant="outline" onClick={downloadPlan}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Plano Completo
              </Button>
              <Button variant="outline" onClick={() => onViewContent('ebook', 'nutrition')}>
                <BookOpen className="h-4 w-4 mr-2" />
                Ver E-books
              </Button>
              <Button variant="outline" onClick={() => onViewContent('video', 'nutrition')}>
                <Video className="h-4 w-4 mr-2" />
                Ver Vídeos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Plan */}
        <Tabs value={activeDay.toString()} onValueChange={(value) => setActiveDay(parseInt(value))}>
          <TabsList className="grid w-full grid-cols-7">
            {mealPlan.map((day) => (
              <TabsTrigger key={day.day} value={(day.day - 1).toString()} className="text-xs">
                {day.dayName.slice(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>

          {mealPlan.map((day, index) => (
            <TabsContent key={day.day} value={index.toString()}>
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary flex items-center gap-2">
                    <Calendar className="h-6 w-6" />
                    {day.dayName} - Dia {day.day}
                  </CardTitle>
                  <CardDescription>
                    Estilo de Vida: {day.lifestyle} | Hidratação: {day.hydration}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6">
                    {/* Café da Manhã */}
                    <Card className="border-l-4 border-l-yellow-500">
                      <CardHeader>
                        <CardTitle className="text-lg text-yellow-600">🌅 Café da Manhã</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {day.meals.breakfast.map((meal, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="font-bold text-primary">{meal.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>Ingredientes:</strong> {meal.ingredients.join(', ')}</p>
                                <p><strong>Preparo:</strong> {meal.preparation}</p>
                                <p><strong>Calorias:</strong> {meal.calories}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="bg-primary/5 p-2 rounded">
                                  <p><strong>✨ Função:</strong> {meal.function}</p>
                                </div>
                                <div className="bg-accent/5 p-2 rounded">
                                  <p><strong>💭 Frase Positiva:</strong> "{meal.positivePhrase}"</p>
                                </div>
                                <div className="bg-secondary/5 p-2 rounded">
                                  <p><strong>👩‍⚕️ Dica da Dra.:</strong> {meal.draTip}</p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                <p><strong>🎵 Frequência:</strong> {meal.quantumFrequency}</p>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                <p><strong>🧬 Biohacking:</strong> {meal.biohacking}</p>
                              </div>
                              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                                <p><strong>🌱 Microverdes:</strong> {meal.microgreens}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Almoço */}
                    <Card className="border-l-4 border-l-green-500">
                      <CardHeader>
                        <CardTitle className="text-lg text-green-600">🍽️ Almoço</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {day.meals.lunch.map((meal, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="font-bold text-primary">{meal.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>Ingredientes:</strong> {meal.ingredients.join(', ')}</p>
                                <p><strong>Preparo:</strong> {meal.preparation}</p>
                                <p><strong>Calorias:</strong> {meal.calories}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="bg-primary/5 p-2 rounded">
                                  <p><strong>✨ Função:</strong> {meal.function}</p>
                                </div>
                                <div className="bg-accent/5 p-2 rounded">
                                  <p><strong>💭 Frase Positiva:</strong> "{meal.positivePhrase}"</p>
                                </div>
                                <div className="bg-secondary/5 p-2 rounded">
                                  <p><strong>👩‍⚕️ Dica da Dra.:</strong> {meal.draTip}</p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                <p><strong>🎵 Frequência:</strong> {meal.quantumFrequency}</p>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                <p><strong>🧬 Biohacking:</strong> {meal.biohacking}</p>
                              </div>
                              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                                <p><strong>🌱 Microverdes:</strong> {meal.microgreens}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Lanche da Tarde */}
                    <Card className="border-l-4 border-l-orange-500">
                      <CardHeader>
                        <CardTitle className="text-lg text-orange-600">🥗 Lanche da Tarde</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {day.meals.afternoonSnack.map((meal, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="font-bold text-primary">{meal.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>Ingredientes:</strong> {meal.ingredients.join(', ')}</p>
                                <p><strong>Preparo:</strong> {meal.preparation}</p>
                                <p><strong>Calorias:</strong> {meal.calories}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="bg-primary/5 p-2 rounded">
                                  <p><strong>✨ Função:</strong> {meal.function}</p>
                                </div>
                                <div className="bg-accent/5 p-2 rounded">
                                  <p><strong>💭 Frase Positiva:</strong> "{meal.positivePhrase}"</p>
                                </div>
                                <div className="bg-secondary/5 p-2 rounded">
                                  <p><strong>👩‍⚕️ Dica da Dra.:</strong> {meal.draTip}</p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                <p><strong>🎵 Frequência:</strong> {meal.quantumFrequency}</p>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                <p><strong>🧬 Biohacking:</strong> {meal.biohacking}</p>
                              </div>
                              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                                <p><strong>🌱 Microverdes:</strong> {meal.microgreens}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Jantar */}
                    <Card className="border-l-4 border-l-blue-500">
                      <CardHeader>
                        <CardTitle className="text-lg text-blue-600">🌙 Jantar</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {day.meals.dinner.map((meal, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="font-bold text-primary">{meal.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>Ingredientes:</strong> {meal.ingredients.join(', ')}</p>
                                <p><strong>Preparo:</strong> {meal.preparation}</p>
                                <p><strong>Calorias:</strong> {meal.calories}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="bg-primary/5 p-2 rounded">
                                  <p><strong>✨ Função:</strong> {meal.function}</p>
                                </div>
                                <div className="bg-accent/5 p-2 rounded">
                                  <p><strong>💭 Frase Positiva:</strong> "{meal.positivePhrase}"</p>
                                </div>
                                <div className="bg-secondary/5 p-2 rounded">
                                  <p><strong>👩‍⚕️ Dica da Dra.:</strong> {meal.draTip}</p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                <p><strong>🎵 Frequência:</strong> {meal.quantumFrequency}</p>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                <p><strong>🧬 Biohacking:</strong> {meal.biohacking}</p>
                              </div>
                              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                                <p><strong>🌱 Microverdes:</strong> {meal.microgreens}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Ceia */}
                    <Card className="border-l-4 border-l-purple-500">
                      <CardHeader>
                        <CardTitle className="text-lg text-purple-600">🛏️ Ceia</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {day.meals.supper.map((meal, idx) => (
                          <div key={idx} className="space-y-3">
                            <h4 className="font-bold text-primary">{meal.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p><strong>Ingredientes:</strong> {meal.ingredients.join(', ')}</p>
                                <p><strong>Preparo:</strong> {meal.preparation}</p>
                                <p><strong>Calorias:</strong> {meal.calories}</p>
                              </div>
                              <div className="space-y-2">
                                <div className="bg-primary/5 p-2 rounded">
                                  <p><strong>✨ Função:</strong> {meal.function}</p>
                                </div>
                                <div className="bg-accent/5 p-2 rounded">
                                  <p><strong>💭 Frase Positiva:</strong> "{meal.positivePhrase}"</p>
                                </div>
                                <div className="bg-secondary/5 p-2 rounded">
                                  <p><strong>👩‍⚕️ Dica da Dra.:</strong> {meal.draTip}</p>
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                <p><strong>🎵 Frequência:</strong> {meal.quantumFrequency}</p>
                              </div>
                              <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                                <p><strong>🧬 Biohacking:</strong> {meal.biohacking}</p>
                              </div>
                              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                                <p><strong>🌱 Microverdes:</strong> {meal.microgreens}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer Actions */}
        <Card className="border-primary/20">
          <CardContent className="p-6 text-center space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-amber-800 dark:text-amber-200 font-semibold">
                ⚠️ Este plano é educativo e preliminar
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                Deve ser revisado e aprovado pela Dra. Dayana antes da implementação.
                Ela fará os ajustes necessários baseados em sua avaliação médica.
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-lg font-semibold text-primary mb-2">
                "Seu corpo é seu templo. Alimente-se com fé, mova-se com intenção e descanse com gratidão."
              </p>
              <p className="text-sm text-muted-foreground">- Dra. Dayana Brazão Hanemann</p>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button onClick={onBack} variant="outline">
                Voltar
              </Button>
              <Button onClick={() => onViewContent('ebook', 'nutrition')} variant="outline">
                <BookOpen className="h-4 w-4 mr-2" />
                E-books Complementares
              </Button>
              <Button onClick={() => onViewContent('video', 'mev')} variant="outline">
                <Video className="h-4 w-4 mr-2" />
                Vídeos Educativos
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}