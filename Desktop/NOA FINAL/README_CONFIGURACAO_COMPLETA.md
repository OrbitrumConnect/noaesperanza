# 🚀 **CONFIGURAÇÃO COMPLETA - NÔA ESPERANZA V2.0**

## 📋 **ÍNDICE**

1. [Status Atual](#status-atual)
2. [Configuração Rápida](#configuração-rápida)
3. [Resolver Erros de API](#resolver-erros-de-api)
4. [Configurar Supabase](#configurar-supabase)
5. [Testar Sistema](#testar-sistema)
6. [Modo Offline](#modo-offline)

---

## ✅ **STATUS ATUAL**

### **O que está funcionando SEM configuração:**

- ✅ Layout ChatGPT completo
- ✅ Sidebar com GPTs personalizados
- ✅ Reconhecimento de perfis (local)
- ✅ Chat interface funcional
- ✅ Prompt Mestre carregado
- ✅ Fallback para modo offline

### **O que precisa de configuração:**

- ⚠️ OpenAI API (para GPT-4o real)
- ⚠️ Supabase (para persistência)
- ⚠️ RLS Policies (para segurança)

---

## ⚡ **CONFIGURAÇÃO RÁPIDA (5 MINUTOS)**

### **Passo 1: Criar arquivo .env**

Na raiz do projeto (`noaesperanza-appB/`), crie `.env`:

```bash
# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-proj-[SUA_CHAVE_AQUI]

# Supabase Configuration  
VITE_SUPABASE_URL=https://lhclqebtkyfftkevumix.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[SUA_CHAVE_AQUI]

# App Configuration
VITE_APP_ENVIRONMENT=development
VITE_APP_VERSION=3.0.0
```

### **Passo 2: Obter Chaves**

**OpenAI:**
1. Acesse: https://platform.openai.com/api-keys
2. Crie nova chave
3. Copie para `.env`

**Supabase:**
1. Acesse: https://supabase.com/dashboard/project/lhclqebtkyfftkevumix
2. Settings → API
3. Copie `Project URL` e `anon public key`

### **Passo 3: Configurar Tabelas Supabase**

1. Acesse: https://supabase.com/dashboard
2. SQL Editor
3. Cole o conteúdo de: `verificar_e_criar_tabelas_basicas.sql`
4. Execute

### **Passo 4: Reiniciar**

```bash
# Pare o servidor (Ctrl+C)
npm run dev
```

### **Passo 5: Testar**

```
1. Acesse: http://localhost:5173/chat
2. Digite: "Olá, Nôa. Ricardo Valença, aqui"
3. Veja: Reconhecimento com GPT-4o real
```

---

## 🔧 **RESOLVER ERROS DE API**

### **Erro 1: OpenAI 401**

```
Failed to load resource: the server responded with a status of 401 ()
```

**Solução:**
1. Verificar `.env` tem `VITE_OPENAI_API_KEY`
2. Chave começa com `sk-proj-` ou `sk-`
3. Reiniciar servidor

**Verificar no console:**
```javascript
console.log(import.meta.env.VITE_OPENAI_API_KEY ? 'OK' : 'FALTANDO')
```

### **Erro 2: Supabase 406**

```
Failed to load resource: the server responded with a status of 406 ()
```

**Causa:** Tabela não existe ou RLS bloqueando

**Solução:**
1. Executar `verificar_e_criar_tabelas_basicas.sql`
2. Verificar políticas RLS estão permissivas
3. Conferir tabelas: `noa_users`, `user_profiles`

### **Erro 3: Timeout Profile**

```
⚠️ Perfil não encontrado, usando modo local: Error: Timeout profile
```

**Causa:** Timeout ao buscar perfil no Supabase

**Solução:** Sistema já tem fallback ✅  
**Impacto:** Usa perfil local, sem problemas

---

## 🗄️ **CONFIGURAR SUPABASE**

### **Estrutura de Tabelas Necessárias:**

1. **noa_users** - Perfis de usuários
2. **user_profiles** - Fallback legado
3. **knowledge_base** - Base de conhecimento
4. **conversation_history** - Histórico de conversas

### **Executar SQL:**

```sql
-- Cole todo o conteúdo de:
verificar_e_criar_tabelas_basicas.sql

-- Ou acesse:
-- Supabase Dashboard → SQL Editor → Novo Query
```

### **Verificar Criação:**

```sql
-- Ver tabelas
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Ver usuários admin
SELECT name, email, user_type 
FROM public.noa_users 
WHERE user_type = 'admin';
```

### **Políticas RLS:**

As políticas criadas são **PERMISSIVAS** para desenvolvimento:

```sql
-- ⚠️ DESENVOLVIMENTO (atual)
CREATE POLICY "noa_users_select_policy" ON public.noa_users
    FOR SELECT USING (true);

-- ✅ PRODUÇÃO (ajustar depois)
CREATE POLICY "noa_users_select_secure" ON public.noa_users
    FOR SELECT USING (auth.uid() = user_id);
```

---

## 🧪 **TESTAR SISTEMA**

### **Teste 1: Interface**

```
1. Acesse: /chat
2. Veja: Sidebar preta + Chat central
3. Status: ✅ Deve funcionar
```

### **Teste 2: Reconhecimento**

```
1. Digite: "Olá, Nôa. Ricardo Valença, aqui"
2. Veja: Saudação personalizada
3. Status: ✅ Funciona local/remoto
```

### **Teste 3: Chat GPT-4o**

```
1. Digite: "Explique o que é semiose infinita"
2. Veja: Resposta detalhada
3. Status: ⚠️ Precisa OpenAI API Key
```

### **Teste 4: Persistência**

```
1. Fazer login
2. Enviar mensagens
3. Recarregar página
4. Status: ⚠️ Precisa Supabase configurado
```

### **Teste 5: Console Logs**

Abra DevTools (F12) e veja:

```
═══════════════════════════════════════════════════════════
🧠 NÔA ESPERANZA - PROMPT MESTRE CARREGADO
═══════════════════════════════════════════════════════════
📚 Base: Documento Mestre de Transferência Simbólica
👨‍⚕️ Criador: Dr. Ricardo Valença
🎯 Modo: Arte da Entrevista Clínica
✅ Status: Operacional
═══════════════════════════════════════════════════════════
```

---

## 💾 **MODO OFFLINE**

O sistema funciona **COMPLETAMENTE** sem APIs configuradas:

### **Funcionalidades Offline:**

1. ✅ Chat interface
2. ✅ Reconhecimento de perfis
3. ✅ Respostas baseadas em prompt mestre
4. ✅ Dados salvos em localStorage
5. ✅ Sidebar com GPTs

### **Limitações Offline:**

1. ❌ Sem GPT-4o (respostas locais)
2. ❌ Sem sincronização entre dispositivos
3. ❌ Dados apenas no navegador

### **Comandos Úteis (Console):**

```javascript
// Ver dados locais
noaLocalStorage.ver()

// Ver estatísticas
noaLocalStorage.stats()

// Ver perfil ativo
localStorage.getItem('noa_active_profile')

// Baixar dados
noaLocalStorage.baixar()
```

---

## 📊 **ARQUIVOS IMPORTANTES**

### **Configuração:**
- `verificar_e_criar_tabelas_basicas.sql` - Criar tabelas
- `env.example` - Template de configuração
- `DIAGNOSTICO_E_SOLUCAO_ERROS.md` - Debug

### **Documentação:**
- `INSTRUCOES_TECNICAS_PROMPT_MESTRE.md` - Prompt técnico
- `MUDANCA_HOME_PARA_CHAT.md` - Mudanças no layout
- `SOLUCAO_CACHE_RECONHECIMENTO.md` - Cache e reconhecimento

### **Prompt:**
- `prompts/noa_esperanza_gpt5_prompt.txt` - Prompt mestre completo

### **Código:**
- `src/services/noaPromptLoader.ts` - Carregador de prompt
- `src/pages/HomeNew.tsx` - Interface ChatGPT
- `src/services/personalizedProfilesService.ts` - Perfis

---

## ✅ **CHECKLIST COMPLETO**

### **Setup Inicial:**
- [ ] Clonar repositório
- [ ] `npm install`
- [ ] Criar `.env`
- [ ] Adicionar chaves
- [ ] `npm run dev`

### **Configuração APIs:**
- [ ] OpenAI API Key
- [ ] Supabase URL
- [ ] Supabase Anon Key
- [ ] Executar SQL de tabelas
- [ ] Verificar políticas RLS

### **Testes:**
- [ ] Acessar `/chat`
- [ ] Testar reconhecimento
- [ ] Testar chat GPT-4o
- [ ] Verificar console logs
- [ ] Testar persistência

### **Produção:**
- [ ] Ajustar RLS policies
- [ ] Configurar variáveis no Vercel
- [ ] Deploy
- [ ] Testar em produção

---

## 🎯 **PRÓXIMOS PASSOS**

### **Imediato:**
1. Configurar `.env` local
2. Executar SQL no Supabase
3. Testar com APIs reais

### **Curto Prazo:**
4. Ajustar políticas RLS para produção
5. Adicionar testes automatizados
6. Documentar fluxos completos

### **Longo Prazo:**
7. Integrar blockchain para rastreabilidade
8. Adicionar mais perfis personalizados
9. Expandir base de conhecimento

---

## 📞 **SUPORTE**

### **Problemas Comuns:**

**"Chat não responde"**
→ Verificar OpenAI API Key no `.env`

**"Erro 406 Supabase"**
→ Executar `verificar_e_criar_tabelas_basicas.sql`

**"Usuário Local em vez do nome"**
→ Limpar cache do navegador (Ctrl+Shift+Delete)

**"Deploy não atualiza"**
→ Verificar último commit no Vercel Dashboard

### **Documentos de Referência:**
- `DIAGNOSTICO_E_SOLUCAO_ERROS.md`
- `INSTRUCOES_TECNICAS_PROMPT_MESTRE.md`

---

## 🎊 **CONCLUSÃO**

O sistema Nôa Esperanza V2.0 está:

✅ **FUNCIONAL** - Opera sem APIs configuradas  
✅ **RESILIENTE** - Fallbacks automáticos  
✅ **COMPLETO** - Prompt mestre implementado  
✅ **PROFISSIONAL** - Layout ChatGPT  
✅ **DOCUMENTADO** - Guias completos  

**Para melhor experiência: Configure as APIs seguindo este guia!** 🚀
