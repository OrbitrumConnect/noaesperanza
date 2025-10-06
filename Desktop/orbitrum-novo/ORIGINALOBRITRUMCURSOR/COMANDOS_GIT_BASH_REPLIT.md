# 🚀 COMANDOS GIT BASH - REPLIT → GITHUB

## 📋 **PRÉ-REQUISITOS:**
1. Abrir Git Bash no Replit
2. Ter o repositório `OrbitrumOriginalPro1` criado no GitHub
3. Substituir `SEU_USUARIO` pelo seu username do GitHub

## 🔧 **COMANDOS SEQUENCIAIS:**

### **0. Inicializar Git (IMPORTANTE!):**
```bash
git init
```

### **1. Configurar Git:**
```bash
git config --global user.name "OrbitrumCreator"
git config --global user.email "breakinglegs@hotmail.com"
```

### **2. Limpar e configurar repositório:**
```bash
git remote remove origin
git remote add origin https://github.com/OrbitrumCreator/OrbitrumOriginalPro1.git
```

### **3. Adicionar arquivos essenciais:**
```bash
git add client/
git add server/
git add shared/
git add public/
git add package.json
git add package-lock.json
git add tsconfig.json
git add vite.config.ts
git add postcss.config.js
git add tailwind.config.ts
git add components.json
git add drizzle.config.ts
git add README.md
git add .gitignore
git add .env.example
```

### **4. Fazer commit e push:**
```bash
git commit -m "feat: complete orbitrum connect system - admin dashboard working"
git push -u origin main
```

## ✅ **RESULTADO ESPERADO:**
- Código 100% idêntico ao Replit no GitHub
- Admin dashboard funcionando
- Sistema completo para deploy

## 🎯 **PRÓXIMO PASSO:**
Após o push, o código estará no GitHub pronto para ser clonado no Cursor Team! 