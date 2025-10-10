import { useState } from 'react'
import { Link } from 'react-router-dom'

interface Exam {
  id: string
  name: string
  date: string
  status: 'completed' | 'pending' | 'scheduled'
  doctor: string
}

const MeusExames = () => {
  const [exams] = useState<Exam[]>([
    {
      id: '1',
      name: 'Hemograma Completo',
      date: '2025-01-15',
      status: 'completed',
      doctor: 'Dr. Carlos Silva'
    },
    {
      id: '2',
      name: 'Tomografia do Crânio',
      date: '2025-01-20',
      status: 'scheduled',
      doctor: 'Dr. Carlos Silva'
    },
    {
      id: '3',
      name: 'Eletroencefalograma',
      date: '2025-01-10',
      status: 'pending',
      doctor: 'Dr. Carlos Silva'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'scheduled': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'pending': return 'Pendente'
      case 'scheduled': return 'Agendado'
      default: return status
    }
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 h-full pb-16">
        
        {/* Header */}
        <div className="mb-4">
          <Link to="/paciente" className="inline-block text-yellow-400 hover:text-yellow-300 mb-2">
            <i className="fas fa-arrow-left text-sm"></i> Voltar
          </Link>
          <h1 className="text-xl font-bold text-premium mb-2">Meus Exames</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="premium-card p-3 text-center">
            <p className="text-gray-300 text-sm">Total de Exames</p>
            <p className="text-lg font-bold text-premium">{exams.length}</p>
          </div>
          <div className="premium-card p-3 text-center">
            <p className="text-gray-300 text-sm">Concluídos</p>
            <p className="text-lg font-bold text-green-400">
              {exams.filter(e => e.status === 'completed').length}
            </p>
          </div>
          <div className="premium-card p-3 text-center">
            <p className="text-gray-300 text-sm">Pendentes</p>
            <p className="text-lg font-bold text-yellow-400">
              {exams.filter(e => e.status === 'pending' || e.status === 'scheduled').length}
            </p>
          </div>
        </div>

        {/* Exams List */}
        <div className="premium-card p-4">
          <h2 className="text-lg font-semibold text-premium mb-4">Exames</h2>
          <div className="space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="border border-gray-600 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">{exam.name}</h3>
                    <p className="text-sm text-gray-300">
                      {new Date(exam.date).toLocaleDateString('pt-BR')} • {exam.doctor}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                    {getStatusText(exam.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MeusExames
