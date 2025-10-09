import { memo } from 'react'

interface TypingIndicatorProps {
  author?: 'noa' | 'paciente'
}

const TypingIndicatorComponent: React.FC<TypingIndicatorProps> = ({ author = 'noa' }) => (
  <div
    className={`flex items-center gap-2 text-xs text-slate-300 ${author === 'paciente' ? 'justify-end' : 'justify-start'}`}
    role="status"
    aria-live="polite"
  >
    <span className="sr-only">
      {author === 'noa' ? 'Nôa Esperanza digitando' : 'Paciente digitando'}
    </span>
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse [animation-delay:150ms]"></span>
      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse [animation-delay:300ms]"></span>
    </div>
  </div>
)

export const TypingIndicator = memo(TypingIndicatorComponent)

TypingIndicator.displayName = 'TypingIndicator'

export default TypingIndicator
