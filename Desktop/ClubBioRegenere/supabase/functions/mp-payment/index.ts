import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("🚀 [MP-PAYMENT] Nova função iniciada");

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    // Debug todos os env vars
    const allEnvs = Object.keys(Deno.env.toObject());
    console.log("📋 [MP-PAYMENT] Env vars disponíveis:", allEnvs);
    
    const mpToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    console.log("🔑 [MP-PAYMENT] Token Status:", {
      exists: !!mpToken,
      length: mpToken?.length || 0,
      prefix: mpToken?.substring(0, 25) || "VAZIO"
    });

    if (!mpToken) {
      console.error("❌ [MP-PAYMENT] Token não encontrado!");
      return new Response(JSON.stringify({ 
        error: "Token MP não configurado",
        debug: { allEnvs, tokenExists: false }
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated");
    }

    console.log("👤 [MP-PAYMENT] User:", user.email);

    // Parse body
    const body = await req.json();
    const { planType } = body;
    
    console.log("📦 [MP-PAYMENT] Plan:", planType);

    // Plan details
    const plans = {
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

    const plan = plans[planType as keyof typeof plans];
    if (!plan) {
      throw new Error(`Plano inválido: ${planType}`);
    }

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Criar preferência MP
    const preferenceData = {
      items: [{
        title: plan.title,
        description: plan.description,
        quantity: 1,
        currency_id: "BRL",
        unit_price: plan.price
      }],
      payer: {
        email: user.email,
      },
      back_urls: {
        success: `${origin}/?payment=success`,
        failure: `${origin}/?payment=failed`,
        pending: `${origin}/?payment=pending`
      },
      auto_return: "approved",
      external_reference: `${user.id}-${planType}-${Date.now()}`
    };

    console.log("📤 [MP-PAYMENT] Enviando para MP API...");

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${mpToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(preferenceData)
    });

    console.log("📨 [MP-PAYMENT] MP Response status:", mpResponse.status);

    if (!mpResponse.ok) {
      const errorText = await mpResponse.text();
      console.error("❌ [MP-PAYMENT] MP API Error:", {
        status: mpResponse.status,
        error: errorText
      });
      
      return new Response(JSON.stringify({
        error: "Erro na API do Mercado Pago",
        details: errorText,
        status: mpResponse.status
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const mpResult = await mpResponse.json();
    console.log("✅ [MP-PAYMENT] Preferência criada:", mpResult.id);

    return new Response(JSON.stringify({
      success: true,
      checkoutUrl: mpResult.init_point,
      preferenceId: mpResult.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200
    });

  } catch (error) {
    console.error("💥 [MP-PAYMENT] Erro geral:", error);
    return new Response(JSON.stringify({
      error: error.message,
      type: "internal_error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});