import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Specialty } from '../App'
import MiniChat from '../components/MiniChat'

interface DashboardMedicoProps {
  currentSpecialty: Specialty
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const DashboardMedico = ({ currentSpecialty, addNotification }: DashboardMedicoProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const specialtyData = {
    rim: {
      name: 'Nefrologia',
      patients: 124,
      color: 'green',
      icon: 'fa-kidneys',
      consultations: 45,
      treatments: 89
    },
    neuro: {
      name: 'Neurologia', 
      patients: 89,
      color: 'blue',
      icon: 'fa-brain',
      consultations: 32,
      treatments: 67
    },
    cannabis: {
      name: 'Cannabis Medicinal',
      patients: 67,
      color: 'yellow', 
      icon: 'fa-leaf',
      consultations: 23,
      treatments: 45
    }
  }

  const currentData = specialtyData[currentSpecialty]

  const handleActionClick = (action: string) => {
    // Apenas notificações essenciais - sem spam
    switch (action) {
      case 'Prescrições':
        addNotification('Prescrições acessadas', 'success')
        break
      case 'Exames':
        addNotification('Exames carregados', 'success')
        break
      case 'Prontuários':
        addNotification('Prontuários acessados', 'success')
        break
      case 'Relatórios':
        addNotification('Relatórios gerados', 'success')
        break
      case 'Novo Paciente':
        addNotification('Formulário aberto', 'success')
        break
      default:
        // Sem notificação para ações menores
        break
    }
  }

  return (
    <div className="h-full overflow-hidden">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-3 mb-1">
        <div className="premium-card p-2 scale-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Link to="/" className="text-yellow-400 hover:text-yellow-300">
                <i className="fas fa-arrow-left text-sm"></i>
              </Link>
              <div className="flex items-center gap-1">
                <div className={`w-6 h-6 rounded-lg bg-${currentData.color}-500 bg-opacity-20 flex items-center justify-center glow-${currentData.color === 'yellow' ? 'cannabis' : currentData.color === 'green' ? 'rim' : 'neuro'}`}>
                  <i className={`fas ${currentData.icon} text-xs text-${currentData.color}-400`}></i>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-premium">Dashboard Médico</h1>
                  <p className={`text-${currentData.color}-400 text-xs`}>{currentData.name}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-1">
              <button
                onClick={() => setIsChatOpen(true)}
                className="premium-button flex items-center gap-1 text-xs px-2 py-1"
              >
                <i className="fas fa-comments text-xs"></i>
                <span className="text-xs">Chat</span>
              </button>
              <button
                onClick={() => handleActionClick('Novo Paciente')}
                className="premium-button flex items-center gap-1 text-xs px-2 py-1"
              >
                <i className="fas fa-plus text-xs"></i>
                <span className="text-xs">Novo</span>
              </button>
              <button
                onClick={() => handleActionClick('Relatório')}
                className="premium-button flex items-center gap-1 text-xs px-2 py-1"
              >
                <i className="fas fa-chart-line text-xs"></i>
                <span className="text-xs">Relatório</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 h-full items-start">
          {/* Acesso Rápido - Lateral Esquerda */}
          <div className="lg:col-span-1">
            <div className="premium-card p-3 scale-95">
              <h3 className="text-premium text-base font-semibold mb-3">Acesso Rápido</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleActionClick('Prescrições')}
                  className="w-full p-3 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors text-left flex items-center gap-4"
                >
                  <i className="fas fa-prescription text-green-400 text-base"></i>
                  <span className="text-base text-gray-300">Prescrições</span>
                </button>
                
                <button
                  onClick={() => handleActionClick('Exames')}
                  className="w-full p-3 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors text-left flex items-center gap-4"
                >
                  <i className="fas fa-vials text-blue-400 text-base"></i>
                  <span className="text-base text-gray-300">Exames</span>
                </button>
                
                <button
                  onClick={() => handleActionClick('Prontuários')}
                  className="w-full p-3 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors text-left flex items-center gap-4"
                >
                  <i className="fas fa-file-medical text-purple-400 text-base"></i>
                  <span className="text-base text-gray-300">Prontuários</span>
                </button>
                
                <button
                  onClick={() => handleActionClick('Relatórios')}
                  className="w-full p-3 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors text-left flex items-center gap-4"
                >
                  <i className="fas fa-chart-bar text-yellow-400 text-base"></i>
                  <span className="text-base text-gray-300">Relatórios</span>
                </button>
              </div>
            </div>
          </div>

          {/* Métricas Principais */}
          <div className="lg:col-span-2 space-y-2">
            {/* Cards de Métricas */}
            <div className="premium-card p-3 scale-95">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full bg-${currentData.color}-500 bg-opacity-20 flex items-center justify-center`}>
                    <i className={`fas fa-users text-sm text-${currentData.color}-400`}></i>
                  </div>
                  <div className={`text-xl font-bold text-${currentData.color}-400 mb-1`}>
                    {currentData.patients}
                  </div>
                  <div className="text-gray-400 text-sm">Pacientes</div>
                  <div className="text-sm text-green-400">+8%</div>
                </div>

                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center`}>
                    <i className="fas fa-calendar-check text-sm text-blue-400"></i>
                  </div>
                  <div className="text-xl font-bold text-blue-400 mb-1">
                    {currentData.consultations}
                  </div>
                  <div className="text-gray-400 text-sm">Consultas</div>
                  <div className="text-sm text-green-400">+12%</div>
                </div>

                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-purple-500 bg-opacity-20 flex items-center justify-center">
                    <i className="fas fa-prescription-bottle text-sm text-purple-400"></i>
                  </div>
                  <div className="text-xl font-bold text-purple-400 mb-1">
                    {currentData.treatments}
                  </div>
                  <div className="text-gray-400 text-sm">Tratamentos</div>
                  <div className="text-sm text-yellow-400">+5%</div>
                </div>
              </div>
            </div>

            {/* Lista de Pacientes Recentes */}
            <div className="premium-card p-2 scale-95">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-premium text-sm font-semibold">Pacientes Recentes</h3>
                <button
                  onClick={() => handleActionClick('Ver Todos')}
                  className="text-yellow-400 hover:text-yellow-300 text-sm"
                >
                  Ver todos <i className="fas fa-arrow-right ml-1"></i>
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { name: 'João Silva', age: 45, condition: 'Hipertensão', status: 'Estável', time: '09:30' },
                  { name: 'Maria Santos', age: 62, condition: 'Diabetes', status: 'Atenção', time: '10:15' },
                  { name: 'Pedro Costa', age: 38, condition: 'Exame Rotina', status: 'Normal', time: '11:00' },
                  { name: 'Ana Paula', age: 55, condition: 'Dor Crônica', status: 'Tratamento', time: '14:30' }
                ].slice(0, 2).map((patient, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleActionClick(`Visualizar ${patient.name}`)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{patient.name}</div>
                        <div className="text-sm text-gray-400">{patient.age} anos • {patient.condition}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${
                        patient.status === 'Estável' ? 'bg-green-500 bg-opacity-20 text-green-400' :
                        patient.status === 'Atenção' ? 'bg-yellow-500 bg-opacity-20 text-yellow-400' :
                        patient.status === 'Normal' ? 'bg-blue-500 bg-opacity-20 text-blue-400' :
                        'bg-purple-500 bg-opacity-20 text-purple-400'
                      }`}>
                        {patient.status}
                      </div>
                      <div className="text-sm text-gray-500">{patient.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-1">
            {/* Agenda do Dia */}
            <div className="premium-card p-2 scale-95">
              <h3 className="text-premium text-sm font-semibold mb-2">Agenda de Hoje</h3>
              
              <div className="space-y-2">
                {[
                  { time: '09:00', patient: 'Carlos Lima', type: 'Consulta' },
                  { time: '10:30', patient: 'Lúcia Ferreira', type: 'Retorno' },
                  { time: '14:00', patient: 'Roberto Silva', type: 'Primeira Consulta' },
                  { time: '15:30', patient: 'Fernanda Costa', type: 'Exames' },
                  { time: '16:45', patient: 'José Santos', type: 'Consulta' }
                ].slice(0, 2).map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-gray-800 bg-opacity-30 rounded-lg"
                  >
                    <div className="text-yellow-400 font-mono text-sm">
                      {appointment.time}
                    </div>
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">
                        {appointment.patient}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {appointment.type}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Chat */}
      <MiniChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userType="doctor"
        otherUser={{
          name: "Paciente",
          specialty: currentData.name
        }}
        addNotification={addNotification}
      />
    </div>
  )
}

export default DashboardMedico
