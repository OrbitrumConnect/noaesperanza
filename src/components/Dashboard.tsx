import { useState } from 'react'
import { Specialty } from '../App'

interface DashboardProps {
  currentSpecialty: Specialty
  realtimeData: {
    activeUsers: number
    consultationsToday: number
    prescriptions: number
    efficiency: number
  }
}

type DashboardTab = 'overview' | 'medical' | 'admin'

const Dashboard = ({ currentSpecialty, realtimeData }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: 'fa-chart-pie' },
    { id: 'medical', name: 'Médico', icon: 'fa-heartbeat' },
    { id: 'admin', name: 'Admin', icon: 'fa-cog' }
  ]

  const specialtyData = {
    rim: { percentage: 45, patients: 124, color: 'green' },
    neuro: { percentage: 35, patients: 89, color: 'blue' },
    cannabis: { percentage: 20, patients: 67, color: 'yellow' }
  }

  const CircularChart = ({ percentage, color, label }: { percentage: number, color: string, label: string }) => {
    const colorClasses = {
      green: 'text-green-400 border-green-500',
      blue: 'text-blue-400 border-blue-500',
      yellow: 'text-yellow-400 border-yellow-500'
    }

    const circumference = 2 * Math.PI * 45 // raio 45
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            {/* Círculo de fundo */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Círculo de progresso */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={color === 'green' ? '#10b981' : color === 'blue' ? '#3b82f6' : '#f59e0b'}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-in-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-lg font-bold ${colorClasses[color as keyof typeof colorClasses]?.split(' ')[0]}`}>
              {percentage}%
            </span>
          </div>
        </div>
        <span className={`text-xs mt-2 ${colorClasses[color as keyof typeof colorClasses]?.split(' ')[0]}`}>
          {label}
        </span>
      </div>
    )
  }

  return (
    <div className="premium-card">
      {/* Tabs */}
      <div className="flex mb-6 bg-gray-800 bg-opacity-50 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as DashboardTab)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 px-3 rounded-md transition-all text-xs ${
              activeTab === tab.id
                ? 'bg-yellow-500 text-blue-900 font-semibold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className={`fas ${tab.icon} text-sm`}></i>
            <span className="hidden sm:inline">{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Conteúdo do Dashboard */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <h3 className="text-premium text-lg font-semibold">
            Dashboard Principal
          </h3>

          {/* Distribuição por Especialidade */}
          <div>
            <h4 className="text-white text-sm font-medium mb-4">
              Distribuição por Especialidade
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <CircularChart 
                percentage={specialtyData.rim.percentage}
                color="green"
                label="Rim"
              />
              <CircularChart 
                percentage={specialtyData.neuro.percentage}
                color="blue"
                label="Neuro"
              />
              <CircularChart 
                percentage={specialtyData.cannabis.percentage}
                color="yellow"
                label="Cannabis"
              />
            </div>
          </div>

          {/* Métricas Resumidas */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800 bg-opacity-50 rounded-lg">
              <span className="text-gray-400 text-sm">Eficiência Geral</span>
              <span className="text-green-400 font-semibold">{realtimeData.efficiency}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 bg-opacity-50 rounded-lg">
              <span className="text-gray-400 text-sm">Total de Usuários</span>
              <span className="text-blue-400 font-semibold">{realtimeData.activeUsers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800 bg-opacity-50 rounded-lg">
              <span className="text-gray-400 text-sm">Consultas/Dia</span>
              <span className="text-yellow-400 font-semibold">{realtimeData.consultationsToday}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'medical' && (
        <div className="space-y-4">
          <h3 className="text-premium text-lg font-semibold">
            Dashboard Médico
          </h3>
          
          <div className="text-center text-gray-400 py-8">
            <i className="fas fa-heartbeat text-4xl mb-4 text-red-400"></i>
            <p>Dashboard médico em desenvolvimento</p>
            <p className="text-sm">Funcionalidades avançadas em breve</p>
          </div>
        </div>
      )}

      {activeTab === 'admin' && (
        <div className="space-y-4">
          <h3 className="text-premium text-lg font-semibold">
            Dashboard Admin
          </h3>
          
          <div className="text-center text-gray-400 py-8">
            <i className="fas fa-cog text-4xl mb-4 text-gray-400"></i>
            <p>Dashboard administrativo em desenvolvimento</p>
            <p className="text-sm">Controles avançados em breve</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
