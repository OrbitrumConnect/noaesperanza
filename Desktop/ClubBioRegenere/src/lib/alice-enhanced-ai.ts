export interface UserProfile {
  id: string;
  name: string;
  age: number;
  city: string;
  profession: string;
  goals: string[];
  preferences: {
    diet: string;
    exercise: string;
    relaxation: string[];
  };
  health: {
    conditions: string[];
    medications: string[];
    allergies: string[];
  };
  habits: {
    sleep_time: string;
    wake_time: string;
    water_intake: number;
    exercise_frequency: string;
    stress_level: number;
  };
}

export interface ConversationMemory {
  userId: string;
  topics_discussed: string[];
  last_mood: string;
  current_phase: string;
  session_start: Date;
  interaction_count: number;
  preferences_learned: Record<string, any>;
  progress_tracking: Record<string, any>;
}

export interface AIResponse {
  message: string;
  emotion: 'neutral' | 'happy' | 'caring' | 'encouraging' | 'thinking';
  suggested_followups: string[];
  context_tags: string[];
  learning_notes?: string;
}

export class EnhancedAliceAI {
  private static conversationMemory: Map<string, ConversationMemory> = new Map();
  
  // Banco de respostas variadas por categoria
  private static responses = {
    greetings: [
      "Oi! Que bom te ver aqui! 😊 Como você está se sentindo hoje?",
      "Olá! Seja muito bem-vinda! 💚 Vamos cuidar da sua saúde juntas?",
      "Oi querida! 🌟 Pronta para mais um dia cuidando do seu bem-estar?",
      "Hello! Como foi seu dia até agora? Vamos conversar sobre seus hábitos?",
      "Oi! Que energia boa! ✨ Como posso te ajudar hoje?"
    ],
    
    sleep_questions: [
      "Me conta sobre seu sono! A que horas você costuma dormir?",
      "Vamos falar de descanso? Quantas horas você dorme por noite?",
      "O sono é fundamental! Como tem sido sua qualidade de sono?",
      "Que tal conversarmos sobre seus horários? Você tem uma rotina noturna?",
      "Dormir bem é saúde! Me conta como anda seu sono..."
    ],
    
    nutrition_responses: [
      "A alimentação é medicina! Me conta sobre suas refeições...",
      "Vamos nutrir seu corpo? Como tem sido sua alimentação?",
      "Cada refeição é um cuidado! Quais alimentos você mais gosta?",
      "Alimentar-se bem é um ato de amor próprio! Me fala dos seus hábitos...",
      "Nutrição é vida! Como você planeja suas refeições?"
    ],
    
    exercise_motivation: [
      "Movimento é vida! Que atividades físicas você curte?",
      "Seu corpo agradece cada movimento! Me conta sobre exercícios...",
      "Vamos ativar o corpo? Qual exercício te dá mais prazer?",
      "Cada passo conta! Como tem sido sua rotina de movimento?",
      "O corpo pede movimento! Vamos encontrar algo que você ame fazer?"
    ],
    
    emotional_support: [
      "Entendo como você se sente... Vamos cuidar disso juntas? 💚",
      "Seus sentimentos são válidos! Como posso te apoiar melhor?",
      "Estou aqui para te acolher... Me conta mais sobre isso",
      "Você não está sozinha nisso! Vamos encontrar estratégias juntas?",
      "É normal sentir isso... Que tal respirarmos juntas por um momento?"
    ],
    
    progress_celebration: [
      "Que orgulho! 🌟 Você está evoluindo muito!",
      "Celebrando cada conquista sua! Parabéns! 🎉",
      "Olha só esse progresso! Você é incrível!",
      "Cada passo importa e você está caminhando lindamente! 💚",
      "Estou muito feliz pelo seu crescimento! Continue assim!"
    ]
  };

  // Detecção de contexto e humor
  private static detectContext(input: string): {
    topics: string[];
    mood: string;
    urgency: 'low' | 'medium' | 'high';
  } {
    const lowerInput = input.toLowerCase();
    
    const topicKeywords = {
      sleep: ['sono', 'dormir', 'insônia', 'cansada', 'acordar', 'noite'],
      nutrition: ['comer', 'alimentação', 'comida', 'dieta', 'peso', 'fome'],
      exercise: ['exercício', 'atividade', 'caminhada', 'academia', 'movimento'],
      stress: ['estresse', 'ansiedade', 'preocupada', 'nervosa', 'tensão'],
      hydration: ['água', 'hidratação', 'sede', 'líquido'],
      emotions: ['triste', 'feliz', 'deprimida', 'animada', 'desanimada']
    };

    const moodKeywords = {
      positive: ['bem', 'ótima', 'feliz', 'animada', 'energia'],
      negative: ['mal', 'triste', 'cansada', 'desanimada', 'difícil'],
      neutral: ['normal', 'ok', 'assim', 'mais ou menos']
    };

    const urgencyKeywords = {
      high: ['urgente', 'emergência', 'dor forte', 'muito mal', 'socorro'],
      medium: ['preocupada', 'importante', 'preciso', 'ajuda'],
      low: ['curioso', 'gostaria', 'talvez', 'quando possível']
    };

    // Detectar tópicos
    const detectedTopics: string[] = [];
    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        detectedTopics.push(topic);
      }
    });

    // Detectar humor
    let mood = 'neutral';
    Object.entries(moodKeywords).forEach(([moodType, keywords]) => {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        mood = moodType;
      }
    });

    // Detectar urgência
    let urgency: 'low' | 'medium' | 'high' = 'low';
    Object.entries(urgencyKeywords).forEach(([urgencyLevel, keywords]) => {
      if (keywords.some(keyword => lowerInput.includes(keyword))) {
        urgency = urgencyLevel as 'low' | 'medium' | 'high';
      }
    });

    return { topics: detectedTopics, mood, urgency };
  }

  // Gerar resposta contextual
  static generateContextualResponse(
    input: string, 
    userId: string, 
    userProfile?: UserProfile
  ): AIResponse {
    const context = this.detectContext(input);
    const memory = this.conversationMemory.get(userId) || this.initializeMemory(userId);
    
    // Atualizar memória
    memory.topics_discussed = [...new Set([...memory.topics_discussed, ...context.topics])];
    memory.last_mood = context.mood;
    memory.interaction_count++;
    
    // Escolher categoria de resposta baseada no contexto
    let responseCategory = 'greetings';
    if (context.topics.includes('sleep')) responseCategory = 'sleep_questions';
    else if (context.topics.includes('nutrition')) responseCategory = 'nutrition_responses';
    else if (context.topics.includes('exercise')) responseCategory = 'exercise_motivation';
    else if (context.topics.includes('stress') || context.topics.includes('emotions')) responseCategory = 'emotional_support';
    else if (memory.interaction_count > 5) responseCategory = 'progress_celebration';

    // Selecionar resposta variada
    const responses = this.responses[responseCategory as keyof typeof this.responses];
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)];

    // Personalizar resposta baseada no perfil
    let personalizedMessage = selectedResponse;
    if (userProfile?.name) {
      personalizedMessage = this.personalizeMessage(selectedResponse, userProfile, memory);
    }

    // Gerar follow-ups baseados no contexto
    const followups = this.generateFollowups(context.topics, memory);

    // Determinar emoção da Alice
    const emotion = this.determineEmotion(context.mood, context.topics);

    this.conversationMemory.set(userId, memory);

    return {
      message: personalizedMessage,
      emotion,
      suggested_followups: followups,
      context_tags: context.topics,
      learning_notes: `Mood: ${context.mood}, Topics: ${context.topics.join(', ')}`
    };
  }

  private static initializeMemory(userId: string): ConversationMemory {
    return {
      userId,
      topics_discussed: [],
      last_mood: 'neutral',
      current_phase: 'introduction',
      session_start: new Date(),
      interaction_count: 0,
      preferences_learned: {},
      progress_tracking: {}
    };
  }

  private static personalizeMessage(
    message: string, 
    profile: UserProfile, 
    memory: ConversationMemory
  ): string {
    // Adicionar nome quando apropriado
    if (Math.random() > 0.7 && !message.includes(profile.name)) {
      message = message.replace(/!/, `, ${profile.name}!`);
    }

    // Referenciar conversas anteriores
    if (memory.topics_discussed.length > 0 && Math.random() > 0.6) {
      const lastTopic = memory.topics_discussed[memory.topics_discussed.length - 1];
      message += ` Lembro que você mencionou ${lastTopic} antes...`;
    }

    // Adaptar ao horário
    const hour = new Date().getHours();
    if (hour < 12) message = message.replace(/hoje/, 'nesta manhã');
    else if (hour > 18) message = message.replace(/hoje/, 'nesta noite');

    return message;
  }

  private static generateFollowups(topics: string[], memory: ConversationMemory): string[] {
    const followups: string[] = [];

    if (topics.includes('sleep')) {
      followups.push("Quantas horas você dormiu ontem?");
      followups.push("Você tem uma rotina antes de dormir?");
    }
    
    if (topics.includes('nutrition')) {
      followups.push("O que você comeu no café da manhã?");
      followups.push("Você bebe água suficiente?");
    }
    
    if (topics.includes('exercise')) {
      followups.push("Que exercício você mais gosta?");
      followups.push("Quantos dias da semana você se exercita?");
    }

    // Adicionar follow-ups baseados na memória
    if (memory.interaction_count > 3) {
      followups.push("Como você está se sentindo com nossos hábitos?");
      followups.push("Quer adicionar algo novo na sua rotina?");
    }

    return followups.slice(0, 3); // Máximo 3 sugestões
  }

  private static determineEmotion(
    mood: string, 
    topics: string[]
  ): 'neutral' | 'happy' | 'caring' | 'encouraging' | 'thinking' {
    if (topics.includes('stress') || topics.includes('emotions')) return 'caring';
    if (mood === 'positive') return 'happy';
    if (topics.includes('exercise') || topics.includes('nutrition')) return 'encouraging';
    if (topics.length > 2) return 'thinking';
    return 'neutral';
  }

  // Sistema de tópicos para conversas longas
  static getConversationFlow(currentPhase: string, userProfile?: UserProfile): {
    questions: string[];
    nextPhase: string;
    estimatedDuration: number;
  } {
    const flows = {
      introduction: {
        questions: [
          "Oi! Que bom te conhecer! Me conta seu nome?",
          "Quantos anos você tem?",
          "Em que cidade você mora?",
          "Qual é sua profissão ou atividade principal?"
        ],
        nextPhase: 'goals_assessment',
        estimatedDuration: 3
      },
      goals_assessment: {
        questions: [
          "Quais são seus principais objetivos de saúde?",
          "O que mais te incomoda na sua rotina atual?",
          "Você já tentou mudanças de hábitos antes?",
          "O que funcionou e o que não funcionou?"
        ],
        nextPhase: 'daily_routine',
        estimatedDuration: 4
      },
      daily_routine: {
        questions: [
          "Me conta sobre sua rotina de sono...",
          "Como é sua alimentação no dia a dia?",
          "Você pratica exercícios? Quais?",
          "Quanto tempo você passa sentada por dia?",
          "Como você lida com o estresse?"
        ],
        nextPhase: 'health_assessment',
        estimatedDuration: 6
      },
      health_assessment: {
        questions: [
          "Você tem alguma condição de saúde que devo saber?",
          "Toma algum medicamento regularmente?",
          "Tem alergias ou restrições alimentares?",
          "Já fez cirurgias recentemente?",
          "Como está seu humor ultimamente?"
        ],
        nextPhase: 'preferences_mapping',
        estimatedDuration: 5
      },
      preferences_mapping: {
        questions: [
          "Que tipos de comida você mais gosta?",
          "Prefere exercícios individuais ou em grupo?",
          "Você gosta de tecnologia ou prefere métodos tradicionais?",
          "Que horário do dia você tem mais energia?",
          "O que te relaxa quando está estressada?"
        ],
        nextPhase: 'plan_creation',
        estimatedDuration: 4
      },
      plan_creation: {
        questions: [
          "Vamos criar seu plano personalizado!",
          "Prefere começar com mudanças pequenas ou grandes?",
          "Que área você quer focar primeiro: sono, alimentação ou movimento?",
          "Quantos dias da semana você consegue se dedicar?",
          "Como você gostaria de acompanhar seu progresso?"
        ],
        nextPhase: 'followup_planning',
        estimatedDuration: 5
      },
      followup_planning: {
        questions: [
          "Seu plano está pronto! Como você se sente sobre ele?",
          "Prefere receber lembretes diários ou semanais?",
          "Quer incluir recursos extras como áudios ou exercícios de PNL?",
          "Quando você gostaria de nossa próxima conversa?",
          "Tem alguma dúvida ou algo que quer adicionar?"
        ],
        nextPhase: 'ongoing_support',
        estimatedDuration: 3
      }
    };

    return flows[currentPhase as keyof typeof flows] || flows.introduction;
  }

  // Gerar relatório completo
  static generateHealthReport(userId: string, userProfile: UserProfile): string {
    const memory = this.conversationMemory.get(userId);
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    return `
📋 RELATÓRIO DE SAÚDE E BEM-ESTAR
📅 Data: ${currentDate}

👤 PERFIL DO USUÁRIO
Nome: ${userProfile.name}
Idade: ${userProfile.age} anos
Cidade: ${userProfile.city}
Profissão: ${userProfile.profession}

🎯 OBJETIVOS PRINCIPAIS
${userProfile.goals.map(goal => `• ${goal}`).join('\n')}

💤 ROTINA DE SONO
Horário de dormir: ${userProfile.habits.sleep_time}
Horário de acordar: ${userProfile.habits.wake_time}

🥗 ALIMENTAÇÃO E HIDRATAÇÃO
Preferência alimentar: ${userProfile.preferences.diet}
Meta de água: ${userProfile.habits.water_intake}L/dia

🏃‍♀️ ATIVIDADE FÍSICA
Frequência: ${userProfile.habits.exercise_frequency}
Preferência: ${userProfile.preferences.exercise}

😌 GERENCIAMENTO DE ESTRESSE
Nível atual: ${userProfile.habits.stress_level}/10
Técnicas preferidas: ${userProfile.preferences.relaxation.join(', ')}

🩺 INFORMAÇÕES DE SAÚDE
Condições: ${userProfile.health.conditions.join(', ') || 'Nenhuma relatada'}
Medicamentos: ${userProfile.health.medications.join(', ') || 'Nenhum'}
Alergias: ${userProfile.health.allergies.join(', ') || 'Nenhuma'}

📊 PROGRESSO DA CONVERSA
Interações: ${memory?.interaction_count || 0}
Tópicos discutidos: ${memory?.topics_discussed.join(', ') || 'Nenhum'}
Último humor detectado: ${memory?.last_mood || 'Não avaliado'}

✅ PLANO PERSONALIZADO MEV
[Baseado nas informações coletadas]

⚠️ IMPORTANTE: Este relatório é educativo e não substitui consulta médica profissional.
`;
  }

  // Limpar memória de sessão
  static clearSession(userId: string): void {
    this.conversationMemory.delete(userId);
  }

  // Obter estatísticas da conversa
  static getConversationStats(userId: string): any {
    const memory = this.conversationMemory.get(userId);
    return {
      totalInteractions: memory?.interaction_count || 0,
      topicsDiscussed: memory?.topics_discussed || [],
      sessionDuration: memory ? Date.now() - memory.session_start.getTime() : 0,
      currentMood: memory?.last_mood || 'unknown'
    };
  }
}