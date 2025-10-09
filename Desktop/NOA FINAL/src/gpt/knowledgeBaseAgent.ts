// src/gpt/knowledgeBaseAgent.ts
import { supabase } from '../integrations/supabase/client'

interface KnowledgeEntry {
    id?: string
    titulo: string
    conteudo: string
    categoria?: string
    tags?: string[]
    created_at?: string
    updated_at?: string
}
  
  export const knowledgeBaseAgent = {
    async executarAcao(message: string): Promise<string> {
      const lower = message.toLowerCase()
  
      // Criar novo conhecimento
      if (lower.includes('criar conhecimento')) {
        const match = message.match(/criar conhecimento (.+?) com o conteúdo (.+)/i)
        if (!match || match.length < 3) {
          return '⚠️ Formato inválido. Use: criar conhecimento Título com o conteúdo Texto...'
        }
  
        const titulo = match[1].trim()
        const conteudo = match[2].trim()
  
        try {
          const { data, error } = await supabase
            .from('ai_learning')
            .insert({
              keyword: titulo,
              context: 'knowledge_base',
              user_message: 'Criação de conhecimento',
              ai_response: conteudo,
              category: 'knowledge'
            })
            .select()
          
          if (error) throw error
          
          return `✅ Conhecimento "${titulo}" salvo na base de dados!`
        } catch (error) {
          console.error('Erro ao salvar conhecimento:', error)
          return '❌ Erro ao salvar conhecimento na base de dados.'
        }
      }
  
      // Editar conhecimento
      if (lower.includes('editar conhecimento')) {
        const match = message.match(/editar conhecimento (.+?) com o conteúdo (.+)/i)
        if (!match || match.length < 3) {
          return '⚠️ Formato inválido. Use: editar conhecimento Título com o conteúdo Novo texto...'
        }
  
        const titulo = match[1].trim()
        const novoConteudo = match[2].trim()
  
        try {
          const { data, error } = await supabase
            .from('ai_learning')
            .update({ ai_response: novoConteudo })
            .eq('keyword', titulo)
            .eq('context', 'knowledge_base')
            .select()
          
          if (error) throw error
          
          if (!data || data.length === 0) {
            return `❌ Conhecimento "${titulo}" não encontrado.`
          }
          
          return `✅ Conhecimento "${titulo}" atualizado com sucesso.`
        } catch (error) {
          console.error('Erro ao atualizar conhecimento:', error)
          return '❌ Erro ao atualizar conhecimento na base de dados.'
        }
      }
  
      // Listar conhecimentos
      if (lower.includes('listar conhecimentos')) {
        try {
          const { data, error } = await supabase
            .from('ai_learning')
            .select('keyword, ai_response, created_at')
            .eq('context', 'knowledge_base')
            .order('created_at', { ascending: false })
          
          if (error) throw error
          
          if (!data || data.length === 0) {
            return 'ℹ️ Nenhum conteúdo na base de conhecimento ainda.'
          }
  
          const lista = data.map((k, i) => `${i + 1}. ${k.keyword}`).join('\n')
          return `📚 Conhecimentos disponíveis (${data.length}):\n${lista}`
        } catch (error) {
          console.error('Erro ao listar conhecimentos:', error)
          return '❌ Erro ao acessar base de conhecimento.'
        }
      }
  
      return '⚠️ Comando de base de conhecimento não reconhecido. Use: criar, editar ou listar conhecimentos.'
    }
  }
  