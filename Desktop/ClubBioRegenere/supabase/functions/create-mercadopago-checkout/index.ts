import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MP-FINAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("NOVA VERSÃO FINAL iniciada");

    // Check env vars in detail
    const allEnvs = Object.keys(Deno.env.toObject());
    logStep("Env vars disponíveis", allEnvs);
    
    // Get token with retry logic
    let mercadoPagoToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    
    // If not found, try alternative names
    if (!mercadoPagoToken) {
      mercadoPagoToken = Deno.env.get("MERCADOPAGO_ACCESS_TOKEN");
    }
    
    logStep("Token check detalhado", { 
      fromMERCADO_PAGO: !!Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN"),
      fromMERCADOPAGO: !!Deno.env.get("MERCADOPAGO_ACCESS_TOKEN"),
      finalToken: !!mercadoPagoToken,
      tokenLength: mercadoPagoToken?.length || 0,
      tokenStart: mercadoPagoToken?.substring(0, 25) || "VAZIO"
    });

    if (!mercadoPagoToken) {
      logStep("ERRO: Token MP não encontrado");
      throw new Error("MERCADO_PAGO_ACCESS_TOKEN não está configurado");
    }

    logStep("Token MP validado", { 
      length: mercadoPagoToken.length, 
      prefix: mercadoPagoToken.substring(0, 25),
      isValidFormat: mercadoPagoToken.startsWith('APP_USR-')
    });

    // Auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");
    
    logStep("User autenticado", { userId: user.id, email: user.email });

    // Parse request
    const requestBody = await req.json();
    const { planType } = requestBody;
    logStep("Plano solicitado", { planType });

    // Plan details  
    const planDetails = {
      'club-digital': {
        title: "Clube Digital BioRegenere",
        price: 297.00,
        description: "Acesso completo aos planos personalizados da Dra. Dayana - Assinatura Mensal"
      },
      'consulta-completa': {
        title: "Acesso Completo + Consulta",
        price: 620.00,
        description: "Consulta individual + Acesso total à área de membros"
      }
    };

    const selectedPlan = planDetails[planType as keyof typeof planDetails];
    if (!selectedPlan) {
      throw new Error(`Plano inválido: ${planType}`);
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create preference
    const preferenceData = {
      items: [
        {
          title: selectedPlan.title,
          description: selectedPlan.description,
          quantity: 1,
          currency_id: "BRL", 
          unit_price: selectedPlan.price
        }
      ],
      payer: {
        email: user.email,
      },
      back_urls: {
        success: `${origin}/?payment=success`,
        failure: `${origin}/?payment=failed`, 
        pending: `${origin}/?payment=pending`
      },
      notification_url: "https://jpgmzygxmsiscrmpskgf.supabase.co/functions/v1/mercadopago-webhook",
      auto_return: "approved",
      external_reference: `${user.id}-${planType}-${Date.now()}`
    };

    logStep("Criando preferência MP", { plan: selectedPlan.title, price: selectedPlan.price });

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mercadoPagoToken}`,
        "Content-Type": "application/json",
        "User-Agent": "BioRegenere/1.0"
      },
      body: JSON.stringify(preferenceData),
    });

    logStep("Resposta MP recebida", { status: mpResponse.status });

    if (!mpResponse.ok) {
      const errorData = await mpResponse.text();
      logStep("ERRO da API do MP", { 
        status: mpResponse.status, 
        statusText: mpResponse.statusText,
        error: errorData 
      });
      throw new Error(`MercadoPago API error: ${mpResponse.status} - ${errorData}`);
    }

    const mpResult = await mpResponse.json();
    logStep("Preferência criada com sucesso", { 
      preferenceId: mpResult.id,
      checkoutUrl: mpResult.init_point
    });

    return new Response(JSON.stringify({ 
      success: true,
      checkoutUrl: mpResult.init_point,
      preferenceId: mpResult.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERRO FINAL", { 
      message: errorMessage,
      type: typeof error
    });
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});