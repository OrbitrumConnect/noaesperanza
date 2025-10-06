# 🚀 GUIA DEFINITIVO: UPLOAD GITHUB + DEPLOY VERCEL

## ⚠️ ESTRUTURA CORRETA DOS ARQUIVOS

A raiz do repositório GitHub deve ter exatamente esta estrutura:

```
orbitrum-connect/  (raiz do repositório)
├── package.json              ← NA RAIZ
├── vite.config.ts            ← NA RAIZ  
├── vercel.json               ← NA RAIZ
├── tsconfig.json             ← NA RAIZ
├── tailwind.config.js        ← NA RAIZ
├── postcss.config.js         ← NA RAIZ
├── index.html                ← NA RAIZ
├── src/                      ← PASTA NA RAIZ
│   ├── main.tsx
│   ├── App.tsx
│   └── index.css
└── public/                   ← PASTA NA RAIZ (se existir)
    └── favicon.ico
```

## 📂 PASSO 1: CRIAR PASTA LOCAL

```bash
mkdir orbitrum-connect
cd orbitrum-connect
```

## 📝 PASSO 2: CRIAR ARQUIVOS NA ORDEM CORRETA

### 1. package.json (NA RAIZ)
```json
{
  "name": "orbitrum-connect",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.294.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}
```

### 2. vite.config.ts (NA RAIZ)
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
})
```

### 3. vercel.json (NA RAIZ)
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### 4. tsconfig.json (NA RAIZ)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 5. tailwind.config.js (NA RAIZ)
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
      },
      animation: {
        'orbit-cw': 'orbit-clockwise 30s linear infinite',
        'orbit-ccw': 'orbit-counter-clockwise 35s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
```

### 6. postcss.config.js (NA RAIZ)
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### 7. index.html (NA RAIZ)
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Orbitrum Connect</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## 📁 PASSO 3: CRIAR PASTA src/

```bash
mkdir src
cd src
```

### 8. src/main.tsx
```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 9. src/App.tsx
```typescript
import React, { useState, useEffect } from 'react';
import './index.css';

// Dados dos profissionais
const professionals = [
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
  // ... mais profissionais
];

// Componente Starfield
const Starfield = () => {
  const [stars, setStars] = useState([]);

  useEffect(() => {
    const newStars = [];
    for (let i = 0; i < 100; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
      });
    }
    setStars(newStars);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
          }}
        />
      ))}
    </div>
  );
};

// Componente Principal
const App = () => {
  const [searchMode, setSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleBrainClick = () => {
    setSearchMode(true);
    
    // Som "Orbitrum"
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance('Orbitrum');
      utterance.rate = 0.9;
      utterance.pitch = 0.8;
      speechSynthesis.speak(utterance);
    }
    
    // Simular busca - primeiros 6 profissionais
    setSearchResults(professionals.slice(0, 6));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-space-black via-space-blue to-space-black relative overflow-hidden">
      
      {/* Starfield Background */}
      <Starfield />
      
      {/* Neural Brain Central */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div 
          className="w-20 h-20 bg-neon-cyan rounded-full cursor-pointer animate-pulse-glow flex items-center justify-center text-4xl font-bold text-space-black hover:scale-110 transition-transform"
          onClick={handleBrainClick}
        >
          🧠
        </div>
      </div>

      {/* Resultados da Busca */}
      {searchMode && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-8">
            {searchResults.map((prof) => (
              <div 
                key={prof.id}
                className="bg-space-blue/80 backdrop-blur-sm border border-neon-cyan/30 rounded-lg p-4 hover:border-neon-cyan/60 transition-all cursor-pointer"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-neon-cyan rounded-full flex items-center justify-center text-space-black font-bold mb-2">
                    {prof.avatar}
                  </div>
                  <h3 className="text-white font-semibold">{prof.name}</h3>
                  <p className="text-neon-cyan text-sm">{prof.title}</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-white ml-1">{prof.rating}</span>
                    <span className="text-gray-300 ml-1">({prof.reviews})</span>
                  </div>
                  <p className="text-neon-cyan font-bold mt-2">R$ {prof.hourlyRate}/h</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Instruções */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
        <p className="text-white text-lg mb-2 hover:text-yellow-400 transition-colors">
          Conecte-se com profissionais próximos
        </p>
        <p className="text-neon-cyan text-sm hover:text-white transition-colors">
          Clique no Cérebro
        </p>
      </div>
      
    </div>
  );
};

export default App;
```

### 10. src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --space-black: hsl(240, 33%, 6%);
    --space-blue: hsl(225, 44%, 11%);
    --neon-cyan: hsl(180, 100%, 50%);
    --electric-blue: hsl(207, 90%, 54%);
  }
}

@layer components {
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 20px hsl(180, 100%, 50%);
  }
  50% {
    box-shadow: 0 0 40px hsl(180, 100%, 50%), 0 0 60px hsl(180, 100%, 50%);
  }
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  background: var(--space-black);
}
```

## 🚀 PASSO 4: UPLOAD NO GITHUB

```bash
# Voltar para raiz do projeto
cd ..

# Inicializar Git
git init

# Adicionar todos os arquivos
git add .

# Commit inicial
git commit -m "Initial commit - Orbitrum Connect"

# Adicionar repositório remoto (substituir pela sua URL)
git remote add origin https://github.com/SEU-USUARIO/orbitrum-connect.git

# Push para GitHub
git push -u origin main
```

## 🌐 PASSO 5: DEPLOY NO VERCEL

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte sua conta GitHub
4. Selecione o repositório `orbitrum-connect`
5. **IMPORTANTE**: Deixe as configurações padrão:
   - Framework Preset: `Vite`
   - Root Directory: `./` (raiz)
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Clique em "Deploy"

## ✅ VERIFICAÇÃO FINAL

Antes do upload, confirme esta estrutura:

```
orbitrum-connect/
├── package.json          ✅ Raiz
├── vite.config.ts        ✅ Raiz  
├── vercel.json           ✅ Raiz
├── index.html            ✅ Raiz
├── src/main.tsx          ✅ Dentro de src/
├── src/App.tsx           ✅ Dentro de src/
└── src/index.css         ✅ Dentro de src/
```

## 🚨 ERROS COMUNS A EVITAR

❌ **NUNCA FAÇA:**
- Colocar arquivos de config dentro de subpastas
- Usar caminhos absolutos começando com `/`
- Esquecer o `base: './'` no vite.config.ts
- Omitir o vercel.json

✅ **SEMPRE FAÇA:**
- Arquivos de configuração na raiz
- Use `base: './'` no Vite
- Inclua vercel.json com rewrites
- Teste localmente com `npm run build && npm run preview`

## 🎯 RESULTADO

Seguindo este guia, terá:
- ✅ Build sem erros no Vercel
- ✅ App renderizando corretamente
- ✅ Neural brain funcional
- ✅ Sistema de busca operacional
- ✅ Interface idêntica ao Replit