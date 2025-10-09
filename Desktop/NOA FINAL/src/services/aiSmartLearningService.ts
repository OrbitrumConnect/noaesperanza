// 🧠 SERVIÇO DE BUSCA INTELIGENTE DE APRENDIZADOS
// Busca nos 559+ aprendizados salvos para respostas contextualizadas

import { supabase } from '../integrations/supabase/client'

export interface AprendizadoEncontrado {
  keyword: string
  context: string
  user_message: string
  ai_response: string
  category: string
  confidence_score: number
  usage_count: number
  similaridade: number
}

export class AISmartLearningService {
  // 🔍 BUSCAR APRENDIZADOS SIMILARES
  async buscarAprendizadosSimilares(
    mensagemUsuario: string,
    categoria?: string,
    limite: number = 5
  ): Promise<AprendizadoEncontrado[]> {
    try {
      console.log('🔍 Buscando aprendizados similares para:', mensagemUsuario)

      // Extrair palavras-chave da mensagem
      const palavrasChave = this.extrairPalavrasChave(mensagemUsuario)
      console.log('🔑 Palavras-chave:', palavrasChave)

      // Buscar no banco por similaridade
      const { data, error } = await supabase
        .from('ai_learning')
        .select('*')
        .or(palavrasChave.map(palavra => `keyword.ilike.%${palavra}%`).join(','))
        .order('confidence_score', { ascending: false })
        .order('usage_count', { ascending: false })
        .limit(limite * 2) // Busca mais para filtrar depois

      if (error) {
        console.error('❌ Erro ao buscar aprendizados:', error)
        return []
      }

      if (!data || data.length === 0) {
        console.log('⚠️ Nenhum aprendizado encontrado')
        return []
      }

      // Calcular similaridade e ordenar
      const aprendizadosComSimilaridade = data.map(aprendizado => ({
        ...aprendizado,
        similaridade: this.calcularSimilaridade(mensagemUsuario, aprendizado.user_message),
      }))

      const melhoresAprendizados = aprendizadosComSimilaridade
        .filter(a => a.similaridade > 0.3) // Mínimo 30% de similaridade
        .sort((a, b) => b.similaridade - a.similaridade)
        .slice(0, limite)

      console.log(`✅ ${melhoresAprendizados.length} aprendizados encontrados`)

      return melhoresAprendizados
    } catch (error) {
      console.error('❌ Erro ao buscar aprendizados:', error)
      return []
    }
  }

  // 🔑 EXTRAIR PALAVRAS-CHAVE
  private extrairPalavrasChave(texto: string): string[] {
    const stopWords = [
      'o',
      'a',
      'de',
      'da',
      'do',
      'em',
      'para',
      'com',
      'por',
      'que',
      'é',
      'um',
      'uma',
    ]

    const palavras = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^\w\s]/g, '') // Remove pontuação
      .split(/\s+/)
      .filter(palavra => palavra.length > 2 && !stopWords.includes(palavra))

    // Retorna palavras únicas
    return [...new Set(palavras)]
  }

  // 📊 CALCULAR SIMILARIDADE (Algoritmo simples de Jaccard)
  private calcularSimilaridade(texto1: string, texto2: string): number {
    const palavras1 = new Set(this.extrairPalavrasChave(texto1))
    const palavras2 = new Set(this.extrairPalavrasChave(texto2))

    const intersecao = new Set([...palavras1].filter(x => palavras2.has(x)))
    const uniao = new Set([...palavras1, ...palavras2])

    if (uniao.size === 0) return 0

    return intersecao.size / uniao.size
  }

  // 🎯 BUSCAR MELHOR RESPOSTA
  async buscarMelhorResposta(mensagemUsuario: string, categoria?: string): Promise<string | null> {
    const aprendizados = await this.buscarAprendizadosSimilares(mensagemUsuario, categoria, 3)

    if (aprendizados.length === 0) {
      console.log('⚠️ Nenhum aprendizado relevante encontrado')
      return null
    }

    // Retorna a resposta com maior similaridade e confiança
    const melhor = aprendizados[0]

    console.log(
      `✅ Melhor resposta encontrada (${Math.round(melhor.similaridade * 100)}% similar):`,
      melhor.ai_response.substring(0, 100)
    )

    // Incrementa uso
    await this.incrementarUso(melhor.keyword)

    return melhor.ai_response
  }

  // 📈 INCREMENTAR CONTADOR DE USO
  private async incrementarUso(keyword: string) {
    try {
      const { data: current } = await supabase
        .from('ai_learning')
        .select('usage_count')
        .eq('keyword', keyword)
        .maybeSingle()

      const nextUsageCount = (current?.usage_count ?? 0) + 1

      await supabase
        .from('ai_learning')
        .update({
          usage_count: nextUsageCount,
          last_used: new Date().toISOString(),
        })
        .eq('keyword', keyword)
    } catch (error) {
      console.warn('⚠️ Erro ao incrementar uso:', error)
    }
  }

  // 🧠 BUSCAR PADRÕES DE CONVERSA
  async buscarPadroes(tipoUsuario: string, contexto: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('ai_conversation_patterns')
        .select('*')
        .eq('pattern_type', tipoUsuario)
        .ilike('context', `%${contexto}%`)
        .order('confidence_score', { ascending: false })
        .limit(3)

      if (error) {
        console.error('❌ Erro ao buscar padrões:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar padrões:', error)
      return []
    }
  }

  // 📚 BUSCAR HISTÓRICO DO USUÁRIO
  async buscarHistoricoUsuario(userId: string, limite: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('noa_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limite)

      if (error) {
        console.error('❌ Erro ao buscar histórico:', error)
        return []
      }

      console.log(`✅ ${data?.length || 0} conversas anteriores encontradas`)
      return data || []
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error)
      return []
    }
  }

  // 🎯 GERAR RESPOSTA CONTEXTUALIZADA
  async gerarRespostaContextualizada(
    mensagemUsuario: string,
    userId: string,
    categoria: string = 'general'
  ): Promise<string | null> {
    console.log('🧠 Gerando resposta contextualizada...')

    // 1. Buscar aprendizados similares
    const aprendizados = await this.buscarAprendizadosSimilares(mensagemUsuario, categoria, 3)

    // 2. Buscar histórico do usuário
    const historico = await this.buscarHistoricoUsuario(userId, 5)

    // 3. Buscar padrões
    const padroes = await this.buscarPadroes(categoria, mensagemUsuario)

    // 4. Se tem aprendizados relevantes, usar
    if (aprendizados.length > 0 && aprendizados[0].similaridade > 0.5) {
      console.log(
        `✅ Usando aprendizado (${Math.round(aprendizados[0].similaridade * 100)}% similar)`
      )
      return aprendizados[0].ai_response
    }

    // 5. Se tem padrões, usar
    if (padroes.length > 0) {
      console.log('✅ Usando padrão de conversa')
      return padroes[0].expected_response
    }

    // 6. Contexto do histórico
    if (historico.length > 0) {
      console.log('✅ Usando contexto do histórico')
      // Aqui pode usar o histórico para personalizar ainda mais
    }

    console.log('⚠️ Nenhum contexto relevante encontrado')
    return null
  }
}

// Exportar instância singleton
export const aiSmartLearningService = new AISmartLearningService()
