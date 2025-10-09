// Serviço de voz feminina fluida usando Web Speech API
export class WebSpeechService {
  private synthesis: SpeechSynthesis
  private voices: SpeechSynthesisVoice[] = []
  private femaleVoice: SpeechSynthesisVoice | null = null

  constructor() {
    this.synthesis = window.speechSynthesis
    this.loadVoices()
    
    // Recarregar vozes quando disponíveis (alguns navegadores carregam assincronamente)
    if (this.synthesis.onvoiceschanged !== undefined) {
      this.synthesis.onvoiceschanged = () => {
        this.loadVoices()
      }
    }
  }

  private loadVoices() {
    // Carregar vozes disponíveis
    this.voices = this.synthesis.getVoices()
    
    // Procurar por voz feminina em português (mais específico)
    this.femaleVoice = this.voices.find(voice => 
      voice.lang.startsWith('pt') && 
      (voice.name.toLowerCase().includes('female') || 
       voice.name.toLowerCase().includes('woman') ||
       voice.name.toLowerCase().includes('feminina') ||
       voice.name.toLowerCase().includes('maria') ||
       voice.name.toLowerCase().includes('ana') ||
       voice.name.toLowerCase().includes('lucia') ||
       voice.name.toLowerCase().includes('helena') ||
       voice.name.toLowerCase().includes('cristina') ||
       voice.name.toLowerCase().includes('sandra') ||
       voice.name.toLowerCase().includes('patricia'))
    ) || this.voices.find(voice => 
      voice.lang.startsWith('pt') && 
      !voice.name.toLowerCase().includes('male') &&
      !voice.name.toLowerCase().includes('man') &&
      !voice.name.toLowerCase().includes('masculino')
    ) || this.voices.find(voice => voice.lang.startsWith('pt')) || null

    console.log('🎤 Vozes disponíveis:', this.voices.map(v => `${v.name} (${v.lang})`))
    console.log('🎤 Voz feminina selecionada:', this.femaleVoice?.name || 'Padrão')
  }

  // Converte texto em fala com voz feminina fluida
  async textToSpeech(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Parar qualquer fala em andamento
        this.synthesis.cancel()

        // Criar utterance
        const utterance = new SpeechSynthesisUtterance(text)
        
        // Configurar voz feminina
        if (this.femaleVoice) {
          utterance.voice = this.femaleVoice
        }

        // Configurações para voz feminina fluida e natural
        utterance.rate = 0.85       // Velocidade mais lenta (mais feminina)
        utterance.pitch = 1.3       // Tom mais alto (mais feminino)
        utterance.volume = 0.8      // Volume confortável
        utterance.lang = 'pt-BR'    // Português brasileiro

        // Eventos
        utterance.onstart = () => {
          console.log('🎤 Iniciando fala com Web Speech API')
        }

        utterance.onend = () => {
          console.log('🎤 Fala concluída com Web Speech API')
          resolve()
        }

        utterance.onerror = (event) => {
          console.error('❌ Erro na Web Speech API:', event.error)
          reject(new Error(`Web Speech API Error: ${event.error}`))
        }

        // Iniciar fala
        this.synthesis.speak(utterance)

      } catch (error) {
        console.error('❌ Erro ao configurar Web Speech API:', error)
        reject(error)
      }
    })
  }

  // Parar fala atual
  stopSpeech() {
    this.synthesis.cancel()
    console.log('🎤 Fala interrompida')
  }

  // Verificar se a API está disponível
  isAvailable(): boolean {
    return 'speechSynthesis' in window
  }

  // Obter informações da voz atual
  getVoiceInfo() {
    return {
      available: this.isAvailable(),
      femaleVoice: this.femaleVoice?.name || 'Padrão',
      totalVoices: this.voices.length,
      portugueseVoices: this.voices.filter(v => v.lang.startsWith('pt')).length,
      allVoices: this.voices.map(v => `${v.name} (${v.lang})`)
    }
  }

  // Forçar seleção de voz feminina
  forceFemaleVoice() {
    this.loadVoices()
    console.log('🎤 Vozes recarregadas, voz feminina selecionada:', this.femaleVoice?.name)
  }
}

// Instância única do serviço
export const webSpeechService = new WebSpeechService()
