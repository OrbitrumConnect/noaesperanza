import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Testing environment variables...");
    
    const mercadoPagoToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    console.log("Environment check:", {
      hasMercadoPagoToken: !!mercadoPagoToken,
      mercadoPagoTokenLength: mercadoPagoToken?.length || 0,
      mercadoPagoTokenPrefix: mercadoPagoToken?.substring(0, 15) || "NOT_SET",
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey
    });

    return new Response(JSON.stringify({
      success: true,
      mercadoPagoTokenExists: !!mercadoPagoToken,
      mercadoPagoTokenLength: mercadoPagoToken?.length || 0,
      mercadoPagoTokenPrefix: mercadoPagoToken?.substring(0, 15) || "NOT_SET",
      supabaseUrlExists: !!supabaseUrl,
      supabaseKeyExists: !!supabaseKey,
      allEnvVars: Object.keys(Deno.env.toObject()).filter(key => 
        key.includes('MERCADO') || key.includes('SUPABASE')
      )
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Test error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});