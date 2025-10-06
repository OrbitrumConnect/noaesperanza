import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const log = (message: string, data?: any) => {
  console.log(`[EXPIRY-CHECK] ${message}`, data ? JSON.stringify(data) : '');
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
    log("Verificando assinaturas próximas do vencimento");

    // Buscar assinaturas que vencem em 1 dia
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const { data: expiringSubscriptions, error } = await supabaseClient
      .from('subscribers')
      .select(`
        id,
        user_id,
        email,
        subscription_tier,
        subscription_end,
        profiles!inner(full_name, name)
      `)
      .eq('subscribed', true)
      .not('subscription_end', 'is', null)
      .lt('subscription_end', tomorrow.toISOString())
      .gt('subscription_end', new Date().toISOString());

    if (error) {
      log("Erro ao buscar assinaturas", error);
      throw error;
    }

    log(`Encontradas ${expiringSubscriptions?.length || 0} assinaturas expirando`);

    if (expiringSubscriptions && expiringSubscriptions.length > 0) {
      // Para cada assinatura expirando, enviar notificação
      for (const subscription of expiringSubscriptions) {
        const userName = subscription.profiles?.full_name || subscription.profiles?.name || 'Usuário';
        const expiryDate = new Date(subscription.subscription_end).toLocaleDateString('pt-BR');
        
        log("Processando expiração", {
          email: subscription.email,
          name: userName,
          expires: expiryDate
        });

        // Aqui você pode integrar com um serviço de email como Resend
        // Por enquanto, apenas log para a Dr. Dayana ver no dashboard
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: subscription.user_id,
            type: 'subscription_expiry_warning',
            title: '⚠️ Sua assinatura expira amanhã',
            message: `Olá ${userName}! Sua assinatura do ${subscription.subscription_tier} expira em ${expiryDate}. Renovar para continuar com acesso completo.`,
            data: {
              subscription_id: subscription.id,
              expiry_date: subscription.subscription_end,
              tier: subscription.subscription_tier
            }
          });

        log(`✅ Notificação criada para ${subscription.email}`);
      }
    }

    // Desativar assinaturas já expiradas
    const { data: expiredSubscriptions, error: expiredError } = await supabaseClient
      .from('subscribers')
      .update({ subscribed: false })
      .eq('subscribed', true)
      .not('subscription_end', 'is', null)
      .lt('subscription_end', new Date().toISOString())
      .select('email, subscription_tier');

    if (expiredError) {
      log("Erro ao desativar assinaturas expiradas", expiredError);
    } else if (expiredSubscriptions && expiredSubscriptions.length > 0) {
      log(`${expiredSubscriptions.length} assinaturas desativadas por expiração`);
    }

    return new Response(JSON.stringify({ 
      success: true,
      expiring_count: expiringSubscriptions?.length || 0,
      expired_count: expiredSubscriptions?.length || 0
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    log("❌ Erro no check de expiração", error);
    
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});