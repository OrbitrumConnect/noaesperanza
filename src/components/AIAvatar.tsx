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
  
  console.log('🤖 AIAvatar renderizado:', { isListening, specialty })

  // Piscar de olho randômico
  useEffect(() => {
    const interval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, Math.random() * 5000 + 2000) // entre 2s e 7s
    
    return () => clearInterval(interval)
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
    <div className="relative w-[533px] h-[533px] cursor-pointer hover:scale-105 transition-transform" onClick={handleClick}>
      {/* Imagem base da Nôa */}
      <img
        src="./avatar-default.jpg"
        alt="NOA Esperanza"
        className="w-full h-full object-cover rounded-full border-4 border-green-400 shadow-lg"
        onError={(e) => {
          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA0IiBoZWlnaHQ9IjEwNCIgdmlld0JveD0iMCAwIDEwNCAxMDQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDQiIGhlaWdodD0iMTA0IiBmaWxsPSIjMTA5NjMxIi8+CjxjaXJjbGUgY3g9IjUyIiBjeT0iMzgiIHI9IjE4IiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0yNiA4NkMyNiA3MS4xNjQyIDM4LjE2NDIgNTkgNTMgNTlINDFDMzguMTY0MiA1OSAyNiA3MS4xNjQyIDI2IDg2WiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4K'
        }}
      />

      {/* Olhos piscando (simulação com overlay preto) */}
      <div
        className={`absolute top-[32%] left-[25%] w-[50px] h-[20px] bg-black rounded-full transition-all duration-150 ${
          isBlinking ? "opacity-90" : "opacity-0"
        }`}
      ></div>
      <div
        className={`absolute top-[32%] right-[25%] w-[50px] h-[20px] bg-black rounded-full transition-all duration-150 ${
          isBlinking ? "opacity-90" : "opacity-0"
        }`}
      ></div>

      {/* Boca brilhando quando escutando */}
      <div
        className={`absolute bottom-[25%] left-1/2 transform -translate-x-1/2 w-[80px] h-[10px] rounded-full transition-all ${
          isListening ? "bg-green-400 shadow-lg shadow-green-500 animate-pulse" : "bg-transparent"
        }`}
      ></div>

      {/* Anel pulsante quando escutando */}
      {isListening && (
        <div className={`absolute inset-0 rounded-full border-4 ${currentColors.ring} ${currentColors.glow} animate-ping`}></div>
      )}

      {/* Partículas flutuantes sutis */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-cyan-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-[30%] right-[20%] w-1 h-1 bg-green-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[30%] left-[30%] w-1 h-1 bg-yellow-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-[20%] right-[30%] w-1 h-1 bg-cyan-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}></div>
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
  )
}

export default AIAvatar
