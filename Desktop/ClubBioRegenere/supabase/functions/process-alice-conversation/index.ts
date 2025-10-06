import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id, conversation_messages } = await req.json();

    if (!user_id || !conversation_messages) {
      throw new Error('user_id e conversation_messages são obrigatórios');
    }

    console.log(`Processando conversa para usuário: ${user_id}`);

    // Preparar contexto da conversa para a IA
    const conversationText = conversation_messages
      .map((msg: any) => `${msg.message_type}: ${msg.message_content}`)
      .join('\n');

    // Usar GPT para extrair dados estruturados da conversa
    const extractionPrompt = `
Analise esta conversa entre Alice (IA de saúde) e um paciente e extraia dados estruturados.
Retorne APENAS um JSON válido com os dados encontrados ou null se não houver dados suficientes.

Conversa:
${conversationText}

Extraia os seguintes dados quando mencionados:
{
  "dados_pessoais": {
    "idade": number | null,
    "peso": number | null,
    "altura": number | null,
    "sexo": "masculino" | "feminino" | null
  },
  "habitos_saude": {
    "horas_sono": number | null,
    "qualidade_sono": number | null (1-10),
    "nivel_atividade": "sedentario" | "leve" | "moderado" | "intenso" | null,
    "tabagismo": boolean | null,
    "alcool": "nunca" | "social" | "regular" | "excessivo" | null
  },
  "sintomas_bem_estar": {
    "nivel_estresse": number | null (1-10),
    "nivel_ansiedade": number | null (1-10),
    "nivel_energia": number | null (1-10),
    "humor_geral": number | null (1-10),
    "satisfacao_vida": number | null (1-10)
  },
  "objetivos": [
    "perda_peso" | "ganho_massa" | "mais_energia" | "melhor_sono" | "reduzir_estresse" | "saude_geral"
  ],
  "condicoes_medicas": string[] | null,
  "medicamentos": string[] | null,
  "alergias": string[] | null
}

Responda APENAS com o JSON, sem explicações adicionais.
`;

    if (!openAIApiKey) {
      throw new Error('OpenAI API key não configurada');
    }

    // Chamar OpenAI para extrair dados
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Você é um especialista em extrair dados médicos estruturados de conversas. Retorne apenas JSON válido.' },
          { role: 'user', content: extractionPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    const openAIData = await openAIResponse.json();
    console.log('Resposta da OpenAI:', openAIData);

    if (!openAIData.choices || !openAIData.choices[0]) {
      throw new Error('Erro na resposta da OpenAI');
    }

    let dadosExtraidos;
    try {
      dadosExtraidos = JSON.parse(openAIData.choices[0].message.content);
    } catch (e) {
      console.log('Erro ao fazer parse do JSON da IA, usando dados padrão');
      dadosExtraidos = null;
    }

    console.log('Dados extraídos:', dadosExtraidos);

    let biomarcadoresAtualizados = false;
    let perfilAtualizado = false;

    if (dadosExtraidos) {
      // Atualizar perfil do usuário
      if (dadosExtraidos.dados_pessoais) {
        const { error: profileError } = await supabaseClient
          .from('profiles')
          .update({
            weight: dadosExtraidos.dados_pessoais.peso,
            height: dadosExtraidos.dados_pessoais.altura,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user_id);

        if (!profileError) {
          perfilAtualizado = true;
          console.log('Perfil atualizado com sucesso');
        }
      }

      // Criar/atualizar biomarcadores iSAFE
      const biomarcadorData: any = {
        user_id,
        assessment_date: new Date().toISOString().split('T')[0],
      };

      // Mapear dados extraídos para biomarcadores
      if (dadosExtraidos.dados_pessoais?.peso && dadosExtraidos.dados_pessoais?.altura) {
        const altura_m = dadosExtraidos.dados_pessoais.altura / 100;
        biomarcadorData.imc = dadosExtraidos.dados_pessoais.peso / (altura_m * altura_m);
      }

      if (dadosExtraidos.habitos_saude?.qualidade_sono) {
        biomarcadorData.qualidade_sono = dadosExtraidos.habitos_saude.qualidade_sono;
      }

      if (dadosExtraidos.sintomas_bem_estar?.nivel_estresse) {
        biomarcadorData.estresse = dadosExtraidos.sintomas_bem_estar.nivel_estresse;
      }

      if (dadosExtraidos.sintomas_bem_estar?.nivel_ansiedade) {
        biomarcadorData.nivel_ansiedade = dadosExtraidos.sintomas_bem_estar.nivel_ansiedade;
      }

      if (dadosExtraidos.sintomas_bem_estar?.nivel_energia) {
        biomarcadorData.vitalidade = dadosExtraidos.sintomas_bem_estar.nivel_energia;
      }

      if (dadosExtraidos.sintomas_bem_estar?.satisfacao_vida) {
        biomarcadorData.satisfacao_vida = dadosExtraidos.sintomas_bem_estar.satisfacao_vida;
      }

      if (dadosExtraidos.sintomas_bem_estar?.humor_geral) {
        biomarcadorData.saude_geral = dadosExtraidos.sintomas_bem_estar.humor_geral;
      }

      // Inserir ou atualizar biomarcadores
      if (Object.keys(biomarcadorData).length > 2) { // Mais que user_id e assessment_date
        const { error: bioError } = await supabaseClient
          .from('biomarcadores_isafe')
          .upsert(biomarcadorData, {
            onConflict: 'user_id,assessment_date'
          });

        if (!bioError) {
          biomarcadoresAtualizados = true;
          console.log('Biomarcadores atualizados com sucesso');
        } else {
          console.error('Erro ao atualizar biomarcadores:', bioError);
        }
      }

      // Atualizar health_profiles
      if (dadosExtraidos.condicoes_medicas || dadosExtraidos.medicamentos || dadosExtraidos.alergias) {
        const healthData: any = {};
        
        if (dadosExtraidos.condicoes_medicas) {
          healthData.medical_conditions = dadosExtraidos.condicoes_medicas;
        }
        if (dadosExtraidos.medicamentos) {
          healthData.current_medications = dadosExtraidos.medicamentos;
        }
        if (dadosExtraidos.alergias) {
          healthData.allergies = dadosExtraidos.alergias;
        }
        if (dadosExtraidos.sintomas_bem_estar?.nivel_estresse) {
          healthData.stress_level = dadosExtraidos.sintomas_bem_estar.nivel_estresse;
        }
        if (dadosExtraidos.habitos_saude?.horas_sono) {
          healthData.sleep_hours = dadosExtraidos.habitos_saude.horas_sono;
        }

        if (Object.keys(healthData).length > 0) {
          healthData.updated_at = new Date().toISOString();
          
          const { error: healthError } = await supabaseClient
            .from('health_profiles')
            .upsert({
              user_id,
              ...healthData
            }, {
              onConflict: 'user_id'
            });

          if (healthError) {
            console.error('Erro ao atualizar health_profiles:', healthError);
          } else {
            console.log('Health profile atualizado com sucesso');
          }
        }
      }
    }

    // Calcular score iSAFE atualizado se biomarcadores foram atualizados
    let novoScore = null;
    if (biomarcadoresAtualizados) {
      try {
        const scoreResponse = await supabaseClient.functions.invoke('calculate-isafe-score', {
          body: { user_id }
        });
        
        if (scoreResponse.data) {
          novoScore = scoreResponse.data;
          console.log('Score iSAFE recalculado:', novoScore);
        }
      } catch (scoreError) {
        console.error('Erro ao recalcular score:', scoreError);
      }
    }

    const resultado = {
      user_id,
      dados_extraidos: dadosExtraidos,
      perfil_atualizado: perfilAtualizado,
      biomarcadores_atualizados: biomarcadoresAtualizados,
      novo_score: novoScore,
      processado_em: new Date().toISOString()
    };

    console.log('Processamento concluído:', resultado);

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função process-alice-conversation:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erro ao processar conversa'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});