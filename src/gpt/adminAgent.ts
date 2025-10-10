// ========================================
// ADMIN AGENT
// Acesso total ao sistema, banco de dados e funcionalidades admin
// ========================================

import { supabase } from '../integrations/supabase/client'
import { NoaContext } from './noaVisionIA'

export const adminAgent = {
  /**
   * Verifica se é comando admin
   */
  canHandle(message: string, context: NoaContext): boolean {
    if (context.userProfile !== 'admin') return false
    
    const lower = message.toLowerCase()
    return (
      lower.includes('dashboard') ||
      lower.includes('kpi') ||
      lower.includes('analytics') ||
      lower.includes('estatística') ||
      lower.includes('base de conhecimento') ||
      lower.includes('desenvolvimento') ||
      lower.includes('ide') ||
      lower.includes('canvas') ||
      lower.includes('banco de dados') ||
      lower.includes('tabela') ||
      lower.includes('sql') ||
      lower.includes('documentos') ||
      lower.includes('usuários') ||
      lower.includes('métricas')
    )
  },
  
  /**
   * Processa comandos admin
   */
  async process(message: string, context: NoaContext): Promise<string> {
    const lower = message.toLowerCase()
    
    // 1️⃣ KPIs E ANALYTICS
    if (lower.includes('kpi') || lower.includes('métrica') || lower.includes('estatística')) {
      return this.getKPIs()
    }
    
    // 2️⃣ BASE DE CONHECIMENTO
    if (lower.includes('base de conhecimento') || lower.includes('documento')) {
      return this.getKnowledgeBaseInfo()
    }
    
    // 3️⃣ DESENVOLVIMENTO COLABORATIVO
    if (lower.includes('desenvolvimento') || lower.includes('colaborativo')) {
      return this.getDevInfo()
    }
    
    // 4️⃣ IDE
    if (lower.includes('ide') || lower.includes('editor') || lower.includes('código')) {
      return this.getIDEInfo()
    }
    
    // 5️⃣ BANCO DE DADOS
    if (lower.includes('banco') || lower.includes('tabela') || lower.includes('sql')) {
      return this.getDatabaseInfo()
    }
    
    // 6️⃣ CANVAS/LOUSA
    if (lower.includes('canvas') || lower.includes('lousa') || lower.includes('diagrama')) {
      return this.getCanvasInfo()
    }
    
    // 7️⃣ USUÁRIOS
    if (lower.includes('usuário') || lower.includes('paciente') || lower.includes('médico')) {
      return this.getUsersInfo()
    }
    
    return this.getAdminOverview()
  },
  
  /**
   * KPIs do sistema
   */
  async getKPIs(): Promise<string> {
    try {
      const [users, assessments, documents, conversations] = await Promise.all([
        supabase.from('noa_users').select('*', { count: 'exact', head: true }),
        supabase.from('avaliacoes_iniciais').select('*', { count: 'exact', head: true }),
        supabase.from('gpt_documents').select('*', { count: 'exact', head: true }),
        supabase.from('ai_learning').select('*', { count: 'exact', head: true })
      ])
      
      const stats = await supabase.from('v_ai_learning_stats').select('*').single()
      
      return `📊 **KPIs do Sistema**

**Usuários:**
👥 Total: ${users.count || 0}

**Avaliações Clínicas:**
🏥 Total realizadas: ${assessments.count || 0}

**Base de Conhecimento:**
📄 Documentos: ${documents.count || 0}
🧠 Conversas aprendidas: ${conversations.count || 0}
${stats.data ? `📈 Taxa de reuso: ${((stats.data.total_reuses / stats.data.total_interactions) * 100).toFixed(1)}%` : ''}

**NoaVision IA:**
✅ Embeddings ativos: ${stats.data?.with_embeddings || 0}
📊 Confiança média: ${stats.data?.avg_confidence ? (stats.data.avg_confidence * 100).toFixed(1) + '%' : 'N/A'}
🔄 Uso médio: ${stats.data?.avg_usage?.toFixed(1) || 'N/A'}x por resposta

**Links rápidos:**
• Ver todos os dados: /app/admin
• Analytics completo: Dashboard > Analytics
• Qualidade: Dashboard > Quality`
    } catch (error) {
      console.error('Erro ao buscar KPIs:', error)
      return `❌ Erro ao buscar métricas. Verifique conexão com Supabase.`
    }
  },
  
  /**
   * Info da base de conhecimento
   */
  async getKnowledgeBaseInfo(): Promise<string> {
    try {
      const { count: docs } = await supabase
        .from('gpt_documents')
        .select('*', { count: 'exact', head: true })
      
      const { count: knowledge } = await supabase
        .from('knowledge_items')
        .select('*', { count: 'exact', head: true })
      
      const { data: recent } = await supabase
        .from('gpt_documents')
        .select('filename, created_at')
        .order('created_at', { ascending: false })
        .limit(5)
      
      let response = `📚 **Base de Conhecimento**

**Estatísticas:**
📄 Documentos salvos: ${docs || 0}
🧠 Itens de conhecimento: ${knowledge || 0}
`
      
      if (recent && recent.length > 0) {
        response += `\n**Documentos recentes:**\n`
        recent.forEach((doc, i) => {
          response += `${i + 1}. ${doc.filename}\n`
        })
      }
      
      response += `\n**Funcionalidades:**
• Upload de documentos (.pdf, .docx, .txt)
• Processamento automático
• Busca semântica
• Chat com documentos
• Compartilhamento

**Acesso:** Menu lateral > Base de Conhecimento`
      
      return response
    } catch (error) {
      return `📚 **Base de Conhecimento**\n\nFuncionalidade disponível no menu lateral.`
    }
  },
  
  /**
   * Info desenvolvimento colaborativo
   */
  getDevInfo(): string {
    return `🔧 **Desenvolvimento Colaborativo**

**Funcionalidades:**
• Comandos em linguagem natural
• Geração de código
• Debugging assistido
• Versionamento integrado
• Deploy automático

**Como usar:**
Digite comandos como:
• "criar componente de login"
• "corrigir erro no dashboard"
• "adicionar validação no formulário"
• "implementar busca semântica"

**Acesso:** Menu lateral > Desenvolvimento Colaborativo`
  },
  
  /**
   * Info IDE
   */
  getIDEInfo(): string {
    return `💻 **IDE Completo Integrado**

**Editor Inteligente:**
• Syntax highlighting
• Autocomplete
• Linting em tempo real
• Git integrado
• Terminal integrado

**Assistente IA:**
• Sugestões de código
• Refatoração automática
• Documentação inline
• Debugging assistido

**Acesso:** 
• /app/ide
• Menu lateral > Abrir IDE Completo`
  },
  
  /**
   * Info banco de dados
   */
  async getDatabaseInfo(): Promise<string> {
    try {
      // Listar tabelas principais
      const tables = [
        'noa_users',
        'ai_learning',
        'gpt_documents',
        'knowledge_items',
        'embedding_cache',
        'user_consents',
        'shared_reports',
        'avaliacoes_iniciais'
      ]
      
      let response = `🗄️ **Banco de Dados**

**Tabelas principais:**\n`
      
      for (const table of tables) {
        const { count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        response += `• ${table}: ${count || 0} registros\n`
      }
      
      response += `
**Extensões:**
✅ pgvector (embeddings)

**Funções:**
• search_similar_embeddings()
• search_documents_by_embedding()
• search_knowledge_by_embedding()
• search_all_context()

**Views:**
• v_ai_learning_stats
• v_embeddings_by_profile
• v_document_stats
• v_knowledge_stats

**Acesso SQL:**
Supabase Dashboard > SQL Editor`
      
      return response
    } catch (error) {
      return `🗄️ **Banco de Dados**\n\nAcesse: Supabase Dashboard > SQL Editor`
    }
  },
  
  /**
   * Info Canvas/Lousa
   */
  getCanvasInfo(): string {
    return `🎨 **Canvas/Lousa**

**Funcionalidades:**
• Diagramas médicos
• Fluxogramas de tratamento
• Anotações visuais
• Compartilhamento em tempo real
• Exportação de imagens

**Como usar:**
• Desenhar diagramas
• Ilustrar sintomas
• Explicar tratamentos
• Colaborar com equipe

**Acesso:** Menu lateral > Canvas/Lousa`
  },
  
  /**
   * Info de usuários
   */
  async getUsersInfo(): Promise<string> {
    try {
      const { data: users } = await supabase
        .from('noa_users')
        .select('user_type')
      
      // Contar manualmente por tipo
      const counts: Record<string, number> = {}
      users?.forEach((u: any) => {
        counts[u.user_type] = (counts[u.user_type] || 0) + 1
      })
      
      return `👥 **Gestão de Usuários**

**Por tipo:**
${Object.entries(counts).map(([type, count]) => `• ${type}: ${count}`).join('\n') || 'Carregando...'}

**Funcionalidades:**
• Criar/editar usuários
• Gerenciar permissões
• Ver atividade
• Exportar dados
• Análise de uso

**Acesso:** /app/admin > Usuários`
    } catch (error) {
      return `👥 **Gestão de Usuários**\n\nAcesse: /app/admin > Usuários`
    }
  },
  
  /**
   * Visão geral do Admin
   */
  getAdminOverview(): string {
    return `👑 **Dashboard Admin - Visão Geral**

**Funcionalidades disponíveis:**

📊 **KPIs & Analytics**
"mostrar kpis" ou "estatísticas"

📚 **Base de Conhecimento**
"ver documentos" ou "base de conhecimento"

🔧 **Desenvolvimento Colaborativo**
"desenvolvimento colaborativo"

💻 **IDE Completo**
"abrir ide" ou "editor"

🎨 **Canvas/Lousa**
"abrir canvas"

🗄️ **Banco de Dados**
"ver banco de dados" ou "tabelas"

👥 **Usuários**
"ver usuários" ou "gestão de usuários"

**Dica:** Seja específico no que precisa e te direciono!`
  }
}

