interface MetricCardProps {
  icon: string
  title: string
  value: string
  change?: string
  color: 'green' | 'blue' | 'yellow' | 'red'
}

const MetricCard = ({ icon, title, value, change, color }: MetricCardProps) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-500',
      text: 'text-green-400',
      border: 'border-green-500',
      glow: 'glow-rim'
    },
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-400',
      border: 'border-blue-500',
      glow: 'glow-neuro'
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-400',
      border: 'border-yellow-500',
      glow: 'glow-cannabis'
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-400',
      border: 'border-red-500',
      glow: 'shadow-red-500/30'
    }
  }

  const classes = colorClasses[color]

  const getChangeColor = (change: string) => {
    if (change.startsWith('+')) return 'text-green-400'
    if (change.startsWith('-')) return 'text-red-400'
    return 'text-yellow-400'
  }

  return (
    <div className="metric-card hover:scale-105 transition-all">
      <div className={`w-12 h-12 rounded-lg ${classes.bg} bg-opacity-20 flex items-center justify-center ${classes.glow}`}>
        <i className={`fas ${icon} text-xl ${classes.text}`}></i>
      </div>
      
      <div className="flex-1">
        <div className={`text-2xl font-bold ${classes.text}`}>
          {value}
        </div>
        <div className="text-sm text-gray-400 mb-1">
          {title}
        </div>
        {change && (
          <div className={`text-xs font-medium ${getChangeColor(change)}`}>
            {change}
          </div>
        )}
      </div>
    </div>
  )
}

export default MetricCard
