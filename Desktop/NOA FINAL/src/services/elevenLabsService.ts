// Serviço de voz da NOA usando Web Speech API (voz residente)
import { webSpeechService } from './webSpeechService'

export interface VoiceSettings {
  rate: number
  pitch: number
  volume: number
  lang: string
}

export interface Voice {
  name: string
  lang: string
  gender: string
  description?: string
}

export interface TextToSpeechRequest {
  text: string
  voice_settings?: VoiceSettings
}

export interface TextToSpeechResponse {
  audio: ArrayBuffer
  content_type: string
}

class ElevenLabsService {
  private useWebSpeech: boolean = true // Sempre usar Web Speech API
  private voiceSettings: VoiceSettings = {
    rate: 0.85,      // Velocidade mais lenta (mais feminina)
    pitch: 1.3,      // Tom mais alto (mais feminino)
    volume: 0.8,     // Volume confortável
    lang: 'pt-BR'    // Português brasileiro
  }

  constructor() {
    console.log('🔧 NOA Voice Service inicializado (Web Speech API):', { 
      useWebSpeech: this.useWebSpeech,
      voiceSettings: this.voiceSettings,
      mode: 'TTS_ONLY'
    })
  }

  // Obter lista de vozes disponíveis (Web Speech API)
  async getVoices(): Promise<Voice[]> {
    try {
      const voiceInfo = webSpeechService.getVoiceInfo()
      
      // Converter vozes do Web Speech API para o formato esperado
      const voices: Voice[] = voiceInfo.allVoices.map(voiceStr => {
        const [name, lang] = voiceStr.split(' (')
        return {
          name: name,
          lang: lang.replace(')', ''),
          gender: name.toLowerCase().includes('female') || name.toLowerCase().includes('woman') ? 'female' : 'unknown',
          description: `Voz nativa do navegador - ${name}`
        }
      })

      console.log('🎤 Vozes disponíveis (Web Speech API):', voices.length)
      return voices

    } catch (error) {
      console.error('Erro ao obter vozes:', error)
      return []
    }
  }

  // Converter texto em fala usando Web Speech API
  async textToSpeech(
    text: string,
    voiceId?: string,
    voiceSettings?: VoiceSettings
  ): Promise<TextToSpeechResponse> {
    try {
      console.log('🎤 NOA Voice Service textToSpeech chamado:', { 
        text: text.substring(0, 50) + '...', 
        useWebSpeech: this.useWebSpeech 
      })
      
      // Usar Web Speech API diretamente
      await webSpeechService.textToSpeech(text)
      
      // Retornar resposta compatível com o formato esperado
      return { 
        audio: new ArrayBuffer(0), 
        content_type: 'audio/web-speech' 
      }

    } catch (error) {
      console.error('❌ Erro no NOA Voice Service:', error)
      throw error
    }
  }

  // Parar fala atual
  stopSpeech(): void {
    try {
      webSpeechService.stopSpeech()
      console.log('🎤 Fala interrompida via Web Speech API')
    } catch (error) {
      console.error('❌ Erro ao parar fala:', error)
    }
  }

  // Verificar se o serviço está disponível
  isAvailable(): boolean {
    return webSpeechService.isAvailable()
  }

  // Obter informações do serviço
  getServiceInfo() {
    const voiceInfo = webSpeechService.getVoiceInfo()
    return {
      service: 'Web Speech API',
      available: this.isAvailable(),
      useWebSpeech: this.useWebSpeech,
      voiceSettings: this.voiceSettings,
      voiceInfo: voiceInfo,
      mode: 'TTS_ONLY'
    }
  }

  // Configurar voz (aplicar configurações personalizadas)
  configureVoice(settings: Partial<VoiceSettings>): void {
    this.voiceSettings = { ...this.voiceSettings, ...settings }
    console.log('🎤 Configurações de voz atualizadas:', this.voiceSettings)
  }

  // Forçar recarregamento de vozes
  reloadVoices(): void {
    webSpeechService.forceFemaleVoice()
    console.log('🎤 Vozes recarregadas')
  }
}

// Instância única do serviço
export const elevenLabsService = new ElevenLabsService()