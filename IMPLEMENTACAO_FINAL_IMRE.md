# 🎯 **IMPLEMENTAÇÃO FINAL - SISTEMA IMRE NÔA ESPERANZA**

## 📋 **REQUISITOS CONFIRMADOS:**

### **1. 28 BLOCOS IMRE (Sequência Exata):**
```sql
1.  abertura - "Olá! Eu sou Nôa Esperanza..."
2.  motivo_detalhado - "O que trouxe você à nossa avaliação hoje?"
3.  motivo_detalhado_extra - "O que mais?" (loop)
4.  queixa_principal - "Qual dessas questões mais o(a) incomoda?"
5.  localizacao - "Onde você sente [queixa]?"
6.  tempo_evolucao - "Quando essa [queixa] começou?"
7.  caracteristicas - "Como é a [queixa]?"
8.  sintomas_associados - "O que mais você sente..." (loop)
9.  fatores_melhora - "O que parece melhorar a [queixa]?"
10. fatores_piora - "O que parece piorar a [queixa]?"
11. historia_medica - "Quais as questões de saúde que você já viveu?" (loop)
12. historia_medica_extra - "O que mais?" (loop)
13. familia_mae - "Quais as questões de saúde da parte de sua mãe?" (loop)
14. familia_mae_extra - "O que mais?" (loop)
15. familia_pai - "E por parte de seu pai?" (loop)
16. familia_pai_extra - "O que mais?" (loop)
17. habitos - "Que outros hábitos você acha importante mencionar?" (loop)
18. habitos_extra - "O que mais?" (loop)
19. alergias - "Você tem alguma alergia..."
20. medicacao_regular - "Quais as medicações que você utiliza regularmente?"
21. medicacao_esporadica - "E as que você usa de vez em quando? Por quê?"
22. fechamento_revisao - "Vamos revisar a sua história..."
23. feedback_usuario - "O que posso melhorar no meu entendimento?"
24. validacao_final - "Você concorda com o meu entendimento?"
25. adicionar_info_final - "Há mais algo que gostaria de adicionar?"
26. hipoteses_sindromicas - "Com base em tudo que conversamos..."
27. recomendacao_final - "Recomendo a marcação de uma consulta..."
28. encerramento - "Obrigado por compartilhar sua história..."
```

### **2. CARD DE ACESSO RÁPIDO:**
- **Posição**: Ao lado da Nôa (como outros cards)
- **Ativação**:
  - Clique no card
  - Falar: "arte da entrevista clínica"
  - Falar: "entrevista clínica"
  - Falar: "iniciar avaliação"
- **Comportamento**: Abre card lateral expansível
- **Dentro do card**: Questionário IMRE
- **Integração**: Nôa entende respostas via chat

### **3. FLUXO INTELIGENTE:**
- **Reorientação**: Se usuário perde foco, Nôa reorienta harmonicamente
- **Consentimento**: Ao final dos 28 blocos
- **Geração**: Relatório + Score NFT
- **Dashboard**: Dados enviados para dashboard do paciente
- **Compartilhamento**: Paciente pode compartilhar com médico

### **4. SISTEMA DE LOOPS:**
- Perguntas tipo "O que mais?" continuam até resposta negativa
- Detecção inteligente: "nada mais", "não", "nenhum outro"
- Transição suave entre blocos

---

## 🚀 **ARQUIVOS A CRIAR/MODIFICAR:**

### **1. Componente Card IMRE:**
```typescript
// src/components/ImreCard.tsx
// Card de acesso rápido à Entrevista Clínica
```

### **2. Service IMRE:**
```typescript
// src/services/imreService.ts
// Lógica dos 28 blocos + loops + validações
```

### **3. Atualizar Home.tsx:**
- Adicionar card IMRE
- Integrar com chat
- Sistema de reorientação
- Consentimento final

### **4. Atualizar SQL:**
- Garantir 28 blocos corretos
- Função de validação de loops
- Geração de relatório + score

---

## 📊 **FLUXO COMPLETO:**

```
1. Usuário acessa → Vê card "Arte da Entrevista Clínica"
2. Clica no card OU fala "iniciar avaliação"
3. Card lateral abre com questionário
4. Nôa inicia: "Olá! Eu sou Nôa Esperanza..."
5. Questionário de 28 blocos (com loops)
6. Se perde foco → Nôa reorienta: "Vamos continuar? Estávamos em..."
7. Ao final → Consentimento
8. Com consentimento → Gera relatório + NFT
9. Dashboard atualizado
10. Opção de compartilhar com médico
```

---

## 🎯 **PRÓXIMOS PASSOS:**

1. ✅ **Atualizar SQL** com 28 blocos corretos
2. ✅ **Criar ImreCard.tsx** (card de acesso rápido)
3. ✅ **Criar imreService.ts** (lógica dos blocos)
4. ✅ **Atualizar Home.tsx** (integração)
5. ✅ **Sistema de loops** ("O que mais?")
6. ✅ **Reorientação inteligente**
7. ✅ **Consentimento + NFT**
8. ✅ **Dashboard + Score**

---

**Vou implementar agora! 🚀**
