import { memo } from 'react'
import type { TriageMessage } from './types'

interface MessageBubbleProps {
  message: TriageMessage
  isLastFromAuthor: boolean
}

const authorStyles: Record<TriageMessage['author'], string> = {
  noa: 'bg-emerald-900/70 border border-emerald-700 text-emerald-50',
  paciente: 'bg-slate-800 border border-slate-600 text-slate-100',
}

const alignmentStyles: Record<TriageMessage['author'], string> = {
  noa: 'items-start text-left',
  paciente: 'items-end text-right',
}

const MessageBubbleComponent: React.FC<MessageBubbleProps> = ({ message, isLastFromAuthor }) => {
  const alignment = alignmentStyles[message.author]

  return (
    <div
      className={`flex flex-col gap-1 ${alignment}`}
      aria-label={`Mensagem de ${message.author === 'noa' ? 'Nôa Esperanza' : 'paciente'}`}
    >
      <span className="text-xs text-slate-400">
        {message.author === 'noa' ? 'Nôa Esperanza' : 'Você'} ·{' '}
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      <div
        className={`max-w-2xl rounded-2xl px-4 py-3 leading-relaxed shadow-lg transition-colors duration-300 ${
          authorStyles[message.author]
        } ${isLastFromAuthor ? '' : 'rounded-br-sm'}`}
      >
        <p className="whitespace-pre-wrap text-sm md:text-base">{message.content}</p>
      </div>
    </div>
  )
}

export const MessageBubble = memo(MessageBubbleComponent)

MessageBubble.displayName = 'MessageBubble'

export default MessageBubble
