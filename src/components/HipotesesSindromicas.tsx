// 🧠 COMPONENTE DE HIPÓTESES SINDROMICAS
// Exibe análise médica automática com hipóteses diagnósticas
// Dr. Ricardo Valença - Nôa Esperanza

import React from 'react'
import { AnaliseMedica, HipoteseSindromica } from '../services/hipotesesSindromicasService'

interface HipotesesSindromicasProps {
  analiseMedica: AnaliseMedica
  className?: string
}

export const HipotesesSindromicas: React.FC<HipotesesSindromicasProps> = ({ 
  analiseMedica, 
  className = '' 
}) => {
  const getUrgenciaEmoji = (urgencia: string) => {
    switch (urgencia) {
      case 'baixa': return '✅'
      case 'media': return '⚠️'
      case 'alta': return '🚨'
      case 'emergencia': return '🚨🚨'
      default: return '❓'
    }
  }

  const getUrgenciaTexto = (urgencia: string) => {
    switch (urgencia) {
      case 'baixa': return 'BAIXA PRIORIDADE'
      case 'media': return 'PRIORIDADE MÉDIA'
      case 'alta': return 'ALTA PRIORIDADE'
      case 'emergencia': return 'EMERGÊNCIA MÉDICA'
      default: return 'PRIORIDADE INDEFINIDA'
    }
  }

  const getUrgenciaCor = (urgencia: string) => {
    switch (urgencia) {
      case 'baixa': return 'text-green-600 bg-green-50 border-green-200'
      case 'media': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'alta': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'emergencia': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getCategoriaCor = (categoria: string) => {
    switch (categoria) {
      case 'neurologia': return 'bg-blue-100 text-blue-800'
      case 'nefrologia': return 'bg-green-100 text-green-800'
      case 'cannabis': return 'bg-purple-100 text-purple-800'
      case 'geral': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProbabilidadeCor = (probabilidade: number) => {
    if (probabilidade >= 80) return 'text-red-600 font-bold'
    if (probabilidade >= 60) return 'text-orange-600 font-semibold'
    if (probabilidade >= 40) return 'text-yellow-600 font-medium'
    return 'text-green-600 font-normal'
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* CABEÇALHO */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">🧠</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Análise Médica</h2>
            <p className="text-gray-600">Hipóteses Sindrômicas Automáticas</p>
          </div>
        </div>

        {/* NÍVEL DE URGÊNCIA */}
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 ${getUrgenciaCor(analiseMedica.nivelUrgencia)}`}>
          <span className="text-2xl">{getUrgenciaEmoji(analiseMedica.nivelUrgencia)}</span>
          <span className="font-bold">{getUrgenciaTexto(analiseMedica.nivelUrgencia)}</span>
        </div>
      </div>

      {/* SINTOMAS PRINCIPAIS */}
      {analiseMedica.sintomasPrincipais.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Sintomas Analisados</h3>
          <div className="grid gap-3">
            {analiseMedica.sintomasPrincipais.map((sintoma, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{sintoma.nome}</h4>
                  <span className="text-sm text-gray-500">Intensidade: {sintoma.intensidade}/10</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>Localização:</strong> {sintoma.localizacao}</p>
                  <p><strong>Duração:</strong> {sintoma.duracao}</p>
                  {sintoma.caracteristicas.length > 0 && (
                    <p><strong>Características:</strong> {sintoma.caracteristicas.join(', ')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HIPÓTESES DIAGNÓSTICAS */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Hipóteses Diagnósticas</h3>
        <div className="grid gap-4">
          {analiseMedica.hipoteses.map((hipotese, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                    <h4 className="text-lg font-semibold text-gray-900">{hipotese.nome}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoriaCor(hipotese.categoria)}`}>
                      {hipotese.categoria}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{hipotese.observacoes}</p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${getProbabilidadeCor(hipotese.probabilidade)}`}>
                    {hipotese.probabilidade}%
                  </div>
                  <div className="text-xs text-gray-500">probabilidade</div>
                </div>
              </div>

              {/* BARRA DE PROGRESSO */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${hipotese.probabilidade}%` }}
                ></div>
              </div>

              {/* DETALHES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Sintomas Relacionados:</p>
                  <p className="text-gray-700">{hipotese.sintomasRelacionados.join(', ')}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Urgência:</p>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getUrgenciaCor(hipotese.urgencia)}`}>
                    {getUrgenciaEmoji(hipotese.urgencia)} {hipotese.urgencia}
                  </span>
                </div>
              </div>

              {/* EXAMES SUGERIDOS */}
              {hipotese.examesSugeridos.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-gray-500 text-sm mb-2">Exames Sugeridos:</p>
                  <div className="flex flex-wrap gap-2">
                    {hipotese.examesSugeridos.map((exame, exameIndex) => (
                      <span key={exameIndex} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                        {exame}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* EXAMES RECOMENDADOS */}
      {analiseMedica.examesRecomendados.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Exames Recomendados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analiseMedica.examesRecomendados.map((exame, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">🔬</span>
                  <span className="text-blue-800 font-medium">{exame}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECOMENDAÇÃO MÉDICA */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recomendação Médica</h3>
        <div className={`p-4 rounded-lg border-2 ${getUrgenciaCor(analiseMedica.nivelUrgencia)}`}>
          <p className="font-medium">{analiseMedica.recomendacaoMedica}</p>
        </div>
      </div>

      {/* OBSERVAÇÕES GERAIS */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações Gerais</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700">{analiseMedica.observacoesGerais}</p>
        </div>
      </div>

      {/* AVISO IMPORTANTE */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-600 text-xl">⚠️</span>
          <div>
            <h4 className="font-semibold text-yellow-800 mb-2">Importante</h4>
            <p className="text-yellow-700 text-sm">
              Esta análise é baseada nos sintomas relatados e deve ser validada por um médico. 
              Não substitui uma consulta médica presencial. Em caso de emergência, procure 
              atendimento médico imediatamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HipotesesSindromicas
