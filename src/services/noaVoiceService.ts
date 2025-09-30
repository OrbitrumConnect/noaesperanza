// Serviço completo de voz da Nôa Esperanza (Speech-to-Text + Text-to-Speech)
// Conforme Documento Mestre v.2.0 - Voz padrão Nôa Esperanza

import { canUseSpeechRecognition, showHTTPSWarning } from '../config/security'
import { APP_CONFIG } from '../config/appConfig'

export interface VoiceConfig {
  rate: number      // Velocidade da fala
  pitch: number     // Tom da voz
  volume: number    // Volume
  lang: string      // Idioma
  voiceName?: string // Nome específico da voz
}

export interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
}

export class NoaVoiceService {
  private synthesis: SpeechSynthesis
  private recognition: SpeechRecognition | null = null
  private voices: SpeechSynthesisVoice[] = []
  private noaVoice: SpeechSynthesisVoice | null = null
  private isListening: boolean = false
  private onResultCallback?: (result: SpeechRecognitionResult) => void
  private onErrorCallback?: (error: string) => void

  // Configuração padrão da voz Nôa Esperanza (dados internos)
  private readonly NOA_VOICE_CONFIG: VoiceConfig = {
    rate: APP_CONFIG.voice.rate,
    pitch: APP_CONFIG.voice.pitch,
    volume: APP_CONFIG.voice.volume,
    lang: APP_CONFIG.voice.language,
    voiceName: APP_CONFIG.voice.defaultVoice
  }

  constructor() {
    this.synthesis = window.speechSynthesis
    this.initializeSpeechRecognition()
    this.loadVoices()
    
    // Mostrar aviso de HTTPS se necessário
    showHTTPSWarning()
    
    // Recarregar vozes quando disponíveis
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => {
        this.loadVoices()
      }
    }
  }

  private initializeSpeechRecognition() {
    // Verificar se Speech Recognition está disponível
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition()
      this.recognition.continuous = false
      this.recognition.interimResults = true
      this.recognition.lang = 'pt-BR'
      this.recognition.maxAlternatives = 1

      this.recognition.onstart = () => {
        console.log('🎤 Speech Recognition iniciado')
        this.isListening = true
      }

      this.recognition.onresult = (event) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        const result: SpeechRecognitionResult = {
          transcript: finalTranscript || interimTranscript,
          confidence: event.results[event.resultIndex]?.[0]?.confidence || 0,
          isFinal: !!finalTranscript
        }

        if (this.onResultCallback) {
          this.onResultCallback(result)
        }
      }

      this.recognition.onerror = (event) => {
        console.error('❌ Erro no Speech Recognition:', event.error)
        this.isListening = false
        if (this.onErrorCallback) {
          this.onErrorCallback(event.error)
        }
      }

      this.recognition.onend = () => {
        console.log('🎤 Speech Recognition finalizado')
        this.isListening = false
      }
    } else {
      console.warn('⚠️ Speech Recognition não disponível neste navegador')
    }
  }

  private loadVoices() {
    this.voices = this.synthesis.getVoices()
    
    // Procurar pela voz específica da Nôa Esperanza
    this.noaVoice = this.voices.find(voice => 
      voice.name === this.NOA_VOICE_CONFIG.voiceName
    ) || this.voices.find(voice => 
      voice.lang.startsWith('pt') && 
      (voice.name.toLowerCase().includes('maria') ||
       voice.name.toLowerCase().includes('feminina') ||
       voice.name.toLowerCase().includes('female'))
    ) || this.voices.find(voice => 
      voice.lang.startsWith('pt') && 
      !voice.name.toLowerCase().includes('male') &&
      !voice.name.toLowerCase().includes('man')
    ) || this.voices.find(voice => voice.lang.startsWith('pt')) || null

    console.log('🎤 Vozes disponíveis:', this.voices.map(v => `${v.name} (${v.lang})`))
    console.log('🎤 Voz Nôa Esperanza selecionada:', this.noaVoice?.name || 'Padrão')
  }

  // ===== TEXT-TO-SPEECH (Nôa fala) =====
  
  async speak(text: string, config?: Partial<VoiceConfig>): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Parar qualquer fala em andamento
        this.synthesis.cancel()

        // Criar utterance
        const utterance = new SpeechSynthesisUtterance(text)
        
        // Configurar voz da Nôa
        if (this.noaVoice) {
          utterance.voice = this.noaVoice
        }

        // Aplicar configurações (padrão + customizações)
        const finalConfig = { ...this.NOA_VOICE_CONFIG, ...config }
        utterance.rate = finalConfig.rate
        utterance.pitch = finalConfig.pitch
        utterance.volume = finalConfig.volume
        utterance.lang = finalConfig.lang

        // Eventos
        utterance.onstart = () => {
          console.log('🗣️ Nôa Esperanza falando:', text.substring(0, 50) + '...')
        }

        utterance.onend = () => {
          console.log('🗣️ Nôa Esperanza terminou de falar')
          resolve()
        }

        utterance.onerror = (event) => {
          console.error('❌ Erro na fala da Nôa:', event.error)
          reject(new Error(`Speech Error: ${event.error}`))
        }

        // Iniciar fala
        this.synthesis.speak(utterance)

      } catch (error) {
        console.error('❌ Erro ao configurar fala da Nôa:', error)
        reject(error)
      }
    })
  }

  // Parar fala atual
  stopSpeaking() {
    this.synthesis.cancel()
    console.log('🗣️ Fala da Nôa interrompida')
  }

  // ===== SPEECH-TO-TEXT (Usuário fala) =====

  startListening(
    onResult: (result: SpeechRecognitionResult) => void,
    onError?: (error: string) => void
  ): boolean {
    if (!this.recognition) {
      console.error('❌ Speech Recognition não disponível')
      if (onError) onError('Speech Recognition não disponível')
      return false
    }

    if (this.isListening) {
      console.warn('⚠️ Já está ouvindo')
      return false
    }

    this.onResultCallback = onResult
    this.onErrorCallback = onError

    try {
      this.recognition.start()
      return true
    } catch (error) {
      console.error('❌ Erro ao iniciar Speech Recognition:', error)
      if (onError) onError('Erro ao iniciar reconhecimento de voz')
      return false
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
    }
  }

  // ===== UTILITÁRIOS =====

  isSpeechRecognitionAvailable(): boolean {
    const hasAPI = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    const canUse = canUseSpeechRecognition()
    return hasAPI && canUse
  }

  isTextToSpeechAvailable(): boolean {
    return 'speechSynthesis' in window
  }

  isCurrentlyListening(): boolean {
    return this.isListening
  }

  isCurrentlySpeaking(): boolean {
    return this.synthesis.speaking
  }

  // Obter informações do sistema de voz
  getVoiceInfo() {
    return {
      speechRecognitionAvailable: this.isSpeechRecognitionAvailable(),
      textToSpeechAvailable: this.isTextToSpeechAvailable(),
      noaVoice: this.noaVoice?.name || 'Padrão',
      totalVoices: this.voices.length,
      portugueseVoices: this.voices.filter(v => v.lang.startsWith('pt')).length,
      isListening: this.isListening,
      isSpeaking: this.isCurrentlySpeaking(),
      config: this.NOA_VOICE_CONFIG
    }
  }

  // Forçar recarregamento de vozes
  reloadVoices() {
    this.loadVoices()
    console.log('🎤 Vozes recarregadas, voz Nôa selecionada:', this.noaVoice?.name)
  }
}

// Instância única do serviço
export const noaVoiceService = new NoaVoiceService()
