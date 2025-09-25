/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Cores dinâmicas que precisamos garantir
    'text-green-400', 'text-blue-400', 'text-yellow-400', 'text-red-400',
    'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-red-500',
    'border-green-500', 'border-blue-500', 'border-yellow-500', 'border-red-500',
    'bg-green-500/20', 'bg-blue-500/20', 'bg-yellow-500/20', 'bg-red-500/20',
    'bg-green-500/10', 'bg-blue-500/10', 'bg-yellow-500/10', 'bg-red-500/10',
    'border-green-500/20', 'border-blue-500/20', 'border-yellow-500/20', 'border-red-500/20',
    'w-8', 'h-8', 'w-12', 'h-12', 'w-16', 'h-16', 'w-20', 'h-20'
  ],
  theme: {
    extend: {
      colors: {
        // Rim - Verde Suave (Saúde e Equilíbrio)
        rim: {
          primary: '#10b981',
          secondary: '#34d399',
          accent: '#065f46',
          light: '#d1fae5',
          glow: 'rgba(16, 185, 129, 0.3)'
        },
        // Neuro - Azul/Ciano (Clareza, Foco, Tecnologia)
        neuro: {
          primary: '#3b82f6',
          secondary: '#06b6d4',
          accent: '#1e3a8a',
          light: '#dbeafe',
          glow: 'rgba(59, 130, 246, 0.3)'
        },
        // Cannabis Medicinal - Amarelo/Âmbar (Destaque)
        cannabis: {
          primary: '#f59e0b',
          secondary: '#fbbf24',
          accent: '#92400e',
          light: '#fef3c7',
          glow: 'rgba(245, 158, 11, 0.3)'
        },
        // Interface Premium
        premium: {
          bg: '#1e3a8a',
          glass: 'rgba(30, 64, 175, 0.7)',
          gold: '#f59e0b',
          rose: '#f472b6',
          silver: '#94a3b8'
        }
      },
      animation: {
        'luxury-float': 'luxury-float 15s ease-in-out infinite',
        'premium-glow': 'premium-glow 3s ease-in-out infinite',
        'ai-pulse': 'ai-pulse 2s ease-in-out infinite',
        'listening-pulse': 'listening-pulse 2s ease-in-out infinite'
      },
      backdropBlur: {
        'premium': '20px'
      },
      fontFamily: {
        'premium': ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
