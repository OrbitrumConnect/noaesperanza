# Alice Wellbeing Guide - Plataforma de Saúde Integrada

Uma plataforma completa de saúde e bem-estar com IA avançada, integração com Stripe para pagamentos, e dashboard administrativo.

## 🚀 Características Principais

- **IA Conversacional Avançada**: Alice, assistente de saúde personalizada
- **Sistema de Pagamentos**: Integração completa com Stripe
- **Dashboard Administrativo**: Gestão completa de usuários e dados
- **Autenticação Segura**: Supabase Auth com RLS
- **Design Responsivo**: Interface moderna e acessível
- **Edge Functions**: Processamento serverless no Supabase
- **Analytics**: Monitoramento de progresso e métricas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI/UX**: Tailwind CSS + shadcn/ui + Radix UI
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Pagamentos**: Stripe
- **IA**: OpenAI GPT-4 + ElevenLabs (TTS)
- **Deploy**: Vercel
- **Roteamento**: React Router DOM
- **Estado**: TanStack Query + React Hook Form
- **Validação**: Zod
- **Notificações**: Sonner
- **Animações**: Framer Motion

## 📋 Pré-requisitos

- Node.js 18+ 
- npm/yarn/pnpm
- Conta Supabase
- Conta Stripe
- Conta OpenAI
- Conta ElevenLabs (opcional)

## 🚀 Instalação e Setup

### 1. Clone o Repositório

```bash
git clone https://github.com/OrbitrumConnect/alice-wellbeing-guide.git
cd alice-wellbeing-guide
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_PROJECT_ID="jpgmzygxmsiscrmpskgf"
VITE_SUPABASE_URL="https://jpgmzygxmsiscrmpskgf.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZ216eWd4bXNpc2NybXBza2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjIzNzUsImV4cCI6MjA3MTA5ODM3NX0.WBOy5nzfL-n-8ZitgaTkxGgJfitjRt3nCnMndY36qQg"

# Stripe Configuration (Frontend - Publishable Key)
VITE_STRIPE_PUBLISHABLE_KEY="pk_live_51Rsp2KC46MRhe1fByhH11Tx2PTvUNgnKSY7Al0R87XArm9C0zulZICONmaefbST0OiAanxmwL1GPlTVncpsiRFSj00L5Ysc42a"

# OpenAI Configuration
VITE_OPENAI_API_KEY="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"

# ElevenLabs Configuration (Opcional)
VITE_ELEVENLABS_API_KEY="your-elevenlabs-api-key"
```

### 4. Configure o Supabase

#### 4.1 Instale o Supabase CLI

```bash
npm install -g @supabase/cli
```

#### 4.2 Login no Supabase

```bash
npx supabase login
```

#### 4.3 Link o Projeto

```bash
npx supabase link --project-ref jpgmzygxmsiscrmpskgf
```

#### 4.4 Configure os Secrets

```bash
npx supabase secrets set STRIPE_SECRET_KEY=sk_live_...
npx supabase secrets set OPENAI_API_KEY=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
npx supabase secrets set ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

#### 4.5 Deploy das Edge Functions

```bash
npx supabase functions deploy
```

### 5. Execute o Projeto

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Preview da build
npm run preview
```

## 🌐 Deploy no Vercel

### 1. Conecte com GitHub

1. Faça push do código para o GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Conecte sua conta GitHub
4. Importe o repositório

### 2. Configure as Environment Variables

No dashboard do Vercel, vá em **Settings → Environment Variables** e adicione:

```env
VITE_SUPABASE_PROJECT_ID=jpgmzygxmsiscrmpskgf
VITE_SUPABASE_URL=https://jpgmzygxmsiscrmpskgf.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwZ216eWd4bXNpc2NybXBza2dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MjIzNzUsImV4cCI6MjA3MTA5ODM3NX0.WBOy5nzfL-n-8ZitgaTkxGgJfitjRt3nCnMndY36qQg
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_51Rsp2KC46MRhe1fByhH11Tx2PTvUNgnKSY7Al0R87XArm9C0zulZICONmaefbST0OiAanxmwL1GPlTVncpsiRFSj00L5Ysc42a
VITE_OPENAI_API_KEY=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
```

### 3. Deploy Automático

O Vercel detectará automaticamente as configurações do `vercel.json` e fará o deploy.

## 📊 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes shadcn/ui
│   ├── AlicePresence.tsx
│   ├── Dashboard.tsx
│   ├── PaymentArea.tsx
│   └── ...
├── hooks/              # Custom hooks
│   ├── useSupabaseAuth.ts
│   ├── useSubscription.ts
│   └── ...
├── lib/                # Utilitários e configurações
│   ├── alice-ai.ts
│   ├── utils.ts
│   └── ...
├── pages/              # Páginas da aplicação
├── integrations/       # Integrações externas
│   └── supabase/       # Configuração Supabase
└── assets/             # Assets estáticos

supabase/
├── functions/          # Edge Functions
│   ├── create-checkout/
│   ├── check-subscription/
│   └── ...
├── migrations/         # Migrações do banco
└── config.toml         # Configuração local
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run preview` - Preview da build
- `npm run lint` - Verificação de código
- `npm run type-check` - Verificação de tipos TypeScript

## 🎯 Funcionalidades Principais

### 🤖 Alice - IA Conversacional
- Assistente de saúde personalizada
- Processamento de linguagem natural
- Respostas contextualizadas
- Integração com OpenAI GPT-4

### 💳 Sistema de Pagamentos
- Checkout seguro com Stripe
- Portal do cliente
- Verificação de assinaturas
- Processamento de pagamentos

### 📊 Dashboard Administrativo
- Gestão de usuários
- Monitoramento de métricas
- Relatórios de uso
- Configurações avançadas

### 🔐 Autenticação e Segurança
- Supabase Auth
- Row Level Security (RLS)
- Tokens JWT seguros
- Controle de acesso por roles

## 🐛 Troubleshooting

### Erro de Build
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Verificar TypeScript
npm run type-check
```

### Erro Supabase
- Verificar environment variables
- Confirmar RLS policies
- Verificar edge functions deployadas

### Erro Vercel
- Verificar build logs
- Confirmar environment variables
- Verificar output directory

## 📈 Próximos Passos

- [ ] Implementar analytics avançado
- [ ] Adicionar testes automatizados
- [ ] Otimizar performance
- [ ] Implementar PWA
- [ ] Adicionar mais idiomas

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@alicewellbeing.com
- Discord: [Alice Wellbeing Community](https://discord.gg/alicewellbeing)

---

**Alice Wellbeing Guide** - Transformando a saúde através da tecnologia 🤖💚
