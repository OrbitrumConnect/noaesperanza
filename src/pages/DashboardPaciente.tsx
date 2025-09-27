import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Specialty } from '../App'
import MiniChat from '../components/MiniChat'
import Sidebar from '../components/Sidebar'

interface DashboardPacienteProps {
  currentSpecialty: Specialty
  addNotification: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void
}

const DashboardPaciente = ({ currentSpecialty, addNotification }: DashboardPacienteProps) => {
  const navigate = useNavigate()
  const [isChatOpen, setIsChatOpen] = useState(false)
  
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
    addNotification(`Ação "${action}" executada`, 'success')
  }

  // Itens da sidebar para pacientes
  const sidebarItems = [
    {
      id: 'agendar',
      label: 'Agendar',
      icon: 'fa-calendar-plus',
      color: 'blue',
      action: () => handleActionClick('Nova Consulta')
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: 'fa-history',
      color: 'purple',
      action: () => handleActionClick('Histórico')
    },
    {
      id: 'exames',
      label: 'Meus Exames',
      icon: 'fa-vials',
      color: 'blue',
      route: '/exames'
    },
    {
      id: 'prescricoes',
      label: 'Prescrições',
      icon: 'fa-prescription',
      color: 'green',
      route: '/prescricoes'
    },
    {
      id: 'prontuario',
      label: 'Prontuário',
      icon: 'fa-file-medical',
      color: 'purple',
      route: '/prontuario'
    },
    {
      id: 'pagamentos',
      label: 'Pagamentos',
      icon: 'fa-credit-card',
      color: 'yellow',
      route: '/pagamentos-paciente'
    },
    {
      id: 'chat',
      label: 'Chat com Médico',
      icon: 'fa-comments',
      color: 'green',
      action: () => setIsChatOpen(true)
    }
  ]

  return (
    <div className="h-full overflow-hidden">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-3 mb-3">
        <div className="premium-card p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link to="/" className="text-yellow-400 hover:text-yellow-300">
                <i className="fas fa-arrow-left text-sm"></i>
              </Link>
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-lg bg-${currentData.color}-500 bg-opacity-20 flex items-center justify-center glow-${currentData.color === 'yellow' ? 'cannabis' : currentData.color === 'green' ? 'rim' : 'neuro'}`}>
                  <i className={`fas ${currentData.icon} text-xs text-${currentData.color}-400`}></i>
                </div>
                <div>
                  <h1 className="text-sm font-bold text-premium">Dashboard do Paciente</h1>
                  <p className={`text-${currentData.color}-400 text-xs`}>{currentData.name}</p>
                </div>
              </div>
            </div>

            {/* Status do Tratamento no Header */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-2 bg-gray-800 bg-opacity-30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-white font-medium">Medicação Ativa</span>
                  <span className="text-xs text-green-400">Em dia</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 p-2 bg-gray-800 bg-opacity-30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-white font-medium">Exames Pendentes</span>
                  <span className="text-xs text-yellow-400">2 itens</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 p-2 bg-gray-800 bg-opacity-30 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <div className="flex flex-col">
                  <span className="text-xs text-white font-medium">Próxima Consulta</span>
                  <span className="text-xs text-blue-400">15/01</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div className="h-full flex">
        {/* Sidebar Fixa - Lateral Esquerda */}
        <div className="w-64 flex-shrink-0 bg-white/10 backdrop-blur-sm border-r border-white/20 p-3 fixed left-0 top-[7vh] h-[79.5vh] overflow-y-auto z-20">
          <Sidebar 
            title="Acesso Rápido" 
            items={sidebarItems}
            className="h-full"
          />
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 ml-64 p-2 h-full overflow-y-auto">
          <div className="max-w-3xl ml-4">
            <div className="grid grid-cols-2 gap-5 h-full items-start">

              {/* Compromissos e Consultas */}
              <div className="premium-card p-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-premium text-sm font-semibold">Compromissos e Consultas</h3>
                  <button
                    onClick={() => handleActionClick('Ver Todas')}
                    className="text-yellow-400 hover:text-yellow-300 text-xs"
                  >
                    Ver todas <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                  {/* Próximos Compromissos */}
                  <div className="flex flex-col">
                    <h4 className="text-sm text-gray-300 font-medium mb-2">Próximos Compromissos</h4>
                    <div className="space-y-2">
                      {[
                        { date: '15/01/2025', time: '14:30', type: 'Consulta', doctor: 'Dr. Carlos Silva' },
                        { date: '22/01/2025', time: '10:00', type: 'Exame', doctor: 'Laboratório' }
                      ].map((appointment, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 p-2 bg-gray-800 bg-opacity-30 rounded-lg"
                        >
                          <div className="text-yellow-400 font-mono text-sm mt-0.5">
                            {appointment.time}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium">
                              {appointment.type}
                            </div>
                            <div className="text-gray-400 text-xs">
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

                  {/* Consultas Recentes */}
                  <div className="flex flex-col">
                    <h4 className="text-sm text-gray-300 font-medium mb-2">Consultas Recentes</h4>
                    <div className="space-y-2">
                      {[
                        { date: '15/12/2024', doctor: 'Dr. Carlos Silva', type: 'Consulta de Retorno', status: 'Concluída', time: '14:30' },
                        { date: '01/12/2024', doctor: 'Dr. Carlos Silva', type: 'Exame de Rotina', status: 'Concluída', time: '10:15' }
                      ].map((consultation, index) => (
                        <div
                          key={index}
                          className="flex items-start justify-between p-2 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                          onClick={() => handleActionClick(`Visualizar ${consultation.type}`)}
                        >
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold text-xs mt-0.5 flex-shrink-0">
                              {consultation.date.split('/')[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-white text-sm">{consultation.type}</div>
                              <div className="text-xs text-gray-400">{consultation.doctor} • {consultation.date}</div>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-500 bg-opacity-20 text-green-400`}>
                              {consultation.status}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{consultation.time}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Analytics - Biomarcadores Renais */}
              <div className="premium-card p-1 w-[135%]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-premium text-xs font-semibold">Analytics - Biomarcadores Renais</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-xs text-green-400">Estável</span>
                  </div>
                </div>

                {/* Score Composto */}
                <div className="mb-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-400">Score Composto</span>
                    <span className="text-sm font-bold text-green-400">72/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div className="bg-gradient-to-r from-green-400 to-green-500 h-1 rounded-full" style={{width: '72%'}}></div>
                  </div>
                </div>

                {/* Biomarcadores Principais */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 mb-1">
                  <div className="text-center p-1 bg-gray-800 bg-opacity-30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-0.5">eGFR</div>
                    <div className="text-xs font-bold text-green-400">65</div>
                    <div className="text-xs text-gray-500">mL/min/1.73m²</div>
                  </div>
                  <div className="text-center p-1 bg-gray-800 bg-opacity-30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-0.5">Creatinina</div>
                    <div className="text-xs font-bold text-yellow-400">1.4</div>
                    <div className="text-xs text-gray-500">mg/dL</div>
                  </div>
                  <div className="text-center p-1 bg-gray-800 bg-opacity-30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-0.5">Ureia</div>
                    <div className="text-xs font-bold text-green-400">45</div>
                    <div className="text-xs text-gray-500">mg/dL</div>
                  </div>
                  <div className="text-center p-1 bg-gray-800 bg-opacity-30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-0.5">Cistatina C</div>
                    <div className="text-xs font-bold text-green-400">1.1</div>
                    <div className="text-xs text-gray-500">mg/L</div>
                  </div>
                  <div className="text-center p-1 bg-gray-800 bg-opacity-30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-0.5">Proteinúria</div>
                    <div className="text-xs font-bold text-yellow-400">150</div>
                    <div className="text-xs text-gray-500">mg/g</div>
                  </div>
                  <div className="text-center p-1 bg-gray-800 bg-opacity-30 rounded-lg">
                    <div className="text-xs text-gray-400 mb-0.5">Clearance</div>
                    <div className="text-xs font-bold text-green-400">68</div>
                    <div className="text-xs text-gray-500">mL/min</div>
                  </div>
                </div>

                {/* Estrutura do Score */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1">
                  <div className="p-1 bg-gray-800 bg-opacity-30 rounded-lg">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-400">Função Renal</span>
                      <span className="text-xs text-green-400">50%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div className="bg-green-400 h-1 rounded-full" style={{width: '85%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">eGFR, Creatinina, Proteinúria</div>
                  </div>
                  
                  <div className="p-1 bg-gray-800 bg-opacity-30 rounded-lg">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-400">Fatores Metabólicos</span>
                      <span className="text-xs text-yellow-400">20%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div className="bg-yellow-400 h-1 rounded-full" style={{width: '65%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">PA, HbA1c, Perfil Lipídico</div>
                  </div>
                  
                  <div className="p-1 bg-gray-800 bg-opacity-30 rounded-lg">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-400">Inflamação</span>
                      <span className="text-xs text-blue-400">15%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div className="bg-blue-400 h-1 rounded-full" style={{width: '70%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">PCR-us, Fadiga, Dor, Edema</div>
                  </div>
                  
                  <div className="p-1 bg-gray-800 bg-opacity-30 rounded-lg">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs text-gray-400">Cannabis</span>
                      <span className="text-xs text-purple-400">15%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1">
                      <div className="bg-purple-400 h-1 rounded-full" style={{width: '80%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Dose, Tempo, Efeitos</div>
                  </div>
                </div>

                {/* Classificação Final */}
                <div className="mt-1 p-1 bg-gradient-to-r from-green-500 bg-opacity-20 to-green-600 bg-opacity-20 rounded-lg border border-green-500 border-opacity-30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <i className="fas fa-chart-line text-green-400 text-xs"></i>
                      <span className="text-xs font-semibold text-green-400">Classificação: Estável</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Última atualização: 15/12/2024
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat com Médico */}
      <MiniChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userType="patient"
        otherUser={{
          name: currentData.doctor,
          specialty: currentData.name,
          avatar: undefined
        }}
        addNotification={addNotification}
      />
    </div>
  )
}

export default DashboardPaciente
