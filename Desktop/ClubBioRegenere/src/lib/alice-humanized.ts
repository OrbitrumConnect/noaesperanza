import { EnhancedAliceAI, UserProfile, AIResponse } from './alice-enhanced-ai';

export interface HumanizedResponse {
  message: string;
  emotion: 'caring' | 'curious' | 'encouraging' | 'empathetic' | 'professional';
  followUpQuestions: string[];
  topics: string[];
  connectionPoints: string[]; // Para mesclar especialidades
  returnToPoint?: string; // Para voltar ao ponto original
}

export class HumanizedAliceAI extends EnhancedAliceAI {
  private static conversationFlow: Map<string, any> = new Map();
  
  // Respostas acolhedoras e humanizadas
  private static humanizedResponses = {
    welcomes: [
      "Olá! Que bom ter você aqui! 😊 Antes de começarmos, quero te ouvir: como você está hoje, física e emocionalmente?",
      "Oi! É um prazer te conhecer! 💚 Me conta, como você tem se sentido ultimamente? Estou aqui para te ouvir e apoiar.",
      "Seja muito bem-vinda! ✨ Quero começar te conhecendo melhor... Como está seu coração e seu corpo hoje?",
      "Que alegria te receber aqui! 🌟 Vamos começar com o mais importante: como você está se sentindo agora?"
    ],
    
    validations: [
      "Entendo... obrigada por compartilhar isso comigo. Isso já me ajuda muito a pensar em como posso te apoiar de forma personalizada.",
      "Que importante você me contar isso! 💚 Vou guardar essa informação para pensarmos juntas no melhor caminho.",
      "Fico feliz que você se sinta à vontade para dividir isso comigo. Estou aqui para te acolher e caminhar junto.",
      "Obrigada pela confiança! Essas informações são preciosas para criarmos algo realmente especial para você."
    ],
    
    transitions: [
      "Interessante o que você me contou... Você sabe que nossa alimentação, nossos nutrientes e nossos movimentos estão todos conectados? Quer que eu mostre como isso funciona no seu caso?",
      "Olha, isso que você falou me fez pensar... Posso conectar algumas áreas que talvez você não tenha pensado antes. Alimentação, vitaminas e movimento trabalham juntos. Te interessa explorar isso?",
      "Que bom que você trouxe isso! Sabia que posso olhar para sua saúde de forma integrativa? Nutrição, equilíbrio molecular e movimento físico... tudo faz parte do mesmo quebra-cabeça. Vamos montar juntas?",
      "Adorei sua sinceridade! Agora posso te ajudar de forma mais completa, olhando tanto para o que você come, quanto para o que seu corpo precisa de nutrientes, e como seu físico responde. Topas essa jornada comigo?"
    ],
    
    choices: [
      "Você gostaria que a gente começasse falando sobre sua alimentação, sua energia no dia a dia, ou sobre como seu corpo tem se sentido?",
      "Me diz: prefere que conversemos primeiro sobre seus hábitos alimentares, sobre seu equilíbrio de vitaminas, ou sobre seus movimentos e exercícios?",
      "Por onde você gostaria de começar nossa conversa? Alimentação, energia/vitaminas ou movimento do corpo?",
      "Qual dessas áreas chama mais sua atenção agora: nutrição, equilíbrio molecular ou fisioterapia funcional?"
    ]
  };

  // Sistema de conexões entre especialidades
  private static specialtyConnections = {
    nutrition_to_orthomolecular: [
      "Isso que você falou sobre alimentação me fez pensar... Às vezes pequenas carências de vitaminas específicas podem estar por trás dessas sensações. Já avaliou vitamina D, B12 ou magnésio?",
      "Interessante! Sabia que alguns sinais alimentares podem refletir necessidades específicas de micronutrientes? Vamos investigar isso?"
    ],
    
    nutrition_to_physiotherapy: [
      "Legal! E você sabe que a digestão melhora muito com movimentos específicos? Alguns alongamentos e exercícios respiratórios potencializam tudo que você come.",
      "Que bom! Alimentação e movimento são parceiros. Posso te mostrar como alguns exercícios ajudam na absorção dos nutrientes?"
    ],
    
    orthomolecular_to_nutrition: [
      "Falando em vitaminas... você sabia que a alimentação é a base para potencializar qualquer suplementação? Vamos ver como está sua base alimentar?",
      "Perfeito! E claro, nenhuma vitamina funciona bem sem uma alimentação equilibrada por trás. Me conta como anda sua rotina alimentar?"
    ],
    
    physiotherapy_to_nutrition: [
      "Adorei! E movimento sem combustível adequado não funciona bem... Como anda sua alimentação para sustentar essa energia que você precisa?",
      "Que ótimo! Sabia que alguns alimentos específicos ajudam na recuperação muscular e redução da inflamação? Vamos conectar isso?"
    ]
  };

  // Perguntas de aprofundamento por área
  private static deepeningQuestions = {
    nutrition: [
      "Como é sua rotina alimentar? Você costuma fazer refeições em horários regulares?",
      "Que tipo de alimentos te dão mais energia? E quais te deixam mais pesada?",
      "Você sente diferença no humor ou energia dependendo do que come?",
      "Há algum alimento que você sente que seu corpo 'pede' ou que você evita instintivamente?"
    ],
    
    orthomolecular: [
      "Já fez algum exame recente de vitaminas e minerais? Às vezes pequenas correções trazem muito bem-estar.",
      "Você toma sol regularmente? Como anda seu sono e sua energia no dia a dia?",
      "Sente diferença de energia entre as estações do ano? Isso pode nos dar pistas importantes.",
      "Tem algum sintoma recorrente que sempre volta? Cansaço, dores de cabeça, humor..."
    ],
    
    physiotherapy: [
      "Seu corpo tem 'reclamado' de alguma forma? Dores, limitações ou cansaço em alguma parte específica?",
      "Como você se sente ao acordar? Descansada ou com o corpo já pedindo cuidado?",
      "Você faz algum tipo de movimento ou exercício? Como seu corpo responde?",
      "Tem alguma atividade do dia a dia que te deixa mais tensa ou cansada?"
    ]
  };

  // Opções contextuais para problemas específicos de saúde
  static getHealthContextOptions(topic: string): string[] {
    const healthOptions = {
      'problemas-digestivos': [
        "Tenho diarreia frequente",
        "Sofro com constipação",
        "Sinto muitos gases e inchaço",
        "Tenho refluxo gastrico",
        "Digestão pesada após as refeições"
      ],
      'dores-corporais': [
        "Dores de cabeça constantes",
        "Dores nas costas",
        "Dores nas articulações",
        "Tensão muscular",
        "Dores abdominais"
      ],
      'energia-disposicao': [
        "Cansaço constante",
        "Falta de energia pela manhã",
        "Sonolência após o almoço",
        "Insônia ou sono fragmentado",
        "Fadiga mental"
      ],
      'humor-emocional': [
        "Ansiedade frequente",
        "Mudanças de humor",
        "Irritabilidade",
        "Tristeza ou melancolia",
        "Estresse excessivo"
      ],
      'peso-metabolismo': [
        "Dificuldade para emagrecer",
        "Ganho de peso súbito",
        "Retenção de líquidos",
        "Metabolismo lento",
        "Compulsão alimentar"
      ],
      'pele-cabelo': [
        "Pele ressecada ou oleosa",
        "Acne ou espinhas",
        "Queda de cabelo",
        "Unhas fracas",
        "Dermatites ou alergias"
      ]
    };

    return healthOptions[topic as keyof typeof healthOptions] || [];
  }

  // Gerar resposta humanizada e integrativa
  static generateHumanizedResponse(
    input: string,
    userId: string,
    conversationContext: any = {}
  ): HumanizedResponse {
    const lowerInput = input.toLowerCase();
    
    // Detectar área de interesse
    const areas = this.detectSpecialtyAreas(lowerInput);
    const emotion = this.detectUserEmotion(lowerInput);
    const currentTopic = conversationContext.lastTopic || 'general';
    
    // Atualizar fluxo da conversa
    const flow = this.conversationFlow.get(userId) || { topics: [], connections: [], returns: [] };
    flow.topics.push(...areas);
    this.conversationFlow.set(userId, flow);
    
    let message = "";
    let followUpQuestions: string[] = [];
    let connectionPoints: string[] = [];
    
    // Se é primeira interação
    if (!conversationContext.hasStarted) {
      message = this.getRandomResponse('welcomes');
      followUpQuestions = ["Me conte como você se sente", "Prefere falar sobre alimentação", "Quer começar pelo físico"];
    }
    // Se usuário compartilhou algo pessoal
    else if (this.isPersonalSharing(lowerInput)) {
      message = this.getRandomResponse('validations');
      message += " " + this.getRandomResponse('choices');
      followUpQuestions = this.getAreaBasedQuestions(areas);
    }
    // Se está falando de uma área específica
    else if (areas.length > 0) {
      message = this.createIntegrativeResponse(areas, input, currentTopic);
      connectionPoints = this.generateConnectionPoints(areas);
      followUpQuestions = this.getDeepQuestions(areas[0]);
    }
    // Resposta geral acolhedora
    else {
      message = "Entendi... me conte mais sobre isso. Estou aqui para te ouvir e encontrarmos juntas o melhor caminho para você se sentir bem.";
      followUpQuestions = ["Me fale mais detalhes", "Como isso afeta seu dia", "Você já tentou algo para isso"];
    }
    
    return {
      message,
      emotion: this.mapToEmotion(emotion),
      followUpQuestions,
      topics: areas,
      connectionPoints,
      returnToPoint: conversationContext.originalPoint
    };
  }

  private static detectSpecialtyAreas(input: string): string[] {
    const areas: string[] = [];
    
    // Nutrição
    if (/comer|comida|alimentação|refeição|dieta|fome|peso/.test(input)) {
      areas.push('nutrition');
    }
    
    // Ortomolecular
    if (/energia|cansaço|vitamina|mineral|sono|humor|disposição|força/.test(input)) {
      areas.push('orthomolecular');
    }
    
    // Fisioterapia
    if (/dor|movimento|exercício|corpo|músculo|articulação|postura|alongar/.test(input)) {
      areas.push('physiotherapy');
    }
    
    return areas;
  }

  private static isPersonalSharing(input: string): boolean {
    const personalKeywords = [
      'sinto', 'sinto-me', 'estou', 'me sinto', 'tenho', 'sofro', 'preciso',
      'não consigo', 'dificulta', 'me incomoda', 'preocupa', 'angustia'
    ];
    
    return personalKeywords.some(keyword => input.includes(keyword));
  }

  private static createIntegrativeResponse(areas: string[], input: string, currentTopic: string): string {
    let response = this.getRandomResponse('validations') + " ";
    
    // Se mencionar várias áreas, fazer conexão
    if (areas.length > 1) {
      response += this.getRandomResponse('transitions');
    }
    // Se for área específica, aprofundar
    else if (areas.length === 1) {
      const area = areas[0];
      const questions = this.deepeningQuestions[area as keyof typeof this.deepeningQuestions];
      response += questions[Math.floor(Math.random() * questions.length)];
    }
    
    return response;
  }

  private static generateConnectionPoints(areas: string[]): string[] {
    const connections: string[] = [];
    
    if (areas.includes('nutrition') && areas.includes('orthomolecular')) {
      connections.push(...this.specialtyConnections.nutrition_to_orthomolecular);
    }
    
    if (areas.includes('nutrition') && areas.includes('physiotherapy')) {
      connections.push(...this.specialtyConnections.nutrition_to_physiotherapy);
    }
    
    return connections;
  }

  private static getRandomResponse(category: keyof typeof this.humanizedResponses): string {
    const responses = this.humanizedResponses[category];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private static getAreaBasedQuestions(areas: string[]): string[] {
    if (areas.length === 0) return ["Como você se sente hoje?", "O que posso ajudar?"];
    
    const area = areas[0];
    return this.deepeningQuestions[area as keyof typeof this.deepeningQuestions] || [];
  }

  private static getDeepQuestions(area: string): string[] {
    return this.deepeningQuestions[area as keyof typeof this.deepeningQuestions] || [];
  }

  private static detectUserEmotion(input: string): string {
    if (/triste|deprimida|mal|péssim|ruim/.test(input)) return 'sad';
    if (/animada|bem|ótim|feliz|alegre/.test(input)) return 'happy';
    if (/cansada|exausta|sem energia/.test(input)) return 'tired';
    if (/preocupada|ansiosa|nervosa/.test(input)) return 'anxious';
    return 'neutral';
  }

  private static mapToEmotion(emotion: string): 'caring' | 'curious' | 'encouraging' | 'empathetic' | 'professional' {
    switch (emotion) {
      case 'sad': return 'empathetic';
      case 'anxious': return 'caring';
      case 'tired': return 'encouraging';
      case 'happy': return 'curious';
      default: return 'professional';
    }
  }

  // Método para retornar ao ponto original da conversa
  static returnToOriginalPoint(userId: string, originalTopic: string): HumanizedResponse {
    return {
      message: `Voltando ao que você estava me contando sobre ${originalTopic}... gostaria de aprofundar mais nisso? Estou aqui para te ouvir.`,
      emotion: 'caring',
      followUpQuestions: ["Sim, vamos continuar", "Prefiro mudar de assunto", "Quero falar de outra coisa"],
      topics: [originalTopic],
      connectionPoints: [],
      returnToPoint: originalTopic
    };
  }

  // Acolhimento final sempre perguntando se há mais
  static generateClosingCare(userId: string): HumanizedResponse {
    const closingMessages = [
      "Foi ótimo conversar com você hoje! Antes de encerrar, tem algo que eu não perguntei e que você gostaria de compartilhar comigo sobre sua saúde, sua rotina ou até sobre suas emoções?",
      "Adorei nossa conversa! 💚 Há algo mais que está no seu coração ou na sua mente que você gostaria de dividir comigo?",
      "Que bom que pudemos conversar assim! Existe alguma coisa que você sente que precisa falar e que ainda não surgiu na nossa conversa?",
      "Obrigada por confiar em mim hoje! Tem algum detalhe sobre você que ainda não conversamos e que você gostaria de compartilhar?"
    ];
    
    return {
      message: closingMessages[Math.floor(Math.random() * closingMessages.length)],
      emotion: 'caring',
      followUpQuestions: ["Sim, quero falar mais", "Não, por hoje está bom", "Tenho uma dúvida"],
      topics: ['closure'],
      connectionPoints: [],
    };
  }
}