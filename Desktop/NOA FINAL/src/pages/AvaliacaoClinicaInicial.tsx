import React, { useState } from 'react'
import { ClinicalAssessment } from '../components/ClinicalAssessment'

const AvaliacaoClinicaInicial: React.FC = () => {
  const [completed, setCompleted] = useState<{ nftHash: string } | null>(null)

  const handleComplete = (report: any, nftHash: string) => {
    try {
      const total = Number(localStorage.getItem('kpi_total_assessments') || '0') + 1
      localStorage.setItem('kpi_total_assessments', String(total))
      localStorage.setItem('kpi_last_assessment_report', JSON.stringify(report))
      localStorage.setItem('kpi_last_assessment_nft', nftHash)
    } catch {}
    setCompleted({ nftHash })
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] max-w-5xl mx-auto p-4">
      <h1 className="text-white text-xl font-semibold mb-4">Avaliação Clínica Inicial</h1>
      {completed ? (
        <div className="p-4 bg-green-900/30 border border-green-600/40 rounded-lg text-green-300 text-sm">
          Avaliação concluída. NFT: <span className="font-mono">{completed.nftHash}</span>
        </div>
      ) : (
        <ClinicalAssessment onComplete={handleComplete} onUpdateKPIs={() => {}} />
      )}
    </div>
  )
}

export default AvaliacaoClinicaInicial


