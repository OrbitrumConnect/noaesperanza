// 🗄️ Gerenciador de LocalStorage - Nôa Esperanza
// Visualizar e migrar dados locais para Supabase

import { supabase } from '../integrations/supabase/client'

export interface LocalConversation {
  id: string
  userMessage: string
  aiResponse: string
  action?: string
  timestamp: Date
  synced: boolean
}

export interface LocalStorageMigrationResult {
  success: boolean
  migrated: number
  failed: number
  errors: string[]
}

export class LocalStorageManager {
  // 📊 VER TODOS OS DADOS SALVOS LOCALMENTE
  static getAllLocalData() {
    const data: { [key: string]: any } = {}

    // Listar todas as chaves do localStorage
    const keys = Object.keys(localStorage)

    keys.forEach(key => {
      if (key.startsWith('noa_') || key.includes('conversation')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '[]')
        } catch (e) {
          data[key] = localStorage.getItem(key)
        }
      }
    })

    return data
  }

  // 📋 LISTAR CONVERSAS LOCAIS
  static getLocalConversations(): LocalConversation[] {
    try {
      const conversations = localStorage.getItem('noa_local_conversations')
      return conversations ? JSON.parse(conversations) : []
    } catch (error) {
      console.error('Erro ao ler conversas locais:', error)
      return []
    }
  }

  // 📊 ESTATÍSTICAS DOS DADOS LOCAIS
  static getLocalStats() {
    const conversations = this.getLocalConversations()
    const allData = this.getAllLocalData()

    return {
      totalConversations: conversations.length,
      syncedConversations: conversations.filter(c => c.synced).length,
      unsyncedConversations: conversations.filter(c => !c.synced).length,
      totalKeys: Object.keys(allData).length,
      storageSize: this.getStorageSize(),
      allKeys: Object.keys(allData),
    }
  }

  // 💾 TAMANHO DO ARMAZENAMENTO
  static getStorageSize(): string {
    let totalSize = 0
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length
      }
    }
    return (totalSize / 1024).toFixed(2) + ' KB'
  }

  // 🔄 MIGRAR PARA SUPABASE
  static async migrateToSupabase(): Promise<LocalStorageMigrationResult> {
    const conversations = this.getLocalConversations()
    const unsyncedConversations = conversations.filter(c => !c.synced)

    console.log(`📤 Migrando ${unsyncedConversations.length} conversas para Supabase...`)

    let migrated = 0
    let failed = 0
    const errors: string[] = []

    for (const conv of unsyncedConversations) {
      try {
        const { error } = await supabase.from('conversation_history').insert({
          user_id: 'dr-ricardo-valenca',
          content: conv.userMessage,
          response: conv.aiResponse,
          created_at: new Date(conv.timestamp).toISOString(),
          relevance_score: 0.95,
        })

        if (error) {
          failed++
          errors.push(`Erro ao migrar conversa ${conv.id}: ${error.message}`)
        } else {
          migrated++
          // Marcar como sincronizado
          conv.synced = true
        }
      } catch (error) {
        failed++
        errors.push(`Erro ao processar conversa ${conv.id}: ${error}`)
      }
    }

    // Atualizar localStorage com conversas marcadas como sincronizadas
    if (migrated > 0) {
      localStorage.setItem('noa_local_conversations', JSON.stringify(conversations))
    }

    return {
      success: migrated > 0,
      migrated,
      failed,
      errors,
    }
  }

  // 🧹 LIMPAR DADOS LOCAIS (com backup)
  static clearLocalData(keepBackup: boolean = true): void {
    if (keepBackup) {
      const backup = this.getAllLocalData()
      const backupKey = `noa_backup_${Date.now()}`
      localStorage.setItem(backupKey, JSON.stringify(backup))
      console.log(`✅ Backup criado: ${backupKey}`)
    }

    // Limpar apenas chaves da Nôa
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('noa_') && !key.includes('backup')) {
        localStorage.removeItem(key)
      }
    })

    console.log('🧹 Dados locais limpos')
  }

  // 📥 EXPORTAR DADOS PARA JSON
  static exportToJSON(): string {
    const data = this.getAllLocalData()
    return JSON.stringify(data, null, 2)
  }

  // 💾 DOWNLOAD DOS DADOS
  static downloadData(): void {
    const json = this.exportToJSON()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `noa_backup_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 🔍 BUSCAR CONVERSAS POR PALAVRA-CHAVE
  static searchConversations(keyword: string): LocalConversation[] {
    const conversations = this.getLocalConversations()
    const lowerKeyword = keyword.toLowerCase()

    return conversations.filter(
      conv =>
        conv.userMessage.toLowerCase().includes(lowerKeyword) ||
        conv.aiResponse.toLowerCase().includes(lowerKeyword)
    )
  }

  // 📊 ANÁLISE DE DADOS LOCAIS
  static analyzeLocalData() {
    const conversations = this.getLocalConversations()

    // Agrupar por data
    const byDate: { [key: string]: number } = {}
    conversations.forEach(conv => {
      const date = new Date(conv.timestamp).toLocaleDateString('pt-BR')
      byDate[date] = (byDate[date] || 0) + 1
    })

    // Palavras mais comuns
    const wordCount: { [key: string]: number } = {}
    conversations.forEach(conv => {
      const words = conv.userMessage.toLowerCase().split(/\s+/)
      words.forEach(word => {
        if (word.length > 4) {
          wordCount[word] = (wordCount[word] || 0) + 1
        }
      })
    })

    const topWords = Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)

    return {
      totalConversations: conversations.length,
      dateDistribution: byDate,
      topWords: topWords.map(([word, count]) => ({ word, count })),
      oldestConversation:
        conversations.length > 0
          ? new Date(Math.min(...conversations.map(c => new Date(c.timestamp).getTime())))
          : null,
      newestConversation:
        conversations.length > 0
          ? new Date(Math.max(...conversations.map(c => new Date(c.timestamp).getTime())))
          : null,
    }
  }
}

// 🖥️ FUNÇÕES PARA USAR NO CONSOLE DO NAVEGADOR
declare global {
  interface Window {
    noaLocalStorage: {
      ver: () => void
      migrar: () => Promise<LocalStorageMigrationResult>
      baixar: () => void
      limpar: () => void
      analisar: () => void
      stats: () => void
    }
  }
}

// Disponibilizar no console
if (typeof window !== 'undefined') {
  window.noaLocalStorage = {
    ver: () => {
      const data = LocalStorageManager.getAllLocalData()
      console.log('📊 DADOS LOCAIS DA NÔA:', data)
      return data
    },
    migrar: async () => {
      console.log('🔄 Iniciando migração...')
      const result = await LocalStorageManager.migrateToSupabase()
      console.log(`✅ Migração concluída!`)
      console.log(`   • Migradas: ${result.migrated}`)
      console.log(`   • Falhas: ${result.failed}`)
      if (result.errors.length > 0) {
        console.log(`   • Erros:`, result.errors)
      }
      return result
    },
    baixar: () => {
      LocalStorageManager.downloadData()
      console.log('💾 Download iniciado!')
    },
    limpar: () => {
      if (confirm('⚠️ Deseja limpar os dados locais? (Um backup será criado automaticamente)')) {
        LocalStorageManager.clearLocalData(true)
        console.log('🧹 Dados limpos! Backup criado.')
      }
    },
    analisar: () => {
      const analysis = LocalStorageManager.analyzeLocalData()
      console.log('📊 ANÁLISE DOS DADOS LOCAIS:', analysis)
      return analysis
    },
    stats: () => {
      const stats = LocalStorageManager.getLocalStats()
      console.log('📊 ESTATÍSTICAS:', stats)
      return stats
    },
  }

  console.log(`
╔════════════════════════════════════════╗
║  📊 GERENCIADOR DE DADOS LOCAIS - NÔA ║
╚════════════════════════════════════════╝

🖥️ COMANDOS DISPONÍVEIS NO CONSOLE:

• noaLocalStorage.ver()      - Ver todos os dados
• noaLocalStorage.stats()    - Ver estatísticas
• noaLocalStorage.analisar() - Análise detalhada
• noaLocalStorage.migrar()   - Migrar para Supabase
• noaLocalStorage.baixar()   - Download dos dados
• noaLocalStorage.limpar()   - Limpar dados locais

📝 Exemplo:
   noaLocalStorage.stats()
  `)
}

export default LocalStorageManager
