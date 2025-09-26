import React, { useState } from 'react'
import { voiceAgent } from '../gpt/voiceAgent'
import { clinicalAgent } from '../gpt/clinicalAgent'
import { visualAgent } from '../gpt/visualAgent'
import { NoaGPT } from '../gpt/noaGPT'

interface SidebarProps {
  currentSpecialty: any
  isVoiceListening: boolean
  setIsVoiceListening: (listening: boolean) => void
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const Sidebar = ({
  currentSpecialty,
  isVoiceListening,
  setIsVoiceListening,
  addNotification
}: SidebarProps) => {
  const [manualCommand, setManualCommand] = useState('')
  const noaGPT = new NoaGPT()

  const handleVoiceToggle = () => {
    const comando = isVoiceListening
      ? 'desativar controle por voz'
      : 'ativar controle por voz'

    const resposta = voiceAgent.executarComando(comando)
    setIsVoiceListening(!isVoiceListening)
    // Apenas notificar se houver erro
    if (resposta.includes('erro') || resposta.includes('falha')) {
      addNotification(resposta, 'error')
    }
  }

  const handleCriarAvaliacao = async () => {
    const comando =
      'criar avaliação Avaliação Mock com o conteúdo Paciente relata dor lombar crônica há 2 semanas.'
    const resposta = await clinicalAgent.executarAcao(comando)
    // Apenas notificar sucesso se for realmente importante
    addNotification('✅ Avaliação clínica criada', 'success')
  }

  const handleDesenharTela = async () => {
    const comando =
      'desenhar tela de avaliação clínica com campos nome, idade e histórico'
    const resposta = await visualAgent.gerarInterface(comando)
    // Não mostrar notificação, apenas log no console
    console.log('🎨 Interface gerada:', resposta)
  }

  const handleComandoManual = async () => {
    if (!manualCommand.trim()) return
    const resposta = await noaGPT.processCommand(manualCommand)
    // Apenas notificar se for uma resposta importante
    if (resposta.length > 50) {
      addNotification('✅ Comando executado com sucesso', 'success')
    }
    setManualCommand('')
  }

  return (
    <div className="space-y-6 p-4 border-r border-gray-600 h-full bg-gray-900/50 backdrop-blur-sm shadow-lg">
      <h2 className="text-xl font-bold text-premium">Nôa Esperanza</h2>

      {/* Controle por voz */}
      <button
        onClick={handleVoiceToggle}
        className={`w-full py-3 rounded-lg transition-all duration-300 ${
          isVoiceListening 
            ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30'
        }`}
      >
        {isVoiceListening ? '🎤 Desativar Voz' : '🎤 Ativar Voz'}
      </button>

      {/* Criar avaliação mock */}
      <button
        onClick={handleCriarAvaliacao}
        className="w-full bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 py-3 rounded-lg transition-all duration-300"
      >
        🩺 Criar Avaliação Clínica
      </button>

      {/* Desenhar tela mock */}
      <button
        onClick={handleDesenharTela}
        className="w-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 py-3 rounded-lg transition-all duration-300"
      >
        🎨 Desenhar Tela Visual
      </button>

      {/* Comando manual */}
      <div className="space-y-3">
        <input
          type="text"
          value={manualCommand}
          onChange={(e) => setManualCommand(e.target.value)}
          placeholder="Digite um comando para NOA..."
          className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-premium transition-colors"
        />
        <button
          onClick={handleComandoManual}
          className="w-full bg-gray-800/50 text-white border border-gray-600 hover:bg-gray-700/50 hover:border-premium py-3 rounded-lg transition-all duration-300"
        >
          🤖 Executar Comando
        </button>
      </div>
    </div>
  )
}

export default Sidebar
