// 📝 SISTEMA DE LOGGING CENTRALIZADO - Nôa Esperanza
// Logger profissional com níveis de log

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private currentLevel: LogLevel = LogLevel.INFO
  
  constructor(level: LogLevel = LogLevel.INFO) {
    this.currentLevel = level
  }
  
  setLevel(level: LogLevel) {
    this.currentLevel = level
  }
  
  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel
  }
  
  private formatMessage(level: string, message: string, context?: any): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level}] ${message}${contextStr}`
  }
  
  debug(message: string, context?: any) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage('DEBUG', message, context))
    }
  }
  
  info(message: string, context?: any) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage('INFO', message, context))
    }
  }
  
  warn(message: string, context?: any) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage('WARN', message, context))
    }
  }
  
  error(message: string, context?: any) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage('ERROR', message, context))
    }
  }
  
  // Métodos específicos para diferentes módulos
  semantic(message: string, context?: any) {
    this.info(`🧠 SEMANTIC: ${message}`, context)
  }
  
  learning(message: string, context?: any) {
    this.info(`📚 LEARNING: ${message}`, context)
  }
  
  conversation(message: string, context?: any) {
    this.info(`💬 CONVERSATION: ${message}`, context)
  }
  
  database(message: string, context?: any) {
    this.info(`🗄️ DATABASE: ${message}`, context)
  }
  
  // 'error' já definido acima; manter apenas uma implementação
}

// Instância global do logger
export const logger = new Logger(
  process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO
)

// Exportar para uso em toda a aplicação
export default logger
