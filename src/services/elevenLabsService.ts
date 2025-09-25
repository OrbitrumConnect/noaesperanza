// Serviço para integração com ElevenLabs (Voz da NOA)
export interface VoiceSettings {
  stability: number
  similarity_boost: number
  style?: number
  use_speaker_boost?: boolean
}

export interface Voice {
  voice_id: string
  name: string
  samples?: any[]
  category: string
  fine_tuning?: any
  labels: Record<string, string>
  description?: string
  preview_url?: string
  available_for_tiers: string[]
  settings?: VoiceSettings
  sharing?: any
  high_quality_base_model_ids: string[]
  safety_control?: any
  permission_on_resource?: any
}

export interface TextToSpeechRequest {
  text: string
  model_id?: string
  voice_settings?: VoiceSettings
}

export interface TextToSpeechResponse {
  audio: ArrayBuffer
  content_type: string
}

class ElevenLabsService {
  private apiKey: string
  private agentId: string
  private baseURL = 'https://api.elevenlabs.io/v1'
  private noaVoiceId = 'pNInz6obpgDQGcFmaJgB' // Voz feminina suave para NOA

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVEN_API_KEY
    this.agentId = import.meta.env.VITE_ELEVEN_AGENT_ID
    
    if (!this.apiKey) {
      console.error('ElevenLabs API Key não encontrada')
    }
  }

  // Obter lista de vozes disponíveis
  async getVoices(): Promise<Voice[]> {
    try {
      const response = await fetch(`${this.baseURL}/voices`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API Error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.voices

    } catch (error) {
      console.error('Erro ao obter vozes:', error)
      throw error
    }
  }

  // Converter texto em fala
  async textToSpeech(
    text: string,
    voiceId: string = this.noaVoiceId,
    voiceSettings?: VoiceSettings
  ): Promise<TextToSpeechResponse> {
    try {
      const requestBody: TextToSpeechRequest = {
        text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voiceSettings || {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true
        }
      }

      const response = await fetch(`${this.baseURL}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API Error: ${response.statusText}`)
      }

      const audioBuffer = await response.arrayBuffer()
      const contentType = response.headers.get('content-type') || 'audio/mpeg'

      return {
        audio: audioBuffer,
        content_type: contentType
      }

    } catch (error) {
      console.error('Erro ao converter texto em fala:', error)
      throw error
    }
  }

  // Reproduzir áudio da NOA
  async speakAsNoa(text: string): Promise<void> {
    try {
      const audioResponse = await this.textToSpeech(text)
      
      // Criar blob do áudio
      const audioBlob = new Blob([audioResponse.audio], { 
        type: audioResponse.content_type 
      })
      
      // Criar URL do áudio
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Criar elemento de áudio
      const audio = new Audio(audioUrl)
      
      // Reproduzir áudio
      await audio.play()
      
      // Limpar URL após reprodução
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
      }

    } catch (error) {
      console.error('Erro ao reproduzir áudio da NOA:', error)
      throw error
    }
  }

  // Obter configurações de voz da NOA
  getNoaVoiceSettings(): VoiceSettings {
    return {
      stability: 0.6, // Voz mais estável
      similarity_boost: 0.8, // Manter características da voz
      style: 0.2, // Ligeiramente mais expressiva
      use_speaker_boost: true // Melhorar qualidade
    }
  }

  // Verificar se o serviço está disponível
  async isAvailable(): Promise<boolean> {
    try {
      await this.getVoices()
      return true
    } catch (error) {
      return false
    }
  }

  // Obter informações da conta
  async getUserInfo() {
    try {
      const response = await fetch(`${this.baseURL}/user`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API Error: ${response.statusText}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error)
      throw error
    }
  }

  // Obter uso da API
  async getUsage() {
    try {
      const response = await fetch(`${this.baseURL}/user/usage`, {
        method: 'GET',
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API Error: ${response.statusText}`)
      }

      return await response.json()

    } catch (error) {
      console.error('Erro ao obter uso da API:', error)
      throw error
    }
  }
}

export const elevenLabsService = new ElevenLabsService()
