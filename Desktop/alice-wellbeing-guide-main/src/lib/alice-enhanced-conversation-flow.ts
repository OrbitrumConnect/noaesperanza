// Sistema Avançado de Fluxo de Conversação da Alícea
// Implementa o fluxo humanizado e estruturado conforme diretrizes da Dra. Dayana

export interface PatientProfile {
  userId: string;
  nome: string;
  idade?: number;
  altura?: number;
  peso?: number;
  genero?: string;
  
  // Dados de Saúde
  condicoesExistentes: string[];
  medicamentos: string[];
  alergias: string[];
  sintomas: string[];
  
  // Hábitos Alimentares
  preferenciasAlimentares: string[];
  restricoesDietarias: string[];
  habitosAlimentares: string;
  
  // Estilo de Vida
  nivelAtividadeFisica: string;
  qualidadeSono: string;
  nivelEstresse: number; // 1-10
  nivelEnergia: number; // 1-10
  
  // Estado Emocional
  humor: string;
  disposicao: string;
  gratidao: string;
  
  // Objetivos
  objetivosPrimarios: string[];
  objetivosSecundarios: string[];
  
  // Protocolo Personalizado
  protocoloAlimentacao?: string;
  biohackingRecomendado?: string[];
  frequenciasQuanticas?: string[];
  rotinaSAFE?: string;
}

export interface ConversationPhase {
  phase: string;
  title: string;
  questions: string[];
  dataFields: string[];
  nextPhase: string;
  isCompleted: boolean;
}

export interface DoctorSummary {
  pacienteId: string;
  nome: string;
  dataColeta: Date;
  
  // Resumo Clínico
  dadosEssenciais: {
    idade: number;
    imc?: number;
    condicoesMedicas: string[];
    medicamentos: string[];
  };
  
  // Recomendações Personalizadas
  protocoloAlimentacao: string;
  sugestoesBiohacking: string[];
  frequenciasRecomendadas: string[];
  
  // Alertas Críticos
  biomarcadoresCriticos: string[];
  alertasSaude: string[];
  
  // Acompanhamento Emocional
  perguntasReflexivas: string[];
  observacoesEmocionais: string;
  
  // Próximos Passos
  proximasConsultas: string[];
  monitoramento: string[];
}

export class AliceEnhancedConversationFlow {
  private patientProfiles: Map<string, PatientProfile> = new Map();
  private conversationPhases: Map<string, ConversationPhase[]> = new Map();
  
  // Protocolos da Dra. Dayana
  private protocolosAlimentacao = {
    detox: "Protocolo Detox 7 dias: smoothies verdes, chás funcionais, jejum intermitente 16:8",
    antiinflamatorio: "Protocolo Anti-inflamatório: curcuma, gengibre, omega-3, redução glúten/lactose",
    energia: "Protocolo Energia: microverdes, spirulina, quinoa, nuts, hidratação alcalina",
    emagrecimento: "Protocolo Emagrecimento: baixo carboidrato, proteínas magras, termogênicos naturais",
    digestivo: "Protocolo Digestivo: probióticos, enzimas, fibras solúveis, alimentos fermentados"
  };

  private biohackingProtocolos = [
    "Exposição solar matinal 15-20min (vitamina D natural)",
    "Água com limão e sal rosa em jejum",
    "Respiração 4-7-8 para ativação parassimpática",
    "Banho frio 2-3min (ativação sistema imunológico)",
    "Jejum intermitente 16:8 personalizado",
    "Grounding/earthing 15min descalço na terra",
    "Luz vermelha infravermelha para recuperação",
    "Suplementação ortomolecular personalizada"
  ];

  private frequenciasQuanticas = {
    manhã: ["528Hz - Reparação DNA", "741Hz - Clareza Mental", "963Hz - Conexão Superior"],
    tarde: ["432Hz - Relaxamento Natural", "639Hz - Relacionamentos Harmoniosos"],
    noite: ["396Hz - Liberação Medos", "528Hz - Regeneração Celular", "174Hz - Alívio Dor"]
  };

  constructor() {
    this.initializeConversationPhases();
  }

  private initializeConversationPhases() {
    const phases: ConversationPhase[] = [
      {
        phase: "boas_vindas",
        title: "Boas-vindas Acolhedoras",
        questions: [
          "Olá! Que alegria ter você aqui. Eu sou a Alícea, sua assistente de bem-estar da Dra. Dayana. Como posso chamá-lo(a)?",
          "Que bom te conhecer, {nome}! Estou aqui para cuidar de você de forma integral e carinhosa. Como você está se sentindo hoje?"
        ],
        dataFields: ["nome", "estadoEmocionalInicial"],
        nextPhase: "dados_pessoais",
        isCompleted: false
      },
      {
        phase: "dados_pessoais",
        title: "Conhecendo Você",
        questions: [
          "Para personalizar seu cuidado, posso saber sua idade? Isso me ajuda a entender melhor suas necessidades.",
          "Qual sua altura e peso aproximados? Não se preocupe, é só para calcularmos seu protocolo ideal.",
          "Você se identifica como qual gênero? Isso influencia algumas recomendações hormonais."
        ],
        dataFields: ["idade", "altura", "peso", "genero"],
        nextPhase: "saude_atual",
        isCompleted: false
      },
      {
        phase: "saude_atual",
        title: "Sua Saúde Hoje",
        questions: [
          "Tem alguma condição de saúde que você gostaria que eu soubesse? Pode ser algo simples ou mais complexo.",
          "Está tomando algum medicamento ou suplemento atualmente? Quero garantir que tudo seja compatível.",
          "Tem alguma alergia alimentar ou algo que seu corpo não tolera bem?",
          "Como está se sentindo fisicamente hoje? Algum desconforto ou sintoma que te incomoda?"
        ],
        dataFields: ["condicoesExistentes", "medicamentos", "alergias", "sintomas"],
        nextPhase: "habitos_alimentares",
        isCompleted: false
      },
      {
        phase: "habitos_alimentares",
        title: "Sua Relação com a Alimentação",
        questions: [
          "Me conte sobre sua alimentação atual. O que você mais gosta de comer?",
          "Tem algum alimento que você evita ou não consegue comer? Por qual motivo?",
          "Como são seus horários de refeição? Você tem uma rotina estabelecida?",
          "Qual sua relação com a comida? Você come por prazer, necessidade, ansiedade?"
        ],
        dataFields: ["preferenciasAlimentares", "restricoesDietarias", "habitosAlimentares"],
        nextPhase: "estilo_vida",
        isCompleted: false
      },
      {
        phase: "estilo_vida",
        title: "Seu Estilo de Vida",
        questions: [
          "Como está sua energia durante o dia? Se fosse dar uma nota de 1 a 10?",
          "E seu sono? Consegue dormir bem e acordar descansado(a)?",
          "Pratica alguma atividade física? O que mais gosta de fazer para se movimentar?",
          "Numa escala de 1 a 10, como está seu nível de estresse atualmente?"
        ],
        dataFields: ["nivelEnergia", "qualidadeSono", "nivelAtividadeFisica", "nivelEstresse"],
        nextPhase: "estado_emocional",
        isCompleted: false
      },
      {
        phase: "estado_emocional",
        title: "Seu Bem-Estar Emocional",
        questions: [
          "Como está seu humor hoje? Se tivesse que descrever em uma palavra?",
          "O que te deixa mais animado(a) e disposto(a) no dia a dia?",
          "Pelo que você se sente mais grato(a) neste momento da sua vida?"
        ],
        dataFields: ["humor", "disposicao", "gratidao"],
        nextPhase: "objetivos",
        isCompleted: false
      },
      {
        phase: "objetivos",
        title: "Seus Objetivos e Sonhos",
        questions: [
          "Qual é seu principal objetivo de saúde neste momento? O que mais gostaria de alcançar?",
          "Tem algum objetivo secundário? Algo que seria um bônus maravilhoso conquistar?",
          "Como você se imagina se sentindo daqui a 90 dias seguindo um protocolo personalizado?"
        ],
        dataFields: ["objetivosPrimarios", "objetivosSecundarios"],
        nextPhase: "conclusao",
        isCompleted: false
      }
    ];

    this.conversationPhases.set("default", phases);
  }

  // Inicia ou continua a conversa humanizada
  public generateProgressiveResponse(
    message: string, 
    userId: string, 
    userName?: string
  ): {
    message: string;
    options?: string[];
    biohackingTip?: string;
    frequencyRecommendation?: string;
    personalizationNote?: string;
    currentPhase?: string;
    isCompleted?: boolean;
  } {
    let profile = this.patientProfiles.get(userId);
    if (!profile) {
      profile = this.createNewPatientProfile(userId, userName);
      this.patientProfiles.set(userId, profile);
    }

    const phases = this.conversationPhases.get("default") || [];
    const currentPhase = this.getCurrentPhase(userId);
    
    if (!currentPhase) {
      return this.generateWelcomeMessage(profile);
    }

    // Processa a resposta do usuário
    this.processUserResponse(message, profile, currentPhase);

    // Verifica se a fase atual está completa
    if (this.isPhaseComplete(currentPhase, profile)) {
      currentPhase.isCompleted = true;
      const nextPhase = this.getNextPhase(currentPhase.nextPhase, phases);
      
      if (!nextPhase) {
        // Conversa completada - gera resumo para a doutora
        return this.generateCompletionResponse(profile);
      }
      
      return this.generatePhaseTransition(currentPhase, nextPhase, profile);
    }

    // Continua na fase atual
    return this.generateCurrentPhaseResponse(currentPhase, profile);
  }

  private createNewPatientProfile(userId: string, userName?: string): PatientProfile {
    return {
      userId,
      nome: userName || "",
      condicoesExistentes: [],
      medicamentos: [],
      alergias: [],
      sintomas: [],
      preferenciasAlimentares: [],
      restricoesDietarias: [],
      habitosAlimentares: "",
      nivelAtividadeFisica: "",
      qualidadeSono: "",
      nivelEstresse: 5,
      nivelEnergia: 5,
      humor: "",
      disposicao: "",
      gratidao: "",
      objetivosPrimarios: [],
      objetivosSecundarios: []
    };
  }

  private getCurrentPhase(userId: string): ConversationPhase | null {
    const phases = this.conversationPhases.get("default") || [];
    return phases.find(phase => !phase.isCompleted) || null;
  }

  private getNextPhase(nextPhaseName: string, phases: ConversationPhase[]): ConversationPhase | null {
    return phases.find(phase => phase.phase === nextPhaseName) || null;
  }

  private generateWelcomeMessage(profile: PatientProfile) {
    const welcomeMessages = [
      "Olá! Que alegria ter você aqui. Eu sou a Alícea, sua assistente de bem-estar da Dra. Dayana. Como posso chamá-lo(a)?",
      "Seja muito bem-vindo(a)! Sou a Alícea e estou aqui para cuidar de você de forma integral e carinhosa. Qual é seu nome?",
      "Oi! Que prazer te conhecer! Eu sou a Alícea, sua parceira de saúde e bem-estar. Como você gostaria que eu te chamasse?"
    ];

    const randomWelcome = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];

    return {
      message: randomWelcome,
      biohackingTip: "💡 **Dica de Biohacking**: Respire fundo 3 vezes agora mesmo. Isso ativa seu sistema nervoso parassimpático e prepara seu corpo para uma conversa mais receptiva!",
      frequencyRecommendation: "🎵 **Frequência Recomendada**: 432Hz - Frequência da harmonia natural (15 min)",
      personalizationNote: "✨ Estou aqui para conhecer você profundamente e criar um protocolo único para sua jornada de saúde!",
      currentPhase: "boas_vindas"
    };
  }

  private processUserResponse(message: string, profile: PatientProfile, phase: ConversationPhase) {
    // Extrai dados da resposta baseado na fase atual
    switch (phase.phase) {
      case "boas_vindas":
        if (!profile.nome && message.trim()) {
          profile.nome = this.extractName(message);
        }
        break;
      
      case "dados_pessoais":
        this.extractPersonalData(message, profile);
        break;
      
      case "saude_atual":
        this.extractHealthData(message, profile);
        break;
      
      case "habitos_alimentares":
        this.extractNutritionData(message, profile);
        break;
      
      case "estilo_vida":
        this.extractLifestyleData(message, profile);
        break;
      
      case "estado_emocional":
        this.extractEmotionalData(message, profile);
        break;
      
      case "objetivos":
        this.extractGoalsData(message, profile);
        break;
    }
  }

  private extractName(message: string): string {
    // Simples extração de nome - pode ser melhorada
    return message.trim().split(' ')[0] || "";
  }

  private extractPersonalData(message: string, profile: PatientProfile) {
    // Extrai idade - múltiplos padrões
    const ageMatches = [
      message.match(/(\d{1,2})\s*anos?/i),          // "36 anos"
      message.match(/tenho\s+(\d{1,2})/i),          // "tenho 36"
      message.match(/idade\s+(\d{1,2})/i),          // "idade 36"
      message.match(/^(\d{1,2})$/),                 // "36" sozinho
      message.match(/sou\s+(\d{1,2})/i),            // "sou 36"
      message.match(/(\d{1,2})\s*!/),               // "36!"
    ];
    
    for (const match of ageMatches) {
      if (match && !profile.idade) {
        const age = parseInt(match[1]);
        if (age >= 10 && age <= 120) { // Validação básica
          profile.idade = age;
          console.log(`🎯 Idade extraída: ${age} anos`);
          break;
        }
      }
    }

    // Extrai altura
    const heightMatch = message.match(/(\d{1,2}[\.,]?\d{0,2})\s*m/i) || message.match(/(\d{3})\s*cm/i);
    if (heightMatch) {
      profile.altura = parseFloat(heightMatch[1].replace(',', '.'));
    }

    // Extrai peso
    const weightMatch = message.match(/(\d{2,3})\s*kg/i);
    if (weightMatch) {
      profile.peso = parseInt(weightMatch[1]);
    }
  }

  private extractHealthData(message: string, profile: PatientProfile) {
    const lowerMessage = message.toLowerCase();
    
    // Detecta condições de saúde comuns
    const conditions = ['diabetes', 'hipertensão', 'ansiedade', 'depressão', 'tireoide', 'gastrite'];
    conditions.forEach(condition => {
      if (lowerMessage.includes(condition)) {
        profile.condicoesExistentes.push(condition);
      }
    });

    // Detecta medicamentos
    if (lowerMessage.includes('medicamento') || lowerMessage.includes('remédio')) {
      profile.medicamentos.push(message);
    }

    // Detecta alergias
    if (lowerMessage.includes('alergia') || lowerMessage.includes('alérgico')) {
      profile.alergias.push(message);
    }
  }

  private extractNutritionData(message: string, profile: PatientProfile) {
    profile.habitosAlimentares += message + " ";
    
    // Detecta preferências e restrições
    const restrictions = ['glúten', 'lactose', 'açúcar', 'carne', 'vegetariano', 'vegano'];
    restrictions.forEach(restriction => {
      if (message.toLowerCase().includes(restriction)) {
        profile.restricoesDietarias.push(restriction);
      }
    });
  }

  private extractLifestyleData(message: string, profile: PatientProfile) {
    // Extrai níveis numericos
    const numberMatch = message.match(/(\d{1,2})/);
    if (numberMatch) {
      const number = parseInt(numberMatch[1]);
      if (message.toLowerCase().includes('energia')) {
        profile.nivelEnergia = number;
      } else if (message.toLowerCase().includes('estresse')) {
        profile.nivelEstresse = number;
      }
    }

    // Detecta atividade física
    if (message.toLowerCase().includes('exerc') || message.toLowerCase().includes('academia') || message.toLowerCase().includes('caminhada')) {
      profile.nivelAtividadeFisica = message;
    }

    // Detecta qualidade do sono
    if (message.toLowerCase().includes('sono') || message.toLowerCase().includes('dormir')) {
      profile.qualidadeSono = message;
    }
  }

  private extractEmotionalData(message: string, profile: PatientProfile) {
    if (message.toLowerCase().includes('humor') || !profile.humor) {
      profile.humor = message;
    } else if (message.toLowerCase().includes('animado') || !profile.disposicao) {
      profile.disposicao = message;
    } else if (message.toLowerCase().includes('grato') || !profile.gratidao) {
      profile.gratidao = message;
    }
  }

  private extractGoalsData(message: string, profile: PatientProfile) {
    if (profile.objetivosPrimarios.length === 0) {
      profile.objetivosPrimarios.push(message);
    } else {
      profile.objetivosSecundarios.push(message);
    }
  }

  private isPhaseComplete(phase: ConversationPhase, profile: PatientProfile): boolean {
    console.log(`🔍 Verificando se fase ${phase.phase} está completa...`);
    
    let isComplete = false;
    switch (phase.phase) {
      case "boas_vindas":
        isComplete = !!profile.nome;
        break;
      case "dados_pessoais":
        // Considerar completa se tem pelo menos idade OU se não há mais perguntas
        isComplete = !!profile.idade || phase.questions.length === 0;
        break;
      case "saude_atual":
        isComplete = phase.questions.length === 0;
        break;
      case "habitos_alimentares":
        isComplete = !!profile.habitosAlimentares || phase.questions.length === 0;
        break;
      case "estilo_vida":
        isComplete = !!(profile.nivelEnergia && profile.qualidadeSono) || phase.questions.length === 0;
        break;
      case "estado_emocional":
        isComplete = !!(profile.humor && profile.gratidao) || phase.questions.length === 0;
        break;
      case "objetivos":
        isComplete = profile.objetivosPrimarios.length > 0 || phase.questions.length === 0;
        break;
      default:
        isComplete = false;
    }
    
    console.log(`✅ Fase ${phase.phase} completa: ${isComplete}`);
    return isComplete;
  }

  private generateCurrentPhaseResponse(phase: ConversationPhase, profile: PatientProfile) {
    const nextQuestion = this.getNextQuestionForPhase(phase, profile);
    
    return {
      message: nextQuestion,
      biohackingTip: this.generateBiohackingTip(phase.phase),
      frequencyRecommendation: this.generateFrequencyRecommendation(),
      personalizationNote: this.generatePersonalizationNote(profile),
      currentPhase: phase.phase
    };
  }

  private getNextQuestionForPhase(phase: ConversationPhase, profile: PatientProfile): string {
    // Debug para verificar estado da fase
    console.log(`🔍 Fase atual: ${phase.phase}, Questões restantes: ${phase.questions.length}`);
    console.log(`📊 Profile atual:`, { 
      nome: profile.nome, 
      idade: profile.idade, 
      altura: profile.altura, 
      peso: profile.peso 
    });
    
    // Remover a primeira pergunta após uso para evitar repetições
    const question = phase.questions.shift() || "Como posso te ajudar melhor?";
    
    console.log(`❓ Próxima pergunta: ${question}`);
    return question.replace("{nome}", profile.nome || "");
  }

  private generatePhaseTransition(currentPhase: ConversationPhase, nextPhase: ConversationPhase, profile: PatientProfile) {
    const transitionMessages = [
      `Perfeito, ${profile.nome}! Agora que entendi melhor sobre ${currentPhase.title.toLowerCase()}, vamos falar sobre ${nextPhase.title.toLowerCase()}.`,
      `Que bom! Já tenho informações valiosas sobre ${currentPhase.title.toLowerCase()}. Agora gostaria de conhecer ${nextPhase.title.toLowerCase()}.`,
      `Excelente! Suas informações sobre ${currentPhase.title.toLowerCase()} são muito úteis. Vamos avançar para ${nextPhase.title.toLowerCase()}.`
    ];

    const randomTransition = transitionMessages[Math.floor(Math.random() * transitionMessages.length)];
    const nextQuestion = this.getNextQuestionForPhase(nextPhase, profile);

    return {
      message: `${randomTransition}\n\n${nextQuestion}`,
      biohackingTip: this.generateBiohackingTip(nextPhase.phase),
      frequencyRecommendation: this.generateFrequencyRecommendation(),
      personalizationNote: this.generatePersonalizationNote(profile),
      currentPhase: nextPhase.phase
    };
  }

  private generateCompletionResponse(profile: PatientProfile) {
    const summary = this.generateDoctorSummary(profile);
    
    return {
      message: `${profile.nome}, foi uma alegria imensa conhecer você! Coletei todas as informações necessárias para que a Dra. Dayana possa criar seu protocolo personalizado perfeito. 

Em breve você receberá:
🌿 Seu protocolo alimentar personalizado
🎯 Recomendações de biohacking específicas
🎵 Frequências quânticas para seu perfil
📋 Rotina SAFE® adaptada para você

A Dra. Dayana já tem tudo que precisa para cuidar de você de forma única e especial!`,
      biohackingTip: "💡 **Dica Final**: Mantenha um diário de gratidão diário. Escreva 3 coisas pelas quais é grato - isso otimiza sua neuroplasticidade!",
      frequencyRecommendation: "🎵 **Para Integração**: 528Hz - Frequência da cura e amor (20 min)",
      personalizationNote: `✨ ${profile.nome}, sua jornada de transformação está apenas começando. Estou ansiosa para acompanhar sua evolução!`,
      currentPhase: "completed",
      isCompleted: true
    };
  }

  public generateDoctorSummary(profile: PatientProfile): DoctorSummary {
    const imc = profile.peso && profile.altura ? 
      profile.peso / Math.pow(profile.altura, 2) : undefined;

    // Seleciona protocolo baseado nos objetivos
    let protocoloSelecionado = this.protocolosAlimentacao.energia; // Padrão
    
    if (profile.objetivosPrimarios.some(obj => obj.toLowerCase().includes('peso') || obj.toLowerCase().includes('emagrecer'))) {
      protocoloSelecionado = this.protocolosAlimentacao.emagrecimento;
    } else if (profile.objetivosPrimarios.some(obj => obj.toLowerCase().includes('energia'))) {
      protocoloSelecionado = this.protocolosAlimentacao.energia;
    } else if (profile.sintomas.some(sint => sint.toLowerCase().includes('digestão') || sint.toLowerCase().includes('estômago'))) {
      protocoloSelecionado = this.protocolosAlimentacao.digestivo;
    }

    // Seleciona biohackings baseado no perfil
    const biohackingSelecionado = this.biohackingProtocolos.filter((_, index) => {
      if (profile.nivelEstresse > 7) return index < 4; // Foco em redução de estresse
      if (profile.nivelEnergia < 6) return index % 2 === 0; // Foco em energia
      return true;
    }).slice(0, 4);

    return {
      pacienteId: profile.userId,
      nome: profile.nome,
      dataColeta: new Date(),
      
      dadosEssenciais: {
        idade: profile.idade || 0,
        imc,
        condicoesMedicas: profile.condicoesExistentes,
        medicamentos: profile.medicamentos
      },
      
      protocoloAlimentacao: protocoloSelecionado,
      sugestoesBiohacking: biohackingSelecionado,
      frequenciasRecomendadas: [
        this.frequenciasQuanticas.manhã[0],
        this.frequenciasQuanticas.tarde[0],
        this.frequenciasQuanticas.noite[0]
      ],
      
      biomarcadoresCriticos: this.identifyBiomarkerAlerts(profile),
      alertasSaude: this.identifyHealthAlerts(profile),
      
      perguntasReflexivas: this.generateReflectiveQuestions(profile),
      observacoesEmocionais: `Humor: ${profile.humor}, Gratidão: ${profile.gratidao}, Disposição: ${profile.disposicao}`,
      
      proximasConsultas: ["Avaliação 30 dias", "Ajuste protocolo 60 dias"],
      monitoramento: ["Energia diária", "Qualidade sono", "Digestão", "Humor"]
    };
  }

  private identifyBiomarkerAlerts(profile: PatientProfile): string[] {
    const alerts: string[] = [];
    
    if (profile.nivelEstresse > 8) {
      alerts.push("Nível de estresse crítico - avaliar cortisol");
    }
    
    if (profile.nivelEnergia < 4) {
      alerts.push("Fadiga severa - investigar deficiências nutricionais");
    }
    
    const imc = profile.peso && profile.altura ? 
      profile.peso / Math.pow(profile.altura, 2) : 0;
    
    if (imc > 30) {
      alerts.push("IMC elevado - protocolo emagrecimento prioritário");
    }
    
    return alerts;
  }

  private identifyHealthAlerts(profile: PatientProfile): string[] {
    const alerts: string[] = [];
    
    if (profile.condicoesExistentes.includes('diabetes')) {
      alerts.push("Diabético - monitorar glicemia com protocolo");
    }
    
    if (profile.restricoesDietarias.includes('glúten') && profile.sintomas.some(s => s.includes('digestão'))) {
      alerts.push("Possível sensibilidade glúten - protocolo anti-inflamatório");
    }
    
    return alerts;
  }

  private generateReflectiveQuestions(profile: PatientProfile): string[] {
    return [
      "Como você se vê se sentindo seguindo este protocolo por 30 dias?",
      "Que mudança seria mais transformadora para você?",
      "O que mais te motiva a cuidar da sua saúde?",
      "Como posso te apoiar melhor nesta jornada?"
    ];
  }

  private generateBiohackingTip(phase: string): string {
    const tips = {
      boas_vindas: "💡 **Dica de Biohacking**: Respire fundo 3 vezes agora. Isso ativa seu sistema parassimpático!",
      dados_pessoais: "💡 **Dica de Biohacking**: Beba um copo de água agora. Hidratação otimiza função cerebral!",
      saude_atual: "💡 **Dica de Biohacking**: Faça 10 polichinelos! Movimento libera endorfinas naturais.",
      habitos_alimentares: "💡 **Dica de Biohacking**: Mastigue devagar na próxima refeição. Melhora 300% a digestão!",
      estilo_vida: "💡 **Dica de Biohacking**: Olhe pela janela por 30 segundos. Relaxa músculos oculares e mente!",
      estado_emocional: "💡 **Dica de Biohacking**: Sorria por 20 segundos! Libera dopamina e serotonina naturalmente.",
      objetivos: "💡 **Dica de Biohacking**: Visualize seu objetivo por 1 minuto. Ativa redes neurais de sucesso!"
    };
    
    return tips[phase as keyof typeof tips] || tips.boas_vindas;
  }

  private generateFrequencyRecommendation(): string {
    const currentHour = new Date().getHours();
    let frequencies: string[];
    
    if (currentHour < 12) {
      frequencies = this.frequenciasQuanticas.manhã;
    } else if (currentHour < 18) {
      frequencies = this.frequenciasQuanticas.tarde;
    } else {
      frequencies = this.frequenciasQuanticas.noite;
    }
    
    const randomFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
    return `🎵 **Frequência Recomendada**: ${randomFreq} (15 min)`;
  }

  private generatePersonalizationNote(profile: PatientProfile): string {
    if (!profile.nome) {
      return "✨ Estou conhecendo você e já percebo sua energia especial!";
    }
    
    const notes = [
      `✨ ${profile.nome}, percebo que você é uma pessoa muito consciente sobre saúde!`,
      `✨ Admiro sua dedicação ao autocuidado, ${profile.nome}!`,
      `✨ ${profile.nome}, sua jornada de bem-estar é única e especial!`,
      `✨ Vejo que você tem uma energia maravilhosa, ${profile.nome}!`
    ];
    
    return notes[Math.floor(Math.random() * notes.length)];
  }

  // Métodos utilitários
  public resetConversation(userId: string): void {
    console.log(`🔄 Resetando conversa para userId: ${userId}`);
    this.patientProfiles.delete(userId);
    
    // Reinicializar as fases para este usuário
    this.initializeConversationPhases();
    
    console.log(`✅ Conversa resetada completamente`);
  }

  public getPatientProfile(userId: string): PatientProfile | undefined {
    return this.patientProfiles.get(userId);
  }

  public getConversationProgress(userId: string): { completed: number; total: number; currentPhase: string } {
    const phases = this.conversationPhases.get("default") || [];
    const completed = phases.filter(p => p.isCompleted).length;
    const currentPhase = phases.find(p => !p.isCompleted);
    
    return {
      completed,
      total: phases.length,
      currentPhase: currentPhase?.phase || "completed"
    };
  }
}