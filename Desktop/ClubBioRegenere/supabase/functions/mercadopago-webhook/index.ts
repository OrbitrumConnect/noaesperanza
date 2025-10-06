import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (message: string, data?: any) => {
  console.log(`[MP-WEBHOOK] ${message}`, data ? JSON.stringify(data) : '');
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
    log("Webhook recebido do MercadoPago");
    
    const body = await req.json();
    log("Dados do webhook", body);

    // Mercado Pago envia o ID do pagamento
    if (body.type === "payment" && body.data?.id) {
      const paymentId = body.data.id;
      log("Processing payment", { paymentId });

      // Buscar detalhes do pagamento no MP
      const mpToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
      if (!mpToken) {
        throw new Error("MP token not configured");
      }

      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          "Authorization": `Bearer ${mpToken}`,
        }
      });

      if (!paymentResponse.ok) {
        throw new Error(`Failed to get payment details: ${paymentResponse.status}`);
      }

      const payment = await paymentResponse.json();
      log("Detalhes do pagamento", {
        id: payment.id,
        status: payment.status,
        external_reference: payment.external_reference,
        payer_email: payment.payer?.email
      });

      // Só processar se pagamento foi aprovado
      if (payment.status === "approved" && payment.external_reference) {
        const [userId, planType] = payment.external_reference.split('-');
        const userEmail = payment.payer?.email;

        log("Pagamento aprovado", { userId, planType, userEmail });

        // Verificar se o usuário existe
        const { data: userData, error: userError } = await supabaseClient
          .from('auth.users')
          .select('id, email')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          log("❌ Usuário não encontrado", { userId, error: userError });
          throw new Error(`Usuário não encontrado: ${userId}`);
        }

        log("✅ Usuário encontrado", { userId, email: userData.email });

        // Atualizar/criar assinatura
        const subscriptionData = {
          user_id: userId,
          email: userEmail || userData.email,
          subscribed: true,
          subscription_tier: planType === 'club-digital' ? 'Clube Digital' : 'Consulta Completa',
          subscription_end: planType === 'club-digital' 
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
            : null, // Consulta é vitalício
          updated_at: new Date().toISOString()
        };

        log("📝 Atualizando subscription", subscriptionData);

        const { data: upsertData, error: upsertError } = await supabaseClient
          .from('subscribers')
          .upsert(subscriptionData, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          })
          .select();

        if (upsertError) {
          log("❌ Erro ao atualizar subscriber", upsertError);
          throw upsertError;
        }

        log("✅ Assinatura ativada com sucesso", { 
          userId, 
          planType, 
          subscriptionData: upsertData?.[0] 
        });
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    // Para outros tipos de notificação, só confirmar recebimento
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    log("❌ Erro no webhook", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});