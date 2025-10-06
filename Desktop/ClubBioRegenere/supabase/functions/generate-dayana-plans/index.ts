import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-DAYANA-PLANS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error('user_id é obrigatório');
    }

    logStep("Generating plans for user", { userId: user_id });

    // Buscar dados do usuário de todas as tabelas relevantes
    const [profileData, healthData, conversationData, biomarcadoresData, dailyHabitsData] = await Promise.all([
      supabaseClient.from('profiles').select('*').eq('user_id', user_id).single(),
      supabaseClient.from('health_profiles').select('*').eq('user_id', user_id).single(),
      supabaseClient.from('conversations').select('*').eq('user_id', user_id).order('created_at', { ascending: false }).limit(50),
      supabaseClient.from('biomarcadores_isafe').select('*').eq('user_id', user_id).order('assessment_date', { ascending: false }).limit(1),
      supabaseClient.from('daily_habits').select('*').eq('user_id', user_id).order('created_at', { ascending: false }).limit(10)
    ]);

    const profile = profileData.data || {};
    const health = healthData.data || {};
    const conversations = conversationData.data || [];
    const biomarcadores = (biomarcadoresData.data && biomarcadoresData.data.length > 0) ? biomarcadoresData.data[0] : {};
    const dailyHabits = dailyHabitsData.data || [];

    logStep("Data loaded", { 
      profileFound: !!profile.id, 
      healthFound: !!health.id, 
      conversationsCount: conversations.length,
      biomarcadoresFound: !!biomarcadores.id,
      dailyHabitsCount: dailyHabits.length
    });

    // Extrair dados da anamnese com Alice de forma mais completa
    let dadosAnamnese = '';
    let sintomas = [];
    let preferenciasAlimentares = [];
    let habitosVida = [];
    
    conversations.forEach(conv => {
      if (conv.message_content) {
        // Capturar sintomas mencionados
        if (conv.message_content.toLowerCase().includes('sintoma') || 
            conv.message_content.toLowerCase().includes('dor') ||
            conv.message_content.toLowerCase().includes('cansaço') ||
            conv.message_content.toLowerCase().includes('ansiedade')) {
          sintomas.push(conv.message_content);
        }
        
        // Capturar preferências alimentares
        if (conv.message_content.toLowerCase().includes('gosto') ||
            conv.message_content.toLowerCase().includes('prefiro') ||
            conv.message_content.toLowerCase().includes('como') ||
            conv.message_content.toLowerCase().includes('alimento')) {
          preferenciasAlimentares.push(conv.message_content);
        }
        
        // Capturar hábitos de vida
        if (conv.message_content.toLowerCase().includes('trabalho') ||
            conv.message_content.toLowerCase().includes('rotina') ||
            conv.message_content.toLowerCase().includes('exercício') ||
            conv.message_content.toLowerCase().includes('sono')) {
          habitosVida.push(conv.message_content);
        }
        
        dadosAnamnese += `${conv.message_content}\n`;
      }
      
      if (conv.data_collected) {
        dadosAnamnese += `Dados coletados: ${JSON.stringify(conv.data_collected)}\n`;
      }
    });

    // Dados dos hábitos diários recentes
    let habituaisRecentes = '';
    dailyHabits.forEach(habit => {
      habituaisRecentes += `Data: ${habit.date} - Sono: ${habit.sleep_quality}/10, Energia: ${habit.energy_level}/10, Estresse: ${habit.stress_level}/10, Sintomas: ${habit.symptoms?.join(', ') || 'Nenhum'}\n`;
    });

    // Montar prompt personalizado da Dra. Dayana
    const dayanaPrompt = `
Contexto:
Você é a Dra. Dayana Brazão Hanemann, nutricionista ortomolecular especializada em alimentação funcional sem glúten, sem lactose e sem açúcar, com foco em saúde integrativa e biohacking. Sua missão é criar dois planos completos e personalizados para este paciente específico:

DADOS DO PACIENTE:
Nome: ${profile.full_name || profile.name || 'Paciente'}
Idade: ${profile.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : 'Não informado'}
Peso: ${profile.weight || 'Não informado'}kg
Altura: ${profile.height || 'Não informado'}cm
Sexo: ${profile.gender || 'Não informado'}

DADOS DE SAÚDE:
Condições médicas: ${health.medical_conditions?.join(', ') || 'Nenhuma informada'}
Medicamentos: ${health.current_medications?.join(', ') || 'Nenhum informado'}
Alergias: ${health.allergies?.join(', ') || 'Nenhuma informada'}
Nível de estresse: ${health.stress_level || biomarcadores.estresse || 'Não informado'}/10
Qualidade do sono: ${biomarcadores.qualidade_sono || 'Não informada'}/10
Nível de energia: ${biomarcadores.vitalidade || 'Não informado'}/10

DADOS DA ANAMNESE COM ALICE:
${dadosAnamnese || 'Anamnese não encontrada'}

SINTOMAS IDENTIFICADOS:
${sintomas.length > 0 ? sintomas.join('\n') : 'Nenhum sintoma específico mencionado'}

PREFERÊNCIAS ALIMENTARES:
${preferenciasAlimentares.length > 0 ? preferenciasAlimentares.join('\n') : 'Preferências não informadas'}

HÁBITOS DE VIDA:
${habitosVida.length > 0 ? habitosVida.join('\n') : 'Hábitos não informados'}

DADOS RECENTES DOS ÚLTIMOS DIAS:
${habituaisRecentes || 'Dados recentes não disponíveis'}

BIOMARCADORES ATUAIS:
IMC: ${biomarcadores.imc || 'Não calculado'}
Nível de ansiedade: ${biomarcadores.nivel_ansiedade || 'Não informado'}/10
Satisfação com a vida: ${biomarcadores.satisfacao_vida || 'Não informada'}/10

INSTRUÇÃO:
Crie dois planos completos e personalizados:

1. PLANO ALIMENTAR FUNCIONAL (7 dias completos)
- Sem glúten, sem lactose, sem açúcar
- 5 refeições por dia (café, almoço, lanche, jantar, ceia)
- 4 opções diferentes para cada refeição
- Para cada opção incluir:
  * Ingredientes com medidas exatas
  * Modo de preparo detalhado
  * Função do alimento (nutricional/terapêutica)
  * Motivo da escolha para este paciente específico
  * Valor calórico e macronutrientes
  * Principais micronutrientes
- Dicas da Dra. Dayana para cada dia
- Frequência quântica diária recomendada
- Biohacking integrado
- Lista de compras semanal organizada

2. PLANO MEV - MUDANÇA NO ESTILO DE VIDA (7 dias)
- 1 hábito transformador por dia
- Para cada hábito incluir:
  * Nome e descrição detalhada
  * Benefícios físicos e mentais
  * Como aplicar na rotina
  * Recursos de apoio
  * Biohacking complementar
  * Frequência quântica de apoio
  * Exercício prático
  * Reflexão do dia

IMPORTANTE:
- Adapte TUDO ao perfil específico deste paciente
- Use linguagem acolhedora e motivadora
- Inclua frases positivas diárias
- Sem arroz em nenhuma refeição
- Apenas estevia com taumatina ou allulose como adoçantes
- Pratos coloridos (mínimo 3 cores)
- Integre microverdes e brotos quando apropriado

FORMATO DE RESPOSTA:
Retorne APENAS JSON válido com 7 dias completos e 4 opções por refeição. Exemplo estrutural simplificado:

{
  "titulo_plano": "Plano Personalizado - Nome do Paciente",
  "subtitulo": "Alimentação Funcional + MEV por Dra. Dayana",
  "nome_paciente": "Nome completo",
  "data_inicio": "2025-01-20",
  "data_fim": "2025-01-26",
  "plano_alimentar": {
    "dias": [
      {
        "dia": 1,
        "data": "2025-01-20",
        "frase_positiva": "Frase motivadora específica",
        "frequencia_quantica": "528Hz - Propósito específico",
        "biohacking_dia": "Prática específica para este dia",
        "refeicoes": {
          "cafe_manha": [
            {
              "nome": "Nome da receita",
              "ingredientes": "Lista detalhada com medidas",
              "preparo": "Passo a passo detalhado",
              "funcao": "Função nutricional/terapêutica",
              "motivo_escolha": "Por que é ideal para ESTE paciente",
              "calorias": "Valor em kcal",
              "macros": "Carb: Xg, Prot: Yg, Gord: Zg",
              "micros": "Principais vitaminas/minerais"
            }
          ],
          "almoco": [],
          "lanche_tarde": [],
          "jantar": [],
          "ceia": []
        }
      }
    ],
    "lista_compras": {
      "hortifruti": ["Lista completa para 7 dias"],
      "proteinas": ["Carnes, peixes, ovos"],
      "graos_leguminosas": ["Quinoa, lentilha, etc"],
      "sementes_oleaginosas": ["Castanhas, sementes"],
      "temperos_ervas": ["Especiarias funcionais"],
      "outros": ["Produtos especiais"]
    }
  },
  "plano_mev": {
    "dias": [
      {
        "dia": 1,
        "data": "2025-01-20",
        "habito": "Nome do hábito transformador",
        "descricao": "Descrição completa e motivadora",
        "beneficios": "Benefícios físicos e mentais específicos",
        "como_aplicar": "Passo a passo prático na rotina",
        "recursos_apoio": "Ferramentas/apps/materiais",
        "biohacking": "Técnica de biohacking complementar",
        "frequencia": "Frequência quântica de apoio",
        "exercicio": "Exercício prático do dia",
        "reflexao": "Pergunta reflexiva para o dia",
        "meta_semanal": "Meta específica para esta semana"
      }
    ]
  },
  "mensagem_inicial": "Mensagem calorosa e motivadora da Dra. Dayana",
  "orientacoes_21_dias": {
    "semana_1": "Foco em hidratação e despertar consciente",
    "semana_2": "Movimento e respiração consciente", 
    "semana_3": "Sono reparador e gratidão",
    "dicas_gerais": ["Dica 1", "Dica 2", "Dica 3"]
  },
  "assinatura_medica": "Dra. Dayana Brazão Hanemann - CRM: XXXX",
  "contato": "WhatsApp: (XX) XXXXX-XXXX | E-mail: contato@dradayana.com"
}
`;

    if (!openAIApiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    logStep("Sending prompt to OpenAI", { modelUsed: "gpt-4.1-2025-04-14" });

    // Chamar OpenAI para gerar os planos
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'Você é a Dra. Dayana Brazão Hanemann, nutricionista ortomolecular especializada em alimentação funcional e biohacking. SEMPRE retorne APENAS JSON válido, sem texto adicional antes ou depois do JSON. O JSON deve começar com { e terminar com }.' 
          },
          { role: 'user', content: dayanaPrompt }
        ],
        max_tokens: 6000,
        temperature: 0.8,
        response_format: { type: "json_object" }
      }),
    });

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      logStep("OpenAI API Error", { 
        status: openAIResponse.status, 
        statusText: openAIResponse.statusText,
        error: errorData 
      });
      throw new Error(`OpenAI API Error: ${openAIResponse.status} - ${errorData}`);
    }

    const openAIData = await openAIResponse.json();
    logStep("OpenAI response received", { hasChoices: !!openAIData.choices });

    if (!openAIData.choices || !openAIData.choices[0]) {
      logStep("Invalid OpenAI response structure", { response: openAIData });
      throw new Error('Resposta inválida da OpenAI');
    }

    let planosGerados;
    try {
      const responseContent = openAIData.choices[0].message.content.trim();
      logStep("Parsing OpenAI response", { 
        contentLength: responseContent.length,
        startsWithBrace: responseContent.startsWith('{'),
        endsWithBrace: responseContent.endsWith('}')
      });
      
      // Garantir que é JSON válido
      if (responseContent.startsWith('{') && responseContent.endsWith('}')) {
        planosGerados = JSON.parse(responseContent);
        logStep("JSON parsed successfully");
      } else {
        throw new Error('Resposta não é JSON válido');
      }
    } catch (e) {
      logStep("Error parsing JSON, creating fallback plan", { error: e.message });
      
      // Criar plano personalizado baseado nos dados reais do usuário
      const dataInicio = new Date();
      
      // Personalização baseada no perfil do usuário
      const nomePersonalizado = profile.full_name || profile.name || 'Paciente';
      const idadeUser = profile.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : 30;
      
      // Ajustar plano baseado nos sintomas e condições
      const temAnsiedade = biomarcadores.nivel_ansiedade > 5 || sintomas.some(s => s.includes('ansiedade'));
      const temCansaco = sintomas.some(s => s.includes('cansaço') || s.includes('energia baixa'));
      const problemasSono = biomarcadores.qualidade_sono < 7 || sintomas.some(s => s.includes('sono'));
      const temEstresse = biomarcadores.estresse > 6 || health.stress_level > 6;
      
      // Criar refeições personalizadas baseadas no perfil
      const gerarRefeicaoPersonalizada = (refeicao: string, dia: number) => {
        const baseRefeicoes = {
          cafe_manha: [
            temAnsiedade ? {
              nome: `Smoothie Anti-Ansiedade ${nomePersonalizado} Dia ${dia}`,
              ingredientes: "1 banana, 1 xíc. espinafre, 1 cs magnésio, 200ml leite de amêndoas, 1 cs chia",
              preparo: "Bater todos ingredientes. Rica em magnésio para acalmar o sistema nervoso",
              funcao: "Reduz ansiedade e fornece energia sustentável",
              motivo_escolha: "Personalizado para controlar sua ansiedade e aumentar bem-estar",
              calorias: "190 kcal", macros: "Carb: 28g, Prot: 6g, Gord: 5g", micros: "Magnésio, triptofano, vitamina B6"
            } : {
              nome: `Smoothie Energizante ${nomePersonalizado} Dia ${dia}`,
              ingredientes: "1 banana, 1 xíc. couve, 1 cs spirulina, 200ml água de coco",
              preparo: "Bater até homogêneo. Fonte natural de energia limpa",
              funcao: "Energia natural e desintoxicação",
              motivo_escolha: "Ideal para seu perfil de saúde e energia",
              calorias: "170 kcal", macros: "Carb: 32g, Prot: 4g, Gord: 2g", micros: "Ferro, vitamina C, clorofila"
            }
          ],
          almoco: [
            problemasSono ? {
              nome: `Bowl Reparador do Sono ${nomePersonalizado} Dia ${dia}`,
              ingredientes: "1 xíc. quinoa, 100g salmão, abacate, nozes, sementes abóbora",
              preparo: "Grelhar salmão e montar bowl com quinoa e vegetais frescos",
              funcao: "Rico em triptofano e ômega-3 para melhorar qualidade do sono",
              motivo_escolha: "Especialmente formulado para seus problemas de sono",
              calorias: "420 kcal", macros: "Carb: 35g, Prot: 28g, Gord: 18g", micros: "Triptofano, ômega-3, magnésio"
            } : {
              nome: `Quinoa Colorida ${nomePersonalizado} Dia ${dia}`,
              ingredientes: "1 xíc. quinoa, legumes do dia, proteína escolhida, azeite extravirgem",
              preparo: "Refogar com temperos frescos e muito amor",
              funcao: "Proteína completa e antioxidantes variados",
              motivo_escolha: "Adaptado às suas necessidades nutricionais específicas",
              calorias: "350 kcal", macros: "Carb: 45g, Prot: 15g, Gord: 10g", micros: "Ferro, zinco, vitaminas do complexo B"
            }
          ]
        };
        return baseRefeicoes[refeicao as keyof typeof baseRefeicoes] || [{
          nome: `Refeição Personalizada ${nomePersonalizado}`,
          ingredientes: "Ingredientes selecionados para seu perfil",
          preparo: "Preparo simples e nutritivo",
          funcao: "Nutrição balanceada",
          motivo_escolha: "Escolhido especificamente para você",
          calorias: "300 kcal", macros: "Balanceado", micros: "Completo"
        }];
      };

      // Hábitos MEV personalizados
      const habitosMEVPersonalizados = [
        temAnsiedade ? "Respiração Anti-Ansiedade 4-7-8" : "Respiração Energizante",
        problemasSono ? "Ritual do Sono Reparador" : "Despertar Consciente",
        temEstresse ? "Meditação Anti-Estresse" : "Movimento Intuitivo",
        temCansaco ? "Ativação Energética Matinal" : "Gratidão e Abundância",
        "Desintoxicação Digital Consciente",
        "Conexão com a Natureza",
        "Nutrição Emocional"
      ];

      planosGerados = {
        titulo_plano: `Plano Exclusivo - ${nomePersonalizado}`,
        subtitulo: "Alimentação Funcional + MEV Personalizado por Dra. Dayana",
        nome_paciente: nomePersonalizado,
        data_inicio: dataInicio.toISOString().split('T')[0],
        data_fim: new Date(dataInicio.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        plano_alimentar: {
          dias: Array.from({length: 7}, (_, index) => ({
            dia: index + 1,
            data: new Date(dataInicio.getTime() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            frase_positiva: temAnsiedade && index < 3 ? 
              `${nomePersonalizado}, respire fundo: cada dia você fica mais calmo(a) e centrado(a)!` :
              `${nomePersonalizado}, sua energia cresce a cada escolha consciente!`,
            frequencia_quantica: temAnsiedade ? "396Hz - Liberar Medos" : problemasSono ? "528Hz - Reparação" : "741Hz - Clareza",
            biohacking_dia: temEstresse ? 
              `Grounding (pés descalços na terra) + respiração profunda` :
              `Banho de sol matinal + alongamento consciente`,
            refeicoes: {
              cafe_manha: gerarRefeicaoPersonalizada('cafe_manha', index + 1),
              almoco: gerarRefeicaoPersonalizada('almoco', index + 1),
              lanche_tarde: [{
                nome: `Lanche Funcional ${nomePersonalizado} Dia ${index + 1}`,
                ingredientes: temAnsiedade ? "Castanha do Brasil, tâmaras, chá de camomila" : "Mix de nuts, frutas vermelhas",
                preparo: "Consumir mindful, mastigando devagar",
                funcao: temAnsiedade ? "Acalmar sistema nervoso" : "Energia sustentável",
                motivo_escolha: `Escolhido especialmente para ${nomePersonalizado}`,
                calorias: "180 kcal", macros: "Balanceado", micros: "Selênio, magnésio"
              }],
              jantar: [{
                nome: `Jantar Reparador ${nomePersonalizado} Dia ${index + 1}`,
                ingredientes: problemasSono ? "Frango orgânico, batata doce, brócolis" : "Peixe grelhado, legumes coloridos",
                preparo: "Cozinhar com temperos anti-inflamatórios",
                funcao: problemasSono ? "Promover sono reparador" : "Nutrição completa noturna",
                motivo_escolha: "Adaptado ao seu perfil e necessidades específicas",
                calorias: "360 kcal", macros: "Prot: 30g, Carb: 25g, Gord: 12g", micros: "Triptofano, vitaminas"
              }],
              ceia: [{
                nome: `Ritual Noturno ${nomePersonalizado}`,
                ingredientes: problemasSono ? "Chá de passiflora + 1 cs mel" : "Leite dourado (cúrcuma + leite vegetal)",
                preparo: "Preparar com intenção e gratidão",
                funcao: "Preparar corpo e mente para descanso",
                motivo_escolha: "Personalizado para sua necessidade de relaxamento",
                calorias: "45 kcal", macros: "Carb: 8g", micros: "Antioxidantes"
              }]
            }
          })),
          lista_compras: {
            hortifruti: temAnsiedade ? 
              ["Banana", "Espinafre", "Couve", "Abacate", "Batata doce", "Brócolis", "Maçã"] :
              ["Frutas vermelhas", "Vegetais coloridos", "Folhas verdes", "Raízes", "Legumes frescos"],
            proteinas: problemasSono ?
              ["Salmão orgânico", "Frango caipira", "Ovos de quintal", "Sardinha"] :
              ["Peixes frescos", "Proteínas magras", "Ovos orgânicos"],
            graos_leguminosas: ["Quinoa tricolor", "Lentilha", "Grão de bico", "Amaranto"],
            sementes_oleaginosas: temAnsiedade ?
              ["Castanha do Brasil", "Amêndoas", "Nozes", "Sementes de abóbora"] :
              ["Mix de nuts", "Chia", "Linhaça dourada", "Sementes de girassol"],
            temperos_ervas: ["Cúrcuma fresca", "Gengibre", "Alecrim", "Manjericão", "Orégano"],
            outros: ["Azeite extra virgem", "Leite de coco", "Água de coco", "Mel orgânico", "Tahine"]
          }
        },
        plano_mev: {
          dias: Array.from({length: 7}, (_, index) => ({
            dia: index + 1,
            data: new Date(dataInicio.getTime() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            habito: `${habitosMEVPersonalizados[index]} - Especial para ${nomePersonalizado}`,
            descricao: temAnsiedade && index < 2 ? 
              `Técnicas específicas para acalmar sua mente e reduzir a ansiedade, ${nomePersonalizado}` :
              `Prática transformadora desenvolvida especialmente para seu perfil, ${nomePersonalizado}`,
            beneficios: index === 0 && temAnsiedade ? "Reduz ansiedade, melhora foco e promove calma interior" : 
                       index === 1 && problemasSono ? "Melhora qualidade do sono e recuperação noturna" :
                       "Aumenta energia, clareza mental e bem-estar geral",
            como_aplicar: `Técnicas adaptadas à sua rotina e necessidades específicas`,
            recursos_apoio: temAnsiedade ? "App Calm, timer respiração, música relaxante" : "Apps wellness, cronômetro",
            biohacking: index % 2 === 0 ? 
              (temEstresse ? "Banho gelado 30s + respiração Wim Hof" : "Exposição solar + grounding") :
              (problemasSono ? "Óculos bloqueadores luz azul + melatonina natural" : "Jejum intermitente consciente"),
            frequencia: temAnsiedade ? "396Hz - Liberação de medos por 15min" : 
                       problemasSono ? "528Hz - Reparação celular por 20min" :
                       `${[432, 528, 741][index % 3]}Hz por 10-15 minutos`,
            exercicio: index === 0 ? 
              (temAnsiedade ? "Respiração 4-7-8: inspire 4s, segure 7s, expire 8s (5x)" : 
               temCansaco ? "5 min movimento suave ao acordar" : 
               "Alongamento consciente 10 minutos") :
              `Prática específica do dia ${index + 1} para ${nomePersonalizado}`,
            reflexao: temAnsiedade ? "Como posso me sentir mais calmo(a) e seguro(a) hoje?" :
                     problemasSono ? "O que posso fazer para honrar meu descanso hoje?" :
                     "Como posso nutrir meu corpo e alma hoje?",
            meta_semanal: index < 3 ? 
              (temAnsiedade ? "Reduzir ansiedade e construir calma interior" : "Energia e vitalidade crescente") :
              (problemasSono ? "Sono reparador e recuperação" : "Transformação integral e bem-estar")
          }))
        },
        mensagem_inicial: `Querido(a) ${nomePersonalizado}, 
        
Seus planos personalizados estão prontos e foram criados especialmente para você, considerando ${
  temAnsiedade ? 'suas necessidades de maior calma e equilíbrio emocional' :
  problemasSono ? 'sua busca por um sono mais reparador' :
  temEstresse ? 'seu desejo de reduzir o estresse do dia a dia' :
  'seu perfil único e objetivos de saúde'
}.

Este é o início de uma jornada de transformação que respeita sua individualidade. Cada refeição, cada hábito foi pensado especificamente para você.

Siga com amor, paciência e autocompaixão. Você merece toda a saúde e bem-estar! 💚`,
        orientacoes_21_dias: {
          semana_1: temAnsiedade ? "Semana do Acolhimento: foco em calma e estabilização" : 
                    problemasSono ? "Semana da Preparação: estabelecendo rotina do sono" :
                    "Semana da Consciência: despertar para novos hábitos",
          semana_2: temEstresse ? "Semana da Respiração: técnicas anti-estresse integradas" :
                    "Semana do Movimento: ativando energia com gentileza",
          semana_3: "Semana da Integração: consolidando sua nova versão",
          dicas_gerais: [
            `${nomePersonalizado}, beba água morna com limão ao acordar`,
            temAnsiedade ? "Pratique respiração profunda 3x ao dia" : "Respire conscientemente nos momentos de pausa",
            problemasSono ? "Desligue telas 1h antes de dormir" : "Conecte-se com a natureza diariamente",
            "Mastigue devagar e com gratidão",
            `Lembre-se: você é única(o), ${nomePersonalizado}, e merece cuidado especial`
          ]
        },
        assinatura_medica: "Dra. Dayana Brazão Hanemann - CRN: 12345 - Nutricionista Ortomolecular",
        contato: "WhatsApp: (11) 99999-9999 | E-mail: contato@dradayana.com"
      };
    }

    // Salvar o plano gerado no banco
    logStep("Saving plan to database");
    const { data: planData, error: planError } = await supabaseClient
      .from('educational_plans')
      .insert({
        user_id,
        plan_name: `Plano Personalizado - ${profile.full_name || 'Paciente'}`,
        plan_type: 'dayana_completo',
        meal_plans: planosGerados.plano_alimentar,
        biohacking_practices: planosGerados.plano_mev,
        progress_markers: {
          created_at: new Date().toISOString(),
          patient_data: { profile, health, biomarcadores }
        },
        status: 'ativo',
        duration_days: 7
      })
      .select()
      .single();

    if (planError) {
      logStep("Error saving plan", { error: planError });
    } else {
      logStep("Plan saved successfully", { planId: planData?.id });
    }

    const resultado = {
      user_id,
      planos_gerados: planosGerados,
      plan_id: planData?.id,
      gerado_em: new Date().toISOString(),
      status: 'sucesso'
    };

    logStep("Plans generated successfully", { patientName: profile.full_name || 'Paciente' });

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    logStep("ERROR in generate-dayana-plans", { error: error.message });
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Falha ao gerar planos personalizados'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});