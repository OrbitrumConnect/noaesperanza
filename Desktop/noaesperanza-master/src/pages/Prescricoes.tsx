import { useState } from 'react'
import { Link } from 'react-router-dom'

interface Prescription {
  id: string
  medication: string
  doctor: string
  date: string
  status: 'active' | 'completed' | 'expired'
}

const Prescricoes = () => {
  const [prescriptions] = useState<Prescription[]>([
    {
      id: '1',
      medication: 'Medicamento A',
      doctor: 'Dr. Carlos Silva',
      date: '2025-01-15',
      status: 'active'
    },
    {
      id: '2',
      medication: 'Medicamento B',
      doctor: 'Dr. Carlos Silva',
      date: '2025-01-10',
      status: 'active'
    },
    {
      id: '3',
      medication: 'Medicamento C',
      doctor: 'Dr. Carlos Silva',
      date: '2024-12-20',
      status: 'completed'
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'completed': return 'bg-blue-500/20 text-blue-400'
      case 'expired': return 'bg-red-500/20 text-red-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa'
      case 'completed': return 'Concluída'
      case 'expired': return 'Expirada'
      default: return status
    }
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="max-w-3xl mx-auto px-3 h-full pb-16">
        
        {/* Header */}
        <div className="mb-1">
          <Link to="/paciente" className="inline-block text-yellow-400 hover:text-yellow-300 text-xs">
            <i className="fas fa-arrow-left text-xs"></i> Voltar
          </Link>
          <h1 className="text-xs font-bold text-premium">Prescrições</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-1 mb-1">
          <div className="premium-card p-1 text-center">
            <p className="text-gray-300 text-xs">Total</p>
            <p className="text-xs font-bold text-premium">{prescriptions.length}</p>
          </div>
          <div className="premium-card p-1 text-center">
            <p className="text-gray-300 text-xs">Ativas</p>
            <p className="text-xs font-bold text-green-400">
              {prescriptions.filter(p => p.status === 'active').length}
            </p>
          </div>
          <div className="premium-card p-1 text-center">
            <p className="text-gray-300 text-xs">Concluídas</p>
            <p className="text-xs font-bold text-blue-400">
              {prescriptions.filter(p => p.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Prescriptions List and Reminders */}
        <div className="grid grid-cols-2 gap-1">
          {/* Prescriptions List */}
          <div className="premium-card p-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-premium">Lista</h2>
              <button className="premium-button flex items-center text-xs px-0.5 py-0.5 scale-50">
                Solicitar
              </button>
            </div>

            <div className="space-y-1">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-gray-600 rounded-lg p-1 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="text-xs font-semibold text-white scale-90">{prescription.medication}</h3>
                        <span className={`px-1 py-1 rounded-full text-xs font-medium scale-90 ${getStatusColor(prescription.status)}`}>
                          {getStatusText(prescription.status)}
                        </span>
                      </div>
                      
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 text-xs text-gray-300 scale-90">
                      <div>
                        <span className="text-gray-400">Dosagem:</span> {prescription.dosage}
                      </div>
                      <div>
                        <span className="text-gray-400">Frequência:</span> {prescription.frequency}
                      </div>
                      <div>
                        <span className="text-gray-400">Duração:</span> {prescription.duration}
                      </div>
                      <div>
                        <span className="text-gray-400">Médico:</span> {prescription.doctor}
                      </div>
                    </div>

                    <div className="p-1 bg-gray-800/50 rounded-lg scale-90">
                      <span className="text-gray-400 text-xs">Instruções:</span>
                      <p className="text-white text-xs">{prescription.instructions}</p>
                    </div>

                    <div className="text-xs text-gray-400 scale-90">
                      <span>Data da prescrição:</span> {new Date(prescription.date).toLocaleDateString('pt-BR')}
                    </div>
                    </div>

                    <div className="flex flex-col gap-1 ml-1">
                      <button className="premium-button text-xs px-1 py-1 w-4 h-4 flex items-center justify-center">
                        <i className="fas fa-download text-xs"></i>
                      </button>
                      <button className="premium-button text-xs px-1 py-1 w-4 h-4 flex items-center justify-center">
                        <i className="fas fa-eye text-xs"></i>
                      </button>
                      {prescription.status === 'active' && (
                        <button className="premium-button text-xs px-1 py-1 w-4 h-4 flex items-center justify-center">
                          <i className="fas fa-calendar text-xs"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medication Reminders */}
          <div className="premium-card p-1">
            <h2 className="text-xs font-semibold text-premium">Lembretes</h2>
            <div className="flex gap-1 text-xs">
              <div className="flex items-center gap-1 p-1 bg-gray-800/50 rounded">
                <i className="fas fa-bell text-yellow-400 text-xs"></i>
                <span className="text-white">Med A - 14:00</span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-gray-800/50 rounded">
                <i className="fas fa-bell text-yellow-400 text-xs"></i>
                <span className="text-white">Med B - 08:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Prescricoes
