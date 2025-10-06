import React, { useState } from 'react';
import { Download, FileText, Loader2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface DietaryData {
  restrictions: string[];
  preferences: string[];
  goals: string[];
  lifestyle: string;
  currentDiet: string;
  supplements: string[];
  allergies: string[];
  intolerances: string[];
  cookingTime: string;
  budgetLevel: string;
  exerciseLevel: string;
  sleepQuality: string;
  stressLevel: string;
  digestiveIssues: string[];
}

interface MealPlanPDFGeneratorProps {
  dietaryData: DietaryData;
  patientName: string;
  onClose: () => void;
}

interface MealOption {
  name: string;
  ingredients: string[];
  preparation: string[];
  nutritionalFunction: string;
  drTip: string;
  energyLevel: 'alta' | 'média' | 'baixa';
}

interface DayPlan {
  day: number;
  theme: string;
  morningMessage: string;
  meals: {
    breakfast: MealOption[];
    lunch: MealOption[];
    snack: MealOption[];
    dinner: MealOption[];
    supper: MealOption[];
  };
  quantumFrequency: string;
  lifestyleTherapy: string;
  hydrationGoal: string;
}

export default function MealPlanPDFGenerator({ dietaryData, patientName, onClose }: MealPlanPDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<DayPlan[] | null>(null);
  const [currentStep, setCurrentStep] = useState<'generating' | 'preview' | 'download'>('generating');

  // Base meal templates based on MEV principles
  const generateMealPlan = async (): Promise<DayPlan[]> => {
    const baseBreakfasts: MealOption[] = [
      {
        name: "Vitamina Verde Alcalinizante",
        ingredients: ["1 folha de couve", "1/2 pepino", "1 limão", "1 colher de sopa de linhaça", "200ml água alcalina", "1 colher de chá de chlorella"],
        preparation: ["Higienizar todos os vegetais", "Bater no liquidificador com água alcalina", "Coar se preferir", "Servir imediatamente"],
        nutritionalFunction: "Rica em clorofila para oxigenação celular, fibras para saúde intestinal e minerais alcalinizantes",
        drTip: "Tome em jejum para máxima absorção dos nutrientes. A linhaça fornece ômega-3 anti-inflamatório",
        energyLevel: 'alta'
      },
      {
        name: "Pudim de Chia com Frutas Vermelhas",
        ingredients: ["3 colheres de sopa de chia", "200ml leite de coco", "1 colher de chá de xilitol", "1/2 xícara de frutas vermelhas", "1 colher de sopa de coco ralado"],
        preparation: ["Misturar chia com leite de coco", "Adoçar com xilitol", "Deixar na geladeira por 4 horas", "Servir com frutas vermelhas por cima"],
        nutritionalFunction: "Ômega-3, proteína vegetal, antioxidantes das frutas vermelhas e prebióticos para microbiota",
        drTip: "Prepare na noite anterior. As frutas vermelhas são ricas em antocianinas anti-inflamatórias",
        energyLevel: 'média'
      },
      {
        name: "Omelete de Legumes com Temperos Funcionais",
        ingredients: ["2 ovos orgânicos", "1/4 de abobrinha cortada", "2 colheres de sopa de tomate cereja", "1 colher de chá de cúrcuma", "Sal rosa q.b.", "1 fio de azeite extravirgem"],
        preparation: ["Refogar os legumes no azeite", "Bater os ovos com cúrcuma e sal rosa", "Juntar legumes aos ovos", "Fazer omelete em fogo baixo"],
        nutritionalFunction: "Proteína de alto valor biológico, carotenoides, curcumina anti-inflamatória",
        drTip: "Ovos são fonte completa de aminoácidos. A cúrcuma potencializa a absorção quando aquecida",
        energyLevel: 'alta'
      },
      {
        name: "Smoothie Bowl Energizante",
        ingredients: ["1/2 banana", "1/4 de abacate", "1 colher de sopa de cacau em pó", "200ml leite de amêndoas", "1 colher de sopa de granola sem glúten", "Sementes de girassol"],
        preparation: ["Bater banana, abacate e cacau com leite de amêndoas", "Servir em tigela", "Decorar com granola e sementes", "Consumir imediatamente"],
        nutritionalFunction: "Gorduras boas do abacate, magnésio do cacau, potássio da banana e vitamina E das sementes",
        drTip: "O abacate fornece gorduras essenciais para produção hormonal. Cacau puro é rico em flavonoides",
        energyLevel: 'alta'
      }
    ];

    const baseLunches: MealOption[] = [
      {
        name: "Salada Mediterrânea com Salmão",
        ingredients: ["150g salmão grelhado", "Mix de folhas verdes", "1/2 pepino", "Tomate cereja", "Azeitonas pretas", "Azeite extravirgem", "Limão", "Ervas finas"],
        preparation: ["Grelhar o salmão com temperos", "Montar salada com vegetais frescos", "Temperar com azeite, limão e ervas", "Servir salmão sobre a salada"],
        nutritionalFunction: "Ômega-3 EPA/DHA, antioxidantes dos vegetais, gorduras monoinsaturadas do azeite",
        drTip: "Salmão selvagem tem mais ômega-3. Consuma com vegetais para melhor absorção dos nutrientes",
        energyLevel: 'alta'
      },
      {
        name: "Bowl de Quinoa com Vegetais Assados",
        ingredients: ["1/2 xícara quinoa cozida", "Brócolis", "Cenoura", "Beterraba", "Grão-de-bico", "Tahine", "Azeite", "Temperos naturais"],
        preparation: ["Assar vegetais com azeite e temperos", "Cozinhar quinoa", "Montar bowl com quinoa de base", "Distribuir vegetais por cima", "Finalizar com tahine"],
        nutritionalFunction: "Proteína completa da quinoa, fibras, vitaminas A e C, minerais essenciais",
        drTip: "Quinoa é livre de glúten e fonte de todos aminoácidos essenciais. Tahine fornece cálcio",
        energyLevel: 'média'
      },
      {
        name: "Sopa Detox de Abóbora com Gengibre",
        ingredients: ["400g abóbora cabotiá", "1 peça de gengibre", "1 dente de alho", "Cebola", "Caldo de legumes", "Leite de coco", "Cúrcuma", "Sal rosa"],
        preparation: ["Refogar cebola e alho", "Adicionar abóbora e gengibre", "Cozinhar com caldo de legumes", "Bater no liquidificador", "Finalizar com leite de coco"],
        nutritionalFunction: "Betacaroteno, propriedades anti-inflamatórias do gengibre, prebióticos",
        drTip: "Abóbora é rica em vitamina A. Gengibre melhora digestão e tem ação termogênica",
        energyLevel: 'média'
      },
      {
        name: "Frango Orgânico com Vegetais no Vapor",
        ingredients: ["150g peito de frango orgânico", "Brócolis", "Couve-flor", "Vagem", "Batata-doce", "Alecrim", "Tomilho", "Azeite extravirgem"],
        preparation: ["Temperar frango com ervas", "Grelhar ou assar o frango", "Cozinhar vegetais no vapor", "Servir com fio de azeite"],
        nutritionalFunction: "Proteína magra, vitaminas do complexo B, fibras, carboidratos de baixo índice glicêmico",
        drTip: "Frango orgânico tem menor carga tóxica. Cozimento no vapor preserva nutrientes",
        energyLevel: 'alta'
      }
    ];

    const baseSnacks: MealOption[] = [
      {
        name: "Mix de Oleaginosas Ativadas",
        ingredients: ["Castanhas do Brasil", "Amêndoas", "Nozes", "Pistache", "Sal rosa", "Água para ativar"],
        preparation: ["Deixar oleaginosas de molho por 8h", "Escorrer e secar", "Temperar levemente com sal rosa", "Armazenar em pote hermético"],
        nutritionalFunction: "Selênio, vitamina E, magnésio, gorduras essenciais para função cerebral",
        drTip: "Ativação remove fitatos e melhora digestibilidade. Limite 1 punhado por dia",
        energyLevel: 'média'
      },
      {
        name: "Chips de Couve com Nutritional Yeast",
        ingredients: ["Folhas de couve", "Azeite extravirgem", "Nutritional yeast", "Sal rosa", "Páprica doce"],
        preparation: ["Retirar talos da couve", "Massagear com azeite", "Temperar com sal e especiarias", "Desidratar ou assar em baixa temperatura"],
        nutritionalFunction: "Vitaminas A, C, K, ferro, cálcio e vitaminas do complexo B do nutritional yeast",
        drTip: "Couve é uma das folhas mais nutritivas. Nutritional yeast é fonte de B12 para vegetarianos",
        energyLevel: 'baixa'
      },
      {
        name: "Smoothie de Abacate com Cacau",
        ingredients: ["1/2 abacate", "1 colher de sopa de cacau", "200ml leite vegetal", "1 colher de chá de pasta de amendoim", "Canela"],
        preparation: ["Bater todos ingredientes no liquidificador", "Ajustar consistência com leite vegetal", "Servir gelado"],
        nutritionalFunction: "Gorduras monoinsaturadas, magnésio, triptofano para produção de serotonina",
        drTip: "Abacate é saciante e nutritivo. Cacau melhora humor e concentração",
        energyLevel: 'média'
      },
      {
        name: "Iogurte de Coco com Sementes",
        ingredients: ["200ml iogurte de coco natural", "1 colher de sopa de sementes de chia", "1 colher de sopa de sementes de abóbora", "Frutas vermelhas"],
        preparation: ["Misturar iogurte com sementes", "Deixar descansar 10 minutos", "Servir com frutas vermelhas"],
        nutritionalFunction: "Probióticos, ômega-3, zinco, antioxidantes das frutas",
        drTip: "Iogurte de coco fornece probióticos naturais. Sementes são fontes de minerais essenciais",
        energyLevel: 'baixa'
      }
    ];

    // Generate 7-day plan with personalization based on dietary data
    const days: DayPlan[] = [];
    
    for (let i = 1; i <= 7; i++) {
      const themes = [
        "Detox e Alcalinização",
        "Energia e Vitalidade", 
        "Anti-inflamatório Natural",
        "Saúde Intestinal",
        "Neuroproteção",
        "Regeneração Celular",
        "Equilíbrio e Bem-estar"
      ];
      
      const quantumFrequencies = [
        "528 Hz - Frequência do Amor (cura e transformação)",
        "432 Hz - Frequência da Terra (harmonia)",
        "741 Hz - Limpeza e Desintoxicação",
        "396 Hz - Liberação de medos e culpas",
        "852 Hz - Despertar da intuição",
        "639 Hz - Relacionamentos harmoniosos",
        "174 Hz - Alívio da dor e estresse"
      ];

      const lifestyleTherapies = [
        "Respiração 4-7-8 ao despertar (3 ciclos)",
        "Banho de sol matinal (15-20 minutos)",
        "Caminhada consciente na natureza (20 min)",
        "Meditação mindfulness (10 minutos)",
        "Exercícios de alongamento suave",
        "Gratidão: anotar 3 coisas boas do dia",
        "Desconexão digital 1h antes de dormir"
      ];

      days.push({
        day: i,
        theme: themes[i-1],
        morningMessage: `Dia ${i} - ${themes[i-1]}: Hoje é um novo dia para nutrir seu corpo com amor e consciência. Cada escolha alimentar é um passo em direção à sua melhor versão!`,
        meals: {
          breakfast: baseBreakfasts.slice(0, 4),
          lunch: baseLunches.slice(0, 4),
          snack: baseSnacks.slice(0, 4),
          dinner: baseLunches.slice(0, 4), // Using lunch options for dinner with modifications
          supper: baseSnacks.slice(0, 2) // Light options for supper
        },
        quantumFrequency: quantumFrequencies[i-1],
        lifestyleTherapy: lifestyleTherapies[i-1],
        hydrationGoal: "2-2.5L água alcalina + chás funcionais"
      });
    }

    return days;
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setCurrentStep('generating');
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const plan = await generateMealPlan();
      setGeneratedPlan(plan);
      setCurrentStep('preview');
    } catch (error) {
      console.error('Error generating meal plan:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDFContent = () => {
    if (!generatedPlan) return '';

    let pdfContent = `
# PLANO ALIMENTAR PERSONALIZADO MEV
## Medicina do Estilo de Vida - 7 Dias

**Paciente:** ${patientName}
**Data de Geração:** ${new Date().toLocaleDateString('pt-BR')}
**Elaborado por:** Dra. Dayana Brazão Hanemann

---

## INTRODUÇÃO MOTIVADORA

Olá, ${patientName}! 

Este é o início da sua jornada de transformação através da alimentação consciente e da Medicina do Estilo de Vida (MEV). Cada receita foi cuidadosamente selecionada para nutrir não apenas seu corpo, mas também sua mente e espírito.

**Lembre-se sempre:**
- O mais importante é a QUALIDADE do alimento, não a quantidade
- Cada refeição é uma oportunidade de cura
- Seu corpo é um templo que merece o melhor cuidado

---

## REGRAS DE OURO DO SEU PLANO

✅ **SEM GLÚTEN** - Evite trigo, centeio, cevada e aveia comum
✅ **SEM LACTOSE** - Substitua por leites vegetais e derivados
✅ **SEM AÇÚCAR** - Use xilitol, stevia ou frutas para adoçar
✅ **HIDRATAÇÃO** - 2-2.5L de água alcalina diária
✅ **MASTIGAÇÃO** - Mastigue cada garfada 20-30 vezes
✅ **HORÁRIOS** - Mantenha regularidade nos horários das refeições

---

## BENEFÍCIOS DA ALIMENTAÇÃO FUNCIONAL

• **Anti-inflamatória:** Reduz inflamações sistêmicas
• **Detoxificante:** Apoia a eliminação de toxinas
• **Energizante:** Fornece energia estável e duradoura
• **Regenerativa:** Promove reparação celular
• **Alcalinizante:** Equilibra o pH do organismo

---

## GUIA DE MICROVERDES E BROTINHOS

**Como cultivar em casa:**
1. Escolha sementes orgânicas (alfafa, brócolis, rabanete)
2. Deixe de molho por 8-12 horas
3. Escorra e deixe em vidro escuro por 2-3 dias
4. Lave 2x ao dia até brotar
5. Consuma frescos nas saladas

**Benefícios:** Concentração 40x maior de nutrientes que vegetais maduros

---

`;

    generatedPlan.forEach((day) => {
      pdfContent += `
## DIA ${day.day} - ${day.theme.toUpperCase()}

**Mensagem do Dia:** ${day.morningMessage}

### CAFÉ DA MANHÃ - Escolha 1 opção:

${day.meals.breakfast.map((meal, idx) => `
**Opção ${idx + 1}: ${meal.name}**

*Ingredientes:*
${meal.ingredients.map(ing => `• ${ing}`).join('\n')}

*Modo de Preparo:*
${meal.preparation.map((step, i) => `${i + 1}. ${step}`).join('\n')}

*Função Nutricional:* ${meal.nutritionalFunction}

*Dica da Dra. Dayana:* ${meal.drTip}

---
`).join('')}

### ALMOÇO - Escolha 1 opção:

${day.meals.lunch.map((meal, idx) => `
**Opção ${idx + 1}: ${meal.name}**

*Ingredientes:*
${meal.ingredients.map(ing => `• ${ing}`).join('\n')}

*Modo de Preparo:*
${meal.preparation.map((step, i) => `${i + 1}. ${step}`).join('\n')}

*Função Nutricional:* ${meal.nutritionalFunction}

*Dica da Dra. Dayana:* ${meal.drTip}

---
`).join('')}

### LANCHE DA TARDE - Escolha 1 opção:

${day.meals.snack.map((meal, idx) => `
**Opção ${idx + 1}: ${meal.name}**

*Ingredientes:*
${meal.ingredients.map(ing => `• ${ing}`).join('\n')}

*Modo de Preparo:*
${meal.preparation.map((step, i) => `${i + 1}. ${step}`).join('\n')}

*Função Nutricional:* ${meal.nutritionalFunction}

*Dica da Dra. Dayana:* ${meal.drTip}

---
`).join('')}

**🎵 Frequência Quântica do Dia:** ${day.quantumFrequency}
**🧘 Terapia de Estilo de Vida:** ${day.lifestyleTherapy}
**💧 Meta de Hidratação:** ${day.hydrationGoal}

**Frase Positiva do Dia:** "Cada célula do meu corpo vibra em saúde e vitalidade!"

---
`;
    });

    pdfContent += `
## LISTA DE COMPRAS SEMANAL

### HORTIFRÚTI
• Couve, espinafre, rúcula (folhas verdes)
• Brócolis, couve-flor, abobrinha
• Tomate cereja, pepino, beterraba
• Banana, frutas vermelhas, limão
• Abacate, abóbora cabotiá
• Gengibre, alho, cebola

### PROTEÍNAS
• Salmão selvagem (150g x 3)
• Frango orgânico (300g)
• Ovos orgânicos (1 dúzia)
• Grão-de-bico

### GRÃOS E SEMENTES
• Quinoa orgânica
• Chia, linhaça
• Castanhas, amêndoas, nozes
• Sementes de girassol e abóbora

### ESPECIARIAS E TEMPEROS
• Cúrcuma, canela, páprica
• Sal rosa do Himalaia
• Azeite extravirgem
• Vinagre de maçã

### LEITES VEGETAIS
• Leite de coco, amêndoas
• Iogurte de coco natural

---

## ORIENTAÇÕES PARA OS PRÓXIMOS 21 DIAS

Após completar estes 7 dias iniciais:

1. **Repita as receitas que mais gostou**
2. **Consulte o e-book de receitas para variações**
3. **Mantenha as regras de ouro sempre**
4. **Experimente novos temperos e ervas**
5. **Continue praticando as terapias de estilo de vida**
6. **Ouça as frequências quânticas diariamente**

**Lembre-se:** O objetivo é criar um estilo de vida sustentável, não uma dieta restritiva temporária.

---

## ESTRATÉGIAS PARA ADESÃO (PNL)

• **Visualização:** Imagine-se saudável e vibrante antes de cada refeição
• **Ancoragem:** Associe cada refeição saudável a uma sensação de gratidão
• **Afirmações:** "Eu escolho nutrir meu corpo com amor e consciência"
• **Substituição:** Em vez de "não posso comer isso", pense "eu escolho algo melhor"

---

## MENSAGEM FINAL DE EMPODERAMENTO

Querido(a) ${patientName},

Você acabou de dar o primeiro passo em direção a uma transformação profunda e duradoura. Este plano não é apenas sobre alimentação - é sobre reconectar-se com sua essência, honrar seu corpo e despertar sua força interior.

Cada refeição é uma declaração de amor próprio. Cada escolha consciente é um passo em direção à sua melhor versão.

Lembre-se: você TEM o poder de transformar sua saúde. Confie no processo, seja gentil consigo mesmo e celebre cada pequena vitória.

Sua jornada de regeneração começa AGORA! 🌟

---

**Com amor e cuidado,**
**Dra. Dayana Brazão Hanemann**
*Medicina Integrativa • Nutrição Ortomolecular • MEV*

---

*Este material é educativo e não substitui consulta médica. Para dúvidas específicas, consulte sempre um profissional de saúde qualificado.*
`;

    return pdfContent;
  };

  const downloadPDF = () => {
    const content = generatePDFContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `plano-alimentar-mev-${patientName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setCurrentStep('download');
  };

  React.useEffect(() => {
    handleGeneratePlan();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Gerador de Plano Alimentar MEV
          </h1>
          <p className="text-muted-foreground">
            Plano personalizado de 7 dias para {patientName}
          </p>
        </div>

        {/* Generation Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              currentStep === 'generating' ? 'bg-primary text-primary-foreground' : 
              currentStep === 'preview' || currentStep === 'download' ? 'bg-success text-success-foreground' : 'bg-muted'
            }`}>
              {currentStep === 'generating' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span className="text-sm font-medium">Gerando</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep !== 'generating' ? 'bg-success' : 'bg-muted'}`} />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              currentStep === 'preview' ? 'bg-primary text-primary-foreground' : 
              currentStep === 'download' ? 'bg-success text-success-foreground' : 'bg-muted'
            }`}>
              {currentStep === 'download' ? <Check className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              <span className="text-sm font-medium">Visualizar</span>
            </div>
            <div className={`w-8 h-0.5 ${currentStep === 'download' ? 'bg-success' : 'bg-muted'}`} />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              currentStep === 'download' ? 'bg-success text-success-foreground' : 'bg-muted'
            }`}>
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border border-border rounded-2xl p-8">
          {currentStep === 'generating' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Criando seu plano personalizado...</h3>
              <p className="text-muted-foreground">
                Analisando suas preferências alimentares e gerando receitas baseadas na Medicina do Estilo de Vida
              </p>
            </motion.div>
          )}

          {generatedPlan && currentStep === 'preview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-bold mb-6">Seu Plano Alimentar MEV - 7 Dias</h2>
              
              <div className="grid gap-6 mb-8">
                {generatedPlan.slice(0, 2).map((day) => (
                  <div key={day.day} className="border border-border rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-primary mb-2">
                      Dia {day.day} - {day.theme}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">{day.morningMessage}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Café da Manhã</h4>
                        <p className="text-sm text-muted-foreground">
                          {day.meals.breakfast[0]?.name} + 3 outras opções
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Almoço</h4>
                        <p className="text-sm text-muted-foreground">
                          {day.meals.lunch[0]?.name} + 3 outras opções
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs">
                        <strong>Frequência do Dia:</strong> {day.quantumFrequency}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  + 5 dias adicionais com receitas completas, listas de compras e orientações detalhadas
                </p>
                
                <button
                  onClick={downloadPDF}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Baixar Plano Completo (PDF)
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 'download' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Plano gerado com sucesso!</h3>
              <p className="text-muted-foreground mb-6">
                Seu plano alimentar personalizado foi baixado. Comece sua jornada de transformação hoje mesmo!
              </p>
              <button
                onClick={onClose}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl transition-colors"
              >
                Voltar ao Dashboard
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}