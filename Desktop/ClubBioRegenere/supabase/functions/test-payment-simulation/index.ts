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

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    // Simular pagamento aprovado para teste
    const { userId, planType, email } = await req.json();
    
    console.log('🧪 SIMULANDO PAGAMENTO', { userId, planType, email });

    // Ativar assinatura diretamente (como faria o webhook)
    const { error } = await supabaseClient
      .from('subscribers')
      .upsert({
        user_id: userId,
        email: email,
        subscribed: true,
        subscription_tier: planType === 'club-digital' ? 'Clube Digital' : 'Consulta Completa',
        subscription_end: planType === 'club-digital' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;

    console.log('✅ Assinatura simulada com sucesso');
    
    return new Response(JSON.stringify({ 
      success: true,
      message: 'Pagamento simulado e assinatura ativada'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Erro na simulação:', error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});