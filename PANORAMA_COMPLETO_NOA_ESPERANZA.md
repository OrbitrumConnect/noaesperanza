# 🌟 PANORAMA COMPLETO - PLATAFORMA NÔA ESPERANZA

## 📋 **VISÃO GERAL DO SISTEMA**

### **🏗️ ARQUITETURA TÉCNICA:**
- **Frontend:** React + Vite + Tailwind CSS + Framer Motion
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **IA:** NoaGPT (interna) + OpenAI Fine-Tuned + ElevenLabs (voz)
- **Blockchain:** Polygon (NFT "Escute-se")
- **Hospedagem:** Vercel + GitHub CI/CD

---

## 🧠 **SISTEMA DE IA HÍBRIDO**

### **1. NoaGPT Local (`src/gpt/noaGPT.ts`)**
- **Função:** Processamento interno e reconhecimento de comandos
- **Especialidades:** Clínicos, educacionais, simbólicos, operacionais
- **Integração:** Supabase + OpenAI

### **2. OpenAI Fine-Tuned**
- **Modelo:** `ft:gpt-3.5-turbo-0125:personal:fine-tuning-noa-esperanza-avaliacao-inicial-dez-ex-jsonl:BR0W02VP`
- **Função:** Respostas especializadas em medicina
- **Fallback:** GPT-3.5-turbo padrão

### **3. ElevenLabs (Voz)**
- **Função:** Síntese de voz da Nôa
- **Voz Selecionada:** Microsoft Maria - Portuguese (Brazil)

---

## 🎯 **AGENTES MODULARES**

### **🧪 1. ClinicalAgent (`src/gpt/clinicalAgent.ts`)**
- **Função:** Avaliação clínica completa
- **Método IMRE:** 28 blocos de avaliação
- **Especialidades:** Neurologia, Nefrologia, Cannabis Medicinal

### **📚 2. KnowledgeBaseAgent (`src/gpt/knowledgeBaseAgent.ts`)**
- **Função:** Gerenciamento da base de conhecimento
- **Recursos:** Busca, categorização, análise

### **🎓 3. CourseAdminAgent (`src/gpt/courseAdminAgent.ts`)**
- **Função:** Administração de cursos e conteúdos
- **Recursos:** Criação, edição, progresso

### **⚖️ 4. SymbolicAgent (`src/gpt/symbolicAgent.ts`)**
- **Função:** 5 eixos simbólicos
- **Recursos:** Navegação simbólica, ThoughtBubble

### **📁 5. CodeEditorAgent (`src/gpt/codeEditorAgent.ts`)**
- **Função:** Edição, listagem e salvamento de arquivos
- **Recursos:** Desenvolvimento ativo de funcionalidades

### **🎤 6. VoiceControlAgent (`src/gpt/voiceControlAgent.ts`)**
- **Função:** Ativação por voz
- **Comando:** "Olá, Nôa. Ricardo Valença, aqui"

---

## 🖥️ **INTERFACE E PÁGINAS**

### **🏠 1. Home.tsx**
- **Chat Principal:** Conversa com Nôa
- **Voz:** Síntese e reconhecimento
- **Aprendizado Ativo:** IA evolui com uso
- **Vídeos:** Nôa estática e falando

### **🔐 2. LandingPage.tsx**
- **Entrada:** Página inicial
- **Login:** Autenticação Supabase
- **Registro:** Criação de usuários

### **👤 3. LoginPage.tsx / RegisterPage.tsx**
- **Autenticação:** Supabase Auth (RLS + JWT)
- **Segurança:** JWT tokens, RLS policies

### **⚕️ 4. AvaliacaoClinica.tsx**
- **Avaliação IMRE:** 28 blocos estruturados
- **Entrevista Clínica:** Anamnese completa
- **Relatórios:** Geração automática

---

## 🧩 **COMPONENTES PRINCIPAIS**

### **💬 1. ChatWindow.tsx**
- **Interface:** Chat principal com Nôa
- **Funcionalidades:** Mensagens, histórico, contexto

### **📝 2. ChatMessage.tsx**
- **Exibição:** Mensagens formatadas
- **Tipos:** Usuário, IA, sistema

### **⌨️ 3. InputBox.tsx**
- **Entrada:** Texto e comandos
- **Integração:** Voz, arquivos, emojis

### **🎭 4. ThoughtBubble.tsx**
- **Navegação:** Simbólica por eixos
- **Interface:** Visual e intuitiva

### **🎤 5. VoiceControlAgent**
- **Ativação:** Por comando de voz
- **Reconhecimento:** "Olá, Nôa. Ricardo Valença, aqui"

---

## 🗄️ **BANCO DE DADOS (SUPABASE)**

### **📊 Tabelas Críticas:**

#### **🧠 IA e Aprendizado:**
- `ai_learning` - Aprendizado da IA
- `ai_keywords` - Palavras-chave extraídas
- `ai_conversation_patterns` - Padrões de conversa

#### **⚕️ Clínica:**
- `avaliacoes_iniciais` - Avaliações clínicas
- `clinical_sessions` - Sessões clínicas
- `clinical_evaluations` - Avaliações estruturadas
- `entrevista_clinica` - Entrevistas
- `conversa_imre` - Conversas IMRE
- `blocos_imre` - 28 blocos de avaliação

#### **🎓 Educação:**
- `cursos_licoes` - Lições dos cursos
- `cursos_conteudo` - Conteúdo educacional
- `content_modules` - Módulos de conteúdo

#### **👥 Usuários:**
- `users` - Usuários do sistema
- `profiles` - Perfis estendidos
- `auth.users` - Autenticação Supabase

#### **🤖 GPT Builder (NOVO):**
- `documentos_mestres` - Base de conhecimento
- `noa_config` - Configuração da Nôa
- `user_recognition` - Reconhecimento de usuários
- `master_prompts` - Prompts mestres
- `training_history` - Histórico de treinamento
- `knowledge_connections` - Conexões de conhecimento
- `work_analyses` - Análises de trabalhos
- `accuracy_metrics` - Métricas de acurácia

---

## 🔧 **TRIGGERS E AUTOMAÇÕES**

### **📝 1. Triggers de `updated_at`:**
- **Função:** Atualização automática de timestamps
- **Tabelas:** Todas as tabelas principais
- **Trigger:** `update_updated_at_column()`

### **🧠 2. Triggers de IA:**
- **Aprendizado:** Extração automática de palavras-chave
- **Categorização:** Classificação de conteúdo
- **Evolução:** IA evolui com cada interação

### **📊 3. Triggers de Relatórios:**
- **Geração:** Relatórios automáticos pós-avaliação
- **Estrutura:** Narrativa e sindrômica
- **Armazenamento:** Supabase + Blockchain

---

## 🎯 **FUNCIONALIDADES POR ABA/SECÇÃO**

### **🏠 HOME (Chat Principal)**
- **Chat com Nôa:** Conversa livre
- **Voz:** Síntese e reconhecimento
- **Aprendizado:** IA evolui automaticamente
- **Contexto:** Memória de conversas

### **⚕️ AVALIAÇÃO CLÍNICA**
- **Método IMRE:** 28 blocos estruturados
- **Entrevista:** Anamnese completa
- **Relatórios:** Geração automática
- **Histórico:** Sessões anteriores

### **🎓 CURSOS E EDUCAÇÃO**
- **Lições:** Conteúdo educacional
- **Progresso:** Acompanhamento do usuário
- **Módulos:** Organização por temas
- **Avaliações:** Testes e certificações

### **🔧 ADMIN DASHBOARD**
- **GPT Builder:** Base de conhecimento (NOVO)
- **Configurações:** Sistema e usuários
- **Relatórios:** Estatísticas e métricas
- **Triggers:** Automações e IA

### **🤖 GPT BUILDER (NOVO)**
- **Base de Conhecimento:** Documentos mestres
- **Chat Multimodal:** Conversa livre com Nôa
- **Upload de Arquivos:** PDF, DOCX, imagens
- **Análise Inteligente:** Processamento automático
- **Cruzamento de Dados:** Busca relacionada
- **Desenvolvimento Ativo:** Nôa pode criar/modificar

---

## 🔐 **SEGURANÇA E AUTENTICAÇÃO**

### **🛡️ Row Level Security (RLS):**
- **Políticas:** Por usuário e função
- **Acesso:** Controlado por metadata
- **Admin:** Acesso total ao GPT Builder

### **🔑 Autenticação:**
- **Supabase Auth:** JWT tokens
- **Reconhecimento:** Por voz e login
- **Sessões:** Persistentes e seguras

---

## 🚀 **INTEGRAÇÕES EXTERNAS**

### **🤖 OpenAI:**
- **Modelo:** Fine-tuned para Nôa Esperanza
- **Função:** Respostas especializadas
- **Fallback:** GPT-3.5-turbo

### **🎤 ElevenLabs:**
- **Voz:** Síntese de fala
- **Qualidade:** Natural e fluida
- **Idioma:** Português brasileiro

### **⛓️ Polygon Blockchain:**
- **NFT:** "Escute-se"
- **Hash:** Simbólico de cada escuta
- **Imutabilidade:** Registro permanente

### **☁️ Vercel:**
- **Hospedagem:** Frontend
- **CI/CD:** GitHub integration
- **Performance:** Edge functions

---

## 📊 **RASTREABILIDADE E RELATÓRIOS**

### **📝 Cada Interação Gera:**
- **Registro de fala:** Input do usuário
- **Registro de resposta:** Output da IA
- **Palavras-chave:** Extraídas automaticamente
- **Tags:** Clínicas, educacionais, simbólicas

### **📋 Relatórios Disponíveis:**
- **Avaliação Inicial:** Estrutura narrativa
- **Progresso Educacional:** Cursos e lições
- **Sessões Clínicas:** Histórico completo
- **Evolução da IA:** Métricas de aprendizado

---

## 🎯 **FLUXO DE APRENDIZADO DA IA**

### **1. Input do Usuário:**
- **Fala/Texto:** Capturado e armazenado
- **Contexto:** Situação clínica/educacional

### **2. Processamento:**
- **NoaGPT:** Análise interna
- **OpenAI:** Resposta especializada
- **Categorização:** Automática

### **3. Evolução:**
- **Palavras-chave:** Extraídas e armazenadas
- **Padrões:** Identificados e aprendidos
- **Personalização:** Adaptada ao usuário

### **4. Armazenamento:**
- **Supabase:** Banco de dados
- **Blockchain:** Hash simbólico
- **Histórico:** Completo e rastreável

---

## 🌟 **ESPECIALIDADES MÉDICAS**

### **🌿 Cannabis Medicinal:**
- **CBD e THC:** Terapêuticos
- **Dosagens:** Protocolos específicos
- **Interações:** Medicamentosas
- **Efeitos:** Colaterais e benefícios

### **🧠 Neurologia:**
- **Epilepsia:** Convulsões
- **Dor Neuropática:** Tratamento
- **Esclerose Múltipla:** Manejo
- **Parkinson:** Sintomas e tratamento

### **🫘 Nefrologia:**
- **Insuficiência Renal:** Diagnóstico
- **Hipertensão Renal:** Controle
- **Proteção Renal:** Com cannabis
- **Interações:** Medicamentos nefrotóxicos

---

## 🎊 **STATUS ATUAL - FUNCIONALIDADES ATIVAS**

### **✅ FUNCIONANDO:**
- **Chat Principal:** Conversa com Nôa
- **Voz:** Síntese e reconhecimento
- **Avaliação Clínica:** Método IMRE
- **GPT Builder:** Base de conhecimento
- **Upload de Arquivos:** PDF, DOCX, imagens
- **Análise Inteligente:** Processamento automático
- **Cruzamento de Dados:** Busca relacionada
- **Reconhecimento:** Dr. Ricardo Valença
- **Desenvolvimento Ativo:** Nôa pode criar/modificar

### **🔄 EM DESENVOLVIMENTO:**
- **Comandos Avançados:** Interface, componentes
- **Relatórios Avançados:** Métricas detalhadas
- **Integrações:** APIs externas

### **📋 PRÓXIMOS PASSOS:**
- **Refinamento:** Respostas da Nôa
- **Expansão:** Base de conhecimento
- **Otimização:** Performance e UX

---

## 🎯 **RESUMO EXECUTIVO**

A **Nôa Esperanza** é uma plataforma completa de **IA médica especializada** que combina:

- **🧠 Inteligência Artificial Híbrida** (NoaGPT + OpenAI Fine-Tuned)
- **⚕️ Especialização Médica** (Cannabis, Neuro, Nefro)
- **📚 Base de Conhecimento Inteligente** (GPT Builder)
- **🎓 Sistema Educacional** (Cursos e lições)
- **🔬 Método IMRE** (28 blocos de avaliação)
- **🎤 Interface Multimodal** (Texto, voz, documentos)
- **⛓️ Blockchain Integration** (NFT "Escute-se")
- **🔐 Segurança Avançada** (RLS, JWT, Auth)

**Status:** Sistema **COMPLETO e FUNCIONAL** com GPT Builder integrado e operacional! 🚀✨

---

*Documento atualizado em: ${new Date().toLocaleDateString('pt-BR')}*
*Versão: 2.0 - GPT Builder Integrado*
