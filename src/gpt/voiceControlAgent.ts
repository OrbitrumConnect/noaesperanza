// voiceControlAgent.ts - Controle por voz da NOA
class VoiceControlAgent {
  private recognition: SpeechRecognition | null = null
  private isListening = false

  async ativarControle(): Promise<string> {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return `❌ Seu navegador não suporta reconhecimento de voz. Use Chrome, Edge ou Safari.`
    }

    try {
      this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()
      
      this.recognition.continuous = false
      this.recognition.interimResults = false
      this.recognition.lang = 'pt-BR'

      this.recognition.onstart = () => {
        this.isListening = true
        console.log('🎤 Reconhecimento de voz iniciado')
      }

      this.recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        console.log('🎤 Comando de voz detectado:', transcript)
        
        // Processar comando de voz
        this.processarComandoVoz(transcript)
      }

      this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('❌ Erro no reconhecimento de voz:', event.error)
        this.isListening = false
      }

      this.recognition.onend = () => {
        this.isListening = false
        console.log('🎤 Reconhecimento de voz finalizado')
      }

      this.recognition.start()
      
      return `🎤 **Controle por voz ativado!**

**Comandos disponíveis:**
• "avaliação clínica" - Iniciar avaliação
• "criar conhecimento" - Adicionar à base
• "listar aulas" - Ver cursos
• "curadoria simbólica" - Eixo simbólico
• "parar" - Desativar voz

**Fale agora...** 👂`
    } catch (error) {
      console.error('Erro ao ativar controle por voz:', error)
      return '❌ Erro ao ativar controle por voz.'
    }
  }

  async desativarControle(): Promise<string> {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
      return '🔇 Controle por voz desativado.'
    }
    return '🔇 Controle por voz já estava desativado.'
  }

  private async processarComandoVoz(transcript: string): Promise<void> {
    const lower = transcript.toLowerCase().trim()
    
    // Comandos de controle
    if (lower.includes('parar') || lower.includes('desativar')) {
      await this.desativarControle()
      return
    }

    // Processar comando através do NoaGPT
    try {
      // Simular envio de mensagem (será integrado com Home.tsx)
      console.log('🎤 Processando comando de voz:', transcript)
      
      // Aqui seria integrado com o sistema de mensagens
      // Por enquanto, apenas log
    } catch (error) {
      console.error('Erro ao processar comando de voz:', error)
    }
  }

  isAtivo(): boolean {
    return this.isListening
  }
}

// Exportar instância única
export const voiceControlAgent = new VoiceControlAgent()
