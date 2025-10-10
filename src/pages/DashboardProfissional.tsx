import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import GPTPBuilder from '../components/GPTPBuilder'
import { useAuth } from '../contexts/AuthContext'
import { Specialty } from '../App'

type NotificationType = 'info' | 'success' | 'warning' | 'error'

interface DashboardProfissionalProps {
  currentSpecialty: Specialty
  addNotification: (message: string, type?: NotificationType) => void
}

const DashboardProfissional = ({ addNotification }: DashboardProfissionalProps) => {
  const { user, userProfile } = useAuth()
  const builderUserId = user?.id || 'noa-profissional-guest'
  const builderUserName = userProfile?.name || user?.email || 'Profissional Nôa'

  useEffect(() => {
    // Dashboard carregado
  }, [])

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-cyan-300 hover:text-cyan-200 transition-colors">
              <i className="fas fa-arrow-left mr-2" />Voltar ao início
            </Link>
            <span className="inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1 text-xs uppercase tracking-widest text-cyan-200">
              <i className="fas fa-user-tie" /> Profissional
            </span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 px-4 py-3 shadow-lg">
            <h1 className="text-lg font-semibold uppercase tracking-widest">Centro Multimodal do Profissional</h1>
            <p className="text-sm text-white/80">
              Organize planos terapêuticos, supervisões e protocolos compartilhados em parceria com a Nôa Esperanza.
            </p>
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-white/10 bg-black/40 shadow-xl backdrop-blur">
          <GPTPBuilder userId={builderUserId} userName={builderUserName} userType="profissional" />
        </section>
      </div>
    </div>
  )
}

export default DashboardProfissional
