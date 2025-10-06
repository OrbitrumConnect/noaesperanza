// Alice AI Intelligence System
export interface AliceResponse {
  message: string;
  options?: string[];
  phase?: string;
  isEducational?: boolean;
  requiresConsent?: boolean;
}

export class AliceAI {
  private static responses = {
    welcome: {
      message: "Oi, eu sou Alice 👋 Sou sua assistente de saúde e bem-estar. Posso te ajudar a organizar sua rotina e montar um Plano MEV personalizado. Nossa plataforma tem e-books, vídeos educativos e checklists.",
      options: ["Garantir acesso agora", "Tirar dúvidas primeiro"],
      isEducational: true
    },

    educational_disclaimer: {
      message: "⚠️ Lembre-se: posso orientar sobre hábitos e rotina, mas não substituo avaliação médica. Todo conteúdo é educativo e de apoio.",
      options: ["Entendi, vamos começar"]
    },

    questions: {
      identification: [
        "Vamos começar! Qual seu nome completo?",
        "Qual seu melhor e-mail?",
        "E seu WhatsApp para contato?",
        "Em qual cidade você mora?"
      ],
      measurements: [
        "Agora vamos às suas medidas. Qual sua idade?",
        "Qual sua altura em centímetros?",
        "E seu peso atual em kg?"
      ],
      routine: [
        "Me conte sobre sua profissão e horários de trabalho.",
        "Como está seu sono? Quantas horas por noite?",
        "Pratica alguma atividade física? Com que frequência?",
        "Como é sua alimentação no dia a dia?",
        "Numa escala de 0 a 10, como está seu nível de estresse?"
      ],
      health: [
        "Tem algum diagnóstico médico ou comorbidade?",
        "Toma algum medicamento ou suplemento regularmente?",
        "Tem alguma alergia alimentar ou restrição?",
        "Fuma ou consome álcool regularmente?"
      ],
      objectives: [
        "Qual seu principal objetivo de saúde? (ex: melhorar sono, reduzir estresse, mais energia)",
        "Tem algum objetivo secundário?"
      ]
    },

    educational_responses: {
      sleep: "Para melhorar seu sono: mantenha horários regulares, evite telas 30 min antes de dormir, faça atividades leves à tarde e crie uma rotina pré-sono relaxante.",
      
      nutrition: "Uma alimentação balanceada inclui vegetais, proteínas magras e carboidratos saudáveis. Posso sugerir trocas inteligentes baseadas nas suas preferências.",
      
      exercise: "O ideal são 2-3 sessões semanais de exercícios leves a moderados, além de alongamentos diários e caminhadas.",
      
      hydration: "A meta inicial pode ser 30-35 ml de água por kg de peso corporal por dia. Ajuste conforme seu ritmo e clima.",
      
      stress: "Faça pausas curtas a cada 2-3 horas e tente exercícios de respiração de 2-5 minutos.",
      
      exams: "Posso explicar exames de forma educativa, mas não interpreto resultados individuais. Para isso, sempre procure seu médico."
    },

    mev_plan_template: {
      nutrition: "🥗 NUTRIÇÃO: 3 refeições + 1 lanche, incluindo vegetais, proteínas e carboidratos saudáveis",
      hydration: "💧 HIDRATAÇÃO: Meta personalizada baseada no seu peso",
      sleep: "😴 SONO: Horários regulares e rotina pré-sono",
      exercise: "🏃‍♀️ MOVIMENTO: 2-3 sessões semanais + alongamentos diários",
      stress: "🧘‍♀️ ESTRESSE: Pausas regulares + exercícios de respiração",
      sun: "☀️ LUZ/SOL: 10-20 min de exposição solar matinal"
    },

    optional_resources: {
      hertz: "🎵 Trilhas em hertz (432Hz, 528Hz) para relaxamento. São complementares, efeito subjetivo e opcional.",
      pnl: "🧠 Exercícios de PNL para reframing e ancoragem. Educativo e opcional.",
      constellation: "⭐ Práticas de constelação e Access Bars para reflexão. Não substituem consulta médica."
    },

    legal_boundaries: {
      no_prescription: "Não posso indicar medicamentos, doses ou produtos específicos. Para prescrição, consulte um profissional habilitado.",
      no_cure_promise: "Não prometo cura ou resultados clínicos. Todo conteúdo é educativo e de apoio à rotina.",
      emergency: "Se sentir sinais de alerta ou emergência, procure imediatamente um serviço médico.",
      medical_evaluation: "Para qualquer avaliação clínica, é necessário consultar um profissional habilitado."
    },

    emergency_response: {
      message: "🚨 Percebi que você pode estar em uma situação de risco. PROCURE IMEDIATAMENTE um serviço médico de emergência ou ligue para:\n\n• SAMU: 192\n• CVV: 188\n• Bombeiros: 193\n\nSua segurança é prioridade!",
      requiresConsent: false
    }
  };

  static getWelcomeMessage(): AliceResponse {
    const welcomeMessages = [
      "Oi, eu sou Alice 👋 Sou sua assistente de saúde e bem-estar. Posso te ajudar a organizar sua rotina e montar um Plano MEV personalizado. Nossa plataforma tem e-books, vídeos educativos e checklists.",
      "Olá! Que prazer te conhecer! 🌟 Sou a Alice e vou te acompanhar na jornada para uma vida mais saudável. Temos recursos incríveis para te apoiar!",
      "Seja muito bem-vinda! 💚 Eu sou Alice, pronta para te ajudar com hábitos saudáveis e bem-estar. Como você se sente sobre cuidar melhor da sua saúde?",
      "Oi querida! ✨ Aqui é a Alice, sua parceira de saúde! Vamos criar juntas uma rotina que faça você se sentir incrível?"
    ];
    
    const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    
    return {
      message: randomMessage,
      options: ["Garantir acesso agora", "Tirar dúvidas primeiro"],
      isEducational: true
    };
  }

  static getEducationalDisclaimer(): AliceResponse {
    return this.responses.educational_disclaimer;
  }

  static getQuestionByPhase(phase: string, questionIndex: number): string {
    const questions = this.responses.questions[phase as keyof typeof this.responses.questions];
    return Array.isArray(questions) ? questions[questionIndex] || "" : "";
  }

  static getEducationalResponse(topic: string): string {
    return this.responses.educational_responses[topic as keyof typeof this.responses.educational_responses] || 
           "Posso ajudar com orientações educativas sobre rotina e hábitos. Para avaliação clínica, consulte um profissional habilitado.";
  }

  static generateMEVPlan(userData: any): string {
    const weight = userData.weight || 70;
    const hydrationGoal = Math.round(weight * 35);
    
    return `🎯 **SEU PLANO MEV PERSONALIZADO**

${this.responses.mev_plan_template.nutrition}
💧 **HIDRATAÇÃO**: ${hydrationGoal}ml/dia (baseado no seu peso)
${this.responses.mev_plan_template.sleep}
${this.responses.mev_plan_template.exercise}
${this.responses.mev_plan_template.stress}
${this.responses.mev_plan_template.sun}

**📋 CHECKLIST DIÁRIO:**
[ ] Hidratação completa
[ ] 3 refeições balanceadas
[ ] 30min de movimento
[ ] Exposição solar matinal
[ ] Pausa para respiração

⚠️ Lembre-se: Este plano é educativo e não substitui avaliação médica.`;
  }

  static getOptionalResources(): AliceResponse {
    return {
      message: "🌟 **RECURSOS OPCIONAIS DISPONÍVEIS:**\n\n" +
               this.responses.optional_resources.hertz + "\n\n" +
               this.responses.optional_resources.pnl + "\n\n" +
               this.responses.optional_resources.constellation,
      options: ["Quero conhecer os áudios", "Exercícios de PNL", "Práticas de reflexão", "Não preciso agora"]
    };
  }

  static getLegalBoundary(type: string): string {
    return this.responses.legal_boundaries[type as keyof typeof this.responses.legal_boundaries] || 
           this.responses.legal_boundaries.medical_evaluation;
  }

  static detectEmergency(userInput: string): boolean {
    const emergencyKeywords = [
      'suicidio', 'suicídio', 'morrer', 'matar', 'dor intensa', 'falta de ar', 
      'peito dor', 'emergencia', 'emergência', 'socorro', 'ajuda urgente',
      'não aguento', 'desespero', 'acabar com tudo'
    ];
    
    return emergencyKeywords.some(keyword => 
      userInput.toLowerCase().includes(keyword)
    );
  }

  static getEmergencyResponse(): AliceResponse {
    return this.responses.emergency_response;
  }

  static processUserInput(input: string, context: any): AliceResponse {
    // Check for emergency first
    if (this.detectEmergency(input)) {
      return this.getEmergencyResponse();
    }

    // Check for medical/prescription requests
    const medicalKeywords = ['remedio', 'remédio', 'medicamento', 'dose', 'mg', 'ml', 'prescrição'];
    if (medicalKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
      return {
        message: this.getLegalBoundary('no_prescription'),
        isEducational: true
      };
    }

    // Educational responses based on topic
    const topics = {
      'sono': 'sleep',
      'dormir': 'sleep', 
      'alimentação': 'nutrition',
      'comida': 'nutrition',
      'exercicio': 'exercise',
      'atividade': 'exercise',
      'agua': 'hydration',
      'hidratação': 'hydration',
      'estresse': 'stress',
      'ansiedade': 'stress',
      'exame': 'exams'
    };

    for (const [keyword, topic] of Object.entries(topics)) {
      if (input.toLowerCase().includes(keyword)) {
        return {
          message: this.getEducationalResponse(topic),
          isEducational: true
        };
      }
    }

    return {
      message: "Entendi! Posso ajudar com orientações educativas sobre rotina, sono, alimentação, exercícios e organização de hábitos. O que gostaria de saber?",
      options: ["Melhorar sono", "Organizar alimentação", "Plano de exercícios", "Controle de estresse"],
      isEducational: true
    };
  }
}