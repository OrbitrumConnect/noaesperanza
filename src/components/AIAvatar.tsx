import { useState, useEffect } from 'react'
import { Specialty } from '../App'

interface AIAvatarProps {
  isListening: boolean
  onToggleListening: (listening: boolean) => void
  specialty: Specialty
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const AIAvatar = ({ isListening, onToggleListening, specialty, addNotification }: AIAvatarProps) => {
  const [isBlinking, setIsBlinking] = useState(false)
  const [eyeHeight, setEyeHeight] = useState(20)

  // Simulação de piscar os olhos
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance de piscar
        setIsBlinking(true)
        setEyeHeight(2)
        setTimeout(() => {
          setIsBlinking(false)
          setEyeHeight(20)
        }, 150)
      }
    }, 1000)

    return () => clearInterval(blinkInterval)
  }, [])

  const handleClick = () => {
    onToggleListening(!isListening)
    
    if (!isListening) {
      addNotification('🎤 Comando de voz ativado - Fale agora!', 'info')
      
      // Simula reconhecimento de voz
      if ('webkitSpeechRecognition' in window) {
        const recognition = new (window as any).webkitSpeechRecognition()
        recognition.lang = 'pt-BR'
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onresult = (event: any) => {
          const command = event.results[0][0].transcript
          addNotification(`Comando recebido: "${command}"`, 'success')
          onToggleListening(false)
        }

        recognition.onerror = () => {
          addNotification('Erro no reconhecimento de voz', 'error')
          onToggleListening(false)
        }

        recognition.start()
      } else {
        // Fallback para demonstração
        setTimeout(() => {
          addNotification('Comando simulado: "mostrar pacientes"', 'success')
          onToggleListening(false)
        }, 3000)
      }

      // Para automaticamente após 10 segundos
      setTimeout(() => {
        if (isListening) {
          onToggleListening(false)
          addNotification('🎤 Comando de voz finalizado', 'info')
        }
      }, 10000)
    } else {
      addNotification('🎤 Comando de voz desativado', 'info')
    }
  }

  const specialtyColors = {
    rim: { ring: 'border-green-500', glow: 'shadow-green-500/30' },
    neuro: { ring: 'border-blue-500', glow: 'shadow-blue-500/30' },
    cannabis: { ring: 'border-yellow-500', glow: 'shadow-yellow-500/30' }
  }

  const currentColors = specialtyColors[specialty]

  return (
    <div className="flex flex-col items-center">
      {/* Anel de Escuta */}
      {isListening && (
        <div className={`absolute w-60 h-60 rounded-full border-4 ${currentColors.ring} ${currentColors.glow} animate-ping`}></div>
      )}
      
      {/* Avatar Principal */}
      <div 
        className="ai-avatar cursor-pointer hover:scale-105 transition-transform relative z-10"
        onClick={handleClick}
      >
        {/* Fundo do Avatar */}
        <div className="absolute inset-4 bg-blue-900 rounded-full z-10"></div>
        
        {/* Face da IA */}
        <div className="relative z-20 flex flex-col items-center gap-6">
          {/* Olhos */}
          <div className="flex gap-6">
            <div 
              className="w-5 h-5 bg-cyan-400 rounded-full transition-all duration-150 glow-neuro"
              style={{ height: `${eyeHeight}px` }}
            ></div>
            <div 
              className="w-5 h-5 bg-cyan-400 rounded-full transition-all duration-150 glow-neuro"
              style={{ height: `${eyeHeight}px` }}
            ></div>
          </div>
          
          {/* Boca */}
          <div className="relative w-10 h-2 bg-green-400 rounded-full overflow-hidden glow-rim">
            {isListening && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-pulse"></div>
            )}
          </div>
        </div>
        
        {/* Indicador de Estado */}
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 px-3 py-1 rounded-full border border-gray-600">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isListening ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <span className="text-xs text-gray-300">
              {isListening ? 'Escutando' : 'Clique para falar'}
            </span>
          </div>
        </div>
      </div>

      {/* Ondas de Voz */}
      {isListening && (
        <div className="voice-wave mt-4">
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
          <div className="wave-bar"></div>
        </div>
      )}
    </div>
  )
}

export default AIAvatar
