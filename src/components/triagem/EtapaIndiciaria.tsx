import { memo } from 'react'

interface EtapaIndiciariaProps {
  topics: string[]
  onSelectTopic: (topic: string) => void
  disabled?: boolean
}

const EtapaIndiciariaComponent: React.FC<EtapaIndiciariaProps> = ({
  topics,
  onSelectTopic,
  disabled = false,
}) => {
  if (!topics.length) {
    return null
  }

  return (
    <section
      aria-label="Pontos de exploração para a história indiciária"
      className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-4"
    >
      <header className="mb-3">
        <h3 className="text-sm font-semibold text-emerald-100">Aspectos para aprofundarmos</h3>
        <p className="text-xs text-slate-300">
          Use os tópicos abaixo para complementar a narrativa caso faça sentido para a sua história.
        </p>
      </header>
      <div className="grid gap-2 md:grid-cols-2" role="list">
        {topics.map(topic => (
          <button
            key={topic}
            type="button"
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-left text-xs text-slate-200 transition hover:border-emerald-400 hover:text-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
            onClick={() => onSelectTopic(topic)}
            disabled={disabled}
            aria-disabled={disabled}
          >
            <span>{topic}</span>
            <span aria-hidden="true" className="text-emerald-300">
              ↗
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

export const EtapaIndiciaria = memo(EtapaIndiciariaComponent)

EtapaIndiciaria.displayName = 'EtapaIndiciaria'

export default EtapaIndiciaria
