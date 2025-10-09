// src/gpt/voiceAgent.ts
import { NoaGPT } from './noaGPT'

const noaGPT = new NoaGPT()

export const voiceAgent = {
  isListening: false,
  recognition: null as SpeechRecognition | null,

  iniciar() {
    const SpeechRecognition =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não é suportado neste navegador.')
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.lang = 'pt-BR'
    this.recognition.continuous = false
    this.recognition.interimResults = false

    this.recognition.onstart = () => {
      this.isListening = true
      console.log('🎙️ Reconhecimento de voz iniciado...')
    }

    this.recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      console.log('🗣️ Comando de voz:', transcript)
      const resposta = await noaGPT.processCommand(transcript)
      alert(`✅ Resposta: ${resposta}`)
    }

    this.recognition.onerror = (event) => {
      console.error('❌ Erro no reconhecimento de voz:', event.error)
    }

    this.recognition.onend = () => {
      this.isListening = false
      console.log('🛑 Reconhecimento de voz encerrado.')
    }

    this.recognition.start()
  },

  parar() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  },

  executarComando(comando: string) {
    if (comando.includes('ativar')) {
      this.iniciar()
      return '🎤 Reconhecimento de voz ativado.'
    }

    if (comando.includes('desativar')) {
      this.parar()
      return '🔇 Reconhecimento de voz desativado.'
    }

    return '⚠️ Comando de voz não reconhecido.'
  }
}
