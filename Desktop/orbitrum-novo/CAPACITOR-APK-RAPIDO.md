# 📱 CAPACITOR APK RÁPIDO - 15 MINUTOS

## 🎯 Opção Mais Simples para APK Independente

### ⚡ PASSO 1: Preparar Projeto
```bash
# Criar pasta nova
mkdir orbitrum-app
cd orbitrum-app

# Inicializar projeto
npm init -y

# Instalar Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### ⚡ PASSO 2: Configurar Capacitor
```bash
# Inicializar Capacitor
npx cap init orbitrum com.orbitrum.app --web-dir=dist

# Adicionar plataforma Android
npx cap add android
```

### ⚡ PASSO 3: Copiar Código Web
```bash
# Criar pasta dist
mkdir dist

# Copiar arquivos do sistema:
# VERCEL-INDEX.html → dist/index.html
# VERCEL-APP-COMPLETO.tsx → dist/app.js (renomear)
# VERCEL-CSS-COMPLETO.css → dist/style.css
```

### ⚡ PASSO 4: Build APK
```bash
# Sincronizar código
npx cap sync

# Abrir Android Studio (automático)
npx cap run android

# OU build direto por linha de comando:
npx cap build android
```

## 📋 Arquivos Necessários

### dist/index.html
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orbitrum Connect</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="root"></div>
    <script src="app.js"></script>
</body>
</html>
```

### capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.orbitrum.app',
  appName: 'Orbitrum Connect',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
```

## ⚡ COMANDOS RESUMIDOS

```bash
# 1. Setup (1x só)
mkdir orbitrum-app && cd orbitrum-app
npm init -y
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Configurar
npx cap init orbitrum com.orbitrum.app --web-dir=dist
npx cap add android

# 3. Copiar arquivos VERCEL-* para pasta dist/

# 4. Build APK
npx cap sync
npx cap run android

# APK gerado em:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 🚀 VANTAGENS CAPACITOR

✅ **Usa código web exato** - Zero mudanças no sistema
✅ **15 minutos total** - Mais rápido que Expo  
✅ **APK local** - Não depende da nuvem
✅ **Neural brain preservado** - Funciona igual
✅ **Distribuição fácil** - Arquivo APK pronto

## 📱 Resultado Final

- **orbitrum.apk** (~20MB)
- **Instala igual Uber** (fontes desconhecidas)
- **Funciona offline** após instalado
- **Sistema completo** preservado
- **Distribui via WhatsApp/Telegram**

**O Capacitor é PERFEITO para transformar seu sistema web em app Android rapidamente!**