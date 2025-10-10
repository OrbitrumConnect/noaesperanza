import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import GPTPBuilder from '../components/GPTPBuilder'
import { supabase } from '../integrations/supabase/client'
import { clinicalAssessmentService } from '../services/clinicalAssessmentService'
import { useAuth } from '../contexts/AuthContext'

interface AdminDashboardProps {
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const AdminDashboard = ({ addNotification }: AdminDashboardProps) => {
  const [totalAssessments, setTotalAssessments] = useState<number>(0)
  const { user, userProfile } = useAuth()
  const builderUserId = user?.id || 'dr-ricardo-valenca'
  const builderUserName = userProfile?.name || user?.email || 'Dr. Ricardo Valença'
  const builderUserType = useMemo(() => (
    (userProfile?.user_type as 'paciente' | 'aluno' | 'profissional' | 'admin' | 'medico' | undefined) || 'admin'
  ), [userProfile?.user_type])

  const loadAssessmentsKPI = async () => {
    try {
      // Tenta via Supabase
      const { count, error } = await supabase
        .from('avaliacoes_iniciais')
        .select('*', { count: 'exact', head: true })
      if (!error && typeof count === 'number') {
        setTotalAssessments(count)
        return
      }
    } catch {}
    // Fallback local
    const localTotal = Number(localStorage.getItem('kpi_total_assessments') || '0')
    setTotalAssessments(localTotal)
  }

  useEffect(() => {
    loadAssessmentsKPI()
  }, [])

  const simulateClinicalAssessment = async () => {
    try {
      // Iniciar avaliação simulada
      const assessment = clinicalAssessmentService.startAssessment('sim_paciente')

      const next = () => clinicalAssessmentService.getNextQuestion()
      const answer = (q: string, a: string, category: any) => clinicalAssessmentService.recordResponse(q, a, category)

      // Identificação
      answer(next(), 'João da Silva', 'identification' as any)
      answer(next(), 'Dor de cabeça crônica há meses', 'complaints')

      // Lista indiciária
      answer('O que mais?', 'Insônia frequente', 'complaints')
      answer('O que mais?', 'Ansiedade em períodos de estresse', 'complaints')
      answer('O que mais?', 'não, nada mais', 'complaints')
      next()

      // Queixa principal
      answer('De todas essas questões, qual mais o(a) incomoda?', 'Dor de cabeça crônica', 'complaints')

      // Desenvolvimento da queixa
      answer('Onde você sente dor de cabeça crônica?', 'Região frontal e têmporas', 'complaints')
      answer('Quando essa dor de cabeça crônica começou?', 'Há cerca de 8 meses', 'complaints')
      answer('Como é a dor de cabeça crônica?', 'Latejante, intensidade moderada a forte', 'complaints')
      answer('O que mais você sente quando está com a dor de cabeça crônica?', 'Náusea leve e fotofobia', 'complaints')
      answer('O que parece melhorar a dor de cabeça crônica?', 'Ambiente escuro e repouso', 'complaints')
      answer('O que parece piorar a dor de cabeça crônica?', 'Estresse e falta de sono', 'complaints')
      next()

      // História patológica pregressa
      answer('E agora, sobre o restante sua vida até aqui...', 'Infecção renal na infância', 'history')
      answer('O que mais?', 'Crise de enxaqueca aos 22 anos', 'history')
      answer('O que mais?', 'não, nada mais', 'history')
      next()

      // História familiar
      answer('E na sua família? Começando pela parte de sua mãe...', 'Mãe com enxaqueca e hipertensão', 'family')
      answer('O que mais?', 'Avó materna com diabetes', 'family')
      answer('O que mais?', 'não, nada mais', 'family')
      answer('E por parte de seu pai?', 'Pai com hipertensão', 'family')
      answer('O que mais?', 'Avô paterno com AVC aos 70 anos', 'family')
      answer('O que mais?', 'não, nada mais', 'family')
      next()

      // Hábitos de vida
      answer('Além dos hábitos de vida...', 'Sono irregular (5-6h/noite)', 'habits')
      answer('O que mais?', 'Café 3x/dia', 'habits')
      answer('O que mais?', 'Exercício leve 2x/semana', 'habits')
      answer('O que mais?', 'não, nada mais', 'habits')
      next()

      // Perguntas finais
      answer('Você tem alguma alergia (mudança de tempo, medicação, poeira...)?', 'Alergia a dipirona; mudança de tempo', 'medications')
      answer('Quais as medicações que você utiliza regularmente?', 'Magnésio e riboflavina', 'medications')
      answer('Quais as medicações você utiliza esporadicamente...', 'Ibuprofeno eventualmente por orientação médica', 'medications')

      // Revisão e geração do relatório
      const summary = next() // "Vamos revisar..."
      const final = next()   // Gera o relatório (summary)
      const result = await clinicalAssessmentService.completeAssessment()

      // Guardar para o dashboard do paciente (fallback local)
      try {
        localStorage.setItem('kpi_last_assessment_report', JSON.stringify({ summary: final }))
        localStorage.setItem('kpi_last_assessment_nft', result.nftHash)
      } catch {}

      addNotification('Avaliação clínica simulada com sucesso. Relatório disponível no perfil do paciente.', 'success')
      loadAssessmentsKPI()
    } catch (e) {
      console.error(e)
      addNotification('Falha ao simular avaliação clínica', 'error')
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-slate-900">
            {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Link to="/" className="inline-block text-blue-400 hover:text-blue-300 text-sm">
              <i className="fas fa-arrow-left text-sm mr-1"></i> Voltar
            </Link>
            <Link to="/home" className="inline-block text-purple-400 hover:text-purple-300 text-sm">
              <i className="fas fa-home text-sm mr-1"></i> Home Antiga
            </Link>
          </div>
          <h1 className="text-lg font-bold text-white">Dashboard Administrativo</h1>
          <div className="w-32"></div> {/* Spacer for centering */}
        </div>
      </div>

      {/* GPT Builder Full Screen */}
      <div className="flex-1 overflow-hidden pb-20">
        <GPTPBuilder
          userId={builderUserId}
          userName={builderUserName}
          userType={builderUserType}
        />
      </div>
    </div>
  )
}

export default AdminDashboard