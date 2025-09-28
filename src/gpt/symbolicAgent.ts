// symbolicAgent.ts - Agente para Eixo Simbólico e Curadoria Cultural
import { supabase } from '../integrations/supabase/client'

interface Simbolo {
  id?: string
  nome: string
  significado: string
  contexto_cultural: string
  aplicacao_medica?: string
  ancestralidade?: string
  created_at?: string
}

export const symbolicAgent = {
  async executarAcao(message: string): Promise<string> {
    const lower = message.toLowerCase()

    // Curadoria Simbólica
    if (lower.includes('curadoria simbólica') || lower.includes('curadoria simbolica')) {
      return await this.iniciarCuradoria(message)
    }

    // Ancestralidade
    if (lower.includes('ancestralidade')) {
      return await this.explorarAncestralidade(message)
    }

    // Projeto Cultural
    if (lower.includes('projeto cultural')) {
      return await this.desenvolverProjetoCultural(message)
    }

    // Tradição
    if (lower.includes('tradição') || lower.includes('tradicao')) {
      return await this.explorarTradicao(message)
    }

    // Diagnóstico Simbólico
    if (lower.includes('diagnóstico simbólico') || lower.includes('diagnostico simbolico')) {
      return await this.diagnosticoSimbolico(message)
    }

    return '🌀 Eixo Simbólico: Comando não reconhecido. Use: curadoria simbólica, ancestralidade, projeto cultural, tradição ou diagnóstico simbólico.'
  },

  async iniciarCuradoria(message: string): Promise<string> {
    try {
      // Buscar símbolos na base de conhecimento
      const { data, error } = await supabase
        .from('ai_learning')
        .select('keyword, ai_response')
        .eq('context', 'symbolic_curation')
        .limit(5)

      if (error) throw error

      if (!data || data.length === 0) {
        return `🌀 **Curadoria Simbólica**

Bem-vindo ao Eixo Simbólico da NOA Esperanza. Aqui exploramos a conexão entre medicina e tradições ancestrais.

**Áreas de atuação:**
• 🌿 Plantas medicinais tradicionais
• 🧘 Práticas de cura ancestrais  
• 🌍 Sabedoria cultural indígena
• 🔮 Simbolismo terapêutico
• 🎭 Ritual e cura

Como posso ajudá-lo a explorar a dimensão simbólica da cura?`
      }

      const simbolos = data.map(s => `• ${s.keyword}: ${s.ai_response.substring(0, 100)}...`).join('\n')
      
      return `🌀 **Curadoria Simbólica Ativa**

**Símbolos disponíveis:**
${simbolos}

**Como posso ajudá-lo com curadoria simbólica?**`
    } catch (error) {
      console.error('Erro na curadoria simbólica:', error)
      return '❌ Erro ao acessar curadoria simbólica.'
    }
  },

  async explorarAncestralidade(message: string): Promise<string> {
    return `🌿 **Exploração Ancestral**

A ancestralidade nos conecta com sabedoria milenar de cura:

**Áreas de exploração:**
• 🌱 Plantas medicinais tradicionais
• 🧘 Práticas de meditação ancestral
• 🌍 Conhecimento indígena sobre saúde
• 🔮 Simbolismo de cura
• 🎭 Rituais terapêuticos

**Pergunta:** Que aspecto da ancestralidade você gostaria de explorar?`
  },

  async desenvolverProjetoCultural(message: string): Promise<string> {
    return `🎭 **Projeto Cultural**

Desenvolvemos projetos que integram medicina e cultura:

**Tipos de projetos:**
• 📚 Documentação de práticas tradicionais
• 🎨 Arte-terapia com símbolos ancestrais
• 🌿 Jardim de plantas medicinais
• 🧘 Círculos de cura comunitária
• 📖 Narrativas de cura

**Como posso ajudá-lo a desenvolver um projeto cultural?**`
  },

  async explorarTradicao(message: string): Promise<string> {
    return `🏛️ **Exploração de Tradições**

As tradições carregam sabedoria de cura:

**Tradições disponíveis:**
• 🌿 Medicina tradicional chinesa
• 🧘 Ayurveda e práticas indianas
• 🌍 Medicina indígena brasileira
• 🔮 Xamanismo e cura energética
• 🎭 Dança e movimento terapêutico

**Que tradição você gostaria de explorar?**`
  },

  async diagnosticoSimbolico(message: string): Promise<string> {
    return `🔮 **Diagnóstico Simbólico**

O diagnóstico simbólico explora a dimensão não-física da saúde:

**Elementos do diagnóstico:**
• 🌿 Símbolos da natureza
• 🎨 Expressões artísticas
• 🧘 Estados de consciência
• 🌍 Conexões culturais
• 🔮 Intuição e percepção

**Pergunta:** Que aspecto simbólico você gostaria de explorar para diagnóstico?`
  }
}
