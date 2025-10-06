// Alice Advanced Intelligence System
// Sistema avançado de inteligência contextual e aprendizado

interface UserProfile {
  id: string;
  name: string;
  age: number;
  weight: number;
  height: number;
  activityLevel: string;
  sleepPattern: string;
  stressLevel: number;
  foodPreferences: string[];
  allergies: string[];
  healthGoals: string[];
  currentPhase: 'pre-consultation' | 'chat' | 'post-consultation' | 'ongoing';
}

interface ConversationMemory {
  userId: string;
  timestamp: Date;
  message: string;
  response: string;
  mood: 'positive' | 'neutral' | 'concerned' | 'excited' | 'tired';
  topics: string[];
  suggestions_followed: boolean;
  satisfaction_score: number;
}

interface BehaviorPattern {
  userId: string;
  patterns: {
    preferred_meal_times: string[];
    favorite_ingredients: string[];
    avoided_foods: string[];
    response_style: 'detailed' | 'brief' | 'motivational';
    biohacking_preferences: string[];
    frequency_preferences: string[];
  };
  trends: {
    energy_levels: { time: string; level: number }[];
    sleep_quality: { date: string; quality: number }[];
    mood_tracking: { date: string; mood: string }[];
  };
}

interface ISafeData {
  iSAFE_score: number;
  zone: 'Z1' | 'Z2' | 'Z3' | 'Z4' | 'Z5';
  red_markers: string[];
  improvement_areas: string[];
  strong_areas: string[];
}

export class AliceAdvancedIntelligence {
  private conversations: Map<string, ConversationMemory[]> = new Map();
  private behaviorPatterns: Map<string, BehaviorPattern> = new Map();
  private userProfiles: Map<string, UserProfile> = new Map();
  private iSafeData: Map<string, ISafeData> = new Map();

  // 1. MEMÓRIA CONTEXTUAL AVANÇADA
  saveConversation(memory: ConversationMemory) {
    const userId = memory.userId;
    if (!this.conversations.has(userId)) {
      this.conversations.set(userId, []);
    }
    this.conversations.get(userId)!.push(memory);
    
    // Manter apenas últimas 50 conversas para performance
    const userConversations = this.conversations.get(userId)!;
    if (userConversations.length > 50) {
      userConversations.shift();
    }
    
    // Atualizar padrões comportamentais
    this.updateBehaviorPatterns(memory);
  }

  // 2. ANÁLISE DE PADRÕES COMPORTAMENTAIS
  updateBehaviorPatterns(memory: ConversationMemory) {
    const userId = memory.userId;
    let pattern = this.behaviorPatterns.get(userId);
    
    if (!pattern) {
      pattern = {
        userId,
        patterns: {
          preferred_meal_times: [],
          favorite_ingredients: [],
          avoided_foods: [],
          response_style: 'detailed',
          biohacking_preferences: [],
          frequency_preferences: []
        },
        trends: {
          energy_levels: [],
          sleep_quality: [],
          mood_tracking: []
        }
      };
    }

    // Análise de texto para extrair preferências
    const messageText = memory.message.toLowerCase();
    
    // Detectar ingredientes favoritos
    const ingredients = ['abacate', 'banana', 'quinoa', 'chia', 'aveia', 'castanha', 'cúrcuma'];
    ingredients.forEach(ingredient => {
      if (messageText.includes(ingredient) && messageText.includes('gosto')) {
        if (!pattern!.patterns.favorite_ingredients.includes(ingredient)) {
          pattern!.patterns.favorite_ingredients.push(ingredient);
        }
      }
    });

    // Detectar alimentos evitados
    if (messageText.includes('não gosto') || messageText.includes('evito')) {
      ingredients.forEach(ingredient => {
        if (messageText.includes(ingredient)) {
          if (!pattern!.patterns.avoided_foods.includes(ingredient)) {
            pattern!.patterns.avoided_foods.push(ingredient);
          }
        }
      });
    }

    // Tracking de humor
    pattern.trends.mood_tracking.push({
      date: new Date().toISOString().split('T')[0],
      mood: memory.mood
    });

    this.behaviorPatterns.set(userId, pattern);
  }

  // 3. GERAÇÃO DE RESPOSTA CONTEXTUAL INTELIGENTE
  generateIntelligentResponse(
    message: string, 
    userId: string, 
    userProfile: UserProfile
  ): {
    response: string;
    suggestions: string[];
    mood: string;
    biohacking_tip: string;
    frequency_suggestion: string;
    personalization_note: string;
  } {
    const conversations = this.conversations.get(userId) || [];
    const patterns = this.behaviorPatterns.get(userId);
    const iSafeData = this.iSafeData.get(userId);
    
    // Análise do contexto atual
    const context = this.analyzeContext(message, conversations, patterns);
    
    // Resposta base personalizada
    let response = this.generateContextualResponse(message, context, userProfile, iSafeData);
    
    // Sugestões inteligentes baseadas em padrões
    const suggestions = this.generateSmartSuggestions(context, patterns, userProfile);
    
    // Biohacking personalizado
    const biohacking_tip = this.generatePersonalizedBiohacking(context, patterns, userProfile);
    
    // Frequência quântica baseada no humor/situação
    const frequency_suggestion = this.suggestFrequency(context.detected_mood, context.time_of_day);
    
    // Nota de personalização (mostra que a IA "lembra" do usuário)
    const personalization_note = this.createPersonalizationNote(patterns, conversations);

    return {
      response,
      suggestions,
      mood: context.detected_mood,
      biohacking_tip,
      frequency_suggestion,
      personalization_note
    };
  }

  // 4. ANÁLISE CONTEXTUAL AVANÇADA
  private analyzeContext(
    message: string, 
    conversations: ConversationMemory[], 
    patterns?: BehaviorPattern
  ) {
    const messageText = message.toLowerCase();
    
    // Detectar humor/estado emocional
    let detected_mood = 'neutral';
    if (messageText.includes('cansad') || messageText.includes('sono')) detected_mood = 'tired';
    if (messageText.includes('ansios') || messageText.includes('stress')) detected_mood = 'concerned';
    if (messageText.includes('bem') || messageText.includes('ótim')) detected_mood = 'positive';
    if (messageText.includes('motiv') || messageText.includes('empolgad')) detected_mood = 'excited';

    // Detectar tópicos principais
    const topics = [];
    if (messageText.includes('comer') || messageText.includes('aliment')) topics.push('nutrition');
    if (messageText.includes('dormir') || messageText.includes('sono')) topics.push('sleep');
    if (messageText.includes('exerc') || messageText.includes('atividade')) topics.push('exercise');
    if (messageText.includes('estresse') || messageText.includes('ansied')) topics.push('stress');

    // Detectar hora do dia (simulado)
    const hour = new Date().getHours();
    let time_of_day = 'morning';
    if (hour >= 12 && hour < 18) time_of_day = 'afternoon';
    if (hour >= 18) time_of_day = 'evening';

    // Análise de frequência de conversa
    const recent_conversations = conversations.slice(-5);
    const conversation_frequency = recent_conversations.length;

    return {
      detected_mood,
      topics,
      time_of_day,
      conversation_frequency,
      recent_topics: recent_conversations.map(c => c.topics).flat(),
      user_engagement: conversation_frequency > 3 ? 'high' : 'moderate'
    };
  }

  // 5. GERAÇÃO DE RESPOSTA CONTEXTUAL
  private generateContextualResponse(
    message: string, 
    context: any, 
    userProfile: UserProfile,
    iSafeData?: ISafeData
  ): string {
    const { detected_mood, time_of_day, topics } = context;
    
    // Base da resposta personalizada
    let response = `Olá, ${userProfile.name}! `;
    
    // Resposta baseada no humor detectado
    switch (detected_mood) {
      case 'tired':
        response += "Percebo que você está sentindo um pouco de cansaço. Vamos trabalhar isso juntas de forma suave. ";
        break;
      case 'concerned':
        response += "Entendo sua preocupação, e quero que saiba que estou aqui para te apoiar. Vamos encontrar soluções que tragam mais leveza. ";
        break;
      case 'positive':
        response += "Que energia maravilhosa! Vamos aproveitar esse momento positivo para potencializar ainda mais seu bem-estar. ";
        break;
      case 'excited':
        response += "Adoro sua empolgação! Essa energia positiva é um excelente combustível para nossa jornada de saúde. ";
        break;
      default:
        response += "Como você está se sentindo hoje? ";
    }

    // Resposta baseada no horário
    if (time_of_day === 'morning') {
      response += "Para começar bem o dia, que tal uma prática matinal energizante? ";
    } else if (time_of_day === 'afternoon') {
      response += "Este é um ótimo momento para recarregar as energias. ";
    } else {
      response += "À noite, é importante focar em práticas que acalmem e preparem para um sono reparador. ";
    }

    // Inclusão de dados iSAFE se disponível
    if (iSafeData && iSafeData.red_markers.length > 0) {
      response += `Baseando-me no seu perfil de saúde funcional, vamos dar atenção especial a ${iSafeData.improvement_areas[0]} hoje. `;
    }

    return response;
  }

  // 6. SUGESTÕES INTELIGENTES
  private generateSmartSuggestions(
    context: any, 
    patterns?: BehaviorPattern, 
    userProfile?: UserProfile
  ): string[] {
    const suggestions = [];
    
    // Sugestões baseadas no humor
    if (context.detected_mood === 'tired') {
      suggestions.push("Quer uma receita energizante com seus ingredientes favoritos?");
      suggestions.push("Posso sugerir um biohacking rápido para aumentar sua disposição?");
    }
    
    if (context.detected_mood === 'concerned') {
      suggestions.push("Vamos conversar sobre práticas calmantes?");
      suggestions.push("Que tal explorar algumas frequências relaxantes?");
    }

    // Sugestões baseadas em padrões do usuário
    if (patterns?.patterns.favorite_ingredients.length > 0) {
      const favIngredient = patterns.patterns.favorite_ingredients[0];
      suggestions.push(`Tenho uma receita nova com ${favIngredient}, quer conhecer?`);
    }

    // Sugestões baseadas no horário
    if (context.time_of_day === 'morning') {
      suggestions.push("Quer saber sobre o biohacking matinal perfeito para você?");
    }

    return suggestions.slice(0, 3); // Máximo 3 sugestões
  }

  // 7. BIOHACKING PERSONALIZADO
  private generatePersonalizedBiohacking(
    context: any, 
    patterns?: BehaviorPattern, 
    userProfile?: UserProfile
  ): string {
    const { detected_mood, time_of_day } = context;
    
    if (detected_mood === 'tired' && time_of_day === 'morning') {
      return "Tente 5 respirações profundas seguidas de 30 segundos de alongamento. Isso ativa seu sistema nervoso de forma natural!";
    }
    
    if (detected_mood === 'concerned') {
      return "Coloque 2 gotas de óleo essencial de lavanda nos pulsos e respire profundamente 3 vezes. Isso acalma instantaneamente o sistema nervoso.";
    }
    
    if (time_of_day === 'evening') {
      return "Uma caminhada descalça por 10 minutos (earthing) pode reequilibrar sua energia para a noite.";
    }
    
    return "Hidratação consciente: beba um copo de água lentamente, sentindo cada gole nutrir suas células.";
  }

  // 8. SUGESTÃO DE FREQUÊNCIA INTELIGENTE
  private suggestFrequency(mood: string, timeOfDay: string): string {
    if (mood === 'tired') return "Frequência 528Hz - Energia celular e vitalidade (15 min)";
    if (mood === 'concerned') return "Frequência 396Hz - Liberação de medos e ansiedade (20 min)";
    if (mood === 'positive') return "Frequência 963Hz - Conexão com bem-estar superior (10 min)";
    if (timeOfDay === 'evening') return "Frequência 432Hz - Paz interior e relaxamento (25 min)";
    
    return "Frequência 741Hz - Clareza mental e foco (15 min)";
  }

  // 9. NOTA DE PERSONALIZAÇÃO
  private createPersonalizationNote(
    patterns?: BehaviorPattern, 
    conversations?: ConversationMemory[]
  ): string {
    if (!patterns || !conversations || conversations.length === 0) {
      return "Estou aprendendo sobre suas preferências para personalizar ainda mais nossas conversas.";
    }
    
    const recent = conversations.slice(-3);
    if (recent.some(c => c.suggestions_followed)) {
      return "Fico feliz em ver que você tem seguido nossas sugestões! Isso mostra seu comprometimento com a transformação.";
    }
    
    if (patterns.patterns.favorite_ingredients.length > 0) {
      return `Lembro que você gosta de ${patterns.patterns.favorite_ingredients[0]}, então sempre incluo isso em minhas sugestões para você.`;
    }
    
    return "Estou observando seus padrões para oferecer sugestões cada vez mais personalizadas.";
  }

  // 10. INTEGRAÇÃO COM DADOS ISAFE
  updateISafeData(userId: string, data: ISafeData) {
    this.iSafeData.set(userId, data);
  }

  // 11. ANÁLISE DE EVOLUÇÃO
  getEvolutionAnalysis(userId: string): {
    mood_trend: string;
    engagement_level: string;
    improvement_areas: string[];
    recommendations: string[];
  } {
    const conversations = this.conversations.get(userId) || [];
    const patterns = this.behaviorPatterns.get(userId);
    
    if (conversations.length < 3) {
      return {
        mood_trend: 'insufficient_data',
        engagement_level: 'new_user',
        improvement_areas: [],
        recommendations: ['Continue conversando para análises mais precisas']
      };
    }
    
    // Análise de tendência de humor
    const recentMoods = conversations.slice(-10).map(c => c.mood);
    const positiveMoods = recentMoods.filter(m => m === 'positive' || m === 'excited').length;
    const mood_trend = positiveMoods > recentMoods.length / 2 ? 'improving' : 'stable';
    
    // Nível de engajamento
    const engagement_level = conversations.length > 20 ? 'high' : conversations.length > 10 ? 'moderate' : 'low';
    
    return {
      mood_trend,
      engagement_level,
      improvement_areas: patterns?.patterns.avoided_foods || [],
      recommendations: this.generateEvolutionRecommendations(mood_trend, engagement_level)
    };
  }

  private generateEvolutionRecommendations(moodTrend: string, engagementLevel: string): string[] {
    const recommendations = [];
    
    if (moodTrend === 'improving') {
      recommendations.push("Continue com as práticas que estão funcionando!");
    }
    
    if (engagementLevel === 'high') {
      recommendations.push("Sua dedicação é inspiradora! Vamos explorar práticas mais avançadas.");
    } else {
      recommendations.push("Tente manter conversas mais regulares para melhores resultados.");
    }
    
    return recommendations;
  }
}