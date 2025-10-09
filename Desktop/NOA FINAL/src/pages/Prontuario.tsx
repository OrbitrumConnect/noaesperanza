import { useState } from 'react'
import { Link } from 'react-router-dom'

interface MedicalRecord {
  id: string
  date: string
  type: 'consultation' | 'examination' | 'prescription' | 'note'
  doctor: string
  specialty: string
  content: string
  attachments?: string[]
}

interface PatientInfo {
  name: string
  age: number
  cpf: string
  phone: string
  email: string
  address: string
  emergencyContact: string
  bloodType: string
  allergies: string[]
  chronicConditions: string[]
}

const Prontuario = () => {
  const [patientInfo] = useState<PatientInfo>({
    name: 'João Silva',
    age: 45,
    cpf: '123.456.789-00',
    phone: '(11) 99999-9999',
    email: 'joao.silva@email.com',
    address: 'Rua das Flores, 123 - São Paulo/SP',
    emergencyContact: 'Maria Silva - (11) 88888-8888',
    bloodType: 'O+',
    allergies: ['Penicilina', 'Dipirona'],
    chronicConditions: ['Hipertensão', 'Diabetes Tipo 2']
  })

  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([
    {
      id: '1',
      date: '2025-01-15',
      type: 'consultation',
      doctor: 'Dr. Carlos Silva',
      specialty: 'Nefrologia',
      content: 'Consulta de retorno. Paciente relata melhora dos sintomas. Pressão arterial controlada. Manter medicação atual.',
      attachments: ['receita_medica.pdf']
    },
    {
      id: '2',
      date: '2025-01-10',
      type: 'examination',
      doctor: 'Dr. Carlos Silva',
      specialty: 'Nefrologia',
      content: 'Resultado do hemograma: valores dentro da normalidade. Creatinina: 1.2 mg/dL (normal).',
      attachments: ['hemograma.pdf']
    },
    {
      id: '3',
      date: '2024-12-20',
      type: 'consultation',
      doctor: 'Dr. Carlos Silva',
      specialty: 'Nefrologia',
      content: 'Primeira consulta. Paciente apresenta hipertensão e diabetes. Iniciado tratamento com medicação específica.',
      attachments: []
    },
    {
      id: '4',
      date: '2024-12-15',
      type: 'examination',
      doctor: 'Dr. Ana Costa',
      specialty: 'Neurologia',
      content: 'Eletroencefalograma realizado. Resultado normal, sem alterações significativas.',
      attachments: ['eeg.pdf']
    }
  ])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consultation': return 'fas fa-stethoscope'
      case 'examination': return 'fas fa-vials'
      case 'prescription': return 'fas fa-prescription'
      case 'note': return 'fas fa-file-medical'
      default: return 'fas fa-file'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consultation': return 'text-blue-400'
      case 'examination': return 'text-green-400'
      case 'prescription': return 'text-yellow-400'
      case 'note': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'consultation': return 'Consulta'
      case 'examination': return 'Exame'
      case 'prescription': return 'Prescrição'
      case 'note': return 'Anotação'
      default: return type
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
          <h1 className="text-xs font-bold text-premium">Prontuário</h1>
        </div>

        {/* Patient Info Card */}
        <div className="premium-card p-1 mb-1">
          <h2 className="text-xs font-semibold text-premium">Info Pessoal</h2>
          <div className="text-xs text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Nome:</span>
              <span className="text-white">{patientInfo.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Idade:</span>
              <span className="text-white">{patientInfo.age} anos</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tipo Sanguíneo:</span>
              <span className="text-white">{patientInfo.bloodType}</span>
            </div>
          </div>
        </div>

        {/* Medical Conditions */}
        <div className="premium-card p-1 mb-1">
          <h3 className="text-xs font-semibold text-premium">Alergias & Condições</h3>
          <div className="text-xs text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-400">Alergias:</span>
              <span className="text-white">{patientInfo.allergies.join(', ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Condições:</span>
              <span className="text-white">{patientInfo.chronicConditions.join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Medical Records */}
        <div className="premium-card p-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-premium">Histórico</h2>
            <button className="premium-button flex items-center px-1 py-1 text-xs">
              <i className="fas fa-download text-xs"></i>
            </button>
          </div>

          <div className="space-y-1">
            {medicalRecords.map((record) => (
              <div key={record.id} className="border border-gray-600 rounded p-1">
                <div className="flex items-start gap-1">
                  <div className={`w-4 h-4 rounded bg-gray-800 flex items-center justify-center ${getTypeColor(record.type)}`}>
                    <i className={`${getTypeIcon(record.type)} text-xs`}></i>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-white">{getTypeText(record.type)}</h3>
                      <span className="text-gray-400 text-xs">
                        {new Date(record.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-300">
                      <span className="text-gray-400">Dr:</span> {record.doctor}
                    </div>
                    
                    <p className="text-white text-xs">{record.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Prontuario
