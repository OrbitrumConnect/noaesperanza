import { memo } from 'react'

interface ProgressBarProps {
  value: number
  label: string
}

const clamp = (value: number) => Math.max(0, Math.min(100, value))

const ProgressBarComponent: React.FC<ProgressBarProps> = ({ value, label }) => {
  const safeValue = clamp(Math.round(value))

  return (
    <div className="w-full" aria-live="polite">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
          {label}
        </span>
        <span className="text-xs text-emerald-100">{safeValue}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-900/60">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all duration-500"
          style={{ width: `${safeValue}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={safeValue}
          aria-label={label}
        />
      </div>
    </div>
  )
}

export const ProgressBar = memo(ProgressBarComponent)

ProgressBar.displayName = 'ProgressBar'

export default ProgressBar
