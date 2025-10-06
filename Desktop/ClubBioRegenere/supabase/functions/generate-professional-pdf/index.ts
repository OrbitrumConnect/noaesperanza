import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planos, patient_name } = await req.json();
    
    console.log('Gerando PDF profissional para:', patient_name);

    // Gerar HTML limpo e profissional
    const htmlContent = generateCleanHTML(planos, patient_name);
    
    // Simular geração de PDF (em produção usar Puppeteer/Playwright)
    const pdfBuffer = await generatePDFFromHTML(htmlContent);
    
    return new Response(JSON.stringify({
      success: true,
      pdf_content: pdfBuffer,
      filename: `plano-${patient_name}-${new Date().toISOString().split('T')[0]}.pdf`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Erro na geração do PDF profissional'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateCleanHTML(planos: any, patientName: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${planos.titulo_plano || 'Plano Personalizado'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
        }
        .header {
            background: linear-gradient(135deg, #4f46e5, #06b6d4);
            color: white;
            padding: 30px;
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 { font-size: 28px; margin-bottom: 10px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .content { 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 0 20px;
        }
        .section {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 5px solid #4f46e5;
        }
        .section h2 {
            color: #4f46e5;
            font-size: 22px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .day-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .day-card h3 {
            color: #1e293b;
            font-size: 18px;
            margin-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 10px;
        }
        .meal-option {
            background: #f1f5f9;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .meal-option h4 {
            color: #475569;
            font-size: 16px;
            margin-bottom: 10px;
        }
        .meal-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            font-size: 14px;
        }
        .detail-item {
            background: white;
            padding: 10px;
            border-radius: 4px;
        }
        .detail-item strong {
            color: #374151;
            display: block;
            margin-bottom: 5px;
        }
        .quote {
            background: linear-gradient(135deg, #fef3c7, #fbbf24);
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
            font-style: italic;
            text-align: center;
            color: #92400e;
        }
        .biohacking {
            background: linear-gradient(135deg, #d1fae5, #10b981);
            color: #064e3b;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .frequency {
            background: linear-gradient(135deg, #e0e7ff, #6366f1);
            color: #312e81;
            border-radius: 8px;
            padding: 15px;
            margin: 15px 0;
        }
        .shopping-list {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }
        .shopping-category {
            background: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .shopping-category h4 {
            color: #4f46e5;
            margin-bottom: 10px;
            text-transform: capitalize;
        }
        .shopping-category ul {
            list-style: none;
        }
        .shopping-category li {
            padding: 5px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .shopping-category li:before {
            content: "✓ ";
            color: #10b981;
            font-weight: bold;
        }
        .footer {
            background: #1f2937;
            color: white;
            padding: 30px;
            text-align: center;
            margin-top: 50px;
        }
        .footer h3 { margin-bottom: 10px; }
        .footer p { opacity: 0.8; }
        @media print {
            .header { break-inside: avoid; }
            .section { break-inside: avoid; page-break-inside: avoid; }
            .day-card { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${planos.titulo_plano || 'Plano Personalizado'}</h1>
        <p>${planos.subtitulo || 'Alimentação Funcional + MEV'}</p>
        <p><strong>Paciente:</strong> ${patientName}</p>
        <p><strong>Período:</strong> ${planos.data_inicio || ''} a ${planos.data_fim || ''}</p>
    </div>

    <div class="content">
        ${planos.mensagem_inicial ? `
        <div class="section">
            <h2>💝 Mensagem da Dra. Dayana</h2>
            <div class="quote">${planos.mensagem_inicial}</div>
        </div>
        ` : ''}

        <div class="section">
            <h2>🥗 Plano Alimentar Funcional</h2>
            ${generateMealPlanHTML(planos.plano_alimentar)}
        </div>

        <div class="section">
            <h2>🌟 Plano MEV - Mudança de Estilo de Vida</h2>
            ${generateMEVPlanHTML(planos.plano_mev)}
        </div>

        ${planos.plano_alimentar?.lista_compras ? `
        <div class="section">
            <h2>🛒 Lista de Compras Semanal</h2>
            <div class="shopping-list">
                ${generateShoppingListHTML(planos.plano_alimentar.lista_compras)}
            </div>
        </div>
        ` : ''}

        ${planos.orientacoes_21_dias ? `
        <div class="section">
            <h2>📅 Orientações para os Próximos 21 Dias</h2>
            ${generateOrientationsHTML(planos.orientacoes_21_dias)}
        </div>
        ` : ''}
    </div>

    <div class="footer">
        <h3>${planos.assinatura_medica || 'Dra. Dayana Brazão Hanemann'}</h3>
        <p>${planos.contato || 'Contato: WhatsApp (XX) XXXXX-XXXX'}</p>
        <p>Documento gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
</body>
</html>`;
}

function generateMealPlanHTML(planoAlimentar: any): string {
  if (!planoAlimentar?.dias) return '<p>Plano alimentar não disponível</p>';
  
  return planoAlimentar.dias.map((dia: any) => `
    <div class="day-card">
        <h3>Dia ${dia.dia} - ${dia.data || ''}</h3>
        
        ${dia.frase_positiva ? `<div class="quote">"${dia.frase_positiva}"</div>` : ''}
        
        ${dia.biohacking_dia ? `<div class="biohacking"><strong>💪 Biohacking:</strong> ${dia.biohacking_dia}</div>` : ''}
        
        ${dia.frequencia_quantica ? `<div class="frequency"><strong>🎵 Frequência:</strong> ${dia.frequencia_quantica}</div>` : ''}
        
        ${dia.refeicoes ? generateMealsHTML(dia.refeicoes) : ''}
    </div>
  `).join('');
}

function generateMealsHTML(refeicoes: any): string {
  const mealNames: { [key: string]: string } = {
    cafe_manha: '☕ Café da Manhã',
    almoco: '🍽️ Almoço', 
    lanche_tarde: '🍎 Lanche da Tarde',
    jantar: '🌙 Jantar',
    ceia: '🌜 Ceia'
  };

  return Object.entries(refeicoes).map(([meal, options]: [string, any]) => `
    <div style="margin: 20px 0;">
        <h4>${mealNames[meal] || meal}</h4>
        ${Array.isArray(options) ? options.map((option: any, index: number) => `
            <div class="meal-option">
                <h4>Opção ${index + 1}: ${option.nome || 'Sem nome'}</h4>
                <div class="meal-details">
                    ${option.ingredientes ? `<div class="detail-item"><strong>Ingredientes:</strong> ${option.ingredientes}</div>` : ''}
                    ${option.preparo ? `<div class="detail-item"><strong>Preparo:</strong> ${option.preparo}</div>` : ''}
                    ${option.funcao ? `<div class="detail-item"><strong>Função:</strong> ${option.funcao}</div>` : ''}
                    ${option.motivo_escolha ? `<div class="detail-item"><strong>Por que é ideal:</strong> ${option.motivo_escolha}</div>` : ''}
                    ${option.calorias ? `<div class="detail-item"><strong>Calorias:</strong> ${option.calorias}</div>` : ''}
                    ${option.macros ? `<div class="detail-item"><strong>Macros:</strong> ${option.macros}</div>` : ''}
                </div>
            </div>
        `).join('') : '<p>Opções não disponíveis</p>'}
    </div>
  `).join('');
}

function generateMEVPlanHTML(planoMEV: any): string {
  if (!planoMEV?.dias) return '<p>Plano MEV não disponível</p>';
  
  return planoMEV.dias.map((dia: any) => `
    <div class="day-card">
        <h3>Dia ${dia.dia}: ${dia.habito || 'Hábito do Dia'}</h3>
        ${dia.descricao ? `<p><strong>Descrição:</strong> ${dia.descricao}</p><br>` : ''}
        ${dia.beneficios ? `<p><strong>✨ Benefícios:</strong> ${dia.beneficios}</p><br>` : ''}
        ${dia.como_aplicar ? `<p><strong>📋 Como aplicar:</strong> ${dia.como_aplicar}</p><br>` : ''}
        ${dia.biohacking ? `<div class="biohacking"><strong>💪 Biohacking:</strong> ${dia.biohacking}</div>` : ''}
        ${dia.frequencia ? `<div class="frequency"><strong>🎵 Frequência:</strong> ${dia.frequencia}</div>` : ''}
        ${dia.reflexao ? `<div class="quote">"${dia.reflexao}"</div>` : ''}
    </div>
  `).join('');
}

function generateShoppingListHTML(listaCompras: any): string {
  return Object.entries(listaCompras).map(([categoria, itens]: [string, any]) => `
    <div class="shopping-category">
        <h4>${categoria.replace('_', ' ')}</h4>
        <ul>
            ${Array.isArray(itens) ? itens.map((item: string) => `<li>${item}</li>`).join('') : '<li>Nenhum item</li>'}
        </ul>
    </div>
  `).join('');
}

function generateOrientationsHTML(orientacoes: any): string {
  if (typeof orientacoes === 'string') {
    return `<p>${orientacoes}</p>`;
  }
  
  return `
    ${orientacoes.semana_1 ? `<p><strong>Semana 1:</strong> ${orientacoes.semana_1}</p>` : ''}
    ${orientacoes.semana_2 ? `<p><strong>Semana 2:</strong> ${orientacoes.semana_2}</p>` : ''}
    ${orientacoes.semana_3 ? `<p><strong>Semana 3:</strong> ${orientacoes.semana_3}</p>` : ''}
    ${orientacoes.dicas_gerais ? `
      <div style="margin-top: 20px;">
        <strong>Dicas Gerais:</strong>
        <ul>
          ${orientacoes.dicas_gerais.map((dica: string) => `<li>${dica}</li>`).join('')}
        </ul>
      </div>
    ` : ''}
  `;
}

async function generatePDFFromHTML(html: string): Promise<string> {
  // Em produção, usar Puppeteer ou similar
  // Por agora, retornar o HTML como base64
  return btoa(unescape(encodeURIComponent(html)));
}