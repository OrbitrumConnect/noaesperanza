# 🏥 NOA Esperanza - Assistente Médica Inteligente

Plataforma médica inteligente com IA especializada em neurologia, cannabis medicinal e nefrologia.

## 🚀 Deploy

- **Web:** [noaesperanza.vercel.app](https://noaesperanza.vercel.app)
- **GitHub:** [OrbitrumConnect/noaesperanza](https://github.com/OrbitrumConnect/noaesperanza.git)

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `env.example` para `.env` e configure:

```bash
cp env.example .env
```

Preencha as variáveis no arquivo `.env`:

```env
# OpenAI Configuration
VITE_OPENAI_API_KEY=your_openai_api_key_here

# ElevenLabs Configuration  
VITE_ELEVEN_API_KEY=your_elevenlabs_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here

# Mercado Pago Configuration
VITE_MERCADO_PAGO_KEY=your_mercado_pago_access_token_here
```

### 2. Banco de Dados

Execute os scripts SQL no Supabase:

1. `supabase_setup.sql` - Configuração básica
2. `ai_learning_setup.sql` - Sistema de aprendizado da IA
3. `fix_ai_learning_rls.sql` - Correções de segurança

### 3. Instalação

```bash
npm install
npm run dev
```

## 🏗️ Arquitetura

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + CSS Custom
- **Backend:** Supabase (PostgreSQL + Auth)
- **IA:** OpenAI GPT-4 + ElevenLabs
- **Pagamentos:** Mercado Pago

## 🔧 Funcionalidades

- ✅ Chat inteligente com NOA
- ✅ Avaliação clínica triaxial
- ✅ Reconhecimento de voz
- ✅ Síntese de voz
- ✅ Sistema de aprendizado da IA
- ✅ Dashboards especializados
- ✅ Integração de pagamentos
- ✅ Validação de entrada
- ✅ Error boundaries
- ✅ Hooks customizados

## 🛡️ Segurança

- ✅ Variáveis de ambiente configuradas
- ✅ Validação de entrada implementada
- ✅ Sanitização de dados
- ✅ Error boundaries ativos
- ✅ RLS (Row Level Security) no Supabase

## 📱 Responsividade

O projeto mantém a mesma aparência visual em:
- ✅ Desktop
- ✅ Mobile
- ✅ Tablet
- ✅ Qualquer instância

## 🚨 Importante

- **NÃO** altere a estrutura visual atual
- **NÃO** quebre o layout existente
- **SEMPRE** teste antes de fazer mudanças
- **MANTENHA** a compatibilidade com Vercel

## 📞 Suporte

Para dúvidas ou problemas, verifique:
1. Variáveis de ambiente configuradas
2. Scripts SQL executados
3. APIs funcionando
4. Console do navegador para erros
