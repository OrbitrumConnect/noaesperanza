import { memo, useMemo } from 'react'

interface EtapaQueixaProps {
  suggestions: string[]
  onSelectSuggestion: (suggestion: string) => void
  disabled?: boolean
}

const EtapaQueixaComponent: React.FC<EtapaQueixaProps> = ({
  suggestions,
  onSelectSuggestion,
  disabled = false,
}) => {
  const uniqueSuggestions = useMemo(() => Array.from(new Set(suggestions)), [suggestions])

  if (!uniqueSuggestions.length) {
    return null
  }

  return (
    <div className="rounded-2xl border border-emerald-800/70 bg-emerald-950/40 p-4 shadow-inner">
      <h3 className="mb-3 text-sm font-semibold text-emerald-100">
        Sugestões de queixas frequentes
      </h3>
      <div className="flex flex-wrap gap-2" role="list">
        {uniqueSuggestions.map(suggestion => (
          <button
            key={suggestion}
            type="button"
            className="rounded-full border border-emerald-700 bg-emerald-800/60 px-3 py-1 text-xs font-medium text-emerald-50 transition hover:border-emerald-400 hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
            onClick={() => onSelectSuggestion(suggestion)}
            disabled={disabled}
            aria-disabled={disabled}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

export const EtapaQueixa = memo(EtapaQueixaComponent)

EtapaQueixa.displayName = 'EtapaQueixa'

export default EtapaQueixa
