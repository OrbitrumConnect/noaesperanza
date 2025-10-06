# 💻 INSTALAÇÃO LOCAL NO WINDOWS

## 🚀 3 PASSOS SIMPLES

### PASSO 1: Baixar Node.js
- Ir em **nodejs.org** 
- Baixar versão **LTS** (recomendada)
- Instalar normalmente (Next, Next, Install)

### PASSO 2: Executar Setup Automático
- **Duplo clique** em `run-local.bat`
- Script fará tudo automaticamente:
  - ✅ Criar pasta `orbitrum-local`
  - ✅ Copiar arquivos do sistema 
  - ✅ Instalar dependências
  - ✅ Descobrir seu IP local
  - ✅ Iniciar servidor

### PASSO 3: Acessar o App
- **PC**: http://localhost:3000
- **Celular**: http://SEU_IP:3000 (script mostra o IP)

## 🎯 O QUE ACONTECE

```
📁 orbitrum-local/
├── 📄 server.js (servidor Express)
├── 📁 public/
│   ├── index.html (página principal)
│   ├── style.css (estilos)
│   ├── app.js (código JavaScript)
│   ├── manifest.json (PWA)
│   └── service-worker.js (funciona offline)
└── 📄 package.json (dependências)
```

## 📱 INSTALAR NO CELULAR

### Android:
1. Abrir http://SEU_IP:3000 no Chrome
2. Menu (3 pontos) → **"Instalar app"**
3. App instalado na tela inicial!

### iPhone: 
1. Abrir http://SEU_IP:3000 no Safari
2. Compartilhar → **"Adicionar à Tela Inicial"**
3. App instalado na tela inicial!

## 🔧 COMANDOS MANUAIS (Se Preferir)

```batch
:: Criar pasta
mkdir orbitrum-local
cd orbitrum-local

:: Executar setup
node ..\setup-local.js

:: Instalar dependências
npm install

:: Iniciar servidor
npm start
```

## ✅ RESULTADO FINAL

- 🧠 **Neural brain** funcionando identicamente
- 🎮 **Dashboards** cliente/profissional/admin completos
- 📱 **Celular + PC** acessando o mesmo servidor
- 🌐 **Funciona offline** após primeira visita
- 🚀 **Zero dependência** de internet ou Vercel

## 🎯 DIFERENÇA DOS OUTROS MÉTODOS

### ✅ **Instalação Local** (Este método)
- App roda no seu PC
- Celular acessa via WiFi
- Dados ficam na sua máquina
- Sem dependência de internet

### ❌ **APK Nativo** (Outros guias)
- Precisa Android Studio
- Build demorado (20-45 min)
- Mais complexo

### ❌ **PWA Online** (Vercel/Netlify)
- Precisa internet sempre
- Dados na nuvem
- Dependência de terceiros

**Com este método, você tem controle total do app rodando localmente!**