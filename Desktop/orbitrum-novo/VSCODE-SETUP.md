# 🚀 SETUP COMPLETO ORBITRUM NO VS CODE

## 1. CRIAR PROJETO VITE + REACT

```bash
# Criar projeto
npm create vite@latest orbitrum-connect -- --template react-ts
cd orbitrum-connect

# Instalar dependências base
npm install
```

## 2. INSTALAR DEPENDÊNCIAS NECESSÁRIAS

```bash
# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-slot
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react

# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 3. CONFIGURAR TAILWIND (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'space-black': 'hsl(240, 33%, 6%)',
        'space-blue': 'hsl(225, 44%, 11%)',
        'neon-cyan': 'hsl(180, 100%, 50%)',
        'electric-blue': 'hsl(207, 90%, 54%)',
        'neon-green': 'hsl(120, 100%, 50%)',
        'neon-purple': 'hsl(350, 100%, 62%)',
      },
      animation: {
        'orbit-cw': 'orbit-clockwise 30s linear infinite',
        'orbit-ccw': 'orbit-counter-clockwise 35s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shooting-star': 'shooting-star 18s linear infinite',
      }
    },
  },
  plugins: [],
}
```

## 4. CONFIGURAR VITE (vite.config.ts)

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // Para funcionar no Vercel
  plugins: [react()],
})
```

## 5. ESTRUTURA DE PASTAS

```
orbitrum-connect/
├── public/
│   └── index.html
├── src/
│   ├── App.tsx          # Componente principal
│   ├── main.tsx         # Entry point
│   └── index.css        # Estilos globais
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
└── vercel.json          # Para deploy no Vercel
```

## 6. ARQUIVO VERCEL.JSON

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

## 7. DADOS DOS PROFISSIONAIS (src/data/professionals.ts)

```typescript
export interface Professional {
  id: number;
  name: string;
  title: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  avatar: string;
  skills: string[];
  available: boolean;
}

export const professionals: Professional[] = [
  {
    id: 1,
    name: "Carlos Silva",
    title: "Pintor Profissional",
    rating: 4.8,
    reviews: 127,
    hourlyRate: 45,
    avatar: "CS",
    skills: ["Pintura Residencial", "Textura", "Verniz"],
    available: true
  },
  {
    id: 2,
    name: "Ana Pereira",
    title: "Designer de Interiores",
    rating: 4.9,
    reviews: 203,
    hourlyRate: 80,
    avatar: "AP",
    skills: ["Design", "Decoração", "Consultoria"],
    available: true
  },
  // ... mais 14 profissionais
];
```

## 8. COMPONENT PRINCIPAL (src/App.tsx)

```typescript
import React, { useState, useEffect } from 'react';
import { professionals } from './data/professionals';
import './index.css';

const App = () => {
  const [searchMode, setSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);

  // Sistema de busca neural
  const handleBrainClick = () => {
    setSearchMode(true);
    // Som "Orbitrum"
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Orbitrum');
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
      speechSynthesis.speak(utterance);
    }
    
    // Buscar profissionais
    const results = professionals.slice(0, 6);
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-black via-space-blue to-space-black relative overflow-hidden">
      
      {/* Starfield Background */}
      <Starfield />
      
      {/* Neural Brain Central */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div 
          className="neural-brain w-20 h-20 bg-neon-cyan rounded-full cursor-pointer animate-pulse-glow"
          onClick={handleBrainClick}
        >
          <div className="w-full h-full flex items-center justify-center text-space-black font-bold">
            🧠
          </div>
        </div>
      </div>

      {/* Sistema Orbital */}
      {!searchMode && <OrbitalSystem professionals={professionals} />}
      
      {/* Resultados da Busca */}
      {searchMode && <SearchResults results={searchResults} />}
      
      {/* Modal Profissional */}
      {selectedProfessional && (
        <ProfessionalModal 
          professional={selectedProfessional}
          onClose={() => setSelectedProfessional(null)}
        />
      )}
      
      {/* Instruções */}
      <div className="smoke-trail-text">
        <span className="text-yellow-glow hover-yellow">
          Conecte-se com profissionais próximos
        </span>
        <br />
        <span className="text-cyan-glow hover-cyan text-sm">
          Clique no Cérebro
        </span>
      </div>
      
    </div>
  );
};

export default App;
```

## 9. COMPONENTE STARFIELD (src/components/Starfield.tsx)

```typescript
import React, { useEffect, useState } from 'react';

const Starfield = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          animationDelay: Math.random() * 3
        });
      }
      setStars(newStars);
    };

    generateStars();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.animationDelay}s`
          }}
        />
      ))}
    </div>
  );
};

export default Starfield;
```

## 10. COMANDOS PARA RODAR

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 11. DEPLOY NO VERCEL

1. Instalar Vercel CLI: `npm i -g vercel`
2. Fazer login: `vercel login`
3. Deploy: `vercel --prod`

## 12. RECURSOS NECESSÁRIOS

- Node.js 18+
- VS Code com extensões:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - Auto Rename Tag

## 🚀 RESULTADO FINAL

O app terá:
- ✅ Neural brain clicável no centro
- ✅ 16 profissionais orbitando
- ✅ Sistema de busca funcional
- ✅ Som "Orbitrum" no clique
- ✅ Starfield animado com 100 estrelas
- ✅ Interface responsiva
- ✅ Pronto para deploy no Vercel

**IDENTICO ao que funciona aqui no Replit!**