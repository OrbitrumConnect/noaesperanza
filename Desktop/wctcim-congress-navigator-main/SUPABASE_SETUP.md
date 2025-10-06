# 🚀 Configuração do Supabase - WCTCIM Congress Navigator

## 📋 Visão Geral

O Supabase foi integrado para melhorar a performance e gerenciar os dados dos trabalhos científicos de forma mais eficiente.

## 🔧 Configuração Manual (Obrigatória)

### 1. **Execute o SQL Schema no Supabase**
- Acesse: [SQL Editor do Supabase](https://supabase.com/dashboard/project/shngrwkqgasdpokdomhh/sql)
- Copie todo o conteúdo do arquivo `supabase-schema-simple.sql`
- Cole no editor SQL e execute
- Isso criará as tabelas e inserirá os dados iniciais

### 2. **Acesso ao Painel Administrativo**
- Clique no botão **Menu** (☰) no header
- Arraste o botão para posicionar onde preferir
- O painel administrativo aparecerá

### 3. **Verificação da Configuração**
- No painel administrativo, você verá a seção **"Configuração do Sistema"**
- Clique em **"Configurar Supabase"** para verificar se tudo está funcionando
- O sistema irá:
  - ✅ Verificar se as tabelas existem
  - ✅ Confirmar se os dados estão carregados
  - ✅ Testar a conexão com o banco

## 📊 Estrutura do Banco

### **Tabela: `scientific_works`**
```sql
- id: TEXT (Primary Key)
- title: TEXT
- authors: JSONB (Array de autores)
- category: TEXT (científico, relato_experiencia, relato_caso)
- modality: TEXT (oral, pôster, vídeo)
- presentation_type: TEXT
- abstract: TEXT
- keywords: TEXT[] (Array de palavras-chave)
- schedule: JSONB (dia, horário, sala, duração)
- location: JSONB (tipo, nome, coordenadas)
- media: JSONB (PDF, vídeo, podcast)
- status: TEXT
- institution: TEXT
- region: TEXT
- language: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### **Tabela: `analytics`**
```sql
- id: SERIAL (Primary Key)
- metric: TEXT (visitors, stand_visits, work_views)
- value: INTEGER
- metadata: JSONB (dados adicionais)
- date: DATE
- created_at: TIMESTAMP
```

## 🚀 Benefícios da Integração

### **Performance**
- ⚡ **Busca mais rápida** com índices otimizados
- 🔍 **Filtros em tempo real** sem lag
- 📱 **Melhor responsividade** em dispositivos móveis

### **Funcionalidades**
- 🔄 **Dados em tempo real** via Supabase subscriptions
- 📊 **Analytics automático** de visitantes e interações
- 🎯 **Busca inteligente** por texto, categoria, modalidade
- 📈 **Escalabilidade** para milhares de trabalhos

### **Desenvolvimento**
- 🛠️ **API automática** gerada pelo Supabase
- 🔐 **Autenticação integrada** (futuro)
- 📝 **Backup automático** dos dados
- 🔧 **Interface administrativa** para gerenciar conteúdo

## 📱 Como Usar

### **Para Usuários Finais:**
1. **Buscar Trabalhos**: Use a barra de busca no painel científico
2. **Filtrar**: Por categoria, modalidade, dia ou palavra-chave
3. **Visualizar**: Clique em qualquer trabalho para ver detalhes
4. **Favoritar**: Salve trabalhos de interesse
5. **Chatbot**: Faça perguntas em linguagem natural

### **Para Administradores:**
1. **Configurar**: Use o painel administrativo para setup inicial
2. **Monitorar**: Acompanhe analytics de uso
3. **Gerenciar**: Adicione/edite trabalhos via interface
4. **Relatórios**: Gere relatórios de engajamento

## 🔧 Configuração Manual (Opcional)

Se preferir configurar manualmente:

```bash
# 1. Instalar dependências
npm install @supabase/supabase-js

# 2. Configurar variáveis de ambiente
# Criar arquivo .env.local:
VITE_SUPABASE_URL=https://omvsjvvkfwlemfjwabhk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 3. Executar script de população
npm run populate-supabase
```

## 🎯 Próximos Passos

### **Fase 1: Dados Reais**
- [ ] Importar planilha completa do Congresso
- [ ] Mapear campos da planilha para estrutura do banco
- [ ] Validar e limpar dados

### **Fase 2: Funcionalidades Avançadas**
- [ ] Sistema de autenticação
- [ ] Upload de PDFs e vídeos
- [ ] Geração automática de podcasts
- [ ] Notificações em tempo real

### **Fase 3: Analytics Avançado**
- [ ] Dashboard de métricas
- [ ] Relatórios de engajamento
- [ ] Heatmap de interações
- [ ] Exportação de dados

## 🆘 Suporte

### **Problemas Comuns:**

**❌ Erro de conexão:**
- Verifique se as credenciais do Supabase estão corretas
- Confirme se o projeto está ativo no Supabase

**❌ Dados não aparecem:**
- Execute o script de configuração novamente
- Verifique se as tabelas foram criadas

**❌ Performance lenta:**
- Aguarde a criação dos índices
- Verifique a conexão com a internet

### **Contato:**
- 📧 Email: suporte@congresso.com
- 💬 Chat: Painel administrativo
- 📱 WhatsApp: +55 11 99999-9999

---

**🎉 Parabéns! Seu Congress Navigator agora está rodando com Supabase!**

*Performance otimizada, dados seguros e funcionalidades avançadas prontas para o Congresso WCTCIM 2025.*
