# 🖥️ Instalação Local no PC - Orbitrum Connect

## Pré-requisitos
- Node.js 18+ instalado
- Git instalado

## Passo a Passo

### 1. Download do Projeto
```bash
# Clone ou baixe o projeto
git clone [seu-repositorio] orbitrum-local
cd orbitrum-local
```

### 2. Instalação das Dependências
```bash
# Instalar dependências do projeto principal
npm install

# Instalar dependências do cliente
cd client
npm install
cd ..

# Instalar dependências do servidor
cd server
npm install
cd ..
```

### 3. Configuração do Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
# Database (SQLite local para teste)
DATABASE_URL="file:./local.db"

# Supabase (pode usar credenciais de teste)
SUPABASE_URL="https://sua-url.supabase.co"
SUPABASE_ANON_KEY="sua-chave-anonima"

# Outros
NODE_ENV=development
PORT=3000
```

### 4. Executar o Sistema
```bash
# Rodar o sistema completo
npm run dev
```

### 5. Acessar no Navegador
- **PC**: http://localhost:3000
- **Celular**: http://[SEU-IP-LOCAL]:3000 (mesmo WiFi)

## Recursos Disponíveis Localmente

### ✅ Funcionam Perfeitamente
- Sistema Neural Brain orbital
- Navegação entre dashboards
- Interface completa (Cliente/Profissional/Admin)
- Animações Framer Motion
- Sistema de tokens (modo demo)
- GPS tracking (simulado)
- Chat IA (modo offline)
- Calendários interativos

### ⚠️ Limitações Locais
- PIX real (apenas simulação)
- Notificações push
- WebSocket em produção
- Integração Telegram completa

## Comandos Úteis

```bash
# Parar o servidor
Ctrl + C

# Limpar cache
npm run clean

# Ver logs detalhados
npm run dev --verbose

# Rodar apenas frontend
cd client && npm run dev

# Rodar apenas backend
cd server && npm run dev
```

## Acesso Mobile na Rede Local

1. **Descobrir seu IP:**
   - Windows: `ipconfig`
   - Procure por "IPv4 Address" (ex: 192.168.1.100)

2. **Acessar pelo celular:**
   - Conecte no mesmo WiFi
   - Digite: http://192.168.1.100:3000

## Resolução de Problemas

### Erro de Porta Ocupada
```bash
# Matar processo na porta 3000
npx kill-port 3000
```

### Problemas de Dependências
```bash
# Limpar e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro de Database
```bash
# Resetar database local
rm -f local.db
npm run db:push
```

## Sistema Funcionando ✅

Após executar `npm run dev`, você verá:
- ✅ Cliente rodando em http://localhost:3000
- ✅ Servidor API em http://localhost:3000/api
- ✅ Sistema neural brain ativo
- ✅ Dashboards funcionais
- ✅ Mobile responsivo

## Próximo Passo: Migração para Produção

Após testar localmente, podemos migrar para Railway/Vercel com todos os dados preservados.