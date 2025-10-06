import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Specialty } from '../App'
import MiniChat from '../components/MiniChat'

interface DashboardPacienteProps {
  currentSpecialty: Specialty
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const DashboardPaciente = ({ currentSpecialty, addNotification }: DashboardPacienteProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const navigate = useNavigate()
  const specialtyData = {
    rim: {
      name: 'Nefrologia',
      color: 'green',
      icon: 'fa-kidneys',
      doctor: 'Dr. Carlos Silva',
      nextAppointment: '15/01/2025',
      lastConsultation: '15/12/2024'
    },
    neuro: {
      name: 'Neurologia', 
      color: 'blue',
      icon: 'fa-brain',
      doctor: 'Dra. Ana Costa',
      nextAppointment: '20/01/2025',
      lastConsultation: '20/12/2024'
    },
    cannabis: {
      name: 'Cannabis Medicinal',
      color: 'yellow', 
      icon: 'fa-leaf',
      doctor: 'Dr. Roberto Lima',
      nextAppointment: '18/01/2025',
      lastConsultation: '18/12/2024'
    }
  }

  const currentData = specialtyData[currentSpecialty]

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'Meus Exames':
        navigate('/exames')
        break
      case 'Prescrições':
        navigate('/prescricoes')
        break
      case 'Prontuário':
        navigate('/prontuario')
        break
      case 'Pagamentos':
        navigate('/checkout')
        break
      case 'Nova Consulta':
        addNotification('Agenda aberta', 'success')
        break
      case 'Histórico':
        addNotification('Histórico carregado', 'success')
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
                  <h1 className="text-sm font-bold text-premium">Dashboard do Paciente</h1>
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
                onClick={() => handleActionClick('Nova Consulta')}
                className="premium-button flex items-center gap-1 text-xs px-2 py-1"
              >
                <i className="fas fa-calendar-plus text-xs"></i>
                <span className="text-xs">Agendar</span>
              </button>
              <button
                onClick={() => handleActionClick('Histórico')}
                className="premium-button flex items-center gap-1 text-xs px-2 py-1"
              >
                <i className="fas fa-history text-xs"></i>
                <span className="text-xs">Histórico</span>
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
                  onClick={() => handleActionClick('Meus Exames')}
                  className="w-full p-3 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors text-left flex items-center gap-4"
                >
                  <i className="fas fa-vials text-blue-400 text-base"></i>
                  <span className="text-base text-gray-300">Meus Exames</span>
                </button>
                
                <button
                  onClick={() => handleActionClick('Prescrições')}
                  className="w-full p-3 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors text-left flex items-center gap-4"
                >
                  <i className="fas fa-prescription text-green-400 text-base"></i>
                  <span className="text-base text-gray-300">Prescrições</span>
                </button>
                
                <button
                  onClick={() => handleActionClick('Prontuário')}
                  className="w-full p-3 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors text-left flex items-center gap-4"
                >
                  <i className="fas fa-file-medical text-purple-400 text-base"></i>
                  <span className="text-base text-gray-300">Prontuário</span>
                </button>
                
                <button
                  onClick={() => handleActionClick('Pagamentos')}
                  className="w-full p-3 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors text-left flex items-center gap-4"
                >
                  <i className="fas fa-credit-card text-yellow-400 text-base"></i>
                  <span className="text-base text-gray-300">Pagamentos</span>
                </button>
              </div>
            </div>
          </div>

          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-2">
            {/* Cards de Informações */}
            <div className="premium-card p-3 scale-95">
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full bg-${currentData.color}-500 bg-opacity-20 flex items-center justify-center`}>
                    <i className={`fas fa-user-md text-sm text-${currentData.color}-400`}></i>
                  </div>
                  <div className={`text-xl font-bold text-${currentData.color}-400 mb-1`}>
                    {currentData.doctor.split(' ')[1]}
                  </div>
                  <div className="text-gray-400 text-sm">Médico</div>
                  <div className="text-sm text-green-400">{currentData.doctor}</div>
                </div>

                <div className="text-center">
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center`}>
                    <i className="fas fa-calendar-check text-sm text-blue-400"></i>
                  </div>
                  <div className="text-xl font-bold text-blue-400 mb-1">
                    {currentData.nextAppointment.split('/')[0]}
                  </div>
                  <div className="text-gray-400 text-sm">Próxima Consulta</div>
                  <div className="text-sm text-green-400">{currentData.nextAppointment}</div>
                </div>

                <div className="text-center">
                  <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-purple-500 bg-opacity-20 flex items-center justify-center">
                    <i className="fas fa-clock text-sm text-purple-400"></i>
                  </div>
                  <div className="text-xl font-bold text-purple-400 mb-1">
                    {currentData.lastConsultation.split('/')[0]}
                  </div>
                  <div className="text-gray-400 text-sm">Última Consulta</div>
                  <div className="text-sm text-yellow-400">{currentData.lastConsultation}</div>
                </div>
              </div>
            </div>

            {/* Histórico de Consultas */}
            <div className="premium-card p-2 scale-95">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-premium text-sm font-semibold">Consultas Recentes</h3>
                <button
                  onClick={() => handleActionClick('Ver Todas')}
                  className="text-yellow-400 hover:text-yellow-300 text-sm"
                >
                  Ver todas <i className="fas fa-arrow-right ml-1"></i>
                </button>
              </div>

              <div className="space-y-2">
                {[
                  { date: '15/12/2024', doctor: 'Dr. Carlos Silva', type: 'Consulta de Retorno', status: 'Concluída', time: '14:30' },
                  { date: '01/12/2024', doctor: 'Dr. Carlos Silva', type: 'Exame de Rotina', status: 'Concluída', time: '10:15' },
                  { date: '15/11/2024', doctor: 'Dr. Carlos Silva', type: 'Primeira Consulta', status: 'Concluída', time: '16:00' }
                ].slice(0, 2).map((consultation, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleActionClick(`Visualizar ${consultation.type}`)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                        {consultation.date.split('/')[0]}
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{consultation.type}</div>
                        <div className="text-sm text-gray-400">{consultation.doctor} • {consultation.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-2 py-1 rounded-full text-sm font-medium bg-green-500 bg-opacity-20 text-green-400`}>
                        {consultation.status}
                      </div>
                      <div className="text-sm text-gray-500">{consultation.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Painel Lateral */}
          <div className="space-y-1">
            {/* Próximos Compromissos */}
            <div className="premium-card p-2 scale-95">
              <h3 className="text-premium text-sm font-semibold mb-2">Próximos Compromissos</h3>
              
              <div className="space-y-2">
                {[
                  { date: '15/01/2025', time: '14:30', type: 'Consulta', doctor: 'Dr. Carlos Silva' },
                  { date: '22/01/2025', time: '10:00', type: 'Exame', doctor: 'Laboratório' },
                  { date: '29/01/2025', time: '16:00', type: 'Retorno', doctor: 'Dr. Carlos Silva' }
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
                        {appointment.type}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {appointment.doctor}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {appointment.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status do Tratamento */}
            <div className="premium-card p-2 scale-95">
              <h3 className="text-premium text-sm font-semibold mb-2">Status do Tratamento</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-800 bg-opacity-30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    <span className="text-sm text-white">Medicação Ativa</span>
                  </div>
                  <span className="text-xs text-green-400">Em dia</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-800 bg-opacity-30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-white">Exames Pendentes</span>
                  </div>
                  <span className="text-xs text-yellow-400">2 itens</span>
                </div>
                
                <div className="flex items-center justify-between p-2 bg-gray-800 bg-opacity-30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-white">Próxima Consulta</span>
                  </div>
                  <span className="text-xs text-blue-400">15/01</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Chat */}
      <MiniChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userType="patient"
        otherUser={{
          name: currentData.doctor,
          specialty: currentData.name
        }}
        addNotification={addNotification}
      />
    </div>
  )
}

export default DashboardPaciente