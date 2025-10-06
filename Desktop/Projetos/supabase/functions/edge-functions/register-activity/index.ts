// 🛡️ EDGE FUNCTION PARA REGISTRAR ATIVIDADES (SERVER-SIDE)
// Esta função registra atividades e valida limites no servidor

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      user_id, 
      activity_type, 
      credits_earned = 0, 
      xp_earned = 0, 
      metadata = {} 
    } = await req.json()

    if (!user_id || !activity_type) {
      return new Response(
        JSON.stringify({ error: 'user_id e activity_type são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Registrar atividade usando função server-side
    const { data: result, error } = await supabaseClient.rpc('register_daily_activity', {
      p_user_id: user_id,
      p_activity_type: activity_type,
      p_credits_earned: credits_earned,
      p_xp_earned: xp_earned,
      p_metadata: metadata
    })

    if (error) {
      console.error('Erro ao registrar atividade:', error)
      return new Response(
        JSON.stringify({ error: 'Erro interno do servidor' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se a atividade foi permitida
    if (!result.success) {
      return new Response(
        JSON.stringify(result),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na edge function:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
