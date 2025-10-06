import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[GENERATE-PDF] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    const { planos, patient_name } = await req.json();
    
    if (!planos || !patient_name) {
      throw new Error("Dados obrigatórios não fornecidos");
    }

    logStep("Generating PDF HTML", { patient_name });

    const html = generateCleanHTML(planos, patient_name);
    const pdfContent = await generatePDFFromHTML(html);
    
    logStep("PDF generated successfully");

    return new Response(JSON.stringify({
      success: true,
      pdf: pdfContent,
      filename: `plano_${patient_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in generate-meal-plan-pdf", { message: errorMessage });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
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
    <title>Plano Personalizado - ${patientName}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #1a1a1a;
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 20px;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 40px;
            padding: 30px;
            background: #f8fafc;
            border-radius: 12px;
            border-left: 4px solid #667eea;
        }
        
        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }
        
        .section-title::before {
            content: "●";
            margin-right: 10px;
            font-size: 1.2em;
        }
        
        .meal-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .meal-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        
        .meal-title {
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .habit-item {
            background: white;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 3px solid #48bb78;
        }
        
        .habit-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 5px;
        }
        
        .shopping-category {
            margin-bottom: 20px;
        }
        
        .shopping-title {
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 10px;
            padding: 10px;
            background: #e2e8f0;
            border-radius: 6px;
        }
        
        .shopping-items {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 10px;
            padding-left: 20px;
        }
        
        .shopping-item {
            padding: 8px 12px;
            background: white;
            border-radius: 4px;
            border: 1px solid #e2e8f0;
        }
        
        .footer {
            background: #2d3748;
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .footer p {
            margin-bottom: 10px;
        }
        
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Plano Personalizado</h1>
            <p>Desenvolvido especialmente para ${patientName}</p>
            <p>Data: ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        
        <div class="content">
            ${planos.planoAlimentar ? generateMealPlanHTML(planos.planoAlimentar) : ''}
            ${planos.planoMEV ? generateMEVPlanHTML(planos.planoMEV) : ''}
            ${planos.listaCompras ? generateShoppingListHTML(planos.listaCompras) : ''}
            ${planos.orientacoes ? generateOrientationsHTML(planos.orientacoes) : ''}
        </div>
        
        <div class="footer">
            <p><strong>Dra. Dayana Brazão</strong></p>
            <p>Nutricionista Funcional & Ortomolecular</p>
            <p>Este plano foi desenvolvido especificamente para você. Siga as orientações e consulte sempre que necessário.</p>
        </div>
    </div>
</body>
</html>`;
}

function generateMealPlanHTML(planoAlimentar: any): string {
  if (!planoAlimentar) return '';
  
  return `
    <div class="section">
        <h2 class="section-title">Plano Alimentar</h2>
        ${planoAlimentar.dias ? Object.entries(planoAlimentar.dias).map(([dia, refeicoes]: [string, any]) => `
            <div class="meal-card">
                <h3 class="meal-title">${dia}</h3>
                ${generateMealsHTML(refeicoes)}
            </div>
        `).join('') : ''}
    </div>
  `;
}

function generateMealsHTML(refeicoes: any): string {
  if (!refeicoes) return '';
  
  return Object.entries(refeicoes).map(([refeicao, dados]: [string, any]) => `
    <div style="margin-bottom: 15px;">
        <strong>${refeicao}:</strong>
        ${Array.isArray(dados) ? dados.map((item: any) => `
            <div style="margin-left: 15px; margin-top: 5px;">
                <strong>${item.nome || item.title || 'Item'}</strong>
                ${item.ingredientes ? `<br><em>Ingredientes:</em> ${item.ingredientes}` : ''}
                ${item.preparo ? `<br><em>Preparo:</em> ${item.preparo}` : ''}
                ${item.funcao ? `<br><em>Função:</em> ${item.funcao}` : ''}
            </div>
        `).join('') : `<div style="margin-left: 15px;">${dados}</div>`}
    </div>
  `).join('');
}

function generateMEVPlanHTML(planoMEV: any): string {
  if (!planoMEV || !planoMEV.habitos) return '';
  
  return `
    <div class="section">
        <h2 class="section-title">Plano de Mudança do Estilo de Vida (MEV)</h2>
        ${planoMEV.habitos.map((habito: any) => `
            <div class="habit-item">
                <div class="habit-title">${habito.nome || habito.title || 'Hábito'}</div>
                <p><strong>Descrição:</strong> ${habito.descricao || habito.description || ''}</p>
                ${habito.beneficios ? `<p><strong>Benefícios:</strong> ${habito.beneficios}</p>` : ''}
                ${habito.frequencia ? `<p><strong>Frequência:</strong> ${habito.frequencia}</p>` : ''}
            </div>
        `).join('')}
    </div>
  `;
}

function generateShoppingListHTML(listaCompras: any): string {
  if (!listaCompras) return '';
  
  return `
    <div class="section">
        <h2 class="section-title">Lista de Compras</h2>
        ${Object.entries(listaCompras).map(([categoria, items]: [string, any]) => `
            <div class="shopping-category">
                <div class="shopping-title">${categoria}</div>
                <div class="shopping-items">
                    ${Array.isArray(items) ? items.map((item: string) => `
                        <div class="shopping-item">${item}</div>
                    `).join('') : `<div class="shopping-item">${items}</div>`}
                </div>
            </div>
        `).join('')}
    </div>
  `;
}

function generateOrientationsHTML(orientacoes: any): string {
  if (!orientacoes) return '';
  
  return `
    <div class="section">
        <h2 class="section-title">Orientações Gerais</h2>
        ${Array.isArray(orientacoes) ? orientacoes.map((orientacao: string) => `
            <div class="habit-item">
                <p>${orientacao}</p>
            </div>
        `).join('') : `<div class="habit-item"><p>${orientacoes}</p></div>`}
    </div>
  `;
}

async function generatePDFFromHTML(html: string): Promise<string> {
  // Em produção, usar uma biblioteca como Puppeteer
  // Por enquanto, retornamos o HTML como base64
  return btoa(unescape(encodeURIComponent(html)));
}