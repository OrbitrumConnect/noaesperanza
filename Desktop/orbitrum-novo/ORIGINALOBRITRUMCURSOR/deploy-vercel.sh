#!/bin/bash

echo "🚀 ORBITRUM CONNECT - DEPLOY VERCEL"
echo "=================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para verificar se comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar pré-requisitos
echo -e "${BLUE}📋 Verificando pré-requisitos...${NC}"

if ! command_exists git; then
    echo -e "${RED}❌ Git não encontrado. Instale o Git primeiro.${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}❌ Node.js não encontrado. Instale o Node.js primeiro.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ NPM não encontrado. Instale o NPM primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pré-requisitos OK${NC}"

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute este script na raiz do projeto Orbitrum${NC}"
    exit 1
fi

# Verificar se tem arquivo .env ou variáveis necessárias
echo -e "${BLUE}🔐 Verificando configurações...${NC}"

if [ ! -f ".env" ] && [ -z "$VITE_SUPABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado${NC}"
    echo -e "${YELLOW}⚠️  Configure as variáveis de ambiente no Vercel Dashboard${NC}"
    echo -e "${BLUE}📝 Use o arquivo vercel-env-example.txt como referência${NC}"
fi

# Instalar dependências
echo -e "${BLUE}📦 Instalando dependências...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao instalar dependências${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependências instaladas${NC}"

# Testar build local
echo -e "${BLUE}🔧 Testando build local...${NC}"
npm run build:vercel

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro no build local${NC}"
    echo -e "${YELLOW}💡 Verifique os logs acima e corrija os erros${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build local OK${NC}"

# Verificar status do git
echo -e "${BLUE}📝 Verificando status do Git...${NC}"
git status --porcelain

if [ $? -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas${NC}"
    read -p "Deseja fazer commit das mudanças? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "Deploy Vercel - $(date)"
        echo -e "${GREEN}✅ Mudanças commitadas${NC}"
    fi
fi

# Verificar se tem remote origin
if ! git remote get-url origin >/dev/null 2>&1; then
    echo -e "${RED}❌ Remote origin não configurado${NC}"
    echo -e "${YELLOW}💡 Configure o remote do GitHub primeiro:${NC}"
    echo -e "${BLUE}   git remote add origin https://github.com/seu-usuario/seu-repo.git${NC}"
    exit 1
fi

# Push para GitHub
echo -e "${BLUE}📤 Fazendo push para GitHub...${NC}"
git push origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Erro ao fazer push${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Push realizado com sucesso${NC}"

# Instruções finais
echo -e "${BLUE}🎯 PRÓXIMOS PASSOS:${NC}"
echo -e "${YELLOW}1. Acesse: https://vercel.com/dashboard${NC}"
echo -e "${YELLOW}2. Clique em 'New Project'${NC}"
echo -e "${YELLOW}3. Importe seu repositório do GitHub${NC}"
echo -e "${YELLOW}4. Configure as variáveis de ambiente:${NC}"
echo -e "${BLUE}   - VITE_SUPABASE_URL${NC}"
echo -e "${BLUE}   - VITE_SUPABASE_ANON_KEY${NC}"
echo -e "${BLUE}   - DATABASE_URL${NC}"
echo -e "${BLUE}   - SESSION_SECRET${NC}"
echo -e "${YELLOW}5. Build Command: npm run build:vercel${NC}"
echo -e "${YELLOW}6. Output Directory: dist${NC}"
echo -e "${YELLOW}7. Clique em 'Deploy'${NC}"

echo -e "${GREEN}🎉 Deploy preparado com sucesso!${NC}"
echo -e "${BLUE}📖 Consulte DEPLOY-VERCEL-COMPLETO.md para instruções detalhadas${NC}" 