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
  const [activeCard, setActiveCard] = useState<string | null>(null)
  
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

  const handleCardToggle = (cardId: string) => {
    setActiveCard(activeCard === cardId ? null : cardId)
  }

  // Itens da sidebar para pacientes
  const sidebarItems = [
    {
      id: 'perfil',
      label: 'Meu Perfil',
      icon: 'fa-user-circle',
      color: 'yellow',
      action: () => handleCardToggle('perfil')
    },
    {
      id: 'compromissos',
      label: 'Compromissos e Consultas',
      icon: 'fa-calendar-check',
      color: 'blue',
      action: () => handleCardToggle('compromissos')
    },
    {
      id: 'analytics',
      label: 'Analytics - Biomarcadores',
      icon: 'fa-chart-line',
      color: 'green',
      action: () => handleCardToggle('analytics')
    },
    {
      id: 'agendar',
      label: 'Agendar',
      icon: 'fa-calendar-plus',
      color: 'blue',
      action: () => handleCardToggle('agendar')
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: 'fa-history',
      color: 'purple',
      action: () => handleCardToggle('historico')
    },
    {
      id: 'exames',
      label: 'Meus Exames',
      icon: 'fa-vials',
      color: 'blue',
      action: () => handleCardToggle('exames')
    },
    {
      id: 'prescricoes',
      label: 'Prescrições',
      icon: 'fa-prescription',
      color: 'green',
      action: () => handleCardToggle('prescricoes')
    },
    {
      id: 'prontuario',
      label: 'Prontuário',
      icon: 'fa-file-medical',
      color: 'purple',
      action: () => handleCardToggle('prontuario')
    },
    {
      id: 'pagamentos',
      label: 'Pagamentos',
      icon: 'fa-credit-card',
      color: 'yellow',
      action: () => handleCardToggle('pagamentos')
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
              {activeCard === 'compromissos' && (
                <div className="premium-card p-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-premium text-sm font-semibold">Compromissos e Consultas</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleActionClick('Ver Todas')}
                      className="text-yellow-400 hover:text-yellow-300 text-xs"
                    >
                      Ver todas <i className="fas fa-arrow-right ml-1"></i>
                    </button>
                    <button
                      onClick={() => handleCardToggle('compromissos')}
                      className="text-gray-400 hover:text-white text-xs p-1 rounded-full hover:bg-gray-700 transition-colors"
                      title="Fechar card"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
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
              )}

              {/* Analytics - Biomarcadores Renais */}
              {activeCard === 'analytics' && (
                <div className="premium-card p-1 w-[135%]">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-premium text-xs font-semibold">Analytics - Biomarcadores Renais</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs text-green-400">Estável</span>
                    </div>
                    <button
                      onClick={() => handleCardToggle('analytics')}
                      className="text-gray-400 hover:text-white text-xs p-1 rounded-full hover:bg-gray-700 transition-colors"
                      title="Fechar card"
                    >
                      <i className="fas fa-times"></i>
                    </button>
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
              )}

              {/* Meu Perfil - Conteúdo Real */}
              {activeCard === 'perfil' && (
                <div className="premium-card p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-premium text-lg font-semibold">👤 Editar Meu Perfil</h3>
                    <button onClick={() => handleCardToggle('perfil')} className="text-gray-400 hover:text-white">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <i className="fas fa-user-circle text-4xl text-yellow-400"></i>
                    </div>
                    <button className="text-xs text-yellow-400 hover:text-yellow-300">
                      <i className="fas fa-camera"></i> Alterar foto
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Nome Completo</label>
                      <input 
                        type="text" 
                        className="w-full bg-gray-800/50 text-white px-3 py-2 rounded-lg text-sm border border-gray-700 focus:border-yellow-400 focus:outline-none transition-colors" 
                        placeholder="Seu nome completo"
                        defaultValue=""
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-gray-400 text-sm block mb-1">CPF</label>
                        <input type="text" className="w-full bg-gray-800/50 text-white px-3 py-2 rounded-lg text-sm border border-gray-700" placeholder="000.000.000-00" />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm block mb-1">Data Nascimento</label>
                        <input type="date" className="w-full bg-gray-800/50 text-white px-3 py-2 rounded-lg text-sm border border-gray-700" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Email</label>
                      <input type="email" className="w-full bg-gray-800/50 text-white px-3 py-2 rounded-lg text-sm border border-gray-700" placeholder="seu@email.com" />
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Telefone</label>
                      <input type="tel" className="w-full bg-gray-800/50 text-white px-3 py-2 rounded-lg text-sm border border-gray-700" placeholder="(00) 00000-0000" />
                    </div>
                    
                    <div>
                      <label className="text-gray-400 text-sm block mb-1">Endereço</label>
                      <textarea className="w-full bg-gray-800/50 text-white px-3 py-2 rounded-lg text-sm border border-gray-700" rows={2} placeholder="Seu endereço completo"></textarea>
                    </div>
                    
                    <button 
                      onClick={() => {
                        addNotification('Perfil atualizado com sucesso!', 'success')
                      }}
                      className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm font-semibold transition-colors mt-4"
                    >
                      💾 Salvar Alterações
                    </button>
                  </div>
                </div>
              )}

              {/* Cards placeholder para outros itens */}
              {activeCard === 'agendar' && (
                <div className="premium-card p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-premium text-sm font-semibold">📅 Agendar Consulta</h3>
                    <button onClick={() => handleCardToggle('agendar')} className="text-gray-400 hover:text-white text-xs">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="text-sm text-gray-300">Funcionalidade em desenvolvimento</div>
                </div>
              )}

              {activeCard === 'historico' && (
                <div className="premium-card p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-premium text-sm font-semibold">📜 Histórico Médico</h3>
                    <button onClick={() => handleCardToggle('historico')} className="text-gray-400 hover:text-white text-xs">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="text-sm text-gray-300">Funcionalidade em desenvolvimento</div>
                </div>
              )}

              {activeCard === 'exames' && (
                <div className="premium-card p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-premium text-sm font-semibold">🧪 Meus Exames</h3>
                    <button onClick={() => handleCardToggle('exames')} className="text-gray-400 hover:text-white text-xs">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { name: 'Hemograma Completo', date: '15/01/2025', status: 'completed', doctor: 'Dr. Carlos Silva' },
                      { name: 'Tomografia do Crânio', date: '20/01/2025', status: 'scheduled', doctor: 'Dra. Ana Costa' },
                      { name: 'Eletroencefalograma', date: '10/01/2025', status: 'pending', doctor: 'Dr. Roberto Lima' }
                    ].map((exam, i) => (
                      <div key={i} className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-1">
                          <div>
                            <div className="text-white text-sm font-medium">{exam.name}</div>
                            <div className="text-gray-400 text-xs">{exam.doctor}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            exam.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            exam.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {exam.status === 'completed' ? 'Concluído' : exam.status === 'scheduled' ? 'Agendado' : 'Pendente'}
                          </span>
                        </div>
                        <div className="text-gray-500 text-xs">{exam.date}</div>
                      </div>
                    ))}
                    <button className="w-full mt-3 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold">
                      <i className="fas fa-upload"></i> Enviar Novo Exame
                    </button>
                  </div>
                </div>
              )}

              {activeCard === 'prescricoes' && (
                <div className="premium-card p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-premium text-sm font-semibold">💊 Prescrições Médicas</h3>
                    <button onClick={() => handleCardToggle('prescricoes')} className="text-gray-400 hover:text-white text-xs">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { medication: 'Canabidiol 200mg', doctor: 'Dr. Ricardo Valença', dosage: '10 gotas', frequency: '3x ao dia', status: 'active' },
                      { medication: 'Pregabalina 75mg', doctor: 'Dra. Ana Costa', dosage: '1 cápsula', frequency: '2x ao dia', status: 'active' },
                      { medication: 'Dipirona 500mg', doctor: 'Dr. Carlos Silva', dosage: '1 comprimido', frequency: 'Se necessário', status: 'completed' }
                    ].map((presc, i) => (
                      <div key={i} className="p-2 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex-1">
                            <div className="text-white text-sm font-medium">{presc.medication}</div>
                            <div className="text-gray-400 text-xs">{presc.doctor}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${
                            presc.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {presc.status === 'active' ? 'Ativa' : 'Concluída'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="font-medium text-gray-400">{presc.dosage}</span> • {presc.frequency}
                        </div>
                      </div>
                    ))}
                    <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                      <div className="text-xs text-blue-400">
                        <i className="fas fa-info-circle"></i> Prescrições vêm dos seus médicos credenciados
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeCard === 'prontuario' && (
                <div className="premium-card p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-premium text-sm font-semibold">📋 Meu Prontuário</h3>
                    <button onClick={() => handleCardToggle('prontuario')} className="text-gray-400 hover:text-white text-xs">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {/* Resumo do Prontuário */}
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <h4 className="text-yellow-400 text-sm font-semibold mb-2">📊 Resumo Clínico</h4>
                      <div className="space-y-1 text-xs">
                        <div className="text-gray-300"><span className="text-gray-400">Idade:</span> 35 anos</div>
                        <div className="text-gray-300"><span className="text-gray-400">Tipo Sanguíneo:</span> O+</div>
                        <div className="text-gray-300"><span className="text-gray-400">Alergias:</span> Nenhuma conhecida</div>
                      </div>
                    </div>

                    {/* Histórico de Consultas */}
                    <div>
                      <h4 className="text-white text-xs font-semibold mb-2">🏥 Histórico de Consultas</h4>
                      {[
                        { date: '25/01/2025', doctor: 'Dr. Ricardo Valença', type: 'Consulta Neurológica', summary: 'Avaliação inicial de dor crônica' },
                        { date: '10/01/2025', doctor: 'Dra. Ana Costa', type: 'Retorno', summary: 'Ajuste de medicação' }
                      ].map((visit, i) => (
                        <div key={i} className="p-2 bg-gray-800/50 rounded-lg border border-gray-700 mb-2">
                          <div className="text-white text-xs font-medium">{visit.type}</div>
                          <div className="text-gray-400 text-xs">{visit.doctor} • {visit.date}</div>
                          <div className="text-gray-500 text-xs mt-1">{visit.summary}</div>
                        </div>
                      ))}
                    </div>

                    {/* Condições Ativas */}
                    <div>
                      <h4 className="text-white text-xs font-semibold mb-2">🩺 Condições em Acompanhamento</h4>
                      <div className="space-y-1">
                        {['Dor Crônica', 'Enxaqueca'].map((cond, i) => (
                          <div key={i} className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400">
                            {cond}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeCard === 'pagamentos' && (
                <div className="premium-card p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-premium text-sm font-semibold">💳 Pagamentos e Plano</h3>
                    <button onClick={() => handleCardToggle('pagamentos')} className="text-gray-400 hover:text-white text-xs">
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {/* Plano Atual */}
                    <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-green-500/20 border border-yellow-500/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-yellow-400 text-sm font-semibold">✨ Plano Básico</h4>
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Ativo</span>
                      </div>
                      <div className="text-2xl font-bold text-white mb-1">R$ 49,90<span className="text-sm text-gray-400">/mês</span></div>
                      <div className="text-xs text-gray-300">Próxima cobrança: 05/02/2025</div>
                      <button className="w-full mt-3 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-xs font-semibold">
                        Fazer Upgrade do Plano
                      </button>
                    </div>

                    {/* Histórico de Pagamentos */}
                    <div>
                      <h4 className="text-white text-xs font-semibold mb-2">📜 Histórico de Pagamentos</h4>
                      {[
                        { date: '05/01/2025', amount: 'R$ 49,90', method: 'Cartão •••• 1234', status: 'paid' },
                        { date: '05/12/2024', amount: 'R$ 49,90', method: 'Cartão •••• 1234', status: 'paid' },
                        { date: '05/11/2024', amount: 'R$ 49,90', method: 'Cartão •••• 1234', status: 'paid' }
                      ].map((payment, i) => (
                        <div key={i} className="p-2 bg-gray-800/50 rounded-lg border border-gray-700 mb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-white text-sm font-medium">{payment.amount}</div>
                              <div className="text-gray-400 text-xs">{payment.method}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">{payment.date}</div>
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">Pago</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Métodos de Pagamento */}
                    <button className="w-full px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-semibold">
                      <i className="fas fa-credit-card"></i> Gerenciar Métodos de Pagamento
                    </button>
                  </div>
                </div>
              )}

              {/* Mensagem quando nenhum card está ativo */}
              {!activeCard && (
                <div className="col-span-2 flex items-center justify-center h-64 ml-72">
                  <div className="text-center">
                    <i className="fas fa-mouse-pointer text-4xl text-gray-500 mb-4"></i>
                    <h3 className="text-xl text-gray-400 mb-2">Selecione um item na sidebar</h3>
                    <p className="text-gray-500">Clique em qualquer item para visualizar</p>
                  </div>
                </div>
              )}
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
