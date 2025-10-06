# 🤖 BUILD APK AUTOMÁTICO - GITHUB ACTIONS

## 🎯 Gerar APK Sem Instalar Nada no Seu PC

### 📋 PASSO 1: Criar Repositório GitHub

1. Ir em **github.com** e criar novo repositório
2. Nome: `orbitrum-android`
3. Público ✅
4. Adicionar README ✅

### 📋 PASSO 2: Upload dos Arquivos

Fazer upload destes arquivos para o repositório:

```
orbitrum-android/
├── .github/workflows/build-apk.yml
├── App.tsx
├── package.json
├── app.json
├── eas.json
└── README.md
```

### 📋 PASSO 3: Arquivo App.tsx
```typescript
// Copiar conteúdo completo do VERCEL-APP-COMPLETO.tsx
// Este será o código principal do app
```

### 📋 PASSO 4: package.json
```json
{
  "name": "orbitrum-android",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "build": "eas build --platform android --profile preview"
  },
  "dependencies": {
    "expo": "~49.0.0",
    "@expo/vector-icons": "^13.0.0",
    "react": "18.2.0",
    "react-native": "0.72.0",
    "expo-linear-gradient": "~12.3.0",
    "expo-blur": "~12.4.0",
    "expo-av": "~13.4.0",
    "expo-haptics": "~12.4.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.0"
  }
}
```

### 📋 PASSO 5: app.json
```json
{
  "expo": {
    "name": "Orbitrum Connect",
    "slug": "orbitrum-connect",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0f172a"
    },
    "android": {
      "package": "com.orbitrum.connect",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0f172a"
      }
    },
    "extra": {
      "eas": {
        "projectId": "b24cf4e1-c18b-4a7f-8db8-bf713e58c7c7"
      }
    }
  }
}
```

### 📋 PASSO 6: eas.json
```json
{
  "cli": {
    "version": ">= 7.8.0"
  },
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### 📋 PASSO 7: GitHub Actions (.github/workflows/build-apk.yml)
```yaml
name: Build APK
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: npm install

      - name: Build APK
        run: eas build --platform android --profile preview --non-interactive

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: orbitrum-android.apk
          path: "*.apk"
```

## 🔑 PASSO 8: Configurar Secrets

### No GitHub:
1. Ir em **Settings** → **Secrets and variables** → **Actions**
2. Adicionar secret: `EXPO_TOKEN`
3. Valor: Token do Expo (criar em expo.dev)

### Gerar Token Expo:
```bash
# No terminal do seu PC:
npx expo login
npx expo whoami --token

# Copiar o token retornado
```

## 🚀 PASSO 9: Executar Build

1. **Push** para o repositório GitHub
2. **Actions** executará automaticamente  
3. **Download APK** quando terminar (aba Artifacts)

## 📱 ALTERNATIVA MAIS SIMPLES: NETLIFY

### Build Web que Vira App

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#0f172a">
    <link rel="manifest" href="manifest.json">
    <title>Orbitrum Connect</title>
    <style>
        /* Conteúdo do VERCEL-CSS-COMPLETO.css */
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
        // Conteúdo do VERCEL-APP-COMPLETO.tsx convertido
    </script>
</body>
</html>
```

### manifest.json
```json
{
  "name": "Orbitrum Connect",
  "short_name": "Orbitrum",
  "description": "Plataforma de conexões profissionais",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0f172a",
  "theme_color": "#00ffff",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Deploy Netlify:
1. **Arrastar pasta** para netlify.com/drop
2. **Site online** em 30 segundos
3. **"Adicionar à tela inicial"** no celular
4. **Funciona igual app nativo!**

## 🎯 RESUMO DAS OPÇÕES

### 🤖 GitHub Actions (APK Real)
- ✅ APK nativo instalável
- ✅ Build automático na nuvem
- ⏱️ 45 minutos setup + 20 min build
- 📱 Resultado: orbitrum.apk

### 🌐 Netlify PWA (App Web)
- ✅ Funciona igual app nativo
- ✅ 5 minutos total
- ✅ Atualiza automaticamente
- 📱 Resultado: Link que vira app

### 📦 Expo EAS (Mais Simples)
- ✅ Um comando gera APK
- ✅ Build na nuvem Expo
- ⏱️ 20 minutos
- 📱 Resultado: Link download APK

## 🚀 QUAL ESCOLHER?

**Para distribuição rápida: Netlify PWA (5 min)**
**Para APK real: Expo EAS build (20 min)**  
**Para automatizar: GitHub Actions (45 min setup)**

Todos mantêm o neural brain e dashboards 100% funcionais!