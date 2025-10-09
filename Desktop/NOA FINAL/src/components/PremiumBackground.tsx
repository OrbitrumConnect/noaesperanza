const PremiumBackground = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
      {/* Padrões de Luxo */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 80%, rgba(245, 158, 11, 0.2) 0%, transparent 60%),
              radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
              radial-gradient(circle at 40% 40%, rgba(251, 191, 36, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 60% 80%, rgba(30, 58, 138, 0.1) 0%, transparent 50%)
            `,
            animation: 'luxury-pattern 20s ease-in-out infinite'
          }}
        />
      </div>

      {/* Elementos Flutuantes */}
      <div className="absolute top-0 left-0 w-full h-full">
        {/* Elemento Âmbar */}
        <div 
          className="absolute w-2 h-2 rounded-full opacity-70"
          style={{
            background: '#fbbf24',
            top: '20%',
            left: '15%',
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.4)',
            animation: 'luxury-float 15s ease-in-out infinite'
          }}
        />
        
        {/* Elemento Azul */}
        <div 
          className="absolute w-2 h-2 rounded-full opacity-70"
          style={{
            background: '#3b82f6',
            top: '60%',
            right: '20%',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
            animation: 'luxury-float 15s ease-in-out infinite 5s'
          }}
        />
        
        {/* Elemento Ciano */}
        <div 
          className="absolute w-2 h-2 rounded-full opacity-70"
          style={{
            background: '#06b6d4',
            bottom: '30%',
            left: '70%',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
            animation: 'luxury-float 15s ease-in-out infinite 10s'
          }}
        />
      </div>
    </div>
  )
}

export default PremiumBackground
