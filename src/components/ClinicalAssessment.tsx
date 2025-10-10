import React, { useState, useEffect } from 'react'
import { clinicalAssessmentService, ClinicalAssessmentData, AssessmentStage } from '../services/clinicalAssessmentService'

interface ClinicalAssessmentProps {
  onComplete?: (report: any, nftHash: string) => void
  onUpdateKPIs?: (stats: any) => void
}

export const ClinicalAssessment: React.FC<ClinicalAssessmentProps> = ({ 
  onComplete, 
  onUpdateKPIs 
}) => {
  const [assessment, setAssessment] = useState<ClinicalAssessmentData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [userAnswer, setUserAnswer] = useState<string>('')
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState<boolean>(false)
  const [showReport, setShowReport] = useState<boolean>(false)
  const [report, setReport] = useState<any>(null)
  const [nftHash, setNftHash] = useState<string>('')

  // Iniciar avaliação
  const startAssessment = () => {
    const newAssessment = clinicalAssessmentService.startAssessment('user_001')
    setAssessment(newAssessment)
    setCurrentQuestion(clinicalAssessmentService.getNextQuestion())
    setIsWaitingForAnswer(true)
    setShowReport(false)
  }

  // Enviar resposta
  const submitAnswer = async () => {
    if (!assessment || !userAnswer.trim()) return

    // Determinar categoria baseada no estágio
    let category: any = 'identification'
    switch (assessment.stage) {
      case 'identification':
      case 'complaints_list':
      case 'main_complaint':
      case 'complaint_development':
        category = 'complaints'
        break
      case 'medical_history':
        category = 'history'
        break
      case 'family_history':
        category = 'family'
        break
      case 'lifestyle_habits':
        category = 'habits'
        break
      case 'medications_allergies':
        category = 'medications'
        break
    }

    // Registrar resposta
    clinicalAssessmentService.recordResponse(currentQuestion, userAnswer, category)
    
    // Obter próxima pergunta
    const nextQuestion = clinicalAssessmentService.getNextQuestion()
    
    // Atualizar estado
    setCurrentQuestion(nextQuestion)
    setUserAnswer('')
    
    // Atualizar KPIs
    if (onUpdateKPIs) {
      onUpdateKPIs(clinicalAssessmentService.getAssessmentStats())
    }

    // Se chegou ao relatório final
    if (nextQuestion.includes('RELATÓRIO DE AVALIAÇÃO CLÍNICA INICIAL')) {
      setIsWaitingForAnswer(false)
      setShowReport(true)
      setReport(clinicalAssessmentService.getCurrentAssessment()?.finalReport)
    }
  }

  // Finalizar avaliação
  const completeAssessment = async () => {
    try {
      const result = await clinicalAssessmentService.completeAssessment()
      setNftHash(result.nftHash)
      
      if (onComplete) {
        onComplete(result.report, result.nftHash)
      }
      
      if (onUpdateKPIs) {
        onUpdateKPIs(clinicalAssessmentService.getAssessmentStats())
      }
    } catch (error) {
      console.error('Erro ao finalizar avaliação:', error)
    }
  }

  // Renderizar estágio atual
  const renderStage = () => {
    if (!assessment) return null

    const stageNames: Record<AssessmentStage, string> = {
      'identification': 'Identificação',
      'complaints_list': 'Lista de Queixas',
      'main_complaint': 'Queixa Principal',
      'complaint_development': 'Desenvolvimento da Queixa',
      'medical_history': 'História Médica',
      'family_history': 'História Familiar',
      'lifestyle_habits': 'Hábitos de Vida',
      'medications_allergies': 'Medicações e Alergias',
      'review': 'Revisão',
      'final_report': 'Relatório Final',
      'completed': 'Concluído'
    }

    return (
      <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
        {stageNames[assessment.stage]}
      </div>
    )
  }

  if (showReport && report) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-600">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">📋 Relatório de Avaliação Clínica</h3>
          {renderStage()}
        </div>

        <div className="bg-slate-700 rounded-lg p-4 mb-4">
          <pre className="text-white text-sm whitespace-pre-wrap font-mono">
            {report.summary}
          </pre>
        </div>

        <div className="flex gap-3">
          <button
            onClick={completeAssessment}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ✅ Concordar e Gerar NFT
          </button>
          <button
            onClick={() => setShowReport(false)}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            ✏️ Revisar
          </button>
        </div>

        {nftHash && (
          <div className="mt-4 p-3 bg-green-900 rounded-lg">
            <p className="text-green-300 text-sm">
              🎉 NFT gerado com sucesso! Hash: <code className="bg-green-800 px-2 py-1 rounded">{nftHash}</code>
            </p>
          </div>
        )}
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-600">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-4">
            📋 Avaliação Clínica Inicial
          </h3>
          <p className="text-gray-400 mb-6">
            Processo estruturado de entrevista clínica inicial para consultas médicas
          </p>
          <button
            onClick={startAssessment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            🚀 Iniciar Avaliação Clínica
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">
          🏥 Avaliação Clínica Inicial
        </h3>
        {renderStage()}
      </div>

      <div className="bg-slate-700 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <div className="flex-1">
            <p className="text-white text-sm">
              {currentQuestion}
            </p>
          </div>
        </div>
      </div>

      {isWaitingForAnswer && (
        <div className="space-y-3">
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Digite sua resposta..."
            className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            rows={3}
          />
          
          <button
            onClick={submitAnswer}
            disabled={!userAnswer.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Enviar Resposta
          </button>
        </div>
      )}

      {/* Progresso */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progresso</span>
          <span>{assessment.responses.length} respostas</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(assessment.responses.length / 20) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
