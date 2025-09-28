// src/gpt/courseAdminAgent.ts
import { supabase } from '../integrations/supabase/client'

export const courseAdminAgent = {
    async executarTarefa(mensagem: string): Promise<string> {
      const lower = mensagem.toLowerCase()
  
      // Criar nova aula
      if (lower.includes('criar aula')) {
        // Extração simples do título da aula (você pode melhorar com NLP depois)
        const match = mensagem.match(/criar aula (.+)/i)
        const titulo = match?.[1]?.trim()
  
        if (!titulo) {
          return '⚠️ Para criar uma aula, diga algo como: "criar aula Introdução à Nefrologia".'
        }
  
        try {
          const { data, error } = await supabase
            .from('cursos_licoes')
            .insert({
              titulo: titulo,
              conteudo: 'Conteúdo da aula será adicionado posteriormente',
              ordem: 1,
              ativo: true
            })
            .select()
          
          if (error) throw error
          
          return `✅ Aula "${titulo}" criada com sucesso no sistema!`
        } catch (error) {
          console.error('Erro ao criar aula:', error)
          return '❌ Erro ao criar aula no sistema.'
        }
      }
  
      // Editar aula existente
      if (lower.includes('editar aula')) {
        const match = mensagem.match(/editar aula (.+?) com o conteúdo (.+)/i)
        const nome = match?.[1]?.trim()
        const novoConteudo = match?.[2]?.trim()
  
        if (!nome || !novoConteudo) {
          return '⚠️ Para editar uma aula, diga: "editar aula NomeDaAula com o conteúdo Novo conteúdo..."'
        }
  
        try {
          const { data, error } = await supabase
            .from('cursos_licoes')
            .update({ conteudo: novoConteudo })
            .eq('titulo', nome)
            .select()
          
          if (error) throw error
          
          if (!data || data.length === 0) {
            return `❌ Aula "${nome}" não encontrada.`
          }
          
          return `✅ Aula "${nome}" atualizada com o novo conteúdo!`
        } catch (error) {
          console.error('Erro ao editar aula:', error)
          return '❌ Erro ao editar aula no sistema.'
        }
      }
  
      // Listar aulas
      if (lower.includes('listar aulas')) {
        try {
          const { data, error } = await supabase
            .from('cursos_licoes')
            .select('titulo, conteudo, ordem, ativo')
            .eq('ativo', true)
            .order('ordem', { ascending: true })
          
          if (error) throw error
          
          if (!data || data.length === 0) {
            return '📚 Nenhuma aula disponível no momento.'
          }
          
          const lista = data.map((aula, i) => `${i + 1}. ${aula.titulo}`).join('\n')
          return `📚 Aulas disponíveis (${data.length}):\n${lista}`
        } catch (error) {
          console.error('Erro ao listar aulas:', error)
          return '❌ Erro ao acessar aulas do sistema.'
        }
      }
  
      return '⚠️ Comando de curso não reconhecido. Use: "criar aula", "editar aula", "listar aulas"...'
    }
  }
  