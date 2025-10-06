// Sistema de Fluxo de Conversação Inteligente da Alice
// Evita repetições e guia progressivamente para coleta de dados

interface ConversationState {
  userId: string;
  currentTopic: string;
  topicsDiscussed: string[];
  dataCollected: { [key: string]: any };
  conversationStage: 'greeting' | 'data_collection' | 'analysis' | 'planning' | 'follow_up';
  lastResponse: string;
  responseCount: number;
  urgentDataNeeded: string[];
  nextSuggestedTopic: string;
}

interface DataCollectionTrigger {
  topic: string;
  keywords: string[];
  questions: string[];
  dataField: string;
  priority: 'high' | 'medium' | 'low';
  followUpTopics: string[];
}

export class AliceConversationFlow {
  private conversationStates: Map<string, ConversationState> = new Map();
  
  // Triggers para coleta de dados específicos
  private dataCollectionTriggers: DataCollectionTrigger[] = [
    {
      topic: 'alimentacao_atual',
      keywords: ['como', 'comer', 'alimento', 'refeição', 'dieta'],
      questions: [
        'Me conte como está sua alimentação atualmente?',
        'Quais são suas refeições favoritas?',
        'Tem algum alimento que você evita?'
      ],
      dataField: 'current_diet',
      priority: 'high',
      followUpTopics: ['horarios_refeicao', 'preferencias_alimentares']
    },
    {
      topic: 'sono_energia',
      keywords: ['sono', 'dormir', 'cansaço', 'energia', 'disposição'],
      questions: [
        'Como tem sido seu sono ultimamente?',
        'A que horas você costuma dormir e acordar?',
        'Como está sua energia durante o dia?'
      ],
      dataField: 'sleep_energy',
      priority: 'high',
      followUpTopics: ['estresse_nivel', 'atividade_fisica']
    },
    {
      topic: 'objetivos_saude',
      keywords: ['objetivo', 'meta', 'quero', 'preciso', 'melhorar'],
      questions: [
        'Qual é seu principal objetivo de saúde?',
        'O que você mais gostaria de melhorar?',
        'Como você se vê daqui a 90 dias?'
      ],
      dataField: 'health_goals',
      priority: 'high',
      followUpTopics: ['motivacao', 'desafios_atuais']
    },
    {
      topic: 'sintomas_atuais',
      keywords: ['dor', 'sintoma', 'problema', 'incomodo', 'sente'],
      questions: [
        'Tem algum sintoma que te incomoda?',
        'Como está se sentindo fisicamente?',
        'Há algo específico que gostaria de melhorar no seu corpo?'
      ],
      dataField: 'current_symptoms',
      priority: 'medium',
      followUpTopics: ['historico_saude', 'medicamentos']
    },
    {
      topic: 'rotina_diaria',
      keywords: ['rotina', 'dia', 'trabalho', 'atividade', 'horário'],
      questions: [
        'Me conte sobre sua rotina diária?',
        'Como são seus dias de trabalho?',
        'Que atividades você mais gosta de fazer?'
      ],
      dataField: 'daily_routine',
      priority: 'medium',
      followUpTopics: ['tempo_livre', 'exercicios']
    }
  ];

  // Obtém ou cria estado da conversa
  private getConversationState(userId: string): ConversationState {
    if (!this.conversationStates.has(userId)) {
      this.conversationStates.set(userId, {
        userId,
        currentTopic: 'greeting',
        topicsDiscussed: [],
        dataCollected: {},
        conversationStage: 'greeting',
        lastResponse: '',
        responseCount: 0,
        urgentDataNeeded: ['alimentacao_atual', 'sono_energia', 'objetivos_saude'],
        nextSuggestedTopic: 'alimentacao_atual'
      });
    }
    return this.conversationStates.get(userId)!;
  }

  // Analisa mensagem do usuário e detecta tópicos
  private analyzeMessage(message: string): { 
    detectedTopics: string[], 
    mood: 'positive' | 'neutral' | 'concerned' | 'excited' | 'tired',
    needsDataCollection: boolean 
  } {
    const messageText = message.toLowerCase();
    const detectedTopics: string[] = [];
    
    // Detectar tópicos baseado em palavras-chave
    this.dataCollectionTriggers.forEach(trigger => {
      if (trigger.keywords.some(keyword => messageText.includes(keyword))) {
        detectedTopics.push(trigger.topic);
      }
    });

    // Detectar humor
    let mood: 'positive' | 'neutral' | 'concerned' | 'excited' | 'tired' = 'neutral';
    if (messageText.includes('cansad') || messageText.includes('sono')) mood = 'tired';
    if (messageText.includes('ansios') || messageText.includes('stress')) mood = 'concerned';
    if (messageText.includes('bem') || messageText.includes('ótim')) mood = 'positive';
    if (messageText.includes('motiv') || messageText.includes('empolgad')) mood = 'excited';

    // Determinar se precisa de coleta de dados
    const needsDataCollection = detectedTopics.length === 0 && messageText.length < 30;

    return { detectedTopics, mood, needsDataCollection };
  }

  // Gera resposta inteligente e progressiva
  generateProgressiveResponse(
    message: string,
    userId: string,
    userName: string = ''
  ): {
    response: string;
    suggestions: string[];
    mood: string;
    biohacking_tip: string;
    frequency_suggestion: string;
    personalization_note: string;
    clickableOptions: { text: string; action: string; dataField?: string }[];
  } {
    const state = this.getConversationState(userId);
    const analysis = this.analyzeMessage(message);
    
    // Evitar repetição da mesma resposta
    state.responseCount++;
    
    let response = '';
    let suggestions: string[] = [];
    let clickableOptions: { text: string; action: string; dataField?: string }[] = [];

    // Lógica principal de resposta baseada no estágio
    if (state.conversationStage === 'greeting' && state.responseCount === 1) {
      response = `Olá, ${userName}! Que bom te encontrar aqui! 🌟 Estou super animada para nossa conversa de hoje. Percebi que você completou a pré-consulta, então já tenho algumas informações suas.`;
      
      // Sugestões clicáveis para guiar a conversa
      clickableOptions = [
        { text: "Vamos falar sobre minha alimentação atual", action: "discuss_topic", dataField: "alimentacao_atual" },
        { text: "Quero melhorar meu sono e energia", action: "discuss_topic", dataField: "sono_energia" },
        { text: "Qual meu principal objetivo?", action: "discuss_topic", dataField: "objetivos_saude" }
      ];
      
      state.conversationStage = 'data_collection';
      state.nextSuggestedTopic = 'alimentacao_atual';
      
    } else if (state.conversationStage === 'data_collection') {
      // Verificar se há tópicos detectados na mensagem
      if (analysis.detectedTopics.length > 0) {
        const primaryTopic = analysis.detectedTopics[0];
        const trigger = this.dataCollectionTriggers.find(t => t.topic === primaryTopic);
        
        if (trigger && !state.topicsDiscussed.includes(primaryTopic)) {
          response = this.generateTopicResponse(primaryTopic, message, analysis.mood);
          state.topicsDiscussed.push(primaryTopic);
          state.currentTopic = primaryTopic;
          
          // Coletas dados baseados na resposta
          state.dataCollected[trigger.dataField] = this.extractDataFromMessage(message, primaryTopic);
          
          // Sugerir próximos tópicos
          clickableOptions = trigger.followUpTopics.map(topic => ({
            text: this.getTopicPrompt(topic),
            action: "discuss_topic",
            dataField: topic
          }));
          
        } else {
          // Aprofundar no tópico atual
          response = this.generateFollowUpQuestion(primaryTopic, message, analysis.mood);
        }
      } else {
        // Guiar para próximo tópico necessário
        const nextTopic = this.getNextPriorityTopic(state);
        response = this.generateTopicTransition(nextTopic, analysis.mood);
        
        clickableOptions = [
          { text: `Vamos falar sobre ${this.getTopicDisplayName(nextTopic)}`, action: "discuss_topic", dataField: nextTopic },
          { text: "Quero contar sobre outro assunto", action: "open_topic" },
          { text: "Como está meu progresso?", action: "show_progress" }
        ];
      }
    }

    // Atualizar estado
    state.lastResponse = response;
    this.conversationStates.set(userId, state);

    // Gerar elementos complementares
    const biohacking_tip = this.generateContextualBiohacking(analysis.mood, state.currentTopic);
    const frequency_suggestion = this.generateFrequencySuggestion(analysis.mood);
    const personalization_note = this.generatePersonalizationNote(state);

    return {
      response,
      suggestions,
      mood: analysis.mood,
      biohacking_tip,
      frequency_suggestion,
      personalization_note,
      clickableOptions
    };
  }

  private generateTopicResponse(topic: string, message: string, mood: string): string {
    const responses = {
      alimentacao_atual: [
        "Adorei saber sobre sua alimentação! É incrível como pequenas mudanças podem transformar nossa energia.",
        "Que interessante sua rotina alimentar! Vejo algumas oportunidades incríveis para potencializar seus resultados.",
        "Sua alimentação já tem pontos positivos! Vamos juntas descobrir como deixá-la ainda mais nutritiva e prazerosa."
      ],
      sono_energia: [
        "O sono é fundamental para nossa recuperação! Percebo que você tem consciência sobre isso.",
        "Energia e sono andam juntos! Que bom que você trouxe esse tópico importante.",
        "Seu corpo está pedindo atenção no sono! Isso é muito comum e tem soluções simples e eficazes."
      ],
      objetivos_saude: [
        "Seus objetivos mostram que você está realmente comprometida com sua transformação!",
        "Que clareza incrível sobre o que você quer! Isso já é meio caminho andado para o sucesso.",
        "Seus objetivos são totalmente alcançáveis! Vamos criar um caminho claro para chegar lá."
      ]
    };

    const topicResponses = responses[topic as keyof typeof responses] || ["Muito interessante o que você compartilhou!"];
    return topicResponses[Math.floor(Math.random() * topicResponses.length)];
  }

  private generateTopicTransition(nextTopic: string, mood: string): string {
    const transitions = {
      alimentacao_atual: "Que tal conversarmos sobre como está sua alimentação no dia a dia? Tenho algumas dicas incríveis para compartilhar!",
      sono_energia: "Vamos falar sobre sono e energia? Esses são pilares fundamentais para sua saúde e bem-estar!",
      objetivos_saude: "Me conta qual seu principal objetivo de saúde? Quero entender melhor como posso te ajudar!",
      sintomas_atuais: "Como você está se sentindo fisicamente? Seu corpo tem alguma mensagem importante para nós?",
      rotina_diaria: "Me conte sobre sua rotina! Quero entender como podemos integrar hábitos saudáveis no seu dia a dia."
    };

    return transitions[nextTopic as keyof typeof transitions] || "Vamos explorar mais sobre sua jornada de saúde?";
  }

  private getNextPriorityTopic(state: ConversationState): string {
    // Encontrar próximo tópico de alta prioridade não discutido
    for (const topic of state.urgentDataNeeded) {
      if (!state.topicsDiscussed.includes(topic)) {
        return topic;
      }
    }
    
    // Se todos os urgentes foram discutidos, pegar próximo de prioridade média
    const allTopics = this.dataCollectionTriggers.map(t => t.topic);
    return allTopics.find(topic => !state.topicsDiscussed.includes(topic)) || 'objetivos_saude';
  }

  private generateContextualBiohacking(mood: string, currentTopic: string): string {
    const biohacks = {
      tired: "Experimente 5 respirações profundas seguidas de um copo de água gelada - desperta o sistema nervoso!",
      concerned: "Coloque as mãos no coração e respire profundamente por 30 segundos - acalma instantaneamente.",
      positive: "Aproveite essa energia! Faça 10 polichinelos ou dance uma música - potencializa o bem-estar!",
      excited: "Canalize essa energia! Escreva 3 gratidões do dia - amplifica sentimentos positivos.",
      neutral: "Hidratação consciente: beba água devagar, sentindo cada gole nutrir suas células."
    };

    return biohacks[mood as keyof typeof biohacks] || biohacks.neutral;
  }

  private generateFrequencySuggestion(mood: string): string {
    const frequencies = {
      tired: "Frequência 528Hz - Energia celular e vitalidade (15 min)",
      concerned: "Frequência 396Hz - Liberação de medos e ansiedade (20 min)",
      positive: "Frequência 963Hz - Conexão com bem-estar superior (10 min)",
      excited: "Frequência 528Hz - Amplifica alegria e vitalidade (15 min)",
      neutral: "Frequência 741Hz - Clareza mental e foco (15 min)"
    };

    return frequencies[mood as keyof typeof frequencies] || frequencies.neutral;
  }

  private generatePersonalizationNote(state: ConversationState): string {
    if (state.topicsDiscussed.length === 0) {
      return "Estou ansiosa para conhecer melhor você e personalizar nossas conversas!";
    }
    
    if (state.topicsDiscussed.length < 3) {
      return `Já conversamos sobre ${state.topicsDiscussed.length} tópicos importantes. Estou aprendendo sobre você!`;
    }
    
    return `Que conversa rica! Já coletamos informações valiosas sobre ${state.topicsDiscussed.join(', ')}. Isso me ajuda a personalizar ainda mais nossas interações.`;
  }

  private extractDataFromMessage(message: string, topic: string): any {
    // Lógica simples para extrair dados da mensagem baseado no tópico
    return {
      raw_response: message,
      timestamp: new Date().toISOString(),
      topic: topic,
      processed: true
    };
  }

  private generateFollowUpQuestion(topic: string, message: string, mood: string): string {
    const followUps = {
      alimentacao_atual: [
        "E sobre os horários das refeições? Você tem uma rotina estabelecida?",
        "Que ingredientes você mais gosta de usar no dia a dia?",
        "Tem algum alimento que te dá mais energia ou disposição?"
      ],
      sono_energia: [
        "E sobre a qualidade do seu sono? Você acorda descansada?",
        "Tem algum ritual antes de dormir que te ajuda a relaxar?",
        "Como está sua energia logo pela manhã?"
      ],
      objetivos_saude: [
        "O que te motiva mais a alcançar esse objetivo?",
        "Já tentou alguma estratégia antes para isso?",
        "Como você vai saber que alcançou seu objetivo?"
      ]
    };

    const topicFollowUps = followUps[topic as keyof typeof followUps] || ["Conte-me mais sobre isso!"];
    return topicFollowUps[Math.floor(Math.random() * topicFollowUps.length)];
  }

  private getTopicPrompt(topic: string): string {
    const prompts = {
      horarios_refeicao: "Vamos falar sobre horários das refeições?",
      preferencias_alimentares: "Quais são seus alimentos favoritos?",
      estresse_nivel: "Como está seu nível de estresse?",
      atividade_fisica: "E sobre exercícios físicos?",
      motivacao: "O que mais te motiva?",
      desafios_atuais: "Quais são seus maiores desafios?"
    };

    return prompts[topic as keyof typeof prompts] || "Vamos explorar mais?";
  }

  private getTopicDisplayName(topic: string): string {
    const names = {
      alimentacao_atual: "alimentação atual",
      sono_energia: "sono e energia",
      objetivos_saude: "objetivos de saúde",
      sintomas_atuais: "como você está se sentindo",
      rotina_diaria: "sua rotina diária"
    };

    return names[topic as keyof typeof names] || topic;
  }

  // Método para resetar conversa se necessário
  resetConversation(userId: string) {
    this.conversationStates.delete(userId);
  }

  // Método para obter progresso da coleta de dados
  getDataCollectionProgress(userId: string): { 
    completedTopics: string[]; 
    pendingTopics: string[]; 
    progressPercentage: number;
    collectedData: any;
  } {
    const state = this.getConversationState(userId);
    const totalTopics = this.dataCollectionTriggers.length;
    const completedTopics = state.topicsDiscussed;
    const pendingTopics = this.dataCollectionTriggers
      .map(t => t.topic)
      .filter(topic => !completedTopics.includes(topic));
    
    return {
      completedTopics,
      pendingTopics,
      progressPercentage: Math.round((completedTopics.length / totalTopics) * 100),
      collectedData: state.dataCollected
    };
  }
}