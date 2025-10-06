import React from 'react';
import { Button } from '@/components/ui/button';
import { HumanizedAliceAI } from '@/lib/alice-humanized';

interface ContextualOptionsProps {
  onOptionSelect: (option: string) => void;
  messageText: string;
}

export default function ContextualOptions({ onOptionSelect, messageText }: ContextualOptionsProps) {
  // Detectar o contexto da mensagem para mostrar opções relevantes
  const getContextualOptions = (text: string): string[] => {
    const lowerText = text.toLowerCase();
    
    // Objetivos e sonhos - fase final da Alice
    if (lowerText.includes('objetivo') || lowerText.includes('sonho') || lowerText.includes('alcançar') || lowerText.includes('conquistar')) {
      return [
        "Perder peso de forma saudável",
        "Ter mais energia no dia a dia",
        "Melhorar minha digestão",
        "Dormir melhor",
        "Reduzir o estresse",
        "Me sentir mais jovem"
      ];
    }
    
    // Estado emocional - gratidão, humor
    if (lowerText.includes('grato') || lowerText.includes('gratidão') || lowerText.includes('humor') || lowerText.includes('animado') || lowerText.includes('disposição')) {
      return [
        "Pela minha família",
        "Por ter saúde",
        "Por estar aqui hoje",
        "Pela oportunidade de melhorar",
        "Por ter você me ajudando"
      ];
    }
    
    // Energia e estresse - estilo de vida
    if (lowerText.includes('energia') || lowerText.includes('estresse') || lowerText.includes('cansaço') || lowerText.includes('disposição')) {
      return [
        "Energia baixa pela manhã",
        "Cansaço após as refeições",
        "Estresse no trabalho",
        "Durmo mal",
        "Falta motivação para exercícios"
      ];
    }
    
    // Alimentação e hábitos
    if (lowerText.includes('alimentação') || lowerText.includes('comer') || lowerText.includes('dieta') || lowerText.includes('refeição')) {
      return [
        "Como muitos doces",
        "Pulo refeições frequentemente",
        "Tenho compulsão alimentar",
        "Não sei o que é saudável",
        "Como muito fast food"
      ];
    }
    
    // Condições de saúde e sintomas
    if (lowerText.includes('condição') || lowerText.includes('saúde') || lowerText.includes('sintoma') || lowerText.includes('desconforto')) {
      return [
        "Problemas digestivos",
        "Dores de cabeça frequentes",
        "Ansiedade e nervosismo",
        "Dores musculares",
        "Pressão alta"
      ];
    }
    
    // Sono e qualidade de vida
    if (lowerText.includes('sono') || lowerText.includes('dormir') || lowerText.includes('acordar') || lowerText.includes('descansar')) {
      return [
        "Durmo menos de 6 horas",
        "Acordo várias vezes",
        "Tenho insônia",
        "Acordo cansado(a)",
        "Durmo bem, 7-8 horas"
      ];
    }
    
    // Atividade física
    if (lowerText.includes('exercício') || lowerText.includes('atividade') || lowerText.includes('movimentar') || lowerText.includes('academia')) {
      return [
        "Sou sedentário(a)",
        "Faço caminhadas",
        "Vou à academia",
        "Pratico esportes",
        "Quero começar a me exercitar"
      ];
    }
    
    // Idade
    if (lowerText.includes('idade')) {
      return ["18-25 anos", "26-35 anos", "36-45 anos", "46-55 anos", "56+ anos"];
    }
    
    // Nome e chamadas
    if (lowerText.includes('chamada') || lowerText.includes('nome') || lowerText.includes('chamar')) {
      return [
        "Pode usar meu primeiro nome",
        "Seja carinhosa comigo",
        "Prefiro tratamento formal",
        "Você decide como me chamar"
      ];
    }
    
    // Medicamentos e tratamentos  
    if (lowerText.includes('medicamento') || lowerText.includes('remédio') || lowerText.includes('tratamento')) {
      return [
        "Não tomo nada",
        "Só vitaminas",
        "Medicamentos para pressão",
        "Antidepressivos",
        "Varios medicamentos"
      ];
    }
    
    // Opções padrão mais contextuais
    return [
      "Sim, é isso mesmo",
      "Não, não tenho isso",
      "Às vezes",
      "Gostaria de saber mais",
      "Preciso melhorar isso"
    ];
  };

  const options = getContextualOptions(messageText);

  if (options.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 p-4 bg-primary/5 rounded-xl border border-primary/10 backdrop-blur-sm">
      <div className="w-full text-xs text-primary/80 mb-2 font-semibold flex items-center gap-1">
        💡 Respostas rápidas:
      </div>
      {options.map((option, index) => (
        <Button
          key={index}
          variant="outline"
          size="sm"
          onClick={() => onOptionSelect(option)}
          className="text-xs font-medium bg-background/80 border-primary/20 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-sm hover:shadow-md"
        >
          {option}
        </Button>
      ))}
    </div>
  );
}