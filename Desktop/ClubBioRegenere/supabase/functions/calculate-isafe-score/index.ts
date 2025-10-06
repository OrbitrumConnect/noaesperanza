import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BiomarcadorData {
  id: string;
  user_id: string;
  assessment_date: string;
  imc?: number;
  percentual_gordura?: number;
  percentual_massa_muscular?: number;
  gordura_visceral?: number;
  vo2?: number;
  circunferencia_cintura?: number;
  razao_cintura_quadril?: number;
  preensao_manual_direita?: number;
  preensao_manual_esquerda?: number;
  escala_bristol?: number;
  qualidade_sono?: number;
  nivel_ansiedade?: number;
  estresse?: number;
  saude_geral?: number;
  vitalidade?: number;
  satisfacao_vida?: number;
  coeficiente_garra?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error('user_id é obrigatório');
    }

    console.log(`Calculando score iSAFE para usuário: ${user_id}`);

    // Buscar biomarcadores mais recentes do usuário
    const { data: biomarcadores, error: bioError } = await supabaseClient
      .from('biomarcadores_isafe')
      .select('*')
      .eq('user_id', user_id)
      .order('assessment_date', { ascending: false })
      .limit(1)
      .single();

    if (bioError && bioError.code !== 'PGRST116') {
      console.error('Erro ao buscar biomarcadores:', bioError);
      throw new Error('Erro ao buscar biomarcadores');
    }

    let calculatedScore = 5.0; // Score base
    let zona = 'Atenção';
    let recomendacoes: string[] = [];

    if (biomarcadores) {
      console.log('Biomarcadores encontrados:', biomarcadores);
      
      // CÁLCULO REAL DO SCORE iSAFE baseado em múltiplos fatores
      let totalScore = 0;
      let factorsCount = 0;

      // 1. IMC (peso: 15%)
      if (biomarcadores.imc) {
        let imcScore = 0;
        if (biomarcadores.imc >= 18.5 && biomarcadores.imc <= 24.9) {
          imcScore = 10; // Ideal
        } else if (biomarcadores.imc >= 25 && biomarcadores.imc <= 29.9) {
          imcScore = 7; // Sobrepeso
          recomendacoes.push('Reduzir peso corporal gradualmente');
        } else if (biomarcadores.imc >= 30) {
          imcScore = 4; // Obesidade
          recomendacoes.push('Perda de peso é prioritária para a saúde');
        } else {
          imcScore = 6; // Abaixo do peso
          recomendacoes.push('Ganho de peso saudável é recomendado');
        }
        totalScore += imcScore * 0.15;
        factorsCount++;
      }

      // 2. Percentual de Gordura (peso: 15%)
      if (biomarcadores.percentual_gordura) {
        let gorduraScore = 0;
        // Homens: <15% (8), 15-20% (10), 21-25% (7), >25% (4)
        // Mulheres: <20% (8), 20-25% (10), 26-30% (7), >30% (4)
        // Assumindo valor médio para simplificar
        if (biomarcadores.percentual_gordura <= 22) {
          gorduraScore = 10;
        } else if (biomarcadores.percentual_gordura <= 27) {
          gorduraScore = 7;
          recomendacoes.push('Reduzir percentual de gordura corporal');
        } else {
          gorduraScore = 4;
          recomendacoes.push('Percentual de gordura elevado - focar em exercícios');
        }
        totalScore += gorduraScore * 0.15;
        factorsCount++;
      }

      // 3. VO2 (peso: 10%)
      if (biomarcadores.vo2) {
        let vo2Score = 0;
        if (biomarcadores.vo2 >= 45) {
          vo2Score = 10; // Excelente
        } else if (biomarcadores.vo2 >= 35) {
          vo2Score = 8; // Bom
        } else if (biomarcadores.vo2 >= 25) {
          vo2Score = 6; // Regular
          recomendacoes.push('Melhorar condicionamento cardiovascular');
        } else {
          vo2Score = 3; // Ruim
          recomendacoes.push('Condicionamento cardiovascular crítico');
        }
        totalScore += vo2Score * 0.10;
        factorsCount++;
      }

      // 4. Qualidade do Sono (peso: 15%)
      if (biomarcadores.qualidade_sono) {
        let sonoScore = 0;
        if (biomarcadores.qualidade_sono >= 8) {
          sonoScore = 10;
        } else if (biomarcadores.qualidade_sono >= 6) {
          sonoScore = 7;
          recomendacoes.push('Melhorar higiene do sono');
        } else {
          sonoScore = 4;
          recomendacoes.push('Qualidade do sono precisa de atenção urgente');
        }
        totalScore += sonoScore * 0.15;
        factorsCount++;
      }

      // 5. Níveis de Estresse (peso: 15%)
      if (biomarcadores.estresse) {
        let estresseScore = 0;
        if (biomarcadores.estresse <= 3) {
          estresseScore = 10; // Baixo estresse
        } else if (biomarcadores.estresse <= 6) {
          estresseScore = 7; // Moderado
          recomendacoes.push('Implementar técnicas de relaxamento');
        } else {
          estresseScore = 3; // Alto estresse
          recomendacoes.push('Estresse elevado - prioritário reduzir');
        }
        totalScore += estresseScore * 0.15;
        factorsCount++;
      }

      // 6. Saúde Geral (peso: 10%)
      if (biomarcadores.saude_geral) {
        let saudeScore = biomarcadores.saude_geral; // Escala de 1-10
        totalScore += saudeScore * 0.10;
        factorsCount++;
      }

      // 7. Vitalidade (peso: 10%)
      if (biomarcadores.vitalidade) {
        let vitalidadeScore = biomarcadores.vitalidade;
        if (vitalidadeScore < 6) {
          recomendacoes.push('Aumentar energia e vitalidade');
        }
        totalScore += vitalidadeScore * 0.10;
        factorsCount++;
      }

      // 8. Satisfação com a Vida (peso: 10%)
      if (biomarcadores.satisfacao_vida) {
        let satisfacaoScore = biomarcadores.satisfacao_vida;
        if (satisfacaoScore < 7) {
          recomendacoes.push('Focar no bem-estar emocional');
        }
        totalScore += satisfacaoScore * 0.10;
        factorsCount++;
      }

      // Calcular score final
      if (factorsCount > 0) {
        calculatedScore = Math.round((totalScore / factorsCount) * 100) / 100;
      }

      // Determinar zona
      if (calculatedScore >= 8.0) {
        zona = 'Verde';
      } else if (calculatedScore >= 6.0) {
        zona = 'Amarela';
      } else {
        zona = 'Vermelha';
      }

      console.log(`Score calculado: ${calculatedScore}, Zona: ${zona}`);

      // Atualizar o score na tabela biomarcadores
      const { error: updateError } = await supabaseClient
        .from('biomarcadores_isafe')
        .update({ 
          isafe_score: calculatedScore,
          isafe_zona: zona
        })
        .eq('id', biomarcadores.id);

      if (updateError) {
        console.error('Erro ao atualizar score:', updateError);
      }

    } else {
      console.log('Nenhum biomarcador encontrado, usando valores padrão');
      recomendacoes = [
        'Complete sua avaliação inicial com Alice',
        'Forneça seus dados de saúde para cálculo preciso',
        'Agende consulta para avaliação completa'
      ];
    }

    const resultado = {
      user_id,
      isafe_score: calculatedScore,
      isafe_zona: zona,
      recomendacoes,
      data_calculo: new Date().toISOString(),
      tem_biomarcadores: !!biomarcadores
    };

    console.log('Resultado final:', resultado);

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função calculate-isafe-score:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erro ao calcular score iSAFE'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});